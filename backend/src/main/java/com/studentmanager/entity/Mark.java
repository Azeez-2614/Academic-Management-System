package com.studentmanager.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "marks")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Mark {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    @JsonIgnoreProperties("marks")
    private Student student;

    @Column(nullable = false)
    private String subject;

    private Double marks; // obtained
    private Double totalMarks; // out of
    private String examType; // Mid-Term, Final, Unit Test, Assignment

    // Transient calculated fields
    @Transient
    public Double getPercentage() {
        if (totalMarks == null || totalMarks == 0) return 0.0;
        return (marks / totalMarks) * 100.0;
    }

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
