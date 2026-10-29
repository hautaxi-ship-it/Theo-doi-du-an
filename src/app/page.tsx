'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { OverviewDashboard } from '@/components/dashboard/OverviewDashboard';
import { OrderList } from '@/components/orders/OrderList';
import { OrderDetailView } from '@/components/orders/OrderDetailView';
import { ManufacturingOrdersList } from '@/components/manufacturing/ManufacturingOrdersList';
import { InternalOrdersList } from '@/components/internal-orders/InternalOrdersList';
import { MaterialsManagement } from '@/components/materials/MaterialsManagement';
import { IssuesManagement } from '@/components/issues/IssuesManagement';

// Modals
import { CreateOrderModal } from '@/components/orders/CreateOrderModal';
import { CreateManufacturingOrderModal } from '@/components/orders/CreateManufacturingOrderModal';
import { CreateInternalOrderModal } from '@/components/orders/CreateInternalOrderModal';
import { CreateIssueModal } from '@/components/orders/CreateIssueModal';
import { FirebaseConfigModal } from '@/components/config/FirebaseConfigModal';

export default function Home() {
  const { activeView, selectedOrderId, orders, setActiveView, setSelectedOrderId } = useApp();

  // Modals state
  const [isCreateOrderOpen, setIsCreateOrderOpen] = useState(false);
  const [isCreateMOOpen, setIsCreateMOOpen] = useState(false);
  const [isCreateIOOpen, setIsCreateIOOpen] = useState(false);
  const [isCreateIssueOpen, setIsCreateIssueOpen] = useState(false);
  const [isFirebaseConfigOpen, setIsFirebaseConfigOpen] = useState(false);
  const [activeModalOrderId, setActiveModalOrderId] = useState<string | undefined>(undefined);

  const handleOpenCreateMO = (orderId?: string) => {
    setActiveModalOrderId(orderId || selectedOrderId || undefined);
    setIsCreateMOOpen(true);
  };

  const handleOpenCreateIO = (orderId?: string) => {
    setActiveModalOrderId(orderId || selectedOrderId || undefined);
    setIsCreateIOOpen(true);
  };

  const handleOpenCreateIssue = (orderId?: string) => {
    setActiveModalOrderId(orderId || selectedOrderId || undefined);
    setIsCreateIssueOpen(true);
  };

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden font-sans">
      {/* Sidebar */}
      <Sidebar onOpenFirebaseConfig={() => setIsFirebaseConfigOpen(true)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <Header
          onOpenCreateOrder={() => setIsCreateOrderOpen(true)}
          onOpenCreateMO={() => handleOpenCreateMO()}
          onOpenCreateIO={() => handleOpenCreateIO()}
          onOpenFirebaseConfig={() => setIsFirebaseConfigOpen(true)}
        />

        {/* Dynamic View Content */}
        <main className="flex-1 overflow-y-auto bg-slate-100/70 pb-12">
          {activeView === 'dashboard' && (
            <OverviewDashboard
              onOpenCreateOrder={() => setIsCreateOrderOpen(true)}
              onOpenCreateIO={() => handleOpenCreateIO()}
            />
          )}

          {activeView === 'orders' && (
            <OrderList onOpenCreateOrder={() => setIsCreateOrderOpen(true)} />
          )}

          {activeView === 'order-detail' && (
            <OrderDetailView
              orderId={selectedOrderId || (orders[0] ? orders[0].id : '')}
              onOpenCreateMO={handleOpenCreateMO}
              onOpenCreateIO={handleOpenCreateIO}
              onOpenCreateIssue={handleOpenCreateIssue}
            />
          )}

          {activeView === 'manufacturing' && (
            <ManufacturingOrdersList onOpenCreateMO={() => handleOpenCreateMO()} />
          )}

          {activeView === 'internal-orders' && (
            <InternalOrdersList onOpenCreateIO={() => handleOpenCreateIO()} />
          )}

          {activeView === 'materials' && <MaterialsManagement />}

          {activeView === 'issues' && (
            <IssuesManagement onOpenCreateIssue={() => handleOpenCreateIssue()} />
          )}
        </main>
      </div>

      {/* Dialog Modals */}
      <CreateOrderModal
        isOpen={isCreateOrderOpen}
        onClose={() => setIsCreateOrderOpen(false)}
      />

      <CreateManufacturingOrderModal
        isOpen={isCreateMOOpen}
        onClose={() => setIsCreateMOOpen(false)}
        defaultOrderId={activeModalOrderId}
      />

      <CreateInternalOrderModal
        isOpen={isCreateIOOpen}
        onClose={() => setIsCreateIOOpen(false)}
        defaultOrderId={activeModalOrderId}
      />

      <CreateIssueModal
        isOpen={isCreateIssueOpen}
        onClose={() => setIsCreateIssueOpen(false)}
        defaultOrderId={activeModalOrderId}
      />

      <FirebaseConfigModal
        isOpen={isFirebaseConfigOpen}
        onClose={() => setIsFirebaseConfigOpen(false)}
      />
    </div>
  );
}
