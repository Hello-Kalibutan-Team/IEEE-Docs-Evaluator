package com.ieee.evaluator.service;

import com.google.api.services.sheets.v4.Sheets;
import com.google.api.services.sheets.v4.model.ValueRange;
import com.ieee.evaluator.model.DriveFile;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Service
public class SubmissionSyncService {

    private final Sheets sheetsService;
    private final GoogleDriveService driveService;

    @Value("${google.sheets.spreadsheet-id}")
    private String spreadsheetId;

    @Value("${google.sheets.responses-range}")
    private String responsesRange;

    public SubmissionSyncService(Sheets sheetsService, GoogleDriveService driveService) {
        this.sheetsService = sheetsService;
        this.driveService = driveService;
    }

    public List<DriveFile> getLatestSubmissions() throws IOException {
        ValueRange response = sheetsService.spreadsheets().values()
                .get(spreadsheetId, responsesRange)
                .execute();

        List<List<Object>> values = response.getValues();
        List<DriveFile> submissions = new ArrayList<>();

        if (values != null) {
            for (List<Object> row : values) {
                // Assuming Google Form: Timestamp(0), Name(1), Email(2), URL(3)
                if (row.size() >= 4) {
                    String url = row.get(3).toString();
                    String fileId = driveService.extractIdFromUrl(url);
                    if (fileId != null) {
                        try {
                            // Fetch live metadata for the file link provided
                            submissions.add(driveService.getFileById(fileId));
                        } catch (Exception e) {
                            // Skip if file is private or deleted
                        }
                    }
                }
            }
        }
        return submissions;
    }
}