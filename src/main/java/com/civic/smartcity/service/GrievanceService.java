package com.civic.smartcity.service;

import com.civic.smartcity.dto.AnalyticsResponse;
import com.civic.smartcity.dto.AutoAssignSuggestionResponse;
import com.civic.smartcity.dto.AdminAssignRequest;
import com.civic.smartcity.dto.GrievanceRequest;
import com.civic.smartcity.dto.GrievanceResponse;
import com.civic.smartcity.dto.OfficerUpdateRequest;
import com.civic.smartcity.model.Grievance;
import com.civic.smartcity.model.Feedback;
import com.civic.smartcity.repository.FeedbackRepository;
import com.civic.smartcity.repository.GrievanceRepository;
import com.civic.smartcity.security.JwtUtil;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.IntStream;
import java.util.stream.Collectors;

@Service
public class GrievanceService {

    @Autowired
    private GrievanceRepository grievanceRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private FeedbackRepository feedbackRepository;

    @Autowired(required = false)
    private SimpMessagingTemplate messagingTemplate;

    private static final List<String> VALID_CATEGORIES = List.of(
        "WATER", "STREET_LIGHT", "ROAD", "SANITATION", "DRAINAGE", "PARK", "ELECTRICITY", "OTHER"
    );
    private static final List<String> VALID_PRIORITIES = List.of("LOW", "MEDIUM", "HIGH", "CRITICAL");
    private static final List<String> VALID_STATUSES   = List.of("PENDING", "IN_PROGRESS", "RESOLVED", "CLOSED");

    private void publishUpdate(String type, Object payload) {
        if (messagingTemplate == null) {
            return;
        }
        messagingTemplate.convertAndSend("/topic/grievances", Map.of("type", type, "payload", payload));
    }

    private String suggestCategoryFromText(String text) {
        if (text == null) return "OTHER";
        String d = text.toLowerCase();
        if (d.contains("water") || d.contains("pipeline") || d.contains("leak")) return "WATER";
        if (d.contains("light") || d.contains("lamp") || d.contains("street light")) return "STREET_LIGHT";
        if (d.contains("road") || d.contains("pothole") || d.contains("traffic")) return "ROAD";
        if (d.contains("garbage") || d.contains("waste") || d.contains("clean")) return "SANITATION";
        if (d.contains("drain") || d.contains("sewer") || d.contains("flood")) return "DRAINAGE";
        if (d.contains("park") || d.contains("tree")) return "PARK";
        if (d.contains("electric") || d.contains("power") || d.contains("current")) return "ELECTRICITY";
        return "OTHER";
    }

    private String suggestPriority(String text) {
        if (text == null) return "MEDIUM";
        String d = text.toLowerCase();
        if (d.contains("urgent") || d.contains("accident") || d.contains("danger") || d.contains("fire")) return "CRITICAL";
        if (d.contains("hospital") || d.contains("school") || d.contains("severe")) return "HIGH";
        if (d.contains("minor") || d.contains("routine")) return "LOW";
        return "MEDIUM";
    }

    private String suggestDepartment(String category) {
        return switch (category) {
            case "WATER" -> "Water Supply";
            case "ROAD" -> "Road Works";
            case "STREET_LIGHT", "ELECTRICITY" -> "Electrical";
            case "SANITATION" -> "Sanitation";
            case "DRAINAGE" -> "Drainage";
            case "PARK" -> "Parks";
            default -> "General";
        };
    }

    private String deriveZone(Double lat, String location) {
        if (lat != null) {
            return lat >= 20.0 ? "NORTH" : "SOUTH";
        }
        if (location == null || location.isBlank()) {
            return "CENTRAL";
        }
        char c = Character.toUpperCase(location.charAt(0));
        if (c >= 'A' && c <= 'H') return "NORTH";
        if (c >= 'I' && c <= 'P') return "CENTRAL";
        return "SOUTH";
    }

    private String suggestOfficerByLoad(String category) {
        String[] pool = switch (category) {
            case "WATER", "DRAINAGE" -> new String[] {"officer_water_1", "officer_water_2"};
            case "ROAD" -> new String[] {"officer_road_1", "officer_road_2"};
            case "STREET_LIGHT", "ELECTRICITY" -> new String[] {"officer_elec_1", "officer_elec_2"};
            case "SANITATION" -> new String[] {"officer_sani_1", "officer_sani_2"};
            default -> new String[] {"officer_general_1", "officer_general_2"};
        };

        Map<String, Long> activeByOfficer = grievanceRepository.findAllByOrderBySubmittedAtDesc().stream()
            .filter(g -> g.getAssignedOfficer() != null)
            .filter(g -> !"RESOLVED".equals(g.getStatus()) && !"CLOSED".equals(g.getStatus()))
            .collect(Collectors.groupingBy(Grievance::getAssignedOfficer, Collectors.counting()));

        return IntStream.range(0, pool.length)
            .mapToObj(i -> pool[i])
            .min((a, b) -> Long.compare(activeByOfficer.getOrDefault(a, 0L), activeByOfficer.getOrDefault(b, 0L)))
            .orElse(pool[0]);
    }

