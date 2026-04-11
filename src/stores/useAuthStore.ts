import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  company_name: string;
  phone_e164: string;
  status: string;
  country?: string;
  currency?: string;
  [key: string]: any;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  country: string;
  currency: string;
  setUser: (user: User | null) => void;
  setCurrency: (currency: string) => void;
  setCountry: (country: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      country: 'PT',
      currency: 'EUR',
      setUser: (user) => set({ 
        user, 
        isAuthenticated: !!user,
        country: user?.country || 'PT',
        currency: user?.currency || 'EUR'
      }),
      setCurrency: (currency) => set({ currency }),
      setCountry: (country) => set({ country }),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: 'tt-agenda-auth',
    }
  )
);
