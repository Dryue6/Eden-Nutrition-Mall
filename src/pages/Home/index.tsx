import React, { useState } from 'react';
import Taro, { useDidShow } from '@tarojs/taro';
import { View, Text, Input } from '@tarojs/components';

import { noticeApi, productApi, seckillApi, userApi } from '@/src/api';
import { ProductVO, SeckillSessionDTO } from '@/src/api/types';
import { formatPrice, cn } from '@/src/lib/utils';
import { resolveProductImage } from '@/src/lib/productImages';

const EMPTY_SECKILL_BANNER_TEXT = '暂无秒杀活动';
const HOME_PRODUCT_LIMIT = 4;

/** 根据秒杀场次状态生成首页 Banner 文案，status=1 代表当前正在进行的活动。 */
const resolveSeckillBannerText = (sessions: SeckillSessionDTO[]) => {
  const activeSession = sessions.find((session) => session.status === 1);
  if (!activeSession) {
    return EMPTY_SECKILL_BANNER_TEXT;
  }

  // 优先展示后端维护的活动描述；没有描述时退回到活动名称，避免 Banner 空白。
  return activeSession.description?.trim() || activeSession.name?.trim() || EMPTY_SECKILL_BANNER_TEXT;
};

const Home: React.FC = () => {
  const [hotProducts, setHotProducts] = useState<ProductVO[]>([]);
  const [recommendProducts, setRecommendProducts] = useState<ProductVO[]>([]);
  const [newProducts, setNewProducts] = useState<ProductVO[]>([]);
  const [seckillBannerText, setSeckillBannerText] = useState(EMPTY_SECKILL_BANNER_TEXT);
  const [hasSignedIn, setHasSignedIn] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);

  /** 兼容首页商品接口可能返回数组或分页 records 的两种结构。 */
  const normalizeProductList = (value: ProductVO[] | { records?: ProductVO[] }) => {
    return Array.isArray(value) ? value : value?.records || [];
  };

  /** 拉取首页公开商品数据，失败时清空对应区域，避免展示过期商品。 */
  const fetchHomeProducts = async () => {
    try {
      const [hot, recommend, latest] = await Promise.all([
        // 首页只展示首屏精选商品，限制每组数量，避免进入首页时产生过多渲染和后续请求。
        productApi.getHotProducts(HOME_PRODUCT_LIMIT),
        productApi.getRecommendProducts(HOME_PRODUCT_LIMIT),
        productApi.getNewProducts(HOME_PRODUCT_LIMIT),
      ]);
      // 兼容后端返回数组格式或者分页对象格式，避免因为不是数组导致不渲染。
      setHotProducts(normalizeProductList(hot as ProductVO[] | { records?: ProductVO[] }));
      setRecommendProducts(normalizeProductList(recommend as ProductVO[] | { records?: ProductVO[] }));
      setNewProducts(normalizeProductList(latest as ProductVO[] | { records?: ProductVO[] }));
    } catch (error) {
      console.error('Failed to fetch home products', error);
      setHotProducts([]);
      setRecommendProducts([]);
      setNewProducts([]);
    }
  };

  /** 拉取当前秒杀活动文案，没有活动或请求失败时展示统一空态。 */
  const fetchSeckillBannerText = async () => {
    try {
      const sessions = await seckillApi.getSeckillSessions();
      setSeckillBannerText(resolveSeckillBannerText(Array.isArray(sessions) ? sessions : []));
    } catch (error) {
      console.error('Failed to fetch seckill sessions for home banner', error);
      setSeckillBannerText(EMPTY_SECKILL_BANNER_TEXT);
    }
  };

  /** 仅在已登录时检查签到状态，未登录不发鉴权请求以保证首页公开内容独立加载。 */
  const checkSignInStatus = async () => {
    const token = Taro.getStorageSync('token');
    if (!token) {
      // 未登录时保持签到入口为可点击状态，但不发鉴权请求，避免影响首页公开数据加载。
      setHasSignedIn(false);
      return;
    }

    try {
      const signedIn = await userApi.checkSignIn();
      setHasSignedIn(signedIn);
    } catch (e) {
      console.error('Check sign in failed', e);
      setHasSignedIn(false);
    }
  };

  /*/!** 首页铃铛只在登录后查询未读数，避免未登录用户触发鉴权弹窗。 *!/
  const fetchUnreadCount = async () => {
    const token = Taro.getStorageSync('token');
    if (!token) {
      setUnreadCount(0);
      return;
    }
    try {
      const count = await noticeApi.unreadCount();
      setUnreadCount(Number(count) || 0);
    } catch (e) {
      setUnreadCount(0);
    }
  };*/

  /** 将首页搜索框关键词带到搜索结果页，由结果页统一调用商品列表接口。 */
  const submitSearch = () => {
    const keyword = searchKeyword.trim();
    if (!keyword) {
      Taro.showToast({ title: '请输入搜索关键词', icon: 'none' });
      return;
    }
    // 小程序端不依赖 H5 的 keydown/form 行为，统一由 Input.confirm 和搜索按钮触发页面跳转。
    Taro.navigateTo({ url: `/pages/SearchResults/index?keyword=${encodeURIComponent(keyword)}` })
      .catch((error) => {
        console.error('Navigate to search results failed', error);
        Taro.showToast({ title: '搜索页打开失败', icon: 'none' });
      });
  };

  /** 首页 tab 每次展示时刷新首屏数据，确保点击首页能看到实际网络请求。 */
  const loadHomeData = () => {
    // 首页是 tabBar 页面，使用 Taro 页面展示生命周期确保每次进入首页都会触发首屏请求。
    fetchHomeProducts();
    fetchSeckillBannerText();
    checkSignInStatus();
    /*fetchUnreadCount();*/
  };

  useDidShow(() => {
    loadHomeData();
  });

  return (
    <div className="flex flex-col gap-6 p-4 overflow-x-hidden">
      {/* Header */}
      <View className="flex items-center justify-between gap-2">
        <View className="flex-1 flex items-center rounded-full bg-white px-3 py-2 shadow-sm">
          <Text className="mr-2 text-base text-gray-400">🔍</Text>
          <Input
            value={searchKeyword}
            onInput={(event) => setSearchKeyword(String(event.detail.value || ''))}
            onConfirm={submitSearch}
            confirmType="search"
            placeholder="搜索营养补剂..."
            className="min-w-0 flex-1 text-sm text-gray-800"
          />
        </View>
        <View
          onClick={submitSearch}
          className="flex h-9 min-w-14 items-center justify-center rounded-full bg-emerald-600 px-4 shadow-sm"
        >
          <Text className="text-sm font-medium text-white">搜索</Text>
        </View>
        {/*<button onClick={() => Taro.navigateTo({ url: '/pages/NoticeList/index' })} className="p-2 bg-white rounded-full shadow-sm text-gray-600 relative">
          🔔
          {unreadCount > 0 && <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-red-500 text-white text-[10px] leading-4">{unreadCount > 99 ? '99+' : unreadCount}</span>}
        </button>*/}
      </View>

      {/* Banner Placeholder */}
      <section className="w-full h-40 bg-emerald-600 rounded-2xl overflow-hidden relative">
        <div className="absolute inset-0 flex flex-col justify-center p-6 text-white">
          <h2 className="text-xl font-bold mb-1">限时秒杀</h2>
          <p className="text-sm opacity-90">{seckillBannerText}</p>
          {seckillBannerText !== EMPTY_SECKILL_BANNER_TEXT && (
            <button
              onClick={() => Taro.switchTab({ url: '/pages/Seckill/index' })}
              className="mt-3 bg-white text-emerald-700 px-4 py-1.5 rounded-full text-xs font-bold w-fit"
            >
              立即抢购
            </button>
          )}
        </div>
      </section>

      {/* Quick Actions */}
      <section className="grid grid-cols-4 gap-4 text-center">
        {[
          { label: '热门排行', icon: '🔥', color: 'bg-orange-50', id: 'hot-products'},
          { label: '新品上市', icon: '🆕', color: 'bg-blue-50', id: 'new-products' },
          { label: '领券中心', icon: '🎫', color: 'bg-red-50', id: 'coupon' },
          { label: hasSignedIn ? '今日已签' : '每日签到', icon: '📅', color: hasSignedIn ? 'bg-gray-100 text-gray-400' : 'bg-emerald-50', id: 'checkin', disabled: hasSignedIn },
        ].map((item, i) => (
          <button
            key={i}
            disabled={item.disabled || (item.id === 'checkin' && isSigningIn)}
            onClick={async () => {
              if (item.id === 'hot-products' || item.id === 'new-products') {
                Taro.pageScrollTo({
                  selector: `#${item.id}`,
                  duration: 300
                });
              } else if (item.id === 'coupon') {
                Taro.navigateTo({ url: '/pages/CouponCenter/index' });
              } else if (item.id === 'checkin') {
                const token = Taro.getStorageSync('token');
                if (!token) {
                  Taro.navigateTo({ url: '/pages/Login/index' });
                  return;
                }
                if (hasSignedIn || isSigningIn) return;

                setIsSigningIn(true);
                Taro.showLoading({ title: '签到中...' });
                try {
                  await userApi.signIn();
                  setHasSignedIn(true);
                  const points = await userApi.getPoints();
                  Taro.hideLoading();
                  Taro.showModal({
                    title: '签到成功',
                    content: `积分 +10\n当前总积分：${points}`,
                    showCancel: false,
                    confirmText: '好的'
                  });
                } catch (e: any) {
                  Taro.hideLoading();
                  Taro.showToast({ title: e?.message || '签到失败', icon: 'none' });
                } finally {
                  setIsSigningIn(false);
                }
              }
            }}
            className={cn("flex flex-col items-center gap-2 hover:opacity-80 transition-opacity outline-none", item.disabled && "opacity-50 hover:opacity-50")}
          >
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-sm", item.color)}>
              {item.icon}
            </div>
            <span className="text-[20px] font-medium text-gray-600">{item.label}</span>
          </button>
        ))}
      </section>

      {/* Hot Products */}
      <section id="hot-products">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800">热门排行</h3>
          <View onClick={() => Taro.switchTab({ url: '/pages/Category/index' })} className="text-xs text-emerald-600 flex items-center gap-0.5">
            更多 <span className="text-xs">›</span>
          </View>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {Array.isArray(hotProducts) && hotProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* New Products */}
      <section id="new-products">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800">新品上市</h3>
          <View onClick={() => Taro.switchTab({ url: '/pages/Category/index' })} className="text-xs text-emerald-600 flex items-center gap-0.5">
            更多 <span className="text-xs">›</span>
          </View>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {Array.isArray(newProducts) && newProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Recommend Products */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800">为你推荐</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {Array.isArray(recommendProducts) && recommendProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
};

const ProductCard: React.FC<{ product: ProductVO }> = ({ product }) => {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-50 relative">
      <div className="absolute top-2 right-2 z-10 p-1.5 bg-white/80 backdrop-blur rounded-full shadow-sm">
        {/* 首页卡片不拉取收藏状态，避免每个商品额外触发一次鉴权请求影响页面切换。 */}
        <span className="text-sm text-gray-400">♡</span>
      </div>
      <View onClick={() => Taro.navigateTo({ url: `/pages/ProductDetail/index?id=${product.id}` })}>
        <div className="aspect-square bg-gray-100 overflow-hidden">
          <img
            src={resolveProductImage(product, 'https://picsum.photos/seed/nutrition/400/400')}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="p-3">
          <h4 className="text-sm font-medium text-gray-800 line-clamp-2 mb-2 h-10">
            {product.name}
          </h4>
          <div className="flex items-end justify-between">
            <span className="text-emerald-600 font-bold text-base">
              {formatPrice(product.price)}
            </span>
            <span className="text-[20px] text-gray-400">
              已售 {product.sales}
            </span>
          </div>
        </div>
      </View>
    </div>
  );
};

export default Home;
