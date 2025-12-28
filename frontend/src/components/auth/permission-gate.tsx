'use client';

import { useAuthStore } from '@/lib/stores/auth-store';

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
  const { hasAllPermissions, hasAnyPermission } = useAuthStore();

  const hasPermission = requireAll
    ? hasAllPermissions(permissions)
    : hasAnyPermission(permissions);

  if (!hasPermission) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}