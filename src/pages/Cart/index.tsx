import React, { useEffect, useState } from 'react';
import Taro from '@tarojs/taro';
import { View } from '@tarojs/components';
import { cartApi } from '@/src/api';
import { CartVO } from '@/src/api/types';
import { formatPrice } from '@/src/lib/utils';

const Cart: React.FC = () => {
  const [cart, setCart] = useState<CartVO | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCart = async () => {
    try {
      const data = await cartApi.getCart();
      setCart(data);
    } catch (error) {
      console.error('Failed to fetch cart', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleUpdateQuantity = async (productId: number, quantity: number) => {
    if (quantity < 1) return;
    try {
      await cartApi.updateQuantity(productId, quantity);
      fetchCart();
    } catch (error) {
      console.error('Update quantity failed', error);
    }
  };

  const handleRemove = async (productId: number) => {
    try {
      await cartApi.removeFromCart(productId);
      fetchCart();
    } catch (error) {
      console.error('Failed to remove from cart', error);
      Taro.showToast({ title: '删除失败', icon: 'none' });
    }
  };

  const handleSelect = async (productId: number, selected: boolean) => {
    try {
      await cartApi.selectItem(productId, selected);
      fetchCart();
    } catch (error) {
      console.error('Select item failed', error);
    }
  };

  const handleSelectAll = async (selected: boolean) => {
    try {
      await cartApi.selectAll(selected);
      fetchCart();
    } catch (error) {
      console.error('Select all failed', error);
    }
  };

  const handleCheckout = () => {
    Taro.navigateTo({ url: '/pages/Checkout/index' });
  };

  if (loading) return <div className="flex items-center justify-center min-h-[calc(100vh-140px)] text-gray-500">加载中...</div>;

  const items = cart?.cartItems || (cart as any)?.items || [];

  if (!items || items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-140px)] p-4 text-center">
        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-4">
          <span className="text-4xl text-gray-300">🛍</span>
        </div>
        <h2 className="text-lg font-bold text-gray-800 mb-2">购物车为空</h2>
        <p className="text-sm text-gray-500 mb-8">赶快去挑选你喜欢的商品吧</p>
        <button
          onClick={() => Taro.switchTab({ url: '/pages/Category/index' })}
          className="bg-emerald-600 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-emerald-200"
        >
          去逛逛
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-32">
      <header className="bg-white p-4 sticky top-0 z-10 flex items-center justify-between shadow-sm">
        <h1 className="text-lg font-bold text-gray-800">购物车 ({items.length})</h1>
        <button onClick={() => cartApi.clearCart().then(fetchCart)} className="text-xs text-gray-400">清空</button>
      </header>

      <div className="p-4 space-y-4">
        {Array.isArray(items) && items.map((item: any) => (
          <div key={item.productId || item.id} className="bg-white rounded-2xl p-4 flex gap-4 shadow-sm border border-gray-50">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={item.selected}
                onChange={(e) => handleSelect(item.productId || item.id, e.target.checked)}
                className="w-5 h-5 rounded-full border-gray-300 text-emerald-600 focus:ring-emerald-500"
              />
            </div>
            <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
              <img
                src={item.productMainImage || item.productImage || 'https://picsum.photos/seed/product/200/200'}
                alt={item.productName}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 text-sm mb-1 truncate">{item.productName}</h3>
              <p className="text-emerald-600 font-bold mb-2">{formatPrice(item.price || item.productPrice)}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1">
                  <button
                    onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                    className="w-6 h-6 flex items-center justify-center text-gray-500 bg-white rounded-md shadow-sm"
                  >
                    <span className="text-sm font-bold">−</span>
                  </button>
                  <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                  <button
                    onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                    className="w-6 h-6 flex items-center justify-center text-gray-500 bg-white rounded-md shadow-sm"
                  >
                    <span className="text-sm font-bold">+</span>
                  </button>
                </div>
                <button onClick={() => handleRemove(item.productId || item.id)} className="text-gray-300 hover:text-red-500">
                  <span className="text-lg">🗑</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Bar */}
      <div className="fixed bottom-20 left-0 right-0 max-w-md mx-auto bg-white border-t border-gray-100 p-4 flex items-center justify-between z-50">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={cart?.allSelected || false}
            onChange={(e) => handleSelectAll(e.target.checked)}
            className="w-5 h-5 rounded-full border-gray-300 text-emerald-600 focus:ring-emerald-500"
          />
          <span className="text-sm text-gray-600">全选</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-[10px] text-gray-400">合计</p>
            <p className="text-lg font-bold text-emerald-600">{formatPrice(cart?.selectedAmount || items.filter((i: any) => i.selected).reduce((sum: number, i: any) => sum + ((i.price || i.productPrice) * i.quantity), 0))}</p>
          </div>
          <button
            onClick={handleCheckout}
            className="bg-emerald-600 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-emerald-100"
          >
            结算
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
