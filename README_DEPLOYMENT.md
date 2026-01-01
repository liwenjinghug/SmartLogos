# SmartLogos 后端 - 部署和接口说明

## 📋 项目简介

SmartLogos 是一个基于 AI 的多模态知识聚合与辅助学习系统后端，提供文档上传、AI 分析、笔记管理、题目生成等功能。

## 🚀 快速开始

### 使用 Docker 部署（推荐）

#### Windows 系统
```bash
# 双击运行
deploy.bat
```

#### Linux/Mac 系统
```bash
chmod +x deploy.sh
./deploy.sh
```

手动部署：
```bash
docker-compose up -d
```

### 本地开发运行

```bash
# 1. 确保 MySQL 已启动并创建数据库 smartlogos

# 2. 修改 src/main/resources/application.properties 中的数据库配置

# 3. 运行项目
./mvnw spring-boot:run

# 或使用 IDE（IDEA/Eclipse）直接运行 NoteApplication.java
```

## 📡 前端对接接口

**后端地址：** `http://localhost:8080/api`（本地）或 `http://服务器IP:8080/api`（部署后）

### 1. 获取文档列表
```
GET /api/documents?user_id=1
```
**返回格式：**
```json
{
  "code": 200,
  "msg": "success",
  "data": [
    {
      "id": 1,
      "filename": "test.pdf",
      "upload_time": "2025-12-14 10:00:00",
      "summary": "文档摘要",
      "status": "COMPLETED"
    }
  ]
}
```

### 2. AI 文件分析（核心接口）
```
POST /api/analyze?target_lang=zh
Content-Type: multipart/form-data
```
**请求参数：**
- `file`: 文件（PDF/图片等）
- `target_lang`: 目标语言（zh=中文，en=英文，可选）
- `user_id`: 用户ID（可选，默认1）

**返回格式：**
```json
{
  "code": 200,
  "msg": "分析完成",
  "data": {
    "filename": "test.pdf",
    "summary": "AI生成的文档摘要",
    "mind_map": "# 思维导图\n- 主题1\n  - 子主题",
    "quizzes": [
      {
        "question": "题目内容",
        "options": ["选项A", "选项B", "选项C"],
        "answer": "A",
        "analysis": "题目解析"
      }
    ],
    "tags": ["标签1", "标签2"]
  }
}
```

### 3. 获取笔记详情
```
GET /api/documents/{id}
```
**返回格式：** 同接口 2

### 4. 获取题目列表
```
GET /api/quizzes?user_id=1
```
**返回格式：**
```json
{
  "code": 200,
  "msg": "success",
  "data": [
    {
      "id": 1,
      "document_id": 1,
      "question": "题目内容",
      "options": ["选项A", "选项B"],
      "answer": "A",
      "analysis": "解析"
    }
  ]
}
```

### 5. AI 问答
```
POST /api/chat
Content-Type: application/json
```
**请求体：**
```json
{
  "question": "用户问题",
  "context": "笔记内容或笔记ID"
}
```
**返回格式：**
```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "answer": "AI回答内容"
  }
}
```

## 🔧 配置说明

### 跨域配置
后端已配置允许以下源访问：
- `http://localhost:3000`
- `http://127.0.0.1:3000`
- `http://47.108.189.246:3000`

如需添加其他域名，修改 [CorsConfig.java](src/main/java/com/smartlogos/note/config/CorsConfig.java)

### AI 服务配置
默认对接地址：`http://47.108.189.246:8005`

修改配置：
- 开发环境：`src/main/resources/application.properties`
- 生产环境：`src/main/resources/application-prod.properties` 或环境变量 `AI_API_BASE_URL`

### 数据库配置
- 默认数据库：`smartlogos`
- 默认用户：`root`
- 默认密码：`123456`

**使用 Docker Compose 部署时，数据库会自动创建。**

手动配置：修改 `docker-compose.yml` 或 `application.properties`

## 📦 项目结构

```
src/main/java/com/smartlogos/note/
├── config/          # 配置类（跨域、安全等）
├── controller/      # REST 接口
├── dto/             # 数据传输对象
├── entity/          # 数据库实体
├── repository/      # 数据访问层
└── service/         # 业务逻辑层
```

## 🛠️ 常用命令

```bash
# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f backend
docker-compose logs -f mysql

# 重启服务
docker-compose restart

# 停止服务
docker-compose stop

# 完全清理（包括数据库数据！）
docker-compose down -v

# 进入后端容器
docker-compose exec backend bash

# 访问 MySQL
docker-compose exec mysql mysql -uroot -p123456
```

## 📚 更多文档

- [详细部署指南](DEPLOYMENT.md) - Docker 部署、故障排查、生产环境配置
- [数据库初始化脚本](sql/smartlogos.sql)

## 🐛 故障排查

### 问题 1：CORS 跨域错误
- 确认前端地址是否在 `CorsConfig.java` 的允许列表中
- 检查浏览器控制台错误信息

### 问题 2：AI 服务调用失败
- 检查 AI 服务地址配置（`application.properties` 中的 `ai.api.base-url`）
- 测试 AI 服务是否可访问：`curl http://47.108.189.246:8005/api/analyze`
- 后端会返回 Mock 数据作为降级方案

### 问题 3：数据库连接失败
```bash
# 检查 MySQL 容器状态
docker-compose ps mysql

# 查看 MySQL 日志
docker-compose logs mysql

# 手动测试连接
docker-compose exec mysql mysql -uroot -p123456 -e "show databases;"
```

### 问题 4：端口被占用
```bash
# Windows
netstat -ano | findstr :8080

# Linux/Mac
lsof -i :8080

# 修改 docker-compose.yml 中的端口映射
ports:
  - "8081:8080"  # 改用 8081 端口
```

## 👥 团队协作

**前端开发注意事项：**
1. 所有接口统一返回格式 `{ code, msg, data }`
2. `code=200` 表示成功，其他值表示失败
3. `/api/analyze` 接口处理时间约 10 秒，需展示加载动画
4. 文件上传限制：最大 50MB

**后端开发注意事项：**
1. 修改接口前先与前端同学沟通
2. 新增字段需更新 DTO 类和数据库
3. 提交代码前检查是否影响接口兼容性

## 📞 技术支持

- 项目仓库：[GitHub/GitLab 地址]
- 技术文档：查看 `DEPLOYMENT.md`
- 联系方式：[项目负责人邮箱]

---

**最后更新：** 2025-12-14  
**版本：** 1.0.0
