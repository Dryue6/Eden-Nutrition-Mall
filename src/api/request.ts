import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

const request: AxiosInstance = axios.create({
  baseURL: '/api', // Assuming proxy or direct API path
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor
request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
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
    // Handle common Spring Boot result wrapper: { code: 200, data: [...], message: "..." }
    if (res && typeof res === 'object' && 'code' in res && 'data' in res) {
      return res.data;
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
