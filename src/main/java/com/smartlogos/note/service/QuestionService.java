package com.smartlogos.note.service;

import com.smartlogos.note.entity.Question;
import com.smartlogos.note.repository.QuestionRepository;  // 确保这行导入存在
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class QuestionService {

    private final QuestionRepository questionRepository;

    public List<Question> getQuestionsByDocumentId(Long documentId) {
        return questionRepository.findByNoteDocumentId(documentId);
    }

    public List<Question> getQuestionsByNoteId(Long noteId) {
        return questionRepository.findByNoteId(noteId);
    }
}