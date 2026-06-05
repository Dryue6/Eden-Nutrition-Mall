import '@tarojs/plugin-html/dist/runtime';
import React, { useEffect } from 'react';
import Taro from '@tarojs/taro';
import './index.css';

const App: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    const token = Taro.getStorageSync('token');
    if (!token) {
      console.log('未登录状态');
    }
  }, []);

  return <>{children}</>;
};

export default App;
