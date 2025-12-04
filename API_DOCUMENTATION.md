# SmartLogos (智学链) - Backend API Documentation

## 项目概述
SmartLogos 是一个基于AI的多模态知识聚合与辅助学习系统。用户可以上传文档（PDF、Word、PPT、TXT），系统会自动生成摘要、思维导图、智能题目和标签。

## 技术栈
- **后端框架**: Spring Boot 3.2.0
- **数据库**: MySQL 8.0
- **AI处理**: 通义千问Plus (Python后端提供)
- **文档解析**: Apache POI, PDFBox

## 基础配置
- **后端端口**: 8080
- **AI服务端口**: 5000
- **数据库**: smartlogos

---

## API 接口文档

### 1. 文件分析接口（核心功能）

#### POST `/api/analyze`

**功能**: 上传文件并进行AI分析，生成摘要、思维导图、智能题目和标签

**请求参数**:
- `file` (MultipartFile, required): 文件（支持PDF、DOCX、PPTX、TXT）
- `target_lang` (String, optional, default="zh"): 目标语言（"zh"或"en"）
- `userId` (Long, optional): 用户ID

**请求示例**:
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('target_lang', 'zh');
formData.append('userId', 1);

fetch('http://localhost:8080/api/analyze', {
  method: 'POST',
  body: formData
})
.then(response => response.json())
.then(data => console.log(data));
```

**响应结构**:
```json
{
  "documentId": 1,
  "noteId": 1,
  "summary": "这是AI生成的摘要内容...",
  "mindMapMd": "# 根节点\n## 子节点1\n### 细节1\n## 子节点2\n### 细节2",
  "tags": ["#计算机网络", "#TCP协议", "#HTTP"],
  "quizzes": [
    {
      "question": "TCP协议的三次握手过程是什么？",
      "options": ["选项A", "选项B", "选项C", "选项D"],
      "answer": "A",
      "explanation": "TCP三次握手的详细解释..."
    },
    {
      "question": "简述HTTP和HTTPS的区别",
      "options": [],
      "answer": "HTTP是明文传输，HTTPS是加密传输...",
      "explanation": "详细解释..."
    }
  ]
}
```

**重要提示**:
- AI处理时间约10秒，前端需要显示加载动画
- 思维导图返回的是Markdown格式，需要前端渲染
- 题目分为选择题（有options）和简答题（无options）

---

### 2. 智能问答接口

#### POST `/api/chat`

**功能**: 针对某篇笔记进行智能问答

**请求参数** (JSON):
```json
{
  "noteId": 1,
  "question": "请解释一下TCP三次握手",
  "targetLang": "zh"
}
```

**请求示例**:
```javascript
fetch('http://localhost:8080/api/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    noteId: 1,
    question: '请解释一下TCP三次握手',
    targetLang: 'zh'
  })
})
.then(response => response.json())
.then(data => console.log(data.answer));
```

**响应结构**:
```json
{
  "answer": "TCP三次握手是建立连接的过程..."
}
```

**注意事项**:
- 必须传入 `noteId`，否则返回 400 Bad Request
- 建议前端做成悬浮窗形式
- 处理时间约3-5秒

---

### 3. 笔记管理接口

#### GET `/api/notes/{id}`

**功能**: 获取单个笔记详情

**响应结构**:
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

#### GET `/api/notes/user/{userId}`

**功能**: 获取用户的所有笔记列表

**响应**: 返回笔记数组

---

### 4. 题目管理接口

#### GET `/api/notes/{id}/questions`

**功能**: 获取某个笔记的所有题目

**响应结构**:
```json
[
  {
    "id": 1,
    "questionText": "这是一道选择题？",
    "questionType": "MULTIPLE_CHOICE",
    "options": "[\"A选项\",\"B选项\",\"C选项\",\"D选项\"]",
    "answer": "A",
    "explanation": "正确答案的解释"
  },
  {
    "id": 2,
    "questionText": "这是一道简答题？",
    "questionType": "SHORT_ANSWER",
    "options": null,
    "answer": "参考答案内容",
    "explanation": "答案解析"
  }
]
```

**题目类型**:
- `MULTIPLE_CHOICE`: 选择题（有options字段）
- `SHORT_ANSWER`: 简答题（options为null）

---

### 5. 文档管理接口

#### GET `/api/documents/{id}`

**功能**: 获取文档信息

**响应结构**:
```json
{
  "id": 1,
  "fileName": "计算机网络.pdf",
  "filePath": "uploads/xxx.pdf",
  "contentType": "application/pdf",
  "fileSize": 1024000,
  "uploadTime": "2025-12-03T10:00:00",
  "status": "COMPLETED"
}
```

**文档状态**:
- `UPLOADED`: 已上传
- `PROCESSING`: 处理中
- `COMPLETED`: 处理完成
- `ERROR`: 处理失败

---

## 前端开发指南

### 1. 文件上传页面

**需要的元素**:
```html
<input type="file" id="fileInput" accept=".pdf,.docx,.pptx,.txt">
<select id="languageSelect">
  <option value="zh">中文</option>
  <option value="en">English</option>
