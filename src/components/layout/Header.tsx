'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { UserRole, USER_ROLES } from '@/types';
import {
  Search,
  Plus,
  Bell,
  UserCheck,
  ChevronDown,
  Layers,
  ArrowLeftRight,
  Factory,
  Database,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeaderProps {
  onOpenCreateOrder: () => void;
  onOpenCreateMO: () => void;
  onOpenCreateIO: () => void;
  onOpenFirebaseConfig: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenCreateOrder,
  onOpenCreateMO,
  onOpenCreateIO,
  onOpenFirebaseConfig,
}) => {
  const {
    currentRole,
    setCurrentRole,
    searchQuery,
    setSearchQuery,
    isFirebaseActive,
    issues,
    materials,
    setActiveView,
    setSelectedOrderId,
  } = useApp();

  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showQuickMenu, setShowQuickMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Urgent alerts
  const criticalIssues = issues.filter((i) => i.severity === 'NGHIEM_TRONG_DUNG_CHUYEN' && i.status !== 'DONG');
  const materialAlerts = materials.filter((m) => m.status === 'CANH_BAO_THIEU');
  const totalNotifications = criticalIssues.length + materialAlerts.length;

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Global Search */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm kiếm mã PO, khách hàng, lệnh sản xuất (MO), đơn nội bộ (IO)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Role Switcher */}
        <div className="relative">
          <button
            onClick={() => {
              setShowRoleDropdown(!showRoleDropdown);
              setShowQuickMenu(false);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs text-slate-700 transition font-medium"
          >
            <UserCheck className="w-4 h-4 text-blue-600" />
            <div className="text-left hidden sm:block">
              <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-tight">Vai trò hiện tại</span>
              <span className="font-semibold text-slate-900">{USER_ROLES[currentRole].title}</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
          </button>

          {showRoleDropdown && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Chuyển đổi góc nhìn vai trò
              </div>
              {(Object.keys(USER_ROLES) as UserRole[]).map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    setCurrentRole(r);
                    setShowRoleDropdown(false);
                  }}
                  className={cn(
                    'w-full text-left px-3 py-2 text-xs hover:bg-slate-50 transition flex items-start gap-2.5',
                    currentRole === r ? 'bg-blue-50/80 text-blue-900 font-semibold' : 'text-slate-700'
                  )}
                >
                  <span
                    className={cn(
                      'w-2 h-2 rounded-full mt-1.5 shrink-0',
                      currentRole === r ? 'bg-blue-600' : 'bg-slate-300'
                    )}
                  />
                  <div>
                    <div className="font-medium">{USER_ROLES[r].title}</div>
                    <div className="text-[11px] text-slate-500 line-clamp-1">{USER_ROLES[r].description}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications Icon & Popover */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowRoleDropdown(false);
              setShowQuickMenu(false);
            }}
            className="relative p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition"
            title="Cảnh báo & Rủi ro khẩn cấp"
          >
            <Bell className="w-4 h-4" />
            {totalNotifications > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                {totalNotifications}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 p-3 z-50">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs font-bold text-slate-800">
                <span>Cảnh báo dây chuyền ({totalNotifications})</span>
                <span className="text-[10px] text-rose-600 font-medium bg-rose-50 px-2 py-0.5 rounded">Rủi ro cao</span>
              </div>

              <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto text-xs py-1">
                {criticalIssues.map((iss) => (
                  <div key={iss.id} className="py-2.5">
                    <div className="flex items-center gap-1.5 text-rose-600 font-semibold text-[11px]">
                      <span>[Dừng chuyền] {iss.orderCode}</span>
                    </div>
                    <p className="text-slate-700 font-medium line-clamp-2 mt-0.5">{iss.title}</p>
                    <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
                      <span>Phụ trách: {iss.assignee}</span>
                      <span className="text-rose-600 font-bold">Chậm {iss.delayDaysImpact} ngày</span>
                    </div>
                  </div>
                ))}

                {materialAlerts.map((mat) => (
                  <div key={mat.id} className="py-2.5">
                    <div className="flex items-center gap-1.5 text-amber-600 font-semibold text-[11px]">
                      <span>[Thiếu vật tư] {mat.materialCode}</span>
                    </div>
                    <p className="text-slate-700 font-medium line-clamp-2 mt-0.5">{mat.materialName}</p>
                    <div className="text-[10px] text-slate-400 mt-1">
                      <span>Thiếu {mat.shortageQty} {mat.unit} ({mat.supplier || 'NCC'})</span>
                    </div>
                  </div>
                ))}

                {totalNotifications === 0 && (
                  <div className="py-4 text-center text-slate-400 text-xs">
                    Không có cảnh báo dừng chuyền nào. Hệ thống vận hành ổn định.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Quick Action Button with dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowQuickMenu(!showQuickMenu);
              setShowRoleDropdown(false);
              setShowNotifications(false);
            }}
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm shadow-blue-500/30 transition"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Tạo mới</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>

          {showQuickMenu && (
            <div className="absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50">
              <button
                onClick={() => {
                  onOpenCreateOrder();
                  setShowQuickMenu(false);
                }}
                className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-700 font-medium flex items-center gap-2.5"
              >
                <div className="w-6 h-6 rounded bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Layers className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-semibold">Đơn hàng khách (PO)</div>
                  <div className="text-[10px] text-slate-400">Xuất khẩu hoặc Trong nước</div>
                </div>
              </button>

              <button
                onClick={() => {
                  onOpenCreateMO();
                  setShowQuickMenu(false);
                }}
                className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-amber-50 hover:text-amber-700 font-medium flex items-center gap-2.5"
              >
                <div className="w-6 h-6 rounded bg-amber-100 text-amber-600 flex items-center justify-center">
                  <Factory className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-semibold">Lệnh sản xuất (MO)</div>
                  <div className="text-[10px] text-slate-400">Gán cho THCK / TBCD / NMK</div>
                </div>
              </button>

              <button
                onClick={() => {
                  onOpenCreateIO();
                  setShowQuickMenu(false);
                }}
                className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 font-medium flex items-center gap-2.5"
              >
                <div className="w-6 h-6 rounded bg-indigo-100 text-indigo-600 flex items-center justify-center">
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-semibold text-indigo-900">Đơn hàng nội bộ (IO)</div>
                  <div className="text-[10px] text-slate-400">Liên kết bắt buộc Đơn khách/LSX</div>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
