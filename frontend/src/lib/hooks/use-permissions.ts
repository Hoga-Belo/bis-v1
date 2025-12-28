'use client';

import { useAuth } from '@/lib/hooks/use-auth';

/**
 * Hook untuk abstraksi pengecekan permission berbasis auth store.
 * Hanya membaca state, tanpa side-effect / fetch.
 */
export function usePermissions() {
  const { user } = useAuth();

  const permissions = user?.permissions ?? [];

  const can = (permission: string): boolean => {
    if (!permission) return false;
    return permissions.includes(permission);
  };

  const canAny = (required: string[]): boolean => {
    if (!required || required.length === 0) return false;
    if (permissions.length === 0) return false;
    return required.some((p) => permissions.includes(p));
  };

  const canAll = (required: string[]): boolean => {
    if (!required || required.length === 0) return false;
    if (permissions.length === 0) return false;
    return required.every((p) => permissions.includes(p));
  };

  return {
    permissions,
    can,
    canAny,
    canAll,
  };
}