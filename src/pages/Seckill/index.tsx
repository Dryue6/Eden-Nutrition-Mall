import React, { useEffect, useState } from 'react';
import Taro from '@tarojs/taro';
import { View, Image } from '@tarojs/components';
import { seckillApi } from '@/src/api';
import { SeckillSessionDTO, SeckillProduct } from '@/src/api/types';
import { formatPrice, cn } from '@/src/lib/utils';

const Seckill: React.FC = () => {
  const [sessions, setSessions] = useState<SeckillSessionDTO[]>([]);
  const [activeSession, setActiveSession] = useState<number | null>(null);
  const [products, setProducts] = useState<SeckillProduct[]>([]);
  const [loading, setLoading] = useState(true);

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
    fetchProducts();
  }, [activeSession]);

  const handleDoSeckill = async (seckillId: number) => {
    try {
      const orderNo = await seckillApi.doSeckill({ seckillId });
      Taro.showToast({ title: '秒杀成功！去支付', icon: 'success' });
      Taro.navigateTo({ url: `/pages/Checkout/index` });
    } catch (error) {
      console.error('Seckill failed', error);
      Taro.showToast({ title: '秒杀失败，请重试', icon: 'none' });
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[calc(100vh-140px)] text-gray-500">加载中...</div>;

  return (
    <div className="bg-gray-50 min-h-screen">
      <header className="bg-gradient-to-r from-red-600 to-orange-500 pt-12 pb-20 px-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl" />
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
              <span className="text-[10px] opacity-80">
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
            const progress = Math.min(100, Math.floor(((product.seckillStock - product.stock) / product.seckillStock) * 100));
            return (
              <div key={product.id} className="bg-white rounded-2xl p-4 flex gap-4 shadow-sm border border-gray-50">
                <View onClick={() => Taro.navigateTo({ url: `/pages/ProductDetail/index?id=${product.productId}` })} className="w-28 h-28 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 cursor-pointer">
                  <img
                    src={'https://picsum.photos/seed/seckill/200/200'}
                    alt={'秒杀商品'}
                    className="w-full h-full object-cover"
                  />
                </View>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-gray-800 line-clamp-2 mb-2">{product.name}</h4>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-red-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-gray-400">剩余{product.seckillStock}件</span>
                    </div>
                  </div>
                  <div className="flex items-end justify-between">
                    <div className="flex flex-col">
                      <span className="text-red-600 font-bold text-lg">{formatPrice(product.seckillPrice)}</span>
                      <span className="text-[10px] text-gray-400 line-through">{formatPrice(product.price)}</span>
                    </div>
                    <button
                      onClick={() => handleDoSeckill(product.seckillId)}
                      className="bg-red-600 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-md shadow-red-100"
                    >
                      立即抢购
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
