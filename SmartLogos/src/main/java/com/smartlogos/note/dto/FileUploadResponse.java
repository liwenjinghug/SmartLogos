// dto/FileUploadResponse.java
package com.smartlogos.note.dto;

import lombok.Data;

@Data
public class FileUploadResponse {
    private boolean success;
    private String message;
    private Long documentId;
    private String fileName;

    public static FileUploadResponse success(Long documentId, String fileName) {
        FileUploadResponse response = new FileUploadResponse();
        response.setSuccess(true);
        response.setMessage("文件上传成功");
        response.setDocumentId(documentId);
        response.setFileName(fileName);
        return response;
    }

    public static FileUploadResponse error(String message) {
        FileUploadResponse response = new FileUploadResponse();
        response.setSuccess(false);
        response.setMessage(message);
        return response;
    }
}