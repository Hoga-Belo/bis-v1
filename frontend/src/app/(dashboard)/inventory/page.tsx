'use client';

import { PermissionGate } from '@/components/auth';
import {
  InventoryOverviewCard,
  StockSummaryCard,
  LowStockAlertsCard,
  RecentTransactionsCard,
  QuickActionsCard,
} from '@/components/inventory/dashboard';

export default function InventoryDashboardPage() {
  return (
    <PermissionGate
      permissions={['inventory:dashboard:read']}
      fallback={
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">
            Anda tidak memiliki akses ke dashboard inventaris.
          </p>
        </div>
      }
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Dashboard Inventaris
          </h1>
          <p className="text-muted-foreground">
            Ringkasan dan statistik inventaris
          </p>
        </div>

        {/* Row 1: Overview */}
        <div className="grid gap-6 md:grid-cols-2">
          <InventoryOverviewCard />
          <QuickActionsCard />
        </div>

        {/* Row 2: Stock Summary */}
        <div className="grid gap-6 md:grid-cols-1">
          <StockSummaryCard />
        </div>

        {/* Row 3: Alerts and Recent Transactions */}
        <div className="grid gap-6 md:grid-cols-2">
          <LowStockAlertsCard />
          <RecentTransactionsCard />
        </div>
      </div>
    </PermissionGate>
  );
}