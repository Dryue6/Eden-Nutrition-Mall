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
  email?: string;
  avatar: string;
  gender: number;
  points?: number;
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
  imageUrl?: string;
  subImages: string;
  detail: string;
  price: number;
  stock: number;
  status: number;
  sales: number;
  skuList?: ProductSku[];
}

export interface ProductSku {
  id: number;
  productId: number;
  specName: string;
  flavor?: string;
  packageSize?: string;
  price: number;
  stock: number;
  imageUrl?: string;
  status: number;
}

// Cart
/** 后端购物车商品项 VO，保留少量旧字段兼容历史 mock/页面兜底数据。 */
export interface CartItemVO {
  productId: number;
  skuId?: number;
  skuSpecName?: string;
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
  status: number; // 0-待支付, 1-已支付, 2-已发货, 3-已收货, 4-已完成, 5-已取消, 6-退款中, 7-已退款, 8-退款拒绝
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  createTime: string;
  orderItems: OrderItem[];
}

export interface OrderItem {
  productId: number;
  skuId?: number;
  skuSpecName?: string;
  productName: string;
  productImage: string;
  currentUnitPrice: number;
  quantity: number;
  totalPrice: number;
}

export interface RefundApply {
  id: number;
  refundNo: string;
  orderNo: string;
  refundAmount: number;
  reason: string;
  status: number;
  auditRemark?: string;
  refundTradeNo?: string;
  simulated?: number;
  createTime: string;
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
  nickname?: string;
  avatar?: string;
  content: string;
  rating: number;
  productName?: string;
  productImage?: string;
  createTime: string;
}

export interface SupportSession {
  id: number;
  userId: number;
  productId?: number | null;
  status: number;
  createTime: string;
  updateTime: string;
}

export interface SupportMessage {
  id: number;
  sessionId: number;
  senderType: 'USER' | 'STAFF' | 'SYSTEM';
  content: string;
  isRead: number;
  createTime: string;
}

export interface Notice {
  id: number;
  userId: number;
  type: 'ORDER' | 'COUPON' | 'SYSTEM' | string;
  title: string;
  content: string;
  target?: string | null;
  isRead: number;
  createTime: string;
  readTime?: string | null;
}
