import React, { useEffect, useState } from 'react';
import Taro from '@tarojs/taro';
import { View } from '@tarojs/components';
import { addressApi, seckillApi } from '@/src/api';
import { SeckillSessionDTO, SeckillProduct, UserAddress } from '@/src/api/types';
import { formatPrice, cn } from '@/src/lib/utils';

const Seckill: React.FC = () => {
  const [sessions, setSessions] = useState<SeckillSessionDTO[]>([]);
  const [activeSession, setActiveSession] = useState<number | null>(null);
  const [products, setProducts] = useState<SeckillProduct[]>([]);
  const [defaultAddress, setDefaultAddress] = useState<UserAddress | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingSeckillId, setProcessingSeckillId] = useState<number | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await seckillApi.getSeckillList();
      setProducts(data);
    } catch (error) {
      console.error('Failed to fetch seckill products', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const data = await seckillApi.getSeckillSessions();
        setSessions(data);
        if (data.length > 0) {
          setActiveSession(data[0].id);
        }
      } catch (error) {
        console.error('Failed to fetch seckill sessions', error);
      }
    };
    fetchSessions();
  }, []);

  useEffect(() => {
    const fetchDefaultAddress = async () => {
      const token = Taro.getStorageSync('token');
      if (!token) return;
      try {
        const data = await addressApi.getDefault();
        setDefaultAddress(data);
      } catch (error) {
        console.warn('Failed to fetch default address', error);
      }
    };
    fetchDefaultAddress();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [activeSession]);

  const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const waitForSeckillResult = async (orderNo: string): Promise<string | null> => {
    for (let i = 0; i < 20; i++) {
      await wait(500);
      const result = await seckillApi.getSeckillResult(orderNo);
      if (result.status === 'SUCCESS') {
        return result.orderNo;
      }
      if (result.status === 'FAILED') {
        throw new Error(result.message || '秒杀失败，请重试');
      }
    }
    return null;
  };

  const handleDoSeckill = async (product: SeckillProduct) => {
    const seckillId = product.seckillId ?? product.id;
    if (!seckillId) {
      Taro.showToast({ title: '秒杀活动异常，请刷新重试', icon: 'none' });
      return;
    }

    const token = Taro.getStorageSync('token');
    if (!token) {
      Taro.navigateTo({ url: '/pages/Login/index' });
      return;
    }

    // 秒杀接口会直接创建订单，前端必须带上可用的默认收货地址。
    if (!defaultAddress?.id) {
      Taro.showToast({ title: '请先设置默认收货地址', icon: 'none' });
      Taro.navigateTo({ url: '/pages/AddressList/index' });
      return;
    }

    try {
      setProcessingSeckillId(seckillId);
      Taro.showLoading({ title: '排队中...' });
      const submit = await seckillApi.doSeckill({ seckillId, addressId: defaultAddress.id });
      const orderNo = await waitForSeckillResult(submit.orderNo);
      Taro.hideLoading();
      if (orderNo) {
        Taro.showToast({ title: '秒杀成功！去支付', icon: 'success' });
        Taro.navigateTo({ url: `/pages/OrderDetail/index?orderNo=${encodeURIComponent(orderNo)}` });
      } else {
        Taro.showToast({ title: '订单处理中，请稍后在订单列表查看', icon: 'none', duration: 2500 });
      }
    } catch (error: any) {
      Taro.hideLoading();
      console.error('Seckill failed', error);
      Taro.showToast({ title: error?.message || '秒杀失败，请重试', icon: 'none' });
      fetchProducts();
    } finally {
      setProcessingSeckillId(null);
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[calc(100vh-140px)] text-gray-500">加载中...</div>;

  return (
    <div className="bg-gray-50 min-h-screen">
      <header className="pt-12 pb-20 px-6 text-white relative overflow-hidden" style={{ background: 'linear-gradient(to right, #dc2626, #f97316)' }}>
        <div className="flex items-center gap-2 mb-2 relative z-10">
          <span className="text-2xl">⚡</span>
          <h1 className="text-2xl font-bold italic">限时秒杀</h1>
        </div>
        <p className="text-sm opacity-90 relative z-10">精选营养好物，低至1元起</p>
      </header>

      <div className="px-4 -mt-10 relative z-20">
        <div className="bg-white rounded-2xl shadow-sm p-2 flex overflow-x-auto gap-2 no-scrollbar">
          {Array.isArray(sessions) && sessions.map((session) => (
            <button
              key={session.id}
              onClick={() => setActiveSession(session.id)}
              className={cn(
                "flex-shrink-0 flex flex-col items-center justify-center w-24 py-3 rounded-xl transition-all",
                activeSession === session.id
                  ? "bg-red-600 text-white shadow-md shadow-red-100"
                  : "bg-gray-50 text-gray-500"
              )}
            >
              <span className="text-sm font-bold">{session.name}</span>
              <span className="text-[24px] opacity-80">
                {session.status === 1 ? '进行中' : '即将开始'}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {loading ? (
          <div className="text-center py-20 text-gray-400">加载中...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 text-gray-400">暂无秒杀商品</div>
        ) : (
          products.map((product) => {
            const seckillId = product.seckillId ?? product.id;
            const initialStock = product.seckillStock ?? product.stockCount ?? product.stock ?? 0;
            const remainingStock = product.stockCount ?? product.stock ?? product.seckillStock ?? 0;
            const progress = initialStock > 0
              ? Math.min(100, Math.max(0, Math.floor(((initialStock - remainingStock) / initialStock) * 100)))
              : 0;
            const detailId = product.productId ?? product.id;
            return (
              <div key={seckillId} className="bg-white rounded-2xl p-4 flex gap-4 shadow-sm border border-gray-50">
                <View onClick={() => Taro.navigateTo({ url: `/pages/ProductDetail/index?id=${detailId}` })} className="w-28 h-28 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 cursor-pointer">
                  <img
                    src={'https://picsum.photos/seed/seckill/200/200'}
                    alt={'秒杀商品'}
                    className="w-full h-full object-cover"
                  />
                </View>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-gray-800 line-clamp-2 mb-2">{product.name || '秒杀商品'}</h4>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-red-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="text-[20px] text-gray-400">剩余{remainingStock}件</span>
                    </div>
                  </div>
                  <div className="flex items-end justify-between">
                    <div className="flex flex-col">
                      <span className="text-red-600 font-bold text-lg">{formatPrice(product.seckillPrice)}</span>
                      {/*<span className="text-[20px] text-gray-400 line-through">{formatPrice(product.originalPrice)}</span>*/}
                    </div>
                    <button
                      onClick={() => handleDoSeckill(product)}
                      disabled={processingSeckillId === seckillId}
                      className={cn(
                        "text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-md shadow-red-100",
                        processingSeckillId === seckillId ? "bg-gray-400" : "bg-red-600"
                      )}
                    >
                      {processingSeckillId === seckillId ? '处理中' : '立即抢购'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Seckill;
