package com.studentmanager.repository;

import com.studentmanager.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {

    Optional<Student> findByStudentId(String studentId);

    List<Student> findByFullNameContainingIgnoreCase(String name);

    List<Student> findByClassName(String className);

    boolean existsByStudentId(String studentId);

}
