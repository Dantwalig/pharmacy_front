'use client';

import { useState } from 'react';
import HospitalSidebar from '@/components/hospital/HospitalSidebar';
import HospitalTopbar from '@/components/hospital/HospitalTopbar';
import { useHospitalReceptionistUser } from '@/lib/hospital';
import HospitalGuard from '@/components/guards/HospitalGuard';

export default function HospitalReceptionistLayout({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { userName, roleLabel, hospitalName } = useHospitalReceptionistUser();

    return (
        <HospitalGuard allowedRole="RECEPTIONIST">
            <div className="flex min-h-screen bg-[#F8FAFC]">
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}
                <HospitalSidebar
                    portalType="receptionist"
                    open={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                />
                <div className="flex-1 lg:ml-64 min-w-0 flex flex-col">
                    <HospitalTopbar
                        userName={userName}
                        roleLabel={roleLabel}
                        hospitalName={hospitalName}
                        onMenuClick={() => setSidebarOpen(true)}
                    />
                    <main className="flex-1 overflow-x-hidden p-4 lg:p-6">{children}</main>
                </div>
            </div>
        </HospitalGuard>
    );
}