</select>
<button onclick="uploadFile()">上传分析</button>
<div id="loadingAnimation" style="display:none">
  <!-- 加载动画，显示"AI正在分析中，预计需要10秒..." -->
</div>
```

**上传逻辑**:
```javascript
async function uploadFile() {
  const fileInput = document.getElementById('fileInput');
  const language = document.getElementById('languageSelect').value;
  
  if (!fileInput.files.length) {
    alert('请选择文件');
    return;
  }
  
  const formData = new FormData();
  formData.append('file', fileInput.files[0]);
  formData.append('target_lang', language);
  formData.append('userId', getCurrentUserId()); // 获取当前用户ID
  
  // 显示加载动画
  document.getElementById('loadingAnimation').style.display = 'block';
  
  try {
    const response = await fetch('http://localhost:8080/api/analyze', {
      method: 'POST',
      body: formData
    });
    
    const data = await response.json();
    
    // 隐藏加载动画
    document.getElementById('loadingAnimation').style.display = 'none';
    
    // 显示结果
    displayResults(data);
  } catch (error) {
    console.error('上传失败:', error);
    alert('上传失败，请重试');
  }
}
```

---

### 2. 结果展示页面

#### 摘要展示
```javascript
function displaySummary(summary) {
  document.getElementById('summary').innerHTML = `
    <h2>摘要</h2>
    <p>${summary}</p>
  `;
}
```

#### 思维导图渲染
需要使用Markdown渲染库，推荐：
- **marked.js**: 将Markdown转为HTML
- **markmap**: 专门用于思维导图的可视��库

```javascript
// 使用 marked.js
import { marked } from 'marked';

function displayMindMap(mindMapMd) {
  const html = marked.parse(mindMapMd);
  document.getElementById('mindmap').innerHTML = html;
}
```

或使用 **markmap**:
```javascript
// 使用 markmap 库
import { Transformer } from 'markmap-lib';
import { Markmap } from 'markmap-view';

