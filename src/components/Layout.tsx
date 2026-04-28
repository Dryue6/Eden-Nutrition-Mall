import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Home, Grid, ShoppingCart, User, Zap } from 'lucide-react';
import { cn } from '@/src/lib/utils';

const Layout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 max-w-md mx-auto relative shadow-xl">
      {/* Main Content Area */}
      <main className="flex-1 pb-20 overflow-y-auto">
        <Outlet />
      </main>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-gray-100 px-6 py-3 flex justify-between items-center z-50">
        <NavItem to="/" icon={<Home size={22} />} label="首页" />
        <NavItem to="/category" icon={<Grid size={22} />} label="分类" />
        <NavItem to="/seckill" icon={<Zap size={22} />} label="秒杀" />
        <NavItem to="/cart" icon={<ShoppingCart size={22} />} label="购物车" />
        <NavItem to="/profile" icon={<User size={22} />} label="我的" />
      </nav>
    </div>
  );
};

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex flex-col items-center gap-1 transition-colors",
          isActive ? "text-emerald-600" : "text-gray-400 hover:text-emerald-500"
        )
      }
    >
      {icon}
      <span className="text-[10px] font-medium">{label}</span>
    </NavLink>
  );
};

export default Layout;
