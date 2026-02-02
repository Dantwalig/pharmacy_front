// middleware.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Decode JWT to read the payload
function decodeToken(token: string): { role?: string; pharmacyStatus?: string } | null {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    return decoded;
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get('accessToken')?.value;
  const { pathname } = request.nextUrl;

  const isSuperAdminRoute = pathname.startsWith('/super-admin');
  const isPharmacyRoute   = pathname.startsWith('/pharmacy');
  const isPatientRoute    = pathname.startsWith('/patient');

  // If the route is not one of the three protected prefixes, let it through.
  // This naturally covers /login, /signup, /pending-approval,
  // /pharmacy-rejected, and every other public page.
  if (!isSuperAdminRoute && !isPharmacyRoute && !isPatientRoute) {
    return NextResponse.next();
  }

 // Protected route from here on a valid token is required.
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const payload = decodeToken(token);
  if (!payload) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (isSuperAdminRoute) {
    if (payload.role !== 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }

  if (isPharmacyRoute) {
    // Wrong role entirely → back to login
    if (payload.role !== 'PHARMACY') {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Check pharmacy approval status
    if (payload.pharmacyStatus === 'PENDING') {
      return NextResponse.redirect(new URL('/pending-approval', request.url));
    }

    if (payload.pharmacyStatus === 'REJECTED') {
      return NextResponse.redirect(new URL('/pharmacy-rejected', request.url));
    }

    // Anything other than APPROVED is blocked.
    if (payload.pharmacyStatus !== 'APPROVED') {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
  }

  if (isPatientRoute) {
    if (payload.role !== 'PATIENT') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  // Only run middleware on the three protected route prefixes.
  // Pages like /login, /signup, /pending-approval, /pharmacy-rejected
  // are NOT matched here, so they are always publicly accessible.
  matcher: ['/super-admin/:path*','/pharmacy/:path*','/patient/:path*',],
};