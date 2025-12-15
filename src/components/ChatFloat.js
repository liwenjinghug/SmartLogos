import React, { useMemo, useState } from 'react';
import { Button, Card, Input, List, Typography, message, FloatButton, Space } from 'antd';
import { chatWithNote } from '../api';

const { Text } = Typography;

const buildContext = (context) => {
  if (!context) return '';
  if (typeof context === 'string') return context;
  try {
    return JSON.stringify(context);
  } catch {
    return String(context);
  }
};

const ChatFloat = ({ context, title = '智能问答' }) => {
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [question, setQuestion] = useState('');
  const [history, setHistory] = useState([]);

  const contextText = useMemo(() => buildContext(context), [context]);

  const onSend = async () => {
    const q = question.trim();
    if (!q) return;
    if (!contextText) {
      message.warning('当前没有可用的笔记上下文，无法问答');
      return;
    }

    setSending(true);
    try {
      setHistory((prev) => [...prev, { role: 'user', content: q }]);
      setQuestion('');
      const res = await chatWithNote(q, contextText);
      setHistory((prev) => [...prev, { role: 'ai', content: res?.data?.answer || '暂无回答' }]);
    } catch (err) {
      message.error('问答失败：' + (err?.message || '未知错误'));
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <FloatButton
        tooltip={title}
        onClick={() => setOpen(true)}
      />
      {open && (
        <div className="chat-float-panel">
          <Card
            title={title}
            size="small"
            bordered={false}
            extra={
              <Button size="small" onClick={() => setOpen(false)}>
                关闭
              </Button>
            }
          >
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <Input
                placeholder="针对当前笔记提问..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onPressEnter={onSend}
                disabled={sending}
              />
              <Button type="primary" onClick={onSend} disabled={sending || !question.trim()}>
                发送
              </Button>
            </div>

            <div className="chat-float-history">
              <List
                dataSource={history}
                locale={{ emptyText: '暂无对话，输入问题开始吧' }}
                renderItem={(item, idx) => (
                  <List.Item key={idx} style={{ alignItems: 'flex-start' }}>
                    <div style={{ width: '100%' }}>
                      <Space size={6} align="start">
                        <Text strong>{item.role === 'user' ? '我' : 'AI'}：</Text>
                        <div style={{ whiteSpace: 'pre-wrap' }}>{item.content}</div>
                      </Space>
                    </div>
                  </List.Item>
                )}
              />
            </div>
          </Card>
        </div>
      )}
    </>
  );
};

export default ChatFloat;
