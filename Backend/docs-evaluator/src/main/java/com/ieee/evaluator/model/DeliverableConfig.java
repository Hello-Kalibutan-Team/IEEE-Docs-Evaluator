package com.ieee.evaluator.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DeliverableConfig {
    private String fileTag;      // Matches "SRS", "SDD", etc.
    private LocalDateTime deadline; // The parsed date from your config tab
}