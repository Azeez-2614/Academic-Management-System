package com.studentmanager.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DashboardResponse {

    private long totalStudents;
    private Double averagePercentage;
    private TopStudent highestScorer;
    private TopStudent lowestScorer;
    private List<SubjectAverage> subjectAverages;
    private Map<String, Long> gradeDistribution;
    private List<StudentSummary> performanceSummary;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class TopStudent {
        private String studentId;
        private String fullName;
        private Double averagePercentage;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class SubjectAverage {
        private String subject;
        private Double averagePercentage;
        private Long totalEntries;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class StudentSummary {
        private Long id;
        private String studentId;
        private String fullName;
        private String className;
        private Double averagePercentage;
        private String grade;
    }

}
