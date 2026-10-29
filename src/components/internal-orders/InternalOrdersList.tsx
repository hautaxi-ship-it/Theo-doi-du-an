'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Factory, IOStatus } from '@/types';
import { formatDateVN, cn } from '@/lib/utils';
import { ArrowLeftRight, Plus, Search, Filter, ExternalLink, AlertTriangle, ShieldCheck } from 'lucide-react';

interface InternalOrdersListProps {
  onOpenCreateIO: () => void;
}

export const InternalOrdersList: React.FC<InternalOrdersListProps> = ({ onOpenCreateIO }) => {
  const { internalOrders, updateInternalOrder, setSelectedOrderId, setActiveView } = useApp();

  const [filterSource, setFilterSource] = useState<string>('ALL');
  const [filterTarget, setFilterTarget] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');

  const filtered = internalOrders.filter((io) => {
    if (filterSource !== 'ALL' && io.sourceFactory !== filterSource) return false;
    if (filterTarget !== 'ALL' && io.targetFactory !== filterTarget) return false;
    if (filterStatus !== 'ALL' && io.status !== filterStatus) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        io.ioCode.toLowerCase().includes(q) ||
        io.itemDescription.toLowerCase().includes(q) ||
        io.customerOrderCode.toLowerCase().includes(q) ||
        (io.moCode && io.moCode.toLowerCase().includes(q)) ||
        (io.contactPerson && io.contactPerson.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  const delayedCount = internalOrders.filter((i) => i.status === 'CHAM_TRE').length;

  return (
    <div className="p-6 space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <ArrowLeftRight className="w-5 h-5 text-indigo-600" />
            Quản Lý Đơn Hàng Nội Bộ (Internal Orders - IO)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Điều phối gia công, khuôn gá, bán thành phẩm giữa 3 Nhà máy THCK, TBCD và NMK
          </p>
        </div>

        <button
          onClick={onOpenCreateIO}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-indigo-500/30 transition flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Khởi tạo Đơn hàng nội bộ mới</span>
        </button>
      </div>

      {/* Warning callout if delayed */}
      {delayedCount > 0 && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between text-xs text-rose-800">
          <div className="flex items-center gap-2 font-semibold">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>
              Cảnh báo: Có {delayedCount} đơn hàng nội bộ đang CHẬM TIẾN ĐỘ, trực tiếp đe dọa lịch giao hàng của Đơn hàng khách gốc!
            </span>
          </div>
          <span className="text-[11px] bg-rose-200/80 text-rose-900 font-bold px-2 py-0.5 rounded">
            Ưu tiên xử lý ngay
          </span>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="font-semibold text-slate-500">NM Cần:</span>
            <select
              value={filterSource}
              onChange={(e) => setFilterSource(e.target.value)}
              className="py-1 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 outline-none"
            >
              <option value="ALL">Tất cả</option>
              <option value="THCK">THCK</option>
              <option value="TBCD">TBCD</option>
              <option value="NMK">NMK</option>
            </select>
          </div>

          <span className="text-slate-400">➔</span>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="font-semibold text-slate-500">NM Gia công:</span>
            <select
              value={filterTarget}
              onChange={(e) => setFilterTarget(e.target.value)}
              className="py-1 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-indigo-900 outline-none"
            >
              <option value="ALL">Tất cả</option>
              <option value="THCK">THCK</option>
              <option value="TBCD">TBCD</option>
              <option value="NMK">NMK</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="font-semibold text-slate-500">Trạng thái:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="py-1 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium outline-none"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="CHO_TIEP_NHAN">Chờ tiếp nhận</option>
              <option value="DANG_SAN_XUAT">Đang sản xuất</option>
              <option value="DA_GIAO_SANG_NM">Đã giao sang NM</option>
              <option value="NGHIEM_THU_DAT">Nghiệm thu đạt</option>
              <option value="CHAM_TRE">Chậm trễ</option>
            </select>
          </div>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm mã IO, chi tiết, PO khách..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500/20 outline-none"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/80 text-slate-600 font-bold border-b border-slate-200 text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4">Mã Đơn Nội Bộ</th>
                <th className="py-3 px-3">Luồng Cung Cấp</th>
                <th className="py-3 px-4">Chi Tiết / Phôi / Khuôn Gá</th>
                <th className="py-3 px-4">Đơn Khách Gốc (PO)</th>
                <th className="py-3 px-3 text-center">SL</th>
                <th className="py-3 px-3">Hạn Cần Giao</th>
                <th className="py-3 px-3 text-center">Tiến Độ %</th>
                <th className="py-3 px-3">Trạng Thái</th>
                <th className="py-3 px-4">Ảnh Hưởng Chuỗi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.map((io) => (
                <tr key={io.id} className="hover:bg-indigo-50/40 transition">
                  <td className="py-3 px-4 font-bold text-indigo-800 whitespace-nowrap">
                    {io.ioCode}
                    <div className="text-[10px] text-slate-400 font-normal">
                      Yêu cầu: {formatDateVN(io.requestDate)}
                    </div>
                  </td>

                  <td className="py-3 px-3 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 text-xs font-bold">
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                        {io.sourceFactory}
                      </span>
                      <span className="text-slate-400">➔</span>
                      <span className="px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-900 border border-indigo-200">
                        {io.targetFactory}
                      </span>
                    </div>
                  </td>

                  <td className="py-3 px-4 font-semibold text-slate-900 max-w-xs">
                    {io.itemDescription}
                    <div className="text-[11px] text-slate-400">Đầu mối: {io.contactPerson}</div>
                  </td>

                  <td className="py-3 px-4 whitespace-nowrap">
                    <button
                      onClick={() => {
                        setSelectedOrderId(io.customerOrderId);
                        setActiveView('order-detail');
                      }}
                      className="font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 group"
                    >
                      <span>{io.customerOrderCode}</span>
                      <ExternalLink className="w-3 h-3 text-blue-400 group-hover:text-blue-600" />
                    </button>
                    {io.moCode && <div className="text-[11px] text-slate-400">Gắn LSX: {io.moCode}</div>}
                  </td>

                  <td className="py-3 px-3 text-center whitespace-nowrap font-bold text-slate-800">
                    {io.quantity} {io.unit}
                  </td>

                  <td className="py-3 px-3 whitespace-nowrap font-medium text-slate-700">
                    {formatDateVN(io.requiredDate)}
                  </td>

                  <td className="py-3 px-3 text-center whitespace-nowrap">
                    <div className="font-bold text-slate-900">{io.progressPercent}%</div>
                    <div className="w-16 mx-auto bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
                      <div
                        className={cn(
                          'h-1.5 rounded-full',
                          io.status === 'CHAM_TRE' ? 'bg-rose-500' : 'bg-indigo-600'
                        )}
                        style={{ width: `${io.progressPercent}%` }}
                      />
                    </div>
                  </td>

                  <td className="py-3 px-3 whitespace-nowrap">
                    <select
                      value={io.status}
                      onChange={(e) => updateInternalOrder(io.id, { status: e.target.value as any })}
                      className="py-1 px-2 border border-slate-200 rounded text-xs font-semibold focus:ring-1 focus:ring-indigo-500 outline-none"
                    >
                      <option value="CHO_TIEP_NHAN">Chờ tiếp nhận</option>
                      <option value="DANG_SAN_XUAT">Đang sản xuất</option>
                      <option value="DA_GIAO_SANG_NM">Đã giao sang NM</option>
                      <option value="NGHIEM_THU_DAT">Nghiệm thu đạt</option>
                      <option value="CHAM_TRE">Chậm trễ</option>
                    </select>
                  </td>

                  <td className="py-3 px-4 text-[11px] text-slate-600 max-w-xs">
                    {io.impactOnCustomerOrder}
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400 text-xs">
                    Không tìm thấy Đơn hàng nội bộ nào phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
