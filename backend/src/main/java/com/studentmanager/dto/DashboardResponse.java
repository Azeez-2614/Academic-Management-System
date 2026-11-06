package com.studentmanager.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DashboardResponse {

    private long totalStudents;
    private Double averagePercentage;
    private TopStudent highestScorer;
    private TopStudent lowestScorer;
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
    public static class StudentSummary {
        private Long id;
        private String studentId;
        private String fullName;
        private String className;
        private Double averagePercentage;
        private String grade;
    }

}
