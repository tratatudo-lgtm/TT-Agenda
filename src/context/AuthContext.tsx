import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../services/api';

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

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storagedToken = localStorage.getItem('@TrataTudo:token');
    const storagedUser = localStorage.getItem('@TrataTudo:user');

    if (storagedToken && storagedUser) {
      setUser(JSON.parse(storagedUser));
    }
    setLoading(false);
  }, []);

  async function requestOtp(phone: string) {
    try {
      await api.post('/v1/auth/otp/request', { phone });
    } catch (error) {
      console.error('OTP request failed', error);
      throw error;
    }
  }

  async function verifyOtp(phone: string, code: string) {
    try {
      const response = await api.post('/v1/auth/otp/verify', { phone, code });
      const { token, user: userData } = response.data;

      localStorage.setItem('@TrataTudo:token', token);
      localStorage.setItem('@TrataTudo:user', JSON.stringify(userData));
      
      setUser(userData);
    } catch (error) {
      console.error('OTP verification failed', error);
      throw error;
    }
  }

  function signOut() {
    localStorage.removeItem('@TrataTudo:token');
    localStorage.removeItem('@TrataTudo:user');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ signed: !!user, user, loading, requestOtp, verifyOtp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
