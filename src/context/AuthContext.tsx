// frontend/src/context/AuthContext.tsx
// UPDATED VERSION - Added routing for BRANCH_MANAGER, PHARMACIST, CASHIER, NURSE

'use client';

import { useTranslation } from 'react-i18next';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import api, { authApi } from '@/lib/api';
import { getErrorMessage } from '@/lib/errorHandler';
import { 
  setAuthTokens, 
  removeAuthTokens, 
  getUserFromToken, 
  cacheUserData, 
  clearUserCache,
  getAccessToken,
  getRefreshToken,
  isHospitalNurse
} from '@/lib/auth';
import { User, DecodedToken } from '@/types';
import { jwtDecode } from 'jwt-decode';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  refreshUser: () => Promise<void>;
  setUserDirectly: (userData: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t } = useTranslation();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  // Persists across user-state re-renders so the 30 s throttle isn't reset
  // every time updateUser/refreshUser triggers a new [user] effect run.
  const lastCheckTimeRef = useRef(0);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = getAccessToken();
        const refreshToken = getRefreshToken();

        if (!token && refreshToken) {
          try {
            const data = await authApi.refreshTokens();
            const { accessToken, refreshToken: newRefreshToken, user: userData } = data;
            setAuthTokens(accessToken, newRefreshToken || refreshToken);
            if (userData) {
              cacheUserData(userData);
              setUser(userData);
            } else {
              const decodedUser = getUserFromToken();
              setUser(decodedUser);
            }
          } catch (refreshErr) {
            console.error("Auto-refresh failed on initialization:", refreshErr);
            removeAuthTokens();
            clearUserCache();
            setUser(null);
          }
        } else {
          const userData = getUserFromToken();
          setUser(userData);
        }
      } catch (err) {
        console.error("Auth initialization failed:", err);
        removeAuthTokens();
        clearUserCache();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  // Silent token refresh based on user activity to prevent session expiry during active use
  useEffect(() => {
    if (!user) return;

    const checkInterval = 30000; // Throttle checks to once every 30 seconds

    const checkAndRefreshSession = async () => {
      const now = Date.now();
      if (now - lastCheckTimeRef.current < checkInterval) return;
      lastCheckTimeRef.current = now;

      try {
        const token = getAccessToken();
        if (!token) return;

        const decoded = jwtDecode<DecodedToken>(token);
        // exp is in seconds, convert to ms
        const timeLeft = decoded.exp * 1000 - now;

        // If less than 5 minutes left on the access token, refresh it proactively
        if (timeLeft < 5 * 60 * 1000) {
          console.log('Session token is expiring soon, refreshing...');
          const data = await authApi.refreshTokens();
          const { accessToken, refreshToken: newRefreshToken } = data;
          setAuthTokens(accessToken, newRefreshToken || getRefreshToken() || '');
        }
      } catch (err: any) {
        const status = err?.response?.status;
        if (status === 401 || status === 403) {
          // Refresh token is invalid/expired — the session is dead. Clear the
          // auth state once and let the guard redirect to /login. Do NOT keep
          // retrying on every activity (that spams 401s in the console).
          console.warn('Session expired — clearing auth state.');
          removeAuthTokens();
          clearUserCache();
          setUser(null);
          if (window.location.pathname !== '/login') {
            toast.error(t('auth2.sessionExpired', 'Session expired. Please log in again.'));
            router.push('/login');
          }
          return;
        }
        // Transient failure (timeout/network) — keep the session, retry on next activity
        console.warn('Silent session refresh skipped (transient):', err?.message ?? err);
      }
    };

    const handleActivity = () => {
      checkAndRefreshSession();
    };

    // Listen to mouse moves, keystrokes, touches, and clicks to keep the session alive
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('scroll', handleActivity);
    window.addEventListener('touchstart', handleActivity, { passive: true });
    window.addEventListener('click', handleActivity);

    // Run once on load/state change
    checkAndRefreshSession();

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('scroll', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
      window.removeEventListener('click', handleActivity);
    };
  }, [user]);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { accessToken, refreshToken, user: userData } = response.data;

      setAuthTokens(accessToken, refreshToken);
      cacheUserData(userData);
      setUser(userData);

      // Route based on role
      switch (userData.role) {
        case 'PATIENT':
          toast.success(t('auth2.welcomeBack'));
          router.push('/patient/dashboard');
          break;

        case 'PHARMACY':
          if (userData.pharmacyStatus === 'PENDING') {
            toast.success(t('auth2.applicationUnderReview'));
            router.push('/pending-approval');
          } else if (userData.pharmacyStatus === 'REJECTED') {
            toast.error(t('auth2.applicationRejected'));
            router.push('/pharmacy-rejected');
          } else if (userData.pharmacyStatus === 'APPROVED') {
            toast.success(t('auth2.welcomeBack'));
            router.push('/pharmacy/dashboard');
          } else {
            toast.error(t('auth2.invalidPharmacyStatus'));
            removeAuthTokens();
            setUser(null);
            router.push('/login');
          }
          break;

        case 'SUPER_ADMIN':
          toast.success(t('auth2.welcomeAdmin'));
          router.push('/super-admin/dashboard');
          break;

        case 'BRANCH_MANAGER':
          toast.success(t('auth2.welcomeBranchManager'));
          // If first login (temp password), redirect to change password
          if (response.data.requiresPasswordChange) {
            router.push('/branch/change-password');
          } else {
            router.push('/branch/dashboard');
          }
          break;

        case 'PHARMACIST':
        case 'CASHIER':
          toast.success(t('auth2.welcomeBack'));
          // If first login (temp password), redirect to change password
          if (response.data.requiresPasswordChange) {
            router.push('/staff/change-password');
          } else {
            router.push('/staff/dashboard');
          }
          break;

        case 'NURSE':
          // The backend reuses the 'NURSE' role string for both a pharmacy
          // branch-staff nurse and a hospital nurse. `hospitalId` is only
          // present on the hospital login response — use it as the
          // discriminator instead of the role string alone.
          if (isHospitalNurse(userData)) {
            toast.success(t('auth2.welcomeBack'));
            router.push(
              response.data.requiresPasswordChange
                ? '/hospital/nurse/settings'
                : '/hospital/nurse/dashboard'
            );
          } else {
            toast.success(t('auth2.welcomeBack'));
            if (response.data.requiresPasswordChange) {
              router.push('/staff/change-password');
            } else {
              router.push('/staff/dashboard');
            }
          }
          break;

        case 'DOCTOR':
          toast.success(t('auth2.welcomeBack'));
          router.push(
            response.data.requiresPasswordChange
              ? '/hospital/doctor/settings'
              : '/hospital/doctor/dashboard'
          );
          break;

        case 'HOSPITAL_ADMIN':
          if (userData.hospitalStatus === 'PENDING') {
            toast.success('Your hospital account is under review. Please wait for approval.');
            router.push('/pending-approval');
          } else if (userData.hospitalStatus === 'REJECTED') {
            toast.error('Your hospital account was rejected. Please update your documents and resubmit.');
            removeAuthTokens();
            clearUserCache();
            setUser(null);
            router.push('/login');
          } else if (userData.hospitalStatus === 'APPROVED') {
            toast.success(t('auth2.welcomeAdmin'));
            router.push(
              response.data.requiresPasswordChange
                ? '/hospital/admin/settings'
                : '/hospital/admin/dashboard'
            );
          } else {
            toast.error(t('auth2.invalidRole'));
            removeAuthTokens();
            clearUserCache();
            setUser(null);
            router.push('/login');
          }
          break;

        case 'RECEPTIONIST':
          toast.success('Welcome back!');
          router.push(
            response.data.requiresPasswordChange
              ? '/hospital/receptionist/settings'
              : '/hospital/receptionist/dashboard'
          );
          break;

        default:
          toast.error(t('auth2.invalidRole'));
          removeAuthTokens();
          setUser(null);
          router.push('/login');
      }
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
      throw error;
    }
  };

  const logout = async () => {
    const token = getAccessToken();

    // Clear local state instantly so the UI is responsive
    removeAuthTokens();
    clearUserCache();
    setUser(null);
    router.push('/login');
    toast.success(t('auth2.loggedOut') || 'Logged out successfully');

    if (token) {
      try {
        await api.post('/auth/logout', {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (error) {
        console.warn('Backend logout failed:', error);
      }
    }
  };

  const updateUser = (userData: Partial<User>) => {
    setUser((prev: User | null) => (prev ? { ...prev, ...userData } : null));
  };

  // Used by external login flows (e.g. Super Admin) that handle their own
  // token storage but still need to hydrate the AuthContext user state so
  // layout guards don't see null and redirect back to /login.
  const setUserDirectly = (userData: User) => {
    setUser(userData);
  };

  const refreshUser = async () => {
    try {
      const currentUser = getUserFromToken();
      if (!currentUser) throw new Error('No user');

      let endpoint = '';
      switch (currentUser.role) {
        case 'PHARMACY':
          endpoint = '/pharmacies/profile/me';
          break;
        case 'PATIENT':
          endpoint = '/patients/profile';
          break;
        case 'BRANCH_MANAGER':
        case 'PHARMACIST':
        case 'CASHIER':
          endpoint = '/staff/profile/me';
          break;
        case 'NURSE':
          // Hospital nurses must not hit the pharmacy-staff endpoint — their JWT
          // is rejected there, which triggers the catch block and involuntarily
          // logs them out. No hospital-nurse profile endpoint exists yet.
          if (isHospitalNurse(currentUser)) return;
          endpoint = '/staff/profile/me';
          break;
        default:
          // SUPER_ADMIN, DOCTOR, HOSPITAL_ADMIN, RECEPTIONIST — no profile
          // endpoint yet; preserve the cached user rather than hitting a wrong
          // endpoint and triggering an accidental logout.
          return;
      }

      const response = await api.get(endpoint);
      const userData = { ...currentUser, ...response.data };
      cacheUserData(userData);
      setUser(userData);
    } catch {
      removeAuthTokens();
      clearUserCache();
      setUser(null);
      router.push('/login');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser, refreshUser, setUserDirectly }}>
    {children}
    </AuthContext.Provider>
);
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};