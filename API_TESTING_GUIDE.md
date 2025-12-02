# SmartLogos API 完整测试指南

## 📋 目录

1. [测试环境准备](#测试环境准备)
2. [测试工具选择](#测试工具选择)
3. [接口测试清单](#接口测试清单)
4. [详细测试步骤](#详细测试步骤)
5. [测试数据准备](#测试数据准备)
6. [预期结果](#预期结果)
7. [常见问题](#常见问题)

---

## 测试环境准备

### 1. 确认服务状态

```bash
# 检查MySQL是否运行
netstat -an | findstr 3306

# 检查后端是否运行
netstat -an | findstr 8080

# 检查AI服务是否运行（可选）
netstat -an | findstr 5000
```

### 2. 数据库准备

```sql
-- 连接MySQL
mysql -u root -p

-- 创建数据库（如果还没创建）
CREATE DATABASE IF NOT EXISTS smartlogos CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 查看表是否创建
USE smartlogos;
SHOW TABLES;

-- 应该看到4个表：documents, notes, questions, users
```

### 3. 启动后端

```bash
cd D:\ruangon\note
mvn spring-boot:run
```

等待看到：`Started NoteApplication in X seconds`

---

## 测试工具选择

### 方式1: 使用测试网页（最简单）⭐

**步骤**：
1. 确保后端已启动
2. 用浏览器打开 `test-api.html`
3. 按顺序点击测试按钮

**优点**：
- 图形界面，直观易用
- 自动显示结果
- 支持文件上传
- 实时查看响应

### 方式2: 使用Postman（专业）

**步骤**：
1. 下载安装Postman
2. 导入下面的测试集合
3. 按顺序执行测试

### 方式3: 使用curl命令（快速）

**优点**：
- 命令行快速测试
- 脚本化测试
- 适合自动化

---

## 接口测试清单

### ✅ 基础接口测试

- [ ] 测试1: 健康检查
- [ ] 测试2: 数据库连接
- [ ] 测试3: CORS跨域

### ✅ 核心功能测试

- [ ] 测试4: 文件上传（TXT）
- [ ] 测试5: 文件上传（PDF）
- [ ] 测试6: 文件上传（Word）
- [ ] 测试7: 文件上传（PPT）
- [ ] 测试8: 多语言支持（中文）
- [ ] 测试9: 多语言支持（英文）

### ✅ 笔记管理测试

- [ ] 测试10: 获取单个笔��
- [ ] 测试11: 获取用户笔记列表
- [ ] 测试12: 搜索笔记

### ✅ 题目管理测试

- [ ] 测试13: 获取笔记的题目列表
- [ ] 测试14: 验证选择题格式
- [ ] 测试15: 验证简答题格式

### ✅ 智能问答测试

- [ ] 测试16: 基础问答
- [ ] 测试17: 多轮对话
- [ ] 测试18: 不同语言问答

### ✅ 文档管理测试

- [ ] 测试19: 获取文档信息
- [ ] 测试20: 获取用户文档列表

### ✅ 异常处理测试

- [ ] 测试21: 上传空文件
- [ ] 测试22: 上传不支持的格式
- [ ] 测试23: 获取不存在的笔记
- [ ] 测试24: 无效的参数

---

## 详细测试步骤

### 测试1: 健康检查 ✅

**目的**：验证服务是否正常运行

**接口**：`GET /actuator/health`

#### 使用浏览器
```
http://localhost:8080/actuator/health
```

#### 使用curl
```bash
curl http://localhost:8080/actuator/health
```

#### 使用Postman
- Method: GET
- URL: `http://localhost:8080/actuator/health`

#### 预期结果
```json
{
  "status": "UP"
}
```

#### 测试通过标准
- HTTP状态码：200
- status字段为"UP"

---

### 测试2-3: 基础连接测试 ✅

**测试2: 数据库连接**
- 健康检查返回UP即表示数据库连接正常

**测试3: CORS跨域**
- 使用test-api.html能正常访问即表示CORS配置正确

---

### 测试4: 文件上传（TXT） ✅

**目的**：测试TXT文件上传和文本提取

**接口**：`POST /api/analyze`

#### 准备测试文件

创建 `test.txt`:
```
这是一个测试文件。
用于验证SmartLogos系统的文档上传功能。
系统应该能够提取文本内容并进行AI分析。
```

#### 使用curl
```bash
curl -X POST http://localhost:8080/api/analyze \
  -F "file=@test.txt" \
  -F "target_lang=zh" \
  -F "userId=1"
```

#### 使用Postman
1. Method: POST
2. URL: `http://localhost:8080/api/analyze`
3. Body: form-data
   - Key: `file`, Type: File, Value: 选择test.txt
   - Key: `target_lang`, Type: Text, Value: `zh`
   - Key: `userId`, Type: Text, Value: `1`
4. 点击Send

#### 使用测试网页
1. 打开 `test-api.html`
2. 点击"文件上传与分析"部分
3. 选择test.txt文件
4. 选择语言：中文
5. 输入用户ID：1
6. 点击"上传并分析"

#### 预期结果
```json
{
  "documentId": 1,
  "noteId": 1,
  "summary": "AI生成的摘要内容...",
  "mindMapMd": "# 主题\n## 要点1\n## 要点2",
  "tags": ["#标签1", "#标签2"],
  "quizzes": [
    {
      "question": "题目内容？",
      "options": ["A选项", "B选项", "C选项", "D选项"],
      "answer": "A",
      "explanation": "答案解析"
    }
  ]
}
```

#### 测试通过标准
- HTTP状态码：200
- 返回包含documentId和noteId
- summary不为空
- mindMapMd为Markdown格式
- tags是数组
- quizzes是数组，包含题目对象

---

### 测试5: 文件上传（PDF） ✅

**目的**：测试PDF文件上传和文本提取

#### 准备测试文件
准备一个PDF文件（可以是任何包含文字的PDF）

#### 测试步骤
同测试4，但使用PDF文件

#### 注意事项
- PDF需要包含可提取的文本（不是扫描图片）
- 文件大小不超过20MB
- 处理时间可能较长（10秒左右）

---

### 测试6: 文件上传（Word） ✅

**目的**：测试Word文档上传和文本提取

#### 准备测试文件
准备一个.docx文件

#### 测试步骤
同测试4，但使用.docx文件

---

### 测试7: 文件上传（PPT） ✅

**目的**：测试PowerPoint文件上传和文本提取

#### 准备测试文件
准备一个.pptx文件

#### 测试步骤
同测试4，但使用.pptx文件

---

### 测试8: 多语言支持（中文） ✅

**目的**：验证中文输出功能

#### 测试步骤
上传任意文件，设置 `target_lang=zh`

#### 预期结果
- 摘要为中文
- 思维导图标题为中文
- 标签为中文
- 题目和解析为中文

---

### 测试9: 多语言支持（英文） ✅

**目的**：验证英文输出功能

#### 测试步骤
上传任意文件，设置 `target_lang=en`

#### 预期结果
- 所有输出内容为英文

---

### 测试10: 获取单个笔记 ✅

**目的**：验证笔记详情查询

**接口**：`GET /api/notes/{id}`

#### 使用curl
```bash
curl http://localhost:8080/api/notes/1
```

#### 使用Postman
- Method: GET
- URL: `http://localhost:8080/api/notes/1`

#### 使用测试网页
1. 在"获取笔记详情"部分
2. 输入笔记ID：1
3. 点击"获取笔记"

#### 预期结果
```json
{
  "id": 1,
  "summary": "摘要内容",
  "mindMapContent": "# Markdown思维导图",
  "tags": "[\"#标签1\",\"#标签2\"]",
  "lang": "zh",
  "processTime": "2025-12-03T10:30:00"
}
```

#### 测试通过标准
- HTTP状态码：200
- 返回的笔记ID与请求ID一致
- 包含完整的笔记信息

---

### 测试11: 获取用户笔记列表 ✅

**目的**：验证用户笔记列表查询

**接口**：`GET /api/notes/user/{userId}`

#### 使用curl
```bash
curl http://localhost:8080/api/notes/user/1
```

#### 使用Postman
- Method: GET
- URL: `http://localhost:8080/api/notes/user/1`

#### 预期结果
```json
[
  {
    "id": 1,
    "summary": "笔记1摘要",
    "lang": "zh",
    "processTime": "2025-12-03T10:30:00"
  },
  {
    "id": 2,
    "summary": "笔记2摘要",
    "lang": "zh",
    "processTime": "2025-12-03T10:35:00"
  }
]
```

#### 测试通过标准
- HTTP状态码：200
- 返回数组
- 数组中的笔记都属于指定用户

---

### 测试12: 搜索笔记 ✅

**目的**：验证笔记搜索功能

**接口**：`GET /api/notes/user/{userId}/search?keyword={keyword}`

#### 使用curl
```bash
curl "http://localhost:8080/api/notes/user/1/search?keyword=计算机"
```

#### 使用Postman
- Method: GET
- URL: `http://localhost:8080/api/notes/user/1/search?keyword=计算机`

#### 预期结果
返回包含关键词的笔记列表

#### 测试通过标准
- HTTP状态码：200
- 返回的笔记摘要或标签中包含搜索关键词
- 只返回指定用户的笔记

---

### 测试13: 获取笔记的题目列表 ✅

**目的**：验证题目列表查询

**接口**：`GET /api/notes/{id}/questions`

#### 使用curl
```bash
curl http://localhost:8080/api/notes/1/questions
```

#### 使用Postman
- Method: GET
- URL: `http://localhost:8080/api/notes/1/questions`

#### 预期结果
```json
[
  {
    "id": 1,
    "questionText": "这是一道选择题？",
    "questionType": "MULTIPLE_CHOICE",
    "options": "[\"A\",\"B\",\"C\",\"D\"]",
    "answer": "A",
    "explanation": "答案解析"
  },
  {
    "id": 2,
    "questionText": "这是一道简答题？",
    "questionType": "SHORT_ANSWER",
    "options": null,
    "answer": "参考答案",
    "explanation": "答案解析"
  }
]
```

#### 测试通过标准
- HTTP状态码：200
- 返回数组
- 选择题包含options字段
- 简答题options为null

---

### 测试14: 验证选择题格式 ✅

**目的**：验证选择题数据格式正确

#### 测试要点
- questionType为"MULTIPLE_CHOICE"
- options字段不为null
- options是JSON数组字符串
- answer字段不为空
- explanation字段不为空

---

### 测试15: 验证简答题格式 ✅

**目的**：验证简答题数据格式正确

#### 测试要点
- questionType为"SHORT_ANSWER"
- options字段为null
- answer字段包含参考答案
- explanation字段不为空

---

### 测试16: 基础问答 ✅

**目的**：验证智能问答功能

**接口**：`POST /api/chat`

#### 使用curl
```bash
curl -X POST http://localhost:8080/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "noteId": 1,
    "question": "请解释一下主要内容",
    "targetLang": "zh"
  }'
```

#### 使用Postman
1. Method: POST
2. URL: `http://localhost:8080/api/chat`
3. Headers: `Content-Type: application/json`
4. Body: raw (JSON)
```json
{
  "noteId": 1,
  "question": "请解释一下主要内容",
  "targetLang": "zh"
}
```

#### 使用测试网页
1. 在"智能问答"部分
2. 输入笔记ID：1
3. 输入问题：请解释一下主要内容
4. 选择语言：中文
5. 点击"发送问题"

#### 预期结果
```json
{
  "answer": "根据笔记内容，主要讲述了..."
}
```

#### 测试通过标准
- HTTP状态码：200
- 返回包含answer字段
- answer内容与笔记相关

---

### 测试17: 多轮对话 ✅

**目的**：验证连续对话能力

#### 测试步骤
1. 第一次提问："这篇文章的主题是什么？"
2. 第二次提问："请详细解释第一个要点"
3. 第三次提问："有什么实际应用？"

#### 注意
每次请求都需要传入相同的noteId

---

### 测试18: 不同语言问答 ✅

**目的**：验证多语言问答

#### 测试步骤
1. 中文提问，中文回答：targetLang="zh"
2. 英文提问，英文回答：targetLang="en"

---

### 测试19: 获取文档信息 ✅

**目的**：验证文档信息查询

**接口**：`GET /api/documents/{id}`

#### 使用curl
```bash
curl http://localhost:8080/api/documents/1
```

#### 预期结果
```json
{
  "id": 1,
  "fileName": "test.txt",
  "filePath": "uploads/xxx.txt",
  "contentType": "text/plain",
  "fileSize": 1024,
  "uploadTime": "2025-12-03T10:00:00",
  "status": "COMPLETED"
}
```

#### 测试通过标准
- HTTP状态码：200
- 包含完整的文档信息
- status为"COMPLETED"

---

### 测试20: 获取用户文档列表 ✅

**目的**：验证用户文档列表查询（如果接口存在）

**接口**：`GET /api/documents/user/{userId}`

---

### 测试21: 上传空文件 ❌

**目的**：测试异常处理

#### 测试步骤
不选择文件直接提交

#### 预期结果
- HTTP状态码：400
- 返回错误信息

---

### 测试22: 上传不支持的格式 ❌

**目的**：测试文件格式验证

#### 测试步骤
上传.jpg或.mp4文件

#### 预期结果
- 可能返回400或处理失败
- 或者当作文本尝试处理

---

### 测试23: 获取不存在的笔记 ❌

**目的**：测试404处理

#### 使用curl
```bash
curl http://localhost:8080/api/notes/99999
```

#### 预期结果
- HTTP状态码：404
- 返回错误信息

---

### 测试24: 无效的参数 ❌

**目的**：测试参数验证

#### 测试场景
1. chat接口不传noteId
2. analyze接口不传file
3. 传入非法的target_lang值

#### 预期结果
- HTTP状态码：400
- 返回参数错误信息

---

## 测试数据准备

### 测试文件准备

#### 1. test.txt（必需）
```
SmartLogos智学链测试文档

本文档用于测试系统的文本提取和AI分析功能。

主要测试点：
1. 文本提取是否正确
2. 中文内容处理
3. 摘要生成
4. 思维导图生成
5. 智能出题

预期结果：
- 系统应能正确提取所有文字
- 生成合理的摘要
- 生成结构化的思维导图
- 自动生成相关题目
```

#### 2. test_english.txt（英文测试）
```
SmartLogos Testing Document

This document is used to test the text extraction and AI analysis features.

Test Points:
1. Text extraction accuracy
2. English content processing
3. Summary generation
4. Mind map creation
5. Intelligent question generation

Expected Results:
- System should extract all text correctly
- Generate reasonable summary
- Create structured mind map
- Auto-generate relevant questions
```

#### 3. 测试PDF/Word/PPT
准备任意包含文字的文档即可

### 数据库测试数据

#### 插入测试用户
```sql
USE smartlogos;

INSERT INTO users (username, email, password, create_time) VALUES
('testuser1', 'test1@example.com', 'password123', NOW()),
('testuser2', 'test2@example.com', 'password456', NOW());
```

---

## 预期结果总结

### 成功指标

#### 文件上传接口
- ✅ 支持4种格式：TXT, PDF, DOCX, PPTX
- ✅ 正确提取文本内容
- ✅ 返回完整的分析结果
- ✅ 处理时间在合理范围（10-15秒）

#### 笔记管理接口
- ✅ 能获取单个笔记
- ✅ 能获取用户笔记列表
- ✅ 搜索功能正常

#### 题目管理接口
- ✅ 能获取笔记的题目列表
- ✅ 选择题和简答题格式正确

#### 智能问答接口
- ✅ 能根据笔记内容回答问题
- ✅ 支持中英文问答

#### 异常处理
- ✅ 合理处理错误请求
- ✅ 返回清晰的错误信息

---

## 性能测试

### 响应时间标准

| 接口 | 预期响应时间 | 备注 |
|------|-------------|------|
| 健康检查 | < 100ms | 立即响应 |
| 获取笔记 | < 500ms | 数据库查询 |
| 文件上传（小文件） | < 5s | 不含AI处理 |
| 文件上传（大文件） | 10-15s | 含AI处理 |
| 智能问答 | 3-8s | 依赖AI服务 |

### ��发测试（可选）

使用工具（如JMeter）测试：
- 10个并发用户同时上传文件
- 系统应能正常处理
- 响应时间在可接受范围

---

## 测试报告模板

### 测试报告

**测试日期**：2025-12-03  
**测试人员**：[你的名字]  
**测试环境**：
- 操���系统：Windows 11
- Java版本：17
- MySQL版本：8.0
- 后端版本：1.0.0

#### 测试结果汇总

| 测试项 | 状态 | 备注 |
|--------|------|------|
| 测试1：健康检查 | ✅ 通过 | 响应正常 |
| 测试4：TXT上传 | ✅ 通过 | 功能正常 |
| 测试5：PDF上传 | ✅ 通过 | 文本提取正确 |
| 测试10：获取笔记 | ✅ 通过 | 数据完整 |
| 测试16：智能问答 | ⏳ 待测 | 等待AI服务 |
| ... | ... | ... |

#### 发现的问题

1. **问题1**：[描述问题]
   - 严重程度：高/中/低
   - 复现步骤：[步骤]
   - 预期结果：[预期]
   - 实际结果：[实际]

#### 测试结论

- 通过测试：XX项
- 失败测试：XX项
- 待测试：XX项
- 整体评价：[评价]

---

## 常见问题

### Q1: AI功能无法使用
**A**: AI服务需要单独启动在端口5000。没有AI服务时：
- 文件上传会失败（无法调用AI分析）
- 智能问答无法使用
- 其他功能不受影响

### Q2: 文件上传超时
**A**: 
- 检查文件大小（默认限制20MB）
- AI处理需要10秒左右，请耐心等待
- 查看后端日志确认问题

### Q3: 获取笔记返回404
**A**:
- 确认笔记ID是否存在
- 先上传文件生成笔记后再测试

### Q4: 跨域错误
**A**:
- 确认后端已启动
- 检查CORS配置
- 使用test-api.html测试

---

## 自动化测试脚本

### PowerShell脚本示例

```powershell
# test-all-apis.ps1
Write-Host "开始API测试..." -ForegroundColor Green

# 测试1: 健康检查
Write-Host "`n测试1: 健康检查" -ForegroundColor Yellow
$health = Invoke-RestMethod -Uri "http://localhost:8080/actuator/health"
if ($health.status -eq "UP") {
    Write-Host "✓ 健康检查通过" -ForegroundColor Green
} else {
    Write-Host "✗ 健康检查失败" -ForegroundColor Red
}

# 测试2: 文件上传
Write-Host "`n测试2: 文件上传" -ForegroundColor Yellow
$form = @{
    file = Get-Item "test.txt"
    target_lang = "zh"
    userId = "1"
}
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/api/analyze" `
                                   -Method Post -Form $form
    Write-Host "✓ 文件上传成功" -ForegroundColor Green
} catch {
    Write-Host "✗ 文件上传失败: $_" -ForegroundColor Red
}

# 继续其他测试...
Write-Host "`n测试完成！" -ForegroundColor Green
```

---

## 测试完成检查清单

完成所有测试后，确认：

- [ ] 所有基础接口测试通过
- [ ] 文件上传功能正常（至少2种格式）
- [ ] 笔记管理功能正常
- [ ] 题目管理功能正常
- [ ] 异常处理合理
- [ ] 性能在可接受范围
- [ ] 填写测试报告
- [ ] 记录问题和建议

---

**祝测试顺利！** 🎉

如有问题，参考：
- `HOW_TO_TEST.md` - 测试基础指南
- `API_DOCUMENTATION.md` - 完整API文档
- `COMPILATION_FIX_GUIDE.md` - 编译问题解决

