package com.studentmanager.service;

import com.studentmanager.entity.Mark;
import com.studentmanager.entity.Student;
import com.studentmanager.exception.DuplicateResourceException;
import com.studentmanager.exception.InvalidMarksException;
import com.studentmanager.exception.ResourceNotFoundException;
import com.studentmanager.repository.MarkRepository;
import com.studentmanager.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class MarkService {

    private final MarkRepository markRepository;
    private final StudentRepository studentRepository;

    @Autowired
    public MarkService(MarkRepository markRepository, StudentRepository studentRepository) {
        this.markRepository = markRepository;
        this.studentRepository = studentRepository;
    }

    public List<Mark> getMarksByStudentId(Long studentId) {
        if (!studentRepository.existsById(studentId)) {
            throw new ResourceNotFoundException("Student", "id", studentId);
        }
        return markRepository.findByStudentId(studentId);
    }

    public Mark getMarkById(Long id) {
        return markRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Mark record", "id", id));
    }

    @Transactional
    public Mark addMark(Long studentId, Mark mark) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", studentId));

        validateMarkValues(mark);

        // Prevent duplicate examination record for same student, subject, and exam type
        if (markRepository.existsByStudentIdAndSubjectIgnoreCaseAndExamTypeIgnoreCase(
                studentId, mark.getSubject().trim(), mark.getExamType().trim())) {
            throw new DuplicateResourceException(String.format(
                    "An examination record already exists for student '%s' in subject '%s' for '%s'",
                    student.getFullName(), mark.getSubject(), mark.getExamType()));
        }

        mark.setStudent(student);
        mark.setSubject(mark.getSubject().trim());
        mark.setExamType(mark.getExamType().trim());
        return markRepository.save(mark);
    }

    @Transactional
    public Mark updateMark(Long markId, Mark updated) {
        Mark existing = markRepository.findById(markId)
                .orElseThrow(() -> new ResourceNotFoundException("Mark record", "id", markId));

        validateMarkValues(updated);

        // Check duplicate constraint excluding current record
        if (markRepository.existsByStudentIdAndSubjectIgnoreCaseAndExamTypeIgnoreCaseAndIdNot(
                existing.getStudent().getId(),
                updated.getSubject().trim(),
                updated.getExamType().trim(),
                markId)) {
            throw new DuplicateResourceException(String.format(
                    "Another examination record already exists for subject '%s' (%s)",
                    updated.getSubject(), updated.getExamType()));
        }

        existing.setSubject(updated.getSubject().trim());
        existing.setMarks(updated.getMarks());
        existing.setTotalMarks(updated.getTotalMarks());
        existing.setExamType(updated.getExamType().trim());

        return markRepository.save(existing);
    }

    @Transactional
    public void deleteMark(Long id) {
        if (!markRepository.existsById(id)) {
            throw new ResourceNotFoundException("Mark record", "id", id);
        }
        markRepository.deleteById(id);
    }

    private void validateMarkValues(Mark mark) {
        if (mark.getMarks() == null) {
            throw new InvalidMarksException("Marks obtained cannot be null");
        }
        if (mark.getTotalMarks() == null) {
            throw new InvalidMarksException("Total / maximum marks cannot be null");
        }
        if (mark.getMarks() < 0.0) {
            throw new InvalidMarksException("Marks obtained cannot be negative: " + mark.getMarks());
        }
        if (mark.getTotalMarks() <= 0.0) {
            throw new InvalidMarksException("Total / maximum marks must be strictly greater than zero: " + mark.getTotalMarks());
        }
        if (mark.getMarks() > mark.getTotalMarks()) {
            throw new InvalidMarksException(String.format(
                    "Marks obtained (%.2f) cannot exceed maximum total marks (%.2f)",
                    mark.getMarks(), mark.getTotalMarks()));
        }
    }

    public Double getOverallAverage() {
        Double avg = markRepository.getOverallAveragePercentage();
        return avg != null ? Math.round(avg * 100.0) / 100.0 : 0.0;
    }

    public Double getStudentAverage(Long studentId) {
        Double avg = markRepository.getAveragePercentageByStudentId(studentId);
        return avg != null ? Math.round(avg * 100.0) / 100.0 : 0.0;
    }

    public List<Object[]> getSubjectWiseAverages() {
        return markRepository.getSubjectWiseAverages();
    }

}
