package com.ieee.evaluator.service;

import com.google.api.services.sheets.v4.Sheets;
import com.google.api.services.sheets.v4.model.ValueRange;
import com.ieee.evaluator.model.StudentTrackerRecord;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Service
public class AuthAllowlistService {

    private final Sheets sheetsService;

    @Value("${google.sheets.spreadsheet-id}")
    private String spreadsheetId;

    @Value("${google.sheets.range}")
    private String range;

    @Value("${app.evaluator.teacher-emails}")
    private String teacherEmails;

    public AuthAllowlistService(Sheets sheetsService) {
        this.sheetsService = sheetsService;
    }

    private List<StudentTrackerRecord> fetchAllStudents() throws IOException {
        ValueRange response = sheetsService.spreadsheets().values()
                .get(spreadsheetId, range)
                .execute();

        List<List<Object>> values = response.getValues();
        List<StudentTrackerRecord> students = new ArrayList<>();

        if (values != null && !values.isEmpty()) {
            for (List<Object> row : values) {
                if (row.size() >= 3) {
                    students.add(new StudentTrackerRecord(
                            row.get(0).toString(), 
                            row.get(1).toString(), 
                            row.get(2).toString(),
                            null // Role is null initially
                    ));
                }
            }
        }
        return students;
    }

    public StudentTrackerRecord verifyUser(String googleDisplayName, String googleEmail) throws IOException {
        
        // 1. VIP CHECK: Are they on the Teacher list?
        if (googleEmail != null) {
            String[] vips = teacherEmails.split(",");
            for (String vip : vips) {
                if (vip.trim().equalsIgnoreCase(googleEmail.trim())) {
                    return new StudentTrackerRecord(
                            googleDisplayName,
                            "N/A", // Teachers don't have a section
                            "N/A", // Teachers don't have a group code
                            "TEACHER"
                    );
                }
            }
        }

        // 2. STANDARD CHECK: If not a teacher, check the Google Sheet for students
        List<StudentTrackerRecord> authorizedStudents = fetchAllStudents();
        String normalizedInputName = googleDisplayName.toUpperCase().trim();

        for (StudentTrackerRecord student : authorizedStudents) {
            String normalizedSheetName = student.getStudentName().toUpperCase().replace(",", "");
            
            String[] nameParts = normalizedInputName.split(" ");
            boolean matches = true;
            for (String part : nameParts) {
                if (!normalizedSheetName.contains(part)) {
                    matches = false;
                    break;
                }
            }

            if (matches) {
                student.setRole("STUDENT"); // Assign the Student role
                return student; 
            }
        }
        
        return null; // Access Denied
    }
}