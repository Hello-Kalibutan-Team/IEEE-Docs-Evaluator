package com.ieee.evaluator.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class StudentTrackerRecord {
    private String studentName; 
    private String section;     
    private String groupCode;   
    private String role; 
}