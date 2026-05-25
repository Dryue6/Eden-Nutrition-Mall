import React, { useEffect, useState } from 'react';
import Taro from '@tarojs/taro';
import { View, Image } from '@tarojs/components';
import { categoryApi, productApi } from '@/src/api';
import { CategoryTreeVO, ProductVO } from '@/src/api/types';
import { formatPrice, cn } from '@/src/lib/utils';

const Category: React.FC = () => {
  const [categories, setCategories] = useState<CategoryTreeVO[]>([]);
  const [activeCategory, setActiveCategory] = useState<number | null>(null); // 第一级分类 ID
  const [expandedCategory, setExpandedCategory] = useState<number | null>(null); // 展开的一级分类 ID
  const [activeSubCategory, setActiveSubCategory] = useState<number | null>(null); // 第二级分类 ID
  const [products, setProducts] = useState<ProductVO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const tree = await categoryApi.getCategoryTree();
        setCategories(tree);
        if (tree && tree.length > 0) {
          const firstCat = tree[0];
          setActiveCategory(firstCat.id);
          setExpandedCategory(firstCat.id);
          if (firstCat.children && firstCat.children.length > 0) {
            setActiveSubCategory(firstCat.children[0].id);
          } else {
            setActiveSubCategory(firstCat.id);
          }
        }
      } catch (error) {
        console.error('Failed to fetch categories', error);
      }
    };
    fetchCategories();
  }, []);

  // 当一级分类改变时，自动将二级分类选中到它的第一个孩子
  const handleLevel1Click = (cat: CategoryTreeVO) => {
    if (expandedCategory === cat.id) {
      // 再次点击已展开的菜单，收起它
      setExpandedCategory(null);
    } else {
      // 点击未展开的菜单，展开并设置为活跃状态
      setExpandedCategory(cat.id);
      setActiveCategory(cat.id);
      if (cat.children && cat.children.length > 0) {
        setActiveSubCategory(cat.children[0].id);
      } else {
        setActiveSubCategory(cat.id);
      }
    }
  };

  useEffect(() => {
    // 根据具体选中的分类去查询商品（如果有二级，选二级；否则选一级）
    if (activeSubCategory) {
      const fetchProducts = async () => {
        setLoading(true);
        try {
          const list = await productApi.getByCategory(activeSubCategory);
          // 兼容后端返回数组或包裹分页对象
          setProducts(Array.isArray(list) ? list : (list as any)?.records || []);
        } catch (error) {
          console.error('Failed to fetch products', error);
        } finally {
          setLoading(false);
        }
      };
      fetchProducts();
    }
  }, [activeSubCategory]);

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      {/* Sidebar - 一级分类与展开的二级分类 */}
      <aside className="w-28 bg-gray-50 border-r border-gray-100 overflow-y-auto shrink-0">
        {Array.isArray(categories) && categories.map((cat) => (
          <div key={cat.id} className="flex flex-col w-full">
            <button
              onClick={() => handleLevel1Click(cat)}
              className={cn(
                "w-full py-4 px-3 text-xs font-medium transition-all relative flex items-center justify-between",
                activeCategory === cat.id
                  ? "bg-white text-emerald-600"
                  : "text-gray-500 hover:text-emerald-500"
              )}
            >
              {activeCategory === cat.id && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-emerald-600 rounded-r-full" />
              )}
              <span>{cat.name}</span>
              {cat.children && cat.children.length > 0 && (
                <span className={cn("text-[8px] text-gray-400 transition-transform", expandedCategory === cat.id && "rotate-180")}>▼</span>
              )}
            </button>

            {/* 展开的二级菜单 */}
            {expandedCategory === cat.id && cat.children && cat.children.length > 0 && (
              <div className="bg-white flex flex-col w-full pb-2">
                {cat.children.map((subCat) => (
                  <button
                    key={subCat.id}
                    onClick={() => setActiveSubCategory(subCat.id)}
                    className={cn(
                      "w-full py-2.5 pl-6 pr-2 !text-[18px] text-left transition-all",
                      activeSubCategory === subCat.id
                        ? "text-emerald-600 font-bold"
                        : "text-gray-400 hover:text-emerald-500"
                    )}
                  >
                    {subCat.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </aside>

      {/* Content - 商品 */}
      <main className="flex-1 bg-white overflow-y-auto w-0 relative flex flex-col">
        {/* 商品列表 */}
        <div className="p-4 pb-20 flex-1">
          {loading ? (
            <div className="flex items-center justify-center h-40 text-gray-400 text-xs">加载中...</div>
          ) : !Array.isArray(products) || products.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-400 text-xs gap-2">
              <span className="text-2xl opacity-20">📦</span>
              暂无商品
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {products.map((product) => (
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
          <span className="text-[14px] text-gray-400">
            销量 {product.sales}
          </span>
        </div>
      </div>
    </View>
  );
};

export default Category;
