// frontend/src/context/AuthContext.tsx

'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { setAuthTokens, removeAuthTokens, getUserFromToken, User } from '@/lib/auth';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: any) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initAuth = () => {
      const userData = getUserFromToken();
      setUser(userData);
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { accessToken, refreshToken, user: userData } = response.data;

      setAuthTokens(accessToken, refreshToken);
      setUser(userData);

      // Redirect based on role
      switch (userData.role) {
        case 'PATIENT':
          router.push('/patient/dashboard');
          break;
        case 'PHARMACY':
          router.push('/pharmacy/dashboard');
          break;
        case 'SUPER_ADMIN':
          router.push('/super-admin/dashboard');
          break;
      }

      toast.success('Login successful!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed');
      throw error;
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      removeAuthTokens();
      setUser(null);
      router.push('/login');
      toast.success('Logged out successfully');
    }
  };

  const updateUser = (userData: any) => {
    setUser((prev) => ({ ...prev, ...userData } as User));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};