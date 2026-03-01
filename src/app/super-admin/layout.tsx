// frontend/src/app/super-admin/layout.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import SuperAdminSidebar from '@/components/super-admin/SuperAdminSidebar';
import SuperAdminTopbar from '@/components/super-admin/SuperAdminTopbar';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'SUPER_ADMIN')) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <LoadingSpinner />
    </div>
  );

  if (!user || user.role !== 'SUPER_ADMIN') return null;

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <SuperAdminSidebar />
      <div className="flex-1 flex flex-col">
        <SuperAdminTopbar />
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}