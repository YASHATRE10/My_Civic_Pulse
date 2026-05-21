package com.civicpulse.controller;

import com.civicpulse.dto.AssignComplaintRequest;
import com.civicpulse.dto.ComplaintResponse;
import com.civicpulse.dto.StatusUpdateRequest;
import com.civicpulse.entity.Category;
import com.civicpulse.service.ComplaintService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/complaints")
@RequiredArgsConstructor
public class ComplaintController {

    private final ComplaintService complaintService;

        @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('CITIZEN')")
    public ResponseEntity<ComplaintResponse> createComplaint(
            @RequestParam String title,
            @RequestParam String description,
            @RequestParam Category category,
            @RequestParam String location,
            @RequestParam MultipartFile image,
            Authentication authentication
    ) {
        return ResponseEntity.ok(complaintService.createComplaint(
                title,
                description,
                category,
                location,
                image,
                authentication.getName()
        ));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','OFFICER','CITIZEN')")
    public ResponseEntity<List<ComplaintResponse>> getComplaints(@RequestParam(required = false) Long assignedOfficerId) {
        return ResponseEntity.ok(complaintService.getComplaints(assignedOfficerId));
    }

    @GetMapping("/user/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','CITIZEN')")
    public ResponseEntity<List<ComplaintResponse>> getByUser(@PathVariable Long id) {
        return ResponseEntity.ok(complaintService.getComplaintsByUser(id));
    }

    @PutMapping("/assign")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ComplaintResponse> assign(@RequestBody AssignComplaintRequest request) {
        return ResponseEntity.ok(complaintService.assignComplaint(request));
    }

    @PutMapping(value = "/status", consumes = MediaType.APPLICATION_JSON_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN','OFFICER','CITIZEN')")
    public ResponseEntity<ComplaintResponse> updateStatusJson(@RequestBody StatusUpdateRequest request) {
        return ResponseEntity.ok(complaintService.updateStatus(request, null));
    }

    @PutMapping(value = "/status", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN','OFFICER','CITIZEN')")
    public ResponseEntity<ComplaintResponse> updateStatus(
            @RequestPart("payload") StatusUpdateRequest request,
            @RequestPart(value = "proofImage", required = false) MultipartFile proofImage
    ) {
        return ResponseEntity.ok(complaintService.updateStatus(request, proofImage));
    }
}
