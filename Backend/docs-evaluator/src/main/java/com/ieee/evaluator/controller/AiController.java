package com.ieee.evaluator.controller;

import com.ieee.evaluator.repository.EvaluationHistoryRepository;
import com.ieee.evaluator.service.AiService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "http://localhost:5173")
public class AiController {

    private final AiService aiService;
    private final EvaluationHistoryRepository historyRepository;

    public AiController(AiService aiService, EvaluationHistoryRepository historyRepository) {
        this.aiService = aiService;
        this.historyRepository = historyRepository;
    }

    @PostMapping("/analyze")
    public ResponseEntity<?> analyzeFile(@RequestBody Map<String, String> payload) {
        try {
            String fileId = payload.get("fileId");
            String fileName = payload.get("fileName");
            String model = payload.get("model");
            
            if (fileId == null || model == null || fileName == null) {
                return ResponseEntity.badRequest().body("Missing fileId, fileName, or model");
            }
            
            String result = aiService.analyzeDocument(fileId, fileName, model);
            return ResponseEntity.ok(Map.of("analysis", result));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Analysis failed: " + e.getMessage()));
        }
    }

    @GetMapping("/history")
    public ResponseEntity<?> getHistory() {
        try {
            return ResponseEntity.ok(historyRepository.findAllByOrderByEvaluatedAtDesc());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to retrieve history.");
        }
    }
}