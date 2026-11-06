package com.studentmanager.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
    name = "students",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_student_id", columnNames = "studentId"),
        @UniqueConstraint(name = "uk_student_email", columnNames = "email")
    },
    indexes = {
        @Index(name = "idx_student_id", columnList = "studentId"),
        @Index(name = "idx_student_name", columnList = "fullName"),
        @Index(name = "idx_student_class", columnList = "className")
    }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Student ID is required")
    @Size(min = 3, max = 20, message = "Student ID must be between 3 and 20 characters")
    @Pattern(regexp = "^[A-Za-z0-9_-]+$", message = "Student ID must contain only alphanumeric characters, dashes, or underscores")
    @Column(name = "student_id", nullable = false, unique = true, length = 20)
    private String studentId;

    @NotBlank(message = "Full Name is required")
    @Size(min = 2, max = 100, message = "Full Name must be between 2 and 100 characters")
    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;

    @NotBlank(message = "Email address is required")
    @Email(message = "Please provide a valid email address")
    @Size(max = 100, message = "Email cannot exceed 100 characters")
    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Pattern(regexp = "^$|^(\\+?[0-9]{1,4}[ -]?)?[0-9]{7,15}$", message = "Phone number must be a valid format (e.g. +1 555-0101)")
    @Column(length = 30)
    private String phone;

    @Size(max = 50, message = "Class / Department cannot exceed 50 characters")
    @Column(name = "class_name", length = 50)
    private String className;

    @Past(message = "Date of birth must be a past date")
    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @PastOrPresent(message = "Enrollment date cannot be in the future")
    @Column(name = "enrollment_date")
    private LocalDate enrollmentDate;

    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties("student")
    private List<Mark> marks = new ArrayList<>();

}
