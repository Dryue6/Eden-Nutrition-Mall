import React, { useEffect, useState } from 'react';
import Taro from '@tarojs/taro';
import { View, Image, RichText } from '@tarojs/components';
import { productApi, cartApi, reviewApi } from '@/src/api';
import { ProductVO, ProductReview } from '@/src/api/types';
import { formatPrice, formatDate } from '@/src/lib/utils';

const ProductDetail: React.FC = () => {
  const router = Taro.getCurrentInstance().router;
  const id = router?.params?.id;
  const [product, setProduct] = useState<ProductVO | null>(null);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (id) {
      const fetchData = async () => {
        try {
          const [p, r] = await Promise.all([
            productApi.getById(Number(id)),
            reviewApi.getProductReviews(Number(id), { pageNum: 1, pageSize: 5 }),
          ]);
          setProduct(p);
          setReviews(r.list);
        } catch (error) {
          console.error('Failed to fetch product detail', error);
        }

        try {
          const fav = await productApi.checkFavorite(Number(id));
          setIsFavorite(fav);
        } catch (error) {
          console.error('Failed to check favorite status', error);
        }

        setLoading(false);
      };
      fetchData();
    }
  }, [id]);

  const handleToggleFavorite = async () => {
    if (!product) return;
    try {
      const res = await productApi.toggleFavorite(product.id);
      setIsFavorite(res);
      Taro.showToast({ title: res ? '已收藏' : '已取消收藏', icon: 'none' });
    } catch (error) {
      console.error('Failed to toggle favorite', error);
      Taro.showToast({ title: '请先登录', icon: 'none' });
      Taro.navigateTo({ url: '/pages/Login/index' });
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    try {
      await cartApi.addToCart(product.id, quantity);
      Taro.showToast({ title: '已加入购物车', icon: 'success' });
    } catch (error) {
      console.error('Failed to add to cart', error);
      Taro.showToast({ title: '请先登录', icon: 'none' });
      Taro.navigateTo({ url: '/pages/Login/index' });
    }
  };

  const handleBuyNow = async () => {
    if (!product) return;
    try {
      await cartApi.addToCart(product.id, quantity);
      Taro.navigateTo({ url: '/pages/Checkout/index' });
    } catch (error) {
      console.error('Failed to pre-order', error);
      Taro.showToast({ title: '请先登录', icon: 'none' });
      Taro.navigateTo({ url: '/pages/Login/index' });
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen text-gray-500">加载中...</div>;
  if (!product) return <div className="flex items-center justify-center h-screen text-gray-500">商品不存在</div>;

  return (
    <div className="bg-gray-50 min-h-screen pb-24">
      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 max-w-md mx-auto z-50 flex items-center justify-between p-4">
        <button
          onClick={() => Taro.navigateBack()}
          className="w-10 h-10 bg-black/20 backdrop-blur-md rounded-full flex items-center justify-center text-white"
        >
          <span className="text-xl text-white">←</span>
        </button>
        <div className="flex gap-2">
          <button className="w-10 h-10 bg-black/20 backdrop-blur-md rounded-full flex items-center justify-center text-white">
            <span className="text-lg">📤</span>
          </button>
        </div>
      </div>

      {/* Image Gallery */}
      <div className="w-full aspect-square bg-white">
        <img
          src={product.mainImage || 'https://picsum.photos/seed/product/800/800'}
          alt={product.name}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      </div>

      {/* Info Section */}
      <div className="bg-white p-6 rounded-t-3xl -mt-6 relative z-10 shadow-sm">
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-3xl font-bold text-emerald-600">{formatPrice(product.price)}</span>
          <span className="text-sm text-gray-400 line-through">{formatPrice(product.price * 1.2)}</span>
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-4 leading-tight">
          {product.name}
        </h1>
        <div className="flex items-center justify-between text-sm text-gray-500 border-t border-gray-50 pt-4">
          <span>快递：免运费</span>
          <span>月销：{product.sales}</span>
          <span>库存：{product.stock}</span>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-4 bg-white p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            商品评价 <span className="text-xs font-normal text-gray-400">({reviews.length})</span>
          </h3>
          <button className="text-xs text-emerald-600">查看全部</button>
        </div>
        {Array.isArray(reviews) && reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="border-b border-gray-50 pb-4 last:border-0">
                <div className="flex items-center gap-2 mb-2">
                  <img src={review.avatar || 'https://picsum.photos/seed/user/40/40'} className="w-6 h-6 rounded-full" referrerPolicy="no-referrer" />
                  <span className="text-xs font-medium text-gray-700">{review.nickname}</span>
                  <div className="flex gap-0.5 ml-auto">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={i < review.rating ? "text-yellow-400" : "text-gray-200"}>★</span>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">{review.content}</p>
                <span className="text-[10px] text-gray-400 mt-2 block">{formatDate(review.createTime)}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-400 text-xs">暂无评价</div>
        )}
      </div>

      {/* Detail Section */}
      <div className="mt-4 bg-white p-6">
        <h3 className="font-bold text-gray-800 mb-4">商品详情</h3>
        <RichText nodes={product.detail || '暂无详情'} />
      </div>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-gray-100 p-4 flex items-center gap-4 z-50">
        <div className="flex gap-4 px-2">
          <button className="flex flex-col items-center gap-1 text-gray-500">
            <span className="text-lg">💬</span>
            <span className="text-[10px]">客服</span>
          </button>
          <button onClick={handleToggleFavorite} className={`flex flex-col items-center gap-1 ${isFavorite ? 'text-red-500' : 'text-gray-500'}`}>
            <span className={`text-lg ${isFavorite ? 'text-red-500' : ''}`}>♡</span>
            <span className="text-[10px]">收藏</span>
          </button>
          <button onClick={() => Taro.switchTab({ url: '/pages/Cart/index' })} className="flex flex-col items-center gap-1 text-gray-500 relative">
            <span className="text-lg">🛒</span>
            <span className="text-[10px]">购物车</span>
          </button>
        </div>
        <div className="flex-1 flex gap-2">
          <button
            onClick={handleAddToCart}
            className="flex-1 bg-emerald-50 text-emerald-700 py-3 rounded-full font-bold text-sm"
          >
            加入购物车
          </button>
          <button
            onClick={handleBuyNow}
            className="flex-1 bg-emerald-600 text-white py-3 rounded-full font-bold text-sm shadow-lg shadow-emerald-200"
          >
            立即购买
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
