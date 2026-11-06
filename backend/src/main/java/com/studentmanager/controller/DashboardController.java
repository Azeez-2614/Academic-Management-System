package com.studentmanager.controller;

import com.studentmanager.dto.DashboardResponse;
import com.studentmanager.dto.DashboardResponse.StudentSummary;
import com.studentmanager.dto.DashboardResponse.TopStudent;
import com.studentmanager.entity.Student;
import com.studentmanager.service.MarkService;
import com.studentmanager.service.StudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "http://localhost:5173")
public class DashboardController {

    private final StudentService studentService;
    private final MarkService markService;

    @Autowired
    public DashboardController(StudentService studentService, MarkService markService) {
        this.studentService = studentService;
        this.markService = markService;
    }

    @GetMapping
    public ResponseEntity<DashboardResponse> getDashboardData() {
        List<Student> students = studentService.getAllStudents();
        long totalStudents = students.size();
        Double overallAvg = markService.getOverallAverage();

        TopStudent highestScorer = null;
        TopStudent lowestScorer = null;
        double maxPct = -1.0;
        double minPct = 101.0;

        List<StudentSummary> summaryList = new ArrayList<>();

        for (Student s : students) {
            double avg = studentService.calculateAveragePercentage(s);
            avg = Math.round(avg * 10.0) / 10.0;
            String grade = calculateGrade(avg);

            StudentSummary summary = new StudentSummary(
                    s.getId(),
                    s.getStudentId(),
                    s.getFullName(),
                    s.getClassName(),
                    avg,
                    grade
            );
            summaryList.add(summary);

            // Only consider students who actually have marks for highest/lowest
            if (s.getMarks() != null && !s.getMarks().isEmpty()) {
                if (avg > maxPct) {
                    maxPct = avg;
                    highestScorer = new TopStudent(s.getStudentId(), s.getFullName(), avg);
                }
                if (avg < minPct) {
                    minPct = avg;
                    lowestScorer = new TopStudent(s.getStudentId(), s.getFullName(), avg);
                }
            }
        }

        DashboardResponse response = new DashboardResponse(
                totalStudents,
                overallAvg,
                highestScorer,
                lowestScorer,
                summaryList
        );

        return ResponseEntity.ok(response);
    }

    private String calculateGrade(double pct) {
        if (pct >= 90) return "A+";
        if (pct >= 80) return "A";
        if (pct >= 70) return "B+";
        if (pct >= 60) return "B";
        if (pct >= 50) return "C";
        if (pct >= 40) return "D";
        if (pct > 0) return "F";
        return "N/A";
    }
}
