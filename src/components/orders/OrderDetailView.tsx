'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  CustomerOrder,
  OrderStatus,
  Factory,
  ORDER_STATUS_LABELS,
  EXPORT_MARKET_LABELS,
  DOMESTIC_REGION_LABELS,
  ExportMarket,
  DomesticRegion,
} from '@/types';
import { formatVND, formatDateVN, cn } from '@/lib/utils';
import {
  ArrowLeft,
  Calendar,
  Building2,
  FileText,
  Factory as FactoryIcon,
  Boxes,
  ShoppingCart,
  ArrowLeftRight,
  Truck,
  AlertTriangle,
  MessageSquare,
  History,
  Plus,
  CheckCircle2,
  Clock,
  Sparkles,
  Paperclip,
  ChevronRight,
  Edit,
  Save,
  Check,
  FileDown,
  Info,
} from 'lucide-react';

interface OrderDetailViewProps {
  orderId: string;
  onOpenCreateMO: (orderId: string) => void;
  onOpenCreateIO: (orderId: string) => void;
  onOpenCreateIssue: (orderId: string) => void;
}

export const OrderDetailView: React.FC<OrderDetailViewProps> = ({
  orderId,
  onOpenCreateMO,
  onOpenCreateIO,
  onOpenCreateIssue,
}) => {
  const {
    orders,
    updateOrder,
    manufacturingOrders,
    updateManufacturingOrder,
    internalOrders,
    updateInternalOrder,
    technicalDocs,
    addTechnicalDoc,
    updateTechnicalDoc,
    materials,
    addMaterialItem,
    updateMaterialItem,
    purchaseRequests,
    addPurchaseRequest,
    updatePurchaseRequest,
    issues,
    updateIssue,
    communications,
    addCommunication,
    deliveryBatches,
    addDeliveryBatch,
    updateDeliveryBatch,
    auditLogs,
    setActiveView,
    selectedDetailTab,
    setSelectedDetailTab,
  } = useApp();

  const order = orders.find((o) => o.id === orderId);

  // States for sub-forms
  const [showAddDocModal, setShowAddDocModal] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocCategory, setNewDocCategory] = useState<'BAN_VE' | 'BOM' | 'QUY_TRINH_CN' | 'TIEU_CHUAN_KCS'>('BAN_VE');
  const [newDocVersion, setNewDocVersion] = useState('v1.0');

  const [showAddMaterialModal, setShowAddMaterialModal] = useState(false);
  const [newMatName, setNewMatName] = useState('');
  const [newMatSpec, setNewMatSpec] = useState('');
  const [newMatUnit, setNewMatUnit] = useState('Kg');
  const [newMatReqQty, setNewMatReqQty] = useState(100);
  const [newMatStockQty, setNewMatStockQty] = useState(50);

  const [showAddPRModal, setShowAddPRModal] = useState(false);
  const [newPRSummary, setNewPRSummary] = useState('');
  const [newPRFactory, setNewPRFactory] = useState<Factory>('THCK');
  const [newPRSupplier, setNewPRSupplier] = useState('');
  const [newPRExpectedDate, setNewPRExpectedDate] = useState(
    new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );

  const [showAddCommModal, setShowAddCommModal] = useState(false);
  const [newCommContact, setNewCommContact] = useState('');
  const [newCommSubject, setNewCommSubject] = useState('');
  const [newCommSummary, setNewCommSummary] = useState('');
  const [newCommChannel, setNewCommChannel] = useState<'EMAIL' | 'HOP_ONLINE' | 'GAP_TRUC_TIEP' | 'DIEN_THOAI'>('EMAIL');

  const [isEditingProgress, setIsEditingProgress] = useState(false);
  const [editingProgressValue, setEditingProgressValue] = useState<number>(order ? order.progressPercent : 0);

  if (!order) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-500 text-sm">Không tìm thấy thông tin đơn hàng này.</p>
        <button
          onClick={() => setActiveView('orders')}
          className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold"
        >
          Quay lại danh sách
        </button>
      </div>
    );
  }

  // Filter linked data
  const linkedMOs = manufacturingOrders.filter((m) => m.orderId === order.id);
  const linkedIOs = internalOrders.filter((io) => io.customerOrderId === order.id);
  const linkedDocs = technicalDocs.filter((d) => d.orderId === order.id);
  const linkedMaterials = materials.filter((m) => m.orderId === order.id);
  const linkedPRs = purchaseRequests.filter((pr) => pr.orderId === order.id);
  const linkedIssues = issues.filter((i) => i.orderId === order.id);
  const linkedCommunications = communications.filter((c) => c.orderId === order.id);
  const linkedDeliveries = deliveryBatches.filter((d) => d.orderId === order.id);
  const linkedLogs = auditLogs.filter((l) => l.orderId === order.id);

  // Status sequence for pipeline
  const STAGES: OrderStatus[] = [
    'TIEP_NHAN_PO',
    'CHUAN_BI_KT_VAT_TU',
    'DANG_SAN_XUAT',
    'NGHIEM_THU_DONG_GOI',
    'DANG_GIAO_HANG',
    'HOAN_THANH',
  ];

  const currentStageIndex = STAGES.indexOf(order.status === 'TAM_DUNG_TRE_HAN' ? 'DANG_SAN_XUAT' : order.status);

  const tabs = [
    { id: 'overview', label: 'Tổng quan', count: null },
    { id: 'docs', label: 'Hồ sơ kỹ thuật & BOM', count: linkedDocs.length },
    { id: 'manufacturing', label: 'Lệnh sản xuất (MO)', count: linkedMOs.length },
    { id: 'materials', label: 'Vật tư & Tồn kho', count: linkedMaterials.length },
    { id: 'pr', label: 'Đề nghị mua (PR)', count: linkedPRs.length },
    {
      id: 'internal-orders',
      label: 'Đơn hàng nội bộ (IO)',
      count: linkedIOs.length,
      highlight: linkedIOs.some((io) => io.status === 'CHAM_TRE'),
    },
    { id: 'deliveries', label: 'Kế hoạch giao hàng', count: linkedDeliveries.length },
    {
      id: 'issues',
      label: 'Bất cập & Rủi ro',
      count: linkedIssues.filter((i) => i.status !== 'DONG').length,
      badgeColor: linkedIssues.some((i) => i.severity === 'NGHIEM_TRONG_DUNG_CHUYEN' && i.status !== 'DONG')
        ? 'bg-red-500 text-white'
        : undefined,
    },
    { id: 'communications', label: 'Trao đổi khách hàng', count: linkedCommunications.length },
    { id: 'audit', label: 'Nhật ký thay đổi (Audit)', count: linkedLogs.length },
  ];

  const handleSaveProgress = () => {
    updateOrder(order.id, { progressPercent: Number(editingProgressValue) });
    setIsEditingProgress(false);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Back button & Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setActiveView('orders')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại danh sách Đơn hàng</span>
        </button>

        <div className="text-xs text-slate-400">
          <span>{order.orderType === 'XUAT_KHAU' ? 'Xuất khẩu' : 'Trong nước'}</span>
          <span className="mx-1.5">/</span>
          <span className="text-slate-600 font-medium">
            {order.orderType === 'XUAT_KHAU'
              ? EXPORT_MARKET_LABELS[order.market as ExportMarket] || 'Mỹ'
              : DOMESTIC_REGION_LABELS[order.region as DomesticRegion] || 'Miền'}
          </span>
          <span className="mx-1.5">/</span>
          <span className="text-slate-900 font-bold">{order.orderCode}</span>
        </div>
      </div>

      {/* Main Order Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-xl font-black text-slate-900 tracking-tight">{order.orderCode}</span>
              <span
                className={cn(
                  'text-xs font-bold px-2 py-0.5 rounded-full border',
                  ORDER_STATUS_LABELS[order.status].badgeClass
                )}
              >
                {ORDER_STATUS_LABELS[order.status].label}
              </span>
              <span
                className={cn(
                  'text-xs font-bold px-2 py-0.5 rounded',
                  order.primaryFactory === 'THCK'
                    ? 'bg-amber-100 text-amber-900'
                    : order.primaryFactory === 'TBCD'
                    ? 'bg-cyan-100 text-cyan-900'
                    : 'bg-purple-100 text-purple-900'
                )}
              >
                NM Chủ trì: {order.primaryFactory}
              </span>

              {order.priority === 'KHAN_CAP' && (
                <span className="text-[11px] bg-rose-500 text-white font-bold px-2 py-0.5 rounded-full animate-pulse">
                  Khẩn cấp
                </span>
              )}
            </div>

            <h1 className="text-lg font-bold text-blue-900">{order.projectName}</h1>
            <p className="text-xs text-slate-500">
              Khách hàng: <b className="text-slate-800">{order.customerName}</b> ({order.customerCode || 'N/A'})
            </p>
          </div>

          {/* Key figures */}
          <div className="flex items-center gap-6 bg-slate-50 p-4 rounded-xl border border-slate-100 shrink-0">
            <div>
              <div className="text-[11px] text-slate-400 font-medium">Quy mô đơn hàng</div>
              <div className="text-base font-bold text-slate-900">
                {order.totalQuantity} <span className="text-xs font-normal text-slate-500">{order.unit}</span>
              </div>
            </div>

            <div className="border-l border-slate-200 pl-6">
              <div className="text-[11px] text-slate-400 font-medium">Tổng giá trị</div>
              <div className="text-base font-bold text-blue-700">{formatVND(order.totalValue)}</div>
            </div>

            <div className="border-l border-slate-200 pl-6">
              <div className="text-[11px] text-slate-400 font-medium">Hạn giao hàng</div>
              <div
                className={cn(
                  'text-base font-bold',
                  order.status === 'TAM_DUNG_TRE_HAN' ? 'text-rose-600' : 'text-slate-900'
                )}
              >
                {formatDateVN(order.deliveryDeadline)}
              </div>
            </div>
          </div>
        </div>

        {/* Multi-stage Progress Stepper / Pipeline */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
              Quy trình Vòng đời Đơn hàng & Tiến độ
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-blue-700">Tiến độ thực tế: {order.progressPercent}%</span>
              {!isEditingProgress ? (
                <button
                  onClick={() => {
                    setIsEditingProgress(true);
                    setEditingProgressValue(order.progressPercent);
                  }}
                  className="text-slate-400 hover:text-blue-600 p-1"
                  title="Chỉnh sửa tiến độ"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
              ) : (
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={editingProgressValue}
                    onChange={(e) => setEditingProgressValue(Number(e.target.value))}
                    className="w-16 py-0.5 px-1 border border-blue-400 rounded text-xs text-center font-bold"
                  />
                  <button
                    onClick={handleSaveProgress}
                    className="p-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs"
                    title="Lưu"
                  >
                    <Check className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Stepper Pipeline */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {STAGES.map((st, idx) => {
              const meta = ORDER_STATUS_LABELS[st];
              const isPast = idx < currentStageIndex;
              const isCurrent = idx === currentStageIndex;

              return (
                <button
                  key={st}
                  onClick={() => updateOrder(order.id, { status: st })}
                  className={cn(
                    'p-2.5 rounded-xl border text-left transition relative overflow-hidden group',
                    isCurrent
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : isPast
                      ? 'bg-blue-50/70 border-blue-200 text-blue-900'
                      : 'bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100'
                  )}
                >
                  <div className="flex items-center justify-between text-[11px] font-bold mb-1">
                    <span>Giai đoạn {idx + 1}</span>
                    {isPast && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
                    {isCurrent && <Clock className="w-3.5 h-3.5 text-white animate-spin" />}
                  </div>
                  <div className={cn('text-xs font-semibold truncate', isCurrent ? 'text-white' : '')}>
                    {meta.label}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Warning banner if delayed */}
          {order.status === 'TAM_DUNG_TRE_HAN' && (
            <div className="mt-3 p-3 bg-rose-50 border border-rose-300 rounded-xl flex items-center justify-between text-xs text-rose-800">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span className="font-semibold">
                  Đơn hàng đang ở trạng thái CẢNH BÁO TRỄ HẠN hoặc TẠM DỪNG: {order.notes || 'Cần tháo gỡ điểm nghẽn.'}
                </span>
              </div>
              <button
                onClick={() => setSelectedDetailTab('issues')}
                className="font-bold underline text-rose-900 hover:text-rose-700"
              >
                Xem chi tiết bất cập
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-slate-200 bg-white rounded-t-xl px-4 pt-2 shadow-2xs">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {tabs.map((t) => {
            const isActive = selectedDetailTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setSelectedDetailTab(t.id)}
                className={cn(
                  'px-3.5 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition flex items-center gap-2',
                  isActive
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
                )}
              >
                <span>{t.label}</span>
                {t.count !== null && (
                  <span
                    className={cn(
                      'text-[10px] px-1.5 py-0.2 rounded-full font-bold',
                      isActive ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600',
                      t.badgeColor
                    )}
                  >
                    {t.count}
                  </span>
                )}
                {t.highlight && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Contents */}
      <div className="bg-white rounded-b-xl border border-slate-200 border-t-0 p-6 shadow-xs min-h-[400px]">
        {/* TAB 1: TỔNG QUAN */}
        {selectedDetailTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Box 1: Thông tin phân bổ */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  Chuỗi 3 Nhà Máy Tham Gia
                </h3>
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-slate-500">Nhà máy chủ trì chính:</span>
                    <div className="font-bold text-slate-900">{order.primaryFactory}</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Nhà máy phối hợp gia công:</span>
                    <div className="flex gap-1.5 mt-1">
                      {order.participatingFactories?.map((f) => (
                        <span key={f} className="px-2 py-0.5 rounded bg-white border border-slate-300 font-bold text-slate-700">
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500">Kỹ sư / Cán bộ phụ trách:</span>
                    <div className="font-semibold text-slate-800">{order.manager}</div>
                  </div>
                </div>
              </div>

              {/* Box 2: Hợp đồng & Pháp lý */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  Mốc Thời Gian Trọng Yếu
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Ngày tiếp nhận PO:</span>
                    <span className="font-semibold text-slate-800">{formatDateVN(order.poDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Hạn giao hàng theo HĐ:</span>
                    <span className="font-bold text-slate-900">{formatDateVN(order.deliveryDeadline)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Ngày giao thực tế:</span>
                    <span className="font-semibold text-emerald-600">{formatDateVN(order.actualDeliveryDate) || 'Chưa bàn giao'}</span>
                  </div>
                </div>
              </div>

              {/* Box 3: Ghi chú & Chỉ đạo */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
                  <Info className="w-4 h-4 text-amber-600" />
                  Chỉ Đạo Kế Hoạch & Lưu Ý
                </h3>
                <p className="text-xs text-slate-700 leading-relaxed italic">
                  "{order.notes || 'Không có chỉ đạo đặc biệt. Vận hành theo quy chuẩn chất lượng của Ban Kế hoạch Khối.'}"
                </p>
              </div>
            </div>

            {/* Chuỗi liên kết trực quan: PO -> MO -> IO */}
            <div className="p-5 bg-gradient-to-br from-slate-50 to-blue-50/40 rounded-xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    Bản Đồ Chuỗi Sản Xuất Phụ Thuộc (PO → MO → IO)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Mọi Lệnh sản xuất và Đơn nội bộ đều phản ánh trực tiếp tiến độ lên đơn hàng khách
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Cấp 1: Đơn khách */}
                <div className="bg-white p-3.5 rounded-xl border border-blue-200 shadow-2xs">
                  <span className="text-[10px] font-bold text-blue-600 uppercase">Cấp 1: Đơn Khách Hàng (PO)</span>
                  <div className="font-bold text-slate-900 text-sm mt-1">{order.orderCode}</div>
                  <p className="text-xs text-slate-600 line-clamp-1">{order.customerName}</p>
                  <div className="mt-2 text-xs font-bold text-blue-700">Tiến độ tổng: {order.progressPercent}%</div>
                </div>

                {/* Cấp 2: Lệnh sản xuất */}
                <div className="bg-white p-3.5 rounded-xl border border-amber-200 shadow-2xs">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-amber-600 uppercase">Cấp 2: Lệnh Sản Xuất ({linkedMOs.length} MO)</span>
                    <button
                      onClick={() => onOpenCreateMO(order.id)}
                      className="text-[10px] font-bold text-amber-700 hover:underline"
                    >
                      + Thêm MO
                    </button>
                  </div>
                  <div className="mt-1 space-y-1.5 max-h-24 overflow-y-auto text-xs">
                    {linkedMOs.map((mo) => (
                      <div key={mo.id} className="flex justify-between items-center text-[11px] bg-amber-50/60 p-1.5 rounded">
                        <span className="font-bold text-amber-900">[{mo.factory}] {mo.moCode}</span>
                        <span className="font-semibold text-slate-700">{mo.progressPercent}%</span>
                      </div>
                    ))}
                    {linkedMOs.length === 0 && <span className="text-slate-400 italic text-[11px]">Chưa phát hành MO</span>}
                  </div>
                </div>

                {/* Cấp 3: Đơn hàng nội bộ */}
                <div className="bg-white p-3.5 rounded-xl border border-indigo-200 shadow-2xs">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-indigo-600 uppercase">Cấp 3: Đơn Nội Bộ ({linkedIOs.length} IO)</span>
                    <button
                      onClick={() => onOpenCreateIO(order.id)}
                      className="text-[10px] font-bold text-indigo-700 hover:underline"
                    >
                      + Thêm IO
                    </button>
                  </div>
                  <div className="mt-1 space-y-1.5 max-h-24 overflow-y-auto text-xs">
                    {linkedIOs.map((io) => (
                      <div key={io.id} className="flex justify-between items-center text-[11px] bg-indigo-50/60 p-1.5 rounded">
                        <span className="font-bold text-indigo-900">{io.sourceFactory} ➔ {io.targetFactory}</span>
                        <span className={cn('font-semibold', io.status === 'CHAM_TRE' ? 'text-rose-600' : 'text-slate-700')}>
                          {io.progressPercent}%
                        </span>
                      </div>
                    ))}
                    {linkedIOs.length === 0 && <span className="text-slate-400 italic text-[11px]">Chưa phát sinh IO</span>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: HỒ SƠ KỸ THUẬT & BOM */}
        {selectedDetailTab === 'docs' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Hồ Sơ Bản Vẽ & Định Mức Kỹ Thuật (BOM)</h3>
                <p className="text-xs text-slate-500">Quản lý phiên bản (v1.0, v1.1...), người duyệt và file đính kèm</p>
              </div>
              <button
                onClick={() => setShowAddDocModal(true)}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm Hồ Sơ Kỹ Thuật</span>
              </button>
            </div>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
              {linkedDocs.map((doc) => (
                <div key={doc.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-blue-700">{doc.docCode}</span>
                      <span className="px-2 py-0.2 rounded-full bg-slate-100 text-slate-800 text-[10px] font-bold">
                        {doc.version}
                      </span>
                      <span
                        className={cn(
                          'text-[10px] font-bold px-2 py-0.2 rounded',
                          doc.status === 'DA_PHE_DUYET'
                            ? 'bg-emerald-100 text-emerald-800'
                            : doc.status === 'CHO_DUYET'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-600'
                        )}
                      >
                        {doc.status === 'DA_PHE_DUYET'
                          ? 'Đã Phê Duyệt'
                          : doc.status === 'CHO_DUYET'
                          ? 'Chờ Duyệt'
                          : 'Dự Thảo'}
                      </span>
                    </div>
                    <div className="font-semibold text-xs text-slate-800">{doc.title}</div>
                    <div className="text-[11px] text-slate-500">
                      Người duyệt: <b className="text-slate-700">{doc.approver || 'Chưa phân bổ'}</b> • File:{' '}
                      <span className="text-blue-600 underline cursor-pointer">{doc.fileName}</span>
                    </div>
                    {doc.changeLog && (
                      <div className="text-[11px] text-slate-600 bg-slate-100/70 p-1.5 rounded mt-1">
                        <b>Nhật ký thay đổi:</b> {doc.changeLog}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {doc.status !== 'DA_PHE_DUYET' && (
                      <button
                        onClick={() =>
                          updateTechnicalDoc(doc.id, {
                            status: 'DA_PHE_DUYET',
                            approver: 'Ban Kỹ thuật Khối',
                            approvedDate: new Date().toISOString().split('T')[0],
                          })
                        }
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold"
                      >
                        Phê duyệt
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {linkedDocs.length === 0 && (
                <div className="p-8 text-center text-slate-400 text-xs">
                  Chưa có tài liệu kỹ thuật nào được đăng ký cho đơn hàng này.
                </div>
              )}
            </div>

            {/* Sub-modal: Thêm tài liệu kỹ thuật */}
            {showAddDocModal && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-300 space-y-3">
                <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                  <span>Thêm Hồ Sơ Kỹ Thuật Mới</span>
                  <button onClick={() => setShowAddDocModal(false)} className="text-slate-400 hover:text-slate-600">×</button>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <input
                      type="text"
                      placeholder="Tiêu đề bản vẽ / BOM..."
                      value={newDocTitle}
                      onChange={(e) => setNewDocTitle(e.target.value)}
                      className="w-full py-1.5 px-3 border border-slate-300 rounded text-xs"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Phiên bản (vd: v1.0)"
                      value={newDocVersion}
                      onChange={(e) => setNewDocVersion(e.target.value)}
                      className="w-full py-1.5 px-3 border border-slate-300 rounded text-xs"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowAddDocModal(false)}
                    className="px-3 py-1 text-xs text-slate-600"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={() => {
                      if (!newDocTitle) return;
                      addTechnicalDoc({
                        orderId: order.id,
                        title: newDocTitle,
                        version: newDocVersion,
                        status: 'CHO_DUYET',
                        category: newDocCategory,
                        approver: 'Phòng Kỹ thuật R&D',
                        fileName: `${newDocTitle.replace(/\s+/g, '_')}_${newDocVersion}.pdf`,
                      });
                      setNewDocTitle('');
                      setShowAddDocModal(false);
                    }}
                    className="px-4 py-1 bg-blue-600 text-white rounded text-xs font-semibold"
                  >
                    Lưu Hồ Sơ
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: LỆNH SẢN XUẤT (MO) */}
        {selectedDetailTab === 'manufacturing' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Lệnh Sản Xuất Thuộc Đơn Hàng</h3>
                <p className="text-xs text-slate-500">Phân bổ trực tiếp cho các nhà máy: THCK, TBCD hoặc NMK</p>
              </div>
              <button
                onClick={() => onOpenCreateMO(order.id)}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Phát Hành Lệnh Sản Xuất</span>
              </button>
            </div>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
              {linkedMOs.map((mo) => (
                <div key={mo.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-amber-800">{mo.moCode}</span>
                      <span
                        className={cn(
                          'text-[10px] font-bold px-2 py-0.2 rounded',
                          mo.factory === 'THCK'
                            ? 'bg-amber-100 text-amber-900'
                            : mo.factory === 'TBCD'
                            ? 'bg-cyan-100 text-cyan-900'
                            : 'bg-purple-100 text-purple-900'
                        )}
                      >
                        {mo.factory}
                      </span>
                      <span className="text-slate-400">•</span>
                      <span className="text-xs font-semibold text-slate-700">
                        {mo.quantity} {mo.unit}
                      </span>
                    </div>
                    <div className="font-semibold text-xs text-slate-900">{mo.productPartName}</div>
                    <div className="text-[11px] text-slate-500">
                      Thời gian: {formatDateVN(mo.startDate)} ➔ {formatDateVN(mo.targetEndDate)} • Phụ trách:{' '}
                      <b className="text-slate-700">{mo.leadEngineer}</b> ({mo.workstation})
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <div className="text-xs font-bold text-slate-800">{mo.progressPercent}%</div>
                      <div className="w-20 bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
                        <div
                          className="bg-amber-500 h-1.5 rounded-full"
                          style={{ width: `${mo.progressPercent}%` }}
                        />
                      </div>
                    </div>

                    <select
                      value={mo.status}
                      onChange={(e) => updateManufacturingOrder(mo.id, { status: e.target.value as any })}
                      className="py-1 px-2 border border-slate-300 rounded text-xs font-semibold"
                    >
                      <option value="CHUA_BAT_DAU">Chưa bắt đầu</option>
                      <option value="DANG_GIAO_CONG">Đang gia công</option>
                      <option value="KIEM_TRA_KCS">Kiểm tra KCS</option>
                      <option value="HOAN_THANH">Hoàn thành</option>
                      <option value="TRE_HAN">Trễ hạn</option>
                    </select>
                  </div>
                </div>
              ))}

              {linkedMOs.length === 0 && (
                <div className="p-8 text-center text-slate-400 text-xs">
                  Chưa có Lệnh sản xuất nào được phân bổ cho đơn hàng này.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: VẬT TƯ & TỒN KHO */}
        {selectedDetailTab === 'materials' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Danh Mục Vật Tư Cần Thiết (BOM) & Tồn Kho</h3>
                <p className="text-xs text-slate-500">
                  Cảnh báo sớm vật tư còn thiếu ảnh hưởng trực tiếp đến dây chuyền sản xuất
                </p>
              </div>
              <button
                onClick={() => setShowAddMaterialModal(true)}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm Vật Tư</span>
              </button>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Mã VT</th>
                    <th className="py-2.5 px-3">Tên Vật Tư & Quy Cách</th>
                    <th className="py-2.5 px-2 text-center">ĐVT</th>
                    <th className="py-2.5 px-3 text-right">Cần</th>
                    <th className="py-2.5 px-3 text-right">Sẵn Kho</th>
                    <th className="py-2.5 px-3 text-right">Đã Về</th>
                    <th className="py-2.5 px-3 text-right">Còn Thiếu</th>
                    <th className="py-2.5 px-3">Tình Trạng</th>
                    <th className="py-2.5 px-3">Nhà Cung Cấp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {linkedMaterials.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-bold text-slate-900">{m.materialCode}</td>
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-slate-900">{m.materialName}</div>
                        <div className="text-[11px] text-slate-500">{m.specifications}</div>
                      </td>
                      <td className="py-2.5 px-2 text-center text-slate-600 font-medium">{m.unit}</td>
                      <td className="py-2.5 px-3 text-right font-bold">{m.requiredQty}</td>
                      <td className="py-2.5 px-3 text-right text-slate-600">{m.availableStock}</td>
                      <td className="py-2.5 px-3 text-right text-slate-600">{m.arrivedQty}</td>
                      <td className="py-2.5 px-3 text-right font-black">
                        <span className={m.shortageQty > 0 ? 'text-rose-600' : 'text-emerald-600'}>
                          {m.shortageQty}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
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
                      <td className="py-2.5 px-3 text-[11px] text-slate-600">
                        {m.supplier || 'Chưa chốt NCC'}
                      </td>
                    </tr>
                  ))}
                  {linkedMaterials.length === 0 && (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-slate-400">
                        Chưa có dữ liệu vật tư cho đơn hàng này.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Sub-modal: Thêm vật tư */}
            {showAddMaterialModal && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-300 space-y-3">
                <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                  <span>Thêm Vật Tư Cần Thiết Mới</span>
                  <button onClick={() => setShowAddMaterialModal(false)} className="text-slate-400 hover:text-slate-600">×</button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Tên vật tư..."
                    value={newMatName}
                    onChange={(e) => setNewMatName(e.target.value)}
                    className="py-1.5 px-3 border border-slate-300 rounded text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Quy cách / tiêu chuẩn..."
                    value={newMatSpec}
                    onChange={(e) => setNewMatSpec(e.target.value)}
                    className="py-1.5 px-3 border border-slate-300 rounded text-xs"
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] text-slate-500 block">Số lượng cần</label>
                    <input
                      type="number"
                      value={newMatReqQty}
                      onChange={(e) => setNewMatReqQty(Number(e.target.value))}
                      className="w-full py-1.5 px-3 border border-slate-300 rounded text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block">Sẵn kho</label>
                    <input
                      type="number"
                      value={newMatStockQty}
                      onChange={(e) => setNewMatStockQty(Number(e.target.value))}
                      className="w-full py-1.5 px-3 border border-slate-300 rounded text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block">Đơn vị</label>
                    <input
                      type="text"
                      value={newMatUnit}
                      onChange={(e) => setNewMatUnit(e.target.value)}
                      className="w-full py-1.5 px-3 border border-slate-300 rounded text-xs"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowAddMaterialModal(false)}
                    className="px-3 py-1 text-xs text-slate-600"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={() => {
                      if (!newMatName) return;
                      addMaterialItem({
                        orderId: order.id,
                        materialName: newMatName,
                        specifications: newMatSpec,
                        unit: newMatUnit,
                        requiredQty: newMatReqQty,
                        availableStock: newMatStockQty,
                      });
                      setNewMatName('');
                      setShowAddMaterialModal(false);
                    }}
                    className="px-4 py-1 bg-blue-600 text-white rounded text-xs font-semibold"
                  >
                    Lưu Vật Tư
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: ĐỀ NGHỊ MUA (PR) */}
        {selectedDetailTab === 'pr' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Đề Nghị Mua Hàng & Vật Tư (Purchase Request - PR)</h3>
                <p className="text-xs text-slate-500">Liên kết chặt chẽ với tình trạng vật tư cần bù thiếu</p>
              </div>
              <button
                onClick={() => setShowAddPRModal(true)}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Lập Đề Nghị Mua (PR)</span>
              </button>
            </div>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
              {linkedPRs.map((pr) => (
                <div key={pr.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-emerald-800">{pr.prCode}</span>
                      <span className="text-slate-400">•</span>
                      <span className="text-xs font-semibold text-slate-700">NM: {pr.factory}</span>
                      <span className="text-slate-400">•</span>
                      <span className="text-[11px] text-slate-500">Ngày yêu cầu: {formatDateVN(pr.requestDate)}</span>
                    </div>
                    <div className="font-semibold text-xs text-slate-900">{pr.itemsSummary}</div>
                    <div className="text-[11px] text-slate-500">
                      Nhà cung ứng: <b className="text-slate-700">{pr.supplier}</b> • Ngày hàng về dự kiến:{' '}
                      <b className="text-blue-700">{formatDateVN(pr.expectedArrivalDate)}</b>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <select
                      value={pr.status}
                      onChange={(e) => updatePurchaseRequest(pr.id, { status: e.target.value as any })}
                      className="py-1 px-2 border border-slate-300 rounded text-xs font-semibold"
                    >
                      <option value="CHO_DUYET">Chờ duyệt</option>
                      <option value="DA_DUYET_PO">Đã duyệt PO mua</option>
                      <option value="DANG_GIAO">Đang giao</option>
                      <option value="DA_NHAP_KHO">Đã nhập kho</option>
                      <option value="TRE_HAN">Trễ hạn</option>
                    </select>
                  </div>
                </div>
              ))}

              {linkedPRs.length === 0 && (
                <div className="p-8 text-center text-slate-400 text-xs">
                  Chưa có đề nghị mua hàng nào cho đơn này.
                </div>
              )}
            </div>

            {/* Sub-modal: Thêm PR */}
            {showAddPRModal && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-300 space-y-3">
                <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                  <span>Lập Đề Nghị Mua Hàng Mới</span>
                  <button onClick={() => setShowAddPRModal(false)} className="text-slate-400 hover:text-slate-600">×</button>
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Mô tả danh mục vật tư cần mua..."
                    value={newPRSummary}
                    onChange={(e) => setNewPRSummary(e.target.value)}
                    className="w-full py-1.5 px-3 border border-slate-300 rounded text-xs"
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] text-slate-500 block">Nhà máy đề nghị</label>
                    <select
                      value={newPRFactory}
                      onChange={(e) => setNewPRFactory(e.target.value as Factory)}
                      className="w-full py-1.5 px-2 border border-slate-300 rounded text-xs font-bold"
                    >
                      <option value="THCK">THCK</option>
                      <option value="TBCD">TBCD</option>
                      <option value="NMK">NMK</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block">Nhà cung ứng</label>
                    <input
                      type="text"
                      placeholder="Tên NCC..."
                      value={newPRSupplier}
                      onChange={(e) => setNewPRSupplier(e.target.value)}
                      className="w-full py-1.5 px-3 border border-slate-300 rounded text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block">Hạn hàng về</label>
                    <input
                      type="date"
                      value={newPRExpectedDate}
                      onChange={(e) => setNewPRExpectedDate(e.target.value)}
                      className="w-full py-1.5 px-2 border border-slate-300 rounded text-xs"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowAddPRModal(false)}
                    className="px-3 py-1 text-xs text-slate-600"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={() => {
                      if (!newPRSummary) return;
                      addPurchaseRequest({
                        orderId: order.id,
                        itemsSummary: newPRSummary,
                        factory: newPRFactory,
                        supplier: newPRSupplier || 'Nhà cung ứng',
                        expectedArrivalDate: newPRExpectedDate,
                        status: 'CHO_DUYET',
                      });
                      setNewPRSummary('');
                      setShowAddPRModal(false);
                    }}
                    className="px-4 py-1 bg-emerald-600 text-white rounded text-xs font-semibold"
                  >
                    Lưu Đề Nghị Mua
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 6: ĐƠN HÀNG NỘI BỘ (IO) */}
        {selectedDetailTab === 'internal-orders' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Đơn Hàng Nội Bộ Liên Quan (Gia công phối hợp giữa 3 Nhà Máy)
                </h3>
                <p className="text-xs text-slate-500">
                  Liên kết chặt chẽ với đơn hàng khách và lệnh sản xuất để thấy toàn bộ chuỗi phụ thuộc
                </p>
              </div>
              <button
                onClick={() => onOpenCreateIO(order.id)}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tạo Đơn Nội Bộ Mới</span>
              </button>
            </div>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
              {linkedIOs.map((io) => (
                <div key={io.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-indigo-800">{io.ioCode}</span>
                      <div className="flex items-center gap-1 font-bold text-xs">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700">{io.sourceFactory}</span>
                        <span className="text-slate-400">➔</span>
                        <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">{io.targetFactory}</span>
                      </div>
                      <span className="text-slate-400">•</span>
                      <span className="text-xs font-semibold text-slate-700">
                        {io.quantity} {io.unit}
                      </span>
                    </div>

                    <div className="font-semibold text-xs text-slate-900">{io.itemDescription}</div>
                    <div className="text-[11px] text-slate-500">
                      Hạn giao: <b className="text-slate-800">{formatDateVN(io.requiredDate)}</b> • Kỹ sư:{' '}
                      <b className="text-slate-700">{io.contactPerson}</b>
                    </div>
                    {io.impactOnCustomerOrder && (
                      <div className="text-[11px] text-indigo-700 bg-indigo-50/60 p-1 rounded inline-block">
                        Ảnh hưởng: {io.impactOnCustomerOrder}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <div className="text-xs font-bold text-slate-800">{io.progressPercent}%</div>
                      <div className="w-20 bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
                        <div
                          className="bg-indigo-600 h-1.5 rounded-full"
                          style={{ width: `${io.progressPercent}%` }}
                        />
                      </div>
                    </div>

                    <select
                      value={io.status}
                      onChange={(e) => updateInternalOrder(io.id, { status: e.target.value as any })}
                      className="py-1 px-2 border border-slate-300 rounded text-xs font-semibold"
                    >
                      <option value="CHO_TIEP_NHAN">Chờ tiếp nhận</option>
                      <option value="DANG_SAN_XUAT">Đang sản xuất</option>
                      <option value="DA_GIAO_SANG_NM">Đã giao sang NM</option>
                      <option value="NGHIEM_THU_DAT">Nghiệm thu đạt</option>
                      <option value="CHAM_TRE">Chậm trễ</option>
                    </select>
                  </div>
                </div>
              ))}

              {linkedIOs.length === 0 && (
                <div className="p-8 text-center text-slate-400 text-xs">
                  Chưa có Đơn hàng nội bộ nào liên kết với đơn này.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 7: KẾ HOẠCH GIAO HÀNG */}
        {selectedDetailTab === 'deliveries' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Kế Hoạch & Các Đợt Bàn Giao Hàng</h3>
                <p className="text-xs text-slate-500">Chia theo đợt giao, địa điểm đích và tiến độ đóng gói vận tải</p>
              </div>
            </div>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
              {linkedDeliveries.map((del) => (
                <div key={del.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-blue-700">Đợt bàn giao #{del.batchNumber}</span>
                      <span className="text-slate-400">•</span>
                      <span className="font-bold text-xs text-slate-800">
                        {del.quantity} {order.unit}
                      </span>
                    </div>
                    <div className="text-xs text-slate-700">
                      Địa điểm đích: <b className="text-slate-900">{del.destination}</b>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Ngày kế hoạch: <b className="text-blue-700">{formatDateVN(del.plannedDate)}</b>
                      {del.trackingNumber && ` • Mã vận đơn: ${del.trackingNumber}`}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <select
                      value={del.status}
                      onChange={(e) => updateDeliveryBatch(del.id, { status: e.target.value as any })}
                      className="py-1 px-2 border border-slate-300 rounded text-xs font-semibold"
                    >
                      <option value="KE_HOACH">Kế hoạch</option>
                      <option value="DANG_DONG_GOI">Đang đóng gói</option>
                      <option value="DA_XUAT_KHO">Đã xuất kho</option>
                      <option value="DA_GIAO_THANH_CONG">Đã giao thành công</option>
                    </select>
                  </div>
                </div>
              ))}

              {linkedDeliveries.length === 0 && (
                <div className="p-8 text-center text-slate-400 text-xs">
                  Chưa lập các đợt giao hàng cho đơn này.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 8: BẤT CẬP & RỦI RO */}
        {selectedDetailTab === 'issues' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Bất Cập & Điểm Nghẽn Tiến Độ</h3>
                <p className="text-xs text-slate-500">Ghi nhận sự cố kỹ thuật, thiếu vật tư, hỏng máy, thay đổi khách hàng</p>
              </div>
              <button
                onClick={() => onOpenCreateIssue(order.id)}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Ghi Nhận Bất Cập Mới</span>
              </button>
            </div>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
              {linkedIssues.map((iss) => (
                <div key={iss.id} className="p-4 space-y-2 hover:bg-slate-50 transition">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-rose-700">{iss.issueCode}</span>
                        <span
                          className={cn(
                            'text-[10px] font-bold px-2 py-0.2 rounded',
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
                            ? 'Trung Bình'
                            : 'Thấp'}
                        </span>
                        <span className="text-slate-400">•</span>
                        <span className="text-xs font-semibold text-slate-600">
                          {iss.category.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <h4 className="font-bold text-xs text-slate-900">{iss.title}</h4>
                      <p className="text-xs text-slate-600">{iss.description}</p>
                      <div className="text-[11px] text-slate-500">
                        Cán bộ phụ trách: <b className="text-slate-800">{iss.assignee}</b> • Ngày báo:{' '}
                        {formatDateVN(iss.reportedDate)} • Ảnh hưởng: <b className="text-rose-600">{iss.delayDaysImpact} ngày</b>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <select
                        value={iss.status}
                        onChange={(e) => updateIssue(iss.id, { status: e.target.value as any })}
                        className="py-1 px-2 border border-slate-300 rounded text-xs font-semibold"
                      >
                        <option value="MOI_GHI_NHAN">Mới ghi nhận</option>
                        <option value="DANG_XU_LY">Đang xử lý</option>
                        <option value="DA_KHAC_PHUC">Đã khắc phục</option>
                        <option value="DONG">Đóng bất cập</option>
                      </select>
                    </div>
                  </div>

                  {iss.solutionPlan && (
                    <div className="p-2.5 bg-blue-50/70 border border-blue-200 rounded-lg text-xs text-slate-800">
                      <span className="font-bold text-blue-900">Hướng giải quyết:</span> {iss.solutionPlan}
                    </div>
                  )}
                </div>
              ))}

              {linkedIssues.length === 0 && (
                <div className="p-8 text-center text-slate-400 text-xs">
                  Không có bất cập nào được ghi nhận cho đơn này.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 9: TRAO ĐỔI KHÁCH HÀNG (TIMELINE) */}
        {selectedDetailTab === 'communications' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Lịch Sử Trao Đổi Với Khách Hàng (Timeline)</h3>
                <p className="text-xs text-slate-500">Lưu vết biên bản họp, email trao đổi và các cam kết thay đổi</p>
              </div>
              <button
                onClick={() => setShowAddCommModal(true)}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Ghi Nhận Trao Đổi Mới</span>
              </button>
            </div>

            <div className="space-y-4 relative before:absolute before:inset-0 before:left-4 before:w-0.5 before:bg-slate-200">
              {linkedCommunications.map((comm) => (
                <div key={comm.id} className="relative flex items-start gap-4 ml-2">
                  <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 z-10 text-[10px] font-bold">
                    •
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex-1 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{comm.subject}</span>
                        <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.2 rounded font-bold">
                          {comm.channel}
                        </span>
                      </div>
                      <span className="text-slate-400 text-[11px]">{comm.datetime}</span>
                    </div>

                    <div className="text-xs text-slate-600">
                      Khách hàng: <b className="text-slate-800">{comm.contactPerson}</b> ⇄ Đại diện THACO:{' '}
                      <b className="text-slate-800">{comm.ourRepresentative}</b>
                    </div>

                    <p className="text-xs text-slate-700 bg-white p-2.5 rounded border border-slate-100 leading-relaxed">
                      {comm.summary}
                    </p>

                    {comm.actionItems && (
                      <div className="text-xs text-amber-800 bg-amber-50 p-2 rounded border border-amber-200">
                        <b>Action Items:</b> {comm.actionItems}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {linkedCommunications.length === 0 && (
                <div className="p-8 text-center text-slate-400 text-xs">
                  Chưa có lịch sử trao đổi nào với khách hàng được ghi nhận.
                </div>
              )}
            </div>

            {/* Sub-modal: Thêm trao đổi */}
            {showAddCommModal && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-300 space-y-3">
                <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                  <span>Ghi Nhận Trao Đổi Với Khách Hàng</span>
                  <button onClick={() => setShowAddCommModal(false)} className="text-slate-400 hover:text-slate-600">×</button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Chủ đề trao đổi..."
                    value={newCommSubject}
                    onChange={(e) => setNewCommSubject(e.target.value)}
                    className="py-1.5 px-3 border border-slate-300 rounded text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Người đại diện khách..."
                    value={newCommContact}
                    onChange={(e) => setNewCommContact(e.target.value)}
                    className="py-1.5 px-3 border border-slate-300 rounded text-xs"
                  />
                </div>
                <div>
                  <textarea
                    rows={2}
                    placeholder="Nội dung kết luận và thỏa thuận..."
                    value={newCommSummary}
                    onChange={(e) => setNewCommSummary(e.target.value)}
                    className="w-full py-1.5 px-3 border border-slate-300 rounded text-xs"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowAddCommModal(false)}
                    className="px-3 py-1 text-xs text-slate-600"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={() => {
                      if (!newCommSubject) return;
                      addCommunication({
                        orderId: order.id,
                        subject: newCommSubject,
                        contactPerson: newCommContact || 'Khách hàng',
                        summary: newCommSummary,
                        channel: newCommChannel,
                      });
                      setNewCommSubject('');
                      setNewCommSummary('');
                      setShowAddCommModal(false);
                    }}
                    className="px-4 py-1 bg-blue-600 text-white rounded text-xs font-semibold"
                  >
                    Lưu Trao Đổi
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 10: NHẬT KÝ THAY ĐỔI (AUDIT LOG) */}
        {selectedDetailTab === 'audit' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Nhật Ký Thay Đổi Dữ Liệu (Audit Trail)</h3>
              <p className="text-xs text-slate-500">
                Ghi nhận minh bạch: Ai làm gì, lúc nào, thay đổi trường gì từ giá trị A ➔ B
              </p>
            </div>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
              {linkedLogs.map((log) => (
                <div key={log.id} className="p-3 text-xs flex items-center justify-between hover:bg-slate-50">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{log.action}</span>
                      <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded font-medium">
                        {log.userRole}
                      </span>
                    </div>
                    {log.fieldChanged && (
                      <div className="text-[11px] text-slate-500">
                        Trường <code>{log.fieldChanged}</code>: <span className="line-through">{log.oldValue}</span> ➔{' '}
                        <b className="text-blue-600">{log.newValue}</b>
                      </div>
                    )}
                    <div className="text-[10px] text-slate-400">Thực hiện bởi: {log.userName}</div>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono shrink-0">{log.timestamp}</div>
                </div>
              ))}

              {linkedLogs.length === 0 && (
                <div className="p-8 text-center text-slate-400 text-xs">
                  Chưa có nhật ký thay đổi nào được ghi nhận cho đơn này.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
