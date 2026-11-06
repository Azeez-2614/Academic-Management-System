package com.studentmanager.service;

import com.studentmanager.entity.Mark;
import com.studentmanager.entity.Student;
import com.studentmanager.exception.DuplicateResourceException;
import com.studentmanager.exception.ResourceNotFoundException;
import com.studentmanager.repository.MarkRepository;
import com.studentmanager.repository.StudentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StudentServiceTest {

    @Mock
    private StudentRepository studentRepository;

    @Mock
    private MarkRepository markRepository;

    @InjectMocks
    private StudentService studentService;

    private Student testStudent;

    @BeforeEach
    void setUp() {
        testStudent = new Student(
                1L,
                "STU101",
                "Aarav Sharma",
                "aarav.sharma@school.edu",
                "+1 555-0101",
                "Grade 10 - A",
                LocalDate.of(2008, 4, 12),
                LocalDate.of(2023, 8, 15),
                new ArrayList<>()
        );
    }

    @Test
    @DisplayName("Successfully create student when ID and email are unique")
    void createStudent_Success() {
        when(studentRepository.existsByStudentId(testStudent.getStudentId())).thenReturn(false);
        when(studentRepository.existsByEmail(testStudent.getEmail())).thenReturn(false);
        when(studentRepository.save(any(Student.class))).thenReturn(testStudent);

        Student created = studentService.createStudent(testStudent);

        assertNotNull(created);
        assertEquals("STU101", created.getStudentId());
        assertEquals("Aarav Sharma", created.getFullName());
        verify(studentRepository, times(1)).save(testStudent);
    }

    @Test
    @DisplayName("Throw DuplicateResourceException when student ID already exists")
    void createStudent_ThrowsDuplicateResourceException_WhenStudentIdExists() {
        when(studentRepository.existsByStudentId(testStudent.getStudentId())).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> studentService.createStudent(testStudent));
        verify(studentRepository, never()).save(any());
    }

    @Test
    @DisplayName("Throw DuplicateResourceException when email address already exists")
    void createStudent_ThrowsDuplicateResourceException_WhenEmailExists() {
        when(studentRepository.existsByStudentId(testStudent.getStudentId())).thenReturn(false);
        when(studentRepository.existsByEmail(testStudent.getEmail())).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> studentService.createStudent(testStudent));
        verify(studentRepository, never()).save(any());
    }

    @Test
    @DisplayName("Successfully update student details")
    void updateStudent_Success() {
        when(studentRepository.findById(1L)).thenReturn(Optional.of(testStudent));
        when(studentRepository.save(any(Student.class))).thenReturn(testStudent);

        Student updateInfo = new Student();
        updateInfo.setFullName("Aarav K. Sharma");
        updateInfo.setEmail("aarav.k@school.edu");
        updateInfo.setClassName("Grade 11 - A");

        Student updated = studentService.updateStudent(1L, updateInfo);

        assertNotNull(updated);
        assertEquals("Aarav K. Sharma", updated.getFullName());
        verify(studentRepository, times(1)).save(any(Student.class));
    }

    @Test
    @DisplayName("Throw ResourceNotFoundException when updating non-existent student")
    void updateStudent_ThrowsResourceNotFoundException_WhenNotFound() {
        when(studentRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> studentService.updateStudent(999L, testStudent));
        verify(studentRepository, never()).save(any());
    }

    @Test
    @DisplayName("Successfully delete student by ID")
    void deleteStudent_Success() {
        when(studentRepository.existsById(1L)).thenReturn(true);

        studentService.deleteStudent(1L);

        verify(studentRepository, times(1)).deleteById(1L);
    }

    @Test
    @DisplayName("Throw ResourceNotFoundException when deleting non-existent student")
    void deleteStudent_ThrowsResourceNotFoundException_WhenNotFound() {
        when(studentRepository.existsById(999L)).thenReturn(false);

        assertThrows(ResourceNotFoundException.class, () -> studentService.deleteStudent(999L));
        verify(studentRepository, never()).deleteById(any());
    }

    @Test
    @DisplayName("Calculate accurate average percentage from multiple marks entries")
    void calculateAveragePercentage_WithValidMarks() {
        List<Mark> marks = List.of(
                new Mark(1L, testStudent, "Math", 85.0, 100.0, "Mid-Term"),
                new Mark(2L, testStudent, "Physics", 95.0, 100.0, "Mid-Term")
        );
        testStudent.setMarks(marks);

        double avg = studentService.calculateAveragePercentage(testStudent);

        assertEquals(90.0, avg, 0.01);
    }

    @Test
    @DisplayName("Return 0.0 when student has no marks")
    void calculateAveragePercentage_WithEmptyMarks() {
        testStudent.setMarks(new ArrayList<>());

        double avg = studentService.calculateAveragePercentage(testStudent);

        assertEquals(0.0, avg);
    }

}
