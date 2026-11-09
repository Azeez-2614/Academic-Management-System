package com.studentmanager.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name = "marks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = "student")
public class Mark {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    @JsonIgnoreProperties({"marks", "hibernateLazyInitializer", "handler"})
    private Student student;

    @NotBlank(message = "Subject is required")
    @Column(nullable = false)
    private String subject;

    @NotBlank(message = "Examination type is required")
    @Column(name = "exam_type", nullable = false)
    private String examType; // Mid-Term, Final, Unit Test, Assignment

    @NotNull(message = "Obtained marks is required")
    @DecimalMin(value = "0.0", message = "Obtained marks cannot be negative")
    @Column(nullable = false)
    private Double marks;

    @NotNull(message = "Total marks is required")
    @DecimalMin(value = "0.01", message = "Total marks must be greater than zero")
    @Column(name = "total_marks", nullable = false)
    private Double totalMarks;

    @JsonProperty("percentage")
    @Transient
    public Double getPercentage() {
        if (marks == null || totalMarks == null || totalMarks <= 0) {
            return 0.0;
        }
        return Math.round((marks / totalMarks) * 10000.0) / 100.0;
    }

    @JsonProperty("grade")
    @Transient
    public String getGrade() {
        double pct = getPercentage();
        if (pct >= 90) return "A+";
        if (pct >= 80) return "A";
        if (pct >= 70) return "B+";
        if (pct >= 60) return "B";
        if (pct >= 50) return "C";
        if (pct >= 40) return "D";
        return "F";
    }

}
