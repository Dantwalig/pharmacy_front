'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { isAuthenticated, isHospitalNurse } from '@/lib/auth';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { User } from '@/types';

interface HospitalGuardProps {
    children: React.ReactNode;
    allowedRole: 'HOSPITAL_ADMIN' | 'DOCTOR' | 'NURSE' | 'RECEPTIONIST';
}

function getHomeRoute(user: User): string {
    switch (user.role) {
        case 'PATIENT':
            return '/patient/dashboard';
        case 'SUPER_ADMIN':
            return '/super-admin/dashboard';
        case 'BRANCH_MANAGER':
            return '/branch/dashboard';
        case 'PHARMACIST':
        case 'CASHIER':
            return '/staff/dashboard';
        case 'NURSE':
            return isHospitalNurse(user) ? '/hospital/nurse/dashboard' : '/staff/dashboard';
        case 'DOCTOR':
            return '/hospital/doctor/dashboard';
        case 'RECEPTIONIST':
            return '/hospital/receptionist/dashboard';
        case 'HOSPITAL_ADMIN':
            if (user.hospitalStatus === 'PENDING') {
                return '/pending-approval';
            }
            return '/hospital/admin/dashboard';
        case 'PHARMACY':
            if (user.pharmacyStatus === 'PENDING') {
                return '/pending-approval';
            } else if (user.pharmacyStatus === 'REJECTED') {
                return '/pharmacy-rejected';
            }
            return '/pharmacy/dashboard';
        default:
            return '/login';
    }
}

export default function HospitalGuard({ children, allowedRole }: HospitalGuardProps) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (loading) return;

        // Check if authenticated
        if (!isAuthenticated() || !user) {
            router.push('/login');
            return;
        }

        // Role-specific authorization checks
        if (allowedRole === 'HOSPITAL_ADMIN') {
            if (user.role !== 'HOSPITAL_ADMIN') {
                router.push(getHomeRoute(user));
                return;
            }
            if (user.hospitalStatus === 'PENDING') {
                router.push('/pending-approval');
                return;
            }
            if (user.hospitalStatus !== 'APPROVED') {
                router.push('/login');
                return;
            }
        } else if (allowedRole === 'NURSE') {
            // Must be a hospital nurse (having hospitalId)
            if (user.role !== 'NURSE' || !isHospitalNurse(user)) {
                router.push(getHomeRoute(user));
                return;
            }
        } else {
            // Other roles: DOCTOR, RECEPTIONIST
            if (user.role !== allowedRole) {
                router.push(getHomeRoute(user));
                return;
            }
        }
    }, [user, loading, router, allowedRole]);

    // Show loading while auth checks are in progress
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    // Confirm standard authorized state before rendering child components
    const isAuthorized = (() => {
        if (!user) return false;

        if (allowedRole === 'HOSPITAL_ADMIN') {
            return user.role === 'HOSPITAL_ADMIN' && user.hospitalStatus === 'APPROVED';
        }

        if (allowedRole === 'NURSE') {
            return user.role === 'NURSE' && isHospitalNurse(user);
        }

        return user.role === allowedRole;
    })();

    if (isAuthorized) {
        return <>{children}</>;
    }

    return null;
}
