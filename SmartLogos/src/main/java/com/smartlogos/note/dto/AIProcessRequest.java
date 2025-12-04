// dto/AIProcessRequest.java
package com.smartlogos.note.dto;

import lombok.Data;

@Data
public class AIProcessRequest {
    private String content;
    private String fileName;
    private String contentType;
}