import React, { useState } from 'react';
import Taro from '@tarojs/taro';
import { userApi } from '@/src/api';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await userApi.login({ username, password });
      Taro.setStorageSync('token', res.token);
      Taro.switchTab({ url: '/pages/Home/index' });
    } catch (error) {
      console.error('Login failed', error);
      Taro.showToast({ title: '登录失败，确保账号为普通用户账号', icon: 'none', duration: 2000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-8 flex flex-col">
      <div className="mt-12 mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">欢迎回来</h1>
        <p className="text-gray-400">登录您的伊甸园营养品商城账号</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 ml-1">用户名</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" style={{fontSize: '20px'}}>👤</span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="请输入用户名"
              autoComplete="username"
              className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-emerald-500 transition-all"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 ml-1">密码</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" style={{fontSize: '20px'}}>🔒</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="请输入密码"
              autoComplete="current-password"
              className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-emerald-500 transition-all"
              required
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button type="button" className="text-sm text-emerald-600 font-medium">忘记密码？</button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-emerald-100 flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all disabled:opacity-50"
        >
          {loading ? '登录中...' : '立即登录'}
          {!loading && <span className="text-lg">→</span>}
        </button>
      </form>

      <div className="mt-auto text-center pb-8 flex flex-col gap-4">
        <p className="text-sm text-gray-500">
          还没有账号？{' '}
          <span onClick={() => Taro.navigateTo({ url: '/pages/Register/index' })} className="text-emerald-600 font-bold cursor-pointer hover:underline">
            立即注册
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;
