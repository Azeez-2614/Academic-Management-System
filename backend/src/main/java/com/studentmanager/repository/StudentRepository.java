package com.studentmanager.repository;

import com.studentmanager.entity.Student;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {

    Optional<Student> findByStudentId(String studentId);

    Optional<Student> findByEmail(String email);

    boolean existsByStudentId(String studentId);

    boolean existsByEmail(String email);

    boolean existsByStudentIdAndIdNot(String studentId, Long id);

    boolean existsByEmailAndIdNot(String email, Long id);

    List<Student> findByFullNameContainingIgnoreCase(String name);

    List<Student> findByClassName(String className);

    @Query("SELECT DISTINCT s.className FROM Student s WHERE s.className IS NOT NULL AND s.className != '' ORDER BY s.className ASC")
    List<String> findDistinctClassNames();

    @Query("SELECT s FROM Student s WHERE " +
           "(:search IS NULL OR :search = '' OR " +
           " LOWER(s.fullName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(s.studentId) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(s.email) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:className IS NULL OR :className = '' OR :className = 'all' OR s.className = :className)")
    Page<Student> findWithFilters(
            @Param("search") String search,
            @Param("className") String className,
            Pageable pageable
    );

    @Query("SELECT s FROM Student s LEFT JOIN FETCH s.marks")
    List<Student> findAllWithMarks();

}
