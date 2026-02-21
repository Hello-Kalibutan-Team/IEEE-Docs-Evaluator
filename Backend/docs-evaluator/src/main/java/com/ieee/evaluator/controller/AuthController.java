package com.ieee.evaluator.controller;

import com.ieee.evaluator.model.StudentTrackerRecord;
import com.ieee.evaluator.service.AuthAllowlistService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173") 
public class AuthController {

    private final AuthAllowlistService allowlistService;

    public AuthController(AuthAllowlistService allowlistService) {
        this.allowlistService = allowlistService;
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verifyGoogleLogin(@RequestBody Map<String, String> payload) {
        try {
            String googleName = payload.get("displayName"); 
            String googleEmail = payload.get("email"); 
            
            StudentTrackerRecord verifiedStudent = allowlistService.verifyUser(googleName, googleEmail);

            if (verifiedStudent != null) {
                return ResponseEntity.ok(verifiedStudent); 
            } else {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Unauthorized: You are not on the Class Allowlist.");
            }
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error connecting to verification server.");
        }
    }
}