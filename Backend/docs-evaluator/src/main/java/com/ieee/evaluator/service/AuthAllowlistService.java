package com.ieee.evaluator.service;

import com.ieee.evaluator.model.StudentTrackerRecord;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AuthAllowlistService {

    private final GoogleSheetsService sheetsService;

    public AuthAllowlistService(GoogleSheetsService sheetsService) {
        this.sheetsService = sheetsService;
    }

    public StudentTrackerRecord verifyUser(String googleEmail) throws Exception {
        
        if (googleEmail == null || googleEmail.trim().isEmpty()) {
            return null;
        }

        String normalizedEmail = googleEmail.trim();

        // 1. VIP CHECK: Check the "Teachers" sheet
        String teachersRange = "Teachers!A2:B";
        List<List<Object>> teacherValues = sheetsService.getSheetData(teachersRange);
        
        if (teacherValues != null && !teacherValues.isEmpty()) {
            for (List<Object> row : teacherValues) {
                if (row == null || row.isEmpty()) continue;
                
                String sheetEmail = row.size() > 0 ? row.get(0).toString().trim() : "";
                
                if (sheetEmail.equalsIgnoreCase(normalizedEmail)) {
                    // Strictly use the name from the Sheet (Column B)
                    String teacherName = row.size() > 1 ? row.get(1).toString().trim() : "Unknown Teacher";
                    
                    return new StudentTrackerRecord(
                            teacherName,
                            "N/A", 
                            "N/A", 
                            "TEACHER"
                    );
                }
            }
        }

        // 2. STANDARD CHECK: Check the "Students" sheet
        String studentsRange = "Students!A2:D";
        List<List<Object>> studentValues = sheetsService.getSheetData(studentsRange);
        
        if (studentValues != null && !studentValues.isEmpty()) {
            for (List<Object> row : studentValues) {
                if (row == null || row.isEmpty()) continue;
                
                String sheetEmail = row.size() > 0 ? row.get(0).toString().trim() : "";
                
                if (sheetEmail.equalsIgnoreCase(normalizedEmail)) {
                    // Strictly use the name from the Sheet (Column B)
                    String studentName = row.size() > 1 ? row.get(1).toString().trim() : "Unknown Student";
                    String section = row.size() > 2 ? row.get(2).toString().trim() : "";
                    String teamCode = row.size() > 3 ? row.get(3).toString().trim() : "";
                    
                    return new StudentTrackerRecord(
                            studentName,
                            section,
                            teamCode,
                            "STUDENT"
                    );
                }
            }
        }
        
        // 3. Access Denied: Email not found in either sheet
        return null; 
    }
}