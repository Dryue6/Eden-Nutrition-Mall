// Common Types
export interface PageVO<T> {
  list: T[];
  total: number;
  pageNum: number;
  pageSize: number;
}

// User & Auth
export interface LoginVO {
  token: string;
  user: UserVO;
}

export interface UserVO {
  id: number;
  username: string;
  nickname: string;
  phone: string;
  avatar: string;
  gender: number;
}

// Address
export interface UserAddress {
  id: number;
  receiverName: string;
  receiverPhone: string;
  province: string;
  city: string;
  district: string;
  detailAddress: string;
  isDefault: boolean;
}

// Product & Category
export interface Category {
  id: number;
  name: string;
  parentId: number;
  icon: string;
  sort: number;
}

export interface CategoryTreeVO extends Category {
  children: CategoryTreeVO[];
}

export interface ProductVO {
  id: number;
  name: string;
  categoryId: number;
  mainImage: string;
  subImages: string;
  detail: string;
  price: number;
  stock: number;
  status: number;
  sales: number;
}

// Cart
export interface CartItemVO {
  productId: number;
  productName: string;
  productMainImage: string;
  productPrice: number;
  quantity: number;
  totalPrice: number;
  selected: boolean;
}

export interface CartVO {
  cartItems: CartItemVO[];
  totalAmount: number;
  selectedAmount: number;
  allSelected: boolean;
}

// Order
export interface Order {
  id: number;
  orderNo: string;
  totalAmount: number;
  payAmount: number;
  status: number; // 0-Unpaid, 1-Paid, 2-Shipped, 3-Completed, 4-Cancelled
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  createTime: string;
  orderItems: OrderItem[];
}

export interface OrderItem {
  productId: number;
  productName: string;
  productImage: string;
  currentUnitPrice: number;
  quantity: number;
  totalPrice: number;
}

// Coupon
export interface Coupon {
  id: number;
  name: string;
  type: number;
  value: number;
  minAmount: number;
  startTime: string;
  endTime: string;
}

export interface UserCoupon extends Coupon {
  userCouponId: number;
  status: number; // 0-Unused, 1-Used, 2-Expired
}

// Seckill
export interface SeckillSessionDTO {
  id: number;
  name: string;
  startTime: string;
  endTime: string;
  status: number;
}

export interface SeckillProduct extends ProductVO {
  seckillId: number;
  seckillPrice: number;
  seckillStock: number;
  startTime: string;
  endTime: string;
}

// Review
export interface ProductReview {
  id: number;
  productId: number;
  userId: number;
  nickname: string;
  avatar: string;
  content: string;
  rating: number;
  createTime: string;
}
