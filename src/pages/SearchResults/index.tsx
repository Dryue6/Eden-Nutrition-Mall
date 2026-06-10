import React, { useEffect, useState } from 'react';
import Taro from '@tarojs/taro';
import { productApi } from '@/src/api';
import { ProductVO } from '@/src/api/types';
import { formatPrice, cn } from '@/src/lib/utils';

const SearchResults: React.FC = () => {
  const router = Taro.getCurrentInstance().router;
  const initialKeyword = router?.params?.keyword ? decodeURIComponent(router.params.keyword) : '';
  const [keyword, setKeyword] = useState(initialKeyword);
  const [sortField, setSortField] = useState<'sales' | 'new' | 'price'>('sales');
  const [products, setProducts] = useState<ProductVO[]>([]);
  const [loading, setLoading] = useState(false);

  /** 搜索结果统一走 /product/list，支持关键词和排序字段。 */
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await productApi.list({ keyword, sortField, sortOrder: sortField === 'price' ? 'asc' : 'desc', pageNum: 1, pageSize: 30 });
      setProducts(data.list || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [sortField]);

  const submitSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    fetchProducts();
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <div className="bg-white p-4 sticky top-0 z-10 shadow-sm">
        <form onSubmit={submitSearch} className="flex gap-2">
          <button type="button" onClick={() => Taro.navigateBack()} className="text-emerald-600 text-sm">返回</button>
          <input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="搜索营养补剂" className="flex-1 bg-gray-50 rounded-full px-4 py-2 text-sm" />
          <button type="submit" className="px-4 rounded-full bg-emerald-600 text-white text-sm">搜索</button>
        </form>
      </div>
      <div className="p-4">
        <div className="flex gap-2 mb-4">
          {[
            { label: '销量', value: 'sales' },
            { label: '新品', value: 'new' },
            { label: '价格', value: 'price' },
          ].map((item) => (
            <button key={item.value} onClick={() => setSortField(item.value as any)} className={cn('px-4 py-2 rounded-full text-xs', sortField === item.value ? 'bg-emerald-600 text-white' : 'bg-white text-gray-500')}>
              {item.label}
            </button>
          ))}
        </div>
        {loading ? (
          <div className="text-center py-20 text-gray-400">搜索中...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 text-gray-400">暂无商品</div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {products.map((product) => (
              <div key={product.id} onClick={() => Taro.navigateTo({ url: `/pages/ProductDetail/index?id=${product.id}` })} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-50">
                <img src={product.mainImage || 'https://picsum.photos/seed/product/300/300'} className="w-full aspect-square object-cover" referrerPolicy="no-referrer" />
                <div className="p-3">
                  <h3 className="text-sm font-medium text-gray-800 line-clamp-2 h-10">{product.name}</h3>
                  <p className="text-emerald-600 font-bold mt-2">{formatPrice(product.price)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
