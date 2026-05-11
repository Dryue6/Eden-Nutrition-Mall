import React, { useEffect, useState } from 'react';
import Taro from '@tarojs/taro';
import { orderApi } from '@/src/api';
import { Order } from '@/src/api/types';
import { formatPrice, formatDate, cn } from '@/src/lib/utils';

const OrderList: React.FC = () => {
  const router = Taro.getCurrentInstance().router;
  const status = router?.params?.status;
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await orderApi.getOrderList({
        status: status ? Number(status) : undefined,
        pageNum: 1,
        pageSize: 20
      });
      setOrders(data.list);
    } catch (error) {
      console.error('Failed to fetch orders', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [status]);

  const getStatusInfo = (status: number) => {
    switch (status) {
      case 0: return { label: '待付款', color: 'text-orange-500', icon: '🕐' };
      case 1: return { label: '待发货', color: 'text-blue-500', icon: '📦' };
      case 2: return { label: '待收货', color: 'text-emerald-500', icon: '🚚' };
      case 3: return { label: '已完成', color: 'text-gray-500', icon: '✓' };
      case 4: return { label: '已取消', color: 'text-gray-300', icon: '✕' };
      default: return { label: '未知', color: 'text-gray-400', icon: '' };
    }
  };

  const handleCancel = async (orderNo: string) => {
    try {
      await orderApi.cancelOrder(orderNo);
      fetchOrders();
      Taro.showToast({ title: '已取消', icon: 'success' });
    } catch (error) {
      console.error(error);
    }
  };

  const handlePay = async (orderNo: string) => {
    try {
      await orderApi.payOrder(orderNo);
      fetchOrders();
      Taro.showToast({ title: '支付成功', icon: 'success' });
    } catch (error) {
      console.error(error);
      Taro.showToast({ title: '支付遇到问题', icon: 'none' });
    }
  };

  const handleConfirm = async (orderNo: string) => {
    try {
      await orderApi.confirmReceive(orderNo);
      fetchOrders();
      Taro.showToast({ title: '已收货', icon: 'success' });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-24">
      {/* Top Bar */}
      <div className="bg-white p-4 sticky top-0 z-10 flex items-center justify-between shadow-sm">
        <button onClick={() => Taro.navigateBack()} className="text-gray-600 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-50">
          <span className="text-2xl">←</span>
        </button>
        <h1 className="text-lg font-bold text-gray-800">全部订单</h1>
        <div className="w-8" />
      </div>

      <div className="p-4 space-y-4">
        {loading ? (
          <div className="text-center py-20 text-gray-400">加载中...</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 text-gray-400">暂无订单</div>
        ) : (
          Array.isArray(orders) && orders.map((order) => (
            <div
              key={order.orderNo}
              className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50"
              onClick={() => Taro.navigateTo({ url: `/pages/OrderDetail/index?orderNo=${order.orderNo}` })}
            >
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-50">
                <span className="text-[10px] text-gray-400 font-mono">单号: {order.orderNo}</span>
                <div className={cn("flex items-center gap-1 text-xs font-bold", getStatusInfo(order.status).color)}>
                  <span>{getStatusInfo(order.status).icon}</span>
                  {getStatusInfo(order.status).label}
                </div>
              </div>

              <div className="space-y-3 mt-4">
                {(order.orderItems || (order as any).items || []).map((item: any, idx: number) => (
                  <div key={item.id || idx} className="flex gap-3 bg-gray-50 p-2 rounded-xl">
                    <img
                      src={item.productMainImage || item.productImage || 'https://picsum.photos/seed/product/100/100'}
                      className="w-16 h-16 rounded-lg object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 flex flex-col justify-between py-0.5">
                      <h4 className="text-xs font-medium text-gray-800 line-clamp-1">{item.productName}</h4>
                      <div className="flex justify-between items-end">
                        <span className="text-xs text-gray-400">x{item.quantity}</span>
                        <span className="text-sm font-bold text-gray-800">{formatPrice(item.currentUnitPrice || item.price)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[10px] text-gray-400">{formatDate(order.createTime)}</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-xs text-gray-500">实付</span>
                  <span className="text-base font-bold text-emerald-600">{formatPrice(order.payAmount)}</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-4">
                {order.status === 0 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePay(order.orderNo);
                      }}
                      className="px-4 py-1 rounded-full bg-emerald-600 text-white text-xs font-bold"
                    >
                      立即支付
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCancel(order.orderNo);
                      }}
                      className="px-4 py-1 rounded-full border border-gray-200 text-gray-500 text-xs font-medium"
                    >
                      取消订单
                    </button>
                  </>
                )}
                {order.status === 2 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleConfirm(order.orderNo);
                    }}
                    className="px-4 py-1 rounded-full bg-emerald-600 text-white text-xs font-bold"
                  >
                    确认收货
                  </button>
                )}
                {(order.status === 3 || order.status === 4) && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      orderApi.deleteOrder(order.orderNo).then(() => {
                        Taro.showToast({ title: '删除成功', icon: 'success' });
                        fetchOrders();
                      });
                    }}
                    className="px-4 py-1 rounded-full border border-gray-200 text-gray-500 text-xs font-medium"
                  >
                    删除订单
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default OrderList;
