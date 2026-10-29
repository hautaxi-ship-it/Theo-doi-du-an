'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Factory } from '@/types';
import { X, AlertTriangle, AlertCircle } from 'lucide-react';

interface CreateIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultOrderId?: string;
}

export const CreateIssueModal: React.FC<CreateIssueModalProps> = ({ isOpen, onClose, defaultOrderId }) => {
  const { orders, addIssue, selectedOrderId } = useApp();

  const activeOrderId = defaultOrderId || selectedOrderId || (orders[0] ? orders[0].id : '');
  const [orderId, setOrderId] = useState<string>(activeOrderId);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<'THAP' | 'TRUNG_BINH' | 'NGHIEM_TRONG_DUNG_CHUYEN'>('TRUNG_BINH');
  const [category, setCategory] = useState<'KY_THUAT_BAN_VE' | 'THIEU_VAT_TU' | 'LOI_GIA_CONG' | 'THIET_BI_HONG' | 'KHACH_HANG_THAY_DOI'>('THIEU_VAT_TU');
  const [relatedFactory, setRelatedFactory] = useState<Factory>('TBCD');
  const [assignee, setAssignee] = useState('');
  const [solutionPlan, setSolutionPlan] = useState('');
  const [delayDaysImpact, setDelayDaysImpact] = useState<number>(3);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const currentOrder = orders.find((o) => o.id === orderId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId) {
      setError('Vui lòng chọn đơn hàng khách liên quan.');
      return;
    }
    if (!title.trim()) {
      setError('Vui lòng nhập Tiêu đề bất cập.');
      return;
    }

    addIssue({
      orderId,
      orderCode: currentOrder?.orderCode || '',
      issueCode: `ISS-${Date.now().toString().slice(-4)}`,
      title,
      description,
      severity,
      category,
      relatedFactory,
      assignee: assignee || 'Kỹ sư phụ trách',
      solutionPlan,
      reportedDate: new Date().toISOString().split('T')[0],
      status: 'MOI_GHI_NHAN',
      delayDaysImpact: Number(delayDaysImpact),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-base">Ghi nhận Bất cập / Rủi ro Dây chuyền</h2>
              <p className="text-xs text-slate-400">Cảnh báo sớm rủi ro dừng chuyền & chậm tiến độ</p>
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
              Đơn hàng khách liên quan <span className="text-red-500">*</span>
            </label>
            <select
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className="w-full py-2 px-3 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none"
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
              Tiêu đề bất cập / vấn đề <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Thiếu vật tư nhôm 5083 do hàng tàu biển bị chậm bão..."
              className="w-full py-2 px-3 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-600 font-medium block mb-1">Mức độ nghiêm trọng</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as any)}
                className="w-full py-2 px-3 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none"
              >
                <option value="THAP">Thấp (Cần lưu ý)</option>
                <option value="TRUNG_BINH">Trung bình (Ảnh hưởng cục bộ)</option>
                <option value="NGHIEM_TRONG_DUNG_CHUYEN">NGHIÊM TRỌNG - NGUY CƠ DỪNG CHUYỀN</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-600 font-medium block mb-1">Phân loại bất cập</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full py-2 px-3 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none"
              >
                <option value="THIEU_VAT_TU">Thiếu hụt vật tư / Cung ứng</option>
                <option value="KY_THUAT_BAN_VE">Bản vẽ / Sai sót kỹ thuật</option>
                <option value="LOI_GIA_CONG">Lỗi gia công / KCS không đạt</option>
                <option value="THIET_BI_HONG">Sự cố máy móc thiết bị</option>
                <option value="KHACH_HANG_THAY_DOI">Khách hàng thay đổi yêu cầu</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-600 font-medium block mb-1">Nhà máy liên đới</label>
              <select
                value={relatedFactory}
                onChange={(e) => setRelatedFactory(e.target.value as Factory)}
                className="w-full py-2 px-3 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none"
              >
                <option value="THCK">Tổ hợp Cơ khí (THCK)</option>
                <option value="TBCD">Thiết bị Chuyên dụng (TBCD)</option>
                <option value="NMK">Nhà máy Khuôn (NMK)</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-600 font-medium block mb-1">Dự kiến số ngày trễ</label>
              <input
                type="number"
                min="0"
                value={delayDaysImpact}
                onChange={(e) => setDelayDaysImpact(Number(e.target.value))}
                className="w-full py-2 px-3 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-600 font-medium block mb-1">Cán bộ phụ trách xử lý</label>
            <input
              type="text"
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              placeholder="VD: Võ Minh Phụng (Trưởng phòng Cung ứng)"
              className="w-full py-2 px-3 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none"
            />
          </div>

          <div>
            <label className="text-xs text-slate-600 font-medium block mb-1">Phương án & Giải pháp khắc phục</label>
            <textarea
              rows={3}
              value={solutionPlan}
              onChange={(e) => setSolutionPlan(e.target.value)}
              placeholder="Hành động tức thời, phương án điều chuyển hoặc đề xuất giải pháp thay thế..."
              className="w-full py-2 px-3 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none"
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
              className="px-5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm shadow-rose-500/30 transition"
            >
              Ghi nhận Bất cập
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
