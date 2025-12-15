# 前端对接后端数据服务说明

## 已完成的修改

### 1. API 接口封装（src/api/index.js）

已适配后端统一返回格式 `{ code: 200, msg: "success", data: ... }`，并更新了所有接口：

**数据服务接口（端口 8006）：**
- `getUserDocuments(userId)` - GET /api/documents?user_id={userId}
- `getNoteDetail(documentId)` - GET /api/documents/{id}
- `saveNoteData(documentId, analysisData)` - POST /api/notes?document_id={id}
- `getQuizzesFromDB(params)` - GET /api/quizzes
- `getQuizzesByNoteId(noteId)` - GET /api/notes/{noteId}/questions

**AI 服务接口（端口 8005）：**
- `analyzeFile(formData, targetLang, onProgress)` - POST /api/analyze
- `chatWithNote(question, context)` - POST /api/chat

### 2. 页面组件修改

**Home.js（首页文档列表）**
- 适配新的 `getUserDocuments` 返回格式
- 兼容字段名：`filename`、`upload_time`、`file_size`

**NoteDetail.js（笔记详情页）**
- 适配新的 `getNoteDetail` 返回格式
- 兼容字段名：`mind_map`/`mind_map_md`、`explanation`/`analysis`
- 修复了 react-router-dom v7 的 `useParams` 兼容性

**QuizList.js（题目列表页）**
- 适配新的 `getQuizzesFromDB` 返回格式
- 兼容字段名：`document_id`/`note_id`

**FileUpload.js（文件上传组件）**
- AI 分析完成后，预留了落库逻辑接口（需要 document_id）
- 目前已注释落库调用，等明确 document_id 来源后启用

### 3. 环境变量配置

创建了 `.env.example` 文件：
```
REACT_APP_AI_BASE_URL=http://47.108.189.246:8005
REACT_APP_API_BASE_URL=http://47.108.189.246:8006
```

## 需要后端配合完成的事项

### 1. 文件上传流程

**当前问题：**
前端调用 AI 服务分析文件后，需要将结果保存到数据库，但需要一个 `document_id` 作为关联。

**建议方案A（推荐）：**
1. 前端上传文件时，先调用数据服务创建文档记录：
   ```
   POST /api/documents
   Body: { filename, user_id }
   Response: { code: 200, data: { document_id: 123 } }
   ```
2. 拿到 `document_id` 后，前端调用 AI 服务分析
3. AI 分析完成后，调用 `POST /api/notes?document_id=123` 保存结果

**建议方案B：**
前端直接调用 AI 服务，AI 服务内部自动调用数据服务创建文档并保存结果（需要 AI 服务与数据服务通信）

### 2. 字段名统一建议

**题目字段：**
- 后端返回：`analysis`（解析）
- AI 返回：`explanation`（解释）
- 建议统一为：`explanation` 或在后端做字段映射

**思维导图字段：**
- 后端返回：`mind_map`
- AI 返回：`mind_map_md`
- 前端已做兼容处理

### 3. CORS 配置

确保数据服务（端口 8006）允许前端域名：
```
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

## 本地测试步骤

1. **复制环境变量文件：**
   ```bash
   cp .env.example .env
   ```

2. **安装依赖：**
   ```bash
   npm install
   ```

3. **启动开发服务器：**
   ```bash
   npm start
   ```
   打开 http://localhost:3000

4. **测试功能：**
   - 上传文件 → AI 分析（约10秒）
   - 查看文档列表
   - 查看笔记详情（思维导图、选择题、问答）
   - 题目列表查询

## 完整对接流程示例

```javascript
// 1. 用户上传文件
const file = selectedFile;
const formData = new FormData();
formData.append('file', file);

// 2. (可选) 先创建文档记录获取 document_id
// const { document_id } = await createDocument({ filename: file.name, user_id: 1 });

// 3. 调用 AI 服务分析
const aiResult = await analyzeFile(formData, 'zh');
// aiResult.data: { filename, summary, mind_map_md, quizzes, tags }

// 4. 保存到数据库
await saveNoteData(document_id, aiResult.data);

// 5. 刷新文档列表
const documents = await getUserDocuments(1);
```

## 错误处理

所有数据服务接口已统一处理错误：
- 当 `code !== 200` 时，会抛出错误并显示 `msg` 内容
- 前端页面会用 `message.error()` 显示错误提示

## 联系与反馈

如遇到接口对接问题，请提供：
1. 接口路径和参数
2. 返回的完整 JSON
3. 控制台错误信息

前端已构建成功，所有代码无编译错误。
