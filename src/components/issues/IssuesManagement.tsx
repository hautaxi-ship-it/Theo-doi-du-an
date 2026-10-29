'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Issue, Factory } from '@/types';
import { formatDateVN, cn } from '@/lib/utils';
import { AlertTriangle, Plus, Search, Filter, ExternalLink, ShieldAlert, CheckCircle2, Clock } from 'lucide-react';

interface IssuesManagementProps {
  onOpenCreateIssue: () => void;
}

export const IssuesManagement: React.FC<IssuesManagementProps> = ({ onOpenCreateIssue }) => {
  const { issues, updateIssue, orders, setSelectedOrderId, setActiveView } = useApp();

  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');

  const filtered = issues.filter((iss) => {
    if (filterSeverity !== 'ALL' && iss.severity !== filterSeverity) return false;
    if (filterStatus !== 'ALL' && iss.status !== filterStatus) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        iss.issueCode.toLowerCase().includes(q) ||
        iss.title.toLowerCase().includes(q) ||
        iss.orderCode.toLowerCase().includes(q) ||
        (iss.assignee && iss.assignee.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  const criticalCount = issues.filter(
    (i) => i.severity === 'NGHIEM_TRONG_DUNG_CHUYEN' && i.status !== 'DONG'
  ).length;

  return (
    <div className="p-6 space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
            Quản Lý Bất Cập, Sự Cố & Rủi Ro Dây Chuyền
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Phản ứng nhanh với các sự cố dừng chuyền, thiếu vật tư, hỏng hóc thiết bị và thay đổi từ khách
          </p>
        </div>

        <button
          onClick={onOpenCreateIssue}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-rose-500/30 transition flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Ghi nhận Bất cập mới</span>
        </button>
      </div>

      {/* Critical alert banner */}
      {criticalCount > 0 && (
        <div className="p-3.5 bg-red-600 text-white rounded-xl flex items-center justify-between text-xs shadow-md shadow-red-500/20">
          <div className="flex items-center gap-2 font-bold">
            <ShieldAlert className="w-5 h-5 shrink-0" />
            <span>
              BÁO ĐỘNG ĐỎ: Có {criticalCount} sự cố nghiêm trọng có nguy cơ DỪNG TOÀN BỘ DÂY CHUYỀN SẢN XUẤT!
            </span>
          </div>
          <span className="text-[11px] bg-white text-red-700 font-bold px-2 py-0.5 rounded">
            Lãnh đạo & Tổ phản ứng nhanh đang trực tiếp xử lý
          </span>
        </div>
      )}

      {/* Filters toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Mức độ:</span>
          <button
            onClick={() => setFilterSeverity('ALL')}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-semibold transition',
              filterSeverity === 'ALL' ? 'bg-slate-900 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            )}
          >
            Tất cả ({issues.length})
          </button>
          <button
            onClick={() => setFilterSeverity('NGHIEM_TRONG_DUNG_CHUYEN')}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5',
              filterSeverity === 'NGHIEM_TRONG_DUNG_CHUYEN'
                ? 'bg-red-600 text-white shadow-xs'
                : 'bg-red-50 text-red-700 hover:bg-red-100'
            )}
          >
            <span>Dừng Chuyền</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 font-bold">
              {issues.filter((i) => i.severity === 'NGHIEM_TRONG_DUNG_CHUYEN').length}
            </span>
          </button>
          <button
            onClick={() => setFilterSeverity('TRUNG_BINH')}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-semibold transition',
              filterSeverity === 'TRUNG_BINH'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
            )}
          >
            Trung bình
          </button>
          <button
            onClick={() => setFilterSeverity('THAP')}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-semibold transition',
              filterSeverity === 'THAP'
                ? 'bg-slate-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            )}
          >
            Thấp
          </button>
        </div>

        <div className="flex items-center gap-2.5">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-rose-500/20 outline-none"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="MOI_GHI_NHAN">Mới ghi nhận</option>
            <option value="DANG_XU_LY">Đang xử lý</option>
            <option value="DA_KHAC_PHUC">Đã khắc phục</option>
            <option value="DONG">Đã đóng</option>
          </select>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm mã, tiêu đề, người xử lý..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-rose-500/20 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Issues List Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
        {filtered.map((iss) => {
          const linkedOrder = orders.find((o) => o.id === iss.orderId);

          return (
            <div key={iss.id} className="p-5 hover:bg-slate-50 transition space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-rose-700">{iss.issueCode}</span>
                  <span
                    className={cn(
                      'text-[10px] font-bold px-2 py-0.5 rounded',
                      iss.severity === 'NGHIEM_TRONG_DUNG_CHUYEN'
                        ? 'bg-red-500 text-white'
                        : iss.severity === 'TRUNG_BINH'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-600'
                    )}
                  >
                    {iss.severity === 'NGHIEM_TRONG_DUNG_CHUYEN'
                      ? 'DỪNG CHUYỀN'
                      : iss.severity === 'TRUNG_BINH'
                      ? 'Trung bình'
                      : 'Thấp'}
                  </span>
                  <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-medium">
                    {iss.category.replace(/_/g, ' ')}
                  </span>
                  {iss.relatedFactory && (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                      NM: {iss.relatedFactory}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-rose-600 font-bold">
                    Trễ tiến độ: +{iss.delayDaysImpact} ngày
                  </span>
                  <select
                    value={iss.status}
                    onChange={(e) => updateIssue(iss.id, { status: e.target.value as any })}
                    className="py-1 px-2.5 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-rose-500 outline-none"
                  >
                    <option value="MOI_GHI_NHAN">Mới ghi nhận</option>
                    <option value="DANG_XU_LY">Đang xử lý</option>
                    <option value="DA_KHAC_PHUC">Đã khắc phục</option>
                    <option value="DONG">Đã đóng</option>
                  </select>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-sm text-slate-900">{iss.title}</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{iss.description}</p>
              </div>

              {iss.solutionPlan && (
                <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-xl text-xs text-slate-800">
                  <span className="font-bold text-blue-900">Phương án khắc phục:</span> {iss.solutionPlan}
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <div className="flex items-center gap-4">
                  <span>
                    Người phụ trách: <b className="text-slate-800">{iss.assignee}</b>
                  </span>
                  <span>Ngày báo: {formatDateVN(iss.reportedDate)}</span>
                </div>

                <div>
                  {linkedOrder && (
                    <button
                      onClick={() => {
                        setSelectedOrderId(linkedOrder.id);
                        setActiveView('order-detail');
                      }}
                      className="font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 group"
                    >
                      <span>Xem đơn hàng {linkedOrder.orderCode}</span>
                      <ExternalLink className="w-3.5 h-3.5 text-blue-400 group-hover:text-blue-600" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="p-12 text-center text-slate-400 text-xs">
            Không tìm thấy sự cố hay bất cập nào theo điều kiện lọc.
          </div>
        )}
      </div>
    </div>
  );
};
