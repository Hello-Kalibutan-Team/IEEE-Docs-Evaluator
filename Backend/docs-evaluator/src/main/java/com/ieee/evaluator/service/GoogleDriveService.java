package com.ieee.evaluator.service;

import com.google.api.services.drive.Drive;
import com.google.api.services.drive.model.File;
import com.google.api.services.drive.model.FileList;
import com.ieee.evaluator.model.DriveFile;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class GoogleDriveService {

    private final Drive driveService;

    public GoogleDriveService(Drive driveService) {
        this.driveService = driveService;
    }

    public List<DriveFile> listFiles(String folderId) throws IOException {
        String query = "'" + folderId + "' in parents and trashed = false";
        FileList result = driveService.files().list()
                .setQ(query)
                .setFields("files(id, name, mimeType, createdTime)")
                .execute();

        return result.getFiles().stream()
                .map(this::mapToModel)
                .collect(Collectors.toList());
    }

    public DriveFile createFolder(String folderName, String parentId) throws IOException {
        File fileMetadata = new File();
        fileMetadata.setName(folderName);
        fileMetadata.setMimeType("application/vnd.google-apps.folder");
        fileMetadata.setParents(Collections.singletonList(parentId));

        File folder = driveService.files().create(fileMetadata)
                .setFields("id, name, mimeType, createdTime")
                .execute();

        return mapToModel(folder);
    }

    public void deleteFile(String fileId) throws IOException {
        driveService.files().delete(fileId).execute();
    }

    public List<DriveFile> searchFiles(String queryText) throws IOException {
        String query = "name contains '" + queryText + "' and trashed = false";
        FileList result = driveService.files().list()
                .setQ(query)
                .setFields("files(id, name, mimeType, createdTime)")
                .execute();

        return result.getFiles().stream()
                .map(this::mapToModel)
                .collect(Collectors.toList());
    }

    // NEW: Logic to handle individual files found via Google Form URLs
    public DriveFile getFileById(String fileId) throws IOException {
        File file = driveService.files().get(fileId)
                .setFields("id, name, mimeType, createdTime")
                .execute();
        return mapToModel(file);
    }

    // NEW: Robust ID extraction from various Google Drive URL formats
    public String extractIdFromUrl(String url) {
        if (url == null) return null;
        try {
            if (url.contains("/d/")) {
                return url.split("/d/")[1].split("/")[0];
            } else if (url.contains("id=")) {
                return url.split("id=")[1].split("&")[0];
            }
        } catch (Exception e) {
            return null;
        }
        return null;
    }

    private DriveFile mapToModel(File f) {
        return new DriveFile(
                f.getId(),
                f.getName(),
                f.getMimeType().contains("folder") ? "Folder" : "File",
                f.getCreatedTime().toString()
        );
    }
}