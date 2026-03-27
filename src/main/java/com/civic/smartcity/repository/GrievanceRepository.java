package com.civic.smartcity.repository;

import com.civic.smartcity.model.Grievance;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface GrievanceRepository extends JpaRepository<Grievance, Long> {
    List<Grievance> findByCitizenUsernameOrderBySubmittedAtDesc(String citizenUsername);
    List<Grievance> findAllByOrderBySubmittedAtDesc();
    List<Grievance> findByStatusOrderBySubmittedAtDesc(String status);
    List<Grievance> findByAssignedOfficerOrderBySubmittedAtDesc(String officer);
    List<Grievance> findByCategoryOrderBySubmittedAtDesc(String category);
    List<Grievance> findByZoneOrderBySubmittedAtDesc(String zone);
    List<Grievance> findBySubmittedAtBetweenOrderBySubmittedAtDesc(LocalDateTime from, LocalDateTime to);
}
