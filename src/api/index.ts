import request from './request';
import { 
  UserVO, LoginVO, 
  UserAddress, 
  CartVO, 
  Category, CategoryTreeVO, 
  Coupon, UserCoupon,
  Order, PageVO,
  ProductVO, ProductReview,
  SeckillSessionDTO, SeckillProduct
} from './types';

// User Module
export const userApi = {
  register: (data: any) => request.post('/user/register', data),
  login: (data: any) => request.post<any, LoginVO>('/user/login', data),
  logout: () => request.post('/user/logout'),
  getUserInfo: () => request.get<any, UserVO>('/user/info'),
  updateUserInfo: (data: any) => request.put('/user/info', data),
  changePassword: (data: any) => request.put('/user/password', data),
  checkUsername: (username: string) => request.get<any, boolean>(`/user/check/username?username=${username}`),
  checkPhone: (phone: string) => request.get<any, boolean>(`/user/check/phone?phone=${phone}`),
};

// Address Module
export const addressApi = {
  list: () => request.get<any, UserAddress[]>('/address/list'),
  getDefault: () => request.get<any, UserAddress>('/address/default'),
  getById: (id: number) => request.get<any, UserAddress>(`/address/${id}`),
  add: (data: any) => request.post('/address', data),
  update: (data: any) => request.put('/address', data),
  delete: (id: number) => request.delete(`/address/${id}`),
  setDefault: (id: number) => request.put(`/address/default/${id}`),
};

// Cart Module
export const cartApi = {
  getCart: () => request.get<any, CartVO>('/cart'),
  addToCart: (productId: number, quantity: number) => request.post('/cart/add', { productId, quantity }),
  updateQuantity: (productId: number, quantity: number) => request.put('/cart/quantity', { productId, quantity }),
  removeFromCart: (productId: number) => request.delete(`/cart/${productId}`),
  clearCart: () => request.delete('/cart/clear'),
  getCartItemCount: () => request.get<any, number>('/cart/count'),
  selectItem: (productId: number, selected: boolean) => request.put('/cart/select', { productId, selected }),
  selectAll: (selected: boolean) => request.put('/cart/selectAll', { selected }),
};

// Category Module
export const categoryApi = {
  getCategoryTree: () => request.get<any, CategoryTreeVO[]>('/category/tree'),
  getFirstLevel: () => request.get<any, Category[]>('/category/first'),
  getChildren: (parentId: number) => request.get<any, Category[]>(`/category/children/${parentId}`),
  getById: (id: number) => request.get<any, Category>(`/category/${id}`),
};

// Coupon Module
export const couponApi = {
  getAvailableCoupons: () => request.get<any, Coupon[]>('/coupon/available'),
  receiveCoupon: (couponId: number) => request.post(`/coupon/receive/${couponId}`),
  getMyCoupons: () => request.get<any, UserCoupon[]>('/coupon/my'),
  getUsableCoupons: () => request.get<any, UserCoupon[]>('/coupon/usable'),
};

// Order Module
export const orderApi = {
  createOrder: (data: any) => request.post<any, Order>('/order/create', data),
  getOrderList: (params: any) => request.get<any, PageVO<Order>>('/order/list', { params }),
  getOrderDetail: (id: number | string) => request.get<any, Order>(`/order/${id}`),
  cancelOrder: (id: number | string, reason?: string) => request.post(`/order/${id}/cancel`, { reason }),
  payOrder: (id: number | string, data: any) => request.post(`/order/${id}/pay`, data),
  confirmReceive: (orderNo: string) => request.post(`/order/confirm/${orderNo}`),
  deleteOrder: (orderNo: string) => request.delete(`/order/${orderNo}`),
};

// Product Module
export const productApi = {
  getById: (id: number) => request.get<any, ProductVO>(`/product/${id}`),
  list: (params: any) => request.get<any, PageVO<ProductVO>>('/product/list', { params }),
  getHotProducts: (limit = 10) => request.get<any, ProductVO[]>('/product/hot', { params: { limit } }),
  getRecommendProducts: (limit = 10) => request.get<any, ProductVO[]>('/product/recommend', { params: { limit } }),
  getNewProducts: (limit = 10) => request.get<any, ProductVO[]>('/product/new', { params: { limit } }),
  getByCategory: (categoryId: number) => request.get<any, PageVO<ProductVO>>('/product/list', { params: { categoryId } }),
};

// Review Module
export const reviewApi = {
  getProductReviews: (productId: number, params: any) => request.get<any, PageVO<ProductReview>>(`/review/product/${productId}`, { params }),
  getReviewStats: (productId: number) => request.get<any, any>(`/review/product/${productId}/stats`),
  addReview: (data: any) => request.post('/review', data),
};

// Seckill Module
export const seckillApi = {
  getSeckillSessions: () => request.get<any, SeckillSessionDTO[]>('/seckill/sessions'),
  getSeckillList: () => request.get<any, SeckillProduct[]>('/seckill/list'),
  getOngoingSeckills: () => request.get<any, SeckillProduct[]>('/seckill/ongoing'),
  getUpcomingSeckills: () => request.get<any, SeckillProduct[]>('/seckill/upcoming'),
  getSeckillDetail: (seckillId: number) => request.get<any, SeckillProduct>(`/seckill/${seckillId}`),
  doSeckill: (data: any) => request.post<any, string>('/seckill/do', data),
  checkKilled: (seckillId: number) => request.get<any, boolean>(`/seckill/check/${seckillId}`),
};
