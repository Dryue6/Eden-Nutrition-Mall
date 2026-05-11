import React, { useEffect, useState } from 'react';
import Taro from '@tarojs/taro';
import { View, Image } from '@tarojs/components';
import { categoryApi, productApi } from '@/src/api';
import { CategoryTreeVO, ProductVO } from '@/src/api/types';
import { formatPrice, cn } from '@/src/lib/utils';

const Category: React.FC = () => {
  const [categories, setCategories] = useState<CategoryTreeVO[]>([]);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [products, setProducts] = useState<ProductVO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const tree = await categoryApi.getCategoryTree();
        setCategories(tree);
        if (tree.length > 0) {
          setActiveCategory(tree[0].id);
        }
      } catch (error) {
        console.error('Failed to fetch categories', error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (activeCategory) {
      const fetchProducts = async () => {
        setLoading(true);
        try {
          const list = await productApi.getByCategory(activeCategory);
          setProducts(list);
        } catch (error) {
          console.error('Failed to fetch products', error);
        } finally {
          setLoading(false);
        }
      };
      fetchProducts();
    }
  }, [activeCategory]);

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      {/* Sidebar */}
      <aside className="w-24 bg-gray-50 border-r border-gray-100 overflow-y-auto">
        {Array.isArray(categories) && categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={cn(
              "w-full py-4 px-2 text-xs font-medium transition-all relative",
              activeCategory === cat.id
                ? "bg-white text-emerald-600"
                : "text-gray-500 hover:text-emerald-500"
            )}
          >
            {activeCategory === cat.id && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-emerald-600 rounded-r-full" />
            )}
            {cat.name}
          </button>
        ))}
      </aside>

      {/* Content */}
      <main className="flex-1 bg-white overflow-y-auto w-0 relative">
        <div className="p-4 pb-20">
          {loading ? (
            <div className="flex items-center justify-center h-40 text-gray-400 text-xs">加载中...</div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-400 text-xs gap-2">
              <span className="text-2xl opacity-20">☰</span>
              暂无商品
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {Array.isArray(products) && products.map((product) => (
                <CategoryProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

const CategoryProductCard: React.FC<{ product: ProductVO }> = ({ product }) => {
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const checkFav = async () => {
      try {
        const fav = await productApi.checkFavorite(product.id);
        setIsFavorite(fav);
      } catch (e) {
        // Ignore if not logged in
      }
    };
    checkFav();
  }, [product.id]);

  return (
    <View
      onClick={() => Taro.navigateTo({ url: `/pages/ProductDetail/index?id=${product.id}` })}
      className="bg-white rounded-xl p-2 flex flex-col gap-2 relative shadow-sm border border-gray-50 cursor-pointer"
    >
      <div className="absolute top-2 right-2 z-10 p-1 bg-white/80 backdrop-blur rounded-full">
        <span className={cn("text-sm", isFavorite ? 'text-red-500' : 'text-gray-400')}>♡</span>
      </div>
      <div className="w-full aspect-square bg-gray-50 rounded-lg overflow-hidden">
        <img
          src={product.mainImage || 'https://picsum.photos/seed/product/200/200'}
          alt={product.name}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      </div>
      <div className="flex flex-col flex-1 pb-1">
        <h3 className="text-xs font-medium text-gray-800 line-clamp-2 mb-1 flex-1">
          {product.name}
        </h3>
        <div className="flex items-baseline gap-2">
          <span className="text-emerald-600 font-bold text-sm">
            {formatPrice(product.price)}
          </span>
          <span className="text-[10px] text-gray-400">
            销量 {product.sales}
          </span>
        </div>
      </div>
    </View>
  );
};

export default Category;
