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
  signIn(apiKey: string): Promise<void>;
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

  async function signIn(apiKey: string) {
    try {
      const response = await api.post('/v1/auth/login', { apiKey });
      const { token, user: userData } = response.data;

      localStorage.setItem('@TrataTudo:token', token);
      localStorage.setItem('@TrataTudo:user', JSON.stringify(userData));
      
      setUser(userData);
    } catch (error) {
      console.error('Login failed', error);
      throw error;
    }
  }

  function signOut() {
    localStorage.removeItem('@TrataTudo:token');
    localStorage.removeItem('@TrataTudo:user');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ signed: !!user, user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
