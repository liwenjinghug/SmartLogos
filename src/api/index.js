import axios from 'axios';

const trimSlash = (s) => String(s || '').replace(/\/+$/, '');

const isHttps =
  typeof window !== 'undefined' &&
  window.location &&
  window.location.protocol === 'https:';

// 数据服务：本地默认直连；部署到 https（如 Vercel）时自动走同源代理（/api）避免 Mixed Content/CORS
const API_BASE_URL = (() => {
  const env = trimSlash(process.env.REACT_APP_API_BASE_URL);
  if (env) {
    if (isHttps && env.startsWith('http://')) return '';
    return env;
  }
  return isHttps ? '' : 'http://47.108.189.246:8006';
})();

// AI 服务：同理，https 下自动走同源代理（/ai）
const AI_API_BASE_URL = (() => {
  const env = trimSlash(process.env.REACT_APP_AI_BASE_URL);
  if (env) {
    if (isHttps && env.startsWith('http://')) return '/ai';
    return env;
  }
  return isHttps ? '/ai' : 'http://47.108.189.246:8005';
})();

// ========== 辅助函数：处理统一返回格式 ==========
const handleResponse = (response) => {
  const { code, msg, data } = response.data;
  if (code !== 200) {
    throw new Error(msg || '请求失败');
  }
  return data;
};

// ========== AI 服务接口 ==========

// 1) AI：文件解析 + 结构化输出
export const analyzeFile = (formData, targetLang = 'zh', onUploadProgress) => {
  return axios.post(`${AI_API_BASE_URL}/api/analyze`, formData, {
    params: { target_lang: targetLang },
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress,
  });
};

// 兼容旧命名（项目里原本叫 uploadFile）
export const uploadFile = analyzeFile;

// 2) AI：智能问答（需要携带当前笔记的文本上下文/或 Note ID）
export const chatWithNote = (question, context) => {
  return axios.post(`${AI_API_BASE_URL}/api/chat`, {
    question,
    context,
  });
};

// ========== 数据服务接口（MemberA）==========

// 1) 获取文档列表
export const getUserDocuments = async (userId = 1) => {
  const response = await axios.get(`${API_BASE_URL}/api/documents`, {
    params: { user_id: userId },
  });
  return handleResponse(response);
};

// 1.1) 上传文档（返回 document_id）
export const uploadDocument = async (formData, userId) => {
  const response = await axios.post(`${API_BASE_URL}/api/documents/upload`, formData, {
    params: { user_id: userId },
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return handleResponse(response);
};

// 2) 获取笔记详情
export const getNoteDetail = async (documentId) => {
  const response = await axios.get(`${API_BASE_URL}/api/documents/${documentId}`);
  return handleResponse(response);
};

// 3) 落库接口：保存笔记与题目（AI分析结果）
export const saveNoteData = async (documentId, analysisData) => {
  const response = await axios.post(
    `${API_BASE_URL}/api/notes`,
    analysisData,
    {
      params: { document_id: documentId },
      headers: { 'Content-Type': 'application/json' },
    }
  );
  return handleResponse(response);
};

// 4) 获取题目列表
export const getQuizzesFromDB = async (params = {}) => {
  const response = await axios.get(`${API_BASE_URL}/api/quizzes`, {
    params,
  });
  return handleResponse(response);
};

// 5) 按笔记查询题目
export const getQuizzesByNoteId = async (noteId) => {
  const response = await axios.get(`${API_BASE_URL}/api/notes/${noteId}/questions`);
  return handleResponse(response);
};

// 6) 用户登录/注册
export const loginApi = async ({ username, password }) => {
  const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
    username,
    password,
  });
  return handleResponse(response);
};

export const registerApi = async ({ username, email, password }) => {
  const response = await axios.post(`${API_BASE_URL}/api/auth/register`, {
    username,
    email,
    password,
  });
  return handleResponse(response);
};

// ========== 兼容旧接口（已废弃，保留以防万一）==========
export const saveQuizzesToDB = (noteId, quizzes) => {
  console.warn('saveQuizzesToDB is deprecated, use saveNoteData instead');
  return axios.post(
    `${API_BASE_URL}/api/notes`,
    { quizzes },
    {
      params: { document_id: noteId },
      headers: { 'Content-Type': 'application/json' },
    }
  );
};