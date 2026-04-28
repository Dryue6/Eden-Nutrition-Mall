import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- MOCK DATA ---
  const mockProducts = [
    { 
      id: 1001, 
      name: "印尼进口燕窝 100g", 
      categoryId: 1, 
      categoryName: "燕窝", 
      price: 599.00, 
      originalPrice: 799.00, 
      mainImage: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=400",
      images: ["https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=400"],
      detail: "<p>顶级印尼优质燕窝，滋补良品。</p>",
      sales: 1234, 
      stock: 500,
      status: 1,
      isHot: 1,
      isNew: 0
    },
    { 
      id: 1002, 
      name: "长白山野生人参 50g", 
      categoryId: 2, 
      categoryName: "人参", 
      price: 899.00, 
      originalPrice: 1299.00, 
      mainImage: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=400",
      sales: 500, 
      stock: 100,
      status: 1,
      isHot: 0,
      isNew: 1
    },
    { 
      id: 1003, 
      name: "东阿阿胶 250g", 
      categoryId: 3, 
      categoryName: "阿胶", 
      price: 1299.00, 
      originalPrice: 1599.00, 
      mainImage: "https://images.unsplash.com/photo-1593095191850-b27a3f017411?auto=format&fit=crop&q=80&w=400",
      sales: 800, 
      stock: 200,
      status: 1,
      isHot: 1,
      isNew: 0
    }
  ];

  let mockOrders: any[] = [
    {
      id: 5001,
      orderNo: "202412280001",
      userId: 10001,
      totalAmount: 1198.00,
      discountAmount: 100.00,
      payAmount: 1098.00,
      status: 1,
      statusName: "已支付",
      receiverName: "张三",
      receiverPhone: "13800138000",
      receiverAddress: "浙江省杭州市西湖区",
      createTime: "2024-12-28 10:00:00",
      items: [
        { id: 1, productId: 1001, productName: "印尼进口燕窝 100g", price: 599.00, quantity: 2, totalPrice: 1198.00, productImage: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=400" }
      ]
    }
  ];

  // --- MOCK API IMPLEMENTATION ---
  
  // User Module
  app.post("/api/user/register", (req, res) => {
    res.json({ code: 200, message: "注册成功", data: null });
  });

  app.post("/api/user/login", (req, res) => {
    const { username } = req.body;
    res.json({
      code: 200,
      message: "登录成功",
      data: {
        userId: 10001,
        username: username || "admin",
        nickname: "管理员",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
        role: "ADMIN",
        token: "mock-jwt-token-" + Date.now(),
        createTime: new Date().toISOString()
      }
    });
  });

  app.get("/api/user/info", (req, res) => {
    res.json({
      code: 200,
      message: "操作成功",
      data: {
        id: 10001,
        username: "admin",
        nickname: "管理员",
        phone: "138****8000",
        email: "admin@example.com",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
        gender: 1,
        points: 1000,
        status: 1,
        role: "ADMIN",
        createTime: "2024-01-01 10:00:00"
      }
    });
  });

  app.post("/api/user/logout", (req, res) => {
    res.json({ code: 200, message: "登出成功", data: null });
  });

  // Product Module
  app.get("/api/product/list", (req, res) => {
    const { keyword, categoryId, sortBy, pageNum = 1, pageSize = 10 } = req.query;
    let list = [...mockProducts];
    if (keyword) {
      list = list.filter(p => p.name.includes(keyword as string));
    }
    if (categoryId) {
      list = list.filter(p => p.categoryId === Number(categoryId));
    }
    
    // Simple paging
    const start = (Number(pageNum) - 1) * Number(pageSize);
    const end = start + Number(pageSize);
    const paginatedList = list.slice(start, end);

    res.json({
      code: 200,
      message: "操作成功",
      data: {
        total: list.length,
        pages: Math.ceil(list.length / Number(pageSize)),
        pageNum: Number(pageNum),
        pageSize: Number(pageSize),
        list: paginatedList
      }
    });
  });

  app.get("/api/product/hot", (req, res) => {
    res.json({ code: 200, message: "操作成功", data: mockProducts.filter(p => p.isHot) });
  });

  app.get("/api/product/new", (req, res) => {
    res.json({ code: 200, message: "操作成功", data: mockProducts.filter(p => p.isNew) });
  });

  app.get("/api/product/recommend", (req, res) => {
    res.json({ code: 200, message: "操作成功", data: mockProducts });
  });

  app.get("/api/product/:id", (req, res) => {
    const product = mockProducts.find(p => p.id === Number(req.params.id));
    if (product) {
      res.json({ code: 200, message: "操作成功", data: product });
    } else {
      // Return 200 with error code as per doc strategy sometimes, or 404
      res.status(404).json({ code: 2001, message: "商品不存在" });
    }
  });

  // Cart Module
  let mockCart = {
    cartItems: [
      {
        productId: 1001,
        productName: "印尼进口燕窝 100g",
        productMainImage: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=400",
        productPrice: 599.00,
        quantity: 1,
        totalPrice: 599.00,
        selected: true
      }
    ],
    totalAmount: 599.00,
    selectedAmount: 599.00,
    allSelected: true
  };

  app.get("/api/cart", (req, res) => {
    res.json({
      code: 200,
      message: "操作成功",
      data: mockCart
    });
  });

  app.post("/api/cart/add", (req, res) => {
    const { productId, quantity } = req.body;
    const product = mockProducts.find(p => p.id === productId);
    if (!product) return res.status(404).json({ code: 2001, message: "商品不存在" });
    
    const existing = mockCart.cartItems.find(i => i.productId === productId);
    if (existing) {
      existing.quantity += quantity;
      existing.totalPrice = (existing.quantity * existing.productPrice);
    } else {
      mockCart.cartItems.push({
        productId: product.id,
        productName: product.name,
        productMainImage: product.mainImage,
        productPrice: product.price,
        quantity: quantity,
        totalPrice: product.price * quantity,
        selected: true
      });
    }
    updateCartTotals();
    res.json({ code: 200, message: "添加成功", data: null });
  });

  app.put("/api/cart/quantity", (req, res) => {
    const { productId, quantity } = req.body;
    const item = mockCart.cartItems.find(i => i.productId === productId);
    if (item) {
      item.quantity = quantity;
      item.totalPrice = item.quantity * item.productPrice;
      updateCartTotals();
    }
    res.json({ code: 200, message: "更新成功", data: null });
  });

  app.delete("/api/cart/clear", (req, res) => {
    mockCart.cartItems = [];
    updateCartTotals();
    res.json({ code: 200, message: "已清空", data: null });
  });

  app.delete("/api/cart/:productId", (req, res) => {
    mockCart.cartItems = mockCart.cartItems.filter(i => i.productId !== Number(req.params.productId));
    updateCartTotals();
    res.json({ code: 200, message: "已移除", data: null });
  });

  app.put("/api/cart/select", (req, res) => {
    const { productId, selected } = req.body;
    const item = mockCart.cartItems.find(i => i.productId === productId);
    if (item) {
      item.selected = selected;
      updateCartTotals();
    }
    res.json({ code: 200, message: "设置成功", data: null });
  });

  app.put("/api/cart/selectAll", (req, res) => {
    const { selected } = req.body;
    mockCart.cartItems.forEach(i => i.selected = selected);
    updateCartTotals();
    res.json({ code: 200, message: "设置成功", data: null });
  });

  function updateCartTotals() {
    mockCart.totalAmount = mockCart.cartItems.reduce((sum, i) => sum + i.totalPrice, 0);
    mockCart.selectedAmount = mockCart.cartItems.filter(i => i.selected).reduce((sum, i) => sum + i.totalPrice, 0);
    mockCart.allSelected = mockCart.cartItems.length > 0 && mockCart.cartItems.every(i => i.selected);
  }

  // Category Module
  app.get("/api/category/tree", (req, res) => {
    res.json({
      code: 200,
      message: "操作成功",
      data: [
        { id: 1, name: "燕窝", children: [] },
        { id: 2, name: "人参", children: [] },
        { id: 3, name: "阿胶", children: [] },
      ]
    });
  });

  // Order Module
  app.post("/api/order/create", (req, res) => {
    const { items, receiverName, receiverPhone, receiverAddress, couponId } = req.body;
    
    // Calculate total amount
    let totalAmount = 0;
    const orderItems = items.map((item: any, index: number) => {
      const product = mockProducts.find(p => p.id === item.productId);
      const price = product ? product.price : item.price;
      const subTotal = price * item.quantity;
      totalAmount += subTotal;
      return {
        id: index + 1,
        productId: item.productId,
        productName: product ? product.name : "未知商品",
        productImage: product ? product.mainImage : "",
        price: price,
        quantity: item.quantity,
        totalPrice: subTotal
      };
    });

    const discountAmount = couponId ? 50 : 0;
    const payAmount = totalAmount - discountAmount;
    const orderId = mockOrders.length + 5001;
    const orderNo = "ORD" + Date.now();

    const newOrder = {
      id: orderId,
      orderNo: orderNo,
      totalAmount,
      discountAmount,
      payAmount,
      status: 0,
      statusName: "待支付",
      receiverName,
      receiverPhone,
      receiverAddress,
      createTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
      items: orderItems
    };

    mockOrders.unshift(newOrder);

    res.json({
      code: 200,
      message: "订单创建成功",
      data: newOrder
    });
  });

  app.get("/api/order/list", (req, res) => {
    res.json({
      code: 200,
      message: "操作成功",
      data: {
        total: mockOrders.length,
        pages: 1,
        pageNum: 1,
        pageSize: 10,
        list: mockOrders
      }
    });
  });

  app.get("/api/order/:id", (req, res) => {
    const order = mockOrders.find(o => o.id === Number(req.params.id) || o.orderNo === req.params.id);
    if (order) {
      res.json({ code: 200, message: "操作成功", data: order });
    } else {
      res.status(404).json({ code: 3001, message: "订单不存在" });
    }
  });

  app.post("/api/order/:id/cancel", (req, res) => {
    const order = mockOrders.find(o => o.id === Number(req.params.id));
    if (order) {
      order.status = 4;
      order.statusName = "已取消";
      res.json({ code: 200, message: "订单已取消", data: null });
    } else {
      res.status(404).json({ code: 3001, message: "订单不存在" });
    }
  });

  app.post("/api/order/:id/pay", (req, res) => {
    const order = mockOrders.find(o => o.id === Number(req.params.id));
    if (order) {
      order.status = 1;
      order.statusName = "已支付";
      order.payTime = new Date().toISOString().replace('T', ' ').substring(0, 19);
      res.json({
        code: 200,
        message: "支付成功",
        data: {
          orderId: order.id,
          status: 1,
          payTime: order.payTime
        }
      });
    } else {
      res.status(404).json({ code: 3001, message: "订单不存在" });
    }
  });

  // Address Module
  app.get("/api/address/list", (req, res) => {
    res.json({
      code: 200,
      message: "操作成功",
      data: [
        { id: 101, receiverName: "张三", receiverPhone: "13800138000", province: "浙江省", city: "杭州市", district: "西湖区", detailAddress: "科技园某大厦101", isDefault: 1 }
      ]
    });
  });

  app.get("/api/address/default", (req, res) => {
    res.json({
      code: 200,
      message: "操作成功",
      data: { id: 101, receiverName: "张三", receiverPhone: "13800138000", province: "浙江省", city: "杭州市", district: "西湖区", detailAddress: "科技园某大厦101", isDefault: 1 }
    });
  });

  // Coupon Module
  app.get("/api/coupon/usable", (req, res) => {
    res.json({
      code: 200,
      message: "操作成功",
      data: [
        { userCouponId: 101, name: "立减50元", value: 50, minAmount: 299, type: 1 }
      ]
    });
  });

  // Seckill Module
  app.get("/api/seckill/sessions", (req, res) => {
    res.json({
      code: 200,
      message: "操作成功",
      data: [
        { id: 1, name: "10:00", status: 1 },
        { id: 2, name: "14:00", status: 0 },
      ]
    });
  });

  app.get("/api/seckill/list", (req, res) => {
    res.json({
      code: 200,
      message: "操作成功",
      data: {
        total: 1,
        list: [
          {
            id: 1,
            productId: 1001,
            productName: "印尼进口燕窝 100g",
            mainImage: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=400",
            originalPrice: 599.00,
            seckillPrice: 399.00,
            stock: 100,
            limitPerUser: 2,
            startTime: "2024-12-25 10:00:00",
            endTime: "2024-12-25 11:00:00",
            status: 1,
            statusName: "进行中"
          }
        ]
      }
    });
  });

  // Review Module
  app.get("/api/review/product/:productId", (req, res) => {
    res.json({
      code: 200,
      message: "操作成功",
      data: {
        list: [
          { id: 1, userId: 10001, nickname: "健身达人", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=1", rating: 5, content: "效果非常好，已经回购多次了！", createTime: new Date().toISOString() },
        ],
        total: 1
      }
    });
  });

  // Generic 404 for other API routes
  app.all("/api/*", (req, res) => {
    console.warn(`Mock API not implemented: ${req.method} ${req.url}`);
    res.status(404).json({ code: 404, message: `Mock API not implemented: ${req.url}` });
  });

  // --- VITE MIDDLEWARE ---
  
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
