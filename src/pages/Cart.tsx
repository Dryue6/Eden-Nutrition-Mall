import React, { useEffect, useState } from 'react';
import { cartApi, orderApi } from '@/src/api';
import { CartVO } from '@/src/api/types';
import { formatPrice } from '@/src/lib/utils';
import { Trash2, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Cart: React.FC = () => {
  const [cart, setCart] = useState<CartVO | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
      console.error('Remove item failed', error);
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

  if (loading) return <div className="flex items-center justify-center h-screen text-gray-500">加载中...</div>;

  const items = cart?.cartItems || (cart as any)?.items || [];

  if (!cart || items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] p-6 text-center">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag size={40} className="text-gray-300" />
        </div>
        <h3 className="text-lg font-bold text-gray-800 mb-2">购物车空空如也</h3>
        <p className="text-sm text-gray-400 mb-8">快去挑选心仪的营养品吧</p>
        <button 
          onClick={() => navigate('/')}
          className="bg-emerald-600 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-emerald-100"
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
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-800 line-clamp-1 mb-1">{item.productName}</h4>
                <span className="text-xs text-gray-400">规格：默认</span>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-emerald-600 font-bold text-sm">{formatPrice(item.productPrice || item.price)}</span>
                <div className="flex items-center gap-3 bg-gray-50 rounded-full px-3 py-1">
                  <button onClick={() => handleUpdateQuantity(item.productId || item.id, item.quantity - 1)} className="text-gray-400">
                    <Minus size={14} />
                  </button>
                  <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                  <button onClick={() => handleUpdateQuantity(item.productId || item.id, item.quantity + 1)} className="text-gray-400">
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            </div>
            <button onClick={() => handleRemove(item.productId || item.id)} className="text-gray-300 hover:text-red-500">
              <Trash2 size={18} />
            </button>
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
            onClick={() => navigate('/checkout')}
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
