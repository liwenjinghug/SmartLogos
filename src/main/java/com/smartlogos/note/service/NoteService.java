
package com.smartlogos.note.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartlogos.note.entity.Note;
import com.smartlogos.note.repository.NoteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NoteService {

    private final NoteRepository noteRepository;
    private final ObjectMapper objectMapper;

    public Note getNote(Long id) {
        return noteRepository.findById(id).orElse(null);
    }

    public List<Note> getNotesByUserId(Long userId) {
        return noteRepository.findByDocumentUserId(userId);
    }

    public List<Note> searchNotes(Long userId, String keyword) {
        return noteRepository.searchByUserIdAndKeyword(userId, keyword);
    }

    public List<String> parseTags(Note note) {
        try {
            return objectMapper.readValue(note.getTags(), new TypeReference<>() {});
        } catch (Exception e) {
            return List.of();
        }
    }
}
