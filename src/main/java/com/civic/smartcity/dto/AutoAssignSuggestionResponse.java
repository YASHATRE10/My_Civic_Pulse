package com.civic.smartcity.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AutoAssignSuggestionResponse {
    private String suggestedOfficer;
    private String suggestedDepartment;
    private String suggestedPriority;
    private String reason;
}
