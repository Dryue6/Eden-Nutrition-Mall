import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

const USE_MOCK = false; // 开关：true 则使用本地 mock (server.ts /mock-api)，false 则使用真实后端接口 /api
const REAL_BACKEND_URL = '/api';

const request: AxiosInstance = axios.create({
  baseURL: USE_MOCK ? '/mock-api' : REAL_BACKEND_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor
request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && token !== 'undefined' && token !== 'null' && token.trim() !== '' && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`; // 确保与后端配置匹配，如果后端不需要 Bearer 可以去掉
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor
request.interceptors.response.use(
  (response: AxiosResponse) => {
    const res = response.data;

    // 1. 如果没有 code，可能是流文件或非标准格式，直接返回
    if (res === null || res === undefined || typeof res !== 'object') {
      return res;
    }

    // 2. 统一处理业务状态码
    // 后端正确的状态码是 200 (ResultCode.SUCCESS)
    if ('code' in res) {
      const code = Number(res.code);

      // 登录失效逻辑
      if (code === 401 || code === 403) {
        console.warn('登录已失效，跳转登录页');
        localStorage.removeItem('token');
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        return Promise.reject(new Error(res.message || '登录失效'));
      }

      // 成功逻辑：200 或 1 (兼容性)
      if (code === 200 || code === 1 || res.success === true) {
        return res.data;
      }

      // 报错逻辑
      const errorMsg = res.message || res.msg || '未知业务错误';
      console.error('后端业务异常:', errorMsg);
      return Promise.reject(new Error(errorMsg));
    }

    return res;
  },
  (error) => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem('token');
          window.location.href = '/login';
          break;
        case 403:
          console.error('Permission denied');
          break;
        case 500:
          console.error('Server error');
          break;
        default:
          console.error('An error occurred', error.message);
      }
    }
    return Promise.reject(error);
  }
);

export default request;
