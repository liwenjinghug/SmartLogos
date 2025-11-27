// service/DocumentService.java
package com.smartlogos.note.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartlogos.note.dto.AIProcessResponse;
import com.smartlogos.note.entity.*;
import com.smartlogos.note.repository.*;
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
    private final NoteRepository noteRepository;
    private final QuestionRepository questionRepository;
    private final FileStorageService fileStorageService;
    private final AIService aiService;
    private final TextExtractionService textExtractionService;
    private final ObjectMapper objectMapper;

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

        processDocumentAsync(savedDocument);

        return savedDocument;
    }

    private void processDocumentAsync(Document document) {
        try {
            document.setStatus(Document.DocumentStatus.PROCESSING);
            documentRepository.save(document);

            String content = textExtractionService.extractText(document);
            log.info("从文档提取文本长度: {}", content.length());

            AIProcessResponse aiResponse = aiService.processContent(content, document.getFileName());

            saveAIResult(document, aiResponse);

            document.setStatus(Document.DocumentStatus.COMPLETED);
            documentRepository.save(document);

            log.info("文档处理完成: {}", document.getId());

        } catch (Exception e) {
            log.error("文档处理失败: {}", document.getId(), e);
            document.setStatus(Document.DocumentStatus.ERROR);
            documentRepository.save(document);
        }
    }

    @Transactional
    public void saveAIResult(Document document, AIProcessResponse aiResponse) {
        Note note = new Note();
        note.setDocument(document);
        note.setSummary(aiResponse.getSummary());
        note.setMindMapJson(aiResponse.getMindMapJson());
        note.setTags(String.join(",", aiResponse.getTags()));

        Note savedNote = noteRepository.save(note);

        if (aiResponse.getQuestions() != null) {
            for (AIProcessResponse.QuestionDTO questionDTO : aiResponse.getQuestions()) {
                Question question = new Question();
                question.setNote(savedNote);
                question.setQuestionText(questionDTO.getQuestionText());
                question.setAnswer(questionDTO.getAnswer());
                question.setQuestionType(Question.QuestionType.valueOf(questionDTO.getQuestionType()));

                if (questionDTO.getOptions() != null && !questionDTO.getOptions().isEmpty()) {
                    try {
                        String optionsJson = objectMapper.writeValueAsString(questionDTO.getOptions());
                        question.setOptions(optionsJson);
                    } catch (Exception e) {
                        log.error("转换选项为JSON失败", e);
                    }
                }

                questionRepository.save(question);
            }
        }
    }

    public Optional<Document> getDocumentByIdAndUser(Long documentId, Long userId) {
        return documentRepository.findByIdAndUserId(documentId, userId);
    }

    public List<Document> getUserDocuments(Long userId) {
        return documentRepository.findByUserIdOrderByUploadTimeDesc(userId);
    }
}