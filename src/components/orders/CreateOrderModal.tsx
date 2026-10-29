'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { OrderType, ExportMarket, DomesticRegion, Factory, Priority, EXPORT_MARKET_LABELS, DOMESTIC_REGION_LABELS } from '@/types';
import { X, Layers, Building2, Calendar, DollarSign, AlertCircle } from 'lucide-react';

interface CreateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateOrderModal: React.FC<CreateOrderModalProps> = ({ isOpen, onClose }) => {
  const { addOrder, setSelectedOrderId, setActiveView } = useApp();

  const [orderType, setOrderType] = useState<OrderType>('XUAT_KHAU');
  const [market, setMarket] = useState<ExportMarket>('MY');
  const [region, setRegion] = useState<DomesticRegion>('MIEN_NAM');
  const [orderCode, setOrderCode] = useState(`PO-${Date.now().toString().slice(-4)}`);
  const [customerName, setCustomerName] = useState('');
  const [customerCode, setCustomerCode] = useState('');
  const [projectName, setProjectName] = useState('');
  const [primaryFactory, setPrimaryFactory] = useState<Factory>('TBCD');
  const [participatingFactories, setParticipatingFactories] = useState<Factory[]>(['TBCD', 'THCK']);
  const [manager, setManager] = useState('');
  const [totalQuantity, setTotalQuantity] = useState<number>(10);
  const [unit, setUnit] = useState('Bộ');
  const [totalValue, setTotalValue] = useState<number>(15000000000);
  const [priority, setPriority] = useState<Priority>('CAO');
  const [poDate, setPoDate] = useState(new Date().toISOString().split('T')[0]);
  const [deliveryDeadline, setDeliveryDeadline] = useState(
    new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleToggleFactory = (f: Factory) => {
    if (participatingFactories.includes(f)) {
      if (participatingFactories.length > 1) {
        setParticipatingFactories(participatingFactories.filter((item) => item !== f));
      }
    } else {
      setParticipatingFactories([...participatingFactories, f]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderCode.trim()) {
      setError('Vui lòng nhập Mã đơn hàng / Số PO.');
      return;
    }
    if (!customerName.trim()) {
      setError('Vui lòng nhập Tên khách hàng.');
      return;
    }
    if (!projectName.trim()) {
      setError('Vui lòng nhập Tên dự án / Hạng mục sản xuất.');
      return;
    }

    const created = addOrder({
      orderCode,
      customerName,
      customerCode: customerCode || undefined,
      projectName,
      orderType,
      market: orderType === 'XUAT_KHAU' ? market : undefined,
      region: orderType === 'TRONG_NUOC' ? region : undefined,
      primaryFactory,
      participatingFactories,
      manager: manager || 'Cán bộ Kế hoạch Khối',
      totalQuantity: Number(totalQuantity),
      unit,
      totalValue: Number(totalValue),
      currency: 'VND',
      priority,
      poDate,
      deliveryDeadline,
      status: 'TIEP_NHAN_PO',
      progressPercent: 0,
      notes,
    });

    onClose();
    setSelectedOrderId(created.id);
    setActiveView('order-detail');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-8">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Layers className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-base">Tiếp nhận Đơn hàng mới (PO)</h2>
              <p className="text-xs text-slate-400">Phân cấp Xuất khẩu / Trong nước và phân bổ 3 nhà máy</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Phân cấp Đơn hàng */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wide block">
              1. Cấu trúc Phân cấp Đơn hàng
            </label>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-600 font-medium block mb-1">Loại hình đơn hàng</label>
                <div className="flex rounded-lg border border-slate-200 bg-white p-1">
                  <button
                    type="button"
                    onClick={() => setOrderType('XUAT_KHAU')}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition ${
                      orderType === 'XUAT_KHAU' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Xuất khẩu
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderType('TRONG_NUOC')}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition ${
                      orderType === 'TRONG_NUOC' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Trong nước
                  </button>
                </div>
              </div>

              {orderType === 'XUAT_KHAU' ? (
                <div>
                  <label className="text-xs text-slate-600 font-medium block mb-1">Thị trường xuất khẩu</label>
                  <select
                    value={market}
                    onChange={(e) => setMarket(e.target.value as ExportMarket)}
                    className="w-full py-2 px-3 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  >
                    {Object.entries(EXPORT_MARKET_LABELS).map(([k, label]) => (
                      <option key={k} value={k}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="text-xs text-slate-600 font-medium block mb-1">Miền trong nước</label>
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value as DomesticRegion)}
                    className="w-full py-2 px-3 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  >
                    {Object.entries(DOMESTIC_REGION_LABELS).map(([k, label]) => (
                      <option key={k} value={k}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Thông tin Khách & Hợp đồng */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wide block">
              2. Thông tin Khách hàng & PO
            </label>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-600 font-medium block mb-1">
                  Mã đơn hàng / PO <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={orderCode}
                  onChange={(e) => setOrderCode(e.target.value)}
                  placeholder="VD: PO-US-2026-009"
                  className="w-full py-2 px-3 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-slate-600 font-medium block mb-1">
                  Tên Khách hàng <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="VD: Great Dane Trailers Inc."
                  className="w-full py-2 px-3 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-600 font-medium block mb-1">
                Tên dự án / Hạng mục sản xuất <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="VD: Khung gầm Sơ mi rơ moóc xương 40ft tiêu chuẩn DOT"
                className="w-full py-2 px-3 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Phân bổ Nhà máy */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wide block">
              3. Phân bổ Nhà máy thực hiện
            </label>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-600 font-medium block mb-1">Nhà máy chủ trì chính</label>
                <select
                  value={primaryFactory}
                  onChange={(e) => {
                    const f = e.target.value as Factory;
                    setPrimaryFactory(f);
                    if (!participatingFactories.includes(f)) {
                      setParticipatingFactories([...participatingFactories, f]);
                    }
                  }}
                  className="w-full py-2 px-3 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                >
                  <option value="THCK">Tổ hợp Cơ khí (THCK)</option>
                  <option value="TBCD">Thiết bị Chuyên dụng (TBCD)</option>
                  <option value="NMK">Nhà máy Khuôn (NMK)</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-600 font-medium block mb-1">Nhà máy phối hợp tham gia</label>
                <div className="flex gap-2 pt-1">
                  {(['THCK', 'TBCD', 'NMK'] as Factory[]).map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => handleToggleFactory(f)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                        participatingFactories.includes(f)
                          ? 'bg-blue-100 text-blue-800 border-blue-300'
                          : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Quy mô & Tiến độ */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-slate-600 font-medium block mb-1">Số lượng</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="1"
                  value={totalQuantity}
                  onChange={(e) => setTotalQuantity(Number(e.target.value))}
                  className="w-full py-2 px-3 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
                <input
                  type="text"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="ĐVT"
                  className="w-20 py-2 px-2 border border-slate-200 rounded-lg text-xs text-center font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-600 font-medium block mb-1">Ngày nhận PO</label>
              <input
                type="date"
                value={poDate}
                onChange={(e) => setPoDate(e.target.value)}
                className="w-full py-2 px-3 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="text-xs text-slate-600 font-medium block mb-1">Hạn giao hàng</label>
              <input
                type="date"
                value={deliveryDeadline}
                onChange={(e) => setDeliveryDeadline(e.target.value)}
                className="w-full py-2 px-3 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-600 font-medium block mb-1">Giá trị dự kiến (VNĐ)</label>
              <input
                type="number"
                value={totalValue}
                onChange={(e) => setTotalValue(Number(e.target.value))}
                className="w-full py-2 px-3 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="text-xs text-slate-600 font-medium block mb-1">Mức độ ưu tiên</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full py-2 px-3 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              >
                <option value="BINH_THUONG">Bình thường</option>
                <option value="CAO">Ưu tiên Cao</option>
                <option value="KHAN_CAP">Khẩn cấp (Chiến lược)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-600 font-medium block mb-1">Ghi chú & Chỉ đạo sản xuất</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Yêu cầu kiểm tra chất lượng, tiêu chuẩn nghiệm thu hoặc lưu ý đặc thù..."
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
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm shadow-blue-500/30 transition"
            >
              Lưu & Mở chi tiết Đơn hàng
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
