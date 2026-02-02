// frontend/src/lib/auth.ts - Auth Helpers
// UPDATED VERSION - Added user data caching with pharmacy status

import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

export interface User {
  id: string;
  email: string;
  role: 'SUPER_ADMIN' | 'PHARMACY' | 'PATIENT';
  isVerified: boolean;
  pharmacyStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string | null;
  profile?: any;
}

export const setAuthTokens = (accessToken: string, refreshToken: string) => {
  Cookies.set('accessToken', accessToken, { expires: 1/48 }); // 30 min
  Cookies.set('refreshToken', refreshToken, { expires: 7 }); // 7 days

  const decoded: any = jwtDecode(accessToken);
  Cookies.set('userRole', decoded.role, { expires: 7, sameSite: 'lax' });
};

export const removeAuthTokens = () => {
  Cookies.remove('accessToken');
  Cookies.remove('refreshToken');
  Cookies.remove('user'); // Remove cached user data
};

export const getAccessToken = () => Cookies.get('accessToken');
export const getRefreshToken = () => Cookies.get('refreshToken');

export const isAuthenticated = () => !!getAccessToken();

// NEW: Cache full user data (including pharmacyStatus)
export const cacheUserData = (user: User): void => {
  Cookies.set('user', JSON.stringify(user), { expires: 7 }); // Same as refresh token
};

// NEW: Get cached user data
export const getCachedUser = (): User | null => {
  const userData = Cookies.get('user');
  if (!userData) return null;

  try {
    return JSON.parse(userData);
  } catch {
    return null;
  }
};

// NEW: Clear cached user data
export const clearUserCache = (): void => {
  Cookies.remove('user');
};

// UPDATED: Try cached data first, then decode token
export const getUserFromToken = (): User | null => {
  // First, try to get cached user data (includes pharmacyStatus)
  const cachedUser = getCachedUser();
  if (cachedUser) {
    return cachedUser;
  }

  // Fallback: decode token (but token might not have pharmacyStatus)
  const token = getAccessToken();
  if (!token) return null;

  try {
    const decoded: any = jwtDecode(token);
    return {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role,
      isVerified: decoded.isVerified || true,
      pharmacyStatus: decoded.pharmacyStatus,
    };
  } catch {
    return null;
  }
};