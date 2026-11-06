package com.studentmanager.service;

import com.studentmanager.entity.Mark;
import com.studentmanager.entity.Student;
import com.studentmanager.exception.DuplicateResourceException;
import com.studentmanager.exception.ResourceNotFoundException;
import com.studentmanager.repository.MarkRepository;
import com.studentmanager.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class StudentService {

    private final StudentRepository studentRepository;
    private final MarkRepository markRepository;

    @Autowired
    public StudentService(StudentRepository studentRepository, MarkRepository markRepository) {
        this.studentRepository = studentRepository;
        this.markRepository = markRepository;
    }

    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    public Student getStudentById(Long id) {
        return studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", id));
    }

    public Student getStudentByStudentId(String studentId) {
        return studentRepository.findByStudentId(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "studentId", studentId));
    }

    public List<String> getAllClassNames() {
        return studentRepository.findDistinctClassNames();
    }

    /**
     * Retrieves a page of students with integrated search, class filtering,
     * academic performance tier filtering, and dynamic multi-column sorting.
     */
    public Page<Student> getFilteredAndSortedStudents(
            String search,
            String className,
            String performance,
            String sortBy,
            String sortDir,
            int page,
            int size) {

        // Validate page and size parameters
        int pageNumber = Math.max(0, page);
        int pageSize = Math.max(1, Math.min(100, size));

        // Fetch students with search & class filters applied via DB query
        List<Student> allMatches = studentRepository.findAllWithMarks();

        // 1. Search filter (name, studentId, or email)
        if (search != null && !search.trim().isEmpty()) {
            String q = search.trim().toLowerCase();
            allMatches = allMatches.stream()
                    .filter(s -> (s.getFullName() != null && s.getFullName().toLowerCase().contains(q)) ||
                                 (s.getStudentId() != null && s.getStudentId().toLowerCase().contains(q)) ||
                                 (s.getEmail() != null && s.getEmail().toLowerCase().contains(q)))
                    .collect(Collectors.toList());
        }

        // 2. Class filter
        if (className != null && !className.trim().isEmpty() && !className.equalsIgnoreCase("all")) {
            allMatches = allMatches.stream()
                    .filter(s -> s.getClassName() != null && s.getClassName().equalsIgnoreCase(className.trim()))
                    .collect(Collectors.toList());
        }

        // 3. Performance filter (Distinction >=75%, Average 40-74.99%, Low/Needs Help <40%)
        if (performance != null && !performance.trim().isEmpty() && !performance.equalsIgnoreCase("all")) {
            allMatches = allMatches.stream().filter(s -> {
                double avg = calculateAveragePercentage(s);
                return switch (performance.toLowerCase()) {
                    case "distinction", "high", "top" -> avg >= 75.0;
                    case "average", "medium" -> avg >= 40.0 && avg < 75.0;
                    case "low", "fail", "needs-help" -> avg < 40.0 && avg > 0.0;
                    default -> true;
                };
            }).collect(Collectors.toList());
        }

        // 4. Sorting
        boolean isAsc = sortDir == null || sortDir.equalsIgnoreCase("asc");
        if (sortBy != null) {
            Comparator<Student> comparator = switch (sortBy.toLowerCase()) {
                case "name", "fullname" -> Comparator.comparing(
                        s -> s.getFullName() == null ? "" : s.getFullName().toLowerCase());
                case "studentid" -> Comparator.comparing(
                        s -> s.getStudentId() == null ? "" : s.getStudentId().toLowerCase());
                case "email" -> Comparator.comparing(
                        s -> s.getEmail() == null ? "" : s.getEmail().toLowerCase());
                case "percentage", "marks" -> Comparator.comparingDouble(this::calculateAveragePercentage);
                default -> Comparator.comparing(Student::getId);
            };

            allMatches.sort(isAsc ? comparator : comparator.reversed());
        }

        // 5. In-memory pagination of filtered results
        int start = Math.min(pageNumber * pageSize, allMatches.size());
        int end = Math.min((pageNumber + 1) * pageSize, allMatches.size());
        List<Student> pageContent = allMatches.subList(start, end);

        Pageable pageable = PageRequest.of(pageNumber, pageSize);
        return new PageImpl<>(pageContent, pageable, allMatches.size());
    }

    public double calculateAveragePercentage(Student student) {
        List<Mark> marks = student.getMarks();
        if (marks == null || marks.isEmpty()) {
            return 0.0;
        }
        double totalObtained = 0.0;
        double totalMax = 0.0;
        for (Mark m : marks) {
            if (m.getMarks() != null && m.getTotalMarks() != null && m.getTotalMarks() > 0) {
                totalObtained += m.getMarks();
                totalMax += m.getTotalMarks();
            }
        }
        return totalMax > 0 ? (totalObtained / totalMax) * 100.0 : 0.0;
    }

    @Transactional
    public Student createStudent(Student student) {
        // Enforce uniqueness constraints
        if (studentRepository.existsByStudentId(student.getStudentId())) {
            throw new DuplicateResourceException(
                    "Student ID '" + student.getStudentId() + "' is already in use by another student");
        }
        if (studentRepository.existsByEmail(student.getEmail())) {
            throw new DuplicateResourceException(
                    "Email address '" + student.getEmail() + "' is already registered to another student");
        }
        return studentRepository.save(student);
    }

    @Transactional
    public Student updateStudent(Long id, Student updated) {
        Student existing = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", id));

        // Enforce uniqueness constraints on update
        if (updated.getStudentId() != null && !updated.getStudentId().equalsIgnoreCase(existing.getStudentId())) {
            if (studentRepository.existsByStudentIdAndIdNot(updated.getStudentId(), id)) {
                throw new DuplicateResourceException(
                        "Student ID '" + updated.getStudentId() + "' is already in use by another student");
            }
            existing.setStudentId(updated.getStudentId());
        }

        if (updated.getEmail() != null && !updated.getEmail().equalsIgnoreCase(existing.getEmail())) {
            if (studentRepository.existsByEmailAndIdNot(updated.getEmail(), id)) {
                throw new DuplicateResourceException(
                        "Email address '" + updated.getEmail() + "' is already registered to another student");
            }
            existing.setEmail(updated.getEmail());
        }

        if (updated.getFullName() != null) existing.setFullName(updated.getFullName());
        existing.setPhone(updated.getPhone());
        existing.setClassName(updated.getClassName());
        existing.setDateOfBirth(updated.getDateOfBirth());
        existing.setEnrollmentDate(updated.getEnrollmentDate());

        return studentRepository.save(existing);
    }

    @Transactional
    public void deleteStudent(Long id) {
        if (!studentRepository.existsById(id)) {
            throw new ResourceNotFoundException("Student", "id", id);
        }
        studentRepository.deleteById(id);
    }

}
