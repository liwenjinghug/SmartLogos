
// src/main/java/com/smartlogos/note/service/FileStorageService.java
package com.smartlogos.note.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.UUID;

/**
 * 负责将上传的文件保存到本地磁盘
 */
@Service
@Slf4j
public class FileStorageService {

    @Value("${app.upload-dir}")
    private String uploadDir;

    /**
     * 保存文件，并返回随机生成的文件名（不包含路径）
     */
    public String storeFile(MultipartFile file) {
        try {
            if (file == null || file.isEmpty()) {
                throw new IllegalArgumentException("上传文件为空");
            }

            // 确保目录存在
            Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
            Files.createDirectories(uploadPath);

            String originalName = file.getOriginalFilename();
            String ext = getFileExtension(originalName);
            String fileName = UUID.randomUUID().toString().replace("-", "") + ext;

            Path targetLocation = uploadPath.resolve(fileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            log.info("文件保存成功: {}", targetLocation);
            return fileName;
        } catch (IOException e) {
            log.error("保存文件失败", e);
            throw new RuntimeException("保存文件失败: " + e.getMessage(), e);
        }
    }

    private String getFileExtension(String fileName) {
        if (fileName == null || !fileName.contains(".")) {
            return "";
        }
        return fileName.substring(fileName.lastIndexOf("."));
    }

    /**
     * 根据保存时返回的 fileName，拼出完整路径
     */
    public Path loadFile(String fileName) {
        return Paths.get(uploadDir).toAbsolutePath().normalize().resolve(fileName);
    }
}
