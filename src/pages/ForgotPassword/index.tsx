import React, { useState } from 'react';
import Taro from '@tarojs/taro';
import { userApi } from '@/src/api';

const ForgotPassword: React.FC = () => {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [sending, setSending] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  /** 发送验证码前先做基础手机号校验，避免明显无效请求打到后端。 */
  const handleSendCode = async () => {
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      Taro.showToast({ title: '请输入正确手机号', icon: 'none' });
      return;
    }
    setSending(true);
    try {
      await userApi.sendPasswordResetCode(phone);
      Taro.showToast({ title: '验证码已发送', icon: 'success' });
    } finally {
      setSending(false);
    }
  };

  /** 使用手机号、验证码和新密码完成找回密码流程，成功后回到登录页。 */
  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || newPassword.length < 6) {
      Taro.showToast({ title: '请填写验证码和新密码', icon: 'none' });
      return;
    }
    setSubmitting(true);
    try {
      await userApi.resetPassword({ phone, code, newPassword });
      Taro.showToast({ title: '密码已重置', icon: 'success' });
      Taro.redirectTo({ url: '/pages/Login/index' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <button onClick={() => Taro.navigateBack()} className="mb-8 text-emerald-600 text-sm">返回</button>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">找回密码</h1>
      <p className="text-sm text-gray-500 mb-8">通过注册手机号验证身份后重置登录密码。</p>

      <form onSubmit={handleReset} className="space-y-4">
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="注册手机号"
          className="w-full bg-white rounded-xl px-4 py-3 text-sm border border-gray-100"
        />
        <div className="flex gap-2">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="验证码"
            className="flex-1 bg-white rounded-xl px-4 py-3 text-sm border border-gray-100"
          />
          <button type="button" disabled={sending} onClick={handleSendCode} className="px-4 rounded-xl bg-emerald-600 text-white text-sm disabled:opacity-60">
            {sending ? '发送中' : '获取验证码'}
          </button>
        </div>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="新密码，6-20位"
          className="w-full bg-white rounded-xl px-4 py-3 text-sm border border-gray-100"
        />
        <button type="submit" disabled={submitting} className="w-full bg-emerald-600 text-white rounded-xl py-3 font-bold disabled:opacity-60">
          {submitting ? '提交中' : '重置密码'}
        </button>
      </form>
    </div>
  );
};

export default ForgotPassword;
