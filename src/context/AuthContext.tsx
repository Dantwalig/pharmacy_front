// frontend/src/context/AuthContext.tsx
// UPDATED VERSION - Added pharmacy status-based routing

'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { setAuthTokens, removeAuthTokens, getUserFromToken, User, cacheUserData, clearUserCache } from '@/lib/auth';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: any) => void;
  refreshUser: () => Promise<void>;
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
      cacheUserData(userData); // Cache user data including pharmacyStatus
      setUser(userData);

      // CRITICAL: Route based on role AND pharmacy status
      switch (userData.role) {
        case 'PATIENT':
          toast.success('Welcome back!');
          router.push('/patient/dashboard');
          break;

        case 'PHARMACY':
          // Check pharmacy approval status
          if (userData.pharmacyStatus === 'PENDING') {
            toast.success('Your application is being reviewed');
            router.push('/pending-approval');
          } else if (userData.pharmacyStatus === 'REJECTED') {
            toast.error('Your application was rejected. Please resubmit with corrections.');
            router.push('/pharmacy-rejected');
          } else if (userData.pharmacyStatus === 'APPROVED') {
            toast.success('Welcome back!');
            router.push('/pharmacy/dashboard');
          } else {
            toast.error('Invalid pharmacy status');
            removeAuthTokens();
            setUser(null);
            router.push('/login');
          }
          break;

        case 'SUPER_ADMIN':
          toast.success('Welcome Admin!');
          router.push('/super-admin/dashboard');
          break;

        default:
          toast.error('Invalid user role');
          removeAuthTokens();
          setUser(null);
          router.push('/login');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
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
      clearUserCache(); // Clear cached user data
      setUser(null);
      router.push('/login');
      toast.success('Logged out successfully');
    }
  };

  const updateUser = (userData: any) => {
    setUser((prev) => ({ ...prev, ...userData } as User));
  };

  // NEW: Refresh user data from server
  const refreshUser = async () => {
    try {
      const response = await api.get('/auth/me');
      const userData = response.data;
      cacheUserData(userData); // Cache updated user data
      setUser(userData);
    } catch (error) {
      console.error('Failed to refresh user:', error);
      // If refresh fails, user might need to re-login
      removeAuthTokens();
      clearUserCache();
      setUser(null);
      router.push('/login');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};