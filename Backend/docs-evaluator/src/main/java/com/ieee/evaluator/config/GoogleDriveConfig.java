package com.ieee.evaluator.config;

import com.google.api.client.googleapis.auth.oauth2.GoogleCredential;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.services.drive.Drive;
import com.google.api.services.drive.DriveScopes;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Collections;

@Configuration
public class GoogleDriveConfig {

    @Bean
    public Drive driveService() throws IOException, GeneralSecurityException {
        GoogleCredential credential = GoogleCredential.fromStream(
                new ClassPathResource("google-sheets-credentials.json").getInputStream()
        ).createScoped(Collections.singleton(DriveScopes.DRIVE)); // Access full Drive CRUD

        return new Drive.Builder(
                GoogleNetHttpTransport.newTrustedTransport(),
                GsonFactory.getDefaultInstance(),
                credential)
                .setApplicationName("IEEE Docs Evaluator")
                .build();
    }
}