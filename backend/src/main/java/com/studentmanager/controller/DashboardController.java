package com.studentmanager.controller;

import com.studentmanager.dto.DashboardResponse;
import com.studentmanager.dto.DashboardResponse.StudentSummary;
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

import java.util.ArrayList;
import java.util.List;

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
        long totalStudents = studentRepository.count();
        Double overallAvg = markRepository.getOverallAveragePercentage();

        List<Student> students = studentRepository.findAll();
        List<StudentSummary> summaryList = new ArrayList<>();

        TopStudent highest = null;
        TopStudent lowest = null;
        double maxPct = -1.0;
        double minPct = 101.0;

        for (Student s : students) {
            double avg = studentService.calculateAveragePercentage(s);
            String grade = calculateGrade(avg);

            summaryList.add(new StudentSummary(
                    s.getId(),
                    s.getStudentId(),
                    s.getFullName(),
                    s.getClassName(),
                    avg > 0 ? avg : null,
                    grade
            ));

            if (s.getMarks() != null && !s.getMarks().isEmpty()) {
                if (avg > maxPct) {
                    maxPct = avg;
                    highest = new TopStudent(s.getStudentId(), s.getFullName(), avg);
                }
                if (avg < minPct) {
                    minPct = avg;
                    lowest = new TopStudent(s.getStudentId(), s.getFullName(), avg);
                }
            }
        }

        DashboardResponse response = new DashboardResponse(
                totalStudents,
                overallAvg != null ? Math.round(overallAvg * 100.0) / 100.0 : 0.0,
                highest,
                lowest,
                summaryList
        );

        return ResponseEntity.ok(response);
    }

    private String calculateGrade(double pct) {
        if (pct <= 0) return "N/A";
        if (pct >= 90) return "A+";
        if (pct >= 80) return "A";
        if (pct >= 70) return "B+";
        if (pct >= 60) return "B";
        if (pct >= 50) return "C";
        if (pct >= 40) return "D";
        return "F";
    }

}
