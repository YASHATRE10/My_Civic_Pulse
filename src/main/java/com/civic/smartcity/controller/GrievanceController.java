package com.civic.smartcity.controller;

import java.util.List;
import java.util.Map;
import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.civic.smartcity.dto.AdminAssignRequest;
import com.civic.smartcity.dto.GrievanceRequest;
import com.civic.smartcity.dto.GrievanceResponse;
import com.civic.smartcity.dto.OfficerUpdateRequest;
import com.civic.smartcity.service.GrievanceService;

@RestController
@RequestMapping("/api/grievances")
@CrossOrigin(origins = "*")
public class GrievanceController {

    @Autowired
    private GrievanceService grievanceService;

    private String extractToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer "))
            throw new IllegalArgumentException("Missing or invalid Authorization header.");
        return authHeader.substring(7);
    }

    // ── POST /api/grievances/submit ───────────────────────────────────────────
    @PostMapping("/submit")
    public ResponseEntity<?> submit(
            @RequestBody GrievanceRequest request,
            @RequestHeader("Authorization") String authHeader) {
        try {
            GrievanceResponse response = grievanceService.submit(request, extractToken(authHeader));
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ── GET /api/grievances/my ────────────────────────────────────────────────
    @GetMapping("/my")
    public ResponseEntity<?> getMyGrievances(
            @RequestHeader("Authorization") String authHeader) {
        try {
            List<GrievanceResponse> list = grievanceService.getMyGrievances(extractToken(authHeader));
            return ResponseEntity.ok(list);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", e.getMessage()));
        }
    }

    // ── GET /api/grievances/all (Admin/Officer) ───────────────────────────────
    @GetMapping("/all")
    public ResponseEntity<?> getAll(
            @RequestHeader("Authorization") String authHeader) {
        try {
            extractToken(authHeader);
            List<GrievanceResponse> list = grievanceService.getAll();
            return ResponseEntity.ok(list);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", e.getMessage()));
        }
    }

    // ── GET /api/grievances/filter?status=PENDING ─────────────────────────────
    @GetMapping("/filter")
    public ResponseEntity<?> filterByStatus(
            @RequestParam String status,
            @RequestHeader("Authorization") String authHeader) {
        try {
            extractToken(authHeader);
            return ResponseEntity.ok(grievanceService.getByStatus(status));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ── GET /api/grievances/{id} ──────────────────────────────────────────────
    @GetMapping("/{id}")
    public ResponseEntity<?> getById(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader) {
        try {
            return ResponseEntity.ok(grievanceService.getById(id, extractToken(authHeader)));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(
            @PathVariable Long id,
            @RequestBody GrievanceRequest request,
            @RequestHeader("Authorization") String authHeader) {
        try {
            return ResponseEntity.ok(grievanceService.updateGrievance(id, request, extractToken(authHeader)));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader) {
        try {
            grievanceService.deleteGrievance(id, extractToken(authHeader));
            return ResponseEntity.ok(Map.of("message", "Deleted"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ── POST /api/grievances/admin/assign  (ADMIN only) ───────────────────────
    @PostMapping("/admin/assign")
    public ResponseEntity<?> adminAssign(
            @RequestBody AdminAssignRequest request,
            @RequestHeader("Authorization") String authHeader) {
        try {
            GrievanceResponse response = grievanceService.adminAssign(request, extractToken(authHeader));
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/admin/auto-assign")
    public ResponseEntity<?> autoAssign(
            @RequestParam(required = false) String category,
            @RequestHeader("Authorization") String authHeader) {
        try {
            extractToken(authHeader);
            return ResponseEntity.ok(grievanceService.autoAssignSuggestion(category));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/kanban")
    public ResponseEntity<?> kanban(
            @RequestHeader("Authorization") String authHeader) {
        try {
            extractToken(authHeader);
            return ResponseEntity.ok(grievanceService.getKanban());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/officer/assigned")
    public ResponseEntity<?> assignedForOfficer(
            @RequestHeader("Authorization") String authHeader) {
        try {
            return ResponseEntity.ok(grievanceService.getAssignedForOfficer(extractToken(authHeader)));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}/officer-update")
    public ResponseEntity<?> officerUpdate(
            @PathVariable Long id,
            @RequestBody OfficerUpdateRequest request,
            @RequestHeader("Authorization") String authHeader) {
        try {
            return ResponseEntity.ok(grievanceService.officerUpdate(id, request, extractToken(authHeader)));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ── PUT /api/grievances/{id}/status  (ADMIN/OFFICER) ─────────────────────
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            @RequestHeader("Authorization") String authHeader) {
        try {
            String status  = body.get("status");
            String remarks = body.get("remarks");
            GrievanceResponse response = grievanceService.updateStatus(id, status, remarks, extractToken(authHeader));
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/analytics")
    public ResponseEntity<?> analytics(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String zone) {
        try {
            extractToken(authHeader);
            LocalDateTime fromDt = from == null || from.isBlank() ? null : LocalDateTime.parse(from);
            LocalDateTime toDt = to == null || to.isBlank() ? null : LocalDateTime.parse(to);
            return ResponseEntity.ok(grievanceService.analytics(fromDt, toDt, category, zone));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
