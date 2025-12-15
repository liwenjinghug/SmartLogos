package com.smartlogos.note.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 文档列表 DTO - 前端需要的文档摘要信息
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DocumentDTO {
    
    private Long id;
    private String filename;
    private String upload_time;
    private String summary;
    private String status;
}
