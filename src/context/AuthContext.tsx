import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import api from '../utils/api';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextData {
  signed: boolean;
  user: User | null;
  loading: boolean;
  requestOtp(phone: string): Promise<void>;
  verifyOtp(phone: string, code: string): Promise<void>;
  signOut(): void;
}

const AuthContext = createContext<AuthContextData | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStoragedData = () => {
      try {
        const storagedToken = localStorage.getItem('@TrataTudo:token');
        const storagedUser = localStorage.getItem('@TrataTudo:user');

        if (storagedToken && storagedUser) {
          setUser(JSON.parse(storagedUser));
        }
      } catch (error) {
        console.error('Error loading storaged auth data', error);
        localStorage.removeItem('@TrataTudo:token');
        localStorage.removeItem('@TrataTudo:user');
      } finally {
        setLoading(false);
      }
    };

    loadStoragedData();
  }, []);

  const requestOtp = useCallback(async (phone: string) => {
    try {
      await api.post('/v1/auth/otp/request', { phone });
    } catch (error) {
      console.error('OTP request failed', error);
      throw error;
    }
  }, []);

  const verifyOtp = useCallback(async (phone: string, code: string) => {
    try {
      const response = await api.post('/v1/auth/otp/verify', { phone, code });
      const { token, user: userData } = response.data || {};

      if (!token || !userData) {
        throw new Error('Invalid response from server');
      }

      localStorage.setItem('@TrataTudo:token', token);
      localStorage.setItem('@TrataTudo:user', JSON.stringify(userData));
      
      setUser(userData);
    } catch (error) {
      console.error('OTP verification failed', error);
      throw error;
    }
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem('@TrataTudo:token');
    localStorage.removeItem('@TrataTudo:user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ signed: !!user, user, loading, requestOtp, verifyOtp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextData {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
