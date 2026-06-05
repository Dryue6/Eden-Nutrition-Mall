import React, { useMemo, useState } from 'react';
import Taro from '@tarojs/taro';
import { WebView } from '@tarojs/components';
import { orderApi } from '@/src/api';
import { readAlipayDebugPayData } from '@/src/lib/alipay';

const AlipayDebugPay: React.FC = () => {
  const router = Taro.getCurrentInstance().router;
  const payData = useMemo(() => {
    const rawPayKey = router?.params?.payKey || '';
    const rawBridgeUrl = router?.params?.bridgeUrl || '';
    return readAlipayDebugPayData(
      rawPayKey ? decodeURIComponent(rawPayKey) : '',
      rawBridgeUrl ? { bridgeUrl: decodeURIComponent(rawBridgeUrl) } : {}
    );
  }, [router?.params?.bridgeUrl, router?.params?.payKey]);
  const bridgeUrl = payData.bridgeUrl || '';
  const externalPayUrl = payData.externalPayUrl || '';
  const orderNo = useMemo(() => {
    const raw = router?.params?.orderNo || '';
    return decodeURIComponent(raw || payData.orderNo || '');
  }, [payData.orderNo, router?.params?.orderNo]);
  const [showWebView, setShowWebView] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  /**
   * 支付宝异步通知落库需要一点时间，调试页提供手动刷新入口，方便开发者工具内确认支付结果。
   */
  const refreshPaymentStatus = async () => {
    if (!orderNo || refreshing) return;
    setRefreshing(true);
    try {
      const order = await orderApi.getOrderDetail(orderNo);
      if (order.status >= 1 && order.status < 4) {
        Taro.showToast({ title: '支付状态已更新', icon: 'success' });
        Taro.redirectTo({ url: `/pages/OrderDetail/index?orderNo=${encodeURIComponent(orderNo)}` });
        return;
      }
      Taro.showToast({ title: '订单仍待支付，请稍后再试', icon: 'none' });
    } catch (error) {
      console.error('Failed to refresh alipay debug status', error);
    } finally {
      setRefreshing(false);
    }
  };

  const backToOrderDetail = () => {
    if (orderNo) {
      Taro.redirectTo({ url: `/pages/OrderDetail/index?orderNo=${encodeURIComponent(orderNo)}` });
      return;
    }
    Taro.navigateBack();
  };

  /**
   * 微信开发者工具不能可靠打开外部浏览器，复制外部 H5 支付链接作为沙箱联调兜底。
   */
  const copyExternalPayUrl = async () => {
    if (!externalPayUrl) {
      Taro.showToast({ title: '外部支付链接无效', icon: 'none' });
      return;
    }
    await Taro.setClipboardData({ data: externalPayUrl });
    Taro.showToast({ title: '已复制支付链接', icon: 'success' });
  };

  if (showWebView && bridgeUrl) {
    return <WebView src={bridgeUrl} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 px-5 py-8">
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-5">
        <div>
          <h1 className="text-lg font-bold text-gray-900">支付宝沙箱调试</h1>
          <p className="text-xs text-gray-500 mt-2 leading-relaxed">
            该入口仅用于微信开发者工具调试。桥接页已使用标准移动端 viewport；若支付宝官方页仍按电脑比例显示，可复制手机版支付宝支付链接完成沙箱支付后再刷新订单状态。
          </p>
        </div>

        <div className="rounded-xl bg-amber-50 border border-amber-100 p-3 text-xs text-amber-700 leading-relaxed">
          调试前请确认微信开发者工具已关闭合法域名、web-view 业务域名、TLS 和 HTTPS 证书校验。开发者工具无法稳定处理 alipay:// 或外部浏览器唤起，外部链接仅作为调试兜底。
        </div>

        {!bridgeUrl && (
          <div className="rounded-xl bg-red-50 border border-red-100 p-3 text-xs text-red-600">
            支付桥接地址无效，请返回订单页重新发起支付。
          </div>
        )}

        <div className="space-y-3">
          <button
            disabled={!bridgeUrl}
            onClick={() => setShowWebView(true)}
            className="w-full h-11 rounded-full bg-emerald-600 text-white text-sm font-bold disabled:opacity-50"
          >
            在开发者工具内打开桥接页
          </button>
          <button
            disabled={!externalPayUrl}
            onClick={copyExternalPayUrl}
            className="w-full h-11 rounded-full bg-blue-600 text-white text-sm font-bold disabled:opacity-50"
          >
            复制外部手机支付链接
          </button>
          <button
            disabled={!orderNo || refreshing}
            onClick={refreshPaymentStatus}
            className="w-full h-11 rounded-full border border-emerald-600 text-emerald-600 text-sm font-bold disabled:opacity-50"
          >
            {refreshing ? '正在刷新...' : '我已完成支付，刷新订单状态'}
          </button>
          <button
            onClick={backToOrderDetail}
            className="w-full h-11 rounded-full border border-gray-200 text-gray-500 text-sm font-medium"
          >
            返回订单详情
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlipayDebugPay;
