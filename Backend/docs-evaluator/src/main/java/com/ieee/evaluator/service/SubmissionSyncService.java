package com.ieee.evaluator.service;

import com.google.api.services.sheets.v4.Sheets;
import com.google.api.services.sheets.v4.model.ValueRange;
import com.ieee.evaluator.model.DriveFile;
import com.ieee.evaluator.model.DeliverableConfig;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class SubmissionSyncService {

    private final Sheets sheetsService;
    private final GoogleDriveService driveService;
    private final FileRoutingService fileRoutingService;
    private final GoogleSheetsService configLoader;

    @Value("${google.sheets.spreadsheet-id}")
    private String spreadsheetId;

    @Value("${google.sheets.responses-range}")
    private String responsesRange;

    private static final DateTimeFormatter TIMESTAMP_FORMATTER = DateTimeFormatter.ofPattern("M/d/yyyy H:mm:ss");

    public SubmissionSyncService(Sheets sheetsService, GoogleDriveService driveService, 
                                 FileRoutingService fileRoutingService, GoogleSheetsService configLoader) {
        this.sheetsService = sheetsService;
        this.driveService = driveService;
        this.fileRoutingService = fileRoutingService;
        this.configLoader = configLoader;
    }

    public List<DriveFile> getLatestSubmissions() throws IOException {
        // 1. Load Rules
        Map<String, DeliverableConfig> configMap;
        try {
            configMap = configLoader.getDeliverableConfigs();
        } catch (Exception e) {
            throw new IOException("Could not load deliverable rules: " + e.getMessage());
        }

        ValueRange response = sheetsService.spreadsheets().values()
                .get(spreadsheetId, responsesRange)
                .execute();

        List<List<Object>> values = response.getValues();
        List<DriveFile> submissions = new ArrayList<>();

        if (values != null) {
            for (int i = 0; i < values.size(); i++) {
                List<Object> row = values.get(i);
                
                // Ensure we have all 7 columns (A through G)
                if (row.size() >= 7) {
                    String timestampStr = row.get(0).toString(); 
                    String studentName = row.get(2).toString();  
                    String section = row.get(3).toString();      
                    String teamCode = row.get(4).toString();     
                    String deliverableType = row.get(5).toString().trim(); 
                    String url = row.get(6).toString().trim();             

                    String fileId = driveService.extractIdFromUrl(url);
                    
                    if (fileId != null) {
                        try {
                            boolean isLate = false;
                            DeliverableConfig config = configMap.get(deliverableType);
                            
                            if (config != null) {
                                LocalDateTime submissionTime = LocalDateTime.parse(timestampStr, TIMESTAMP_FORMATTER);
                                isLate = submissionTime.isAfter(config.getDeadline());
                            }

                            // Route to Teacher Drive
                            try {
                                fileRoutingService.processSubmission(section, teamCode, studentName, fileId, deliverableType, isLate);
                            } catch (Exception e) {
                                if (e.getMessage().contains("insufficientFilePermissions")) {
                                    System.err.println("⚠️ PERMISSION DENIED: " + studentName + " (View-Only link)");
                                }
                            }

                            DriveFile file = driveService.getFileById(fileId);
                            String statusPrefix = isLate ? "[LATE] " : "";
                            file.setName(statusPrefix + "[" + deliverableType + "] " + teamCode + " | " + studentName);
                            file.setSubmittedAt(timestampStr);

                            submissions.add(file);
                            
                        } catch (Exception e) {
                            System.err.println("Processing error for " + studentName + ": " + e.getMessage());
                        }
                    } else {
                        System.err.println("DEBUG: Could not find valid File ID for " + studentName + " in Column G");
                    }
                }
            }
        }
        return submissions;
    }
}