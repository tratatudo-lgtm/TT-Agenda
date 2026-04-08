import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api';

interface Business {
  id: string;
  name: string;
  phone: string;
}

interface AuthContextType {
  user: Business | null;
  loading: boolean;
  login: (phone: string, code: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('tt_user');
    const token = localStorage.getItem('tt_token');
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (phone: string, code: string) => {
    const response = await api.post('/auth/verify-otp', { phone, code });
    const { token, business } = response.data;
    localStorage.setItem('tt_token', token);
    localStorage.setItem('tt_user', JSON.stringify(business));
    setUser(business);
  };

  const logout = () => {
    localStorage.removeItem('tt_token');
    localStorage.removeItem('tt_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
