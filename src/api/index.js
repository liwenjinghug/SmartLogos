import axios from 'axios';
const API_BASE_URL = 'http://localhost:8080/api';

// 创建axios实例
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // AI处理超时60秒
});

// 1. AI核心分析接口（替代原文件上传）
export const analyzeFile = (formData) => {
  return api.post('/analyze', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    // 进度回调（显示上传进度）
    onUploadProgress: (progressEvent) => {
      const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
      console.log('文件上传进度：', percentCompleted + '%');
    }
  });
};

// 2. 获取用户文档列表
export const getUserDocuments = (userId) => {
  return api.get(`/documents/user/${userId}`);
};

// 3. 获取文档笔记（适配新Notes表结构）
export const getNoteByDocumentId = (documentId) => {
  return api.get(`/notes/document/${documentId}`);
};

// 4. 获取文档问题（适配新Questions表结构）
export const getDocumentQuestions = (documentId, userId) => {
  return api.get(`/documents/${documentId}/questions?userId=${userId}`);
};

// 5. 获取思维导图（适配mind_map_content）
export const getMindMap = (noteId) => {
  return api.get(`/notes/${noteId}/mindmap`);
};

export default api;