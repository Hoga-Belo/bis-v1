'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth-store';
import { LoadingSpinner } from '@/components/shared/loading-spinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermissions?: string[];
  requireAll?: boolean; // true = all permissions required, false = any permission
}

export function ProtectedRoute({
  children,
  requiredPermissions,
  requireAll = true,
}: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading, user, hasAllPermissions, hasAnyPermission } =
    useAuthStore();

  useEffect(() => {
    // Wait for hydration
    if (isLoading) return;

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    // Redirect to change password if first login (except if already on change-password page)
    if (user?.isFirstLogin && !pathname.includes('/change-password')) {
      router.replace('/change-password');
      return;
    }
  }, [isAuthenticated, isLoading, user, router, pathname]);

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Not authenticated - will redirect
  if (!isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // First login - will redirect to change password
  if (user?.isFirstLogin && !pathname.includes('/change-password')) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Check permissions if required
  if (requiredPermissions && requiredPermissions.length > 0) {
    const hasPermission = requireAll
      ? hasAllPermissions(requiredPermissions)
      : hasAnyPermission(requiredPermissions);

    if (!hasPermission) {
      return (
        <div className="flex h-screen flex-col items-center justify-center gap-4">
          <div className="text-6xl">🚫</div>
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="text-muted-foreground">
            You don&apos;t have permission to access this page.
          </p>
          <button
            onClick={() => router.back()}
            className="mt-4 rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
          >
            Go Back
          </button>
        </div>
      );
    }
  }

  return <>{children}</>;
}