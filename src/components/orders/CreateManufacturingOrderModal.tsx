'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Factory, MOStatus } from '@/types';
import { X, Factory as FactoryIcon, AlertCircle } from 'lucide-react';

interface CreateManufacturingOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultOrderId?: string;
}

export const CreateManufacturingOrderModal: React.FC<CreateManufacturingOrderModalProps> = ({
  isOpen,
  onClose,
  defaultOrderId,
}) => {
  const { orders, addManufacturingOrder, selectedOrderId } = useApp();

  const activeOrderId = defaultOrderId || selectedOrderId || (orders[0] ? orders[0].id : '');
  const [orderId, setOrderId] = useState<string>(activeOrderId);
  const [factory, setFactory] = useState<Factory>('THCK');
  const [moCode, setMoCode] = useState(`MO-THCK-${Date.now().toString().slice(-4)}`);
  const [productPartName, setProductPartName] = useState('');
  const [quantity, setQuantity] = useState<number>(10);
  const [unit, setUnit] = useState('Bộ');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [targetEndDate, setTargetEndDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [leadEngineer, setLeadEngineer] = useState('');
  const [workstation, setWorkstation] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const currentSelectedOrder = orders.find((o) => o.id === orderId);

  const handleFactoryChange = (newFactory: Factory) => {
    setFactory(newFactory);
    setMoCode(`MO-${newFactory}-${Date.now().toString().slice(-4)}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId) {
      setError('Vui lòng chọn Đơn hàng khách hàng liên kết.');
      return;
    }
    if (!productPartName.trim()) {
      setError('Vui lòng nhập Tên cụm chi tiết / kết cấu gia công.');
      return;
    }

    addManufacturingOrder({
      orderId,
      orderCode: currentSelectedOrder?.orderCode || '',
      moCode,
      factory,
      productPartName,
      quantity: Number(quantity),
      unit,
      startDate,
      targetEndDate,
      progressPercent: 0,
      status: 'CHUA_BAT_DAU',
      leadEngineer: leadEngineer || 'Kỹ sư phân xưởng',
      workstation,
      notes,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center">
              <FactoryIcon className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-base">Phát hành Lệnh Sản Xuất (MO)</h2>
              <p className="text-xs text-slate-400">Gán cho nhà máy cụ thể thuộc Đơn hàng khách</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="text-xs text-slate-600 font-medium block mb-1">
              Đơn hàng khách hàng cha (PO) <span className="text-red-500">*</span>
            </label>
            <select
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className="w-full py-2 px-3 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
            >
              {orders.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.orderCode} - {o.customerName} ({o.projectName})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-600 font-medium block mb-1">
                Nhà máy thực hiện <span className="text-red-500">*</span>
              </label>
              <select
                value={factory}
                onChange={(e) => handleFactoryChange(e.target.value as Factory)}
                className="w-full py-2 px-3 bg-amber-50 border border-amber-300 rounded-lg text-xs font-bold text-slate-900 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
              >
                <option value="THCK">Tổ hợp Cơ khí (THCK)</option>
                <option value="TBCD">Thiết bị Chuyên dụng (TBCD)</option>
                <option value="NMK">Nhà máy Khuôn (NMK)</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-600 font-medium block mb-1">Mã Lệnh SX (MO Code)</label>
              <input
                type="text"
                required
                value={moCode}
                onChange={(e) => setMoCode(e.target.value)}
                className="w-full py-2 px-3 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-600 font-medium block mb-1">
              Chi tiết / Cụm kết cấu sản xuất <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={productPartName}
              onChange={(e) => setProductPartName(e.target.value)}
              placeholder="VD: Cắt phôi laser CNC và chấn dập pát treo dầm chính"
              className="w-full py-2 px-3 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
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
                  className="w-full py-2 px-3 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
                <input
                  type="text"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-16 py-2 px-2 border border-slate-200 rounded-lg text-xs text-center font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-600 font-medium block mb-1">Ngày bắt đầu</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full py-2 px-3 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="text-xs text-slate-600 font-medium block mb-1">Hạn hoàn thành</label>
              <input
                type="date"
                value={targetEndDate}
                onChange={(e) => setTargetEndDate(e.target.value)}
                className="w-full py-2 px-3 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-600 font-medium block mb-1">Kỹ sư / Quản đốc xưởng</label>
              <input
                type="text"
                value={leadEngineer}
                onChange={(e) => setLeadEngineer(e.target.value)}
                placeholder="VD: KS. Nguyễn Văn Đạt"
                className="w-full py-2 px-3 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="text-xs text-slate-600 font-medium block mb-1">Phân xưởng / Trạm máy</label>
              <input
                type="text"
                value={workstation}
                onChange={(e) => setWorkstation(e.target.value)}
                placeholder="VD: Xưởng hàn robot / Máy cắt Laser 12kW"
                className="w-full py-2 px-3 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-600 font-medium block mb-1">Ghi chú kỹ thuật</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Yêu cầu kiểm tra kích thước, dưỡng gá hoặc tiêu chuẩn phôi..."
              className="w-full py-2 px-3 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
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
              className="px-5 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-sm shadow-amber-500/30 transition"
            >
              Phát hành Lệnh sản xuất
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
