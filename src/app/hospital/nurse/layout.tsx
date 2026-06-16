'use client';

import { useState } from 'react';
import HospitalSidebar from '@/components/hospital/HospitalSidebar';
import HospitalTopbar from '@/components/hospital/HospitalTopbar';

export default function HospitalNurseLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <HospitalSidebar
        portalType="nurse"
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex-1 lg:ml-64 min-w-0">
        <HospitalTopbar
          userName="Claudine Umutoni"
          roleLabel="Registered Nurse"
          hospitalName="E-Vuze General Hospital"
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
