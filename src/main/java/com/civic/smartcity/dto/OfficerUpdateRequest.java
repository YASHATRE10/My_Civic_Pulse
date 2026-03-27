package com.civic.smartcity.dto;

import lombok.Data;

@Data
public class OfficerUpdateRequest {
    private String status;
    private String remarks;
    private String officerComment;
    private String resolutionImageBase64;
}
