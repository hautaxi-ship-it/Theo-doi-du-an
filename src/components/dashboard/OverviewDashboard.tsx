'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { FACTORY_NAMES, Factory, ORDER_STATUS_LABELS } from '@/types';
import { formatVND, formatDateVN, cn } from '@/lib/utils';
import {
  TrendingUp,
  AlertTriangle,
  Clock,
  ArrowLeftRight,
  Boxes,
  CheckCircle2,
  Factory as FactoryIcon,
  ChevronRight,
  ArrowUpRight,
  Layers,
  Sparkles,
  ShieldAlert,
  Flame,
} from 'lucide-react';

interface OverviewDashboardProps {
  onOpenCreateOrder: () => void;
  onOpenCreateIO: () => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({ onOpenCreateOrder, onOpenCreateIO }) => {
  const {
    orders,
    manufacturingOrders,
    internalOrders,
    purchaseRequests,
    issues,
    materials,
    setSelectedOrderId,
    setActiveView,
  } = useApp();

  // Metrics
  const activeOrders = orders.filter((o) => o.status !== 'HOAN_THANH');
  const delayedOrders = orders.filter((o) => o.status === 'TAM_DUNG_TRE_HAN');
  const pendingPRs = purchaseRequests.filter((pr) => pr.status === 'CHO_DUYET');
  const openIssues = issues.filter((i) => i.status !== 'DA_KHAC_PHUC' && i.status !== 'DONG');
  const criticalIssues = issues.filter(
    (i) => i.severity === 'NGHIEM_TRONG_DUNG_CHUYEN' && i.status !== 'DONG'
  );
  const openInternalOrders = internalOrders.filter((io) => io.status !== 'NGHIEM_THU_DAT');
  const materialShortages = materials.filter((m) => m.status === 'CANH_BAO_THIEU');

  // Total value in progress
  const totalInProductionValue = activeOrders.reduce((sum, o) => sum + (o.totalValue || 0), 0);

  // Status breakdown
  const statusCounts = orders.reduce((acc, curr) => {
    acc[curr.status] = (acc[curr.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Workload by Factory
  const factoryWorkload: Record<Factory, { moTotal: number; moRunning: number; ioRequested: number; ioFulfilling: number }> = {
    THCK: { moTotal: 0, moRunning: 0, ioRequested: 0, ioFulfilling: 0 },
    TBCD: { moTotal: 0, moRunning: 0, ioRequested: 0, ioFulfilling: 0 },
    NMK: { moTotal: 0, moRunning: 0, ioRequested: 0, ioFulfilling: 0 },
  };

  manufacturingOrders.forEach((mo) => {
    if (factoryWorkload[mo.factory]) {
      factoryWorkload[mo.factory].moTotal += 1;
      if (mo.status === 'DANG_GIAO_CONG' || mo.status === 'TRE_HAN') {
        factoryWorkload[mo.factory].moRunning += 1;
      }
    }
  });

  internalOrders.forEach((io) => {
    if (factoryWorkload[io.sourceFactory]) {
      factoryWorkload[io.sourceFactory].ioRequested += 1;
    }
    if (factoryWorkload[io.targetFactory]) {
      factoryWorkload[io.targetFactory].ioFulfilling += 1;
    }
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner / Welcome */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-800">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-400/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Khối Cơ khí & TBCD • Hệ thống Điều hành Sản xuất Đa Nhà Máy</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            Trung tâm Giám sát Tiến độ & Chuỗi Cung ứng
          </h1>
          <p className="text-slate-300 text-xs max-w-2xl leading-relaxed">
            Kiểm soát chuỗi phân cấp <span className="text-blue-300 font-semibold">Đơn hàng khách (PO)</span> →{' '}
            <span className="text-amber-300 font-semibold">Lệnh sản xuất (MO)</span> →{' '}
            <span className="text-indigo-300 font-semibold">Đơn hàng nội bộ (IO)</span> giữa 3 nhà máy THCK, TBCD và NMK.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenCreateOrder}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/30 transition flex items-center gap-2"
          >
            <Layers className="w-4 h-4" />
            <span>Tiếp nhận PO mới</span>
          </button>
          <button
            onClick={onOpenCreateIO}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-500/30 transition flex items-center gap-2"
          >
            <ArrowLeftRight className="w-4 h-4" />
            <span>Khởi tạo Đơn nội bộ</span>
          </button>
        </div>
      </div>

      {/* 5 Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* KPI 1 */}
        <div
          onClick={() => setActiveView('orders')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-blue-400 hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Đơn hàng đang chạy</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{activeOrders.length}</span>
            <span className="text-[11px] text-slate-500 font-medium">/ {orders.length} đơn</span>
          </div>
          <div className="mt-2 text-[11px] text-blue-600 font-medium truncate">
            Giá trị: {formatVND(totalInProductionValue)}
          </div>
        </div>

        {/* KPI 2 */}
        <div
          onClick={() => setActiveView('orders')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-rose-400 hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Chậm tiến độ / Cảnh báo</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-110 transition">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-rose-600">{delayedOrders.length}</span>
            <span className="text-[11px] text-rose-500 font-medium">cần xử lý gấp</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 truncate">
            {delayedOrders.length > 0 ? `${delayedOrders[0].orderCode} trễ hạn giao` : 'Tất cả đúng tiến độ'}
          </div>
        </div>

        {/* KPI 3 */}
        <div
          onClick={() => setActiveView('materials')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-amber-400 hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Đề nghị mua chờ duyệt</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-600">{pendingPRs.length}</span>
            <span className="text-[11px] text-slate-500 font-medium">bản PR</span>
          </div>
          <div className="mt-2 text-[11px] text-amber-700 font-medium truncate">
            {materialShortages.length > 0 ? `⚠️ ${materialShortages.length} mã vật tư thiếu` : 'Đủ vật tư thiết yếu'}
          </div>
        </div>

        {/* KPI 4 */}
        <div
          onClick={() => setActiveView('issues')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-red-400 hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Bất cập chưa xử lý</span>
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center group-hover:scale-110 transition">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{openIssues.length}</span>
            {criticalIssues.length > 0 && (
              <span className="text-[10px] bg-red-500 text-white font-bold px-1.5 py-0.5 rounded-full">
                {criticalIssues.length} Dừng chuyền
              </span>
            )}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 truncate">
            {criticalIssues.length > 0 ? `Bão biển làm chậm tàu nhôm` : 'Không có sự cố nghiêm trọng'}
          </div>
        </div>

        {/* KPI 5 */}
        <div
          onClick={() => setActiveView('internal-orders')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-indigo-400 hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Đơn nội bộ đang mở</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition">
              <ArrowLeftRight className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-indigo-700">{openInternalOrders.length}</span>
            <span className="text-[11px] text-slate-500 font-medium">chuỗi gia công</span>
          </div>
          <div className="mt-2 text-[11px] text-indigo-600 font-medium truncate">
            Giữa THCK ⇄ TBCD ⇄ NMK
          </div>
        </div>
      </div>

      {/* Middle Row: Workload by Factory & Order Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Factory Workload Breakdown (2 Columns) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FactoryIcon className="w-4 h-4 text-blue-600" />
                Tải Công Việc & Điều Phối 3 Nhà Máy
              </h2>
              <p className="text-xs text-slate-500">Giám sát năng lực sản xuất và luồng giao nhận nội bộ</p>
            </div>
            <button
              onClick={() => setActiveView('manufacturing')}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
            >
              <span>Xem tất cả LSX</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            {/* THCK */}
            <div className="bg-amber-50/50 rounded-xl p-4 border border-amber-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded">THCK</span>
                <span className="text-xs font-bold text-amber-800">Tổ hợp Cơ khí</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-tight">
                Gia công kết cấu thép, cắt laser CNC, chấn dập, mạ kẽm & hàn robot.
              </p>

              <div className="space-y-1.5 pt-2 border-t border-amber-200/60 text-xs">
                <div className="flex justify-between text-slate-700">
                  <span>Lệnh sản xuất đang chạy:</span>
                  <span className="font-bold text-amber-900">{factoryWorkload.THCK.moRunning} LSX</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>Đơn nội bộ đang gia công hộ NM khác:</span>
                  <span className="font-bold text-amber-900">{factoryWorkload.THCK.ioFulfilling} đơn</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>Tải công suất ước tính:</span>
                  <span className="font-bold text-amber-600">82%</span>
                </div>
              </div>

              <div className="w-full bg-amber-200/60 rounded-full h-2 overflow-hidden">
                <div className="bg-amber-500 h-2 rounded-full" style={{ width: '82%' }}></div>
              </div>
            </div>

            {/* TBCD */}
            <div className="bg-cyan-50/50 rounded-xl p-4 border border-cyan-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-cyan-900 bg-cyan-200/80 px-2 py-0.5 rounded">TBCD</span>
                <span className="text-xs font-bold text-cyan-800">TB Chuyên dụng</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-tight">
                Sơ mi rơ moóc, xe bồn xitec xăng dầu hóa chất, xe môi trường & bồn áp lực.
              </p>

              <div className="space-y-1.5 pt-2 border-t border-cyan-200/60 text-xs">
                <div className="flex justify-between text-slate-700">
                  <span>Lệnh sản xuất đang chạy:</span>
                  <span className="font-bold text-cyan-900">{factoryWorkload.TBCD.moRunning} LSX</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>Đơn nội bộ đang đặt các NM khác:</span>
                  <span className="font-bold text-cyan-900">{factoryWorkload.TBCD.ioRequested} đơn</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>Tải công suất ước tính:</span>
                  <span className="font-bold text-cyan-600">74%</span>
                </div>
              </div>

              <div className="w-full bg-cyan-200/60 rounded-full h-2 overflow-hidden">
                <div className="bg-cyan-600 h-2 rounded-full" style={{ width: '74%' }}></div>
              </div>
            </div>

            {/* NMK */}
            <div className="bg-purple-50/50 rounded-xl p-4 border border-purple-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-purple-900 bg-purple-200/80 px-2 py-0.5 rounded">NMK</span>
                <span className="text-xs font-bold text-purple-800">Nhà máy Khuôn</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-tight">
                Khuôn dập kim loại, đồ gá hàn/kiểm tra, gia công phay CNC chính xác 5 trục.
              </p>

              <div className="space-y-1.5 pt-2 border-t border-purple-200/60 text-xs">
                <div className="flex justify-between text-slate-700">
                  <span>Lệnh sản xuất khuôn đang chạy:</span>
                  <span className="font-bold text-purple-900">{factoryWorkload.NMK.moRunning} LSX</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>Đang phục vụ đơn nội bộ cho khối:</span>
                  <span className="font-bold text-purple-900">{factoryWorkload.NMK.ioFulfilling} đơn</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>Tải công suất ước tính:</span>
                  <span className="font-bold text-purple-600">65%</span>
                </div>
              </div>

              <div className="w-full bg-purple-200/60 rounded-full h-2 overflow-hidden">
                <div className="bg-purple-600 h-2 rounded-full" style={{ width: '65%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Status Distribution (1 Column) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 mb-1">Phân Bố Trạng Thái Đơn Hàng</h2>
            <p className="text-xs text-slate-500 mb-4">Tổng cộng {orders.length} đơn hàng trong hệ thống</p>

            <div className="space-y-2.5">
              {Object.entries(ORDER_STATUS_LABELS).map(([k, meta]) => {
                const count = statusCounts[k] || 0;
                const percent = Math.round((count / (orders.length || 1)) * 100);

                return (
                  <div key={k} className="text-xs">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-slate-700 font-medium flex items-center gap-1.5">
                        <span
                          className={cn(
                            'w-2 h-2 rounded-full',
                            k === 'HOAN_THANH'
                              ? 'bg-emerald-500'
                              : k === 'TAM_DUNG_TRE_HAN'
                              ? 'bg-rose-500'
                              : k === 'DANG_SAN_XUAT'
                              ? 'bg-amber-500'
                              : 'bg-blue-500'
                          )}
                        />
                        {meta.label}
                      </span>
                      <span className="font-bold text-slate-800">
                        {count} ({percent}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={cn(
                          'h-1.5 rounded-full',
                          k === 'HOAN_THANH'
                            ? 'bg-emerald-500'
                            : k === 'TAM_DUNG_TRE_HAN'
                            ? 'bg-rose-500'
                            : k === 'DANG_SAN_XUAT'
                            ? 'bg-amber-500'
                            : 'bg-blue-500'
                        )}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Tỷ lệ hoàn thành đúng hạn:</span>
            <span className="font-extrabold text-emerald-600 text-sm">87.5%</span>
          </div>
        </div>
      </div>

      {/* Bottom Row: Watchlist & Urgent Attention */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Watchlist 1: Orders Requiring Attention */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Đơn hàng Khách Cần Chú Ý Đặc Biệt
              </h3>
              <p className="text-xs text-slate-500">Các đơn có rủi ro trễ hạn, thiếu vật tư hoặc giá trị lớn</p>
            </div>
            <button
              onClick={() => setActiveView('orders')}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
            >
              Xem tất cả
            </button>
          </div>

          <div className="divide-y divide-slate-100 mt-2">
            {orders.slice(0, 4).map((ord) => {
              const statusMeta = ORDER_STATUS_LABELS[ord.status];
              const isUrgent = ord.status === 'TAM_DUNG_TRE_HAN' || ord.priority === 'KHAN_CAP';

              return (
                <div
                  key={ord.id}
                  onClick={() => {
                    setSelectedOrderId(ord.id);
                    setActiveView('order-detail');
                  }}
                  className="py-3 flex items-center justify-between hover:bg-slate-50 px-2 rounded-lg transition cursor-pointer"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-blue-700">{ord.orderCode}</span>
                      <span className="text-slate-400">•</span>
                      <span className="font-semibold text-xs text-slate-800">{ord.customerName}</span>
                      {isUrgent && (
                        <span className="text-[10px] bg-rose-100 text-rose-700 font-bold px-1.5 py-0.2 rounded border border-rose-200">
                          Nguy cơ cao
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-1">{ord.projectName}</p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400">
                      <span>NM chính: <b className="text-slate-700">{ord.primaryFactory}</b></span>
                      <span>Hạn giao: <b className="text-slate-700">{formatDateVN(ord.deliveryDeadline)}</b></span>
                      <span>Giá trị: <b className="text-slate-700">{formatVND(ord.totalValue)}</b></span>
                    </div>
                  </div>

                  <div className="text-right shrink-0 ml-4">
                    <div className="text-xs font-bold text-slate-800">{ord.progressPercent}%</div>
                    <div className="w-16 bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
                      <div
                        className={cn(
                          'h-1.5 rounded-full',
                          ord.progressPercent >= 80 ? 'bg-emerald-500' : ord.progressPercent < 50 ? 'bg-amber-500' : 'bg-blue-500'
                        )}
                        style={{ width: `${ord.progressPercent}%` }}
                      />
                    </div>
                    <span className={cn('text-[10px] font-semibold mt-1 inline-block px-1.5 py-0.5 rounded border', statusMeta.badgeClass)}>
                      {statusMeta.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Watchlist 2: Open Inter-factory Orders (Chuỗi liên kết nội bộ) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ArrowLeftRight className="w-4 h-4 text-indigo-600" />
                Chuỗi Đơn Nội Bộ Đang Giao Nhận Giữa Các NM
              </h3>
              <p className="text-xs text-slate-500">Phản ánh tiến độ gia công hỗ trợ trực tiếp lên Đơn hàng khách</p>
            </div>
            <button
              onClick={() => setActiveView('internal-orders')}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
            >
              Xem tất cả ({internalOrders.length})
            </button>
          </div>

          <div className="divide-y divide-slate-100 mt-2">
            {internalOrders.slice(0, 4).map((io) => {
              const isDelayed = io.status === 'CHAM_TRE';

              return (
                <div
                  key={io.id}
                  onClick={() => {
                    setSelectedOrderId(io.customerOrderId);
                    setActiveView('order-detail');
                  }}
                  className="py-3 flex items-center justify-between hover:bg-slate-50 px-2 rounded-lg transition cursor-pointer"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-indigo-700">{io.ioCode}</span>
                      <div className="flex items-center gap-1 text-[11px] font-bold">
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">{io.sourceFactory}</span>
                        <span className="text-slate-400">➔</span>
                        <span className="px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800">{io.targetFactory}</span>
                      </div>
                      {isDelayed && (
                        <span className="text-[10px] bg-rose-100 text-rose-700 font-bold px-1.5 py-0.2 rounded border border-rose-200">
                          Chậm giao
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-700 font-medium line-clamp-1">{io.itemDescription}</p>
                    <div className="text-[11px] text-slate-500">
                      Gắn với đơn cha: <b className="text-blue-600">{io.customerOrderCode}</b> • Hạn giao:{' '}
                      <b className="text-slate-700">{formatDateVN(io.requiredDate)}</b>
                    </div>
                  </div>

                  <div className="text-right shrink-0 ml-4">
                    <div className="text-xs font-bold text-slate-800">{io.progressPercent}%</div>
                    <span
                      className={cn(
                        'text-[10px] font-semibold mt-1 inline-block px-1.5 py-0.5 rounded border',
                        io.status === 'NGHIEM_THU_DAT'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                          : io.status === 'CHAM_TRE'
                          ? 'bg-rose-100 text-rose-800 border-rose-200 animate-pulse'
                          : 'bg-indigo-100 text-indigo-800 border-indigo-200'
                      )}
                    >
                      {io.status === 'NGHIEM_THU_DAT'
                        ? 'Nghiệm thu đạt'
                        : io.status === 'CHAM_TRE'
                        ? 'Chậm trễ'
                        : io.status === 'DA_GIAO_SANG_NM'
                        ? 'Đã giao NM'
                        : 'Đang gia công'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
