import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Staff } from '../types';

interface Client {
  id: number;
  company_name: string;
  phone_e164: string;
  country?: string;
  currency?: string;
}

interface AuthState {
  user: Client | null;
  staffList: Staff[];
  setUser: (user: Client | null) => void;
  setCountry: (country: string) => void;
  setCurrency: (currency: string) => void;
  setStaffList: (staff: Staff[]) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      staffList: [],
      setUser: (user) => set({ user }),
      setCountry: (country) => set((state) => ({
        user: state.user ? { ...state.user, country } : null
      })),
      setCurrency: (currency) => set((state) => ({
        user: state.user ? { ...state.user, currency } : null
      })),
      setStaffList: (staffList) => set({ staffList }),
      logout: () => set({ user: null, staffList: [] }),
    }),
    { name: 'tt-agenda-auth' }
  )
);
