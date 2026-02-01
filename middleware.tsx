// middleware.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('accessToken')?.value;
  const userRole = request.cookies.get('userRole')?.value;

  const { pathname } = request.nextUrl;

  const isSuperAdminRoute = pathname.startsWith('/super-admin');
  const isPharmacyRoute = pathname.startsWith('/pharmacy');

  if (isSuperAdminRoute) {
    if (!token || userRole !== 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  if (isPharmacyRoute) {
    if (!token || userRole !== 'PHARMACY') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}
export const config = {
  matcher: ['/super-admin/:path*', '/pharmacy/:path*'],
};