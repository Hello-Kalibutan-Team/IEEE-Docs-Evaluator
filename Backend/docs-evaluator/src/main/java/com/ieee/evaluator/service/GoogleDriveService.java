package com.ieee.evaluator.service;

import com.google.api.services.drive.Drive;
import com.google.api.services.drive.model.File;
import com.google.api.services.drive.model.FileList;
import com.ieee.evaluator.model.DriveFile;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.Collections;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
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
                .setFields("files(id, name, mimeType, createdTime, webViewLink)")
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
                .setFields("id, name, mimeType, createdTime, webViewLink")
                .execute();

        return mapToModel(folder);
    }

    /**
     * Moves a file to the trash. 
     * This is safe because it works for files owned by students (editors) 
     * and files owned by the teacher (owners).
     */
    public void deleteFile(String fileId) throws IOException {
        File trashedFile = new File();
        trashedFile.setTrashed(true);

        // Using update instead of delete avoids the 403 Permission error
        driveService.files().update(fileId, trashedFile).execute();
    }

    public List<DriveFile> searchFiles(String queryText) throws IOException {
        String query = "name contains '" + queryText + "' and trashed = false";
        FileList result = driveService.files().list()
                .setQ(query)
                .setFields("files(id, name, mimeType, createdTime, webViewLink)")
                .execute();

        return result.getFiles().stream()
                .map(this::mapToModel)
                .collect(Collectors.toList());
    }

    public DriveFile getFileById(String fileId) throws IOException {
        File file = driveService.files().get(fileId)
                .setFields("id, name, mimeType, createdTime, webViewLink")
                .execute();
        return mapToModel(file);
    }

    public String extractIdFromUrl(String url) {
        if (url == null || url.isEmpty()) return null;
        Pattern pattern = Pattern.compile("(?:/d/|folders/|id=)([a-zA-Z0-9_-]{25,})");
        Matcher matcher = pattern.matcher(url);
        
        if (matcher.find()) {
            return matcher.group(1);
        }
        return null;
    }

    private DriveFile mapToModel(File f) {
        DriveFile driveFile = new DriveFile();
        driveFile.setId(f.getId());
        driveFile.setName(f.getName());
        driveFile.setMimeType(f.getMimeType());
        driveFile.setWebViewLink(f.getWebViewLink());
        
        if (f.getCreatedTime() != null) {
            driveFile.setCreatedTime(f.getCreatedTime().toString());
        }
        return driveFile;
    }

    // --- SUBMISSION ROUTING HELPERS ---

    public boolean fileExists(String parentId, String fileName) throws IOException {
        String query = "name = '" + fileName + "' and '" + parentId + "' in parents and trashed = false";
        FileList result = driveService.files().list()
                .setQ(query)
                .setFields("files(id)")
                .execute();
        return result.getFiles() != null && !result.getFiles().isEmpty();
    }

    public String getOrCreateSubFolder(String parentId, String folderName) throws IOException {
        String query = "name = '" + folderName + "' and '" + parentId + "' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false";
        FileList result = driveService.files().list()
                .setQ(query)
                .setFields("files(id)")
                .execute();

        if (result.getFiles() != null && !result.getFiles().isEmpty()) {
            return result.getFiles().get(0).getId();
        }

        File metadata = new File();
        metadata.setName(folderName);
        metadata.setMimeType("application/vnd.google-apps.folder");
        metadata.setParents(Collections.singletonList(parentId));

        return driveService.files().create(metadata).setFields("id").execute().getId();
    }

    public void copyFile(String fileId, String targetFolderId, String newName) throws IOException {
        File copiedFile = new File();
        copiedFile.setName(newName);
        copiedFile.setParents(Collections.singletonList(targetFolderId));

        driveService.files().copy(fileId, copiedFile).execute();
    }

    public String getFileMimeType(String fileId) throws IOException {
        return driveService.files().get(fileId).setFields("mimeType").execute().getMimeType();
    }

    /**
     * Lists all files in a source folder and replicates them into the target folder.
     */
        public void copyAllFilesFromFolder(String sourceFolderId, String targetFolderId) throws IOException {
        // We must ensure 'supportsAllDrives' is true if students are using school/shared drives
        com.google.api.services.drive.model.FileList result = driveService.files().list()
                .setQ("'" + sourceFolderId + "' in parents and trashed = false")
                .setSpaces("drive")
                .setFields("nextPageToken, files(id, name, mimeType)")
                .execute();

        List<com.google.api.services.drive.model.File> files = result.getFiles();
        
        if (files == null || files.isEmpty()) {
            System.out.println("DEBUG: No files found inside student folder " + sourceFolderId);
            return;
        }

        int count = 0;
        for (com.google.api.services.drive.model.File file : files) {
            // Skip sub-folders for now to keep it simple, or recurse if needed
            if (!file.getMimeType().equals("application/vnd.google-apps.folder")) {
                copyFile(file.getId(), targetFolderId, file.getName());
                count++;
            }
        }
        System.out.println("SUCCESS: Replicated " + count + " files into Teacher Drive.");
    }
}