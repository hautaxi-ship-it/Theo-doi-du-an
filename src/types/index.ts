export type Factory = 'THCK' | 'TBCD' | 'NMK';

export const FACTORY_NAMES: Record<Factory, string> = {
  THCK: 'Tổ hợp Cơ khí (THCK)',
  TBCD: 'Thiết bị Chuyên dụng (TBCD)',
  NMK: 'Nhà máy Khuôn (NMK)',
};

export type OrderType = 'XUAT_KHAU' | 'TRONG_NUOC';

export type ExportMarket = 'MY' | 'UC' | 'CHAU_AU' | 'CHAU_A_KHAC';
export type DomesticRegion = 'MIEN_NAM' | 'MIEN_BAC' | 'MIEN_TRUNG';

export const EXPORT_MARKET_LABELS: Record<ExportMarket, string> = {
  MY: 'Thị trường Mỹ (USA)',
  UC: 'Thị trường Úc (Australia)',
  CHAU_AU: 'Thị trường Châu Âu (EU)',
  CHAU_A_KHAC: 'Châu Á & Thị trường khác',
};

export const DOMESTIC_REGION_LABELS: Record<DomesticRegion, string> = {
  MIEN_NAM: 'Miền Nam',
  MIEN_BAC: 'Miền Bắc',
  MIEN_TRUNG: 'Miền Trung',
};

export type OrderStatus =
  | 'TIEP_NHAN_PO'
  | 'CHUAN_BI_KT_VAT_TU'
  | 'DANG_SAN_XUAT'
  | 'NGHIEM_THU_DONG_GOI'
  | 'DANG_GIAO_HANG'
  | 'HOAN_THANH'
  | 'TAM_DUNG_TRE_HAN';

