import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Bell, ChevronRight } from 'lucide-react';
import { productApi } from '@/src/api';
import { ProductVO } from '@/src/api/types';
import { formatPrice, cn } from '@/src/lib/utils';
import { motion } from 'motion/react';

const Home: React.FC = () => {
  const [hotProducts, setHotProducts] = useState<ProductVO[]>([]);
  const [recommendProducts, setRecommendProducts] = useState<ProductVO[]>([]);
  const [newProducts, setNewProducts] = useState<ProductVO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [hot, recommend, latest] = await Promise.all([
          productApi.getHotProducts(),
          productApi.getRecommendProducts(),
          productApi.getNewProducts(),
        ]);
        setHotProducts(hot);
        setRecommendProducts(recommend);
        setNewProducts(latest);
      } catch (error) {
        console.error('Failed to fetch home data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="flex flex-col gap-6 p-4">
      {/* Header */}
      <header className="flex items-center justify-between gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="搜索营养补剂..."
            className="w-full bg-white border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-emerald-500 shadow-sm"
          />
        </div>
        <button className="p-2 bg-white rounded-full shadow-sm text-gray-600">
          <Bell size={20} />
        </button>
      </header>

      {/* Banner Placeholder */}
      <section className="w-full h-40 bg-emerald-600 rounded-2xl overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-700/50 to-transparent flex flex-col justify-center p-6 text-white">
          <h2 className="text-xl font-bold mb-1">春季营养季</h2>
          <p className="text-sm opacity-90">全场满299减50</p>
          <button className="mt-3 bg-white text-emerald-700 px-4 py-1.5 rounded-full text-xs font-bold w-fit">
            立即抢购
          </button>
        </div>
        <img 
          src="https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=800" 
          alt="Banner" 
          className="w-full h-full object-cover mix-blend-overlay"
          referrerPolicy="no-referrer"
        />
      </section>

      {/* Quick Actions */}
      <section className="grid grid-cols-4 gap-4 text-center">
        {[
          { label: '新品上市', icon: '🆕', color: 'bg-blue-50' },
          { label: '热门排行', icon: '🔥', color: 'bg-orange-50' },
          { label: '领券中心', icon: '🎫', color: 'bg-red-50' },
          { label: '每日签到', icon: '📅', color: 'bg-emerald-50' },
        ].map((item, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-sm", item.color)}>
              {item.icon}
            </div>
            <span className="text-[11px] font-medium text-gray-600">{item.label}</span>
          </div>
        ))}
      </section>

      {/* Hot Products */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800">热门爆款</h3>
          <Link to="/category" className="text-xs text-emerald-600 flex items-center gap-0.5">
            更多 <ChevronRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {Array.isArray(hotProducts) && hotProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Recommend Products */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800">为你推荐</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {Array.isArray(recommendProducts) && recommendProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
};

const ProductCard: React.FC<{ product: ProductVO }> = ({ product }) => {
  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-50"
    >
      <Link to={`/product/${product.id}`}>
        <div className="aspect-square bg-gray-100 overflow-hidden">
          <img 
            src={product.mainImage || 'https://picsum.photos/seed/nutrition/400/400'} 
            alt={product.name}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="p-3">
          <h4 className="text-sm font-medium text-gray-800 line-clamp-2 mb-2 h-10">
            {product.name}
          </h4>
          <div className="flex items-end justify-between">
            <span className="text-emerald-600 font-bold text-base">
              {formatPrice(product.price)}
            </span>
            <span className="text-[10px] text-gray-400">
              已售 {product.sales}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default Home;
