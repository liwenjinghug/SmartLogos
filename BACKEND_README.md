# SmartLogos (智学链) - 后端部署指南

## 项目概述
SmartLogos 是一个基于AI的多模态知识聚合与辅助学习系统，支持PDF、Word、PPT、TXT文档的智能分析。

## 系统要求
- JDK 17+
- Maven 3.6+
- MySQL 8.0+
- Python 3.8+ (用于AI服务)

---

## 快速开始

### 1. 数据库设置

#### 创建数据库
```sql
CREATE DATABASE smartlogos CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### 导入初始数据（可选）
```sql
USE smartlogos;

-- 创建测试用户
INSERT INTO users (username, email, password, create_time) VALUES
('testuser', 'test@example.com', 'password123', NOW());
```

**注意**: 项目使用JPA自动建表（`spring.jpa.hibernate.ddl-auto=update`），首次启动会自动创建表结构。

### 2. 配置文件

编辑 `src/main/resources/application.properties`:

```properties
# 数据库配置（根据实际情况修改）
spring.datasource.url=jdbc:mysql://localhost:3306/smartlogos?useSSL=false&serverTimezone=UTC&characterEncoding=utf8
spring.datasource.username=root
spring.datasource.password=123456

# AI服务配置（确保AI服务已启动）
ai.api.url=http://localhost:5000/api/analyze
ai.api.chat-url=http://localhost:5000/api/chat

# 文件上传目录（可自定义）
app.upload-dir=./uploads
```

### 3. 启动AI服务

**AI服务需要单独启动（由AI组成员提供）**

确保AI服务已在端口5000启动，提供以下接口：
- `POST /api/analyze` - 文档分析
- `POST /api/chat` - 智能问答

### 4. 编译和运行

#### 使用Maven命令
```bash
# 清理并编译
mvn clean package

# 运行
mvn spring-boot:run
```

#### 使用IDE（推荐）
1. 在IntelliJ IDEA中打开项目
2. 等待Maven依赖下载完成
3. 运行 `NoteApplication.java` 主类

#### 验证启动
访问：http://localhost:8080/actuator/health

预期返回：
```json
{
  "status": "UP"
}
```

---

## 项目结构

```
src/main/java/com/smartlogos/note/
├── NoteApplication.java          # Spring Boot 启动类
├── config/
│   ├── CORSConfig.java           # 跨域配置
│   └── SecurityConfig.java       # 安全配置
├── controller/
│   ├── AnalyzeController.java    # 文件分析接口
│   ├── ChatController.java       # 智能问答接口
│   ├── NoteController.java       # 笔记管理接口
│   └── DocumentController.java   # 文档管理接口
├── dto/
│   ├── AIProcessResponse.java    # AI响应DTO
│   ├── AnalyzeResponse.java      # 分析结果DTO
│   ├── ChatRequest.java          # 聊天请求DTO
│   └── ChatResponse.java         # 聊天响应DTO
├── entity/
│   ├── User.java                 # 用户实体
│   ├── Document.java             # 文档实体
│   ├── Note.java                 # 笔记实体
│   └── Question.java             # 题目实体
├── repository/
│   ├── UserRepository.java
│   ├── DocumentRepository.java
│   ├── NoteRepository.java
│   └── QuestionRepository.java
└── service/
    ├── AIService.java            # AI服务调用
    ├── DocumentService.java      # 文档业务逻辑
    ├── NoteService.java          # 笔记业务逻辑
    ├── QuestionService.java      # 题目业务逻辑
    ├── FileStorageService.java   # 文件存储服务
    └── TextExtractionService.java # 文本提取服务
```

---

## 核心功能说明

### 1. 文件上传与分析流程

```
用户上传文件
    ↓
保存到本地 (./uploads/)
    ↓
创建Document记录（状态：PROCESSING）
    ↓
提取文本内容（PDF/Word/PPT/TXT）
    ↓
调用AI服务分析
    ↓
