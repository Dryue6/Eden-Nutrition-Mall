import React, { useEffect, useState } from 'react';
import Taro, { useDidShow } from '@tarojs/taro';
import { orderApi, refundApi } from '@/src/api';
import { Order } from '@/src/api/types';
import { startAlipaySandboxPayment } from '@/src/lib/alipay';
import { formatPrice, formatDate, cn } from '@/src/lib/utils';

const OrderDetail: React.FC = () => {
  const router = Taro.getCurrentInstance().router;
  const orderNo = router?.params?.orderNo;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  /**
   * 支付回调依赖后端异步通知，页面重新显示时也要刷新订单，避免仍展示待支付状态。
   */
  const fetchDetail = async (silent = false) => {
    if (!orderNo) return;
    if (!silent) setLoading(true);
    try {
      const data = await orderApi.getOrderDetail(orderNo);
      setOrder(data);
    } catch (error) {
      console.error('Failed to fetch order detail', error);
      Taro.showToast({ title: '没有找到该订单', icon: 'none' });
      setTimeout(() => Taro.navigateBack(), 1500);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [orderNo]);

  useDidShow(() => {
    if (orderNo && !loading) {
      setPaying(false);
      fetchDetail(true);
    }
  });

  const handleCancelOrder = async () => {
    if (!order) return;
    try {
      await orderApi.cancelOrder(order.orderNo);
      Taro.showToast({ title: '订单已取消', icon: 'success' });
      const data = await orderApi.getOrderDetail(order.orderNo);
      setOrder(data);
    } catch (error) {
      console.error('Failed to cancel order', error);
    }
  };

  const handlePayOrder = async () => {
    if (!order || paying) return;
    setPaying(true);
    try {
      const started = await startAlipaySandboxPayment(order.orderNo);
      if (started) {
        Taro.showToast({ title: '正在跳转支付宝沙箱', icon: 'none' });
      }
    } catch (error) {
      console.error('Failed to pay order', error);
      Taro.showToast({ title: '支付遇到问题', icon: 'none' });
    } finally {
      setPaying(false);
    }
  };

  const handleConfirmReceive = async () => {
    if (!order) return;
    try {
      await orderApi.confirmReceive(order.orderNo);
      Taro.showToast({ title: '已确认收货', icon: 'success' });
      const data = await orderApi.getOrderDetail(order.orderNo);
      setOrder(data);
    } catch (error) {
      console.error('Failed to confirm receive', error);
    }
  };

  const handleApplyRefund = async () => {
    if (!order) return;
    const modal = await Taro.showModal({
      title: '申请退款',
      content: `确认申请退还 ${formatPrice(order.payAmount)}？提交后将进入后台审核。`,
      confirmText: '提交',
    });
    if (!modal.confirm) return;
    await refundApi.apply({
      orderNo: order.orderNo,
      refundAmount: order.payAmount,
      reason: '用户主动申请售后退款',
    });
    Taro.showToast({ title: '退款申请已提交', icon: 'success' });
    fetchDetail(true);
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen text-gray-500">加载中...</div>;
  if (!order) return <div className="flex flex-col items-center justify-center min-h-screen text-gray-500 gap-4">
    <p>订单不存在</p>
    <button onClick={() => Taro.navigateBack()} className="text-emerald-600 border border-emerald-600 px-4 py-1 rounded-full text-sm">返回</button>
  </div>;

  const currentStatus = order.status || 0;
  const steps = [
    { label: '提交订单', icon: '📦', active: true },
    { label: '支付成功', icon: '💳', active: currentStatus >= 1 && currentStatus <= 4 },
    { label: '商家发货', icon: '🚚', active: currentStatus >= 2 && currentStatus <= 4 },
    {
      label: currentStatus === 5 ? '已取消' : '交易完成',
      icon: '✓',
      active: currentStatus === 3 || currentStatus === 4 || currentStatus === 5
    },
  ];

  return (
    <div className="bg-gray-50 min-h-screen pb-24">
      {/* 状态栏跟随页面自然滚动，避免与下方订单内容卡片层叠重叠。 */}
      <div className="bg-emerald-600 p-4 flex items-center shadow-sm text-white">
        {/*<button onClick={() => Taro.navigateBack()} className="text-white mr-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-emerald-500">
          <span className="text-2xl text-white">←</span>
        </button>*/}
        <div className="flex-1">
          <h1 className="text-lg font-bold">
            {currentStatus === 0 ? '等待付款' :
             currentStatus === 1 ? '等待发货' :
             currentStatus === 2 ? '等待收货' :
             currentStatus === 3 ? '订单已收货' :
             currentStatus === 4 ? '订单已完成' :
             currentStatus === 6 ? '退款审核中' :
             currentStatus === 7 ? '已退款' :
             currentStatus === 8 ? '退款已拒绝' : '订单已取消'}
          </h1>
          <p className="text-sm opacity-80">订单编号: {order.orderNo}</p>
        </div>
      </div>

      <div className="px-4 mt-4 space-y-4">
        {/* Status Steps */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-50">
          <div className="flex justify-between relative">
            <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-100 -z-10" />
            {steps.map((step, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                  step.active ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-400"
                )}>
                  <span className="text-sm">{step.icon}</span>
                </div>
                <span className={cn("text-[10px] font-medium", step.active ? "text-emerald-600" : "text-gray-400")}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Address */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50 flex gap-3">
          <span className="text-xl text-emerald-600 flex-shrink-0">📍</span>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-bold text-gray-800">{order.receiverName}</span>
              <span className="text-xs text-gray-400">{order.receiverPhone}</span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">{order.receiverAddress}</p>
          </div>
        </div>

        {/* Products */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50">
          <div className="space-y-4">
            {Array.isArray(order.orderItems) && order.orderItems.map((item, idx) => (
              <div key={idx} className="flex gap-3">
                <img src={item.productImage} className="w-16 h-16 rounded-lg object-cover" referrerPolicy="no-referrer" />
                <div className="flex-1 flex flex-col justify-between py-0.5">
                  <h4 className="text-xs font-medium text-gray-800 line-clamp-2">{item.productName}</h4>
                  {item.skuSpecName && <span className="text-[10px] text-gray-400">{item.skuSpecName}</span>}
                  <div className="flex justify-between items-end">
                    <span className="text-xs text-gray-400">x{item.quantity}</span>
                    <span className="text-sm font-bold text-gray-800">{formatPrice(item.currentUnitPrice || item.price)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-50 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">商品总额</span>
              <span className="text-gray-800">{formatPrice(order.totalAmount)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">运费</span>
              <span className="text-gray-800">¥0.00</span>
            </div>
            <div className="flex justify-between text-sm font-bold pt-2">
              <span className="text-gray-800">实付款</span>
              <span className="text-emerald-600">{formatPrice(order.payAmount)}</span>
            </div>
          </div>
        </div>

        {/* Order Info */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50 space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">下单时间</span>
            <span className="text-gray-600">{formatDate(order.createTime)}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">支付方式</span>
            <span className="text-gray-600">在线支付</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      {order.status === 0 && (
        <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-gray-100 p-4 flex justify-end gap-3 z-50">
          <button onClick={handleCancelOrder} className="px-6 py-2 rounded-full border border-gray-200 text-gray-500 text-sm font-medium">取消订单</button>
          <button
            disabled={paying}
            onClick={handlePayOrder}
            className="px-8 py-2 rounded-full bg-emerald-600 text-white text-sm font-bold shadow-lg shadow-emerald-100 disabled:opacity-60"
          >
            {paying ? '正在发起...' : '支付宝沙箱支付'}
          </button>
        </div>
      )}
      {order.status === 2 && (
        <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-gray-100 p-4 flex justify-end gap-3 z-50">
          <button onClick={handleApplyRefund} className="px-6 py-2 rounded-full border border-orange-200 text-orange-500 text-sm font-medium">申请退款</button>
          <button onClick={handleConfirmReceive} className="px-8 py-2 rounded-full bg-emerald-600 text-white text-sm font-bold shadow-lg shadow-emerald-100">确认收货</button>
        </div>
      )}
      {[1, 3, 4].includes(order.status) && (
        <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-gray-100 p-4 flex justify-end gap-3 z-50">
          <button onClick={handleApplyRefund} className="px-8 py-2 rounded-full border border-orange-200 text-orange-500 text-sm font-medium">申请退款</button>
        </div>
      )}
    </div>
  );
};

export default OrderDetail;