function displayMindMap(mindMapMd) {
  const transformer = new Transformer();
  const { root } = transformer.transform(mindMapMd);
  const svg = document.getElementById('mindmap-svg');
  Markmap.create(svg, {}, root);
}
```

#### 标签展示
```javascript
function displayTags(tags) {
  const tagsHtml = tags.map(tag => 
    `<span class="tag">${tag}</span>`
  ).join('');
  document.getElementById('tags').innerHTML = tagsHtml;
}
```

#### 题目卡片渲染
```javascript
function displayQuizzes(quizzes) {
  const quizzesHtml = quizzes.map((quiz, index) => `
    <div class="quiz-card" id="quiz-${index}">
      <h3>题目 ${index + 1}</h3>
      <p class="question">${quiz.question}</p>
      ${quiz.options && quiz.options.length > 0 ? `
        <div class="options">
          ${quiz.options.map((option, i) => `
            <button class="option-btn" onclick="selectAnswer(${index}, '${String.fromCharCode(65 + i)}', '${quiz.answer}', '${quiz.explanation}')">
              ${String.fromCharCode(65 + i)}. ${option}
            </button>
          `).join('')}
        </div>
      ` : `
        <textarea id="answer-${index}" placeholder="请输入你的答案"></textarea>
        <button onclick="checkShortAnswer(${index}, '${quiz.answer}', '${quiz.explanation}')">提交答案</button>
      `}
      <div id="result-${index}" class="result" style="display:none"></div>
    </div>
  `).join('');
  
  document.getElementById('quizzes').innerHTML = quizzesHtml;
}

function selectAnswer(quizIndex, selectedAnswer, correctAnswer, explanation) {
  const resultDiv = document.getElementById(`result-${quizIndex}`);
  
  if (selectedAnswer === correctAnswer) {
    resultDiv.innerHTML = `
      <div class="correct">
        ✓ 回答正确！
        <p><strong>解析：</strong>${explanation}</p>
      </div>
    `;
    resultDiv.className = 'result correct';
  } else {
    resultDiv.innerHTML = `
      <div class="incorrect">
        ✗ 回答错误！正确答案是：${correctAnswer}
        <p><strong>解析：</strong>${explanation}</p>
      </div>
    `;
    resultDiv.className = 'result incorrect';
  }
  
  resultDiv.style.display = 'block';
}
```

---

### 3. 智能问答悬浮窗

```html
<div id="chatFloat" class="chat-float">
  <div class="chat-header">
    <h3>智能问答</h3>
    <button onclick="closeChat()">×</button>
  </div>
  <div id="chatMessages" class="chat-messages"></div>
  <div class="chat-input">
    <input type="text" id="chatQuestion" placeholder="输入你的问题...">
    <button onclick="sendQuestion()">发送</button>
  </div>
</div>
```

```javascript
let currentNoteId = null;

function openChat(noteId) {
  currentNoteId = noteId;
  document.getElementById('chatFloat').style.display = 'block';
}

async function sendQuestion() {
  const question = document.getElementById('chatQuestion').value;
  
  if (!question.trim()) {
    alert('请输入问题');
    return;
  }
  
  // 显示用户问题
  appendMessage('user', question);
  
  // 显示加载中
  appendMessage('loading', '思考中...');
  
  try {
    const response = await fetch('http://localhost:8080/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        noteId: currentNoteId,
        question: question,
        targetLang: 'zh'
      })
    });
    
    const data = await response.json();
    
    // 移除加载中
    removeLoadingMessage();
    
    // 显示AI回答
    appendMessage('ai', data.answer);
    
    // 清空输入框
    document.getElementById('chatQuestion').value = '';
  } catch (error) {
    console.error('发送问题失败:', error);
    removeLoadingMessage();
    appendMessage('error', '抱歉，无法获取回答，请稍后重试');
  }
}

function appendMessage(type, content) {
  const messagesDiv = document.getElementById('chatMessages');
  const messageDiv = document.createElement('div');
  messageDiv.className = `message message-${type}`;
  messageDiv.textContent = content;
  messagesDiv.appendChild(messageDiv);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}
```

---

## CSS 样式建议

```css
/* 题目卡片样式 */
.quiz-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  margin: 15px 0;
  background: #fff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.quiz-card .question {
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 15px;
}

.option-btn {
  display: block;
  width: 100%;
  padding: 12px;
  margin: 8px 0;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  text-align: left;
  transition: all 0.3s;
}

.option-btn:hover {
  border-color: #4CAF50;
  background: #f0f8f0;
}

