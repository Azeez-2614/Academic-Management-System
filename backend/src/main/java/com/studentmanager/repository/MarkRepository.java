package com.studentmanager.repository;

import com.studentmanager.entity.Mark;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MarkRepository extends JpaRepository<Mark, Long> {

    List<Mark> findByStudentId(Long studentId);

    List<Mark> findByStudentIdAndSubject(Long studentId, String subject);

    List<Mark> findByStudentIdAndExamType(Long studentId, String examType);

    void deleteByStudentId(Long studentId);

    @Query("SELECT AVG(m.marks / m.totalMarks * 100) FROM Mark m")
    Double getOverallAveragePercentage();

    @Query("SELECT AVG(m.marks / m.totalMarks * 100) FROM Mark m WHERE m.student.id = :studentId")
    Double getAveragePercentageByStudentId(@Param("studentId") Long studentId);

}
