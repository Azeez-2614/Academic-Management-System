package com.studentmanager.service;

import com.studentmanager.entity.Mark;
import com.studentmanager.entity.Student;
import com.studentmanager.repository.MarkRepository;
import com.studentmanager.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
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

    public Optional<Student> getStudentById(Long id) {
        return studentRepository.findById(id);
    }

    public Optional<Student> getStudentByStudentId(String studentId) {
        return studentRepository.findByStudentId(studentId);
    }

    public List<Student> searchStudents(String query) {
        if (query == null || query.trim().isEmpty()) {
            return studentRepository.findAll();
        }
        String q = query.trim();
        // Check exact match on student ID first
        Optional<Student> exactStudent = studentRepository.findByStudentId(q);
        if (exactStudent.isPresent()) {
            return List.of(exactStudent.get());
        }
        // Otherwise search by full name
        return studentRepository.findByFullNameContainingIgnoreCase(q);
    }

    public List<Student> getStudentsByClass(String className) {
        return studentRepository.findByClassName(className);
    }

    public List<Student> getFilteredAndSortedStudents(String search, String className, String performance, String sortBy, String sortDir) {
        List<Student> list = studentRepository.findAll();

        // 1. Search filter (by name or studentId)
        if (search != null && !search.trim().isEmpty()) {
            String q = search.trim().toLowerCase();
            list = list.stream()
                    .filter(s -> (s.getFullName() != null && s.getFullName().toLowerCase().contains(q)) ||
                                 (s.getStudentId() != null && s.getStudentId().toLowerCase().contains(q)))
                    .collect(Collectors.toList());
        }

        // 2. Class filter
        if (className != null && !className.trim().isEmpty() && !className.equalsIgnoreCase("all")) {
            list = list.stream()
                    .filter(s -> s.getClassName() != null && s.getClassName().equalsIgnoreCase(className.trim()))
                    .collect(Collectors.toList());
        }

        // 3. Academic performance filter (e.g. "top" >= 75%, "average" 40-74%, "low" < 40%)
        if (performance != null && !performance.trim().isEmpty() && !performance.equalsIgnoreCase("all")) {
            list = list.stream().filter(s -> {
                double avg = calculateAveragePercentage(s);
                return switch (performance.toLowerCase()) {
                    case "distinction", "high", "top" -> avg >= 75.0;
                    case "average", "medium" -> avg >= 40.0 && avg < 75.0;
                    case "below-average", "low", "fail" -> avg < 40.0 && avg > 0.0;
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
                case "percentage", "marks" -> Comparator.comparingDouble(this::calculateAveragePercentage);
                default -> Comparator.comparing(Student::getId);
            };

            list.sort(isAsc ? comparator : comparator.reversed());
        }

        return list;
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
        if (student.getStudentId() == null || student.getStudentId().trim().isEmpty()) {
            throw new IllegalArgumentException("Student ID is required");
        }
        if (studentRepository.existsByStudentId(student.getStudentId())) {
            throw new IllegalArgumentException("Student with ID " + student.getStudentId() + " already exists");
        }
        return studentRepository.save(student);
    }

    @Transactional
    public Student updateStudent(Long id, Student updated) {
        Student existing = studentRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Student not found with id: " + id));

        // If studentId changed, ensure it's not duplicate
        if (updated.getStudentId() != null && !updated.getStudentId().equals(existing.getStudentId())) {
            if (studentRepository.existsByStudentId(updated.getStudentId())) {
                throw new IllegalArgumentException("Student ID " + updated.getStudentId() + " is already in use");
            }
            existing.setStudentId(updated.getStudentId());
        }

        if (updated.getFullName() != null) existing.setFullName(updated.getFullName());
        existing.setEmail(updated.getEmail());
        existing.setPhone(updated.getPhone());
        existing.setClassName(updated.getClassName());
        existing.setDateOfBirth(updated.getDateOfBirth());
        existing.setEnrollmentDate(updated.getEnrollmentDate());

        return studentRepository.save(existing);
    }

    @Transactional
    public void deleteStudent(Long id) {
        if (!studentRepository.existsById(id)) {
            throw new NoSuchElementException("Student not found with id: " + id);
        }
        studentRepository.deleteById(id);
    }
}