保存结果到数据库
    ├── Note表（摘要、思维导图、标签）
    └── Questions表（智能题目）
    ↓
返回结果给前端
```

### 2. 支持的文件格式

| 格式 | 扩展名 | 说明 |
|------|--------|------|
| PDF | .pdf | 使用Apache PDFBox解析 |
| Word | .docx | 使用Apache POI解析 |
| PowerPoint | .pptx | 使用Apache POI解析 |
| 文本 | .txt | 直接读取 |

### 3. AI数据流

#### 分析接口 (POST /api/analyze)
```
后端 → AI服务
{
  "content": "提取的文本内容",
  "target_lang": "zh"
}

AI服务 → 后端
{
  "summary": "摘要",
  "mind_map_md": "# Markdown思维导图",
  "tags": ["#标签1", "#标签2"],
  "quizzes": [
    {
      "question": "题目",
      "options": ["A", "B", "C", "D"],
      "answer": "A",
      "explanation": "解析"
    }
  ]
}
```

#### 聊天接口 (POST /api/chat)
```
后端 → AI服务
{
  "context": "笔记内容上下文",
  "question": "用户问题",
  "target_lang": "zh"
}

AI服务 → 后端
{
  "answer": "AI回答"
}
```

---

## 数据库表结构

### 1. users（用户表）
```sql
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    create_time DATETIME NOT NULL
);
```

### 2. documents（文档表）
```sql
CREATE TABLE documents (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    content_type VARCHAR(100),
    file_size BIGINT,
    upload_time DATETIME NOT NULL,
    status VARCHAR(20) NOT NULL,
    user_id BIGINT,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### 3. notes（笔记表）
```sql
CREATE TABLE notes (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    summary TEXT,
    mind_map_content TEXT,
    mind_map_json TEXT,
    tags TEXT,
    lang VARCHAR(10),
    process_time DATETIME,
    document_id BIGINT,
    FOREIGN KEY (document_id) REFERENCES documents(id)
);
```

### 4. questions（题目表）
```sql
CREATE TABLE questions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    question_text TEXT NOT NULL,
    question_type VARCHAR(20) NOT NULL,
    options TEXT,
    answer TEXT,
    explanation TEXT,
    note_id BIGINT,
    FOREIGN KEY (note_id) REFERENCES notes(id)
);
```

---

## API接口快速参考

| 接口 | 方法 | 功能 |
|------|------|------|
| `/api/analyze` | POST | 上传文件并分析 |
| `/api/chat` | POST | 智能问答 |
| `/api/notes/{id}` | GET | 获取笔记详情 |
| `/api/notes/user/{userId}` | GET | 获取用户笔记列表 |
| `/api/notes/{id}/questions` | GET | 获取笔记的题目 |
| `/api/documents/{id}` | GET | 获取文档信息 |

详细API文档请参考：`API_DOCUMENTATION.md`

---

## 配置说明

### application.properties 完整配置

```properties
# 服务器端口
server.port=8080

# 应用名称
spring.application.name=smartlogos-note

# 数据库配置
spring.datasource.url=jdbc:mysql://localhost:3306/smartlogos?useSSL=false&serverTimezone=UTC&characterEncoding=utf8
spring.datasource.username=root
spring.datasource.password=123456
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA配置
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect

# 文件上传配置
spring.servlet.multipart.max-file-size=20MB
spring.servlet.multipart.max-request-size=20MB
app.upload-dir=./uploads

# AI服务配置
ai.api.url=http://localhost:5000/api/analyze
ai.api.chat-url=http://localhost:5000/api/chat
ai.api.key=your-ai-api-key-here

# 监控端点
management.endpoints.web.exposure.include=health,info
management.endpoint.health.show-details=always

# 日志级别
logging.level.com.smartlogos.note=DEBUG
```

---

## 故障排除

### 1. 数据库连接失败
**错误**: `Communications link failure`

**解决方案**:
- 确认MySQL服务已启动
- 检查数据库连接信息（主机、端口、用户名、密码）
- 确认防火墙设置

### 2. AI服务连接失败
**错误**: `Connection refused` 或 `调用 AI 接口异常`

**解决方案**:
- 确认AI服务已启动（端口5000）
- 检查 `ai.api.url` 和 `ai.api.chat-url` 配置
- 查看AI服务日志

### 3. 文件上传失败
**错误**: `Maximum upload size exceeded`

**解决方案**:
- 调整 `spring.servlet.multipart.max-file-size` 配置
- 检查 `uploads` 目录权限

### 4. 文本提取失败
**错误**: `提取文件文本失败`

**解决方案**:
- 确认文件格式正确
- 检查文件是否损坏
- 查看日志获取详细错误信息

### 5. 端口已被占用
**错误**: `Port 8080 was already in use`

**解决方案**:
```bash
# Windows
netstat -ano | findstr :8080
taskkill /PID <进程ID> /F

# Linux/Mac
lsof -i :8080
kill -9 <进程ID>
```

或修改 `application.properties`:
```properties
server.port=8081
```

---

## 开发建议

### 1. 日志查看
开发时建议开启DEBUG日志：
```properties
logging.level.com.smartlogos.note=DEBUG
```

关键日志位置：
- AI调用日志：`AIService.java`
- 文件处理日志：`AnalyzeController.java`
- 文本提取日志：`TextExtractionService.java`

### 2. 测试数据
使用Postman或curl测试接口：

```bash
# 测试文件上传
curl -X POST http://localhost:8080/api/analyze \
  -F "file=@test.pdf" \
  -F "target_lang=zh" \
  -F "userId=1"

# 测试聊天
curl -X POST http://localhost:8080/api/chat \
  -H "Content-Type: application/json" \
  -d '{"noteId":1,"question":"解释一下概念","targetLang":"zh"}'
```

### 3. 性能优化
- 文件存储：考虑使用对象存储（如阿里云OSS）
- 数据库：添加适当索引
- AI调用：考虑异步处理长时间任务

---

## 部署到生产环境

### 1. 打包
```bash
mvn clean package -DskipTests
```

生成文件：`target/note-1.0.0.jar`

### 2. 运行
```bash
java -jar target/note-1.0.0.jar
```

### 3. 后台运行
```bash
nohup java -jar target/note-1.0.0.jar > app.log 2>&1 &
```

### 4. 使用系统服务（Linux）
创建服务文件 `/etc/systemd/system/smartlogos.service`:
```ini
[Unit]
Description=SmartLogos Note Service
After=syslog.target

[Service]
User=root
ExecStart=/usr/bin/java -jar /path/to/note-1.0.0.jar
SuccessExitStatus=143

[Install]
WantedBy=multi-user.target
```

启动服务：
```bash
systemctl start smartlogos
systemctl enable smartlogos
```

---

## 依赖管理

### 核心依赖
- Spring Boot 3.2.0
- MySQL Connector/J
- Apache PDFBox 2.0.29
- Apache POI 5.2.4
- Lombok

### 添加新依赖
编辑 `pom.xml`，然后运行：
```bash
mvn clean install
```

---

## 团队协作

### Git工作流程
```bash
# 拉取最新代码
git pull origin main

# 创建功能分支
git checkout -b feature/your-feature

# 提交代码
git add .
git commit -m "feat: 添加新功能"

# 推送到远程
git push origin feature/your-feature
```

### 代码规范
- 遵循阿里巴巴Java开发手册
- 使用Lombok减少样板代码
- 添加必要的注释
- 统一异常处理

---

## 联系方式
- 后端负责人：成员A
- AI模块负责人：成员C
- 前端负责人：成员B

## 相关文档
- [API接口文档](API_DOCUMENTATION.md)
- [数据库设计文档](sql/smartlogos.sql)
- [需求规格说明书](需求规格说明书.docx)
- [设计说明书](设计说明书.docx)

---

## 许可证
本项目仅用于课程作业，未经许可不得商用。

