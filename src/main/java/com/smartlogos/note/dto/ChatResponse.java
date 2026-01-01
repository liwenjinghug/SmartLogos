package com.smartlogos.note.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * AI 问答响应
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatResponse {
    
    private String answer;
}
