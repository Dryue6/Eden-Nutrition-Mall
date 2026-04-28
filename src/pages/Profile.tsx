import React, { useEffect, useState } from 'react';
import { userApi, orderApi } from '@/src/api';
import { UserVO, Order } from '@/src/api/types';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Settings, 
  ChevronRight, 
  Wallet, 
  Package, 
  Truck, 
  CheckCircle, 
  MapPin, 
  Ticket, 
  Headphones,
  LogOut
} from 'lucide-react';

const Profile: React.FC = () => {
  const [user, setUser] = useState<UserVO | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await userApi.getUserInfo();
        setUser(data);
      } catch (error) {
        console.error('Failed to fetch user info', error);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await userApi.logout();
      localStorage.removeItem('token');
      navigate('/login');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen text-gray-500">加载中...</div>;

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* Header */}
      <header className="bg-emerald-600 pt-12 pb-20 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-400/20 rounded-full -ml-12 -mb-12 blur-xl" />
        
        <div className="flex items-center justify-between mb-8 relative z-10">
          <h1 className="text-white text-xl font-bold">个人中心</h1>
          <button className="text-white/80 hover:text-white">
            <Settings size={22} />
          </button>
        </div>

        <div className="flex items-center gap-4 relative z-10">
          <div className="w-16 h-16 rounded-full border-2 border-white/30 overflow-hidden bg-white/20">
            <img 
              src={user?.avatar || 'https://picsum.photos/seed/user/100/100'} 
              alt="Avatar" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="text-white">
            <h2 className="text-lg font-bold">{user?.nickname || user?.username}</h2>
            <p className="text-xs opacity-80">{user?.phone || '未绑定手机号'}</p>
          </div>
        </div>
      </header>

      {/* Order Stats Card */}
      <div className="px-4 -mt-12 relative z-20">
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-50">
            <h3 className="text-sm font-bold text-gray-800">我的订单</h3>
            <Link to="/orders" className="text-[11px] text-gray-400 flex items-center gap-0.5">
              全部订单 <ChevronRight size={12} />
            </Link>
          </div>
          <div className="grid grid-cols-4 gap-2">
            <OrderStatIcon icon={<Wallet size={22} />} label="待付款" to="/orders?status=0" />
            <OrderStatIcon icon={<Package size={22} />} label="待发货" to="/orders?status=1" />
            <OrderStatIcon icon={<Truck size={22} />} label="待收货" to="/orders?status=2" />
            <OrderStatIcon icon={<CheckCircle size={22} />} label="已完成" to="/orders?status=3" />
          </div>
        </div>
      </div>

      {/* Menu List */}
      <div className="px-4 mt-4 space-y-4">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <MenuItem icon={<MapPin size={20} className="text-blue-500" />} label="收货地址" to="/address" />
          <MenuItem icon={<Ticket size={20} className="text-orange-500" />} label="优惠券" to="/coupons" />
          <MenuItem icon={<Headphones size={20} className="text-emerald-500" />} label="联系客服" to="/support" />
        </div>

        <button 
          onClick={handleLogout}
          className="w-full bg-white rounded-2xl shadow-sm p-4 flex items-center justify-center gap-2 text-red-500 font-medium"
        >
          <LogOut size={20} />
          退出登录
        </button>
      </div>
    </div>
  );
};

const OrderStatIcon: React.FC<{ icon: React.ReactNode; label: string; to: string }> = ({ icon, label, to }) => (
  <Link to={to} className="flex flex-col items-center gap-2 text-gray-600 hover:text-emerald-600 transition-colors">
    <div className="text-gray-400">{icon}</div>
    <span className="text-[11px] font-medium">{label}</span>
  </Link>
);

const MenuItem: React.FC<{ icon: React.ReactNode; label: string; to: string }> = ({ icon, label, to }) => (
  <Link to={to} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
    <div className="flex items-center gap-3">
      {icon}
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </div>
    <ChevronRight size={16} className="text-gray-300" />
  </Link>
);

export default Profile;
