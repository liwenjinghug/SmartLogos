
package com.smartlogos.note.dto;

import lombok.Data;

@Data
public class ChatRequest {
    /** 用户提问的问题 */
    private String question;

    /** 必须带 noteId 用于找到笔记上下文 */
    private Long noteId;

    /** 目标语言 */
    private String targetLang = "zh";
}
