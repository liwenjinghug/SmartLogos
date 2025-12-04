// src/main/java/com/smartlogos/note/entity/Note.java
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

    /** AI 生成的摘要 */
    @Lob
    private String summary;

    /** 思维导图 Markdown 源码 */
    @Lob
    @Column(name = "mind_map_content")
    private String mindMapContent;

    /** 旧版 JSON 思维导图（如果将来用得到可以继续保留，否则也可以删除） */
    @Lob
    @Column(name = "mind_map_json")
    private String mindMapJson;

    /** 标签 JSON 字符串（例如：["#计算机网络","#TCP"]） */
    @Lob
    private String tags;

    /** 生成语言 "zh"/"en" 等 */
    private String lang;

    /** AI 处理完成时间 */
    private LocalDateTime processTime;

    /** 一对一关联的 Document */
    @OneToOne
    @JoinColumn(name = "document_id")
    @JsonIgnore
    private Document document;

    /** 一对多关联的问题 */
    @OneToMany(mappedBy = "note", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Question> questions = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        if (processTime == null) {
            processTime = LocalDateTime.now();
        }
    }
}
