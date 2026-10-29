'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Factory, MOStatus, FACTORY_NAMES } from '@/types';
import { formatDateVN, cn } from '@/lib/utils';
import { Factory as FactoryIcon, Plus, Search, Filter, ExternalLink, CheckCircle2, Clock } from 'lucide-react';

interface ManufacturingOrdersListProps {
  onOpenCreateMO: () => void;
}

export const ManufacturingOrdersList: React.FC<ManufacturingOrdersListProps> = ({ onOpenCreateMO }) => {
  const { manufacturingOrders, updateManufacturingOrder, setSelectedOrderId, setActiveView, orders } = useApp();

  const [filterFactory, setFilterFactory] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');

  const filtered = manufacturingOrders.filter((mo) => {
    if (filterFactory !== 'ALL' && mo.factory !== filterFactory) return false;
    if (filterStatus !== 'ALL' && mo.status !== filterStatus) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        mo.moCode.toLowerCase().includes(q) ||
        mo.productPartName.toLowerCase().includes(q) ||
        mo.orderCode.toLowerCase().includes(q) ||
        (mo.leadEngineer && mo.leadEngineer.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="p-6 space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FactoryIcon className="w-5 h-5 text-amber-600" />
            Quản Lý Lệnh Sản Xuất (Manufacturing Orders - MO)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Phân bổ Lệnh sản xuất trực tiếp cho từng nhà máy (THCK, TBCD, NMK) thuộc Đơn hàng khách
          </p>
        </div>

        <button
          onClick={onOpenCreateMO}
          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-amber-500/30 transition flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Phát hành Lệnh sản xuất mới</span>
        </button>
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Nhà máy:</span>
          {['ALL', 'THCK', 'TBCD', 'NMK'].map((f) => (
            <button
              key={f}
              onClick={() => setFilterFactory(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filterFactory === f
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f === 'ALL' ? 'Tất cả 3 NM' : f}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2.5">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-amber-500/20 outline-none"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="CHUA_BAT_DAU">Chưa bắt đầu</option>
            <option value="DANG_GIAO_CONG">Đang gia công</option>
            <option value="KIEM_TRA_KCS">Kiểm tra KCS</option>
            <option value="HOAN_THANH">Hoàn thành</option>
            <option value="TRE_HAN">Trễ hạn</option>
          </select>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm mã MO, chi tiết..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-amber-500/20 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/80 text-slate-600 font-bold border-b border-slate-200 text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4">Mã LSX (MO)</th>
                <th className="py-3 px-3">Nhà Máy</th>
                <th className="py-3 px-4">Chi Tiết / Kết Cấu Gia Công</th>
                <th className="py-3 px-4">Đơn Hàng Khách Cha</th>
                <th className="py-3 px-3 text-center">SL & ĐVT</th>
                <th className="py-3 px-3">Hạn Hoàn Thành</th>
                <th className="py-3 px-3 text-center">Tiến Độ %</th>
                <th className="py-3 px-3">Trạng Thái</th>
                <th className="py-3 px-4">Kỹ Sư & Phân Xưởng</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.map((mo) => (
                <tr key={mo.id} className="hover:bg-amber-50/40 transition">
                  <td className="py-3 px-4 font-bold text-amber-800 whitespace-nowrap">
                    {mo.moCode}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span
                      className={cn(
                        'font-bold text-xs px-2 py-0.5 rounded border',
                        mo.factory === 'THCK'
                          ? 'bg-amber-50 text-amber-900 border-amber-300'
                          : mo.factory === 'TBCD'
                          ? 'bg-cyan-50 text-cyan-900 border-cyan-300'
                          : 'bg-purple-50 text-purple-900 border-purple-300'
                      )}
                    >
                      {mo.factory}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-900 max-w-xs">
                    {mo.productPartName}
                    {mo.notes && <div className="text-[11px] text-slate-400 line-clamp-1">{mo.notes}</div>}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <button
                      onClick={() => {
                        setSelectedOrderId(mo.orderId);
                        setActiveView('order-detail');
                      }}
                      className="font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 group"
                    >
                      <span>{mo.orderCode}</span>
                      <ExternalLink className="w-3 h-3 text-blue-400 group-hover:text-blue-600" />
                    </button>
                  </td>
                  <td className="py-3 px-3 text-center whitespace-nowrap font-bold text-slate-800">
                    {mo.quantity} {mo.unit}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap font-medium text-slate-700">
                    {formatDateVN(mo.targetEndDate)}
                  </td>
                  <td className="py-3 px-3 text-center whitespace-nowrap">
                    <div className="font-bold text-slate-900">{mo.progressPercent}%</div>
                    <div className="w-16 mx-auto bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
                      <div
                        className="bg-amber-500 h-1.5 rounded-full"
                        style={{ width: `${mo.progressPercent}%` }}
                      />
                    </div>
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <select
                      value={mo.status}
                      onChange={(e) => updateManufacturingOrder(mo.id, { status: e.target.value as any })}
                      className="py-1 px-2 border border-slate-200 rounded text-xs font-semibold focus:ring-1 focus:ring-amber-500 outline-none"
                    >
                      <option value="CHUA_BAT_DAU">Chưa bắt đầu</option>
                      <option value="DANG_GIAO_CONG">Đang gia công</option>
                      <option value="KIEM_TRA_KCS">Kiểm tra KCS</option>
                      <option value="HOAN_THANH">Hoàn thành</option>
                      <option value="TRE_HAN">Trễ hạn</option>
                    </select>
                  </td>
                  <td className="py-3 px-4 text-[11px] text-slate-600">
                    <div className="font-semibold text-slate-800">{mo.leadEngineer}</div>
                    <div className="text-slate-400">{mo.workstation}</div>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400 text-xs">
                    Không tìm thấy Lệnh sản xuất nào phù hợp.
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
