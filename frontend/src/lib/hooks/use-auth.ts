'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth-store';
import { authApi } from '@/lib/api/endpoints/auth';
import { toast } from 'sonner';

export function useAuth() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, setAuth, setLoading, logout: clearAuth } = useAuthStore();

  const login = useCallback(
    async (nik: string, password: string, redirectTo?: string) => {
      try {
        setLoading(true);
        const response = await authApi.login({ nik, password });
        
        if (response.success && response.data) {
          const { accessToken, refreshToken, user } = response.data;
          setAuth(user, accessToken, refreshToken);
          
          // Redirect based on first login status
          if (user.isFirstLogin) {
            router.push('/change-password');
          } else {
            router.push(redirectTo || '/dashboard');
          }
          
          toast.success('Login berhasil');
          return true;
        }
        
        toast.error(response.message || 'Login gagal');
        return false;
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Login gagal';
        toast.error(message);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [router, setAuth, setLoading]
  );

  const logout = useCallback(async () => {
    try {
      // Call logout API if needed
      clearAuth();
      router.push('/login');
      toast.success('Logout berhasil');
    } catch (error) {
      console.error('Logout error:', error);
      clearAuth();
      router.push('/login');
    }
  }, [clearAuth, router]);

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
  };
}