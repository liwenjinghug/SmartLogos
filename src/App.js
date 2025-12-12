import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'; // 替换Switch为Routes
import { Layout } from 'antd';
import Home from './pages/Home';
import NoteDetail from './pages/NoteDetail';
import FileUpload from './components/FileUpload'; // 修正路径
import QuizList from './pages/QuizList';
import './App.css';

const { Header, Content, Footer } = Layout;

function App() {
  return (
    <Router>
      <Layout className="layout">
        <Header style={{ background: '#fff', padding: '0 20px' }}>
          <div className="logo" style={{ fontSize: 24, fontWeight: 'bold', color: '#1890ff', lineHeight: '64px' }}>
            智学链 - SmartLogos
          </div>
          <div style={{ float: 'right', lineHeight: '64px' }}>
            <a href="/" style={{ margin: '0 10px' }}>首页</a>
            <a href="/upload" style={{ margin: '0 10px' }}>文件上传</a>
            <a href="/quizzes" style={{ margin: '0 10px' }}>题目查询</a>
          </div>
        </Header>
        <Content style={{ padding: '0 50px', marginTop: 20 }}>
          <div style={{ background: '#fff', padding: 24, minHeight: 280 }}>
            {/* 使用Routes替代Switch，路由配置使用element属性 */}
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/upload" element={<FileUpload />} />
              <Route path="/note/:id" element={<NoteDetail />} />
              <Route path="/quizzes" element={<QuizList />} />
            </Routes>
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          智学链 ©{new Date().getFullYear()} Created with React + Ant Design
        </Footer>
      </Layout>
    </Router>
  );
}

export default App;