export const ORDER_STATUS_LABELS: Record<OrderStatus, { label: string; color: string; badgeClass: string }> = {
  TIEP_NHAN_PO: { label: 'Tiếp nhận PO', color: 'blue', badgeClass: 'bg-blue-100 text-blue-800 border-blue-300' },
  CHUAN_BI_KT_VAT_TU: { label: 'Chuẩn bị KT & Vật tư', color: 'indigo', badgeClass: 'bg-indigo-100 text-indigo-800 border-indigo-300' },
  DANG_SAN_XUAT: { label: 'Đang sản xuất', color: 'amber', badgeClass: 'bg-amber-100 text-amber-800 border-amber-300' },
  NGHIEM_THU_DONG_GOI: { label: 'Nghiệm thu / Đóng gói', color: 'purple', badgeClass: 'bg-purple-100 text-purple-800 border-purple-300' },
  DANG_GIAO_HANG: { label: 'Đang giao hàng', color: 'cyan', badgeClass: 'bg-cyan-100 text-cyan-800 border-cyan-300' },
  HOAN_THANH: { label: 'Hoàn thành', color: 'emerald', badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  TAM_DUNG_TRE_HAN: { label: 'Chậm trễ / Cảnh báo', color: 'rose', badgeClass: 'bg-rose-100 text-rose-800 border-rose-300' },
};

export type Priority = 'BINH_THUONG' | 'CAO' | 'KHAN_CAP';

export interface CustomerOrder {
  id: string;
  orderCode: string; // VD: PO-US-2026-001
  customerName: string;
  customerCode?: string;
  projectName: string;
  orderType: OrderType;
  market?: ExportMarket;
  region?: DomesticRegion;
  poDate: string; // YYYY-MM-DD
  deliveryDeadline: string; // YYYY-MM-DD
  actualDeliveryDate?: string;
  status: OrderStatus;
  progressPercent: number; // 0-100
  primaryFactory: Factory;
  participatingFactories?: Factory[];
  manager: string; // Kỹ sư phụ trách
  totalQuantity: number;
  unit: string;
  totalValue: number; // VND
  currency: string;
  priority: Priority;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TechnicalDocument {
  id: string;
  orderId: string;
  docCode: string;
  title: string;
  category: 'BAN_VE' | 'BOM' | 'QUY_TRINH_CN' | 'TIEU_CHUAN_KCS' | 'KHAC';
  version: string; // e.g. "v1.0", "v1.2", "v2.0"
  status: 'DU_THAO' | 'CHO_DUYET' | 'DA_PHE_DUYET' | 'CAN_CHINH_SUA';
  approver?: string;
  approvedDate?: string;
  fileUrl?: string;
  fileName?: string;
  changeLog?: string;
  updatedAt: string;
}

export type MOStatus = 'CHUA_BAT_DAU' | 'DANG_GIAO_CONG' | 'KIEM_TRA_KCS' | 'HOAN_THANH' | 'TRE_HAN';

export interface ManufacturingOrder {
  id: string;
  orderId: string; // Khóa ngoại liên kết Đơn hàng khách
  orderCode: string;
  moCode: string; // VD: MO-THCK-2026-088
  factory: Factory; // THCK, TBCD, hoặc NMK
  productPartName: string; // Cụm chi tiết/kết cấu
  quantity: number;
  unit: string;
  startDate: string;
  targetEndDate: string;
  actualEndDate?: string;
  progressPercent: number;
  status: MOStatus;
  leadEngineer: string;
  workstation?: string; // Xưởng hàn, dập, sơn, lắp ráp...
  notes?: string;
}

export type IOStatus = 'CHO_TIEP_NHAN' | 'DANG_SAN_XUAT' | 'DA_GIAO_SANG_NM' | 'NGHIEM_THU_DAT' | 'CHAM_TRE';

export interface InternalOrder {
  id: string;
  ioCode: string; // VD: IO-2026-NMK-THCK-01
  sourceFactory: Factory; // Nhà máy phát sinh nhu cầu / đặt hàng
  targetFactory: Factory; // Nhà máy thực hiện gia công
  customerOrderId: string; // BẮT BUỘC: Đơn hàng khách gốc
  customerOrderCode: string;
  manufacturingOrderId?: string; // Tùy chọn: Lệnh sản xuất trực tiếp
  moCode?: string;
  itemDescription: string; // Chi tiết/Khuôn/Bộ phận cần gia công
  quantity: number;
  unit: string;
  requestDate: string;
  requiredDate: string; // Hạn cần giao sang NM bạn
  committedDate: string; // NM bạn cam kết giao
  actualDate?: string;
  status: IOStatus;
  progressPercent: number;
  urgencyLevel: Priority;
  impactOnCustomerOrder: string; // Ảnh hưởng nếu trễ
  contactPerson: string;
}

export interface MaterialItem {
  id: string;
  orderId: string;
  materialCode: string;
  materialName: string;
  specifications: string;
  unit: string;
  requiredQty: number;
  availableStock: number;
  requestedQty: number; // Đã lập PR
  arrivedQty: number; // Đã về kho
  shortageQty: number; // Còn thiếu = requiredQty - (availableStock + arrivedQty)
  status: 'DU_VAT_TU' | 'CHO_HANG_VE' | 'CANH_BAO_THIEU';
  leadTimeDays?: number;
  supplier?: string;
  expectedDate?: string;
}

export interface PurchaseRequest {
  id: string;
  orderId: string;
  prCode: string; // VD: PR-2026-042
  requestDate: string;
  itemsSummary: string;
  factory: Factory;
  requester: string;
  expectedArrivalDate: string;
  actualArrivalDate?: string;
  supplier: string;
  status: 'CHO_DUYET' | 'DA_DUYET_PO' | 'DANG_GIAO' | 'DA_NHAP_KHO' | 'TRE_HAN';
  totalCostEstimate?: number;
}

export interface Issue {
  id: string;
  orderId: string;
  orderCode: string;
  issueCode: string; // VD: ISS-2026-015
  title: string;
  description: string;
  severity: 'THAP' | 'TRUNG_BINH' | 'NGHIEM_TRONG_DUNG_CHUYEN';
  category: 'KY_THUAT_BAN_VE' | 'THIEU_VAT_TU' | 'LOI_GIA_CONG' | 'THIET_BI_HONG' | 'KHACH_HANG_THAY_DOI';
  relatedFactory?: Factory;
  assignee: string;
  solutionPlan?: string;
  reportedDate: string;
  resolvedDate?: string;
  status: 'MOI_GHI_NHAN' | 'DANG_XU_LY' | 'DA_KHAC_PHUC' | 'DONG';
  delayDaysImpact: number; // Số ngày ảnh hưởng
}

export interface CustomerCommunication {
  id: string;
  orderId: string;
  datetime: string;
  channel: 'EMAIL' | 'HOP_ONLINE' | 'GAP_TRUC_TIEP' | 'DIEN_THOAI' | 'ZALO_WHATSAPP';
  contactPerson: string;
  ourRepresentative: string;
  subject: string;
  summary: string;
  actionItems?: string;
  attachments?: string[];
}

export interface DeliveryBatch {
  id: string;
  orderId: string;
  batchNumber: number;
  plannedDate: string;
  actualDate?: string;
  quantity: number;
  destination: string;
  status: 'KE_HOACH' | 'DANG_DONG_GOI' | 'DA_XUAT_KHO' | 'DA_GIAO_THANH_CONG';
  trackingNumber?: string;
}

export interface AuditLogEntry {
  id: string;
  orderId: string;
  timestamp: string;
  userName: string;
  userRole: string;
  action: string;
  fieldChanged?: string;
  oldValue?: string;
  newValue?: string;
}

export type UserRole =
  | 'KE_HOACH_KHOI'
  | 'KY_THUAT'
  | 'MUA_HANG'
  | 'NHA_MAY_THCK'
  | 'NHA_MAY_TBCD'
  | 'NHA_MAY_NMK'
  | 'LANH_DAO';

export const USER_ROLES: Record<UserRole, { title: string; description: string; badge: string }> = {
  KE_HOACH_KHOI: {
    title: 'Ban Kế hoạch Khối',
    description: 'Toàn quyền điều phối đơn hàng, phân bổ nhà máy, lập tiến độ tổng thể',
    badge: 'bg-blue-600 text-white'
  },
  KY_THUAT: {
    title: 'Bộ phận Kỹ thuật & R&D',
    description: 'Quản lý bản vẽ, BOM, quy trình công nghệ, duyệt hồ sơ kỹ thuật',
    badge: 'bg-indigo-600 text-white'
  },
  MUA_HANG: {
    title: 'Phòng Cung ứng / Mua hàng',
    description: 'Quản lý đề nghị mua vật tư, theo dõi tiến độ hàng về',
    badge: 'bg-emerald-600 text-white'
  },
  NHA_MAY_THCK: {
    title: 'Nhà máy Tổ hợp Cơ khí (THCK)',
    description: 'Theo dõi LSX cơ khí kết cấu, tạo & nhận đơn nội bộ',
    badge: 'bg-amber-600 text-white'
  },
  NHA_MAY_TBCD: {
    title: 'Nhà máy TB Chuyên dụng (TBCD)',
    description: 'Theo dõi LSX thiết bị chuyên dùng, sơ mi rơ moóc, bồn...',
    badge: 'bg-teal-600 text-white'
  },
  NHA_MAY_NMK: {
    title: 'Nhà máy Khuôn (NMK)',
    description: 'Chế tạo khuôn mẫu, đồ gá, gia công chính xác phục vụ khối',
    badge: 'bg-purple-600 text-white'
  },
  LANH_DAO: {
    title: 'Ban Lãnh đạo Khối',
    description: 'Xem báo cáo tổng hợp, KPI, rủi ro và các điểm nghẽn chuỗi sản xuất',
    badge: 'bg-slate-800 text-white'
  },
};
