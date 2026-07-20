// frontend/src/lib/auth.ts - Auth Helpers
// UPDATED VERSION - Added BRANCH_MANAGER, PHARMACIST, CASHIER, NURSE roles

import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

import { User, DecodedToken } from '@/types';

export const setAuthTokens = (accessToken: string, refreshToken: string) => {
  Cookies.set('accessToken', accessToken, { expires: 1/48 }); // 30 min
  Cookies.set('refreshToken', refreshToken, { expires: 7 }); // 7 days

  const decoded = jwtDecode<DecodedToken>(accessToken);
  Cookies.set('userRole', decoded.role, { expires: 7, sameSite: 'lax' });
};

export const removeAuthTokens = () => {
  Cookies.remove('accessToken');
  Cookies.remove('refreshToken');
  Cookies.remove('userRole');
  Cookies.remove('user');
};

export const getAccessToken = () => Cookies.get('accessToken');
export const getRefreshToken = () => Cookies.get('refreshToken');

export const isAuthenticated = () => !!getAccessToken();

export const cacheUserData = (user: User): void => {
  Cookies.set('user', JSON.stringify(user), { expires: 7 });
};

export const getCachedUser = (): User | null => {
  const userData = Cookies.get('user');
  if (!userData) return null;
  try {
    return JSON.parse(userData);
  } catch {
    return null;
  }
};

export const clearUserCache = (): void => {
  Cookies.remove('user');
};

export const getUserFromToken = (): User | null => {
  const token = getAccessToken();
  if (!token) {
    if (typeof window !== 'undefined') {
      clearUserCache();
    }
    return null;
  }

  const cachedUser = getCachedUser();
  if (cachedUser) return cachedUser;

  try {
    const decoded = jwtDecode<DecodedToken>(token);
    return {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role,
      isVerified: decoded.isVerified || true,
      pharmacyStatus: decoded.pharmacyStatus,
      // Hospital-side claims — only present on hospital logins. The decoded
      // token's `status` is overloaded by the backend (hospital approval
      // status for HOSPITAL_ADMIN vs. staff status for DOCTOR/NURSE/
      // RECEPTIONIST); hospitalName isn't in the JWT payload at all, so it
      // won't survive a decode-only fallback (only the cached-user path has it).
      hospitalId: decoded.hospitalId,
      hospitalStatus: decoded.role === 'HOSPITAL_ADMIN' ? (decoded.status as User['hospitalStatus']) : undefined,
      status: decoded.role !== 'HOSPITAL_ADMIN' ? (decoded.status as User['status']) : undefined,
    };
  } catch {
    return null;
  }
};

/**
 * Returns true only for hospital nurses.
 * Pharmacy/branch nurses also have role "NURSE" but do not have a hospitalId.
 */
export const isHospitalNurse = (
  user?: Partial<User> | null
): user is User & { role: 'NURSE'; hospitalId: string } => {
  return user?.role === 'NURSE' && Boolean(user.hospitalId);
};