    public GrievanceResponse submit(GrievanceRequest request, String token) {
        String username = jwtUtil.getUsernameFromToken(token);
        String category = request.getCategory() != null && !request.getCategory().isBlank()
            ? request.getCategory().toUpperCase()
            : suggestCategoryFromText(request.getTitle() + " " + request.getDescription());
        if (!VALID_CATEGORIES.contains(category)) throw new IllegalArgumentException("Invalid category.");

        Grievance g = new Grievance();
        g.setTitle(request.getTitle());
        g.setDescription(request.getDescription());
        g.setCategory(category);
        g.setAiSuggestedCategory(suggestCategoryFromText(request.getTitle() + " " + request.getDescription()));
        g.setStatus("PENDING");
        g.setLocation(request.getLocation());
        g.setLatitude(request.getLatitude());
        g.setLongitude(request.getLongitude());
        g.setZone(request.getZone() == null || request.getZone().isBlank() ? deriveZone(request.getLatitude(), request.getLocation()) : request.getZone().toUpperCase());
        g.setImageBase64(request.getImageBase64());
        g.setCitizenUsername(username);
        g.setPriority(suggestPriority(request.getTitle() + " " + request.getDescription()));
        g.setDepartment(suggestDepartment(category));
        g.setReopened(false);
        g.setSubmittedAt(LocalDateTime.now());
        grievanceRepository.save(g);
        GrievanceResponse response = toResponse(g);
        publishUpdate("GRIEVANCE_CREATED", response);
        return response;
    }

