// service/NoteService.java
package com.smartlogos.note.service;

import com.smartlogos.note.entity.Note;
import com.smartlogos.note.repository.NoteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class NoteService {

    private final NoteRepository noteRepository;

    public Optional<Note> getNoteByDocumentId(Long documentId) {
        return noteRepository.findByDocumentId(documentId);
    }

    public Optional<Note> getNoteById(Long noteId) {
        return noteRepository.findById(noteId);
    }
}