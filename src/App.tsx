import '@tarojs/plugin-html/dist/runtime';
import React, { useEffect } from 'react';
import Taro from '@tarojs/taro';
import ErrorBoundary from './components/ErrorBoundary';
import './index.css';

const App: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    // 全局错误监听
    Taro.onError?.((err) => {
      console.error('[GlobalError]', err);
    });
    Taro.onUnhandledRejection?.(({ reason }) => {
      console.error('[UnhandledRejection]', reason);
    });

    // 诊断日志
    try {
      const info = Taro.getSystemInfoSync();
      console.log('[App] SDKVersion:', info.SDKVersion, '| brand:', info.brand, '| model:', info.model);
    } catch (e) {
      console.warn('[App] getSystemInfoSync failed:', e);
    }

    const token = Taro.getStorageSync('token');
    if (!token) {
      console.log('[App] 未登录状态');
    }
  }, []);

  return <ErrorBoundary>{children}</ErrorBoundary>;
};

export default App;
