import React, { useEffect, useState } from 'react';
import Taro from '@tarojs/taro';
import { View } from '@tarojs/components';
import { cartApi, addressApi, orderApi, couponApi } from '@/src/api';
import { CartVO, UserAddress, UserCoupon } from '@/src/api/types';
import { formatPrice } from '@/src/lib/utils';

const Checkout: React.FC = () => {
  const [cart, setCart] = useState<CartVO | null>(null);
  const [address, setAddress] = useState<UserAddress | null>(null);
  const [coupons, setCoupons] = useState<UserCoupon[]>([]);
  const [selectedCoupon, setSelectedCoupon] = useState<UserCoupon | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cartData, addrData, couponData] = await Promise.all([
          cartApi.getCart(),
          addressApi.getDefault(),
          couponApi.getUsableCoupons(),
        ]);
        setCart(cartData);
        setAddress(addrData);
        setCoupons(couponData);
      } catch (error) {
        console.error('Failed to fetch checkout data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCheckout = async () => {
    if (!address) {
      Taro.showToast({ title: '请选择收货地址', icon: 'none' });
      return;
    }

    try {
      const selectedItems = (cart?.cartItems || (cart as any)?.items || []).filter((i: any) => i.selected);

      if (selectedItems.length === 0) {
        Taro.showToast({ title: '购物车没有选中的商品', icon: 'none' });
        return;
      }

      const order = await orderApi.createOrder({
        addressId: address.id,
        userCouponId: selectedCoupon?.userCouponId || null,
        productIds: selectedItems.map((i: any) => i.productId || i.id),
        remark: ""
      });
      Taro.redirectTo({ url: `/pages/OrderDetail/index?orderNo=${order.orderNo}` });
    } catch (error) {
      console.error('Failed to create order', error);
      Taro.showToast({ title: '下单失败', icon: 'none' });
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen text-gray-500">加载中...</div>;

  const items = cart?.cartItems || (cart as any)?.items || [];

  // Calculate proper total amount since backend returns null for selectedAmount sometimes
  const fallbackAmount = items
    .filter((i: any) => i.selected)
    .reduce((sum: number, i: any) => sum + (i.subtotal || i.totalPrice || (i.price || i.productPrice) * i.quantity || 0), 0);

  const checkoutTotalDesc = cart?.selectedAmount !== null && cart?.selectedAmount !== undefined
    ? cart.selectedAmount
    : fallbackAmount;

  const finalAmount = checkoutTotalDesc - (selectedCoupon?.value || 0);

  return (
    <div className="bg-gray-50 min-h-screen pb-24">
      {/* Top Bar */}
      <div className="bg-white p-4 sticky top-0 z-10 flex items-center shadow-sm">
        <button onClick={() => Taro.navigateBack()} className="text-gray-600 mr-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-50">
          <span className="text-2xl">←</span>
        </button>
        <h1 className="text-lg font-bold text-gray-800">确认订单</h1>
      </div>

      <div className="p-4 space-y-4">
        {/* Address Card */}
        <div
          onClick={() => Taro.navigateTo({ url: '/pages/AddressList/index' })}
          className="bg-white rounded-2xl p-4 shadow-sm flex items-center relative overflow-hidden active:scale-[0.98] transition-transform cursor-pointer"
        >
          <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
            <span className="text-xl">📍</span>
          </div>
          <div className="flex-1">
            {address ? (
              <>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold text-gray-800">{address.receiverName}</span>
                  <span className="text-xs text-gray-400">{address.receiverPhone}</span>
                </div>
                <p className="text-xs text-gray-500 line-clamp-1">
                  {address.province}{address.city}{address.district}{address.detailAddress}
                </p>
              </>
            ) : (
              <span className="text-sm text-gray-400 font-medium">请选择收货地址</span>
            )}
          </div>
          <span className="text-gray-300 text-lg">›</span>
        </div>

        {/* Product List */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50">
          <h3 className="text-sm font-bold text-gray-800 mb-4">商品清单</h3>
          <div className="space-y-4">
            {items.filter((i: any) => i.selected).map((item: any) => (
              <div key={item.productId} className="flex gap-3">
                <img
                  src={item.productMainImage || 'https://picsum.photos/seed/product/100/100'}
                  className="w-16 h-16 rounded-lg object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1 flex flex-col justify-between py-0.5">
                  <h4 className="text-xs font-medium text-gray-800 line-clamp-1">{item.productName}</h4>
                  <div className="flex justify-between items-end">
                    <span className="text-sm font-bold text-gray-800">{formatPrice(item.productPrice || item.price)}</span>
                    <span className="text-xs text-gray-400">x{item.quantity}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Coupon Section */}
        <div className="bg-white rounded-2xl p-4 flex items-center justify-between shadow-sm border border-gray-50">
          <div className="flex items-center gap-2">
            <span className="text-xl text-orange-500">🎫</span>
            <span className="text-sm font-medium text-gray-700">优惠券</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs text-orange-500 font-bold">
              {selectedCoupon ? `-${formatPrice(selectedCoupon.value)}` : `${coupons.length}张可用`}
            </span>
            <span className="text-gray-300 text-lg">›</span>
          </div>
        </div>

        {/* Price Breakdown */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">商品总额</span>
            <span className="text-gray-800 font-medium">{formatPrice(checkoutTotalDesc)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">运费</span>
            <span className="text-emerald-600 font-medium">免运费</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">优惠券</span>
            <span className="text-orange-500 font-medium">-{formatPrice(selectedCoupon?.value || 0)}</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 text-[10px] text-gray-400 py-4">
          <span className="text-sm">🛡</span>
          <span>伊甸园营养品商城 · 官方自营正品保障</span>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-gray-100 p-4 flex items-center justify-between z-50">
        <div className="flex items-baseline gap-1">
          <span className="text-xs text-gray-400">实付</span>
          <span className="text-xl font-bold text-emerald-600">{formatPrice(finalAmount)}</span>
        </div>
        <button
          onClick={handleCheckout}
          className="bg-emerald-600 text-white px-10 py-3 rounded-full font-bold shadow-lg shadow-emerald-100"
        >
          立即下单
        </button>
      </div>
    </div>
  );
};

export default Checkout;
