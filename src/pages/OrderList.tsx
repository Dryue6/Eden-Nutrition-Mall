import React, { useEffect, useState } from 'react';
import { orderApi } from '@/src/api';
import { Order, PageVO } from '@/src/api/types';
import { formatPrice, formatDate, cn } from '@/src/lib/utils';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft, Package, Clock, Truck, CheckCircle, XCircle } from 'lucide-react';

const OrderList: React.FC = () => {
  const [searchParams] = useSearchParams();
  const status = searchParams.get('status');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await orderApi.getOrderList({ 
        status: status !== null ? Number(status) : undefined,
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
      case 0: return { label: '待付款', color: 'text-orange-500', icon: <Clock size={16} /> };
      case 1: return { label: '待发货', color: 'text-blue-500', icon: <Package size={16} /> };
      case 2: return { label: '待收货', color: 'text-emerald-500', icon: <Truck size={16} /> };
      case 3: return { label: '已完成', color: 'text-gray-500', icon: <CheckCircle size={16} /> };
      case 4: return { label: '已取消', color: 'text-gray-300', icon: <XCircle size={16} /> };
      default: return { label: '未知', color: 'text-gray-400', icon: null };
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <header className="bg-white p-4 sticky top-0 z-10 flex items-center gap-4 shadow-sm">
        <button onClick={() => navigate('/profile')}><ChevronLeft size={24} /></button>
        <h1 className="text-lg font-bold text-gray-800">我的订单</h1>
      </header>

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
              onClick={() => navigate(`/order/${order.orderNo}`)}
            >
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-50">
                <span className="text-[10px] text-gray-400 font-mono">单号: {order.orderNo}</span>
                <div className={cn("flex items-center gap-1 text-xs font-bold", getStatusInfo(order.status).color)}>
                  {getStatusInfo(order.status).icon}
                  {getStatusInfo(order.status).label}
                </div>
              </div>

              <div className="space-y-3 mb-4">
                {Array.isArray(order.orderItems) && order.orderItems.map((item, idx) => (
                  <div key={idx} className="flex gap-3">
                    <img src={item.productImage} className="w-14 h-14 rounded-lg object-cover" referrerPolicy="no-referrer" />
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
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      orderApi.payOrder(order.orderNo, 1).then(() => {
                        alert('支付成功');
                        fetchOrders();
                      });
                    }}
                    className="px-4 py-1 rounded-full bg-emerald-600 text-white text-xs font-bold"
                  >
                    立即支付
                  </button>
                )}
                {order.status === 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      orderApi.cancelOrder(order.orderNo).then(() => {
                        alert('订单已取消');
                        fetchOrders();
                      });
                    }}
                    className="px-4 py-1 rounded-full border border-gray-200 text-gray-500 text-xs font-medium"
                  >
                    取消订单
                  </button>
                )}
                {order.status === 2 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      orderApi.confirmReceive(order.orderNo).then(() => {
                        alert('已确认收货');
                        fetchOrders();
                      });
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
                        alert('删除成功');
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
