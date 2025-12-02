/*
 Navicat Premium Dump SQL

 Source Server         : ry-vue
 Source Server Type    : MySQL
 Source Server Version : 80042 (8.0.42)
 Source Host           : localhost:3306
 Source Schema         : smartlogos

 Target Server Type    : MySQL
 Target Server Version : 80042 (8.0.42)
 File Encoding         : 65001

 Date: 03/12/2025 02:32:04
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for documents
-- ----------------------------
DROP TABLE IF EXISTS `documents`;
CREATE TABLE `documents`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '文档ID，主键',
  `file_name` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '原始文件名',
  `file_path` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '存储路径',
  `content_type` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '文件类型（pdf/ppt/docx等）',
  `file_size` bigint NULL DEFAULT NULL COMMENT '文件大小（字节）',
  `upload_time` datetime NOT NULL COMMENT '上传时间',
  `status` enum('UPLOADED','PROCESSING','COMPLETED','ERROR') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'UPLOADED' COMMENT '处理状态',
  `user_id` bigint NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_user_id`(`user_id` ASC) USING BTREE,
  INDEX `idx_upload_time`(`upload_time` ASC) USING BTREE,
  INDEX `idx_status`(`status` ASC) USING BTREE,
  CONSTRAINT `documents_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 100 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '文档表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of documents
-- ----------------------------
INSERT INTO `documents` VALUES (1, '计算机网络基础.pdf', 'uploads/network_basic_001.pdf', 'application/pdf', 2048576, '2025-11-26 23:20:24', 'COMPLETED', 1);
INSERT INTO `documents` VALUES (2, 'TCP协议详解.docx', 'uploads/tcp_protocol_001.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 1536000, '2025-11-25 23:20:24', 'COMPLETED', 1);
INSERT INTO `documents` VALUES (3, 'HTTP协议学习笔记.txt', 'uploads/http_notes_001.txt', 'text/plain', 102400, '2025-11-24 23:20:24', 'PROCESSING', 1);
INSERT INTO `documents` VALUES (4, 'Java编程思想.pdf', 'uploads/java_thinking_002.pdf', 'application/pdf', 3097152, '2025-11-26 23:20:24', 'COMPLETED', 2);
INSERT INTO `documents` VALUES (5, 'Spring框架指南.pptx', 'uploads/spring_guide_002.pptx', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 2097152, '2025-11-26 22:20:24', 'UPLOADED', 2);
INSERT INTO `documents` VALUES (6, '人工智能导论.pdf', 'uploads/ai_intro_003.pdf', 'application/pdf', 4194304, '2025-11-23 23:20:24', 'COMPLETED', 3);
INSERT INTO `documents` VALUES (7, '机器学习基础.doc', 'uploads/ml_basic_003.doc', 'application/msword', 1572864, '2025-11-21 23:20:24', 'COMPLETED', 3);
INSERT INTO `documents` VALUES (8, '深度学习论文.pdf', 'uploads/dl_paper_003.pdf', 'application/pdf', 5242880, '2025-11-26 23:20:24', 'ERROR', 3);
INSERT INTO `documents` VALUES (9, '数学分析笔记.pdf', 'uploads/math_analysis_004.pdf', 'application/pdf', 1048576, '2025-11-19 23:20:24', 'COMPLETED', 4);
INSERT INTO `documents` VALUES (10, '物理实验报告.docx', 'uploads/physics_lab_004.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 786432, '2025-11-24 23:20:24', 'COMPLETED', 4);
INSERT INTO `documents` VALUES (11, '教学大纲.pdf', 'uploads/syllabus_005.pdf', 'application/pdf', 512000, '2025-11-26 23:20:24', 'COMPLETED', 5);
INSERT INTO `documents` VALUES (12, '课程讲义.pptx', 'uploads/lecture_notes_005.pptx', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 1572864, '2025-11-25 23:20:24', 'PROCESSING', 5);
INSERT INTO `documents` VALUES (13, 'test_document_10.pdf', 'uploads/test_10.pdf', 'application/pdf', 4914423, '2025-11-07 23:21:10', 'PROCESSING', 3);
INSERT INTO `documents` VALUES (14, 'test_document_9.pdf', 'uploads/test_9.pdf', 'application/pdf', 1872843, '2025-11-11 23:21:10', 'UPLOADED', 1);
INSERT INTO `documents` VALUES (15, 'test_document_8.pdf', 'uploads/test_8.pdf', 'application/pdf', 3541571, '2025-11-14 23:21:10', 'PROCESSING', 2);
INSERT INTO `documents` VALUES (16, 'test_document_7.pdf', 'uploads/test_7.pdf', 'application/pdf', 4578405, '2025-11-10 23:21:10', 'PROCESSING', 2);
INSERT INTO `documents` VALUES (17, 'test_document_6.pdf', 'uploads/test_6.pdf', 'application/pdf', 4445787, '2025-11-17 23:21:10', 'UPLOADED', 2);
INSERT INTO `documents` VALUES (18, 'test_document_5.pdf', 'uploads/test_5.pdf', 'application/pdf', 869985, '2025-11-06 23:21:10', 'COMPLETED', 1);
INSERT INTO `documents` VALUES (19, 'test_document_4.pdf', 'uploads/test_4.pdf', 'application/pdf', 3348093, '2025-10-28 23:21:10', 'ERROR', 1);
INSERT INTO `documents` VALUES (20, 'test_document_3.pdf', 'uploads/test_3.pdf', 'application/pdf', 408716, '2025-11-18 23:21:10', 'UPLOADED', 1);
INSERT INTO `documents` VALUES (21, 'test_document_2.pdf', 'uploads/test_2.pdf', 'application/pdf', 3446025, '2025-11-22 23:21:10', 'UPLOADED', 5);
INSERT INTO `documents` VALUES (22, 'test_document_1.pdf', 'uploads/test_1.pdf', 'application/pdf', 3927415, '2025-10-28 23:21:10', 'PROCESSING', 1);
INSERT INTO `documents` VALUES (23, 'test_document_20.pdf', 'uploads/test_20.pdf', 'application/pdf', 2178095, '2025-10-30 23:21:10', 'PROCESSING', 4);
INSERT INTO `documents` VALUES (24, 'test_document_19.pdf', 'uploads/test_19.pdf', 'application/pdf', 229281, '2025-11-19 23:21:10', 'UPLOADED', 1);
INSERT INTO `documents` VALUES (25, 'test_document_18.pdf', 'uploads/test_18.pdf', 'application/pdf', 1197460, '2025-11-06 23:21:10', 'COMPLETED', 2);
INSERT INTO `documents` VALUES (26, 'test_document_17.pdf', 'uploads/test_17.pdf', 'application/pdf', 340404, '2025-11-15 23:21:10', 'ERROR', 1);
INSERT INTO `documents` VALUES (27, 'test_document_16.pdf', 'uploads/test_16.pdf', 'application/pdf', 3452467, '2025-11-20 23:21:10', 'PROCESSING', 1);
INSERT INTO `documents` VALUES (28, 'test_document_15.pdf', 'uploads/test_15.pdf', 'application/pdf', 3959764, '2025-11-08 23:21:10', 'PROCESSING', 3);
INSERT INTO `documents` VALUES (29, 'test_document_14.pdf', 'uploads/test_14.pdf', 'application/pdf', 3603510, '2025-11-04 23:21:10', 'PROCESSING', 2);
INSERT INTO `documents` VALUES (30, 'test_document_13.pdf', 'uploads/test_13.pdf', 'application/pdf', 4856067, '2025-10-30 23:21:10', 'PROCESSING', 1);
INSERT INTO `documents` VALUES (31, 'test_document_12.pdf', 'uploads/test_12.pdf', 'application/pdf', 3946141, '2025-11-13 23:21:10', 'ERROR', 3);
INSERT INTO `documents` VALUES (32, 'test_document_11.pdf', 'uploads/test_11.pdf', 'application/pdf', 3078827, '2025-11-12 23:21:10', 'COMPLETED', 1);
INSERT INTO `documents` VALUES (33, 'test_document_30.pdf', 'uploads/test_30.pdf', 'application/pdf', 4274111, '2025-11-08 23:21:10', 'PROCESSING', 5);
INSERT INTO `documents` VALUES (34, 'test_document_29.pdf', 'uploads/test_29.pdf', 'application/pdf', 4565023, '2025-11-12 23:21:10', 'PROCESSING', 4);
INSERT INTO `documents` VALUES (35, 'test_document_28.pdf', 'uploads/test_28.pdf', 'application/pdf', 1701083, '2025-11-04 23:21:10', 'PROCESSING', 5);
INSERT INTO `documents` VALUES (36, 'test_document_27.pdf', 'uploads/test_27.pdf', 'application/pdf', 1698194, '2025-11-25 23:21:10', 'PROCESSING', 1);
INSERT INTO `documents` VALUES (37, 'test_document_26.pdf', 'uploads/test_26.pdf', 'application/pdf', 3374215, '2025-10-30 23:21:10', 'COMPLETED', 2);
INSERT INTO `documents` VALUES (38, 'test_document_25.pdf', 'uploads/test_25.pdf', 'application/pdf', 936873, '2025-11-21 23:21:10', 'COMPLETED', 5);
INSERT INTO `documents` VALUES (39, 'test_document_24.pdf', 'uploads/test_24.pdf', 'application/pdf', 3996029, '2025-10-29 23:21:10', 'UPLOADED', 2);
INSERT INTO `documents` VALUES (40, 'test_document_23.pdf', 'uploads/test_23.pdf', 'application/pdf', 4223703, '2025-11-23 23:21:10', 'UPLOADED', 4);
INSERT INTO `documents` VALUES (41, 'test_document_22.pdf', 'uploads/test_22.pdf', 'application/pdf', 3920903, '2025-11-10 23:21:10', 'PROCESSING', 1);
INSERT INTO `documents` VALUES (42, 'test_document_21.pdf', 'uploads/test_21.pdf', 'application/pdf', 3914792, '2025-11-19 23:21:10', 'ERROR', 1);
INSERT INTO `documents` VALUES (43, 'test_document_40.pdf', 'uploads/test_40.pdf', 'application/pdf', 4235264, '2025-11-06 23:21:10', 'ERROR', 2);
INSERT INTO `documents` VALUES (44, 'test_document_39.pdf', 'uploads/test_39.pdf', 'application/pdf', 4497384, '2025-11-11 23:21:10', 'ERROR', 2);
INSERT INTO `documents` VALUES (45, 'test_document_38.pdf', 'uploads/test_38.pdf', 'application/pdf', 3446370, '2025-11-15 23:21:10', 'ERROR', 3);
INSERT INTO `documents` VALUES (46, 'test_document_37.pdf', 'uploads/test_37.pdf', 'application/pdf', 1717122, '2025-11-15 23:21:10', 'ERROR', 3);
INSERT INTO `documents` VALUES (47, 'test_document_36.pdf', 'uploads/test_36.pdf', 'application/pdf', 3717048, '2025-11-23 23:21:10', 'PROCESSING', 5);
INSERT INTO `documents` VALUES (48, 'test_document_35.pdf', 'uploads/test_35.pdf', 'application/pdf', 4082027, '2025-11-21 23:21:10', 'COMPLETED', 5);
INSERT INTO `documents` VALUES (49, 'test_document_34.pdf', 'uploads/test_34.pdf', 'application/pdf', 1886863, '2025-11-25 23:21:10', 'PROCESSING', 5);
INSERT INTO `documents` VALUES (50, 'test_document_33.pdf', 'uploads/test_33.pdf', 'application/pdf', 294861, '2025-11-17 23:21:10', 'UPLOADED', 4);
INSERT INTO `documents` VALUES (51, 'test_document_32.pdf', 'uploads/test_32.pdf', 'application/pdf', 1624810, '2025-11-09 23:21:10', 'UPLOADED', 1);
INSERT INTO `documents` VALUES (52, 'test_document_31.pdf', 'uploads/test_31.pdf', 'application/pdf', 4493474, '2025-11-24 23:21:10', 'UPLOADED', 1);
INSERT INTO `documents` VALUES (53, 'test_document_50.pdf', 'uploads/test_50.pdf', 'application/pdf', 4506385, '2025-11-23 23:21:10', 'ERROR', 3);
INSERT INTO `documents` VALUES (54, 'test_document_49.pdf', 'uploads/test_49.pdf', 'application/pdf', 2936630, '2025-11-16 23:21:10', 'COMPLETED', 5);
INSERT INTO `documents` VALUES (55, 'test_document_48.pdf', 'uploads/test_48.pdf', 'application/pdf', 4249134, '2025-11-12 23:21:10', 'ERROR', 5);
INSERT INTO `documents` VALUES (56, 'test_document_47.pdf', 'uploads/test_47.pdf', 'application/pdf', 1530800, '2025-11-12 23:21:10', 'UPLOADED', 3);
INSERT INTO `documents` VALUES (57, 'test_document_46.pdf', 'uploads/test_46.pdf', 'application/pdf', 1577651, '2025-11-20 23:21:10', 'UPLOADED', 2);
INSERT INTO `documents` VALUES (58, 'test_document_45.pdf', 'uploads/test_45.pdf', 'application/pdf', 4222870, '2025-11-16 23:21:10', 'PROCESSING', 1);
INSERT INTO `documents` VALUES (59, 'test_document_44.pdf', 'uploads/test_44.pdf', 'application/pdf', 1462653, '2025-11-17 23:21:10', 'PROCESSING', 1);
INSERT INTO `documents` VALUES (60, 'test_document_43.pdf', 'uploads/test_43.pdf', 'application/pdf', 3157101, '2025-11-05 23:21:10', 'PROCESSING', 5);
INSERT INTO `documents` VALUES (61, 'test_document_42.pdf', 'uploads/test_42.pdf', 'application/pdf', 3200407, '2025-11-15 23:21:10', 'UPLOADED', 1);
INSERT INTO `documents` VALUES (62, 'test_document_41.pdf', 'uploads/test_41.pdf', 'application/pdf', 3909364, '2025-11-06 23:21:10', 'UPLOADED', 4);
INSERT INTO `documents` VALUES (76, 'test_upload.txt', 'a45249c5-dd31-4e58-ba48-84f545f4e4d0.txt', 'text/plain', 169, '2025-11-26 16:35:47', 'COMPLETED', 1);
INSERT INTO `documents` VALUES (77, 'test_upload.txt', 'D:\\ruangon\\note\\uploads\\34ea3b4d987b4bf3b9bb94e1a39c6411.txt', 'text/plain', 169, '2025-12-02 16:19:17', 'PROCESSING', NULL);
INSERT INTO `documents` VALUES (78, 'test.txt', 'D:\\ruangon\\note\\uploads\\41df27c81c4f4e41bcdb5c55d3d39727.txt', 'text/plain', 139, '2025-12-02 16:51:59', 'PROCESSING', 1);
INSERT INTO `documents` VALUES (79, 'test.txt', 'D:\\ruangon\\note\\uploads\\89fd9b99db834bb6919bc68368618a05.txt', 'text/plain', 388, '2025-12-02 17:11:05', 'PROCESSING', 1);
INSERT INTO `documents` VALUES (80, 'test.txt', 'D:\\ruangon\\note\\uploads\\a37f9c4e7ebd4b3aa0bb431a0db47a12.txt', 'text/plain', 388, '2025-12-02 17:17:27', 'PROCESSING', 1);
INSERT INTO `documents` VALUES (81, 'test.txt', 'D:\\ruangon\\note\\uploads\\5881cd5293ec4f4fa94964e9df6f5646.txt', 'text/plain', 388, '2025-12-02 17:17:29', 'PROCESSING', 1);
INSERT INTO `documents` VALUES (82, 'test.txt', 'D:\\ruangon\\note\\uploads\\dab0f1d4ac174f70bf718c4204180eb3.txt', 'text/plain', 388, '2025-12-02 17:28:05', 'PROCESSING', 1);
INSERT INTO `documents` VALUES (83, 'test.txt', 'D:\\ruangon\\note\\uploads\\954e7202d8e94817b5cc4c731b174688.txt', 'text/plain', 388, '2025-12-02 17:28:07', 'PROCESSING', 1);
INSERT INTO `documents` VALUES (84, 'test.txt', 'D:\\ruangon\\note\\uploads\\0cbeace904fc41868424694c481dc845.txt', 'text/plain', 388, '2025-12-02 17:29:59', 'PROCESSING', 1);
INSERT INTO `documents` VALUES (85, 'test.txt', 'D:\\ruangon\\note\\uploads\\0d2b472dad034a1fa2934c0c28a0d259.txt', 'text/plain', 388, '2025-12-02 17:30:39', 'PROCESSING', 1);
INSERT INTO `documents` VALUES (86, 'test.txt', 'D:\\ruangon\\note\\uploads\\11be8908608b4817bf98d073fa915467.txt', 'text/plain', 388, '2025-12-02 17:30:40', 'PROCESSING', 1);
INSERT INTO `documents` VALUES (87, 'test.txt', 'D:\\ruangon\\note\\uploads\\362fb0ad56224baba95ce4aa44d2b233.txt', 'text/plain', 388, '2025-12-02 17:31:08', 'PROCESSING', 1);
INSERT INTO `documents` VALUES (88, 'test.txt', 'D:\\ruangon\\note\\uploads\\590e05817e7c4b49922016ff72fedcbf.txt', 'text/plain', 388, '2025-12-02 17:31:20', 'PROCESSING', 1);
INSERT INTO `documents` VALUES (89, 'test.txt', 'D:\\ruangon\\note\\uploads\\c6e8c805deca44e6bffc65fe91636c8f.txt', 'text/plain', 388, '2025-12-02 17:39:32', 'PROCESSING', 1);
INSERT INTO `documents` VALUES (90, 'test.txt', 'D:\\ruangon\\note\\uploads\\999f56c404f24a128039bbcc8b5a3bc3.txt', 'text/plain', 388, '2025-12-02 17:40:31', 'PROCESSING', 1);
INSERT INTO `documents` VALUES (91, 'test.txt', 'D:\\ruangon\\note\\uploads\\4e3b4bb2c9a84d5ca98e4ac4bce1f95e.txt', 'text/plain', 388, '2025-12-02 17:49:17', 'PROCESSING', 1);
INSERT INTO `documents` VALUES (92, 'test.txt', 'D:\\ruangon\\note\\uploads\\d01751c0d49347fc90b3e214fcdc2646.txt', 'text/plain', 730, '2025-12-02 18:00:39', 'PROCESSING', 1);
INSERT INTO `documents` VALUES (93, 'test.txt', 'D:\\ruangon\\note\\uploads\\00ea6c3d53e440099990d135c34c3282.txt', 'text/plain', 730, '2025-12-02 18:04:45', 'PROCESSING', 1);
INSERT INTO `documents` VALUES (94, 'test.txt', 'D:\\ruangon\\note\\uploads\\1b6c22bc6dff40cc91bbff78798f7f16.txt', 'text/plain', 730, '2025-12-02 18:04:48', 'PROCESSING', 1);
INSERT INTO `documents` VALUES (95, 'test.txt', 'D:\\ruangon\\note\\uploads\\9442afaf03a943ab9dddfc7e3ccbb638.txt', 'text/plain', 730, '2025-12-02 18:06:09', 'PROCESSING', 1);
INSERT INTO `documents` VALUES (96, 'test.txt', 'D:\\ruangon\\note\\uploads\\c09b45984147408e9cddfea76581c3a6.txt', 'text/plain', 730, '2025-12-02 18:06:13', 'PROCESSING', 1);
INSERT INTO `documents` VALUES (97, 'test.txt', 'D:\\ruangon\\note\\uploads\\5d61ec48993746acbcdbd31542e46aed.txt', 'text/plain', 730, '2025-12-02 18:10:58', 'COMPLETED', 1);
INSERT INTO `documents` VALUES (98, 'test.txt', 'D:\\ruangon\\note\\uploads\\2b4d7bcd27954500b1a76eaaf82eab11.txt', 'text/plain', 730, '2025-12-02 18:17:37', 'COMPLETED', 1);
INSERT INTO `documents` VALUES (99, 'test_english.txt', 'D:\\ruangon\\note\\uploads\\fe88df0c3d0240cd9855bbb69afa320e.txt', 'text/plain', 418, '2025-12-02 18:25:08', 'COMPLETED', 1);

-- ----------------------------
-- Table structure for notes
-- ----------------------------
DROP TABLE IF EXISTS `notes`;
CREATE TABLE `notes`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '笔记ID，主键',
  `summary` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `mind_map_json` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `tags` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `process_time` datetime NOT NULL COMMENT '处理时间',
  `document_id` bigint NOT NULL COMMENT '文档ID，外键，一对一关系',
  `mind_map_content` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `lang` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'zh' COMMENT '生成语言',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `document_id`(`document_id` ASC) USING BTREE,
  INDEX `idx_document_id`(`document_id` ASC) USING BTREE,
  INDEX `idx_process_time`(`process_time` ASC) USING BTREE,
  CONSTRAINT `notes_ibfk_1` FOREIGN KEY (`document_id`) REFERENCES `documents` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 13 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '笔记表（AI处理结果）' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of notes
-- ----------------------------
INSERT INTO `notes` VALUES (1, '本文介绍了计算机网络的基本概念、组成结构和主要协议。包括OSI七层模型、TCP/IP协议族等内容，是网络入门的基础知识。', '{\"name\": \"计算机网络基础\", \"children\": [{\"name\": \"网络模型\", \"children\": [{\"name\": \"OSI七层模型\"}, {\"name\": \"TCP/IP四层模型\"}]}, {\"name\": \"网络协议\", \"children\": [{\"name\": \"TCP协议\"}, {\"name\": \"UDP协议\"}, {\"name\": \"IP协议\"}]}]}', '#计算机网络 #网络基础 #协议', '2025-11-26 23:20:33', 1, NULL, 'zh');
INSERT INTO `notes` VALUES (2, 'TCP协议是面向连接的、可靠的传输层协议。本文详细讲解了TCP的三次握手、四次挥手、流量控制、拥塞控制等核心机制。', '{\"name\": \"TCP协议详解\", \"children\": [{\"name\": \"连接管理\", \"children\": [{\"name\": \"三次握手\"}, {\"name\": \"四次挥手\"}]}, {\"name\": \"可靠性\", \"children\": [{\"name\": \"确认机制\"}, {\"name\": \"超时重传\"}]}, {\"name\": \"流量控制\", \"children\": [{\"name\": \"滑动窗口\"}]}]}', '#TCP #传输层 #网络协议', '2025-11-25 23:20:33', 2, NULL, 'zh');
INSERT INTO `notes` VALUES (3, 'Java编程思想涵盖了面向对象编程的核心概念、设计模式、异常处理、多线程等高级主题，是Java程序员的必读经典。', '{\"name\": \"Java编程思想\", \"children\": [{\"name\": \"面向对象\", \"children\": [{\"name\": \"封装\"}, {\"name\": \"继承\"}, {\"name\": \"多态\"}]}, {\"name\": \"高级特性\", \"children\": [{\"name\": \"异常处理\"}, {\"name\": \"多线程\"}, {\"name\": \"泛型\"}]}]}', '#Java #编程 #面向对象', '2025-11-26 23:20:33', 4, NULL, 'zh');
INSERT INTO `notes` VALUES (4, '人工智能导论介绍了AI的发展历史、主要分支和应用领域。包括机器学习、自然语言处理、计算机视觉等关键技术。', '{\"name\": \"人工智能导论\", \"children\": [{\"name\": \"发展历史\", \"children\": [{\"name\": \"图灵测试\"}, {\"name\": \"达特茅斯会议\"}]}, {\"name\": \"主要分支\", \"children\": [{\"name\": \"机器学习\"}, {\"name\": \"自然语言处理\"}, {\"name\": \"计算机视觉\"}]}]}', '#人工智能 #AI #机器学习', '2025-11-23 23:20:33', 6, NULL, 'zh');
INSERT INTO `notes` VALUES (5, '机器学习基础讲解了监督学习、无监督学习、强化学习等基本概念，以及常见的算法如线性回归、决策树、聚类等。', '{\"name\": \"机器学习基础\", \"children\": [{\"name\": \"学习类型\", \"children\": [{\"name\": \"监督学习\"}, {\"name\": \"无监督学习\"}, {\"name\": \"强化学习\"}]}, {\"name\": \"常见算法\", \"children\": [{\"name\": \"线性回归\"}, {\"name\": \"决策树\"}, {\"name\": \"K均值聚类\"}]}]}', '#机器学习 #AI #算法', '2025-11-21 23:20:33', 7, NULL, 'zh');
INSERT INTO `notes` VALUES (6, '数学分析笔记涵盖了极限、导数、积分等微积分核心概念，是高等数学的重要基础。', '{\"name\": \"数学分析\", \"children\": [{\"name\": \"极限理论\", \"children\": [{\"name\": \"数列极限\"}, {\"name\": \"函数极限\"}]}, {\"name\": \"微分学\", \"children\": [{\"name\": \"导数\"}, {\"name\": \"微分\"}]}, {\"name\": \"积分学\", \"children\": [{\"name\": \"不定积分\"}, {\"name\": \"定积分\"}]}]}', '#数学 #微积分 #分析', '2025-11-19 23:20:33', 9, NULL, 'zh');
INSERT INTO `notes` VALUES (7, '物理实验报告记录了力学实验的过程、数据分析和结论，验证了牛顿第二定律等物理原理。', '{\"name\": \"物理实验\", \"children\": [{\"name\": \"实验目的\"}, {\"name\": \"实验器材\"}, {\"name\": \"数据分析\", \"children\": [{\"name\": \"数据记录\"}, {\"name\": \"图表绘制\"}]}, {\"name\": \"实验结论\"}]}', '#物理 #实验 #力学', '2025-11-24 23:20:33', 10, NULL, 'zh');
INSERT INTO `notes` VALUES (8, '教学大纲明确了课程目标、教学内容、考核方式和学习要求，是课程学习的指导性文件。', '{\"name\": \"教学大纲\", \"children\": [{\"name\": \"课程目标\"}, {\"name\": \"教学内容\", \"children\": [{\"name\": \"理论部分\"}, {\"name\": \"实践部分\"}]}, {\"name\": \"考核方式\"}]}', '#教学 #大纲 #课程', '2025-11-26 23:20:33', 11, NULL, 'zh');
INSERT INTO `notes` VALUES (9, '这是AI生成的摘要：这是一个测试上传的文件。\r\n用于验证智学链系统的文件上传功能。\r\n系统应该能够处理各种格式的文档并生成相应的学习内容。...', '{\"name\":\"根节点\",\"children\":[{\"name\":\"子节点1\"},{\"name\":\"子节点2\"}]}', '#测试,#AI生成', '2025-11-26 16:35:53', 76, NULL, 'zh');
INSERT INTO `notes` VALUES (10, '【模拟AI摘要】\n\n文档分析：\nSmartLogos 智学链测试文档\r\n\r\n这是一个用于测试系统功能的示例文档。\r\n\r\n主要内容：\r\n1. 系统能够正确接收和存储上传的文件\r\n2. 能够从文本文件中提取内容\r\n3. 能够调用AI服务进行分析（当前使用模拟数据）\r\n\r\n测试要点：\r\n- 文件上传功能\r\n- 文本提取功能\r\n- 数据库存储功能\r\n- AI接口调用（模拟）\r\n\r\n关键特性：\r\n• 多格式支持：PDF、Word、PPT、...\n\n这是模拟的AI分析结果。', NULL, '[\"#测试文档\",\"#模拟数据\",\"#待AI处理\"]', '2025-12-02 18:10:58', 97, '# 文档主题\n\n## 核心要点一\n- 要点详情\n- 相关说明\n\n## 核心要点二\n- 实际应用\n- 案例分析', 'zh');
INSERT INTO `notes` VALUES (11, '【模拟AI摘要】\n\n文档分析：\nSmartLogos 智学链测试文档\r\n\r\n这是一个用于测试系统功能的示例文档。\r\n\r\n主要内容：\r\n1. 系统能够正确接收和存储上传的文件\r\n2. 能够从文本文件中提取内容\r\n3. 能够调用AI服务进行分析（当前使用模拟数据）\r\n\r\n测试要点：\r\n- 文件上传功能\r\n- 文本提取功能\r\n- 数据库存储功能\r\n- AI接口调用（模拟）\r\n\r\n关键特性：\r\n• 多格式支持：PDF、Word、PPT、...\n\n这是模拟的AI分析结果。', NULL, '[\"#测试文档\",\"#模拟数据\",\"#待AI处理\"]', '2025-12-02 18:17:37', 98, '# 文档主题\n\n## 核心要点一\n- 要点详情\n- 相关说明\n\n## 核心要点二\n- 实际应用\n- 案例分析', 'zh');
INSERT INTO `notes` VALUES (12, '【模拟AI摘要】\n\n文档分析：\nSmartLogos Testing Document\r\n\r\nThis is a test document for system functionality verification.\r\n\r\nMain Content:\r\n1. System can correctly receive and store uploaded files\r\n2. Can extract content from te...\n\n这是模拟的AI分析结果。', NULL, '[\"#TestDoc\",\"#MockData\",\"#PendingAI\"]', '2025-12-02 18:25:08', 99, '# Document Theme\n\n## Key Point 1\n- Details\n- Notes\n\n## Key Point 2\n- Application\n- Analysis', 'en');

-- ----------------------------
-- Table structure for questions
-- ----------------------------
DROP TABLE IF EXISTS `questions`;
CREATE TABLE `questions`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '问题ID，主键',
  `question_text` tinytext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `answer` tinytext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `question_type` enum('MULTIPLE_CHOICE','SHORT_ANSWER') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '问题类型（选择题/简答题）',
  `options` tinytext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `note_id` bigint NOT NULL COMMENT '笔记ID，外键',
  `explanation` tinytext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_note_id`(`note_id` ASC) USING BTREE,
  INDEX `idx_question_type`(`question_type` ASC) USING BTREE,
  CONSTRAINT `questions_ibfk_1` FOREIGN KEY (`note_id`) REFERENCES `notes` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 9 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = 'AI生成的问题表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of questions
-- ----------------------------
INSERT INTO `questions` VALUES (1, '这是一个测试选择题？', 'A', 'MULTIPLE_CHOICE', '[\"选项A\",\"选项B\",\"选项C\",\"选项D\"]', 9, NULL);
INSERT INTO `questions` VALUES (2, '这是一个测试简答题？', '这是简答题的参考答案', 'SHORT_ANSWER', NULL, 9, NULL);
INSERT INTO `questions` VALUES (3, '根据文档内容，以下哪个说法是正确的？', 'A', 'MULTIPLE_CHOICE', '[\"选项A：这是第一个选项\",\"选项B：这是第二个选项\",\"选项C：这是第三个选项\",\"选项D：这是第四个选项\"]', 10, '这是模拟的答案解析。');
INSERT INTO `questions` VALUES (4, '请简要概括文档的主要内容？', '参考答案：文档主要介绍了相关概念和应用。', 'SHORT_ANSWER', NULL, 10, '简答题评分要点：内容完整性、逻辑清晰、语言表达。');
INSERT INTO `questions` VALUES (5, '根据文档内容，以下哪个说法是正确的？', 'A', 'MULTIPLE_CHOICE', '[\"选项A：这是第一个选项\",\"选项B：这是第二个选项\",\"选项C：这是第三个选项\",\"选项D：这是第四个选项\"]', 11, '这是模拟的答案解析。');
INSERT INTO `questions` VALUES (6, '请简要概括文档的主要内容？', '参考答案：文档主要介绍了相关概念和应用。', 'SHORT_ANSWER', NULL, 11, '简答题评分要点：内容完整性、逻辑清晰、语言表达。');
INSERT INTO `questions` VALUES (7, 'According to the document, which is correct?', 'A', 'MULTIPLE_CHOICE', '[\"Option A\",\"Option B\",\"Option C\",\"Option D\"]', 12, 'Mock explanation.');
INSERT INTO `questions` VALUES (8, 'Please summarize the main content?', 'Reference answer: The document introduces concepts and applications.', 'SHORT_ANSWER', NULL, 12, 'Scoring criteria: completeness, clarity, expression.');

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '用户ID，主键',
  `username` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '用户名，唯一',
  `email` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '邮箱，唯一',
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '密码',
  `create_time` datetime NOT NULL COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `username`(`username` ASC) USING BTREE,
  UNIQUE INDEX `email`(`email` ASC) USING BTREE,
  INDEX `idx_username`(`username` ASC) USING BTREE,
  INDEX `idx_email`(`email` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 16 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '用户表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of users
-- ----------------------------
INSERT INTO `users` VALUES (1, 'testuser', 'test@example.com', '123456', '2025-11-26 23:17:44');
INSERT INTO `users` VALUES (2, 'admin', 'admin@example.com', 'admin123', '2025-11-26 23:17:44');
INSERT INTO `users` VALUES (3, '张三', 'zhangsan@example.com', 'password123', '2025-11-26 23:20:18');
INSERT INTO `users` VALUES (4, '李四', 'lisi@example.com', 'password456', '2025-11-26 23:20:18');
INSERT INTO `users` VALUES (5, '王五', 'wangwu@example.com', 'password789', '2025-11-26 23:20:18');
INSERT INTO `users` VALUES (6, '学生小明', 'xiaoming@edu.com', 'stu123456', '2025-11-26 23:20:18');
INSERT INTO `users` VALUES (7, '教师张老师', 'teacherzhang@school.com', 'teach123', '2025-11-26 23:20:18');
INSERT INTO `users` VALUES (8, 'test_user_01', 'test01@test.com', 'testpass', '2025-11-26 23:20:18');
INSERT INTO `users` VALUES (9, 'test_user_02', 'test02@test.com', 'testpass', '2025-11-26 23:20:18');
INSERT INTO `users` VALUES (10, 'ai_learner', 'ai_learner@ai.com', 'aipassword', '2025-11-26 23:20:18');
INSERT INTO `users` VALUES (11, 'study_group', 'group@study.com', 'grouppass', '2025-11-26 23:20:18');
INSERT INTO `users` VALUES (12, 'research_team', 'research@lab.com', 'research123', '2025-11-26 23:20:18');
INSERT INTO `users` VALUES (13, 'testuser1', 'test1@example.com', 'password123', '2025-12-03 00:56:39');
INSERT INTO `users` VALUES (14, 'testuser2', 'test2@example.com', 'password456', '2025-12-03 00:56:39');

SET FOREIGN_KEY_CHECKS = 1;
