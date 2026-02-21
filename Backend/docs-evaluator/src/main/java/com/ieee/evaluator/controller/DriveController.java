package com.ieee.evaluator.controller;

import com.ieee.evaluator.model.DriveFile;
import com.ieee.evaluator.service.GoogleDriveService;
import com.ieee.evaluator.service.SubmissionSyncService; // Added
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/drive")
@CrossOrigin(origins = "http://localhost:5173") 
public class DriveController {

    private final GoogleDriveService driveService;
    private final SubmissionSyncService syncService; // Added

    @Value("${google.drive.folder-id}")
    private String rootFolderId;

    // Updated constructor to include syncService
    public DriveController(GoogleDriveService driveService, SubmissionSyncService syncService) {
        this.driveService = driveService;
        this.syncService = syncService;
    }

    /**
     * READ: Fetches files from a SPECIFIC folder ID.
     * This allows the "drill-down" navigation in your Teacher Dashboard.
     */
    @GetMapping("/files/{folderId}")
    public ResponseEntity<?> getFiles(@PathVariable String folderId) {
        try {
            String targetId = "root".equalsIgnoreCase(folderId) ? rootFolderId : folderId;
            List<DriveFile> files = driveService.listFiles(targetId);
            return ResponseEntity.ok(files);
        } catch (Exception e) {
            e.printStackTrace(); 
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to retrieve Drive files: " + e.getMessage());
        }
    }

    /**
     * AUTO-SYNC: Fetches new submissions from the Google Form responses sheet.
     * This is called in the background by React every 30 seconds.
     */
    @GetMapping("/sync-submissions")
    public ResponseEntity<?> syncSubmissions() {
        try {
            // Service reads the Google Sheet and extracts file metadata from URLs
            List<DriveFile> latestSubmissions = syncService.getLatestSubmissions();
            return ResponseEntity.ok(latestSubmissions);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Sync failed: " + e.getMessage());
        }
    }

    /**
     * DELETE: Removes a specific file or folder.
     */
    @DeleteMapping("/files/{fileId}")
    public ResponseEntity<?> deleteFile(@PathVariable String fileId) {
        try {
            driveService.deleteFile(fileId);
            return ResponseEntity.ok("File deleted successfully.");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to delete file.");
        }
    }

    /**
     * CREATE: Creates a folder inside a specific parent.
     */
    @PostMapping("/folders")
    public ResponseEntity<?> createFolder(@RequestBody Map<String, String> payload) {
        try {
            String folderName = payload.get("name");
            String parentIdFromReact = payload.get("parentId");
            
            String parentId = "root".equalsIgnoreCase(parentIdFromReact) ? rootFolderId : parentIdFromReact;
            
            DriveFile newFolder = driveService.createFolder(folderName, parentId);
            return ResponseEntity.ok(newFolder);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Creation failed.");
        }
    }

    /**
     * SEARCH: Scans the drive based on name.
     */
    @GetMapping("/search")
    public ResponseEntity<?> searchFiles(@RequestParam String q) {
        try {
            // Note: GoogleDriveService.searchFiles now takes rootFolderId for scoping
            List<DriveFile> results = driveService.searchFiles(q);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Search failed");
        }
    }
}