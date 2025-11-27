智学链 (SmartLogos) - 后端系统文档
📖 项目概述
智学链 (SmartLogos) 是一个基于AI的多模态知识聚合与辅助学习系统。后端系统采用Spring Boot框架，提供完整的RESTful API服务，支持文件上传、AI智能处理、知识库管理等功能。
🎯 核心功能
多模态文件上传 - 支持PDF、Word、PPT、TXT等格式
AI智能处理 - 自动生成摘要、思维导图、学习问题
知识库管理 - 全文检索、闪回卡片、笔记管理
用户认证 - 基于Spring Security的数据库用户认证
🏗️ 系统架构
技术栈
后端框架: Spring Boot 3.2.0
安全框架: Spring Security 6.2.0
数据持久化: Spring Data JPA + Hibernate
数据库: MySQL 8.0+
Navicat Premium 17.0.4
文件处理: Apache PDFBox、Apache POI
构建工具: Maven
Java版本: 17
项目结构
text
src/main/java/com/smartlogos/note/
├── config/                 # 配置类
│   └── SecurityConfig.java
├── controller/            # REST控制器
│   ├── DocumentController.java
│   └── NoteController.java
├── entity/                # JPA实体类
│   ├── User.java
│   ├── Document.java
│   ├── Note.java
│   └── Question.java
├── repository/            # 数据访问层
│   ├── UserRepository.java
│   ├── DocumentRepository.java
│   ├── NoteRepository.java
│   └── QuestionRepository.java
├── service/               # 业务逻辑层
│   ├── DocumentService.java
│   ├── AIService.java
│   ├── FileStorageService.java
│   ├── TextExtractionService.java
│   ├── NoteService.java
│   └── QuestionService.java
└── dto/                   # 数据传输对象
    ├── FileUploadResponse.java
    ├── AIProcessRequest.java
    └── AIProcessResponse.java
🗄️ 数据库设计
数据库表结构
1. users - 用户表
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '用户ID，主键',
    username VARCHAR(100) NOT NULL UNIQUE COMMENT '用户名，唯一',
    email VARCHAR(200) NOT NULL UNIQUE COMMENT '邮箱，唯一',
    password VARCHAR(255) NOT NULL COMMENT '密码',
    create_time DATETIME NOT NULL COMMENT '创建时间'
) COMMENT='用户表';
索引:
idx_username (username) - 用户名索引
idx_email (email) - 邮箱索引

2. documents - 文档表
CREATE TABLE documents (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '文档ID，主键',
    file_name VARCHAR(500) NOT NULL COMMENT '原始文件名',
    file_path VARCHAR(1000) NOT NULL COMMENT '存储路径',
    content_type VARCHAR(100) COMMENT '文件类型',
    file_size BIGINT COMMENT '文件大小（字节）',
    upload_time DATETIME NOT NULL COMMENT '上传时间',
    status ENUM('UPLOADED', 'PROCESSING', 'COMPLETED', 'ERROR') NOT NULL DEFAULT 'UPLOADED' COMMENT '处理状态',
    user_id BIGINT NOT NULL COMMENT '用户ID，外键'
) COMMENT='文档表';
索引:
idx_user_id (user_id) - 用户ID索引
idx_upload_time (upload_time) - 上传时间索引
idx_status (status) - 状态索引

3. notes - 笔记表
CREATE TABLE notes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '笔记ID，主键',
    summary TEXT COMMENT 'AI生成的摘要',
    mind_map_json TEXT COMMENT '思维导图JSON数据',
    tags VARCHAR(500) COMMENT '标签，逗号分隔',
    process_time DATETIME NOT NULL COMMENT '处理时间',
    document_id BIGINT NOT NULL UNIQUE COMMENT '文档ID，外键'
) COMMENT='笔记表（AI处理结果）';
索引:
idx_document_id (document_id) - 文档ID索引
idx_process_time (process_time) - 处理时间索引

4. questions - 问题表
CREATE TABLE questions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '问题ID，主键',
    question_text TEXT NOT NULL COMMENT '问题内容',
    answer TEXT COMMENT '参考答案',
    question_type ENUM('MULTIPLE_CHOICE', 'SHORT_ANSWER') NOT NULL COMMENT '问题类型',
    options TEXT COMMENT '选择题选项（JSON格式）',
    note_id BIGINT NOT NULL COMMENT '笔记ID，外键'
) COMMENT='AI生成的问题表';
索引:
idx_note_id (note_id) - 笔记ID索引
idx_question_type (question_type) - 问题类型索引
表关系说明:
users (1) ←→ (N) documents (1) ←→ (1) notes (1) ←→ (N) questions
users → documents: 一对多，一个用户可以上传多个文档
documents → notes: 一对一，一个文档对应一个AI处理结果
notes → questions: 一对多，一个笔记可以生成多个问题

