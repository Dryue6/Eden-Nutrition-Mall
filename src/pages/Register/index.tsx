import React, { useState } from 'react';
import Taro from '@tarojs/taro';
import { userApi } from '@/src/api';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    phone: '',
    nickname: ''
  });
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await userApi.register(formData);
      Taro.showToast({ title: '注册成功，请登录', icon: 'success' });
      Taro.navigateTo({ url: '/pages/Login/index' });
    } catch (error) {
      console.error('Registration failed', error);
      Taro.showToast({ title: '注册失败，请检查输入信息', icon: 'none' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-8 flex flex-col relative">
      <button
        onClick={() => Taro.navigateBack()}
        className="absolute top-12 left-8 w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100"
      >
        <span className="text-2xl">←</span>
      </button>

      <div className="mt-28 mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">加入伊甸园</h1>
        <p className="text-gray-400">开启您的健康营养之旅</p>
      </div>

      <form onSubmit={handleRegister} className="space-y-5">
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500 ml-1 uppercase tracking-wider">用户名</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" style={{fontSize: '18px'}}>👤</span>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              placeholder="设置登录用户名"
              className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-emerald-500 transition-all"
              required
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500 ml-1 uppercase tracking-wider">手机号</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" style={{fontSize: '18px'}}>📞</span>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              placeholder="请输入手机号"
              className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-emerald-500 transition-all"
              required
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500 ml-1 uppercase tracking-wider">昵称</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" style={{fontSize: '18px'}}>👤</span>
            <input
              type="text"
              value={formData.nickname}
              onChange={(e) => setFormData({...formData, nickname: e.target.value})}
              placeholder="您的个性昵称"
              className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-emerald-500 transition-all"
              required
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500 ml-1 uppercase tracking-wider">密码</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" style={{fontSize: '18px'}}>🔒</span>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              placeholder="设置登录密码"
              className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-emerald-500 transition-all"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-emerald-100 flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all disabled:opacity-50 mt-4"
        >
          {loading ? '注册中...' : '立即注册'}
          {!loading && <span className="text-lg">→</span>}
        </button>
      </form>

      <div className="mt-auto text-center pb-8">
        <p className="text-sm text-gray-500">
          已有账号？{' '}
          <span onClick={() => Taro.navigateTo({ url: '/pages/Login/index' })} className="text-emerald-600 font-bold cursor-pointer hover:underline">
            立即登录
          </span>
        </p>
      </div>
    </div>
  );
};

export default Register;
