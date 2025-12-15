// service/DocumentService.java
package com.smartlogos.note.service;

import com.smartlogos.note.entity.Document;
import com.smartlogos.note.entity.User;
import com.smartlogos.note.repository.DocumentRepository;
import com.smartlogos.note.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;

    @Transactional
    public Document uploadDocument(MultipartFile file, Long userId) throws IOException {
        String storedFileName = fileStorageService.storeFile(file);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));

        Document document = new Document();
        document.setFileName(file.getOriginalFilename());
        document.setFilePath(storedFileName);
        document.setContentType(file.getContentType());
        document.setFileSize(file.getSize());
        document.setUser(user);
        document.setStatus(Document.DocumentStatus.UPLOADED);

        Document savedDocument = documentRepository.save(document);

        // 说明：AI 解析已迁移到独立 AI 服务；本服务仅负责文件存储与元数据入库。
        return savedDocument;
    }

    public Optional<Document> getDocumentByIdAndUser(Long documentId, Long userId) {
        return documentRepository.findByIdAndUserId(documentId, userId);
    }

    public Optional<Document> getDocumentById(Long documentId) {
        return documentRepository.findById(documentId);
    }

    public Document saveDocument(Document document) {
        return documentRepository.save(document);
    }

    public List<Document> getUserDocuments(Long userId) {
        return documentRepository.findByUserIdOrderByUploadTimeDesc(userId);
    }
}