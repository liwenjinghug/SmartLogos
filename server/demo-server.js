const path = require('path');
const crypto = require('crypto');
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const axios = require('axios');

const PORT = Number(process.env.PORT || 3000);

// 后端地址（可通过环境变量覆盖）
const API_TARGET = process.env.API_TARGET || 'http://47.108.189.246:8006';
const AI_TARGET = process.env.AI_TARGET || 'http://47.108.189.246:8005';

const app = express();

// demo session -> upstream cookie (e.g., JSESSIONID=...)
const sessionStore = new Map();

const parseCookies = (cookieHeader) => {
  const result = {};
  String(cookieHeader || '')
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .forEach((part) => {
      const eq = part.indexOf('=');
      if (eq <= 0) return;
      const key = part.slice(0, eq).trim();
      const value = part.slice(eq + 1).trim();
      result[key] = decodeURIComponent(value);
    });
  return result;
};

const newDemoSid = () => crypto.randomBytes(16).toString('hex');

const extractUpstreamCookie = (setCookieHeaders) => {
  const list = Array.isArray(setCookieHeaders)
    ? setCookieHeaders
    : setCookieHeaders
      ? [setCookieHeaders]
      : [];
  const jsession = list.find((c) => String(c).toUpperCase().startsWith('JSESSIONID='));
  if (!jsession) return null;
  // keep only "JSESSIONID=..." part
  return String(jsession).split(';')[0];
};

// =========================
// Auth (演示模式)
// =========================
// 说明：当前 8006 的 /api/auth/login 会 302 跳转到 /login（Spring Security 默认表单登录）
// 浏览器在 XHR 下跟随跨域跳转会触发 CORS，导致“局域网访问无法登录”。
// 这里把登录/注册做成同源 JSON 接口，前端无需改代码。

app.post('/api/auth/login', express.json(), async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ code: 400, msg: '缺少用户名或密码', data: null });
  }

  try {
    // 不跟随跳转：通过 Location 判断成功/失败，并拿到 JSESSIONID
    const upstream = await axios.post(
      `${API_TARGET}/login`,
      new URLSearchParams({
        username: String(username),
        password: String(password),
      }).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        maxRedirects: 0,
        validateStatus: () => true,
      }
    );

    const location = String(upstream.headers?.location || '');
    const ok = upstream.status === 302 && !location.includes('error');

    if (!ok) {
      return res.status(401).json({ code: 401, msg: '用户名或密码错误', data: null });
    }

    const upstreamCookie = extractUpstreamCookie(upstream.headers?.['set-cookie']);
    const demoSid = newDemoSid();
    if (upstreamCookie) {
      sessionStore.set(demoSid, upstreamCookie);
    }

    // 给浏览器一个同源 cookie，用于之后的 /api 反代自动附带 JSESSIONID
    res.setHeader(
      'Set-Cookie',
      `demo_sid=${encodeURIComponent(demoSid)}; Path=/; HttpOnly; SameSite=Lax`
    );

    return res.json({
      code: 200,
      msg: 'success',
      data: {
        id: 1,
        username: String(username),
        email: null,
        token: 'demo',
      },
    });
  } catch (err) {
    console.error('[demo-server] login error', err);
    return res.status(502).json({ code: 502, msg: '登录服务不可用', data: null });
  }
});

app.post('/api/auth/register', express.json(), async (req, res) => {
  const { username, email } = req.body || {};
  if (!username) {
    return res.status(400).json({ code: 400, msg: '缺少用户名', data: null });
  }
  // 演示环境：直接放行注册并返回 token，避免后端未开放注册接口导致卡住
  return res.json({
    code: 200,
    msg: 'success',
    data: {
      id: Date.now(),
      username: String(username),
      email: email ? String(email) : null,
      token: 'demo',
    },
  });
});

// 反向代理：同源路径，避免浏览器 CORS
app.use(
  '/api',
  createProxyMiddleware({
    target: API_TARGET,
    changeOrigin: true,
    // Express 挂载在 '/api' 时会把前缀从 req.url 中剥离（例如 /api/documents -> /documents）。
    // 但 8006 后端路由是从 '/api/...' 开始的，所以需要把 '/api' 前缀加回去。
    pathRewrite: (path) => `/api${path}`,
    on: {
      proxyReq: (proxyReq, req) => {
        // 后端 8006 的 CORS 配置会对带 Origin 的请求做校验（局域网地址经常不在白名单），
        // 但我们这里是同源反代，不需要浏览器 CORS；直接移除 Origin/Referer 避免后端拦截。
        proxyReq.removeHeader('origin');
        proxyReq.removeHeader('referer');

        // 如果客户端已通过 /api/auth/login 登录，则带上后端 session cookie
        const cookies = parseCookies(req.headers.cookie);
        const demoSid = cookies.demo_sid;
        if (!demoSid) return;
        const upstreamCookie = sessionStore.get(demoSid);
        if (!upstreamCookie) return;
        proxyReq.setHeader('cookie', upstreamCookie);
      },
      proxyRes: (proxyRes, req) => {
        const location = proxyRes.headers.location;
        if (!location) return;
        const host = req.headers.host;
        if (!host) return;

        // 把上游的绝对跳转改写为同源，避免浏览器跟随跳转时触发跨域 CORS
        if (location.startsWith(API_TARGET)) {
          proxyRes.headers.location = location.replace(API_TARGET, `http://${host}`);
          return;
        }
        if (location.startsWith('/')) {
          proxyRes.headers.location = `http://${host}${location}`;
        }
      },
    },
    // /api/* -> http://...:8006/api/*
    // 保持路径不变即可
    logLevel: 'warn',
  })
);

app.use(
  '/ai',
  createProxyMiddleware({
    target: AI_TARGET,
    changeOrigin: true,
    // /ai/* -> http://...:8005/*
    pathRewrite: { '^/ai': '' },
    logLevel: 'warn',
  })
);

const buildDir = path.join(__dirname, '..', 'build');
app.use(express.static(buildDir));

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(buildDir, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[demo-server] listening on http://0.0.0.0:${PORT}`);
  console.log(`[demo-server] proxy /api -> ${API_TARGET}`);
  console.log(`[demo-server] proxy /ai  -> ${AI_TARGET}`);
});
