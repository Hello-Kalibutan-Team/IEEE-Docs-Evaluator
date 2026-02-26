package com.ieee.evaluator.service;

import com.ieee.evaluator.model.EvaluationHistory;
import com.ieee.evaluator.repository.EvaluationHistoryRepository;
import org.apache.tika.Tika;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class AiService {

    @Value("${openai.api.key}")
    private String openAiKey;

    private final GoogleDriveService driveService;
    private final EvaluationHistoryRepository historyRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    public AiService(GoogleDriveService driveService, EvaluationHistoryRepository historyRepository) {
        this.driveService = driveService;
        this.historyRepository = historyRepository;
    }

    public String analyzeDocument(String fileId, String fileName, String aiModel) throws Exception {
        byte[] fileBytes = driveService.downloadFile(fileId);

        Tika tika = new Tika();
        String extractedText;
        try (InputStream stream = new ByteArrayInputStream(fileBytes)) {
            extractedText = tika.parseToString(stream);
        }

        String result;
        if ("openai".equalsIgnoreCase(aiModel)) {
            result = callOpenAi(extractedText);
        } else {
            result = "Model not supported yet.";
        }

        // Save to Supabase
        EvaluationHistory history = new EvaluationHistory();
        history.setFileId(fileId);
        history.setFileName(fileName);
        history.setModelUsed(aiModel);
        history.setEvaluationResult(result);
        history.setEvaluatedAt(LocalDateTime.now());
        historyRepository.save(history);

        return result;
    }

    @SuppressWarnings("unchecked")
    private String callOpenAi(String text) {
        String url = "https://api.openai.com/v1/chat/completions";
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(openAiKey);

        String prompt = "You are an IT professor evaluating a software engineering document. Summarize its strengths and weaknesses briefly based on standard IEEE guidelines:\n\n" + text;

        Map<String, Object> body = Map.of(
            "model", "gpt-4o-mini",
            "messages", List.of(Map.of("role", "user", "content", prompt)),
            "max_tokens", 500
        );

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
        ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);

        if (response.getBody() == null || !response.getBody().containsKey("choices")) {
            return "Failed to parse OpenAI response.";
        }

        List<Map<String, Object>> choices = (List<Map<String, Object>>) response.getBody().get("choices");
        Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
        return (String) message.get("content");
    }
}