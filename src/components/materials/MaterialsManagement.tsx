'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { formatDateVN, formatVND, cn } from '@/lib/utils';
import { Boxes, ShoppingCart, AlertTriangle, CheckCircle2, Search, ExternalLink, Plus } from 'lucide-react';

export const MaterialsManagement: React.FC = () => {
  const { materials, updateMaterialItem, purchaseRequests, updatePurchaseRequest, orders, setSelectedOrderId, setActiveView } = useApp();

  const [activeTab, setActiveTab] = useState<'materials' | 'pr'>('materials');
  const [filterShortage, setFilterShortage] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');

  const filteredMaterials = materials.filter((m) => {
    if (filterShortage && m.status !== 'CANH_BAO_THIEU') return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        m.materialCode.toLowerCase().includes(q) ||
        m.materialName.toLowerCase().includes(q) ||
        (m.supplier && m.supplier.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  const shortagesCount = materials.filter((m) => m.status === 'CANH_BAO_THIEU').length;

  return (
    <div className="p-6 space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Boxes className="w-5 h-5 text-emerald-600" />
            Quản Lý Vật Tư, Định Mức & Đề Nghị Mua (PR)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Kiểm soát cân đối vật tư (BOM) cần thiết, lượng tồn kho, hàng đang về và cảnh báo thiếu hụt
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-slate-200 p-1 rounded-xl flex text-xs font-semibold">
            <button
              onClick={() => setActiveTab('materials')}
              className={cn(
                'px-3 py-1.5 rounded-lg transition',
                activeTab === 'materials' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              )}
            >
              Danh Mục Vật Tư ({materials.length})
            </button>
            <button
              onClick={() => setActiveTab('pr')}
              className={cn(
                'px-3 py-1.5 rounded-lg transition',
                activeTab === 'pr' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              )}
            >
              Đề Nghị Mua PR ({purchaseRequests.length})
            </button>
          </div>
        </div>
      </div>

      {/* Warning Callout for Material Shortage */}
      {shortagesCount > 0 && (
        <div className="p-3.5 bg-rose-50 border border-rose-300 rounded-xl flex items-center justify-between text-xs text-rose-800">
          <div className="flex items-center gap-2 font-semibold">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 animate-bounce" />
            <span>
              Phát hiện <b>{shortagesCount} danh mục vật tư</b> đang thiếu hụt và chưa có lịch về đủ, có nguy cơ làm gián đoạn dây chuyền!
            </span>
          </div>
          <button
            onClick={() => setFilterShortage(!filterShortage)}
            className="px-3 py-1 bg-rose-600 text-white rounded-lg font-bold hover:bg-rose-700 transition"
          >
            {filterShortage ? 'Xem tất cả vật tư' : 'Lọc danh sách thiếu hụt'}
          </button>
        </div>
      )}

      {/* Search & Filter toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {activeTab === 'materials' && (
            <button
              onClick={() => setFilterShortage(!filterShortage)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-semibold border transition',
                filterShortage
                  ? 'bg-rose-50 text-rose-800 border-rose-300 font-bold'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              )}
            >
              Chỉ hiện vật tư thiếu ({shortagesCount})
            </button>
          )}
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm mã VT, tên vật tư, NCC..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500/20 outline-none"
          />
        </div>
      </div>

      {/* Content based on Active Tab */}
      {activeTab === 'materials' ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/80 text-slate-600 font-bold border-b border-slate-200 text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4">Mã Vật Tư</th>
                  <th className="py-3 px-4">Tên & Quy Cách Vật Tư</th>
                  <th className="py-3 px-3">Đơn Hàng PO Khách</th>
                  <th className="py-3 px-2 text-center">ĐVT</th>
                  <th className="py-3 px-3 text-right">Cần</th>
                  <th className="py-3 px-3 text-right">Sẵn Kho</th>
                  <th className="py-3 px-3 text-right">Đã Về</th>
                  <th className="py-3 px-3 text-right">Còn Thiếu</th>
                  <th className="py-3 px-3">Tình Trạng</th>
                  <th className="py-3 px-4">Nhà Cung Cấp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredMaterials.map((m) => {
                  const linkedOrder = orders.find((o) => o.id === m.orderId);

                  return (
                    <tr key={m.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">
                        {m.materialCode}
                      </td>
                      <td className="py-3 px-4 max-w-xs">
                        <div className="font-bold text-slate-900">{m.materialName}</div>
                        <div className="text-[11px] text-slate-500 line-clamp-1">{m.specifications}</div>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        {linkedOrder ? (
                          <button
                            onClick={() => {
                              setSelectedOrderId(linkedOrder.id);
                              setActiveView('order-detail');
                            }}
                            className="font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 group"
                          >
                            <span>{linkedOrder.orderCode}</span>
                            <ExternalLink className="w-3 h-3 text-blue-400 group-hover:text-blue-600" />
                          </button>
                        ) : (
                          <span className="text-slate-400">N/A</span>
                        )}
                      </td>
                      <td className="py-3 px-2 text-center font-medium text-slate-600">{m.unit}</td>
                      <td className="py-3 px-3 text-right font-bold text-slate-900">{m.requiredQty}</td>
                      <td className="py-3 px-3 text-right text-slate-600">{m.availableStock}</td>
                      <td className="py-3 px-3 text-right text-slate-600">{m.arrivedQty}</td>
                      <td className="py-3 px-3 text-right font-black">
                        <span className={m.shortageQty > 0 ? 'text-rose-600' : 'text-emerald-600'}>
                          {m.shortageQty}
                        </span>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={cn(
                            'text-[10px] font-bold px-2 py-0.5 rounded',
                            m.status === 'DU_VAT_TU'
                              ? 'bg-emerald-100 text-emerald-800'
                              : m.status === 'CHO_HANG_VE'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800 animate-pulse'
                          )}
                        >
                          {m.status === 'DU_VAT_TU'
                            ? 'Đủ vật tư'
                            : m.status === 'CHO_HANG_VE'
                            ? 'Chờ hàng về'
                            : '⚠️ CẢNH BÁO THIẾU'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[11px] text-slate-600 whitespace-nowrap">
                        {m.supplier || 'Chưa chốt NCC'}
                        {m.expectedDate && (
                          <div className="text-[10px] text-blue-600">Dự kiến: {formatDateVN(m.expectedDate)}</div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/80 text-slate-600 font-bold border-b border-slate-200 text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4">Mã PR</th>
                  <th className="py-3 px-3">Nhà Máy</th>
                  <th className="py-3 px-4">Nội Dung Đề Nghị Mua</th>
                  <th className="py-3 px-4">Đơn Hàng Gốc</th>
                  <th className="py-3 px-3">Ngày Lập PR</th>
                  <th className="py-3 px-3">Hạn Hàng Về</th>
                  <th className="py-3 px-3">Nhà Cung Cấp</th>
                  <th className="py-3 px-3 text-right">Ước Tính CP</th>
                  <th className="py-3 px-3">Trạng Thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {purchaseRequests.map((pr) => {
                  const linkedOrder = orders.find((o) => o.id === pr.orderId);

                  return (
                    <tr key={pr.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4 font-bold text-emerald-800 whitespace-nowrap">
                        {pr.prCode}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="font-bold text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-800 border">
                          {pr.factory}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900 max-w-xs">
                        {pr.itemsSummary}
                        <div className="text-[11px] text-slate-400 font-normal">Người lập: {pr.requester}</div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {linkedOrder ? (
                          <button
                            onClick={() => {
                              setSelectedOrderId(linkedOrder.id);
                              setActiveView('order-detail');
                            }}
                            className="font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 group"
                          >
                            <span>{linkedOrder.orderCode}</span>
                            <ExternalLink className="w-3 h-3 text-blue-400 group-hover:text-blue-600" />
                          </button>
                        ) : (
                          <span className="text-slate-400">N/A</span>
                        )}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap text-slate-600 font-medium">
                        {formatDateVN(pr.requestDate)}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap font-bold text-blue-700">
                        {formatDateVN(pr.expectedArrivalDate)}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap font-medium text-slate-800">
                        {pr.supplier}
                      </td>
                      <td className="py-3 px-3 text-right whitespace-nowrap font-bold text-slate-900">
                        {pr.totalCostEstimate ? formatVND(pr.totalCostEstimate) : '—'}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <select
                          value={pr.status}
                          onChange={(e) => updatePurchaseRequest(pr.id, { status: e.target.value as any })}
                          className="py-1 px-2 border border-slate-200 rounded text-xs font-semibold focus:ring-1 focus:ring-emerald-500 outline-none"
                        >
                          <option value="CHO_DUYET">Chờ duyệt</option>
                          <option value="DA_DUYET_PO">Đã duyệt PO mua</option>
                          <option value="DANG_GIAO">Đang giao</option>
                          <option value="DA_NHAP_KHO">Đã nhập kho</option>
                          <option value="TRE_HAN">Trễ hạn</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
