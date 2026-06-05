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
/** 后端购物车商品项 VO，保留少量旧字段兼容历史 mock/页面兜底数据。 */
export interface CartItemVO {
  productId: number;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
  selected: boolean;
  stock?: number;
  totalPrice?: number;
  subtotal?: number;
  stockEnough?: boolean;
  productStatus?: number;
  productMainImage?: string;
  productPrice?: number;
}

/** 后端购物车汇总 VO，items 是当前真实列表字段，cartItems 仅作为旧数据兼容。 */
export interface CartVO {
  items: CartItemVO[];
  cartItems?: CartItemVO[];
  selectedCount?: number | null;
  selectedAmount?: number | null;
  totalCount?: number | null;
  totalAmount?: number | null;
  totalQuantity?: number | null;
  allSelected?: boolean | null;
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

export interface AlipayDebugPayVO {
  bridgeUrl: string;
  externalPayUrl?: string;
  expireSeconds: number;
  orderNo: string;
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
  /** 首页 Banner 优先展示的秒杀活动文案，后端未返回时使用 name 兜底。 */
  description?: string;
  startTime: string;
  endTime: string;
  status: number;
  /** 后端可读状态名称，仅用于展示兼容，不参与是否进行中的判断。 */
  statusName?: string;
}

export interface SeckillProduct extends ProductVO {
  seckillId?: number;
  seckillPrice: number;
  seckillStock?: number;
  stockCount?: number;
  startTime: string;
  endTime: string;
  productId?: number;
}

export interface SeckillSubmitVO {
  orderNo: string;
  status: 'PROCESSING';
}

export interface SeckillResultVO {
  status: 'PROCESSING' | 'SUCCESS' | 'FAILED';
  orderNo: string;
  message: string;
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
