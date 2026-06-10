import React, { useEffect, useState } from 'react';
import Taro from '@tarojs/taro';
import { reviewApi } from '@/src/api';
import { ProductReview } from '@/src/api/types';
import { formatDate } from '@/src/lib/utils';

const ReviewList: React.FC = () => {
  const router = Taro.getCurrentInstance().router;
  const productId = Number(router?.params?.productId);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [stats, setStats] = useState<{ avgRating?: number; totalCount?: number }>({});
  const [loading, setLoading] = useState(true);

  /** 商品评价页并行获取统计和分页列表，保证头部概览与列表一致。 */
  const fetchReviews = async () => {
    if (!productId) return;
    setLoading(true);
    try {
      const [reviewPage, reviewStats] = await Promise.all([
        reviewApi.getProductReviews(productId, { pageNum: 1, pageSize: 50 }),
        reviewApi.getReviewStats(productId),
      ]);
      setReviews(reviewPage.list || []);
      setStats(reviewStats || {});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <div className="bg-white p-4 sticky top-0 z-10 flex items-center shadow-sm">
        <button onClick={() => Taro.navigateBack()} className="text-emerald-600 mr-4 text-sm">返回</button>
        <h1 className="text-lg font-bold text-gray-800">商品评价</h1>
      </div>
      <div className="p-4 space-y-4">
        <section className="bg-white rounded-xl p-4">
          <p className="text-sm text-gray-500">综合评分</p>
          <div className="flex items-end gap-2 mt-1">
            <span className="text-3xl font-bold text-yellow-500">{stats.avgRating || 5}</span>
            <span className="text-xs text-gray-400 mb-1">共 {stats.totalCount || reviews.length} 条评价</span>
          </div>
        </section>
        {/* 评价发布必须绑定已完成订单，本页只承担公开评价查看，避免绕过购买校验伪造评价。 */}
        {loading ? (
          <div className="text-center py-20 text-gray-400">加载中...</div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-20 text-gray-400">暂无评价</div>
        ) : reviews.map((review) => (
          <div key={review.id} className="bg-white rounded-xl p-4 border border-gray-50 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-gray-700">{review.nickname || '匿名用户'}</span>
              <span className="text-xs text-yellow-500">{'★'.repeat(review.rating)}</span>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed mt-3">{review.content}</p>
            <p className="text-[10px] text-gray-400 mt-3">{formatDate(review.createTime)}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewList;
