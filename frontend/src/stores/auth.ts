import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  token: string | null;
  userId: number | null;
  nickname: string | null;
  phone: string | null;
  role: string | null;
  avatar: string | null;
  isLoggedIn: boolean;
  setAuth: (data: {
    token: string;
    userId: number;
    nickname: string;
    phone: string;
    role: string;
    avatar: string | null;
  }) => void;
  logout: () => void;
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      userId: null,
      nickname: null,
      phone: null,
      role: null,
      avatar: null,
      isLoggedIn: false,
      setAuth: (data) =>
        set({
          ...data,
          isLoggedIn: true,
        }),
      logout: () =>
        set({
          token: null,
          userId: null,
          nickname: null,
          phone: null,
          role: null,
          avatar: null,
          isLoggedIn: false,
        }),
      isAdmin: () => get().role === 'ADMIN',
    }),
    { name: 'malahot-auth' }
  )
);
