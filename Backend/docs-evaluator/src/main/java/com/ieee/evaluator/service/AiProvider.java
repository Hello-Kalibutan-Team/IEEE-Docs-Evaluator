package com.ieee.evaluator.service;

public interface AiProvider {
    // The identifier used by the frontend (e.g., "openai", "gemini")
    String getProviderName(); 
    
    // The actual logic to send text to the AI and get the result
    String analyze(String text) throws Exception; 
}