package com.ieee.evaluator.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DriveFile {
    private String id;
    private String name;
    private String mimeType;     
    private String createdTime;  
    private String submittedAt;  
    private String webViewLink;  
}