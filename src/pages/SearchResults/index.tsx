import React, { useEffect, useState } from 'react';
import Taro from '@tarojs/taro';
import { View, Text, Input, Image, Button } from '@tarojs/components';
import { productApi } from '@/src/api';
import { ProductVO } from '@/src/api/types';
import { formatPrice, cn } from '@/src/lib/utils';
import { resolveProductImage } from '@/src/lib/productImages';

type SortField = 'sales' | 'new' | 'price';

const SORT_OPTIONS: Array<{ label: string; value: SortField }> = [
  { label: '销量', value: 'sales' },
  { label: '新品', value: 'new' },
  { label: '价格', value: 'price' },
];

const SearchResults: React.FC = () => {
  const router = Taro.getCurrentInstance().router;
  const initialKeyword = router?.params?.keyword ? decodeURIComponent(router.params.keyword) : '';
  const [keyword, setKeyword] = useState(initialKeyword);
  const [sortField, setSortField] = useState<SortField>('sales');
  const [products, setProducts] = useState<ProductVO[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState('');

  /**
   * 搜索结果统一走公开商品列表接口。
   * 请求失败时留在当前页展示错误态，避免小程序页面生命周期中的未捕获异常导致白屏。
   */
  const fetchProducts = async (nextKeyword = keyword, nextSortField = sortField) => {
    const normalizedKeyword = nextKeyword.trim();
    setLoading(true);
    setErrorText('');
    try {
      const data = await productApi.list({
        keyword: normalizedKeyword || undefined,
        sortField: nextSortField,
        sortOrder: nextSortField === 'price' ? 'asc' : 'desc',
        pageNum: 1,
        pageSize: 30,
      });
      setProducts(Array.isArray(data?.list) ? data.list : []);
    } catch (error: any) {
      console.error('Failed to fetch search products', error);
      setProducts([]);
      setErrorText(error?.message || '搜索失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(keyword, sortField);
  }, [sortField]);

  /**
   * 小程序 Input 使用 confirm 事件提交搜索，避免依赖 H5 的 form submit / keydown 事件。
   */
  const submitSearch = () => {
    fetchProducts(keyword, sortField);
  };

  const changeSort = (value: SortField) => {
    setSortField(value);
  };

  return (
    <View className="min-h-screen bg-gray-50 pb-8">
      <View className="sticky top-0 z-10 bg-white p-4 shadow-sm">
        <View className="flex gap-2">
          <Button
            onClick={() => Taro.navigateBack()}
            className="m-0 flex items-center justify-center bg-transparent p-0 text-sm text-emerald-600"
          >
            返回
          </Button>
          <Input
            value={keyword}
            onInput={(event) => setKeyword(String(event.detail.value || ''))}
            onConfirm={submitSearch}
            confirmType="search"
            placeholder="搜索营养补剂"
            className="min-w-0 flex-1 rounded-full bg-gray-50 px-4 py-2 text-sm"
          />
          <Button
            onClick={submitSearch}
            className="m-0 rounded-full bg-emerald-600 px-4 py-2 text-sm text-white"
          >
            搜索
          </Button>
        </View>
      </View>

      <View className="p-4">
        <View className="mb-4 flex gap-2">
          {SORT_OPTIONS.map((item) => (
            <Button
              key={item.value}
              onClick={() => changeSort(item.value)}
              className={cn(
                'm-0 rounded-full px-4 py-2 text-xs',
                sortField === item.value ? 'bg-emerald-600 text-white' : 'bg-white text-gray-500'
              )}
            >
              {item.label}
            </Button>
          ))}
        </View>

        {loading ? (
          <View className="py-20 text-center text-gray-400">
            <Text>搜索中...</Text>
          </View>
        ) : errorText ? (
          <View className="py-20 text-center text-gray-400">
            <Text>{errorText}</Text>
          </View>
        ) : products.length === 0 ? (
          <View className="py-20 text-center text-gray-400">
            <Text>暂无商品</Text>
          </View>
        ) : (
          <View className="grid grid-cols-2 gap-3">
            {products.map((product) => (
              <View
                key={product.id}
                onClick={() => Taro.navigateTo({ url: `/pages/ProductDetail/index?id=${product.id}` })}
                className="overflow-hidden rounded-xl border border-gray-50 bg-white shadow-sm"
              >
                <Image
                  src={resolveProductImage(product, 'https://picsum.photos/seed/product/300/300')}
                  mode="aspectFill"
                  className="aspect-square w-full bg-gray-100"
                />
                <View className="p-3">
                  <Text className="block h-10 text-sm font-medium text-gray-800 line-clamp-2">{product.name}</Text>
                  <Text className="mt-2 block font-bold text-emerald-600">{formatPrice(product.price)}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

export default SearchResults;
