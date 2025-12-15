import React, { createContext, useContext, useEffect, useState } from 'react';
import { message } from 'antd';
import { loginApi, registerApi } from '../api';

const AuthContext = createContext(null);

const STORAGE_KEY = 'smartlogos_auth';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const cache = localStorage.getItem(STORAGE_KEY);
    if (!cache) return;
    try {
      const parsed = JSON.parse(cache);
      if (parsed?.user) {
        setUser(parsed.user);
        setToken(parsed.token || null);
      }
    } catch (err) {
      console.warn('Failed to parse auth cache', err);
    }
  }, []);

  const persist = (nextUser, nextToken) => {
    if (!nextUser) {
      localStorage.removeItem(STORAGE_KEY);
      return;
    }
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ user: nextUser, token: nextToken || null })
    );
  };

  const login = async ({ username, password }) => {
    const data = await loginApi({ username, password });
    const authUser = {
      id: data?.id,
      username: data?.username || username,
      email: data?.email,
    };
    setUser(authUser);
    setToken(data?.token || null);
    persist(authUser, data?.token || null);
    message.success('登录成功');
    return authUser;
  };

  const register = async ({ username, email, password }) => {
    const data = await registerApi({ username, email, password });
    const authUser = {
      id: data?.id,
      username: data?.username || username,
      email: data?.email || email,
    };
    setUser(authUser);
    setToken(data?.token || null);
    persist(authUser, data?.token || null);
    message.success('注册并登录成功');
    return authUser;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    persist(null, null);
    message.info('已退出登录');
  };

  const value = { user, token, login, register, logout, isAuthed: !!user };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
