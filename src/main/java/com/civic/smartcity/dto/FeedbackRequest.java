package com.civic.smartcity.dto;

import lombok.Data;

@Data
public class FeedbackRequest {
    private Long grievanceId;
    private Integer rating;
    private String comment;
    private Boolean reopenRequested;
}
