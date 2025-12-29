'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { PermissionGate } from '@/components/auth';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Tag,
  Ruler,
  Warehouse,
  ArrowLeftRight,
} from 'lucide-react';

const inventoryNavItems = [
  {
    href: '/inventory',
    label: 'Dashboard',
    icon: LayoutDashboard,
    permission: 'inventory:dashboard:read',
    exact: true,
  },
  {
    href: '/inventory/products',
    label: 'Produk',
    icon: Package,
    permission: 'inventory:product:read',
  },
  {
    href: '/inventory/categories',
    label: 'Kategori',
    icon: FolderTree,
    permission: 'inventory:category:read',
  },
  {
    href: '/inventory/brands',
    label: 'Merek',
    icon: Tag,
    permission: 'inventory:brand:read',
  },
  {
    href: '/inventory/uoms',
    label: 'Satuan',
    icon: Ruler,
    permission: 'inventory:uom:read',
  },
  {
    href: '/inventory/warehouses',
    label: 'Gudang',
    icon: Warehouse,
    permission: 'inventory:warehouse:read',
  },
  {
    href: '/inventory/stock-transactions',
    label: 'Transaksi Stok',
    icon: ArrowLeftRight,
    permission: 'inventory:stock-transaction:read',
  },
];

export default function InventoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex gap-6">
      {/* Sidebar Navigation */}
      <aside className="w-64 shrink-0">
        <div className="sticky top-6">
          <h2 className="mb-4 px-3 text-lg font-semibold">
            Manajemen Inventaris
          </h2>
          <nav className="space-y-1">
            {inventoryNavItems.map((item) => {
              const isActive = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);
              return (
                <PermissionGate
                  key={item.href}
                  permissions={[item.permission]}
                  fallback={null}
                >
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                </PermissionGate>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}