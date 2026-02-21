package com.ieee.evaluator.config;

import com.google.api.client.googleapis.auth.oauth2.GoogleCredential;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.services.sheets.v4.Sheets;
import com.google.api.services.sheets.v4.SheetsScopes;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Collections;

@Configuration
public class GoogleSheetsConfig {

    @Bean
    public Sheets sheetsService() throws IOException, GeneralSecurityException {
        // Load the secured JSON credentials from the resources folder
        GoogleCredential credential = GoogleCredential.fromStream(
                new ClassPathResource("google-sheets-credentials.json").getInputStream()
        ).createScoped(Collections.singleton(SheetsScopes.SPREADSHEETS_READONLY));

        return new Sheets.Builder(
                GoogleNetHttpTransport.newTrustedTransport(),
                GsonFactory.getDefaultInstance(),
                credential)
                .setApplicationName("IEEE Docs Evaluator")
                .build();
    }
}