'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  CustomerOrder,
  ManufacturingOrder,
  InternalOrder,
  TechnicalDocument,
  MaterialItem,
  PurchaseRequest,
  Issue,
  CustomerCommunication,
  DeliveryBatch,
  AuditLogEntry,
  UserRole,
  Factory,
} from '@/types';
import {
  INITIAL_ORDERS,
  INITIAL_MANUFACTURING_ORDERS,
  INITIAL_INTERNAL_ORDERS,
  INITIAL_TECHNICAL_DOCS,
  INITIAL_MATERIALS,
  INITIAL_PURCHASE_REQUESTS,
  INITIAL_ISSUES,
  INITIAL_COMMUNICATIONS,
  INITIAL_DELIVERY_BATCHES,
  INITIAL_AUDIT_LOGS,
} from '@/lib/mock-data';
import { isFirebaseConfigured, getFirebaseServices } from '@/lib/firebase';

interface AppContextType {
  orders: CustomerOrder[];
  manufacturingOrders: ManufacturingOrder[];
  internalOrders: InternalOrder[];
  technicalDocs: TechnicalDocument[];
  materials: MaterialItem[];
  purchaseRequests: PurchaseRequest[];
  issues: Issue[];
  communications: CustomerCommunication[];
  deliveryBatches: DeliveryBatch[];
  auditLogs: AuditLogEntry[];
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  selectedOrderId: string | null;
  setSelectedOrderId: (id: string | null) => void;
  activeView: 'dashboard' | 'orders' | 'order-detail' | 'manufacturing' | 'internal-orders' | 'materials' | 'issues';
  setActiveView: (view: 'dashboard' | 'orders' | 'order-detail' | 'manufacturing' | 'internal-orders' | 'materials' | 'issues') => void;
  selectedDetailTab: string;
  setSelectedDetailTab: (tab: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isFirebaseActive: boolean;

  // Actions
  addOrder: (order: Partial<CustomerOrder>) => CustomerOrder;
  updateOrder: (id: string, updates: Partial<CustomerOrder>) => void;
  deleteOrder: (id: string) => void;

  addManufacturingOrder: (mo: Partial<ManufacturingOrder>) => ManufacturingOrder;
  updateManufacturingOrder: (id: string, updates: Partial<ManufacturingOrder>) => void;
  deleteManufacturingOrder: (id: string) => void;

  addInternalOrder: (io: Partial<InternalOrder>) => { success: boolean; error?: string; data?: InternalOrder };
  updateInternalOrder: (id: string, updates: Partial<InternalOrder>) => void;
  deleteInternalOrder: (id: string) => void;

  addTechnicalDoc: (doc: Partial<TechnicalDocument>) => void;
  updateTechnicalDoc: (id: string, updates: Partial<TechnicalDocument>) => void;

  addMaterialItem: (item: Partial<MaterialItem>) => void;
  updateMaterialItem: (id: string, updates: Partial<MaterialItem>) => void;

  addPurchaseRequest: (pr: Partial<PurchaseRequest>) => void;
  updatePurchaseRequest: (id: string, updates: Partial<PurchaseRequest>) => void;

  addIssue: (issue: Partial<Issue>) => void;
  updateIssue: (id: string, updates: Partial<Issue>) => void;

  addCommunication: (comm: Partial<CustomerCommunication>) => void;
  addDeliveryBatch: (batch: Partial<DeliveryBatch>) => void;
  updateDeliveryBatch: (id: string, updates: Partial<DeliveryBatch>) => void;

  resetToDefaultData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_PREFIX = 'thaco_mfg_v1_';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isFirebaseActive, setIsFirebaseActive] = useState<boolean>(false);
  const [currentRole, setCurrentRole] = useState<UserRole>('KE_HOACH_KHOI');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'dashboard' | 'orders' | 'order-detail' | 'manufacturing' | 'internal-orders' | 'materials' | 'issues'>('dashboard');
  const [selectedDetailTab, setSelectedDetailTab] = useState<string>('overview');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Domain states
  const [orders, setOrders] = useState<CustomerOrder[]>(INITIAL_ORDERS);
  const [manufacturingOrders, setManufacturingOrders] = useState<ManufacturingOrder[]>(INITIAL_MANUFACTURING_ORDERS);
  const [internalOrders, setInternalOrders] = useState<InternalOrder[]>(INITIAL_INTERNAL_ORDERS);
  const [technicalDocs, setTechnicalDocs] = useState<TechnicalDocument[]>(INITIAL_TECHNICAL_DOCS);
  const [materials, setMaterials] = useState<MaterialItem[]>(INITIAL_MATERIALS);
  const [purchaseRequests, setPurchaseRequests] = useState<PurchaseRequest[]>(INITIAL_PURCHASE_REQUESTS);
  const [issues, setIssues] = useState<Issue[]>(INITIAL_ISSUES);
  const [communications, setCommunications] = useState<CustomerCommunication[]>(INITIAL_COMMUNICATIONS);
  const [deliveryBatches, setDeliveryBatches] = useState<DeliveryBatch[]>(INITIAL_DELIVERY_BATCHES);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);

  // Load from localStorage or initialize with mock data
  useEffect(() => {
    setIsFirebaseActive(isFirebaseConfigured());

    if (typeof window !== 'undefined') {
      try {
        const storedOrders = localStorage.getItem(STORAGE_PREFIX + 'orders');
        if (storedOrders) setOrders(JSON.parse(storedOrders));

        const storedMO = localStorage.getItem(STORAGE_PREFIX + 'mo');
        if (storedMO) setManufacturingOrders(JSON.parse(storedMO));

        const storedIO = localStorage.getItem(STORAGE_PREFIX + 'io');
        if (storedIO) setInternalOrders(JSON.parse(storedIO));

        const storedDocs = localStorage.getItem(STORAGE_PREFIX + 'docs');
        if (storedDocs) setTechnicalDocs(JSON.parse(storedDocs));

        const storedMats = localStorage.getItem(STORAGE_PREFIX + 'mats');
        if (storedMats) setMaterials(JSON.parse(storedMats));

        const storedPR = localStorage.getItem(STORAGE_PREFIX + 'pr');
        if (storedPR) setPurchaseRequests(JSON.parse(storedPR));

        const storedIssues = localStorage.getItem(STORAGE_PREFIX + 'issues');
        if (storedIssues) setIssues(JSON.parse(storedIssues));

        const storedComm = localStorage.getItem(STORAGE_PREFIX + 'comm');
        if (storedComm) setCommunications(JSON.parse(storedComm));

        const storedDel = localStorage.getItem(STORAGE_PREFIX + 'del');
        if (storedDel) setDeliveryBatches(JSON.parse(storedDel));

        const storedLogs = localStorage.getItem(STORAGE_PREFIX + 'logs');
        if (storedLogs) setAuditLogs(JSON.parse(storedLogs));
      } catch (e) {
        console.error('Failed to parse localStorage data:', e);
      }
    }
  }, []);

  // Save changes to localStorage
  const persist = (key: string, data: any) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data));
      } catch (e) {
        console.error('Persist error', e);
      }
    }
  };

  const addAuditLog = (orderId: string, action: string, fieldChanged?: string, oldValue?: string, newValue?: string) => {
    const newLog: AuditLogEntry = {
      id: 'log-' + Date.now(),
      orderId,
      timestamp: new Date().toLocaleString('vi-VN'),
      userName: currentRole === 'KE_HOACH_KHOI' ? 'Quản trị Kế hoạch Khối' : `Kỹ sư phụ trách (${currentRole})`,
      userRole: currentRole,
      action,
      fieldChanged,
      oldValue,
      newValue,
    };
    setAuditLogs((prev) => {
      const updated = [newLog, ...prev];
      persist('logs', updated);
      return updated;
    });
  };

  const addOrder = (orderData: Partial<CustomerOrder>): CustomerOrder => {
    const newOrder: CustomerOrder = {
      id: 'ord-' + Date.now(),
      orderCode: orderData.orderCode || `PO-${Date.now().toString().slice(-4)}`,
      customerName: orderData.customerName || 'Khách hàng mới',
      projectName: orderData.projectName || 'Dự án mới',
      orderType: orderData.orderType || 'XUAT_KHAU',
      market: orderData.market,
      region: orderData.region,
      poDate: orderData.poDate || new Date().toISOString().split('T')[0],
      deliveryDeadline: orderData.deliveryDeadline || new Date().toISOString().split('T')[0],
      status: orderData.status || 'TIEP_NHAN_PO',
      progressPercent: orderData.progressPercent || 0,
      primaryFactory: orderData.primaryFactory || 'THCK',
      participatingFactories: orderData.participatingFactories || [orderData.primaryFactory || 'THCK'],
      manager: orderData.manager || 'Cán bộ Kế hoạch',
      totalQuantity: Number(orderData.totalQuantity) || 1,
      unit: orderData.unit || 'Bộ',
      totalValue: Number(orderData.totalValue) || 0,
      currency: 'VND',
      priority: orderData.priority || 'BINH_THUONG',
      notes: orderData.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setOrders((prev) => {
      const updated = [newOrder, ...prev];
      persist('orders', updated);
      return updated;
    });

    addAuditLog(newOrder.id, `Tạo mới đơn hàng khách: ${newOrder.orderCode}`);
    return newOrder;
  };

  const updateOrder = (id: string, updates: Partial<CustomerOrder>) => {
    setOrders((prev) => {
      const updated = prev.map((ord) => {
        if (ord.id === id) {
          const oldVal = ord.status;
          const merged = { ...ord, ...updates, updatedAt: new Date().toISOString() };
          if (updates.status && updates.status !== oldVal) {
            addAuditLog(id, 'Thay đổi trạng thái đơn hàng', 'status', oldVal, updates.status);
          }
          if (updates.progressPercent !== undefined && updates.progressPercent !== ord.progressPercent) {
            addAuditLog(id, 'Cập nhật tiến độ đơn hàng', 'progressPercent', `${ord.progressPercent}%`, `${updates.progressPercent}%`);
          }
          return merged;
        }
        return ord;
      });
      persist('orders', updated);
      return updated;
    });
  };

  const deleteOrder = (id: string) => {
    setOrders((prev) => {
      const updated = prev.filter((o) => o.id !== id);
      persist('orders', updated);
      return updated;
    });
  };

  const addManufacturingOrder = (moData: Partial<ManufacturingOrder>): ManufacturingOrder => {
    const newMO: ManufacturingOrder = {
      id: 'mo-' + Date.now(),
      orderId: moData.orderId || selectedOrderId || '',
      orderCode: moData.orderCode || '',
      moCode: moData.moCode || `MO-${moData.factory || 'THCK'}-${Date.now().toString().slice(-4)}`,
      factory: moData.factory || 'THCK',
      productPartName: moData.productPartName || 'Gia công chi tiết',
      quantity: Number(moData.quantity) || 1,
      unit: moData.unit || 'Chi tiết',
      startDate: moData.startDate || new Date().toISOString().split('T')[0],
      targetEndDate: moData.targetEndDate || new Date().toISOString().split('T')[0],
      progressPercent: Number(moData.progressPercent) || 0,
      status: moData.status || 'CHUA_BAT_DAU',
      leadEngineer: moData.leadEngineer || 'Kỹ sư phân xưởng',
      workstation: moData.workstation || '',
      notes: moData.notes || '',
    };

    setManufacturingOrders((prev) => {
      const updated = [newMO, ...prev];
      persist('mo', updated);
      return updated;
    });

    if (newMO.orderId) {
      addAuditLog(newMO.orderId, `Phát hành Lệnh sản xuất ${newMO.moCode} cho nhà máy ${newMO.factory}`);
    }

    return newMO;
  };

  const updateManufacturingOrder = (id: string, updates: Partial<ManufacturingOrder>) => {
    setManufacturingOrders((prev) => {
      const updated = prev.map((m) => {
        if (m.id === id) {
          const merged = { ...m, ...updates };
          if (updates.status && updates.status !== m.status) {
            addAuditLog(m.orderId, `Cập nhật trạng thái LSX ${m.moCode}`, 'status', m.status, updates.status);
          }
          return merged;
        }
        return m;
      });
      persist('mo', updated);
      return updated;
    });
  };

  const deleteManufacturingOrder = (id: string) => {
    setManufacturingOrders((prev) => {
      const updated = prev.filter((m) => m.id !== id);
      persist('mo', updated);
      return updated;
    });
  };

  // Internal Order: STRICT RULE: Must be linked to Customer Order
  const addInternalOrder = (ioData: Partial<InternalOrder>) => {
    if (!ioData.customerOrderId) {
      return {
        success: false,
        error: 'Quy định nghiêm ngặt: Mọi Đơn hàng nội bộ bắt buộc phải liên kết với một Đơn hàng khách hàng gốc hoặc Lệnh sản xuất!',
      };
    }

    if (ioData.sourceFactory === ioData.targetFactory) {
      return {
        success: false,
        error: 'Nhà máy yêu cầu và Nhà máy thực hiện không được trùng nhau trong Đơn hàng nội bộ!',
      };
    }

    const newIO: InternalOrder = {
      id: 'io-' + Date.now(),
      ioCode: ioData.ioCode || `IO-${Date.now().toString().slice(-4)}`,
      sourceFactory: ioData.sourceFactory || 'TBCD',
      targetFactory: ioData.targetFactory || 'THCK',
      customerOrderId: ioData.customerOrderId,
      customerOrderCode: ioData.customerOrderCode || '',
      manufacturingOrderId: ioData.manufacturingOrderId,
      moCode: ioData.moCode,
      itemDescription: ioData.itemDescription || 'Chi tiết gia công nội bộ',
      quantity: Number(ioData.quantity) || 1,
      unit: ioData.unit || 'Bộ',
      requestDate: ioData.requestDate || new Date().toISOString().split('T')[0],
      requiredDate: ioData.requiredDate || new Date().toISOString().split('T')[0],
      committedDate: ioData.committedDate || ioData.requiredDate || new Date().toISOString().split('T')[0],
      status: ioData.status || 'CHO_TIEP_NHAN',
      progressPercent: Number(ioData.progressPercent) || 0,
      urgencyLevel: ioData.urgencyLevel || 'BINH_THUONG',
      impactOnCustomerOrder: ioData.impactOnCustomerOrder || 'Gia công phối hợp trong chuỗi sản xuất',
      contactPerson: ioData.contactPerson || 'Cán bộ điều độ',
    };

    setInternalOrders((prev) => {
      const updated = [newIO, ...prev];
      persist('io', updated);
      return updated;
    });

    addAuditLog(
      newIO.customerOrderId,
      `Khởi tạo Đơn hàng nội bộ ${newIO.ioCode}: ${newIO.sourceFactory} yêu cầu ${newIO.targetFactory} gia công`
    );

    return { success: true, data: newIO };
  };

  const updateInternalOrder = (id: string, updates: Partial<InternalOrder>) => {
    setInternalOrders((prev) => {
      const updated = prev.map((io) => {
        if (io.id === id) {
          const merged = { ...io, ...updates };
          if (updates.status && updates.status !== io.status) {
            addAuditLog(io.customerOrderId, `Đơn nội bộ ${io.ioCode} chuyển trạng thái sang ${updates.status}`);
          }
          return merged;
        }
        return io;
      });
      persist('io', updated);
      return updated;
    });
  };

  const deleteInternalOrder = (id: string) => {
    setInternalOrders((prev) => {
      const updated = prev.filter((i) => i.id !== id);
      persist('io', updated);
      return updated;
    });
  };

  const addTechnicalDoc = (docData: Partial<TechnicalDocument>) => {
    const newDoc: TechnicalDocument = {
      id: 'doc-' + Date.now(),
      orderId: docData.orderId || selectedOrderId || '',
      docCode: docData.docCode || `DWG-${Date.now().toString().slice(-4)}`,
      title: docData.title || 'Hồ sơ kỹ thuật',
      category: docData.category || 'BAN_VE',
      version: docData.version || 'v1.0',
      status: docData.status || 'CHO_DUYET',
      approver: docData.approver,
      approvedDate: docData.status === 'DA_PHE_DUYET' ? new Date().toISOString().split('T')[0] : undefined,
      fileName: docData.fileName || 'tai_lieu_ky_thuat.pdf',
      changeLog: docData.changeLog || 'Tạo mới hồ sơ kỹ thuật',
      updatedAt: new Date().toISOString(),
    };

    setTechnicalDocs((prev) => {
      const updated = [newDoc, ...prev];
      persist('docs', updated);
      return updated;
    });

    if (newDoc.orderId) {
      addAuditLog(newDoc.orderId, `Thêm tài liệu kỹ thuật ${newDoc.docCode} (phiên bản ${newDoc.version})`);
    }
  };

  const updateTechnicalDoc = (id: string, updates: Partial<TechnicalDocument>) => {
    setTechnicalDocs((prev) => {
      const updated = prev.map((d) => (d.id === id ? { ...d, ...updates, updatedAt: new Date().toISOString() } : d));
      persist('docs', updated);
      return updated;
    });
  };

  const addMaterialItem = (itemData: Partial<MaterialItem>) => {
    const req = Number(itemData.requiredQty) || 0;
    const avail = Number(itemData.availableStock) || 0;
    const arr = Number(itemData.arrivedQty) || 0;
    const short = Math.max(0, req - (avail + arr));

    const newItem: MaterialItem = {
      id: 'mat-' + Date.now(),
      orderId: itemData.orderId || selectedOrderId || '',
      materialCode: itemData.materialCode || `VT-${Date.now().toString().slice(-4)}`,
      materialName: itemData.materialName || 'Vật tư mới',
      specifications: itemData.specifications || '',
      unit: itemData.unit || 'Kg',
      requiredQty: req,
      availableStock: avail,
      requestedQty: Number(itemData.requestedQty) || 0,
      arrivedQty: arr,
      shortageQty: short,
      status: short > 0 ? (itemData.requestedQty ? 'CHO_HANG_VE' : 'CANH_BAO_THIEU') : 'DU_VAT_TU',
      supplier: itemData.supplier,
      expectedDate: itemData.expectedDate,
    };

    setMaterials((prev) => {
      const updated = [newItem, ...prev];
      persist('mats', updated);
      return updated;
    });

    if (newItem.orderId) {
      addAuditLog(newItem.orderId, `Đăng ký danh mục vật tư: ${newItem.materialName} (${newItem.materialCode})`);
    }
  };

  const updateMaterialItem = (id: string, updates: Partial<MaterialItem>) => {
    setMaterials((prev) => {
      const updated = prev.map((m) => {
        if (m.id === id) {
          const merged = { ...m, ...updates };
          merged.shortageQty = Math.max(0, merged.requiredQty - (merged.availableStock + merged.arrivedQty));
          if (merged.shortageQty === 0) {
            merged.status = 'DU_VAT_TU';
          } else if (merged.requestedQty >= merged.shortageQty) {
            merged.status = 'CHO_HANG_VE';
          } else {
            merged.status = 'CANH_BAO_THIEU';
          }
          return merged;
        }
        return m;
      });
      persist('mats', updated);
      return updated;
    });
  };

  const addPurchaseRequest = (prData: Partial<PurchaseRequest>) => {
    const newPR: PurchaseRequest = {
      id: 'pr-' + Date.now(),
      orderId: prData.orderId || selectedOrderId || '',
      prCode: prData.prCode || `PR-${Date.now().toString().slice(-4)}`,
      requestDate: prData.requestDate || new Date().toISOString().split('T')[0],
      itemsSummary: prData.itemsSummary || 'Đề nghị mua vật tư',
      factory: prData.factory || 'THCK',
      requester: prData.requester || 'Cán bộ vật tư',
      expectedArrivalDate: prData.expectedArrivalDate || new Date().toISOString().split('T')[0],
      supplier: prData.supplier || 'Nhà cung ứng',
      status: prData.status || 'CHO_DUYET',
      totalCostEstimate: Number(prData.totalCostEstimate) || 0,
    };

    setPurchaseRequests((prev) => {
      const updated = [newPR, ...prev];
      persist('pr', updated);
      return updated;
    });

    if (newPR.orderId) {
      addAuditLog(newPR.orderId, `Lập đề nghị mua vật tư ${newPR.prCode} cho nhà máy ${newPR.factory}`);
    }
  };

  const updatePurchaseRequest = (id: string, updates: Partial<PurchaseRequest>) => {
    setPurchaseRequests((prev) => {
      const updated = prev.map((pr) => (pr.id === id ? { ...pr, ...updates } : pr));
      persist('pr', updated);
      return updated;
    });
  };

  const addIssue = (issueData: Partial<Issue>) => {
    const newIssue: Issue = {
      id: 'iss-' + Date.now(),
      orderId: issueData.orderId || selectedOrderId || '',
      orderCode: issueData.orderCode || '',
      issueCode: issueData.issueCode || `ISS-${Date.now().toString().slice(-4)}`,
      title: issueData.title || 'Bất cập phát sinh',
      description: issueData.description || '',
      severity: issueData.severity || 'TRUNG_BINH',
      category: issueData.category || 'LOI_GIA_CONG',
      relatedFactory: issueData.relatedFactory,
      assignee: issueData.assignee || 'Cán bộ phụ trách',
      solutionPlan: issueData.solutionPlan || '',
      reportedDate: issueData.reportedDate || new Date().toISOString().split('T')[0],
      status: issueData.status || 'MOI_GHI_NHAN',
      delayDaysImpact: Number(issueData.delayDaysImpact) || 0,
    };

    setIssues((prev) => {
      const updated = [newIssue, ...prev];
      persist('issues', updated);
      return updated;
    });

    if (newIssue.orderId) {
      addAuditLog(
        newIssue.orderId,
        `Ghi nhận bất cập [${newIssue.severity}]: ${newIssue.title} (ảnh hưởng ${newIssue.delayDaysImpact} ngày)`
      );
    }
  };

  const updateIssue = (id: string, updates: Partial<Issue>) => {
    setIssues((prev) => {
      const updated = prev.map((iss) => (iss.id === id ? { ...iss, ...updates } : iss));
      persist('issues', updated);
      return updated;
    });
  };

  const addCommunication = (commData: Partial<CustomerCommunication>) => {
    const newComm: CustomerCommunication = {
      id: 'comm-' + Date.now(),
      orderId: commData.orderId || selectedOrderId || '',
      datetime: commData.datetime || new Date().toLocaleString('vi-VN'),
      channel: commData.channel || 'EMAIL',
      contactPerson: commData.contactPerson || 'Đại diện khách hàng',
      ourRepresentative: commData.ourRepresentative || 'Đại diện THACO',
      subject: commData.subject || 'Trao đổi tiến độ',
      summary: commData.summary || '',
      actionItems: commData.actionItems,
    };

    setCommunications((prev) => {
      const updated = [newComm, ...prev];
      persist('comm', updated);
      return updated;
    });

    if (newComm.orderId) {
      addAuditLog(newComm.orderId, `Ghi nhận phiên trao đổi với khách: ${newComm.subject}`);
    }
  };

  const addDeliveryBatch = (batchData: Partial<DeliveryBatch>) => {
    const newBatch: DeliveryBatch = {
      id: 'del-' + Date.now(),
      orderId: batchData.orderId || selectedOrderId || '',
      batchNumber: Number(batchData.batchNumber) || 1,
      plannedDate: batchData.plannedDate || new Date().toISOString().split('T')[0],
      quantity: Number(batchData.quantity) || 1,
      destination: batchData.destination || 'Kho khách hàng',
      status: batchData.status || 'KE_HOACH',
      trackingNumber: batchData.trackingNumber,
    };

    setDeliveryBatches((prev) => {
      const updated = [...prev, newBatch];
      persist('del', updated);
      return updated;
    });
  };

  const updateDeliveryBatch = (id: string, updates: Partial<DeliveryBatch>) => {
    setDeliveryBatches((prev) => {
      const updated = prev.map((b) => (b.id === id ? { ...b, ...updates } : b));
      persist('del', updated);
      return updated;
    });
  };

  const resetToDefaultData = () => {
    if (typeof window !== 'undefined') {
      const keys = ['orders', 'mo', 'io', 'docs', 'mats', 'pr', 'issues', 'comm', 'del', 'logs'];
      keys.forEach((k) => localStorage.removeItem(STORAGE_PREFIX + k));
    }
    setOrders(INITIAL_ORDERS);
    setManufacturingOrders(INITIAL_MANUFACTURING_ORDERS);
    setInternalOrders(INITIAL_INTERNAL_ORDERS);
    setTechnicalDocs(INITIAL_TECHNICAL_DOCS);
    setMaterials(INITIAL_MATERIALS);
    setPurchaseRequests(INITIAL_PURCHASE_REQUESTS);
    setIssues(INITIAL_ISSUES);
    setCommunications(INITIAL_COMMUNICATIONS);
    setDeliveryBatches(INITIAL_DELIVERY_BATCHES);
    setAuditLogs(INITIAL_AUDIT_LOGS);
  };

  return (
    <AppContext.Provider
      value={{
        orders,
        manufacturingOrders,
        internalOrders,
        technicalDocs,
        materials,
        purchaseRequests,
        issues,
        communications,
        deliveryBatches,
        auditLogs,
        currentRole,
        setCurrentRole,
        selectedOrderId,
        setSelectedOrderId,
        activeView,
        setActiveView,
        selectedDetailTab,
        setSelectedDetailTab,
        searchQuery,
        setSearchQuery,
        isFirebaseActive,
        addOrder,
        updateOrder,
        deleteOrder,
        addManufacturingOrder,
        updateManufacturingOrder,
        deleteManufacturingOrder,
        addInternalOrder,
        updateInternalOrder,
        deleteInternalOrder,
        addTechnicalDoc,
        updateTechnicalDoc,
        addMaterialItem,
        updateMaterialItem,
        addPurchaseRequest,
        updatePurchaseRequest,
        addIssue,
        updateIssue,
        addCommunication,
        addDeliveryBatch,
        updateDeliveryBatch,
        resetToDefaultData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
