// frontend/src/app/branch/layout.tsx

'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import BranchSidebar from '@/components/branch/BranchSidebar';
import BranchTopbar from '@/components/branch/BranchTopbar';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

// These pages don't need the sidebar shell (they're standalone)
const STANDALONE_PAGES = ['/branch/change-password', '/branch/pending-approval'];

export default function BranchLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    if (!user || user.role !== 'BRANCH_MANAGER') {
      router.push('/login');
      return;
    }

    const branchStatus = (user as any).branchStatus;
    const isStandalone = STANDALONE_PAGES.some(p => pathname.startsWith(p));

    // Branch not yet approved — redirect to pending/upload page
    if ((branchStatus === 'INVITED' || branchStatus === 'PENDING') && !isStandalone) {
      router.push('/branch/pending-approval');
    }
  }, [user, loading, router, pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user || user.role !== 'BRANCH_MANAGER') return null;

  // Standalone pages render without the sidebar shell
  const isStandalone = STANDALONE_PAGES.some(p => pathname.startsWith(p));
  if (isStandalone) return <>{children}</>;

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <BranchSidebar />
      <div className="flex-1 lg:ml-64">
        <BranchTopbar />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}