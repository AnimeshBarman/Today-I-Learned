import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  isLoggedIn: boolean;
  setAuth: (access: string, refresh: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      isLoggedIn: false,
      setAuth: (access, refresh) => 
        set({ accessToken: access, refreshToken: refresh, isLoggedIn: true }),
      logout: () => {
        localStorage.removeItem('auth-storage');
        set({ accessToken: null, refreshToken: null, isLoggedIn: false });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);