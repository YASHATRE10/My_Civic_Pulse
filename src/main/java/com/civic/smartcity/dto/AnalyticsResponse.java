package com.civic.smartcity.dto;

import java.util.List;
import java.util.Map;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AnalyticsResponse {
    private Map<String, Long> complaintsByCategory;
    private Map<String, Long> complaintsByStatus;
    private Map<String, Long> complaintsByZone;
    private List<Map<String, Object>> complaintsOverTime;
    private Map<String, Long> slaPerformance;
    private Map<String, Long> predictedBreachByPriority;
    private Double transparencyScore;
}
