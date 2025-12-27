'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth-store';

export function useAuth(requireAuth: boolean = true) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, checkAuth, login, logout } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!isLoading && requireAuth && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, requireAuth, router]);

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
  };
}