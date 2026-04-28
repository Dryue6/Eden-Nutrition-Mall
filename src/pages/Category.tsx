import React, { useEffect, useState } from 'react';
import { categoryApi, productApi } from '@/src/api';
import { CategoryTreeVO, ProductVO } from '@/src/api/types';
import { Link } from 'react-router-dom';
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
      <main className="flex-1 overflow-y-auto p-4">
        <div className="flex flex-col gap-4">
          <header className="mb-2">
            <h2 className="text-base font-bold text-gray-800">
              {(Array.isArray(categories) ? categories.find(c => c.id === activeCategory)?.name : '') || '分类商品'}
            </h2>
          </header>

          {loading ? (
            <div className="flex justify-center py-20 text-gray-400 text-sm">加载中...</div>
          ) : products.length === 0 ? (
            <div className="flex justify-center py-20 text-gray-400 text-sm">暂无商品</div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {Array.isArray(products) && products.map((product) => (
                <Link 
                  to={`/product/${product.id}`} 
                  key={product.id}
                  className="flex gap-3 bg-white p-2 rounded-xl border border-gray-50 shadow-sm"
                >
                  <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    <img 
                      src={product.mainImage || 'https://picsum.photos/seed/nutrition/200/200'} 
                      alt={product.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex flex-col justify-between py-1">
                    <h4 className="text-sm font-medium text-gray-800 line-clamp-2">
                      {product.name}
                    </h4>
                    <div className="flex items-baseline gap-2">
                      <span className="text-emerald-600 font-bold text-sm">
                        {formatPrice(product.price)}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        销量 {product.sales}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Category;
