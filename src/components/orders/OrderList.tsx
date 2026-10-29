'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import {
  CustomerOrder,
  OrderType,
  ExportMarket,
  DomesticRegion,
  Factory,
  OrderStatus,
  ORDER_STATUS_LABELS,
  EXPORT_MARKET_LABELS,
  DOMESTIC_REGION_LABELS,
} from '@/types';
import { formatVND, formatDateVN, cn } from '@/lib/utils';
import {
  Search,
  Filter,
  Download,
  Plus,
  Eye,
  SlidersHorizontal,
  Layers,
  Building2,
  Calendar,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';

interface OrderListProps {
  onOpenCreateOrder: () => void;
}

export const OrderList: React.FC<OrderListProps> = ({ onOpenCreateOrder }) => {
  const { orders, setSelectedOrderId, setActiveView, searchQuery } = useApp();

  // Filters state
  const [filterType, setFilterType] = useState<string>('ALL'); // ALL, XUAT_KHAU, TRONG_NUOC
  const [filterMarket, setFilterMarket] = useState<string>('ALL');
  const [filterRegion, setFilterRegion] = useState<string>('ALL');
  const [filterFactory, setFilterFactory] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [localSearch, setLocalSearch] = useState<string>('');

  // Extract unique customers
  const customers = useMemo(() => {
    const list = Array.from(new Set(orders.map((o) => o.customerName)));
    return list;
  }, [orders]);
  const [filterCustomer, setFilterCustomer] = useState<string>('ALL');

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((ord) => {
      // Global or local search
      const query = (localSearch || searchQuery || '').trim().toLowerCase();
      if (query) {
        const match =
          ord.orderCode.toLowerCase().includes(query) ||
          ord.customerName.toLowerCase().includes(query) ||
          ord.projectName.toLowerCase().includes(query) ||
          (ord.manager && ord.manager.toLowerCase().includes(query));
        if (!match) return false;
      }

      // Filter Type
      if (filterType !== 'ALL' && ord.orderType !== filterType) {
        return false;
      }

      // Filter Market (Export)
      if (filterType === 'XUAT_KHAU' || filterType === 'ALL') {
        if (filterMarket !== 'ALL' && ord.market !== filterMarket) {
          return false;
        }
      }

      // Filter Region (Domestic)
      if (filterType === 'TRONG_NUOC' || filterType === 'ALL') {
        if (filterRegion !== 'ALL' && ord.region !== filterRegion) {
          return false;
        }
      }

      // Filter Customer
      if (filterCustomer !== 'ALL' && ord.customerName !== filterCustomer) {
        return false;
      }

      // Filter Factory
      if (filterFactory !== 'ALL' && ord.primaryFactory !== filterFactory) {
        return false;
      }

      // Filter Status
      if (filterStatus !== 'ALL' && ord.status !== filterStatus) {
        return false;
      }

      return true;
    });
  }, [
    orders,
    searchQuery,
    localSearch,
    filterType,
    filterMarket,
    filterRegion,
    filterCustomer,
    filterFactory,
    filterStatus,
  ]);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      'Mã đơn',
      'Khách hàng',
      'Dự án',
      'Loại hình',
      'Thị trường/Miền',
      'Nhà máy chính',
      'Số lượng',
      'Đơn vị',
      'Giá trị (VND)',
      'Ngày PO',
      'Hạn giao',
      'Trạng thái',
      'Tiến độ %',
      'Phụ trách',
    ];

    const rows = filteredOrders.map((o) => [
      `"${o.orderCode}"`,
      `"${o.customerName}"`,
      `"${o.projectName}"`,
      o.orderType === 'XUAT_KHAU' ? 'Xuất khẩu' : 'Trong nước',
      o.orderType === 'XUAT_KHAU'
        ? EXPORT_MARKET_LABELS[o.market as ExportMarket] || ''
        : DOMESTIC_REGION_LABELS[o.region as DomesticRegion] || '',
      o.primaryFactory,
      o.totalQuantity,
      o.unit,
      o.totalValue,
      o.poDate,
      o.deliveryDeadline,
      ORDER_STATUS_LABELS[o.status].label,
      `${o.progressPercent}%`,
      `"${o.manager}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Danh_sach_don_hang_THACO_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleResetFilters = () => {
    setFilterType('ALL');
    setFilterMarket('ALL');
    setFilterRegion('ALL');
    setFilterCustomer('ALL');
    setFilterFactory('ALL');
    setFilterStatus('ALL');
    setLocalSearch('');
  };

  return (
    <div className="p-6 space-y-5 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-600" />
            Danh Sách Đơn Hàng & Hợp Đồng Sản Xuất
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Phân cấp đa tầng: Xuất khẩu/Trong nước → Thị trường/Miền → Khách hàng → Phân bổ 3 Nhà máy
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-2xs transition flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Xuất Excel / CSV</span>
          </button>

          <button
            onClick={onOpenCreateOrder}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-blue-500/30 transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Tiếp nhận Đơn hàng mới</span>
          </button>
        </div>
      </div>

      {/* Multi-tier Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wide">
            <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" />
            <span>Bộ lọc Phân cấp Nâng cao</span>
          </div>

          {(filterType !== 'ALL' ||
            filterMarket !== 'ALL' ||
            filterRegion !== 'ALL' ||
            filterCustomer !== 'ALL' ||
            filterFactory !== 'ALL' ||
            filterStatus !== 'ALL' ||
            localSearch) && (
            <button
              onClick={handleResetFilters}
              className="text-xs text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Xóa bộ lọc</span>
            </button>
          )}
        </div>

        {/* Level 1: Order Type Tab Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 mr-1">Loại hình:</span>
          <button
            onClick={() => {
              setFilterType('ALL');
              setFilterMarket('ALL');
              setFilterRegion('ALL');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filterType === 'ALL'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tất cả loại hình ({orders.length})
          </button>
          <button
            onClick={() => {
              setFilterType('XUAT_KHAU');
              setFilterRegion('ALL');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              filterType === 'XUAT_KHAU'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
            }`}
          >
            <span>Xuất khẩu</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20">
              {orders.filter((o) => o.orderType === 'XUAT_KHAU').length}
            </span>
          </button>
          <button
            onClick={() => {
              setFilterType('TRONG_NUOC');
              setFilterMarket('ALL');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              filterType === 'TRONG_NUOC'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            <span>Trong nước</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20">
              {orders.filter((o) => o.orderType === 'TRONG_NUOC').length}
            </span>
          </button>
        </div>

        {/* Level 2: Sub-filters (Market or Region, Customer, Factory, Status) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5 pt-1">
          {/* Market / Region filter */}
          {filterType === 'XUAT_KHAU' ? (
            <div>
              <label className="text-[11px] text-slate-500 font-semibold block mb-1">Thị trường xuất khẩu</label>
              <select
                value={filterMarket}
                onChange={(e) => setFilterMarket(e.target.value)}
                className="w-full py-1.5 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500/20 outline-none"
              >
                <option value="ALL">Tất cả thị trường</option>
                {Object.entries(EXPORT_MARKET_LABELS).map(([k, label]) => (
                  <option key={k} value={k}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          ) : filterType === 'TRONG_NUOC' ? (
            <div>
              <label className="text-[11px] text-slate-500 font-semibold block mb-1">Miền trong nước</label>
              <select
                value={filterRegion}
                onChange={(e) => setFilterRegion(e.target.value)}
                className="w-full py-1.5 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500/20 outline-none"
              >
                <option value="ALL">Tất cả các miền</option>
                {Object.entries(DOMESTIC_REGION_LABELS).map(([k, label]) => (
                  <option key={k} value={k}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="text-[11px] text-slate-500 font-semibold block mb-1">Thị trường / Phân vùng</label>
              <select
                value={filterMarket}
                onChange={(e) => setFilterMarket(e.target.value)}
                className="w-full py-1.5 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500/20 outline-none"
              >
                <option value="ALL">Toàn bộ thị trường</option>
                <optgroup label="Xuất khẩu">
                  {Object.entries(EXPORT_MARKET_LABELS).map(([k, label]) => (
                    <option key={k} value={k}>
                      {label}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>
          )}

          {/* Customer */}
          <div>
            <label className="text-[11px] text-slate-500 font-semibold block mb-1">Khách hàng</label>
            <select
              value={filterCustomer}
              onChange={(e) => setFilterCustomer(e.target.value)}
              className="w-full py-1.5 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500/20 outline-none"
            >
              <option value="ALL">Tất cả khách hàng ({customers.length})</option>
              {customers.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Primary Factory */}
          <div>
            <label className="text-[11px] text-slate-500 font-semibold block mb-1">Nhà máy chính</label>
            <select
              value={filterFactory}
              onChange={(e) => setFilterFactory(e.target.value)}
              className="w-full py-1.5 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500/20 outline-none"
            >
              <option value="ALL">Tất cả nhà máy</option>
              <option value="THCK">Tổ hợp Cơ khí (THCK)</option>
              <option value="TBCD">Thiết bị Chuyên dụng (TBCD)</option>
              <option value="NMK">Nhà máy Khuôn (NMK)</option>
            </select>
          </div>

          {/* Order Status */}
          <div>
            <label className="text-[11px] text-slate-500 font-semibold block mb-1">Trạng thái tiến độ</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full py-1.5 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500/20 outline-none"
            >
              <option value="ALL">Tất cả trạng thái</option>
              {Object.entries(ORDER_STATUS_LABELS).map(([k, meta]) => (
                <option key={k} value={k}>
                  {meta.label}
                </option>
              ))}
            </select>
          </div>

          {/* In-table search */}
          <div>
            <label className="text-[11px] text-slate-500 font-semibold block mb-1">Tìm nhanh</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Mã PO, dự án..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="w-full pl-8 pr-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500/20 outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Orders Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/80 text-slate-600 font-bold border-b border-slate-200 text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4">Mã Đơn / PO</th>
                <th className="py-3 px-4">Khách Hàng & Dự Án</th>
                <th className="py-3 px-3">Phân Cấp / Vùng</th>
                <th className="py-3 px-3">NM Chính</th>
                <th className="py-3 px-3">Ngày Nhận PO</th>
                <th className="py-3 px-3">Hạn Giao</th>
                <th className="py-3 px-3 text-center">Tiến Độ</th>
                <th className="py-3 px-3">Trạng Thái</th>
                <th className="py-3 px-3">Người Phụ Trách</th>
                <th className="py-3 px-3 text-right">Thao Tác</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredOrders.map((ord) => {
                const statusMeta = ORDER_STATUS_LABELS[ord.status];
                const isUrgent = ord.status === 'TAM_DUNG_TRE_HAN' || ord.priority === 'KHAN_CAP';

                return (
                  <tr
                    key={ord.id}
                    onClick={() => {
                      setSelectedOrderId(ord.id);
                      setActiveView('order-detail');
                    }}
                    className="hover:bg-blue-50/50 transition cursor-pointer group"
                  >
                    {/* Order Code & Priority badge */}
                    <td className="py-3 px-4 font-bold text-blue-700 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span>{ord.orderCode}</span>
                        {isUrgent && (
                          <span
                            className="w-2 h-2 rounded-full bg-rose-500 animate-ping"
                            title="Đơn khẩn cấp hoặc cảnh báo trễ"
                          />
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 font-normal">
                        {ord.totalQuantity} {ord.unit} • {formatVND(ord.totalValue)}
                      </div>
                    </td>

                    {/* Customer & Project */}
                    <td className="py-3 px-4 max-w-xs">
                      <div className="font-bold text-slate-900 group-hover:text-blue-700 transition">
                        {ord.customerName}
                      </div>
                      <div className="text-slate-500 text-[11px] line-clamp-1">{ord.projectName}</div>
                    </td>

                    {/* Hierarchy: Type & Region/Market */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <span
                          className={cn(
                            'text-[10px] font-bold px-1.5 py-0.5 rounded w-fit',
                            ord.orderType === 'XUAT_KHAU'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-emerald-100 text-emerald-800'
                          )}
                        >
                          {ord.orderType === 'XUAT_KHAU' ? 'Xuất khẩu' : 'Trong nước'}
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium">
                          {ord.orderType === 'XUAT_KHAU'
                            ? EXPORT_MARKET_LABELS[ord.market as ExportMarket] || 'Mỹ'
                            : DOMESTIC_REGION_LABELS[ord.region as DomesticRegion] || 'Miền Nam'}
                        </span>
                      </div>
                    </td>

                    {/* Primary Factory */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span
                        className={cn(
                          'font-bold text-xs px-2 py-0.5 rounded border',
                          ord.primaryFactory === 'THCK'
                            ? 'bg-amber-50 text-amber-900 border-amber-300'
                            : ord.primaryFactory === 'TBCD'
                            ? 'bg-cyan-50 text-cyan-900 border-cyan-300'
                            : 'bg-purple-50 text-purple-900 border-purple-300'
                        )}
                      >
                        {ord.primaryFactory}
                      </span>
                    </td>

                    {/* PO Date */}
                    <td className="py-3 px-3 whitespace-nowrap text-slate-600 font-medium">
                      {formatDateVN(ord.poDate)}
                    </td>

                    {/* Delivery Deadline */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span
                        className={cn(
                          'font-semibold',
                          ord.status === 'TAM_DUNG_TRE_HAN' ? 'text-rose-600' : 'text-slate-700'
                        )}
                      >
                        {formatDateVN(ord.deliveryDeadline)}
                      </span>
                    </td>

                    {/* Progress */}
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <div className="font-bold text-slate-800">{ord.progressPercent}%</div>
                      <div className="w-16 mx-auto bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
                        <div
                          className={cn(
                            'h-1.5 rounded-full',
                            ord.progressPercent >= 80
                              ? 'bg-emerald-500'
                              : ord.progressPercent < 50
                              ? 'bg-amber-500'
                              : 'bg-blue-500'
                          )}
                          style={{ width: `${ord.progressPercent}%` }}
                        />
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span
                        className={cn(
                          'text-[10px] font-semibold px-2 py-0.5 rounded-full border',
                          statusMeta.badgeClass
                        )}
                      >
                        {statusMeta.label}
                      </span>
                    </td>

                    {/* Manager */}
                    <td className="py-3 px-3 text-slate-600 text-[11px] truncate max-w-[140px]">
                      {ord.manager}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedOrderId(ord.id);
                          setActiveView('order-detail');
                        }}
                        className="px-2.5 py-1 text-xs text-blue-600 hover:text-blue-800 font-semibold bg-blue-50 hover:bg-blue-100 rounded-lg transition inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Chi tiết</span>
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    <p className="text-sm font-semibold">Không tìm thấy đơn hàng phù hợp với bộ lọc</p>
                    <button
                      onClick={handleResetFilters}
                      className="mt-2 text-xs text-blue-600 hover:underline font-medium"
                    >
                      Xóa toàn bộ bộ lọc
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>
            Hiển thị <b>{filteredOrders.length}</b> / {orders.length} đơn hàng
          </span>
          <span className="text-[11px]">
            * Nhấp vào bất kỳ dòng nào để mở <b>Trang Chi Tiết Đơn Hàng</b> trung tâm
          </span>
        </div>
      </div>
    </div>
  );
};