    public List<GrievanceResponse> getMyGrievances(String token) {
        String username = jwtUtil.getUsernameFromToken(token);
        return grievanceRepository.findByCitizenUsernameOrderBySubmittedAtDesc(username)
            .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public GrievanceResponse getById(Long id, String token) {
        String username = jwtUtil.getUsernameFromToken(token);
        String role     = jwtUtil.getRoleFromToken(token);
        Grievance g = grievanceRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Grievance not found."));
        if (role.equals("CITIZEN") && !g.getCitizenUsername().equals(username))
            throw new IllegalArgumentException("Access denied.");
        return toResponse(g);
    }

    public GrievanceResponse updateGrievance(Long id, GrievanceRequest request, String token) {
        String username = jwtUtil.getUsernameFromToken(token);
        String role = jwtUtil.getRoleFromToken(token);

        Grievance g = grievanceRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Grievance not found."));

        if (!"ADMIN".equals(role) && !username.equals(g.getCitizenUsername())) {
            throw new IllegalArgumentException("Access denied.");
        }

        if (request.getTitle() != null && !request.getTitle().isBlank()) g.setTitle(request.getTitle());
        if (request.getDescription() != null && !request.getDescription().isBlank()) g.setDescription(request.getDescription());
        if (request.getCategory() != null && !request.getCategory().isBlank()) {
            String c = request.getCategory().toUpperCase();
            if (!VALID_CATEGORIES.contains(c)) throw new IllegalArgumentException("Invalid category.");
            g.setCategory(c);
        }
        if (request.getLocation() != null) g.setLocation(request.getLocation());
        if (request.getLatitude() != null) g.setLatitude(request.getLatitude());
        if (request.getLongitude() != null) g.setLongitude(request.getLongitude());
        if (request.getZone() != null) g.setZone(request.getZone().toUpperCase());
        if (request.getImageBase64() != null) g.setImageBase64(request.getImageBase64());
        g.setUpdatedAt(LocalDateTime.now());

        grievanceRepository.save(g);
        GrievanceResponse response = toResponse(g);
        publishUpdate("GRIEVANCE_UPDATED", response);
        return response;
    }

    public void deleteGrievance(Long id, String token) {
        String username = jwtUtil.getUsernameFromToken(token);
        String role = jwtUtil.getRoleFromToken(token);

        Grievance g = grievanceRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Grievance not found."));

        if (!"ADMIN".equals(role) && !username.equals(g.getCitizenUsername())) {
            throw new IllegalArgumentException("Access denied.");
        }

        grievanceRepository.delete(g);
        publishUpdate("GRIEVANCE_DELETED", Map.of("id", id));
    }

    public List<GrievanceResponse> getAll() {
        return grievanceRepository.findAllByOrderBySubmittedAtDesc()
            .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<GrievanceResponse> getByStatus(String status) {
        return grievanceRepository.findByStatusOrderBySubmittedAtDesc(status.toUpperCase())
            .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<GrievanceResponse> getByOfficer(String officer) {
        return grievanceRepository.findByAssignedOfficerOrderBySubmittedAtDesc(officer)
            .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<GrievanceResponse> getAssignedForOfficer(String token) {
        String username = jwtUtil.getUsernameFromToken(token);
        return getByOfficer(username);
    }

    public AutoAssignSuggestionResponse autoAssignSuggestion(String category) {
        String normalized = category == null ? "OTHER" : category.toUpperCase();
        if (!VALID_CATEGORIES.contains(normalized)) {
            normalized = "OTHER";
        }
        String officer = suggestOfficerByLoad(normalized);
        String priority = normalized.equals("ROAD") ? "HIGH" : "MEDIUM";
        return new AutoAssignSuggestionResponse(
            officer,
            suggestDepartment(normalized),
            priority,
            "Based on category routing and active workload balancing"
        );
    }

    public Map<String, List<GrievanceResponse>> getKanban() {
        Map<String, List<GrievanceResponse>> board = new LinkedHashMap<>();
        board.put("PENDING", getByStatus("PENDING"));
        board.put("IN_PROGRESS", getByStatus("IN_PROGRESS"));
        board.put("RESOLVED", getByStatus("RESOLVED"));
        board.put("CLOSED", getByStatus("CLOSED"));
        return board;
    }

    public GrievanceResponse adminAssign(AdminAssignRequest request, String token) {
        String role = jwtUtil.getRoleFromToken(token);
        if (!"ADMIN".equals(role)) throw new IllegalArgumentException("Only admins can assign grievances.");

        Grievance g = grievanceRepository.findById(request.getGrievanceId())
            .orElseThrow(() -> new IllegalArgumentException("Grievance not found."));

        if (request.getAssignedOfficer() != null) g.setAssignedOfficer(request.getAssignedOfficer());
        if (request.getDepartment()      != null) g.setDepartment(request.getDepartment());
        if (request.getPriority()        != null) {
            String p = request.getPriority().toUpperCase();
            if (!VALID_PRIORITIES.contains(p)) throw new IllegalArgumentException("Invalid priority.");
            g.setPriority(p);
        }
        if (request.getDeadline() != null) g.setDeadline(request.getDeadline());
        if (request.getStatus()   != null) {
            String s = request.getStatus().toUpperCase();
            if (!VALID_STATUSES.contains(s)) throw new IllegalArgumentException("Invalid status.");
            g.setStatus(s);
        }
        if (request.getRemarks()  != null) g.setRemarks(request.getRemarks());

        if (request.getAssignedOfficer() != null && "PENDING".equals(g.getStatus()))
            g.setStatus("IN_PROGRESS");

        g.setUpdatedAt(LocalDateTime.now());
        grievanceRepository.save(g);
        GrievanceResponse response = toResponse(g);
        publishUpdate("GRIEVANCE_ASSIGNED", response);
        return response;
    }

    public GrievanceResponse updateStatus(Long id, String status, String remarks, String token) {
        String role = jwtUtil.getRoleFromToken(token);
        if (!"ADMIN".equals(role) && !"OFFICER".equals(role)) throw new IllegalArgumentException("Unauthorized.");
        String s = status.toUpperCase();
        if (!VALID_STATUSES.contains(s)) throw new IllegalArgumentException("Invalid status.");
        Grievance g = grievanceRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Grievance not found."));
        g.setStatus(s);
        if (remarks != null) g.setRemarks(remarks);
        if ("RESOLVED".equals(s)) g.setResolvedAt(LocalDateTime.now());
        g.setUpdatedAt(LocalDateTime.now());
        grievanceRepository.save(g);
        GrievanceResponse response = toResponse(g);
        publishUpdate("GRIEVANCE_STATUS", response);
        return response;
    }

    public GrievanceResponse officerUpdate(Long id, OfficerUpdateRequest request, String token) {
        String role = jwtUtil.getRoleFromToken(token);
        String officer = jwtUtil.getUsernameFromToken(token);
        if (!"OFFICER".equals(role) && !"ADMIN".equals(role)) throw new IllegalArgumentException("Unauthorized.");

        Grievance g = grievanceRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Grievance not found."));

        if ("OFFICER".equals(role) && g.getAssignedOfficer() != null && !officer.equals(g.getAssignedOfficer())) {
            throw new IllegalArgumentException("You can only update grievances assigned to you.");
        }

        if (request.getStatus() != null) {
            String status = request.getStatus().toUpperCase();
            if (!VALID_STATUSES.contains(status)) throw new IllegalArgumentException("Invalid status.");
            g.setStatus(status);
            if ("RESOLVED".equals(status)) {
                g.setResolvedAt(LocalDateTime.now());
            }
        }
        if (request.getRemarks() != null) g.setRemarks(request.getRemarks());
        if (request.getOfficerComment() != null) g.setOfficerComment(request.getOfficerComment());
        if (request.getResolutionImageBase64() != null) g.setResolutionImageBase64(request.getResolutionImageBase64());
        g.setUpdatedAt(LocalDateTime.now());
        grievanceRepository.save(g);
        GrievanceResponse response = toResponse(g);
        publishUpdate("OFFICER_UPDATE", response);
        return response;
    }

    public AnalyticsResponse analytics(LocalDateTime from, LocalDateTime to, String category, String zone) {
        List<Grievance> filtered = grievanceRepository.findAllByOrderBySubmittedAtDesc().stream()
            .filter(g -> from == null || !g.getSubmittedAt().isBefore(from))
            .filter(g -> to == null || !g.getSubmittedAt().isAfter(to))
            .filter(g -> category == null || category.isBlank() || category.equalsIgnoreCase(g.getCategory()))
            .filter(g -> zone == null || zone.isBlank() || zone.equalsIgnoreCase(g.getZone()))
            .toList();

        Map<String, Long> byCategory = filtered.stream().collect(Collectors.groupingBy(Grievance::getCategory, LinkedHashMap::new, Collectors.counting()));
        Map<String, Long> byStatus = filtered.stream().collect(Collectors.groupingBy(Grievance::getStatus, LinkedHashMap::new, Collectors.counting()));
        Map<String, Long> byZone = filtered.stream().collect(Collectors.groupingBy(g -> g.getZone() == null ? "UNKNOWN" : g.getZone(), LinkedHashMap::new, Collectors.counting()));

        Map<String, Long> sla = Map.of(
            "withinSla", filtered.stream().filter(g -> g.getDeadline() == null || g.getResolvedAt() == null || !g.getResolvedAt().isAfter(g.getDeadline())).count(),
            "breached", filtered.stream().filter(g -> g.getDeadline() != null && ((g.getResolvedAt() != null && g.getResolvedAt().isAfter(g.getDeadline())) || (g.getResolvedAt() == null && LocalDateTime.now().isAfter(g.getDeadline())))).count()
        );

        Map<String, Long> predictedBreach = filtered.stream()
            .filter(g -> !"RESOLVED".equals(g.getStatus()) && !"CLOSED".equals(g.getStatus()))
            .collect(Collectors.groupingBy(g -> {
                String p = g.getPriority() == null ? "MEDIUM" : g.getPriority();
                return ("HIGH".equals(p) || "CRITICAL".equals(p)) ? "likely" : "lowRisk";
            }, Collectors.counting()));

        List<Map<String, Object>> trend = filtered.stream()
            .collect(Collectors.groupingBy(g -> g.getSubmittedAt().toLocalDate().toString(), LinkedHashMap::new, Collectors.counting()))
            .entrySet().stream().map(e -> {
                Map<String, Object> item = new LinkedHashMap<>();
                item.put("date", e.getKey());
                item.put("count", e.getValue());
                return item;
            }).toList();

        double transparencyScore = calculateTransparencyScore();

        return new AnalyticsResponse(byCategory, byStatus, byZone, trend, sla, predictedBreach, transparencyScore);
    }

    private double calculateTransparencyScore() {
        List<Feedback> all = feedbackRepository.findAll();
        if (all.isEmpty()) return 0.0;
        double avg = all.stream().map(Feedback::getRating).filter(Objects::nonNull).mapToInt(Integer::intValue).average().orElse(0.0);
        return Math.round((avg / 5.0) * 10000.0) / 100.0;
    }

    private GrievanceResponse toResponse(Grievance g) {
        return new GrievanceResponse(
            g.getId(), g.getTitle(), g.getDescription(),
            g.getCategory(), g.getStatus(), g.getLocation(),
            g.getImageBase64(), g.getCitizenUsername(),
            g.getSubmittedAt(), g.getUpdatedAt(), g.getResolvedAt(),
            g.getAssignedOfficer(), g.getRemarks(), g.getOfficerComment(), g.getResolutionImageBase64(),
            g.getLatitude(), g.getLongitude(), g.getZone(), g.getReopened(), g.getAiSuggestedCategory(),
            g.getPriority(), g.getDeadline(), g.getDepartment()
        );
    }
}
