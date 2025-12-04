// entity/Note.java
package com.smartlogos.note.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "notes")
@Data
public class Note {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String summary;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String mindMapJson;

    private String tags;

    private LocalDateTime processTime;

    @OneToOne
    @JoinColumn(name = "document_id")
    @JsonIgnore  // 打破循环引用
    private Document document;

    @OneToMany(mappedBy = "note", cascade = CascadeType.ALL)
    @JsonIgnore  // 避免加载关联的问题
    private List<Question> questions = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        processTime = LocalDateTime.now();
    }
}