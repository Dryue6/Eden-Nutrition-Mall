import Taro from '@tarojs/taro';

const USE_MOCK = false;
const REAL_BACKEND_URL = 'http://localhost:8080/api';
export const API_BASE_URL = REAL_BACKEND_URL;
const baseURL = API_BASE_URL;
const LOGIN_PAGE_URL = '/pages/Login/index';

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: any;
  params?: Record<string, any>;
}

/** 过滤 params 中值为 null/undefined/NaN 的键，避免无效查询参数传到后端。 */
function cleanParams(params?: Record<string, any>): Record<string, any> | undefined {
  if (!params) return undefined;
  const cleaned: Record<string, any> = {};
  for (const key of Object.keys(params)) {
    const val = params[key];
    if (val !== null && val !== undefined && !(typeof val === 'number' && isNaN(val))) {
      cleaned[key] = val;
    }
  }
  return Object.keys(cleaned).length > 0 ? cleaned : undefined;
}

/**
 * 统一处理登录失效跳转，使用 navigateTo 兼容从 tabBar 页面进入登录页的场景。
 */
function navigateToLogin() {
  const pages = Taro.getCurrentPages();
  const currentPage = pages[pages.length - 1];
  if (currentPage?.route === 'pages/Login/index') return;
  Taro.navigateTo({ url: LOGIN_PAGE_URL });
}

/**
 * HTTP 401/403 有时不会返回标准 Result 包装体，这里按状态码先兜底处理，
 * 保证搜索等页面遇到安全配置问题时不会被空响应或 HTML 错误页打断渲染。
 */
function handleUnauthorizedResponse() {
  Taro.removeStorageSync('token');
  Taro.removeStorageSync('userInfo');
  navigateToLogin();
}

const request = async <T = any, R = any>(
  url: string,
  options: RequestOptions = {}
): Promise<R> => {
  const token = Taro.getStorageSync('token');
  try {
    const res = await Taro.request({
      url: `${baseURL}${url}`,
      method: options.method || 'GET',
      data: options.method === 'GET' ? cleanParams(options.params) : (options.data || options.params),
      header: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (res.statusCode === 401 || res.statusCode === 403) {
      handleUnauthorizedResponse();
      return Promise.reject(new Error('Unauthorized'));
    }

    if (res.statusCode < 200 || res.statusCode >= 300) {
      return Promise.reject(new Error(`请求失败(${res.statusCode})`));
    }

    const result = res.data;
    if (!result || typeof result !== 'object') {
      return Promise.reject(new Error('Empty response'));
    }
    if (result.code === 200 || result.success) {
      return result.data as R;
    }
    if (result.code === 401 || result.code === 403) {
      // 业务响应中的 401/403 仍按登录态失效处理，和 HTTP 状态码兜底保持一致。
      handleUnauthorizedResponse();
      return Promise.reject(new Error('Unauthorized'));
    }
    Taro.showToast({
      title: result.message || '请求失败',
      icon: 'none',
      duration: 2000,
    });
    return Promise.reject(new Error(result.message || 'Error'));
  } catch (error: any) {
    Taro.showToast({
      title: error.message || '网络异常',
      icon: 'none',
      duration: 2000,
    });
    return Promise.reject(error);
  }
};

export default {
  get: <T = any, R = any>(url: string, config?: RequestOptions) => request<T, R>(url, { ...config, method: 'GET' }),
  post: <T = any, R = any>(url: string, data?: any, config?: RequestOptions) => request<T, R>(url, { ...config, method: 'POST', data }),
  put: <T = any, R = any>(url: string, data?: any, config?: RequestOptions) => request<T, R>(url, { ...config, method: 'PUT', data }),
  delete: <T = any, R = any>(url: string, config?: RequestOptions) => request<T, R>(url, { ...config, method: 'DELETE' }),
};
