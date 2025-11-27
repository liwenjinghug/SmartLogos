// entity/Document.java
package com.smartlogos.note.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "documents")
@Data
public class Document {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String fileName;

    @Column(nullable = false)
    private String filePath;

    private String contentType;
    private Long fileSize;

    @Column(nullable = false)
    private LocalDateTime uploadTime;

    @Enumerated(EnumType.STRING)
    private DocumentStatus status = DocumentStatus.UPLOADED;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @JsonIgnore  // 打破循环引用
    private User user;

    @OneToOne(mappedBy = "document", cascade = CascadeType.ALL)
    @JsonIgnore  // 避免加载关联的Note
    private Note note;

    public enum DocumentStatus {
        UPLOADED, PROCESSING, COMPLETED, ERROR
    }

    @PrePersist
    protected void onCreate() {
        uploadTime = LocalDateTime.now();
    }
}