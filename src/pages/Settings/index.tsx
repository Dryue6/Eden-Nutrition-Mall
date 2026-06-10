import React, { useEffect, useState } from 'react';
import Taro from '@tarojs/taro';
import { userApi } from '@/src/api';
import { UserVO } from '@/src/api/types';

const Settings: React.FC = () => {
  const [user, setUser] = useState<Partial<UserVO>>({});
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);

  /** 设置页进入时读取用户资料，编辑表单只维护允许用户修改的字段。 */
  const fetchUser = async () => {
    const data = await userApi.getUserInfo();
    setUser(data);
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      // 普通资料保存不能提交手机号，手机号是找回密码凭证，后续更换必须走独立验证码流程。
      const editableProfile = {
        nickname: user.nickname,
        email: user.email,
        avatar: user.avatar,
        gender: user.gender,
      };
      await userApi.updateUserInfo(editableProfile);
      Taro.showToast({ title: '资料已保存', icon: 'success' });
      fetchUser();
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!oldPassword || newPassword.length < 6) {
      Taro.showToast({ title: '请填写旧密码和新密码', icon: 'none' });
      return;
    }
    await userApi.changePassword({ oldPassword, newPassword });
    Taro.removeStorageSync('token');
    Taro.removeStorageSync('userInfo');
    Taro.showToast({ title: '请重新登录', icon: 'none' });
    Taro.redirectTo({ url: '/pages/Login/index' });
  };

  const handleLogout = async () => {
    await userApi.logout().catch(() => undefined);
    Taro.removeStorageSync('token');
    Taro.removeStorageSync('userInfo');
    Taro.redirectTo({ url: '/pages/Login/index' });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <div className="bg-white p-4 sticky top-0 z-10 flex items-center shadow-sm">
        <button onClick={() => Taro.navigateBack()} className="text-emerald-600 mr-4 text-sm">返回</button>
        <h1 className="text-lg font-bold text-gray-800">设置</h1>
      </div>
      <div className="p-4 space-y-4">
        <section className="bg-white rounded-xl p-4 space-y-3">
          <h2 className="font-bold text-gray-800">个人资料</h2>
          <input value={user.nickname || ''} onChange={(e) => setUser({ ...user, nickname: e.target.value })} placeholder="昵称" className="w-full bg-gray-50 rounded-lg px-3 py-3 text-sm" />
          <div className="w-full bg-gray-50 rounded-lg px-3 py-3 text-sm text-gray-500">
            <span className="text-gray-400 mr-3">手机号</span>
            <span>{user.phone || '未绑定'}</span>
          </div>
          <input value={user.email || ''} onChange={(e) => setUser({ ...user, email: e.target.value })} placeholder="邮箱" className="w-full bg-gray-50 rounded-lg px-3 py-3 text-sm" />
          <button disabled={saving} onClick={handleSaveProfile} className="w-full bg-emerald-600 text-white rounded-lg py-3 font-bold disabled:opacity-60">保存资料</button>
        </section>
        <section className="bg-white rounded-xl p-4 space-y-3">
          <h2 className="font-bold text-gray-800">修改密码</h2>
          <input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} placeholder="旧密码" className="w-full bg-gray-50 rounded-lg px-3 py-3 text-sm" />
          <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="新密码" className="w-full bg-gray-50 rounded-lg px-3 py-3 text-sm" />
          <button onClick={handleChangePassword} className="w-full bg-gray-900 text-white rounded-lg py-3 font-bold">修改密码</button>
        </section>
        <button onClick={handleLogout} className="w-full bg-white text-red-500 rounded-xl py-4 font-bold">退出登录</button>
      </div>
    </div>
  );
};

export default Settings;
