package com.ieee.evaluator.model;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class DriveFile {
    private String id;
    private String name;
    private String type;
    private String createdTime;
}