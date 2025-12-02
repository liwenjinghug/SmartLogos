package com.smartlogos.note.repository;

import com.smartlogos.note.entity.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface DocumentRepository extends JpaRepository<Document, Long> {
    List<Document> findByUserIdOrderByUploadTimeDesc(Long userId);
    Optional<Document> findByIdAndUserId(Long id, Long userId);
    List<Document> findByUserId(Long userId);//前端能按用户查看文件历史

}