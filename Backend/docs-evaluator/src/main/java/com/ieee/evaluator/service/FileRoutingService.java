package com.ieee.evaluator.service;

import org.springframework.stereotype.Service;
import java.io.IOException;

@Service
public class FileRoutingService {

    private final GoogleDriveService driveService;
    private final String ROOT_FOLDER_ID = "1coTNznsUzG_n7Oztc8EZJ4wpxlssbQ-z";

    public FileRoutingService(GoogleDriveService driveService) {
        this.driveService = driveService;
    }

    /**
     * Routes and renames submissions with smart tags.
     */
    public void processSubmission(String sectionName, String teamCode, String studentName, 
                                  String sourceId, String deliverableType, boolean isLate) {
        try {
            // 1. Organize folders by Section -> Team
            String sectionFolderId = driveService.getOrCreateSubFolder(ROOT_FOLDER_ID, sectionName);
            String teamFolderId = driveService.getOrCreateSubFolder(sectionFolderId, teamCode);

            // 2. Build the Smart Filename
            String latePrefix = isLate ? "[LATE] " : "";
            String targetName = String.format("%s[%s] [%s] %s", 
                                latePrefix, deliverableType, teamCode, studentName);

            // 3. Prevent duplicate copies if the file already exists
            if (!driveService.fileExists(teamFolderId, targetName)) {
                String mimeType = driveService.getFileMimeType(sourceId);
                
                if ("application/vnd.google-apps.folder".equals(mimeType)) {
                    // Deep copy for folder-type submissions
                    String studentFolderId = driveService.getOrCreateSubFolder(teamFolderId, targetName);
                    driveService.copyAllFilesFromFolder(sourceId, studentFolderId);
                } else {
                    // Direct copy for PDFs/DOCX into the 15GB Dummy Account
                    driveService.copyFile(sourceId, teamFolderId, targetName);
                }
                System.out.println("SUCCESS: Routed " + targetName);
            }
        } catch (IOException e) {
            System.err.println("Routing error for " + studentName + ": " + e.getMessage());
        }
    }
}