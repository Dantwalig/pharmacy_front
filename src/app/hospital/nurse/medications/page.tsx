'use client';

import React, { useState } from 'react';
import {
    Search,
    Filter,
    Calendar,
    MoreHorizontal,
    CheckCircle2,
    Clock,
    AlertCircle,
    XCircle,
    ChevronRight,
    RotateCcw,
    Pill,
} from 'lucide-react';
import { MOCK_MEDICATIONS, MOCK_MEDICATION_STATS } from '@/mock/hospital/medications';
import { MedicationAdministration, MedicationStatus } from '@/types/hospital';

export default function MedicationAdministrationPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [medicationSearch, setMedicationSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('All Statuses');
    const [selectedDate, setSelectedDate] = useState('06/09/2026');

    const filteredMedications = MOCK_MEDICATIONS.filter((med) => {
        const matchesPatient = med.patientName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesMed = med.medicationName.toLowerCase().includes(medicationSearch.toLowerCase());
        const matchesStatus = statusFilter === 'All Statuses' || med.status === statusFilter;
        return matchesPatient && matchesMed && matchesStatus;
    });

    const getStatusStyle = (status: MedicationStatus) => {
        switch (status) {
            case 'ADMINISTERED':
                return 'bg-[#F0FDF4] text-[#16A34A] border-[#DCFCE7]';
            case 'DUE':
                return 'bg-[#FFFBEB] text-[#D97706] border-[#FEF3C7]';
            case 'OVERDUE':
            case 'MISSED':
                return 'bg-[#FEF2F2] text-[#DC2626] border-[#FEE2E2]';
            case 'UPCOMING':
                return 'bg-[#EFF6FF] text-[#2563EB] border-[#DBEAFE]';
            default:
                return 'bg-gray-100 text-gray-600 border-gray-200';
        }
    };

    return (
        <div className="p-6 lg:p-8 space-y-8">
            {/* Header */}
            <div className="rounded-3xl p-8 shadow-sm relative overflow-hidden" style={{ background: '#EBF5FF' }}>
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold text-[#1E3A5F]">Medication Administration</h1>
                    <p className="mt-2 max-w-2xl font-medium" style={{ color: '#0284C7' }}>
                        Track patient schedules, record doses, and monitor compliance in real-time.
                    </p>
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#38BDF8] opacity-5 rounded-full -mr-20 -mt-20 blur-3xl" />
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    label="Missed Doses"
                    value={MOCK_MEDICATION_STATS.missedDoses}
                    icon={<XCircle className="w-6 h-6 text-[#DC2626]" />}
                    bgColor="bg-[#FEF2F2]"
                    borderColor="border-[#FEE2E2]"
                />
                <StatCard
                    label="Due Today"
                    value={MOCK_MEDICATION_STATS.dueToday}
                    icon={<Clock className="w-6 h-6 text-[#38BDF8]" />}
                    bgColor="bg-[#F0F9FF]"
                    borderColor="border-[#E0F2FE]"
                />
                <StatCard
                    label="Upcoming Medications"
                    value={MOCK_MEDICATION_STATS.upcomingMedications}
                    icon={<AlertCircle className="w-6 h-6 text-[#D97706]" />}
                    bgColor="bg-[#FFFBEB]"
                    borderColor="border-[#FEF3C7]"
                />
                <StatCard
                    label="Administered Today"
                    value={MOCK_MEDICATION_STATS.administeredToday}
                    icon={<CheckCircle2 className="w-6 h-6 text-[#16A34A]" />}
                    bgColor="bg-[#F0FDF4]"
                    borderColor="border-[#DCFCE7]"
                />
            </div>

            {/* Filters Section */}
            <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-sm flex flex-wrap items-center gap-4">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8] w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search Patient..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#38BDF8] transition-all"
                    />
                </div>
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8] w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search Medication..."
                        value={medicationSearch}
                        onChange={(e) => setMedicationSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#38BDF8] transition-all"
                    />
                </div>
                <div className="relative min-w-[160px]">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full pl-4 pr-10 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#38BDF8] appearance-none cursor-pointer"
                    >
                        <option>All Statuses</option>
                        <option value="ADMINISTERED">Administered</option>
                        <option value="DUE">Due</option>
                        <option value="UPCOMING">Upcoming</option>
                        <option value="MISSED">Missed</option>
                        <option value="OVERDUE">Overdue</option>
                    </select>
                    <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] w-4 h-4 pointer-events-none" />
                </div>
                <div className="relative min-w-[160px]">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8] w-4 h-4" />
                    <input
                        type="text"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#38BDF8]"
                    />
                </div>
                <button
                    onClick={() => {
                        setSearchTerm('');
                        setMedicationSearch('');
                        setStatusFilter('All Statuses');
                    }}
                    className="px-6 py-2.5 border border-[#E2E8F0] text-[#64748B] text-sm font-bold rounded-xl hover:bg-gray-50 transition-all flex items-center gap-2"
                >
                    <RotateCcw className="w-4 h-4" />
                    Reset Filters
                </button>
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-3xl border border-[#E2E8F0] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                                <th className="px-6 py-5 text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Patient Name</th>
                                <th className="px-6 py-5 text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Medication Name</th>
                                <th className="px-6 py-5 text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Dosage</th>
                                <th className="px-6 py-5 text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Route</th>
                                <th className="px-6 py-5 text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Scheduled Time</th>
                                <th className="px-6 py-5 text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Status</th>
                                <th className="px-6 py-5 text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Assigned Nurse</th>
                                <th className="px-6 py-5 text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E2E8F0]">
                            {filteredMedications.map((med) => (
                                <tr key={med.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-6 py-5">
                                        <span className="text-sm font-bold text-[#1E3A5F]">{med.patientName}</span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                                                <Pill className="w-4 h-4 text-[#38BDF8]" />
                                            </div>
                                            <span className="text-sm font-medium text-[#1E3A5F]">{med.medicationName}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className="text-sm text-[#64748B]">{med.dosage}</span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className="text-sm text-[#64748B]">{med.route}</span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className="text-sm font-bold text-[#1E3A5F]">{med.scheduledTime}</span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${getStatusStyle(med.status)}`}>
                                            {med.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className="text-sm text-[#64748B]">{med.assignedNurse}</span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-2">
                                            {med.status === 'DUE' || med.status === 'OVERDUE' ? (
                                                <>
                                                    <button className="px-4 py-2 bg-[#38BDF8] text-white rounded-lg text-xs font-bold hover:bg-[#0EA5E9] transition-all shadow-sm">
                                                        Record
                                                    </button>
                                                    <button className="px-3 py-2 text-[#64748B] hover:text-[#DC2626] rounded-lg text-xs font-bold transition-all">
                                                        Mark Missed
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button className="px-4 py-2 bg-gray-100 text-[#1E3A5F] rounded-lg text-xs font-bold hover:bg-gray-200 transition-all">
                                                        Details
                                                    </button>
                                                    <button className="px-3 py-2 text-[#38BDF8] hover:text-[#0EA5E9] rounded-lg text-xs font-bold transition-all">
                                                        History
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filteredMedications.length === 0 && (
                    <div className="p-20 text-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="w-8 h-8 text-gray-300" />
                        </div>
                        <h3 className="text-[#1E3A5F] font-bold">No medications found</h3>
                        <p className="text-[#64748B] text-sm mt-1">Try adjusting your filters or search term.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function StatCard({ label, value, icon, bgColor, borderColor }: { label: string; value: number; icon: React.ReactNode; bgColor: string; borderColor: string }) {
    return (
        <div className={`p-6 rounded-3xl bg-white border ${borderColor} shadow-sm flex items-center gap-5 hover:shadow-md transition-all group`}>
            <div className={`w-14 h-14 rounded-2xl ${bgColor} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                {icon}
            </div>
            <div>
                <p className="text-2xl font-black text-[#1E3A5F]">{value}</p>
                <p className="text-xs font-bold text-[#64748B] uppercase tracking-wide mt-0.5">{label}</p>
            </div>
        </div>
    );
}
