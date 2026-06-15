import React, { useState } from 'react';
import Taro, { useDidShow } from '@tarojs/taro';
import { Button, Checkbox, Image, Text, View } from '@tarojs/components';
import { cartApi } from '@/src/api';
import { CartItemVO, CartVO } from '@/src/api/types';
import { formatPrice } from '@/src/lib/utils';
import { resolveProductItemImage } from '@/src/lib/productImages';

console.log('[Cart] module loaded');

type CartDisplayItem = CartItemVO & { id?: number };

const Cart: React.FC = () => {
  console.log('[Cart] render start');

  const [cart, setCart] = useState<CartVO | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * 拉取最新购物车数据；购物车是 tab 页面，必须在页面重新显示时刷新缓存状态。
   */
  const fetchCart = async () => {
    console.log('[Cart] fetchCart start');
    setLoading(true);
    try {
      const data = await cartApi.getCart();
      setCart(data);
    } catch (error) {
      console.error('Failed to fetch cart', error);
    } finally {
      setLoading(false);
    }
  };

  useDidShow(() => {
    console.log('[Cart] useDidShow');
    fetchCart();
  });

  /**
   * 统一从后端真实 productId 或历史兼容 id 中取得购物车操作所需商品 ID。
   */
  const getProductId = (item: CartDisplayItem) => item.productId ?? item.id;

  /**
   * 更新购物车数量：允许数量扣减到 0，由后端复用 quantity <= 0 的移除逻辑。
   */
  const handleUpdateQuantity = async (productId: number | undefined, quantity: number, skuId?: number) => {
    if (productId === undefined || quantity < 0) return;
    try {
      await cartApi.updateQuantity(productId, quantity, skuId);
      fetchCart();
    } catch (error) {
      console.error('Update quantity failed', error);
    }
  };

  /**
   * 删除购物车商品；缺少商品 ID 时直接忽略，避免向后端发送无效路径。
   */
  const handleRemove = async (productId: number | undefined, skuId?: number) => {
    if (productId === undefined) return;
    try {
      await cartApi.removeFromCart(productId, skuId);
      fetchCart();
    } catch (error) {
      console.error('Failed to remove from cart', error);
      Taro.showToast({ title: '删除失败', icon: 'none' });
    }
  };

  /**
   * 切换单个商品选中状态；小程序 Checkbox 不依赖 e.target.checked，直接传入目标状态。
   */
  const handleSelect = async (productId: number | undefined, selected: boolean, skuId?: number) => {
    if (productId === undefined) return;
    try {
      await cartApi.selectItem(productId, selected, skuId);
      fetchCart();
    } catch (error) {
      console.error('Select item failed', error);
    }
  };

  /**
   * 切换全选状态；由当前 allSelected 反推目标状态，避免 HTML 事件模型兼容问题。
   */
  const handleSelectAll = async (selected: boolean) => {
    try {
      await cartApi.selectAll(selected);
      fetchCart();
    } catch (error) {
      console.error('Select all failed', error);
    }
  };

  /**
   * 进入结算页，结算页继续负责地址、优惠券和订单创建校验。
   */
  const handleCheckout = () => {
    Taro.navigateTo({ url: '/pages/Checkout/index' });
  };

  if (loading) {
    return (
      <View className="flex min-h-[calc(100vh-140px)] items-center justify-center text-gray-500">
        <Text>加载中...</Text>
      </View>
    );
  }

  const items: CartDisplayItem[] = cart?.items || cart?.cartItems || [];
  const selectedAmount = cart?.selectedAmount ?? items
    .filter((item) => item.selected)
    .reduce((sum, item) => {
      const price = item.price ?? item.productPrice ?? 0;
      return sum + ((item.subtotal ?? item.totalPrice) ?? price * item.quantity);
    }, 0);

  if (!items || items.length === 0) {
    return (
      <View className="flex min-h-[calc(100vh-140px)] flex-col items-center justify-center p-4 text-center">
        <View className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gray-50">
          <Text className="text-4xl text-gray-300">🛍</Text>
        </View>
        <Text className="mb-2 text-lg font-bold text-gray-800">购物车为空</Text>
        <Text className="mb-8 text-sm text-gray-500">赶快去挑选你喜欢的商品吧</Text>
        <Button
          onClick={() => Taro.switchTab({ url: '/pages/Category/index' })}
          className="rounded-full bg-emerald-600 px-8 py-3 font-bold text-white shadow-lg shadow-emerald-200"
        >
          去逛逛
        </Button>
      </View>
    );
  }

  return (
    <View className="min-h-screen bg-gray-50 pb-32">
      <View className="sticky top-0 z-10 flex items-center justify-between bg-white p-4 shadow-sm">
        <Text className="text-lg font-bold text-gray-800">购物车 ({items.length})</Text>
        <Button onClick={() => cartApi.clearCart().then(fetchCart)} className="text-xs text-gray-400">
          清空
        </Button>
      </View>

      <View className="space-y-4 p-4">
        {items.map((item) => {
          const productId = getProductId(item);
          return (
            <View key={`${productId}-${item.skuId || 'default'}`} className="flex gap-4 rounded-2xl border border-gray-50 bg-white p-4 shadow-sm">
              <View className="flex items-center">
                <Checkbox
                  checked={Boolean(item.selected)}
                  onClick={() => handleSelect(productId, !item.selected, item.skuId)}
                  className="scale-75"
                />
              </View>
              <View className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100">
                <Image
                  src={resolveProductItemImage(item, 'https://picsum.photos/seed/product/200/200')}
                  mode="aspectFill"
                  className="h-full w-full"
                />
              </View>
              <View className="min-w-0 flex-1">
                <Text className="mb-1 block truncate text-sm font-medium text-gray-900">{item.productName}</Text>
                <Text className="mb-2 block font-bold text-emerald-600">{formatPrice(item.price ?? item.productPrice ?? 0)}</Text>
                <View className="flex items-center justify-between">
                  <View className="flex items-center gap-3 rounded-lg bg-gray-50 p-1">
                    <Button
                      onClick={() => handleUpdateQuantity(productId, item.quantity - 1, item.skuId)}
                      className="flex h-6 w-6 items-center justify-center rounded-md bg-white text-gray-500 shadow-sm"
                    >
                      <Text className="text-sm font-bold">−</Text>
                    </Button>
                    <Text className="w-4 text-center text-xs font-bold">{item.quantity}</Text>
                    <Button
                      onClick={() => handleUpdateQuantity(productId, item.quantity + 1, item.skuId)}
                      className="flex h-6 w-6 items-center justify-center rounded-md bg-white text-gray-500 shadow-sm"
                    >
                      <Text className="text-sm font-bold">+</Text>
                    </Button>
                  </View>
                  <Button onClick={() => handleRemove(productId, item.skuId)} className="text-gray-300 hover:text-red-500">
                    <Text className="text-lg">🗑</Text>
                  </Button>
                </View>
              </View>
            </View>
          );
        })}
      </View>

      <View className="fixed bottom-20 left-0 right-0 z-50 mx-auto flex max-w-md items-center justify-between border-t border-gray-100 bg-white p-4">
        <View className="flex items-center gap-2">
          <Checkbox
            checked={Boolean(cart?.allSelected)}
            onClick={() => handleSelectAll(!cart?.allSelected)}
            className="scale-75"
          />
          <Text className="text-sm text-gray-600">全选</Text>
        </View>
        <View className="flex items-center gap-4">
          <View className="text-right">
            <Text className="block text-[20px] text-gray-400">合计</Text>
            <Text className="block text-lg font-bold text-emerald-600">{formatPrice(selectedAmount)}</Text>
          </View>
          <Button
            onClick={handleCheckout}
            className="rounded-full bg-emerald-600 px-8 py-3 font-bold text-white shadow-lg shadow-emerald-100"
          >
            结算
          </Button>
        </View>
      </View>
    </View>
  );
};

export default Cart;
