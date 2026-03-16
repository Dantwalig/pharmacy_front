// frontend/src/app/staff/layout.tsx

'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import StaffSidebar from '@/components/staff/StaffSidebar';
import StaffTopbar from '@/components/staff/Stafftopbar';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

const STAFF_ROLES = ['PHARMACIST', 'CASHIER', 'NURSE'];
const STANDALONE_PAGES = ['/staff/change-password'];

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && (!user || !STAFF_ROLES.includes(user.role))) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user || !STAFF_ROLES.includes(user.role)) return null;

  // Change-password page renders fullscreen without sidebar
  const isStandalone = STANDALONE_PAGES.some(p => pathname.startsWith(p));
  if (isStandalone) return <>{children}</>;

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <StaffSidebar />
      <div className="flex-1 lg:ml-64">
        <StaffTopbar />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}