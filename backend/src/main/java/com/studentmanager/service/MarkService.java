package com.studentmanager.service;

import com.studentmanager.entity.Mark;
import com.studentmanager.entity.Student;
import com.studentmanager.exception.MarkNotFoundException;
import com.studentmanager.exception.StudentNotFoundException;
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
        return markRepository.findByStudentId(studentId);
    }

    @Transactional
    public Mark addMark(Long studentId, Mark mark) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new StudentNotFoundException("Student not found with ID: " + studentId));

        if (mark.getMarks() > mark.getTotalMarks()) {
            throw new IllegalArgumentException("Obtained marks cannot exceed total marks");
        }

        mark.setStudent(student);
        return markRepository.save(mark);
    }

    @Transactional
    public Mark updateMark(Long markId, Mark updated) {
        Mark existing = markRepository.findById(markId)
                .orElseThrow(() -> new MarkNotFoundException("Mark record not found with ID: " + markId));

        if (updated.getMarks() > updated.getTotalMarks()) {
            throw new IllegalArgumentException("Obtained marks cannot exceed total marks");
        }

        existing.setSubject(updated.getSubject());
        existing.setExamType(updated.getExamType());
        existing.setMarks(updated.getMarks());
        existing.setTotalMarks(updated.getTotalMarks());

        return markRepository.save(existing);
    }

    @Transactional
    public void deleteMark(Long id) {
        if (!markRepository.existsById(id)) {
            throw new MarkNotFoundException("Mark record not found with ID: " + id);
        }
        markRepository.deleteById(id);
    }

    /**
     * Retrieves the overall class average percentage across all examination records.
     * Uses the weighted formula: (SUM(obtained) / SUM(total)) * 100
     */
    public Double getOverallAverage() {
        Double avg = markRepository.getOverallAveragePercentage();
        return avg != null ? Math.round(avg * 100.0) / 100.0 : 0.0;
    }

}