.result.correct {
  background: #d4edda;
  border: 1px solid #c3e6cb;
  color: #155724;
  padding: 15px;
  border-radius: 6px;
  margin-top: 10px;
}

.result.incorrect {
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  color: #721c24;
  padding: 15px;
  border-radius: 6px;
  margin-top: 10px;
}

/* 标签样式 */
.tag {
  display: inline-block;
  padding: 5px 12px;
  margin: 5px;
  background: #e3f2fd;
  color: #1976d2;
  border-radius: 15px;
  font-size: 14px;
}

/* 聊天悬浮窗 */
.chat-float {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 350px;
  height: 500px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.2);
  display: flex;
  flex-direction: column;
}

.chat-header {
  background: #4CAF50;
  color: white;
  padding: 15px;
  border-radius: 10px 10px 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 15px;
}

.message {
  margin: 10px 0;
  padding: 10px;
  border-radius: 8px;
  max-width: 80%;
}

.message-user {
  background: #e3f2fd;
  margin-left: auto;
  text-align: right;
}

.message-ai {
  background: #f5f5f5;
}

.chat-input {
  display: flex;
  padding: 10px;
  border-top: 1px solid #ddd;
}

.chat-input input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  margin-right: 10px;
}

/* 加载动画 */
.loading-animation {
  text-align: center;
  padding: 40px;
}

.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #4CAF50;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
```

---

## 数据库表结构

### users 表
- `id`: 主键
- `username`: 用户名
- `email`: 邮箱
- `password`: 密码
- `create_time`: 创建时间

### documents 表
- `id`: 主键
- `file_name`: 文件名
- `file_path`: 文件路径
- `content_type`: 文件类型
- `file_size`: 文件大小
- `upload_time`: 上传时间
- `status`: 处理状态
- `user_id`: 外键（关联users）

### notes 表
- `id`: 主键
- `summary`: 摘要（TEXT）
- `mind_map_content`: 思维导图Markdown（TEXT）
- `tags`: 标签JSON字符串（TEXT）
- `lang`: 语言
- `process_time`: 处理时间
- `document_id`: 外键（关联documents）

### questions 表
- `id`: 主键
- `question_text`: 题干（TEXT）
- `question_type`: 题目类型（MULTIPLE_CHOICE/SHORT_ANSWER）
- `options`: 选项JSON字符串（TEXT）
- `answer`: 答案（TEXT）
- `explanation`: 解析（TEXT）
- `note_id`: 外键（关联notes）

---

## 常见问题

### 1. CORS跨域问题
后端已配置CORS，允许所有来源访问。如果遇到跨域问题，检查：
- 前端请求URL是否正确
- 是否使用了正确的请求方法

### 2. 文件上传大小限制
默认限制20MB，如需修改，在`application.properties`中调整：
```properties
spring.servlet.multipart.max-file-size=50MB
spring.servlet.multipart.max-request-size=50MB
```

### 3. AI处理超时
AI处理时间约10秒，如果超时：
- 检查AI服务（端口5000）是否正常运行
- 检查网络连接
- 查看后端日志

### 4. 数据库连接失败
检查`application.properties`中的数据库配置：
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/smartlogos?useSSL=false&serverTimezone=UTC&characterEncoding=utf8
spring.datasource.username=root
spring.datasource.password=123456
```

---

## 测试建议

### 使用Postman测试

#### 测试文件上传
1. 创建POST请求：`http://localhost:8080/api/analyze`
2. 选择Body -> form-data
3. 添加字段：
   - `file` (File): 选择测试文件
   - `target_lang` (Text): zh
   - `userId` (Text): 1
4. 发送请求

#### 测试聊天
1. 创建POST请求：`http://localhost:8080/api/chat`
2. 选择Body -> raw -> JSON
3. 输入：
```json
{
  "noteId": 1,
  "question": "请解释一下这个概念",
  "targetLang": "zh"
}
```
4. 发送请求

---

## 联系方式
如有问题，请联系后端开发团队。

