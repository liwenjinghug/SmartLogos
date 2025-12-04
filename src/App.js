import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from 'antd';
import Home from './pages/Home';
import NoteDetail from './pages/NoteDetail';
import 'antd/dist/reset.css'; // Ant Design样式

const { Header, Content, Footer } = Layout;

function App() {
  return (
    <Router>
      <Layout style={{ minHeight: '100vh' }}>
        <Header style={{ background: '#fff', padding: '0 20px' }}>
          <h1 style={{ color: '#1890ff', margin: 0, lineHeight: '64px' }}>智学链 (SmartLogos)</h1>
        </Header>
        <Content>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/note/:documentId" element={<NoteDetail />} />
          </Routes>
        </Content>
        <Footer style={{ textAlign: 'center' }}>智学链 ©2025</Footer>
      </Layout>
    </Router>
  );
}

export default App;