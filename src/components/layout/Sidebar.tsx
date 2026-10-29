'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import {
  LayoutDashboard,
  FileSpreadsheet,
  Factory as FactoryIcon,
  ArrowLeftRight,
  Boxes,
  AlertTriangle,
  RotateCcw,
  Settings,
  ShieldCheck,
  Building2,
  ChevronRight,
  Flame,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  onOpenFirebaseConfig: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenFirebaseConfig }) => {
  const {
    activeView,
    setActiveView,
    setSelectedOrderId,
    orders,
    manufacturingOrders,
    internalOrders,
    issues,
    materials,
    isFirebaseActive,
    resetToDefaultData,
  } = useApp();

  // Compute metrics for badges
  const openIssuesCount = issues.filter((i) => i.status !== 'DA_KHAC_PHUC' && i.status !== 'DONG').length;
  const criticalIssuesCount = issues.filter(
    (i) => i.severity === 'NGHIEM_TRONG_DUNG_CHUYEN' && i.status !== 'DONG'
  ).length;
  const openInternalOrdersCount = internalOrders.filter(
    (io) => io.status !== 'NGHIEM_THU_DAT'
  ).length;
  const materialShortageCount = materials.filter((m) => m.status === 'CANH_BAO_THIEU').length;

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard Tổng quan',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'orders',
      label: 'Đơn hàng khách & PO',
      icon: FileSpreadsheet,
      badge: orders.length,
      badgeClass: 'bg-blue-100 text-blue-700',
    },
    {
      id: 'manufacturing',
      label: 'Lệnh sản xuất (MO)',
      icon: FactoryIcon,
      badge: manufacturingOrders.length,
      badgeClass: 'bg-amber-100 text-amber-700',
    },
    {
      id: 'internal-orders',
      label: 'Đơn hàng nội bộ (IO)',
      icon: ArrowLeftRight,
      badge: openInternalOrdersCount,
      badgeClass: 'bg-indigo-100 text-indigo-700 font-bold',
      subtitle: 'Chuỗi liên kết 3 NM',
    },
    {
      id: 'materials',
      label: 'Vật tư & Đề nghị mua',
      icon: Boxes,
      badge: materialShortageCount > 0 ? `${materialShortageCount} thiếu` : null,
      badgeClass: 'bg-rose-100 text-rose-700 font-bold animate-pulse',
    },
    {
      id: 'issues',
      label: 'Bất cập & Rủi ro',
      icon: AlertTriangle,
      badge: openIssuesCount,
      badgeClass: criticalIssuesCount > 0 ? 'bg-red-500 text-white font-bold' : 'bg-amber-100 text-amber-800',
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col h-screen border-r border-slate-800 select-none shrink-0 sticky top-0">
      {/* Brand & Factory Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/60">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center font-black text-white text-lg shadow-md shadow-blue-500/20">
            T
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-wide text-white uppercase flex items-center gap-1.5">
              Cơ khí & TBCD
              <span className="text-[10px] bg-blue-500/30 text-blue-300 font-medium px-1.5 py-0.5 rounded border border-blue-400/30">
                PRO
              </span>
            </h1>
            <p className="text-[11px] text-slate-400">Chuỗi liên kết 3 Nhà máy</p>
          </div>
        </div>

        {/* 3 Factories Tags */}
        <div className="mt-3 pt-3 border-t border-slate-800/80 grid grid-cols-3 gap-1.5 text-center">
          <div className="bg-slate-800/70 hover:bg-slate-800 p-1 rounded border border-slate-700/60 transition" title="Tổ hợp Cơ khí">
            <div className="text-[10px] font-bold text-amber-400">THCK</div>
            <div className="text-[9px] text-slate-400">Cơ khí</div>
          </div>
          <div className="bg-slate-800/70 hover:bg-slate-800 p-1 rounded border border-slate-700/60 transition" title="Thiết bị Chuyên dụng">
            <div className="text-[10px] font-bold text-cyan-400">TBCD</div>
            <div className="text-[9px] text-slate-400">Thiết bị</div>
          </div>
          <div className="bg-slate-800/70 hover:bg-slate-800 p-1 rounded border border-slate-700/60 transition" title="Nhà máy Khuôn">
            <div className="text-[10px] font-bold text-purple-400">NMK</div>
            <div className="text-[9px] text-slate-400">Khuôn gá</div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="text-[11px] font-semibold text-slate-400 px-3 pb-1 tracking-wider uppercase">
          Quản trị điều hành
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id || (item.id === 'orders' && activeView === 'order-detail');

          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === 'orders') {
                  setSelectedOrderId(null);
                }
                setActiveView(item.id as any);
              }}
              className={cn(
                'w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all group text-left',
                isActive
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25 font-semibold'
                  : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
              )}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={cn(
                    'w-4 h-4 transition-transform group-hover:scale-110',
                    isActive ? 'text-white' : 'text-slate-400'
                  )}
                />
                <div>
                  <span>{item.label}</span>
                  {item.subtitle && (
                    <div className="text-[10px] text-slate-400 font-normal leading-tight">
                      {item.subtitle}
                    </div>
                  )}
                </div>
              </div>

              {item.badge !== null && item.badge !== undefined && (
                <span
                  className={cn(
                    'text-[11px] px-2 py-0.5 rounded-full font-medium',
                    isActive ? 'bg-white/20 text-white' : item.badgeClass
                  )}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Multi-tier Supply Chain Highlight */}
        <div className="pt-4 mt-4 border-t border-slate-800">
          <div className="text-[11px] font-semibold text-slate-400 px-3 pb-2 uppercase tracking-wider flex items-center justify-between">
            <span>Tải công việc 3 NM</span>
            <Building2 className="w-3.5 h-3.5 text-slate-500" />
          </div>

          <div className="space-y-2.5 px-3 py-2 bg-slate-950/40 rounded-lg border border-slate-800/60 text-xs">
            <div>
              <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                <span className="font-semibold text-amber-400">THCK</span>
                <span>82% công suất</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div className="bg-amber-400 h-1.5 rounded-full" style={{ width: '82%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                <span className="font-semibold text-cyan-400">TBCD</span>
                <span>74% công suất</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div className="bg-cyan-400 h-1.5 rounded-full" style={{ width: '74%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                <span className="font-semibold text-purple-400">NMK</span>
                <span>65% công suất</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div className="bg-purple-400 h-1.5 rounded-full" style={{ width: '65%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Footer & Mode Switcher */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/80 space-y-2">
        {/* Firebase Status & Fallback Indicator */}
        <div className="flex items-center justify-between px-2 py-1.5 bg-slate-900 rounded border border-slate-800 text-[11px]">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'w-2 h-2 rounded-full',
                isFirebaseActive ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50' : 'bg-amber-400'
              )}
            ></span>
            <span className="text-slate-300">
              {isFirebaseActive ? 'Firebase Live' : 'Mock Data Store'}
            </span>
          </div>

          <button
            onClick={onOpenFirebaseConfig}
            className="text-slate-400 hover:text-white transition p-1 hover:bg-slate-800 rounded"
            title="Cấu hình Firebase API"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>

        <button
          onClick={() => {
            if (confirm('Bạn có chắc muốn khôi phục dữ liệu mẫu ban đầu cho toàn bộ hệ thống?')) {
              resetToDefaultData();
            }
          }}
          className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 rounded bg-slate-800/80 hover:bg-slate-800 text-slate-300 text-xs transition border border-slate-700/60"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
          <span>Nạp lại Mock Data</span>
        </button>
      </div>
    </aside>
  );
};
