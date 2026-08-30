import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function decodeToken(token: string): { role?: string; pharmacyStatus?: string; status?: string; hospitalId?: string } | null {
  try {
    const payload = token.split('.')[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = JSON.parse(atob(base64));
    return decoded;
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get('accessToken')?.value;
  const { pathname } = request.nextUrl;

  const isSuperAdminRoute = pathname.startsWith('/super-admin') && pathname !== '/super-admin/login';
  const isSystemAdminRoute = pathname.startsWith('/system-admin');
  const isPharmacyRoute   = pathname.startsWith('/pharmacy');
  const isPatientRoute    = pathname.startsWith('/patient');
  const isBranchRoute     = pathname.startsWith('/branch');
  const isStaffRoute      = pathname.startsWith('/staff');
  // Hospital signup/registration must stay public — only the portals below are guarded
  const isHospitalRoute   = pathname.startsWith('/hospital') && pathname !== '/hospital/register';

  if (!isSuperAdminRoute && !isSystemAdminRoute && !isPharmacyRoute && !isPatientRoute && !isBranchRoute && !isStaffRoute && !isHospitalRoute) {
    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  const payload = decodeToken(token);
  if (!payload) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (isSuperAdminRoute) {
    if (payload.role !== 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  if (isPharmacyRoute) {
    if (payload.role !== 'PHARMACY') {
      return NextResponse.redirect(new URL('/', request.url));
    }
    
    const status = payload.pharmacyStatus || payload.status;
    
    if (status === 'PENDING') {
      return NextResponse.redirect(new URL('/pending-approval', request.url));
    }
    if (status === 'REJECTED') {
      return NextResponse.redirect(new URL('/pharmacy-rejected', request.url));
    }
    if (status !== 'APPROVED') {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  if (isPatientRoute) {
    const isDevMode = request.cookies.get('dev_mode')?.value === 'true';
    const isPatientEnabled = process.env.NEXT_PUBLIC_ENABLE_PATIENT_FEATURES === 'true';
    
    // Block if neither env flag nor dev_mode is active
    if (!isPatientEnabled && !isDevMode) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    if (payload.role !== 'PATIENT') {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }


  if (isSystemAdminRoute) {
    if (payload.role !== 'SYSTEM_ADMIN') {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  if (isBranchRoute) {
    // Mirror BRANCH_PORTAL_ROLES in src/app/branch/layout.tsx — the whole
    // branch team (manager + counter staff) uses the counter workspace.
    const branchRoles = ['BRANCH_MANAGER', 'PHARMACIST', 'CASHIER', 'NURSE'];
    if (!branchRoles.includes(payload.role || '')) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    // A hospital nurse shares role 'NURSE' but has a hospitalId — block them
    // from /branch/* the same way /staff/* does.
    if (payload.role === 'NURSE' && payload.hospitalId) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  if (isStaffRoute) {
    const staffRoles = ['PHARMACIST', 'CASHIER', 'NURSE'];
    if (!staffRoles.includes(payload.role || '')) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    // A hospital nurse shares role 'NURSE' but has a hospitalId — block them
    // from /staff/* the same way the /hospital/* block does it (see below).
    if (payload.role === 'NURSE' && payload.hospitalId) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  if (isHospitalRoute) {
    // The backend reuses role 'NURSE' for both a pharmacy/branch-staff nurse
    // and a hospital nurse — hospitalId is only present on the hospital case
    // (see src/docs/HOSPITAL_AUTH_INTEGRATION.md for the full writeup).
    const isHospitalNurse = payload.role === 'NURSE' && !!payload.hospitalId;
    const isValidHospitalRole =
      payload.role === 'HOSPITAL_ADMIN' ||
      payload.role === 'DOCTOR' ||
      payload.role === 'RECEPTIONIST' ||
      isHospitalNurse;

    if (!isValidHospitalRole) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    if (pathname.startsWith('/hospital/admin') && payload.role !== 'HOSPITAL_ADMIN') {
      return NextResponse.redirect(new URL('/', request.url));
    }
    if (pathname.startsWith('/hospital/doctor') && payload.role !== 'DOCTOR') {
      return NextResponse.redirect(new URL('/', request.url));
    }
    if (pathname.startsWith('/hospital/nurse') && !isHospitalNurse) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    if (pathname.startsWith('/hospital/receptionist') && payload.role !== 'RECEPTIONIST') {
      return NextResponse.redirect(new URL('/', request.url));
    }

    if (payload.role === 'HOSPITAL_ADMIN') {
      const hospitalStatus = payload.status;
      if (hospitalStatus === 'PENDING') {
        return NextResponse.redirect(new URL('/pending-approval', request.url));
      }
      if (hospitalStatus && hospitalStatus !== 'APPROVED') {
        return NextResponse.redirect(new URL('/', request.url));
      }
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/super-admin/:path*',
    '/pharmacy/:path*',
    '/patient/:path*',
    '/branch/:path*',
    '/staff/:path*',
    '/hospital/:path*',
  ],
};
