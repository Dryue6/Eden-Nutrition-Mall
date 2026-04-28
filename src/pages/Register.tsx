import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userApi } from '@/src/api';
import { User, Lock, Phone, ArrowRight, ChevronLeft } from 'lucide-react';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    phone: '',
    nickname: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await userApi.register(formData);
      alert('注册成功，请登录');
      navigate('/login');
    } catch (error) {
      console.error('Registration failed', error);
      alert('注册失败，请检查输入信息');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-8 flex flex-col">
      <button onClick={() => navigate(-1)} className="mb-8"><ChevronLeft size={24} /></button>
      
      <div className="mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">加入伊甸园</h1>
        <p className="text-gray-400">开启您的健康营养之旅</p>
      </div>

      <form onSubmit={handleRegister} className="space-y-5">
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500 ml-1 uppercase tracking-wider">用户名</label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
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
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
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
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
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
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
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
          {!loading && <ArrowRight size={20} />}
        </button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          已有账号？ 
          <button onClick={() => navigate('/login')} className="text-emerald-600 font-bold ml-1">立即登录</button>
        </p>
      </div>
    </div>
  );
};

export default Register;
