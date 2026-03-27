package com.civic.smartcity.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import com.civic.smartcity.dto.FeedbackRequest;
import com.civic.smartcity.dto.FeedbackResponse;
import com.civic.smartcity.model.Feedback;
import com.civic.smartcity.model.Grievance;
import com.civic.smartcity.repository.FeedbackRepository;
import com.civic.smartcity.repository.GrievanceRepository;
import com.civic.smartcity.security.JwtUtil;

@Service
public class FeedbackService {

    @Autowired
    private FeedbackRepository feedbackRepository;

    @Autowired
    private GrievanceRepository grievanceRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired(required = false)
    private SimpMessagingTemplate messagingTemplate;

    public FeedbackResponse submitFeedback(FeedbackRequest request, String token) {
        String username = jwtUtil.getUsernameFromToken(token);
        Grievance grievance = grievanceRepository.findById(request.getGrievanceId())
            .orElseThrow(() -> new IllegalArgumentException("Grievance not found."));

        if (!username.equals(grievance.getCitizenUsername())) {
            throw new IllegalArgumentException("Only the grievance owner can submit feedback.");
        }

        if (!"RESOLVED".equals(grievance.getStatus()) && !"CLOSED".equals(grievance.getStatus())) {
            throw new IllegalArgumentException("Feedback is allowed only for resolved/closed grievances.");
        }

        Feedback feedback = new Feedback();
        feedback.setGrievanceId(grievance.getId());
        feedback.setCitizenUsername(username);
        feedback.setRating(request.getRating());
        feedback.setComment(request.getComment());
        feedback.setSentiment(analyzeSentiment(request.getComment()));
        feedback.setReopenRequested(Boolean.TRUE.equals(request.getReopenRequested()));
        feedback.setDepartment(grievance.getDepartment());
        feedback.setCreatedAt(LocalDateTime.now());

        feedbackRepository.save(feedback);

        if (Boolean.TRUE.equals(request.getReopenRequested())) {
            grievance.setStatus("IN_PROGRESS");
            grievance.setReopened(true);
            grievance.setUpdatedAt(LocalDateTime.now());
            grievanceRepository.save(grievance);
        }

        FeedbackResponse response = toResponse(feedback);
        if (messagingTemplate != null) {
            messagingTemplate.convertAndSend("/topic/feedback", Map.of("type", "FEEDBACK_SUBMITTED", "payload", response));
        }
        return response;
    }

    public List<FeedbackResponse> getByGrievance(Long grievanceId) {
        return feedbackRepository.findByGrievanceId(grievanceId).stream().map(this::toResponse).toList();
    }

    public Double transparencyScore() {
        List<Feedback> all = feedbackRepository.findAll();
        if (all.isEmpty()) {
            return 0.0;
        }
        double avg = all.stream().map(Feedback::getRating).filter(v -> v != null).mapToInt(Integer::intValue).average().orElse(0.0);
        return Math.round((avg / 5.0) * 10000.0) / 100.0;
    }

    private String analyzeSentiment(String text) {
        if (text == null || text.isBlank()) {
            return "NEUTRAL";
        }

        String t = text.toLowerCase();
        int positive = 0;
        int negative = 0;

        for (String w : new String[] {"good", "great", "quick", "helpful", "resolved", "excellent", "thanks"}) {
            if (t.contains(w)) {
                positive++;
            }
        }

        for (String w : new String[] {"bad", "slow", "late", "poor", "not resolved", "worse", "angry"}) {
            if (t.contains(w)) {
                negative++;
            }
        }

        if (positive > negative) {
            return "POSITIVE";
        }
        if (negative > positive) {
            return "NEGATIVE";
        }
        return "NEUTRAL";
    }

    private FeedbackResponse toResponse(Feedback feedback) {
        return new FeedbackResponse(
            feedback.getId(),
            feedback.getGrievanceId(),
            feedback.getCitizenUsername(),
            feedback.getRating(),
            feedback.getComment(),
            feedback.getSentiment(),
            feedback.getReopenRequested(),
            feedback.getDepartment(),
            feedback.getCreatedAt()
        );
    }
}
