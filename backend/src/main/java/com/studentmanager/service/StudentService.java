package com.studentmanager.service;

import com.studentmanager.entity.Mark;
import com.studentmanager.entity.Student;
import com.studentmanager.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class StudentService {

    private final StudentRepository studentRepository;

    @Autowired
    public StudentService(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    public List<Student> getAllStudents(String search) {
        if (search != null && !search.trim().isEmpty()) {
            return studentRepository.findByFullNameContainingIgnoreCaseOrStudentIdContainingIgnoreCase(
                    search.trim(), search.trim());
        }
        return studentRepository.findAll();
    }

    public Student getStudentById(Long id) {
        return studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found with ID: " + id));
    }

    @Transactional
    public Student createStudent(Student student) {
        if (studentRepository.existsByStudentId(student.getStudentId())) {
            throw new IllegalArgumentException("Student ID '" + student.getStudentId() + "' already exists");
        }
        if (studentRepository.existsByEmail(student.getEmail())) {
            throw new IllegalArgumentException("Email '" + student.getEmail() + "' already exists");
        }
        return studentRepository.save(student);
    }

    @Transactional
    public Student updateStudent(Long id, Student updated) {
        Student existing = getStudentById(id);

        // Check if new studentId is already taken by someone else
        if (!existing.getStudentId().equalsIgnoreCase(updated.getStudentId()) &&
                studentRepository.existsByStudentId(updated.getStudentId())) {
            throw new IllegalArgumentException("Student ID '" + updated.getStudentId() + "' is already in use");
        }

        // Check if new email is already taken by someone else
        if (!existing.getEmail().equalsIgnoreCase(updated.getEmail()) &&
                studentRepository.existsByEmail(updated.getEmail())) {
            throw new IllegalArgumentException("Email '" + updated.getEmail() + "' is already in use");
        }

        existing.setStudentId(updated.getStudentId());
        existing.setFullName(updated.getFullName());
        existing.setEmail(updated.getEmail());
        existing.setPhone(updated.getPhone());
        existing.setClassName(updated.getClassName());
        existing.setDateOfBirth(updated.getDateOfBirth());

        return studentRepository.save(existing);
    }

    @Transactional
    public void deleteStudent(Long id) {
        if (!studentRepository.existsById(id)) {
            throw new RuntimeException("Student not found with ID: " + id);
        }
        studentRepository.deleteById(id);
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
        return totalMax > 0 ? Math.round((totalObtained / totalMax) * 10000.0) / 100.0 : 0.0;
    }

}
