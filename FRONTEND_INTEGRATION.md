# SmartLogos 前端对接文档

本后端提供“文档/笔记/题库（MemberA 数据服务）”，AI 解析与问答由独立 AI 服务提供。前端需分别对接两套服务：

- AI接口（已实现）
- 数据服务（本项目）：`REACT_APP_API_BASE_URL`（示例`http://47.108.189.246:8006`）
  - 登录/注册
  - 文档上传→生成 `document_id`
  - 笔记落库/题目查询

## 环境变量（前端）

在前端项目根目录新增 `.env`：

```
REACT_APP_API_BASE_URL=http://47.108.189.246:8006
```

说明：
- `REACT_APP_API_BASE_URL` 用于认证、文档/笔记/题库等“入库与查询”。

## 接口规范（本数据服务）

所有接口统一返回格式：
```json
{ "code": 200, "msg": "success", "data": ... }
```
失败示例：
```json
{ "code": 500, "msg": "错误信息", "data": null }
```

### 0) 登录/注册
- 路径：`POST /api/auth/register`，`POST /api/auth/login`
- 请求示例：`{ "username": "user1", "email": "a@b.com", "password": "123456" }`（登录时可用 username 或 email 填在 `username` 字段）
- 返回示例：`{ "code": 200, "msg": "success", "data": { "id": 1, "username": "user1", "email": "a@b.com", "token": null } }`

### 1) 文档上传（获取 document_id）
- 路径：`POST /api/documents/upload?user_id={userId}`
- 表单：`file`（multipart/form-data）
- 返回：`{ code: 200, msg: "文件上传成功", data: { id, filename, upload_time, status } }`
- 说明：返回的 `data.id` 即 `document_id`，前端需在 FileUpload 处拿到后续落库使用。

### 2) 文档列表
- 路径：`GET /api/documents?user_id={userId}`
- 示例返回：
```json
{
  "code": 200,
  "data": [
    {
      "id": 1,
      "filename": "test.pdf",
      "upload_time": "2025-12-12 10:00:00",
      "summary": "摘要（可选）",
      "status": "COMPLETED"
    }
  ],
  "msg": "success"
}
```

### 3) 笔记详情
- 路径：`GET /api/documents/{id}`
- 返回结构（与 AI 分析保持一致，便于前端展示）：
```json
{
  "code": 200,
  "data": {
    "filename": "test.pdf",
    "summary": "文档摘要...",
    "mind_map": "# 思维导图 Markdown ...",
    "quizzes": [
      {
        "question": "题目内容",
        "options": ["A", "B", "C"],
        "answer": "A",
        "analysis": "解析说明"
      }
    ],
    "tags": ["标签1", "标签2"]
  },
  "msg": "success"
}
```

### 4) 题目列表
- 路径：`GET /api/quizzes`（可选 `note_id`）
- 示例返回：
```json
{
  "code": 200,
  "data": [
    {
      "id": 1,
      "document_id": 1,
      "question": "题目内容",
      "options": ["A", "B"],
      "answer": "A",
      "analysis": "解析"
    }
  ],
  "msg": "success"
}
```



## 前端调用示例（axios）

```js
// 环境变量
const AI_BASE = process.env.REACT_APP_AI_BASE_URL;
const API_BASE = process.env.REACT_APP_API_BASE_URL;

// 1. 获取文档列表
export async function fetchDocuments(userId = 1) {
  const url = `${API_BASE}/documents?user_id=${userId}`;
  const { data } = await axios.get(url);
  return data; // { code, msg, data }
}

// 2. 获取笔记详情
export async function fetchNoteDetail(id) {
  const url = `${API_BASE}/documents/${id}`;
  const { data } = await axios.get(url);
  return data; // { code, msg, data }
}

// 3. 查询题目列表
export async function fetchQuizzes(params = {}) {
  const query = new URLSearchParams(params).toString();
  const url = `${API_BASE}/quizzes?${query}`;
  const { data } = await axios.get(url);
  return data; // { code, msg, data }
}

```

## 端口与部署

- 数据服务（本项目）：默认http://47.108.189.246:8006

Docker 一键部署详见 [DEPLOYMENT.md](DEPLOYMENT.md)。

## 对接流程建议

1. 用户登录/注册 → 调用 `/api/auth/login|register`，拿到 `id/username`（token 字段预留，当前未下发 JWT）。
2. 上传文件 → 调用本数据服务 `POST /api/documents/upload?user_id={userId}`，拿到 `document_id`。
3. 调用 AI 服务 `/api/analyze` 获得 `summary/mind_map_md/tags/quizzes`。
4. 落库：调用本数据服务 `POST /api/notes?document_id={id}` 保存笔记与题目（请求体直接传 AI 返回的 JSON，字段名保持一致）。
5. 展示笔记详情与题目 → 调用本数据服务 `GET /api/documents/{id}` 或 `GET /api/notes/{noteId}/questions`。
6. 问答交互 → 前端直接调用 AI 服务 `/api/chat`。

## 错误处理约定

- 本数据服务统一错误返回：`{ code: 500, msg, data: null }`
- 前端应检查 `code !== 200` 的情况并友好提示
- AI 服务错误由前端自行处理并提示（如网络失败/超时）

---

落库接口已提供：
- `POST /api/notes?document_id={id}`：请求体为 AI 返回的 `summary/mind_map_md/tags/quizzes`
- `GET /api/notes/{noteId}/questions`：按笔记查询题目