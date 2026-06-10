import React, { useEffect, useState } from 'react';
import Taro from '@tarojs/taro';
import { supportApi } from '@/src/api';
import { SupportMessage, SupportSession } from '@/src/api/types';
import { formatDate, cn } from '@/src/lib/utils';

const SupportChat: React.FC = () => {
  const router = Taro.getCurrentInstance().router;
  const productId = router?.params?.productId ? Number(router.params.productId) : undefined;
  const [session, setSession] = useState<SupportSession | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  /** 进入客服页时获取或创建会话，再加载消息流，保证两个入口都能落到同一套客服能力。 */
  const loadSession = async () => {
    setLoading(true);
    try {
      const nextSession = await supportApi.getOrCreateSession(productId);
      setSession(nextSession);
      const list = await supportApi.listMessages(nextSession.id);
      setMessages(Array.isArray(list) ? list : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSession();
  }, []);

  /** 发送前校验空白内容，提交成功后立即刷新消息列表。 */
  const handleSend = async () => {
    if (!session || !content.trim()) return;
    await supportApi.sendMessage({ sessionId: session.id, content: content.trim() });
    setContent('');
    const list = await supportApi.listMessages(session.id);
    setMessages(Array.isArray(list) ? list : []);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-white p-4 sticky top-0 z-10 flex items-center shadow-sm">
        <button onClick={() => Taro.navigateBack()} className="text-emerald-600 mr-4 text-sm">返回</button>
        <h1 className="text-lg font-bold text-gray-800">我的客服</h1>
      </div>

      <div className="p-4 space-y-3">
        {loading ? (
          <div className="text-center py-20 text-gray-400">加载中...</div>
        ) : messages.length === 0 ? (
          <div className="text-center py-20 text-gray-400">暂无消息</div>
        ) : messages.map((message) => (
          <div key={message.id} className={cn('flex', message.senderType === 'USER' ? 'justify-end' : 'justify-start')}>
            <div className={cn('max-w-[78%] rounded-xl px-4 py-3 text-sm', message.senderType === 'USER' ? 'bg-emerald-600 text-white' : 'bg-white text-gray-700')}>
              <p className="leading-relaxed">{message.content}</p>
              <p className={cn('text-[10px] mt-2', message.senderType === 'USER' ? 'text-white/70' : 'text-gray-400')}>{formatDate(message.createTime)}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-gray-100 p-3 flex gap-2">
        <input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="请输入咨询内容"
          className="flex-1 bg-gray-50 rounded-full px-4 py-3 text-sm"
        />
        <button onClick={handleSend} className="px-5 rounded-full bg-emerald-600 text-white text-sm font-bold">发送</button>
      </div>
    </div>
  );
};

export default SupportChat;
