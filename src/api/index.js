import axios from 'axios';

// 保留原有基础地址配置，仅补充新接口
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api';

// 1. 替换/新增文件上传接口（适配新的analyze接口）
export const uploadFile = (formData, targetLang = "zh") => {
  return axios.post(`${API_BASE_URL}/analyze`, formData, {
    params: { target_lang: targetLang }, // 传递目标语言参数
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (progressEvent) => {
      const percent = Math.round((progressEvent.loaded / progressEvent.total) * 100);
      console.log("上传进度：", percent); // 可关联UI进度条
    },
  });
};

// 2. 新增AI分析状态查询接口（依赖后端提供）
export const getAIStatus = (processId) => {
  return axios.get(`${API_BASE_URL}/status`, { 
    params: { process_id: processId } 
  });
};

// 3. 新增聊天接口（适配chat接口）
export const chatWithNote = (question, context) => {
  return axios.post(`${API_BASE_URL}/chat`, {
    question: question,
    context: context,
  });
};

// 保留原有其他接口（如获取文档列表、笔记详情等，无需修改）
export const getUserDocuments = (userId) => {
  return axios.get(`${API_BASE_URL}/documents`, { params: { user_id: userId } });
};

export const getNoteDetail = (noteId) => {
  return axios.get(`${API_BASE_URL}/notes/${noteId}`);
};
export const saveQuizzesToDB = (noteId, quizzes) => {
  return axios.post(`${API_BASE_URL}/memberA/quizzes`, {
    note_id: noteId,
    quizzes: quizzes,
    user_id: 1 // 测试用户ID，后续可替换为真实用户ID
  }, {
    headers: { 'Content-Type': 'application/json' }
  });
};
export const getQuizzesFromDB = (params = {}) => {
  const queryParams = { user_id: 1, ...params };
  return axios.get(`${API_BASE_URL}/memberA/quizzes`, {
    params: queryParams
  });
};