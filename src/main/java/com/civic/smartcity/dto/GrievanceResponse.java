package com.civic.smartcity.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class GrievanceResponse {
    private Long id;
    private String title;
    private String description;
    private String category;
    private String status;
    private String location;
    private String imageBase64;
    private String citizenUsername;
    private LocalDateTime submittedAt;
    private LocalDateTime updatedAt;
    private LocalDateTime resolvedAt;
    private String assignedOfficer;
    private String remarks;
    private String officerComment;
    private String resolutionImageBase64;
    private Double latitude;
    private Double longitude;
    private String zone;
    private Boolean reopened;
    private String aiSuggestedCategory;
    // Module 3
    private String priority;
    private LocalDateTime deadline;
    private String department;
}
