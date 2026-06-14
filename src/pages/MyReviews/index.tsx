import React, { useEffect, useState } from 'react';
import Taro from '@tarojs/taro';
import { reviewApi } from '@/src/api';
import { ProductReview } from '@/src/api/types';
import { formatDate } from '@/src/lib/utils';

const MyReviews: React.FC = () => {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState(true);

  /** 获取当前登录用户评价，后端会按 token 限定用户归属。 */
  const fetchReviews = async () => {
    setLoading(true);
    try {
      const data = await reviewApi.getMyReviews({ pageNum: 1, pageSize: 50 });
      setReviews(data.list || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDelete = async (reviewId: number) => {
    await reviewApi.deleteReview(reviewId);
    Taro.showToast({ title: '已删除', icon: 'success' });
    fetchReviews();
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <div className="bg-white p-4 sticky top-0 z-10 flex items-center shadow-sm">
        {/*<button onClick={() => Taro.navigateBack()} className="text-emerald-600 mr-4 text-sm">返回</button>*/}
        <h1 className="text-lg font-bold text-gray-800">我的评价</h1>
      </div>
      <div className="p-4 space-y-3">
        {loading ? (
          <div className="text-center py-20 text-gray-400">加载中...</div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-20 text-gray-400">暂无评价</div>
        ) : reviews.map((review) => (
          <div key={review.id} className="bg-white rounded-xl p-4 border border-gray-50 shadow-sm">
            <div className="flex gap-3">
              <img src={review.productImage || 'https://picsum.photos/seed/product/100/100'} className="w-16 h-16 rounded-lg object-cover" referrerPolicy="no-referrer" />
              <div className="flex-1">
                <h3 className="text-sm font-bold text-gray-800 line-clamp-1">{review.productName || `商品 ${review.productId}`}</h3>
                <p className="text-xs text-yellow-500 mt-1">{'★'.repeat(review.rating)}{'☆'.repeat(Math.max(0, 5 - review.rating))}</p>
                <p className="text-xs text-gray-500 mt-2 leading-relaxed">{review.content}</p>
              </div>
            </div>
            <div className="flex items-center justify-between mt-3">
              <span className="text-[10px] text-gray-400">{formatDate(review.createTime)}</span>
              <button onClick={() => handleDelete(review.id)} className="text-xs text-red-500">删除</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyReviews;
