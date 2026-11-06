package com.studentmanager.service;

import com.studentmanager.entity.Mark;
import com.studentmanager.entity.Student;
import com.studentmanager.repository.MarkRepository;
import com.studentmanager.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

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

    public Optional<Mark> getMarkById(Long id) {
        return markRepository.findById(id);
    }

    @Transactional
    public Mark addMark(Long studentId, Mark mark) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new NoSuchElementException("Student not found with id: " + studentId));

        if (mark.getMarks() != null && mark.getTotalMarks() != null && mark.getMarks() > mark.getTotalMarks()) {
            throw new IllegalArgumentException("Marks obtained cannot exceed total marks");
        }

        mark.setStudent(student);
        return markRepository.save(mark);
    }

    @Transactional
    public Mark updateMark(Long markId, Mark updated) {
        Mark existing = markRepository.findById(markId)
                .orElseThrow(() -> new NoSuchElementException("Mark record not found with id: " + markId));

        if (updated.getMarks() != null && updated.getTotalMarks() != null && updated.getMarks() > updated.getTotalMarks()) {
            throw new IllegalArgumentException("Marks obtained cannot exceed total marks");
        }

        if (updated.getSubject() != null) existing.setSubject(updated.getSubject());
        if (updated.getMarks() != null) existing.setMarks(updated.getMarks());
        if (updated.getTotalMarks() != null) existing.setTotalMarks(updated.getTotalMarks());
        if (updated.getExamType() != null) existing.setExamType(updated.getExamType());

        return markRepository.save(existing);
    }

    @Transactional
    public void deleteMark(Long id) {
        if (!markRepository.existsById(id)) {
            throw new NoSuchElementException("Mark record not found with id: " + id);
        }
        markRepository.deleteById(id);
    }

    public Double getOverallAverage() {
        Double avg = markRepository.getOverallAveragePercentage();
        return avg != null ? Math.round(avg * 100.0) / 100.0 : 0.0;
    }

    public Double getStudentAverage(Long studentId) {
        Double avg = markRepository.getAveragePercentageByStudentId(studentId);
        return avg != null ? Math.round(avg * 100.0) / 100.0 : 0.0;
    }
}
