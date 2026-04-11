import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Client {
  id: number;
  company_name: string;
  phone_e164: string;
  country?: string;
  currency?: string;
}

interface AuthState {
  user: Client | null;
  setUser: (user: Client | null) => void;
  setCountry: (country: string) => void;
  setCurrency: (currency: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      setCountry: (country) => set((state) => ({
        user: state.user ? { ...state.user, country } : null
      })),
      setCurrency: (currency) => set((state) => ({
        user: state.user ? { ...state.user, currency } : null
      })),
      logout: () => set({ user: null }),
    }),
    { name: 'tt-agenda-auth' }
  )
);
