
package com.smartlogos.note.service;

import com.smartlogos.note.entity.Document;
import com.smartlogos.note.repository.DocumentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DocumentService {

    private final DocumentRepository documentRepository;

    public Document get(Long id) {
        return documentRepository.findById(id).orElse(null);
    }

    public List<Document> listByUser(Long userId) {
        return documentRepository.findByUserId(userId);
    }
}
