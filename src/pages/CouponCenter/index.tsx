import React, { useEffect, useState } from 'react';
import Taro from '@tarojs/taro';
import { couponApi } from '@/src/api';
import { Coupon, UserCoupon } from '@/src/api/types';
import { formatPrice, formatDate, cn } from '@/src/lib/utils';

const CouponCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'available' | 'mine'>('available');
  const [available, setAvailable] = useState<Coupon[]>([]);
  const [mine, setMine] = useState<UserCoupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [mineLoading, setMineLoading] = useState(false);

  /** 可领取优惠券是公开数据，首屏只请求该接口，避免未登录用户被我的优惠券接口拦截。 */
  const fetchAvailableCoupons = async () => {
    setLoading(true);
    try {
      const availableCoupons = await couponApi.getAvailableCoupons();
      setAvailable(Array.isArray(availableCoupons) ? availableCoupons : []);
    } finally {
      setLoading(false);
    }
  };

  /** 我的优惠券依赖登录态，只在用户已登录并进入对应 Tab 时请求。 */
  const fetchMyCoupons = async () => {
    const token = Taro.getStorageSync('token');
    if (!token) {
      setMine([]);
      return;
    }

    setMineLoading(true);
    try {
      const myCoupons = await couponApi.getMyCoupons();
      setMine(Array.isArray(myCoupons) ? myCoupons : []);
    } finally {
      setMineLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailableCoupons();
  }, []);

  useEffect(() => {
    if (activeTab === 'mine') {
      fetchMyCoupons();
    }
  }, [activeTab]);

  const receiveCoupon = async (couponId: number) => {
    if (!Taro.getStorageSync('token')) {
      Taro.navigateTo({ url: '/pages/Login/index' });
      return;
    }
    await couponApi.receiveCoupon(couponId);
    Taro.showToast({ title: '领取成功', icon: 'success' });
    fetchAvailableCoupons();
    fetchMyCoupons();
  };

  const renderCoupon = (coupon: Coupon | UserCoupon, owned = false) => (
    <div key={`${owned ? 'mine' : 'available'}-${owned ? (coupon as UserCoupon).userCouponId : coupon.id}`} className="bg-white rounded-xl p-4 shadow-sm border border-gray-50">
      <div className="flex justify-between gap-4">
        <div>
          <h3 className="font-bold text-gray-800">{coupon.name}</h3>
          <p className="text-xs text-gray-400 mt-1">满 {formatPrice(coupon.minAmount)} 可用</p>
          <p className="text-[10px] text-gray-400 mt-2">{formatDate(coupon.startTime)} - {formatDate(coupon.endTime)}</p>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-orange-500">{coupon.type === 2 ? `${coupon.value}折` : formatPrice(coupon.value)}</p>
          {owned ? (
            <span className="text-xs text-gray-400">{(coupon as UserCoupon).status === 0 ? '未使用' : '不可用'}</span>
          ) : (
            <button onClick={() => receiveCoupon(coupon.id)} className="mt-2 px-4 py-1 rounded-full bg-orange-500 text-white text-xs">领取</button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <div className="bg-white p-4 sticky top-0 z-10 flex items-center shadow-sm">
        <button onClick={() => Taro.navigateBack()} className="text-emerald-600 mr-4 text-sm">返回</button>
        <h1 className="text-lg font-bold text-gray-800">优惠券中心</h1>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-2 bg-white rounded-xl p-1 mb-4">
          <button onClick={() => setActiveTab('available')} className={cn('py-2 rounded-lg text-sm font-bold', activeTab === 'available' ? 'bg-emerald-600 text-white' : 'text-gray-500')}>可领取</button>
          <button onClick={() => setActiveTab('mine')} className={cn('py-2 rounded-lg text-sm font-bold', activeTab === 'mine' ? 'bg-emerald-600 text-white' : 'text-gray-500')}>我的优惠券</button>
        </div>
        {(activeTab === 'available' ? loading : mineLoading) ? (
          <div className="text-center py-20 text-gray-400">加载中...</div>
        ) : (
          <div className="space-y-3">
            {activeTab === 'available'
              ? (available.length ? available.map((coupon) => renderCoupon(coupon)) : <div className="text-center py-20 text-gray-400">暂无可领取优惠券</div>)
              : (mine.length ? mine.map((coupon) => renderCoupon(coupon, true)) : <div className="text-center py-20 text-gray-400">暂无优惠券</div>)}
          </div>
        )}
      </div>
    </div>
  );
};

export default CouponCenter;
