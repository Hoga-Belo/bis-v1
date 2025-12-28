'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth-store';
import { authApi } from '@/lib/api/endpoints/auth';
import { ChangePasswordForm } from '@/components/forms/change-password-form';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { toast } from 'sonner';

export default function ChangePasswordPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, setAuth, accessToken, refreshToken } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Wait for hydration
    if (authLoading) return;

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }

    // Redirect to dashboard if not first login (accessing this page directly)
    // Allow access if it's first login
  }, [isAuthenticated, authLoading, router]);

  const handleSubmit = async (data: { oldPassword?: string; newPassword: string; confirmPassword: string }) => {
    try {
      setIsSubmitting(true);
      const response = await authApi.changePassword(data);

      if (response.success) {
        toast.success('Password berhasil diubah');

        // Update user state to set isFirstLogin = false
        if (user && accessToken && refreshToken) {
          setAuth(
            { ...user, isFirstLogin: false },
            accessToken,
            refreshToken
          );
        }

        // Redirect to dashboard
        router.push('/dashboard');
      } else {
        toast.error(response.message || 'Gagal mengubah password');
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Gagal mengubah password';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading while checking auth
  if (authLoading) {
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

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 p-4">
      <ChangePasswordForm
        isFirstLogin={user?.isFirstLogin}
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
      />
    </div>
  );
}