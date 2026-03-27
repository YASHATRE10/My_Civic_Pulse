package com.civic.smartcity.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class FeedbackResponse {
    private Long id;
    private Long grievanceId;
    private String citizenUsername;
    private Integer rating;
    private String comment;
    private String sentiment;
    private Boolean reopenRequested;
    private String department;
    private LocalDateTime createdAt;
}

