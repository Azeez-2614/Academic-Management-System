package com.studentmanager.controller;

import com.studentmanager.dto.DashboardResponse;
import com.studentmanager.dto.DashboardResponse.StudentSummary;
import com.studentmanager.dto.DashboardResponse.SubjectAverage;
import com.studentmanager.dto.DashboardResponse.TopStudent;
import com.studentmanager.entity.Student;
import com.studentmanager.repository.MarkRepository;
import com.studentmanager.repository.StudentRepository;
import com.studentmanager.service.StudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "http://localhost:5173")
public class DashboardController {

    private final StudentRepository studentRepository;
    private final MarkRepository markRepository;
    private final StudentService studentService;

    @Autowired
    public DashboardController(
            StudentRepository studentRepository,
            MarkRepository markRepository,
            StudentService studentService) {
        this.studentRepository = studentRepository;
        this.markRepository = markRepository;
        this.studentService = studentService;
    }

    @GetMapping
    public ResponseEntity<DashboardResponse> getDashboardData() {
        // Fast DB aggregate queries
        long totalStudents = studentRepository.count();
        Double overallAvgRaw = markRepository.getOverallAveragePercentage();
        Double overallAvg = overallAvgRaw != null ? round(overallAvgRaw) : 0.0;

        // Subject-wise averages using JPQL GROUP BY
        List<Object[]> subjectData = markRepository.getSubjectWiseAverages();
        List<SubjectAverage> subjectAverages = new ArrayList<>();
        if (subjectData != null) {
            for (Object[] row : subjectData) {
                String subject = (String) row[0];
                Double avg = row[1] != null ? round((Double) row[1]) : 0.0;
                Long count = row[2] != null ? ((Number) row[2]).longValue() : 0L;
                subjectAverages.add(new SubjectAverage(subject, avg, count));
            }
        }

        // Single query with JOIN FETCH to eliminate N+1 problem
        List<Student> students = studentRepository.findAllWithMarks();

        TopStudent highestScorer = null;
        TopStudent lowestScorer = null;
        double maxPct = -1.0;
        double minPct = 101.0;

        Map<String, Long> gradeDistribution = new LinkedHashMap<>();
        gradeDistribution.put("A+", 0L);
        gradeDistribution.put("A", 0L);
        gradeDistribution.put("B+", 0L);
        gradeDistribution.put("B", 0L);
        gradeDistribution.put("C", 0L);
        gradeDistribution.put("D", 0L);
        gradeDistribution.put("F", 0L);

        List<StudentSummary> summaryList = new ArrayList<>();

        for (Student s : students) {
            double avg = studentService.calculateAveragePercentage(s);
            Double roundedAvg = avg > 0.0 ? round(avg) : null;
            String grade = calculateGrade(avg);

            if (roundedAvg != null) {
                gradeDistribution.put(grade, gradeDistribution.getOrDefault(grade, 0L) + 1);

                if (avg > maxPct) {
                    maxPct = avg;
                    highestScorer = new TopStudent(s.getStudentId(), s.getFullName(), roundedAvg);
                }
                if (avg < minPct) {
                    minPct = avg;
                    lowestScorer = new TopStudent(s.getStudentId(), s.getFullName(), roundedAvg);
                }
            }

            StudentSummary summary = new StudentSummary(
                    s.getId(),
                    s.getStudentId(),
                    s.getFullName(),
                    s.getClassName(),
                    roundedAvg,
                    grade
            );
            summaryList.add(summary);
        }

        DashboardResponse response = DashboardResponse.builder()
                .totalStudents(totalStudents)
                .averagePercentage(overallAvg)
                .highestScorer(highestScorer)
                .lowestScorer(lowestScorer)
                .subjectAverages(subjectAverages)
                .gradeDistribution(gradeDistribution)
                .performanceSummary(summaryList)
                .build();

        return ResponseEntity.ok(response);
    }

    private String calculateGrade(double pct) {
        if (pct <= 0.0) return "N/A";
        if (pct >= 90.0) return "A+";
        if (pct >= 80.0) return "A";
        if (pct >= 70.0) return "B+";
        if (pct >= 60.0) return "B";
        if (pct >= 50.0) return "C";
        if (pct >= 40.0) return "D";
        return "F";
    }

    private double round(double val) {
        return BigDecimal.valueOf(val).setScale(2, RoundingMode.HALF_UP).doubleValue();
    }

}
