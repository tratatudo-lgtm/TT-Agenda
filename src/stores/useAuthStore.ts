import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Client {
  id: number;
  company_name: string;
  phone_e164: string;
  status?: string;
}

interface AuthState {
  user: Client | null;
  setUser: (user: Client | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      logout: () => set({ user: null }),
    }),
    {
      name: 'tt-agenda-auth',
    }
  )
);