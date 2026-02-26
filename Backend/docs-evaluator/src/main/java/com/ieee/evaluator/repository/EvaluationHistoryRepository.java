package com.ieee.evaluator.repository;

import com.ieee.evaluator.model.EvaluationHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EvaluationHistoryRepository extends JpaRepository<EvaluationHistory, Long> {
    List<EvaluationHistory> findAllByOrderByEvaluatedAtDesc();
}