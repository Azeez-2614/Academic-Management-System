package com.studentmanager.service;

import com.studentmanager.entity.Mark;
import com.studentmanager.entity.Student;
import com.studentmanager.exception.DuplicateResourceException;
import com.studentmanager.exception.InvalidMarksException;
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

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MarkServiceTest {

    @Mock
    private MarkRepository markRepository;

    @Mock
    private StudentRepository studentRepository;

    @InjectMocks
    private MarkService markService;

    private Student student;
    private Mark validMark;

    @BeforeEach
    void setUp() {
        student = new Student();
        student.setId(1L);
        student.setFullName("Aarav Sharma");

        validMark = new Mark();
        validMark.setId(10L);
        validMark.setSubject("Mathematics");
        validMark.setMarks(85.0);
        validMark.setTotalMarks(100.0);
        validMark.setExamType("Mid-Term");
        validMark.setStudent(student);
    }

    @Test
    @DisplayName("Successfully add examination mark for student")
    void addMark_Success() {
        when(studentRepository.findById(1L)).thenReturn(Optional.of(student));
        when(markRepository.existsByStudentIdAndSubjectIgnoreCaseAndExamTypeIgnoreCase(1L, "Mathematics", "Mid-Term"))
                .thenReturn(false);
        when(markRepository.save(any(Mark.class))).thenReturn(validMark);

        Mark result = markService.addMark(1L, validMark);

        assertNotNull(result);
        assertEquals(85.0, result.getMarks());
        assertEquals("Mathematics", result.getSubject());
        verify(markRepository, times(1)).save(validMark);
    }

    @Test
    @DisplayName("Throw InvalidMarksException when obtained marks exceed maximum total marks")
    void addMark_ThrowsInvalidMarksException_WhenObtainedExceedsMaximum() {
        when(studentRepository.findById(1L)).thenReturn(Optional.of(student));

        validMark.setMarks(105.0);
        validMark.setTotalMarks(100.0);

        InvalidMarksException ex = assertThrows(InvalidMarksException.class,
                () -> markService.addMark(1L, validMark));

        assertTrue(ex.getMessage().contains("cannot exceed maximum"));
        verify(markRepository, never()).save(any());
    }

    @Test
    @DisplayName("Throw InvalidMarksException when obtained marks are negative")
    void addMark_ThrowsInvalidMarksException_WhenNegative() {
        when(studentRepository.findById(1L)).thenReturn(Optional.of(student));

        validMark.setMarks(-5.0);

        InvalidMarksException ex = assertThrows(InvalidMarksException.class,
                () -> markService.addMark(1L, validMark));

        assertTrue(ex.getMessage().contains("cannot be negative"));
        verify(markRepository, never()).save(any());
    }

    @Test
    @DisplayName("Throw InvalidMarksException when total marks is zero")
    void addMark_ThrowsInvalidMarksException_WhenTotalZero() {
        when(studentRepository.findById(1L)).thenReturn(Optional.of(student));

        validMark.setTotalMarks(0.0);

        InvalidMarksException ex = assertThrows(InvalidMarksException.class,
                () -> markService.addMark(1L, validMark));

        assertTrue(ex.getMessage().contains("strictly greater than zero"));
        verify(markRepository, never()).save(any());
    }

    @Test
    @DisplayName("Throw DuplicateResourceException when student already has exam record for subject and exam type")
    void addMark_ThrowsDuplicateResourceException_WhenDuplicate() {
        when(studentRepository.findById(1L)).thenReturn(Optional.of(student));
        when(markRepository.existsByStudentIdAndSubjectIgnoreCaseAndExamTypeIgnoreCase(1L, "Mathematics", "Mid-Term"))
                .thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> markService.addMark(1L, validMark));
        verify(markRepository, never()).save(any());
    }

    @Test
    @DisplayName("Throw ResourceNotFoundException when student does not exist")
    void addMark_ThrowsResourceNotFoundException_WhenStudentMissing() {
        when(studentRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> markService.addMark(999L, validMark));
        verify(markRepository, never()).save(any());
    }

    @Test
    @DisplayName("Successfully delete examination mark")
    void deleteMark_Success() {
        when(markRepository.existsById(10L)).thenReturn(true);

        markService.deleteMark(10L);

        verify(markRepository, times(1)).deleteById(10L);
    }

}
