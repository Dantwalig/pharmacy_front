// frontend/src/lib/auth.ts - Auth Helpers

import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

export interface User {
  id: string;
  email: string;
  role: 'SUPER_ADMIN' | 'PHARMACY' | 'PATIENT';
  profile?: any;
}

export const setAuthTokens = (accessToken: string, refreshToken: string) => {
  Cookies.set('accessToken', accessToken, { expires: 1/48 }); // 30 min
  Cookies.set('refreshToken', refreshToken, { expires: 7 }); // 7 days
};

export const removeAuthTokens = () => {
  Cookies.remove('accessToken');
  Cookies.remove('refreshToken');
  Cookies.remove('user');
};

export const getAccessToken = () => Cookies.get('accessToken');
export const getRefreshToken = () => Cookies.get('refreshToken');

export const isAuthenticated = () => !!getAccessToken();

export const getUserFromToken = (): User | null => {
  const token = getAccessToken();
  if (!token) return null;

  try {
    const decoded: any = jwtDecode(token);
    return {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role,
    };
  } catch {
    return null;
  }
};
