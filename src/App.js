import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { Layout, Button, Space } from 'antd';
import Home from './pages/Home';
import NoteDetail from './pages/NoteDetail';
import FileUpload from './components/FileUpload';
import QuizList from './pages/QuizList';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import './App.css';

const { Header, Content, Footer } = Layout;

function App() {
  return (
    <Router>
      <AuthProvider>
        <Layout className="layout">
          <Header className="app-header">
            <Link to="/" className="logo">智学链 · SmartLogos</Link>
            <NavRight />
          </Header>
          <Content className="app-content">
            <div className="app-shell">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                  path="/upload"
                  element={
                    <ProtectedRoute>
                      <FileUpload />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/note/:id"
                  element={
                    <ProtectedRoute>
                      <NoteDetail />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/quizzes"
                  element={
                    <ProtectedRoute>
                      <QuizList />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </div>
          </Content>
          <Footer className="app-footer">
            智学链 ©{new Date().getFullYear()} · AI 学习助手
          </Footer>
        </Layout>
      </AuthProvider>
    </Router>
  );
}

const NavRight = () => {
  const { isAuthed, user, logout } = useAuth();
  return (
    <Space size="large" align="center">
      <Link className="nav-link" to="/">首页</Link>
      <Link className="nav-link" to="/upload">文件上传</Link>
      <Link className="nav-link" to="/quizzes">题目查询</Link>
      {isAuthed ? (
        <Space>
          <span className="nav-user">{user?.username || '用户'}</span>
          <Button size="small" onClick={logout}>退出</Button>
        </Space>
      ) : (
        <Space>
          <Link className="nav-link" to="/login">登录</Link>
          <Link className="nav-link primary" to="/register">注册</Link>
        </Space>
      )}
    </Space>
  );
};

export default App;