🔐 安全配置
认证机制
使用Spring Security进行用户认证
支持用户名和邮箱登录
密码使用明文存储（仅用于测试环境）
API接口无需认证，管理页面需要登录
安全配置类
java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    // 配置权限规则、登录跳转、密码编码器等
}
📡 API接口文档
基础信息
基础URL: http://localhost:8080/api
认证: API接口无需认证，管理页面需要登录
格式: JSON
1. 文档管理接口
1.1 上传文件
http
POST /documents/upload
Content-Type: multipart/form-data
参数:
- file: 文件 (必填)
- userId: 用户ID (必填)
响应示例:
    json
    {
      "success": true,
      "message": "文件上传成功",
      "documentId": 1,
      "fileName": "test.pdf"
    }
1.2 获取用户文档列表
  http
  GET /documents/user/{userId}
响应示例:
    json
    [
      {
        "id": 1,
        "fileName": "计算机网络基础.pdf",
        "filePath": "uploads/network_basic_001.pdf",
        "contentType": "application/pdf",
        "fileSize": 2048576,
        "uploadTime": "2025-11-27T07:20:24",
        "status": "COMPLETED"
      }
    ]
1.3 获取文档问题
  http
  GET /documents/{documentId}/questions?userId={userId}
响应示例:
    json
    [
      {
        "id": 1,
        "questionText": "OSI参考模型共有多少层？",
        "answer": "7层",
        "questionType": "MULTIPLE_CHOICE",
        "options": "[\"5层\", \"6层\", \"7层\", \"8层\"]"
      }
    ]
2. 笔记管理接口
2.1 获取文档笔记
    http
    GET /notes/document/{documentId}
2.2 获取思维导图
    http
    GET /notes/{noteId}/mindmap
响应示例:
    json
    {
      "name": "根节点",
      "children": [
        {"name": "子节点1"},
        {"name": "子节点2"}
      ]
    }
⚙️ 系统配置
应用配置 (application.properties)
properties
# 服务器配置
server.port=8080
# 数据库配置
spring.datasource.url=jdbc:mysql://localhost:3306/smartlogos?useSSL=false&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=******

# JPA配置
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

# 文件上传配置
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB

# 应用配置
app.upload-dir=./uploads

依赖配置 (pom.xml)
主要依赖包括：
Spring Boot Starters (Web, Data JPA, Security)
MySQL Connector
Lombok
Apache PDFBox (PDF处理)
Apache POI (Office文档处理)
Jacksn (JSON处理)
🚀 部署指南
环境要求
Java 17+
MySQL 8.0+
Maven 3.6+
部署步骤
克隆项目
git clone <repository-url>
cd note

配置数据库
CREATE DATABASE smartlogos;

修改配置文件
更新 application.properties 中的数据库连接信息
配置AI服务接口地址（如使用外部AI服务）

构建项目:mvn clean package

运行应用:java -jar target/note-1.0.0.jar

访问应用
API接口: http://localhost:8080/api
管理页面: http://localhost:8080/

🔧 开发指南
实体类设计要点
使用JPA注解进行ORM映射
使用@JsonIgnore避免JSON序列化循环引用
合理配置懒加载策略优化性能
服务层设计
DocumentService: 文档上传和处理业务流程
AIService: AI接口调用和数据处理
FileStorageService: 文件存储管理
TextEtractionService: 文本内容提取
异常处理
统一的异常处理机制
友好的错误信息返回
文件上传大小限制处理

📊 测试数据
默认测试用户
sql
INSERT INTO users (username, email, password, create_time) VALUES
('张三', 'zhangsan@example.com', 'password123', NOW()),
('李四', 'lisi@example.com', 'password456', NOW());
测试登录信息
用户名: 张三
密码: password123

🐛 故障排除
常见问题
数据库连接失败
检查MySQL服务是否启动
验证数据库连接配置
文件上传失败
检查上传目录权限
验证文件大小限制配置
JSON序列化错误
检查实体类循环引用
添加@JsonIgnore注解
AI处理失败
检查AI服务接口连通性
查看应用日志错误信息
日志查看
应用日志输出到控制台，包含详细的处理过程和错误信息。
📝 版本历史
v1.0.0 (2025-11-27)
✅ 基础文件上传功能
✅ AI智能处理集成
✅ 用户认证系统
✅ 完整的RESTful API
✅ 数据库设计和优化
