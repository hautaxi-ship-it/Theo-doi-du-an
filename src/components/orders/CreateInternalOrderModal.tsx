'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Factory, Priority } from '@/types';
import { X, ArrowLeftRight, AlertCircle, ShieldAlert, Link as LinkIcon } from 'lucide-react';

interface CreateInternalOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultOrderId?: string;
  defaultMOId?: string;
}

export const CreateInternalOrderModal: React.FC<CreateInternalOrderModalProps> = ({
  isOpen,
  onClose,
  defaultOrderId,
  defaultMOId,
}) => {
  const { orders, manufacturingOrders, addInternalOrder, selectedOrderId } = useApp();

  const initialOrderId = defaultOrderId || selectedOrderId || (orders[0] ? orders[0].id : '');
  const [customerOrderId, setCustomerOrderId] = useState<string>(initialOrderId);
  const [manufacturingOrderId, setManufacturingOrderId] = useState<string>(defaultMOId || '');
  const [sourceFactory, setSourceFactory] = useState<Factory>('TBCD');
  const [targetFactory, setTargetFactory] = useState<Factory>('NMK');
  const [ioCode, setIoCode] = useState(`IO-${Date.now().toString().slice(-4)}`);
  const [itemDescription, setItemDescription] = useState('');
  const [quantity, setQuantity] = useState<number>(1);
  const [unit, setUnit] = useState('Bộ');
  const [urgencyLevel, setUrgencyLevel] = useState<Priority>('CAO');
  const [requestDate, setRequestDate] = useState(new Date().toISOString().split('T')[0]);
  const [requiredDate, setRequiredDate] = useState(
    new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [committedDate, setCommittedDate] = useState(
    new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [impactOnCustomerOrder, setImpactOnCustomerOrder] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const currentOrder = orders.find((o) => o.id === customerOrderId);
  const relevantMOs = manufacturingOrders.filter((mo) => mo.orderId === customerOrderId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // STRICT VALIDATION
    if (!customerOrderId) {
      setError('Bắt buộc phải chọn Đơn hàng khách hàng gốc để liên kết chuỗi sản xuất.');
      return;
    }

    if (sourceFactory === targetFactory) {
      setError('Nhà máy yêu cầu và Nhà máy thực hiện không được trùng nhau trong Đơn hàng nội bộ.');
      return;
    }

    if (!itemDescription.trim()) {
      setError('Vui lòng nhập Chi tiết / Hạng mục gia công nội bộ.');
      return;
    }

    const selectedMO = manufacturingOrders.find((m) => m.id === manufacturingOrderId);

    const result = addInternalOrder({
      ioCode,
      sourceFactory,
      targetFactory,
      customerOrderId,
      customerOrderCode: currentOrder ? currentOrder.orderCode : '',
      manufacturingOrderId: manufacturingOrderId || undefined,
      moCode: selectedMO ? selectedMO.moCode : undefined,
      itemDescription,
      quantity: Number(quantity),
      unit,
      requestDate,
      requiredDate,
      committedDate,
      status: 'CHO_TIEP_NHAN',
      progressPercent: 0,
      urgencyLevel,
      impactOnCustomerOrder: impactOnCustomerOrder || 'Ảnh hưởng tiến độ chuỗi lắp ráp đơn hàng khách',
      contactPerson: contactPerson || 'Kỹ sư điều độ',
    });

    if (!result.success) {
      setError(result.error || 'Có lỗi xảy ra khi tạo đơn nội bộ.');
      return;
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <ArrowLeftRight className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-base">Khởi tạo Đơn Hàng Nội Bộ (IO)</h2>
              <p className="text-xs text-slate-400">Điều phối gia công, khuôn mẫu, phôi giữa 3 Nhà máy</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Strict Rule Callout */}
          <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl text-xs text-indigo-900 flex items-start gap-2.5">
            <LinkIcon className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold">Quy tắc liên kết chuỗi sản xuất:</div>
              <p className="text-indigo-700 text-[11px] mt-0.5">
                Mọi đơn hàng nội bộ phát sinh giữa THCK, TBCD và NMK bắt buộc phải liên kết trực tiếp với một Đơn hàng khách gốc hoặc Lệnh sản xuất để kiểm soát toàn bộ tiến độ.
              </p>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Chọn Đơn hàng khách bắt buộc */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div>
              <label className="text-xs text-slate-700 font-bold block mb-1">
                Đơn hàng khách hàng gốc (Bắt buộc) <span className="text-red-500">*</span>
              </label>
              <select
                value={customerOrderId}
                onChange={(e) => {
                  setCustomerOrderId(e.target.value);
                  setManufacturingOrderId('');
                }}
                required
                className="w-full py-2 px-3 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
              >
                {orders.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.orderCode} - {o.customerName} ({o.projectName})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-600 font-medium block mb-1">
                Lệnh sản xuất liên quan trực tiếp (Tùy chọn)
              </label>
              <select
                value={manufacturingOrderId}
                onChange={(e) => setManufacturingOrderId(e.target.value)}
                className="w-full py-2 px-3 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
              >
                <option value="">-- Không gắn riêng LSX cụ thể (Gắn chung cho Đơn khách) --</option>
                {relevantMOs.map((mo) => (
                  <option key={mo.id} value={mo.id}>
                    {mo.moCode} [{mo.factory}] - {mo.productPartName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Cặp Nhà máy Yêu cầu -> Nhà máy Thực hiện */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <div>
              <label className="text-xs text-slate-700 font-bold block mb-1">
                Nhà máy đặt hàng (Cần) <span className="text-red-500">*</span>
              </label>
              <select
                value={sourceFactory}
                onChange={(e) => setSourceFactory(e.target.value as Factory)}
                className="w-full py-2 px-3 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
              >
                <option value="TBCD">Thiết bị Chuyên dụng (TBCD)</option>
                <option value="THCK">Tổ hợp Cơ khí (THCK)</option>
                <option value="NMK">Nhà máy Khuôn (NMK)</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-700 font-bold block mb-1">
                Nhà máy thực hiện gia công <span className="text-red-500">*</span>
              </label>
              <select
                value={targetFactory}
                onChange={(e) => setTargetFactory(e.target.value as Factory)}
                className="w-full py-2 px-3 bg-indigo-50 border border-indigo-300 rounded-lg text-xs font-bold text-indigo-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
              >
                <option value="NMK">Nhà máy Khuôn (NMK)</option>
                <option value="THCK">Tổ hợp Cơ khí (THCK)</option>
                <option value="TBCD">Thiết bị Chuyên dụng (TBCD)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-600 font-medium block mb-1">
              Chi tiết / Khuôn gá / Phôi cần gia công <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={itemDescription}
              onChange={(e) => setItemDescription(e.target.value)}
              placeholder="VD: Chế tạo bộ khuôn dập nguội tai treo nhíp rơ moóc SKD11"
              className="w-full py-2 px-3 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-slate-600 font-medium block mb-1">Số lượng</label>
              <div className="flex gap-1.5">
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full py-2 px-3 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                />
                <input
                  type="text"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-16 py-2 px-2 border border-slate-200 rounded-lg text-xs text-center font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-600 font-medium block mb-1">Ngày cần hàng</label>
              <input
                type="date"
                value={requiredDate}
                onChange={(e) => setRequiredDate(e.target.value)}
                className="w-full py-2 px-3 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="text-xs text-slate-600 font-medium block mb-1">Mức độ khẩn</label>
              <select
                value={urgencyLevel}
                onChange={(e) => setUrgencyLevel(e.target.value as Priority)}
                className="w-full py-2 px-3 border border-slate-200 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
              >
                <option value="BINH_THUONG">Bình thường</option>
                <option value="CAO">Ưu tiên Cao</option>
                <option value="KHAN_CAP">Khẩn cấp (Chặn chuyền)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-600 font-medium block mb-1">
              Ảnh hưởng đến Đơn hàng khách nếu chậm
            </label>
            <input
              type="text"
              value={impactOnCustomerOrder}
              onChange={(e) => setImpactOnCustomerOrder(e.target.value)}
              placeholder="VD: Không thể lắp ráp dầm chính 120 bộ moóc xuất khẩu Mỹ..."
              className="w-full py-2 px-3 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
            />
          </div>

          <div>
            <label className="text-xs text-slate-600 font-medium block mb-1">Đầu mối kỹ sư 2 nhà máy</label>
            <input
              type="text"
              value={contactPerson}
              onChange={(e) => setContactPerson(e.target.value)}
              placeholder="VD: KS. Nguyễn Văn Hải (TBCD) - KS. Bùi Đức Trung (NMK)"
              className="w-full py-2 px-3 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
            />
          </div>

          {/* Footer buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm shadow-indigo-500/30 transition"
            >
              Phát hành Đơn hàng nội bộ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
