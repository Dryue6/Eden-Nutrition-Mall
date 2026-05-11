# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/a90b7e60-6300-48c8-b264-5c9ea2ebbc3e

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

---

## Taro 微信小程序

本项目已集成 **Taro 框架**，可编译为微信小程序运行。

### 安装依赖

```bash
npm install --legacy-peer-deps
```

### 开发模式（带热重载）

```bash
npm run dev:weapp
```

### 生产构建

```bash
npm run build:weapp
```

> **注意**: Webpack watch 模式重建可能产生不完整的 `dist-weapp/` 输出（仅 JSON 配置文件）。如遇样式丢失或页面空白，请先执行 `npm run build:weapp` 完成一次完整构建，再使用 `npm run dev:weapp` 进入开发模式。

### 微信开发者工具

1. 打开 **微信开发者工具**
2. 导入项目目录下的 `dist-weapp/` 文件夹
3. 在「详情」→「本地设置」中勾选 **增强编译** 和 **不校验合法域名、web-view（业务域名）、TLS 版本以及 HTTPS 证书**
4. AppID: `wxd562c395c2beeefb`

### 后端服务

- 后端 API 地址: `http://localhost:8080/api`（配置在 `src/api/request.ts` 的 `REAL_BACKEND_URL`）
- 开发时需确保后端服务已运行
- 微信小程序生产环境需配置合法域名白名单，本地开发勾选「不校验合法域名」即可

### 项目结构说明

```
src/
├── app.config.ts        # Taro 路由和 tabBar 配置
├── app.tsx              # Taro 入口组件
├── index.css            # Tailwind CSS 入口
├── api/                 # API 请求层（已适配 Taro）
│   ├── request.ts       # 基于 Taro.request 的 HTTP 客户端，含 cleanParams 全局过滤
│   ├── index.ts         # 各模块 API 封装
│   └── types.ts         # TypeScript 类型定义
├── lib/
│   └── utils.ts         # 工具函数（价格格式化、日期格式化）
├── assets/              # tabBar 图标资源
└── pages/               # 页面（共 12 个）
    ├── Home/            # 首页
    ├── Category/        # 商品分类
    ├── Seckill/         # 限时秒杀
    ├── Cart/            # 购物车
    ├── Profile/         # 个人中心
    ├── Login/           # 登录
    ├── Register/        # 注册
    ├── ProductDetail/   # 商品详情
    ├── Checkout/        # 确认订单
    ├── AddressList/     # 收货地址
    ├── OrderList/       # 我的订单
    └── OrderDetail/     # 订单详情
```

### 注意事项

- **基础库版本**: `Intl.NumberFormat`（价格格式化）需微信基础库 2.16.0+
- **tabBar 图标**: `src/assets/` 中的占位图标建议替换为实际设计稿
- **Tailwind CSS**: 已接入 `weapp-tailwindcss` v4，支持在小程序中使用 Tailwind 原子化类名。使用 `config/index.js` 中 `@tailwindcss/postcss` 插件注入，并禁用 CSS Modules（`cssModules: {enable: false}`）以解决类名不匹配问题
- **HTML 标签兼容**: 通过 `@tarojs/plugin-html` 支持 `div/span/img` 等 HTML 标签自动转换
- **参数过滤**: `request.ts` 中的 `cleanParams()` 函数自动过滤 GET 请求参数中的 `null`/`undefined`/`NaN`，避免无效参数传到后端
- **订单状态**: 0=待支付, 1=已支付, 2=已发货, 3=已完成, 4=已取消, 5=已退款
