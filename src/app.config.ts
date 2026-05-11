export default defineAppConfig({
  pages: [
    'pages/Home/index',
    'pages/Category/index',
    'pages/Seckill/index',
    'pages/Cart/index',
    'pages/Profile/index',
    'pages/Login/index',
    'pages/Register/index',
    'pages/ProductDetail/index',
    'pages/Checkout/index',
    'pages/AddressList/index',
    'pages/OrderList/index',
    'pages/OrderDetail/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: 'Eden Nutrition',
    navigationBarTextStyle: 'black'
  },
  tabBar: {
    color: '#9ca3af',
    selectedColor: '#059669',
    backgroundColor: '#ffffff',
    list: [
      { pagePath: 'pages/Home/index', text: '首页', iconPath: './assets/home.png', selectedIconPath: './assets/home-active.png' },
      { pagePath: 'pages/Category/index', text: '分类', iconPath: './assets/category.png', selectedIconPath: './assets/category-active.png' },
      { pagePath: 'pages/Seckill/index', text: '秒杀', iconPath: './assets/seckill.png', selectedIconPath: './assets/seckill-active.png' },
      { pagePath: 'pages/Cart/index', text: '购物车', iconPath: './assets/cart.png', selectedIconPath: './assets/cart-active.png' },
      { pagePath: 'pages/Profile/index', text: '我的', iconPath: './assets/profile.png', selectedIconPath: './assets/profile-active.png' }
    ]
  }
})