package com.civic.smartcity.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "grievances")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class Grievance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, length = 1000)
    private String description;

    @Column(nullable = false)
    private String category; // WATER, STREET_LIGHT, ROAD, SANITATION, DRAINAGE, PARK, ELECTRICITY, OTHER

    @Column(nullable = false)
    private String status;   // PENDING, IN_PROGRESS, RESOLVED, CLOSED

    private String location;

    private Double latitude;

    private Double longitude;

    private String zone;

    @Column(length = 5000000) // ~5MB base64 image
    private String imageBase64;

    @Column(nullable = false)
    private String citizenUsername;

    @Column(nullable = false)
    private LocalDateTime submittedAt;

    private LocalDateTime updatedAt;

    private String assignedOfficer;

    private String remarks;

    @Column(length = 5000000)
    private String resolutionImageBase64;

    private String officerComment;

    private LocalDateTime resolvedAt;

    //Module 3: Admin panel fields

    private String priority; // LOW, MEDIUM, HIGH

    private LocalDateTime deadline;

    private String department; // e.g., Public Works, Sanitation, etc.

    private Boolean reopened;

    private String aiSuggestedCategory;
    
}
