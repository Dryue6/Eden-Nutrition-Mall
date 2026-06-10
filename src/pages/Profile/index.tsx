import React, { useState } from 'react';
import Taro, { useDidShow } from '@tarojs/taro';
import { userApi } from '@/src/api';
import { UserVO } from '@/src/api/types';

const LOGIN_PAGE_URL = '/pages/Login/index';

const Profile: React.FC = () => {
  const [user, setUser] = useState<UserVO | null>(null);
  const [points, setPoints] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  /**
   * 跳转登录页前检查当前页面，避免个人页反复显示时重复压入登录页。
   */
  const navigateToLogin = () => {
    const pages = Taro.getCurrentPages();
    const currentPage = pages[pages.length - 1];
    if (currentPage?.route === 'pages/Login/index') return;
    Taro.navigateTo({ url: LOGIN_PAGE_URL });
  };

  const fetchUser = async () => {
    const token = Taro.getStorageSync('token');
    if (!token) {
      // 未登录时不再依赖用户信息接口失败来触发跳转，保证点击个人页能立即进入登录页。
      setUser(null);
      setPoints(0);
      setLoading(false);
      navigateToLogin();
      return;
    }

    try {
      const data = await userApi.getUserInfo();
      setUser(data);
      try {
        const pts = await userApi.getPoints();
        setPoints(pts);
      } catch (e) {
        console.error('Failed to fetch points', e);
      }
    } catch (error) {
      console.error('Failed to fetch user info', error);
      // 用户信息接口失败通常表示登录态失效，本地清理后重新进入登录流程。
      Taro.removeStorageSync('token');
      Taro.removeStorageSync('userInfo');
      setUser(null);
      setPoints(0);
      navigateToLogin();
    } finally {
      setLoading(false);
    }
  };

  useDidShow(() => {
    fetchUser();
  });

  const handleLogout = async () => {
    try {
      await userApi.logout();
      Taro.removeStorageSync('token');
      Taro.removeStorageSync('userInfo');
      setUser(null);
      setPoints(0);
      navigateToLogin();
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[calc(100vh-140px)] text-gray-500">加载中...</div>;

  return (
    <div className="bg-gray-50 min-h-screen pb-24">
      {/* Header Profile Section */}
      <div className="bg-emerald-600 px-6 pt-12 pb-20 rounded-b-[40px] text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-400/20 rounded-full -ml-12 -mb-12 blur-xl" />

        <div className="flex items-center justify-between mb-8 relative z-10">
          <h1 className="text-white text-xl font-bold">个人中心</h1>
          <button onClick={() => Taro.navigateTo({ url: '/pages/Settings/index' })} className="text-white/80 hover:text-white">
            <span className="text-xl right-0">⚙</span>
          </button>
        </div>

        <div className="flex items-center gap-4 relative z-10">
          <div className="w-16 h-16 rounded-full border-2 border-white/30 overflow-hidden bg-white/20">
            <img
              src={user?.avatar || 'https://picsum.photos/seed/user/100/100'}
              alt="Avatar"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="text-white">
            <h2 className="text-lg font-bold">{user?.nickname || user?.username}</h2>
            <p className="text-xs opacity-80">{user?.phone || '未绑定手机号'}</p>
            <p className="text-xs mt-1 bg-white/20 inline-block px-2 py-0.5 rounded-full">积分: {points}</p>
          </div>
        </div>
      </div>

      {/* Order Stats Card */}
      <div className="px-4 -mt-10 relative z-10 space-y-4">
        {/* Orders Card */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-800">我的订单</h3>
            <span onClick={() => Taro.navigateTo({ url: '/pages/OrderList/index' })} className="text-xs text-gray-400 flex items-center gap-0.5 cursor-pointer">
              全部订单 <span className="text-xs">›</span>
            </span>
          </div>
          <div className="flex justify-between px-2">
            {[
              { label: '待付款', icon: '💳', status: 0 },
              { label: '待发货', icon: '📦', status: 1 },
              { label: '待收货', icon: '🚚', status: 2 },
              { label: '已完成', icon: '✓', status: 3 }
            ].map((item, idx) => (
              <div
                key={idx}
                onClick={() => Taro.navigateTo({ url: `/pages/OrderList/index?status=${item.status}` })}
                className="flex flex-col items-center gap-2 relative cursor-pointer"
              >
                <div className="text-gray-400 text-xl">{item.icon}</div>
                <span className="text-[20px] font-medium text-gray-600">{item.label}</span>
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1/2 h-1 bg-emerald-600 rounded-full" />
              </div>
            ))}
          </div>
        </div>

        {/* Services Card */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-4 px-2">我的服务</h3>
          <div className="grid grid-cols-4 gap-y-6">
            <div onClick={() => Taro.navigateTo({ url: '/pages/AddressList/index' })} className="flex flex-col items-center gap-2 cursor-pointer">
              <span className="text-2xl text-blue-500">📍</span>
              <span className="text-xs text-gray-600">地址管理</span>
            </div>
            <div onClick={() => Taro.navigateTo({ url: '/pages/CouponCenter/index' })} className="flex flex-col items-center gap-2 cursor-pointer">
              <span className="text-2xl text-orange-500">🎫</span>
              <span className="text-xs text-gray-600">优惠券</span>
            </div>
            <div onClick={() => Taro.navigateTo({ url: '/pages/SupportChat/index' })} className="flex flex-col items-center gap-2 cursor-pointer">
              <span className="text-2xl text-emerald-500">🎧</span>
              <span className="text-xs text-gray-600">我的客服</span>
            </div>
            <div onClick={() => Taro.navigateTo({ url: '/pages/MyReviews/index' })} className="flex flex-col items-center gap-2 cursor-pointer">
              <span className="text-2xl text-purple-500">✓</span>
              <span className="text-xs text-gray-600">我的评价</span>
            </div>
          </div>
        </div>
      </div>

      {/* Logout Button */}
      <div className="px-4 mt-4">
        <button
          onClick={handleLogout}
          className="w-full bg-white rounded-2xl shadow-sm p-4 flex items-center justify-center gap-2 text-red-500 font-medium"
        >
          <span className="text-lg">⎋</span>
          退出登录
        </button>
      </div>
    </div>
  );
};

export default Profile;
