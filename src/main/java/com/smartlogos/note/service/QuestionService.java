
package com.smartlogos.note.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartlogos.note.entity.Question;
import com.smartlogos.note.repository.QuestionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class QuestionService {

    private final QuestionRepository questionRepository;
    private final ObjectMapper objectMapper;

    public List<Question> getByNoteId(Long noteId) {
        return questionRepository.findByNoteId(noteId);
    }

    public List<String> parseOptions(Question q) {
        try {
            if (q.getOptions() == null) return List.of();
            return objectMapper.readValue(q.getOptions(), new TypeReference<>() {});
        } catch (Exception e) {
            return List.of();
        }
    }
}
