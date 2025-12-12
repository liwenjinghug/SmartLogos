智学链 (SmartLogos) 前端项目说明
项目介绍
智学链是一个基于 React + Ant Design 的 AI 知识聚合系统前端，主要功能包括：
文件上传与 AI 分析
笔记详情查看（含摘要、思维导图）
AI 提取题目管理与查询
基于笔记内容的 AI 问答交互
前端通过调用后端 API 实现数据交互，提供直观的用户界面和流畅的操作体验，帮助用户高效管理和利用文档知识。
项目结构
plaintext
src/
├── api/                 # API接口调用封装（需自行实现）
├── components/          # 通用组件
│   ├── FileUpload.js    # 文件上传组件
│   ├── LoadingSpinner.js # 加载动画组件
│   └── NoteDetail.js    # 笔记详情组件（备用）
├── pages/               # 页面组件
│   ├── Home.js          # 首页（文档列表）
│   ├── NoteDetail.js    # 笔记详情页
│   ├── QuizList.js      # 题目查询页
│   └── FileUpload.js    # 上传页面（已迁移至components）
├── App.js               # 路由配置
├── App.css              # 全局样式
├── index.js             # 入口文件
└── index.css            # 基础样式
核心文件说明：
App.js：配置路由映射关系，定义页面导航结构
pages/Home.js：展示用户文档列表，集成文件上传功能
pages/NoteDetail.js：展示笔记详情、AI 生成的题目及问答功能
pages/QuizList.js：提供题目筛选、搜索和展示功能
components/FileUpload.js：处理文件上传逻辑及进度展示
运行步骤
环境准备
bash
运行
# 安装依赖
npm install
# 或
yarn install
解决依赖问题
bash
运行
# 安装缺失的依赖包
npm install rehype-sanitize react-markdown react-spinners react-router-dom@6 antd
启动项目
bash
运行
npm start
# 或
yarn start
访问地址项目启动后，默认地址为：http://localhost:3000
后端适配要求
为确保前端正常运行，后端需提供以下接口支持，并处理跨域问题：
1. 跨域配置（必须）
后端需在响应头中添加跨域许可，允许前端域名访问：
http
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
2. 接口规范
文档管理
获取用户文档列表
路径：GET /api/documents?user_id={userId}
返回示例：
json
[
  {
    "id": 1,
    "fileName": "test.pdf",
    "contentType": "application/pdf",
    "fileSize": 102400,
    "uploadTime": "2023-10-01T12:00:00Z",
    "status": "COMPLETED" // UPLOADED/PROCESSING/COMPLETED/ERROR
  }
]
文件上传
路径：POST /api/upload?target_lang=zh
请求体：multipart/form-data 格式，包含 file 字段
返回示例：
json
{ "process_id": "xxx-xxx-xxx" }
查询 AI 处理状态
路径：GET /api/status?process_id={processId}
返回示例：
json
{ "status": "completed" } // processing/completed/failed
笔记详情
获取笔记详情
路径：GET /api/notes/{noteId}
返回示例：
json
{
  "filename": "test.pdf",
  "summary": "文档摘要内容...",
  "mind_map": "# 思维导图\n- 主题1\n  - 子主题",
  "quizzes": [
    {
      "question": "测试问题？",
      "options": { "A": "选项A", "B": "选项B" },
      "answer": "A"
    }
  ],
  "tags": ["标签1", "标签2"]
}
题目管理
获取题目列表
路径：GET /api/quizzes?note_id={noteId}（note_id 可选）
返回示例：
json
[
  {
    "id": 1,
    "note_id": 1,
    "question": "测试问题？",
    "options": { "A": "选项A" },
    "answer": "A"
  }
]
保存题目到数据库
路径：POST /api/quizzes/save
请求体：
json
{ "note_id": 1, "quizzes": [{ "question": "...", "options": {}, "answer": "..." }] }
AI 问答
与笔记内容对话
路径：POST /api/chat
请求体：
json
{ "question": "用户问题", "context": "笔记摘要内容" }
返回示例：
json
{ "answer": "AI回答内容" }
3. 错误处理
后端接口应返回统一的错误格式，便于前端处理：
json
{ "error": "错误信息描述", "code": 错误码 }
注意事项
前端使用 React Router v6，路由配置采用Routes和element属性
Ant Design 组件需使用正确的导入方式（如Text需从Typography导入）
涉及文件上传和 AI 处理的接口需要保持响应格式一致
建议后端添加请求频率限制，防止恶意请求
一、必须配置的跨域规则（解决 CORS 报错）
这是当前最紧急的需求，否则所有接口请求都会被浏览器拦截：
允许的源（Origin）：http://localhost:3000（前端运行的地址）；
允许的请求方法：GET、POST、OPTIONS（尤其是OPTIONS，浏览器预检请求需要）；
允许的请求头：Content-Type、Authorization等（建议配置为*，兼容所有请求头）；
允许携带凭证（Credentials）：true（如果需要用户登录态 / COOKIE 传递）；
生效范围：所有/api/*开头的接口（包括/api/documents、/api/analyze等）。
参考配置示例（不同后端框架）：
SpringBoot：
java
运行
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:3000")
                .allowedMethods("GET", "POST", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600); // 预检请求缓存时间，减少OPTIONS请求
    }
}
Node.js/Express：
javascript
运行
const cors = require('cors');
app.use('/api', cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: '*',
    credentials: true
}));
二、需要实现的核心接口规范
前端代码中已调用以下接口，后端需严格按此规范实现：
1. 文档列表查询接口
请求方式：GET
接口路径：/api/documents
请求参数：URL 参数 user_id（示例值：1，前端固定传 1 或按实际用户体系调整）
返回格式（JSON）：
json
{
  "code": 200,
  "data": [
    {
      "id": "文档唯一标识",
      "filename": "文件名（如xxx.pdf）",
      "upload_time": "上传时间（如2025-12-12 10:00:00）",
      "summary": "文档摘要（可选）"
    }
  ],
  "msg": "success"
}
2. 文件 AI 分析接口（核心）
请求方式：POST
接口路径：/api/analyze
请求参数：
参数名	类型	说明
file	二进制文件流	前端上传的文件（PDF / 图片等）
target_lang	String（可选）	目标语言，值为 "zh"（默认）或 "en"
特殊要求：
接口需支持multipart/form-data格式（接收文件流）；
处理时间约 10 秒，后端无需主动断开连接，保持请求存活；
建议返回实时进度（可选，前端可展示进度条）。
返回格式（JSON）：
json
{
  "code": 200,
  "data": {
    "filename": "原文件名",
    "summary": "AI生成的文档摘要",
    "mind_map": "思维导图内容（markdown或JSON格式）",
    "quizzes": [ // AI提取的题目列表
      {
        "question": "题目内容",
        "options": ["选项A", "选项B", "选项C"],
        "answer": "正确答案",
        "analysis": "题目解析"
      }
    ]
  },
  "msg": "分析完成"
}
3. 笔记详情查询接口
请求方式：GET
接口路径：/api/documents/{id}（{id} 为文档唯一标识）
返回格式：同/api/analyze的data结构（包含 summary、mind_map、quizzes）。
4. 题目列表查询接口
请求方式：GET
接口路径：/api/quizzes
请求参数：URL 参数 user_id（可选，按用户筛选）
返回格式（JSON）：
json
{
  "code": 200,
  "data": [
    {
      "id": "题目唯一标识",
      "document_id": "关联文档ID",
      "question": "题目内容",
      "options": ["选项A", "选项B"],
      "answer": "正确答案",
      "analysis": "解析"
    }
  ],
  "msg": "success"
}
三、额外适配提醒
错误处理：后端接口返回错误时（如文件格式不支持、AI 调用失败），需返回统一格式：
json
{
  "code": 500, // 非200代表失败
  "msg": "具体错误信息（如文件解析失败/AI调用超时）",
  "data": null
}
端口确认：后端需运行在localhost:8080（前端 axios 已固定指向该端口，若后端要改端口，需同步告知前端修改）；
AI 调用适配：/api/analyze接口内部需集成 “通义千问 plus”，并处理 10 秒左右的调用耗时，确保接口不超时。
总结
后端核心需要修改 / 实现的内容：
配置允许localhost:3000的跨域规则（解决 CORS 报错）；
按上述规范实现 4 个核心接口，重点保证/api/analyze支持文件流 + 语言参数；
统一接口返回格式，适配前端的错误处理逻辑。