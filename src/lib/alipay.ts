import Taro from '@tarojs/taro';
import { orderApi } from '@/src/api';
import type { AlipayDebugPayVO } from '@/src/api/types';

export const ALIPAY_DEBUG_PAY_STORAGE_PREFIX = 'alipay-debug-pay:';

/**
 * 发起支付宝沙箱支付。
 *
 * H5 可直接提交 PagePay 表单；微信开发者工具内通过 web-view 打开后端桥接页，
 * 该桥接页再自动提交表单，用于本地沙箱调试。微信小程序不直接提交支付宝表单，
 * 避免把 H5 PagePay 误当成小程序原生支付能力。
 */
export async function startAlipaySandboxPayment(orderNo: string): Promise<boolean> {
  const env = Taro.getEnv();

  if (env === Taro.ENV_TYPE.WEB) {
    const formHtml = await orderApi.createAlipayPayment(orderNo);
    return submitAlipayPagePayForm(formHtml);
  }

  if (env === Taro.ENV_TYPE.WEAPP) {
    const data = await orderApi.createWeappDebugAlipayPayment(orderNo);
    if (!isValidBridgeUrl(data?.bridgeUrl)) {
      Taro.showToast({ title: '支付桥接地址无效，请稍后重试', icon: 'none' });
      return false;
    }
    const payKey = `${ALIPAY_DEBUG_PAY_STORAGE_PREFIX}${orderNo}:${Date.now()}`;
    // 支付宝调试链接可能很长，放入本地 storage，避免小程序页面 query 被截断后进入空白页。
    Taro.setStorageSync(payKey, data);
    Taro.navigateTo({
      url: `/pages/AlipayDebugPay/index?payKey=${encodeURIComponent(payKey)}&orderNo=${encodeURIComponent(orderNo)}`
    });
    return true;
  }

  Taro.showToast({ title: '当前环境暂不支持支付宝沙箱支付', icon: 'none' });
  return false;
}

/**
 * 后端桥接页必须是明确的 HTTP(S) 地址，否则微信小程序 web-view 可能进入空白页。
 */
function isValidBridgeUrl(url?: string): url is string {
  return typeof url === 'string' && /^https?:\/\/\S+$/i.test(url.trim());
}

/**
 * 从本地 storage 读取支付宝调试数据；兼容旧版 query 直传 bridgeUrl 的页面入口。
 */
export function readAlipayDebugPayData(payKey?: string, fallback?: Partial<AlipayDebugPayVO>): Partial<AlipayDebugPayVO> {
  if (payKey) {
    try {
      const data = Taro.getStorageSync(payKey) as AlipayDebugPayVO | undefined;
      if (data?.bridgeUrl || data?.externalPayUrl) {
        return data;
      }
    } catch (error) {
      console.warn('Failed to read alipay debug pay data', error);
    }
  }
  return fallback || {};
}

/**
 * 提交后端生成的支付宝 PagePay 表单。
 */
function submitAlipayPagePayForm(formHtml: string): boolean {
  if (typeof document === 'undefined') {
    Taro.showToast({ title: '支付表单只能在 H5 环境提交', icon: 'none' });
    return false;
  }

  const container = document.createElement('div');
  container.style.display = 'none';
  container.innerHTML = formHtml;

  const form = container.querySelector('form') as HTMLFormElement | null;
  if (!form) {
    Taro.showToast({ title: '支付表单异常', icon: 'none' });
    return false;
  }

  document.body.appendChild(container);
  form.submit();
  return true;
}
