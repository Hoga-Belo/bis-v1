import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';
import { User, AuthState, LoginRequest, LoginResponse } from '@/lib/types/auth';
import { authApi } from '@/lib/api/endpoints/auth';

interface AuthStore extends AuthState {
  login: (credentials: LoginRequest) => Promise<LoginResponse>;
  logout: () => void;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,

      login: async (credentials: LoginRequest) => {
        set({ isLoading: true });
        try {
          const response = await authApi.login(credentials);
          const data = response.data as LoginResponse;
          
          // Store token in cookie
          Cookies.set('access_token', data.access_token, {
            expires: data.expires_in / 86400, // Convert seconds to days
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
          });

          set({
            user: data.user,
            token: data.access_token,
            isAuthenticated: true,
            isLoading: false,
          });

          return data;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        Cookies.remove('access_token');
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      setLoading: (loading) => set({ isLoading: loading }),

      checkAuth: async () => {
        const token = Cookies.get('access_token');
        if (!token) {
          set({ isAuthenticated: false, isLoading: false });
          return;
        }

        try {
          const response = await authApi.getProfile();
          set({
            user: response.data as User,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch {
          Cookies.remove('access_token');
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);