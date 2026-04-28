import React, { useEffect, useState } from 'react';
import { addressApi } from '@/src/api';
import { UserAddress } from '@/src/api/types';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/src/lib/utils';
import { ChevronLeft, Plus, MapPin, Check, Trash2 } from 'lucide-react';

const AddressList: React.FC = () => {
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
    if (!confirm('确定删除该地址吗？')) return;
    try {
      await addressApi.delete(id);
      fetchAddresses();
    } catch (error) {
      console.error('Delete failed', error);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-24">
      <header className="bg-white p-4 sticky top-0 z-10 flex items-center gap-4 shadow-sm">
        <button onClick={() => navigate(-1)}><ChevronLeft size={24} /></button>
        <h1 className="text-lg font-bold text-gray-800">收货地址</h1>
      </header>

      <div className="p-4 space-y-4">
        {loading ? (
          <div className="text-center py-20 text-gray-400">加载中...</div>
        ) : addresses.length === 0 ? (
          <div className="text-center py-20 text-gray-400">暂无收货地址</div>
        ) : (
          Array.isArray(addresses) && addresses.map((addr) => (
            <div key={addr.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-8 h-8 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 flex-shrink-0">
                  <MapPin size={16} />
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
                    {addr.isDefault && <Check size={10} className="text-white" />}
                  </div>
                  <span className={cn("text-xs", addr.isDefault ? "text-emerald-600 font-medium" : "text-gray-400")}>
                    默认地址
                  </span>
                </button>
                <div className="flex gap-4">
                  <button className="text-xs text-gray-400">编辑</button>
                  <button onClick={() => handleDelete(addr.id)} className="text-xs text-red-400">删除</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-4 bg-white border-t border-gray-100 z-50">
        <button className="w-full bg-emerald-600 text-white py-3.5 rounded-full font-bold shadow-lg shadow-emerald-100 flex items-center justify-center gap-2">
          <Plus size={20} />
          添加新地址
        </button>
      </div>
    </div>
  );
};

export default AddressList;
