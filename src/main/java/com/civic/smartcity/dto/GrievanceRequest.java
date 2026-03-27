package com.civic.smartcity.dto;

import lombok.Data;

@Data
public class GrievanceRequest {
    private String title;
    private String description;
    private String category;
    private String location;
    private Double latitude;
    private Double longitude;
    private String zone;
    private String imageBase64;
}
