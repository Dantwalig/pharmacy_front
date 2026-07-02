// src/app/hospital/doctor/layout.tsx
'use client';

import { useState, useEffect } from 'react';
import HospitalSidebar from '@/components/hospital/HospitalSidebar';
import HospitalTopbar from '@/components/hospital/HospitalTopbar';
import { api } from '@/lib/api';
import { getCachedUser } from '@/lib/auth';

// Doctor name and specialisation come from GET /api/doctors/dashboard.
// The login response caches { id, email, role, hospitalId, hospitalName }
// but no firstName/lastName, so we fetch them here.

interface DoctorDashboardMeta {
  doctorName:     string | null;
  specialization: string;
  hospitalName:   string | null;
}

export default function HospitalDoctorLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen,  setSidebarOpen]  = useState(false);
  const [userName,     setUserName]     = useState('Doctor');
  const [roleLabel,    setRoleLabel]    = useState('Doctor');
  const [hospitalName, setHospitalName] = useState('');

  useEffect(() => {
    // hospitalName is available immediately from the cached login response
    const cached = getCachedUser() as any;
    if (cached?.hospitalName) setHospitalName(cached.hospitalName);

    // Fetch doctor name and specialisation from the new dashboard endpoint
    api.get<DoctorDashboardMeta>('/doctors/dashboard')
      .then((res) => {
        if (res.data.doctorName)    setUserName(res.data.doctorName);
        if (res.data.specialization) setRoleLabel(res.data.specialization);
        if (res.data.hospitalName)  setHospitalName(res.data.hospitalName);
      })
      .catch(() => {
        // Silently fall back to defaults — layout must always render
      });
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <HospitalSidebar
        portalType="doctor"
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex-1 lg:ml-64 min-w-0">
        <HospitalTopbar
          userName={userName}
          roleLabel={roleLabel}
          hospitalName={hospitalName}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
