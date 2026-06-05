import Taro from '@tarojs/taro';

const USE_MOCK = false;
const REAL_BACKEND_URL = 'http://localhost:8080/api';
const baseURL = REAL_BACKEND_URL;

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: any;
  params?: Record<string, any>;
}

/** 过滤掉 params 中值为 null/undefined/NaN 的键，避免拼到 URL 上 */
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
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    });
    const result = res.data;
    if (!result) {
      return Promise.reject(new Error('Empty response'));
    }
    if (result.code === 200 || result.success) {
      return result.data as R;
    }
    if (result.code === 401) {
      Taro.removeStorageSync('token');
      Taro.removeStorageSync('userInfo');
      Taro.redirectTo({ url: '/pages/Login/index' });
      return Promise.reject(new Error('Unauthorized'));
    }
    Taro.showToast({
      title: result.message || '请求失败',
      icon: 'none',
      duration: 2000
    });
    return Promise.reject(new Error(result.message || 'Error'));
  } catch (error: any) {
    Taro.showToast({
      title: error.message || '网络异常',
      icon: 'none',
      duration: 2000
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
