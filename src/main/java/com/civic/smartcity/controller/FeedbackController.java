package com.civic.smartcity.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.civic.smartcity.dto.FeedbackRequest;
import com.civic.smartcity.service.FeedbackService;

@RestController
@RequestMapping("/api/feedback")
@CrossOrigin(origins = "*")
public class FeedbackController {

    @Autowired
    private FeedbackService feedbackService;

    private String extractToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new IllegalArgumentException("Missing or invalid Authorization header.");
        }
        return authHeader.substring(7);
    }

    @PostMapping
    public ResponseEntity<?> submit(
            @RequestBody FeedbackRequest request,
            @RequestHeader("Authorization") String authHeader) {
        try {
            return ResponseEntity.ok(feedbackService.submitFeedback(request, extractToken(authHeader)));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{grievanceId}")
    public ResponseEntity<?> byGrievance(
            @PathVariable Long grievanceId,
            @RequestHeader("Authorization") String authHeader) {
        try {
            extractToken(authHeader);
            return ResponseEntity.ok(feedbackService.getByGrievance(grievanceId));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/transparency-score")
    public ResponseEntity<?> transparencyScore(@RequestHeader("Authorization") String authHeader) {
        try {
            extractToken(authHeader);
            return ResponseEntity.ok(Map.of("score", feedbackService.transparencyScore()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
