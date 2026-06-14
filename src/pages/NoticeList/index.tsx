/*
import React, { useEffect, useState } from 'react';
import Taro from '@tarojs/taro';
import { noticeApi } from '@/src/api';
import { Notice } from '@/src/api/types';
import { formatDate, cn } from '@/src/lib/utils';

const NoticeList: React.FC = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);

  /!** 拉取当前用户通知列表，消息中心首版固定加载前 50 条。 *!/
  const fetchNotices = async () => {
    setLoading(true);
    try {
      const data = await noticeApi.list({ pageNum: 1, pageSize: 50 });
      setNotices(data.list || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  /!** 标记单条已读后本地同步状态，减少重复请求。 *!/
  const handleRead = async (notice: Notice) => {
    if (notice.isRead === 0) {
      await noticeApi.markRead(notice.id);
      setNotices((list) => list.map((item) => item.id === notice.id ? { ...item, isRead: 1 } : item));
    }
  };

  const handleReadAll = async () => {
    await noticeApi.markAllRead();
    setNotices((list) => list.map((item) => ({ ...item, isRead: 1 })));
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <div className="bg-white p-4 sticky top-0 z-10 flex items-center justify-between shadow-sm">
        <button onClick={() => Taro.navigateBack()} className="text-emerald-600 text-sm">返回</button>
        <h1 className="text-lg font-bold text-gray-800">消息通知</h1>
        <button onClick={handleReadAll} className="text-xs text-gray-500">全部已读</button>
      </div>
      <div className="p-4 space-y-3">
        {loading ? (
          <div className="text-center py-20 text-gray-400">加载中...</div>
        ) : notices.length === 0 ? (
          <div className="text-center py-20 text-gray-400">暂无通知</div>
        ) : notices.map((notice) => (
          <div key={notice.id} onClick={() => handleRead(notice)} className="bg-white rounded-xl p-4 border border-gray-50 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-bold text-gray-800">{notice.title}</h3>
                <p className="text-sm text-gray-500 mt-2 leading-relaxed">{notice.content}</p>
              </div>
              <span className={cn('text-[10px] px-2 py-1 rounded-full', notice.isRead === 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400')}>
                {notice.isRead === 0 ? '未读' : '已读'}
              </span>
            </div>
            <p className="text-[10px] text-gray-400 mt-3">{formatDate(notice.createTime)}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NoticeList;
*/
