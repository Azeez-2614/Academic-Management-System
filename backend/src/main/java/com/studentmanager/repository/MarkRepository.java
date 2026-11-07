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

    @Query("SELECT AVG(m.marks / m.totalMarks * 100) FROM Mark m WHERE m.totalMarks > 0")
    Double getOverallAveragePercentage();

}
