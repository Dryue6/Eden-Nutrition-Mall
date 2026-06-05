import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 金额格式化需要兼容微信小程序 JSCore，避免 Intl 缺失导致订单详情渲染白屏。
 */
export function formatPrice(price?: number | string | null) {
  const amount = Number(price);
  const safeAmount = Number.isFinite(amount) ? amount : 0;
  return `¥${safeAmount.toFixed(2)}`;
}

/**
 * 时间格式化不依赖 toLocaleString，保证小程序端不同基础库下输出稳定。
 */
export function formatDate(dateStr?: string | null) {
  if (!dateStr) return '';

  const date = new Date(dateStr);
  const time = date.getTime();
  if (Number.isNaN(time)) return String(dateStr);

  const pad = (value: number) => String(value).padStart(2, '0');
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
  ].join('-') + ' ' + [
    pad(date.getHours()),
    pad(date.getMinutes()),
    pad(date.getSeconds()),
  ].join(':');
}
