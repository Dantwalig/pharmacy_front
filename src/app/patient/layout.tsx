// frontend/src/app/patient/layout.tsx

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import PatientSidebar from '@/components/patient/PatientSidebar';
import PatientTopbar from '@/components/patient/PatientTopbar';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

export default function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'PATIENT')) {
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

  if (!user || user.role !== 'PATIENT') {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <PatientSidebar />
      <div className="flex-1 ml-64">
        <PatientTopbar />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
