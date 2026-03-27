package com.civic.smartcity.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.civic.smartcity.model.Feedback;

public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    List<Feedback> findByGrievanceId(Long grievanceId);
    List<Feedback> findByDepartment(String department);
}
