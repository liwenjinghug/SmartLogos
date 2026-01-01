package com.smartlogos.note.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * AI 问答请求
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatRequest {
    
    private String question;
    private String context;  // 笔记内容或笔记 ID
}
