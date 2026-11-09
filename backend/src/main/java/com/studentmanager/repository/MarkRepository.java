package com.studentmanager.repository;

import com.studentmanager.entity.Mark;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MarkRepository extends JpaRepository<Mark, Long> {

    List<Mark> findByStudentId(Long studentId);

    void deleteByStudentId(Long studentId);

    /**
     * Calculates the overall class average percentage as a weighted aggregate:
     * Formula: (Total obtained marks across all exams / Total possible marks across all exams) * 100.
     * This provides consistent weighting aligned with individual student calculations.
     */
    @Query("SELECT (SUM(m.marks) / SUM(m.totalMarks)) * 100.0 FROM Mark m WHERE m.totalMarks > 0")
    Double getOverallAveragePercentage();

}
