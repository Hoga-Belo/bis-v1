'use client';

import { usePermissions } from '@/lib/hooks/use-permissions';

interface PermissionGateProps {
  children: React.ReactNode;
  permissions: string[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
}

export function PermissionGate({
  children,
  permissions,
  requireAll = true,
  fallback = null,
}: PermissionGateProps) {
  const { canAll, canAny } = usePermissions();

  const hasPermission = requireAll ? canAll(permissions) : canAny(permissions);

  if (!hasPermission) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}