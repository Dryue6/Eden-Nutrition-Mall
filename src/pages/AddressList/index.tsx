import React, { useEffect, useState } from 'react';
import Taro from '@tarojs/taro';
import { addressApi } from '@/src/api';
import { UserAddress } from '@/src/api/types';
import { cn } from '@/src/lib/utils';

const AddressList: React.FC = () => {
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<UserAddress>>({});

  const fetchAddresses = async () => {
    try {
      const data = await addressApi.list();
      setAddresses(data);
    } catch (error) {
      console.error('Failed to fetch addresses', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleSetDefault = async (id: number) => {
    try {
      await addressApi.setDefault(id);
      fetchAddresses();
    } catch (error) {
      console.error('Set default failed', error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await addressApi.delete(id);
      fetchAddresses();
      Taro.showToast({ title: '删除成功', icon: 'success' });
    } catch (error) {
      console.error('Failed to delete address', error);
    }
  };

  const handleSubmit = async () => {
    try {
      const submitData = {
        ...editForm,
        isDefault: editForm.isDefault ? 1 : 0,
      };
      if (editForm.id) {
        await addressApi.update(submitData);
      } else {
        await addressApi.add(submitData);
      }
      setIsEditing(false);
      fetchAddresses();
      Taro.showToast({ title: '保存成功', icon: 'success' });
    } catch (error) {
      console.error('Failed to save address', error);
      Taro.showToast({ title: '保存失败', icon: 'none' });
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen text-gray-500">加载中...</div>;

  return (
    <div className="bg-gray-50 min-h-screen pb-24 relative">
      {/* Top Bar */}
      <div className="bg-white p-4 sticky top-0 z-10 flex items-center justify-between shadow-sm">
        <button onClick={() => Taro.navigateBack()} className="text-gray-600 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-50">
          <span className="text-2xl">←</span>
        </button>
        <h1 className="text-lg font-bold text-gray-800">
          {isEditing ? (editForm.id ? '编辑地址' : '新增地址') : '收货地址'}
        </h1>
        <div className="w-8" />
      </div>

      {isEditing ? (
        <div className="p-4 space-y-4">
          <div className="bg-white rounded-2xl p-4 shadow-sm space-y-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">收货人</label>
              <input
                type="text" required value={editForm.receiverName}
                onChange={(e) => setEditForm({...editForm, receiverName: e.target.value})}
                className="w-full border-b border-gray-100 pb-2 text-sm outline-none"
                placeholder="请输入名字"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">手机号</label>
              <input
                type="text" required value={editForm.receiverPhone}
                onChange={(e) => setEditForm({...editForm, receiverPhone: e.target.value})}
                className="w-full border-b border-gray-100 pb-2 text-sm outline-none"
                placeholder="请输入手机号"
              />
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-xs text-gray-500 mb-1 block">省份</label>
                <input
                  type="text" required value={editForm.province}
                  onChange={(e) => setEditForm({...editForm, province: e.target.value})}
                  className="w-full border-b border-gray-100 pb-2 text-sm outline-none"
                  placeholder="省份"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-gray-500 mb-1 block">城市</label>
                <input
                  type="text" required value={editForm.city}
                  onChange={(e) => setEditForm({...editForm, city: e.target.value})}
                  className="w-full border-b border-gray-100 pb-2 text-sm outline-none"
                  placeholder="城市"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-gray-500 mb-1 block">区县</label>
                <input
                  type="text" required value={editForm.district}
                  onChange={(e) => setEditForm({...editForm, district: e.target.value})}
                  className="w-full border-b border-gray-100 pb-2 text-sm outline-none"
                  placeholder="区县"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">详细地址</label>
              <input
                type="text" required value={editForm.detailAddress}
                onChange={(e) => setEditForm({...editForm, detailAddress: e.target.value})}
                className="w-full border-b border-gray-100 pb-2 text-sm outline-none"
                placeholder="如街道、门牌号"
              />
            </div>
          </div>
          <button onClick={handleSubmit} className="w-full bg-emerald-600 text-white py-3.5 rounded-full font-bold shadow-lg mt-8">
            保存地址
          </button>
        </div>
      ) : (
        <div className="p-4 space-y-4">
          {addresses.length === 0 ? (
            <div className="text-center py-20 text-gray-400">暂无收货地址</div>
          ) : (
            addresses.map((addr) => (
              <div key={addr.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-8 h-8 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 flex-shrink-0">
                    <span className="text-base">📍</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-gray-800">{addr.receiverName}</span>
                      <span className="text-xs text-gray-400">{addr.receiverPhone}</span>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      {addr.province}{addr.city}{addr.district}{addr.detailAddress}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                  <button
                    onClick={() => handleSetDefault(addr.id)}
                    className="flex items-center gap-1.5"
                  >
                    <div className={cn(
                      "w-4 h-4 rounded-full border flex items-center justify-center transition-all",
                      addr.isDefault ? "bg-emerald-600 border-emerald-600" : "border-gray-300"
                    )}>
                      {addr.isDefault === 1 && <span className="text-white text-[10px]">✓</span>}
                    </div>
                    <span className={cn("text-xs", addr.isDefault === 1 ? "text-emerald-600 font-medium" : "text-gray-400")}>
                      默认地址
                    </span>
                  </button>
                  <div className="flex gap-4">
                    <button onClick={() => { setIsEditing(true); setEditForm(addr); }} className="text-xs text-gray-400">编辑</button>
                    <button onClick={() => handleDelete(addr.id)} className="text-xs text-red-400">删除</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-4 bg-white border-t border-gray-100 z-50">
        <button onClick={() => { setIsEditing(true); setEditForm({}); }} className="w-full bg-emerald-600 text-white py-3.5 rounded-full font-bold shadow-lg shadow-emerald-100 flex items-center justify-center gap-2">
          <span className="text-lg">+</span>
          添加新地址
        </button>
      </div>
    </div>
  );
};

export default AddressList;
