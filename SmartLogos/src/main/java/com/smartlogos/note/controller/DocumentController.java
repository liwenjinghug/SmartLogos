package com.smartlogos.note.controller;

import com.smartlogos.note.dto.FileUploadResponse;
import com.smartlogos.note.entity.Document;
import com.smartlogos.note.entity.Question;
import com.smartlogos.note.service.DocumentService;
import com.smartlogos.note.service.QuestionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService documentService;
    private final QuestionService questionService;

    @PostMapping("/upload")
    public ResponseEntity<FileUploadResponse> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam("userId") Long userId) {

        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(FileUploadResponse.error("文件为空"));
            }

            Document document = documentService.uploadDocument(file, userId);
            return ResponseEntity.ok(FileUploadResponse.success(
                    document.getId(), document.getFileName()));

        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(FileUploadResponse.error("处理失败: " + e.getMessage()));
        }
    }

    @GetMapping("/{documentId}/questions")
    public ResponseEntity<List<Question>> getDocumentQuestions(
            @PathVariable Long documentId,
            @RequestParam Long userId) {

        try {
            documentService.getDocumentByIdAndUser(documentId, userId)
                    .orElseThrow(() -> new RuntimeException("文档不存在或无权访问"));

            List<Question> questions = questionService.getQuestionsByDocumentId(documentId);
            return ResponseEntity.ok(questions);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Document>> getUserDocuments(@PathVariable Long userId) {
        try {
            List<Document> documents = documentService.getUserDocuments(userId);
            return ResponseEntity.ok(documents);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(null);
        }
    }
}