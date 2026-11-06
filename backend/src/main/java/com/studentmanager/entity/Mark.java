package com.studentmanager.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Entity
@Table(
    name = "marks",
    indexes = {
        @Index(name = "idx_mark_student", columnList = "student_id"),
        @Index(name = "idx_mark_subject", columnList = "subject"),
        @Index(name = "idx_mark_exam_type", columnList = "exam_type")
    }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Mark {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    @JsonIgnoreProperties({"marks", "hibernateLazyInitializer", "handler"})
    private Student student;

    @NotBlank(message = "Subject name is required")
    @Size(min = 2, max = 100, message = "Subject name must be between 2 and 100 characters")
    @Column(nullable = false, length = 100)
    private String subject;

    @NotNull(message = "Marks obtained is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Obtained marks cannot be negative")
    @Column(nullable = false)
    private Double marks;

    @NotNull(message = "Total marks is required")
    @DecimalMin(value = "0.01", inclusive = true, message = "Total marks must be greater than zero")
    @Column(name = "total_marks", nullable = false)
    private Double totalMarks;

    @NotBlank(message = "Exam type is required (e.g. Mid-Term, Final, Unit Test, Assignment)")
    @Column(name = "exam_type", nullable = false, length = 50)
    private String examType;

    /**
     * Calculates percentage rounded to 2 decimal places.
     */
    @JsonProperty("percentage")
    @Transient
    public Double getPercentage() {
        if (marks == null || totalMarks == null || totalMarks <= 0.0) {
            return 0.0;
        }
        double raw = (marks / totalMarks) * 100.0;
        return BigDecimal.valueOf(raw)
                .setScale(2, RoundingMode.HALF_UP)
                .doubleValue();
    }

    /**
     * Determines letter grade based on standardized institutional grading scale:
     * 90.00 – 100.00 -> A+
     * 80.00 – 89.99  -> A
     * 70.00 – 79.99  -> B+
     * 60.00 – 69.99  -> B
     * 50.00 – 59.99  -> C
     * 40.00 – 49.99  -> D
     * Below 40.00    -> F
     */
    @JsonProperty("grade")
    @Transient
    public String getGrade() {
        Double pct = getPercentage();
        if (pct == null) return "F";
        if (pct >= 90.0) return "A+";
        if (pct >= 80.0) return "A";
        if (pct >= 70.0) return "B+";
        if (pct >= 60.0) return "B";
        if (pct >= 50.0) return "C";
        if (pct >= 40.0) return "D";
        return "F";
    }

}
