// src/app/hospital/receptionist/checkingQueue/page.tsx
'use client';

import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import Link from 'next/link';
import { MOCK_DASHBOARD_STATS } from '@/mock/hospital/dashboard';
import { CalendarIcon, UsersIcon, ClockIcon, PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const BLUE = '#1E3A8A';
const lightBlue = '#0284C7';

const MOCK_QUEUE = [
  { id: 'Q-012', name: 'Kevine Mugisha', doctor: 'Dr. Samuel Nkurunziza', department: 'General Medicine', waitTime: '45m ago', status: 'WAITING' },
  { id: 'Q-013', name: 'Jean Paul Nsengimana', doctor: 'Dr. Albert Munyaneza', department: 'Pediatrics', waitTime: '31m ago', status: 'CALLED' },
  { id: 'Q-014', name: 'Angelique Umutoni', doctor: "Dr. Jeanne d'Arc", department: 'ICU', waitTime: '18m ago', status: 'IN CONSULTATION' },
  { id: 'Q-015', name: 'Maurice Kwizera', doctor: 'Dr. Samuel Nkurunziza', department: 'General Medicine', waitTime: '8m ago', status: 'WAITING' },
];

export default function HospitalCheckingQueuePage() {
    const { t } = useTranslation();
    
    // Overview Cards STATS
    const overviewCards = [
      {
        title: MOCK_DASHBOARD_STATS?.appointmentsByStatus?.CONFIRMED + MOCK_DASHBOARD_STATS?.appointmentsByStatus?.PENDING || 0,
        label: t('hospital.patientsWaiting', 'Patients Waiting'),
        icon: UsersIcon,
        borderColor: '#3B82F6',
        iconColor: '#0284C7',
        iconBg: '#EBF8FF',
      },
      { title: '28 min', label: t('hospital.averageWaitTime', 'Average Wait Time'), icon: ClockIcon, borderColor: '#F59E0B', iconColor: '#F59E0B', iconBg: '#FEF3C7' },
      { title: '45 min', label: t('hospital.longestWaitTime', 'Longest Wait Time'), icon: ClockIcon, borderColor: '#EF4444', iconColor: '#EF4444', iconBg: '#FEE2E2' },
      { title: 1, label: t('hospital.beingServed', 'Patients Being Served'), icon: CalendarIcon, borderColor: '#10B981', iconColor: '#10B981', iconBg: '#D1FAE5' },
    ];

    const [searchTerm, setSearchTerm] = useState('');
    const [department, setDepartment] = useState('ALL');
    const [doctor, setDoctor] = useState('ALL');
    const [status, setStatus] = useState('ALL');
    
    const [selectedPatient, setSelectedPatient] = useState<any | null>(null);

    const departments = [ 'ALL', ...new Set(MOCK_QUEUE.map((p) => p.department)), ];
    const doctors = [ 'ALL', ...new Set(MOCK_QUEUE.map((p) => p.doctor)),];
    const statuses = ['ALL', ...new Set(MOCK_QUEUE.map((p) => p.status)), ];

    const filteredQueue = MOCK_QUEUE.filter((patient) => {
    const matchesSearch =
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDepartment = department === 'ALL' || patient.department === department;
    const matchesDoctor = doctor === 'ALL' || patient.doctor === doctor;
    const matchesStatus = status === 'ALL' || patient.status === status;

    return (
        matchesSearch &&
        matchesDepartment &&
        matchesDoctor &&
        matchesStatus
    );
    });

    // Status label translator (data-driven badge values)
    const STATUS_LABEL: Record<string, string> = {
        'WAITING': 'hospital.statusWaiting',
        'CALLED': 'hospital.statusCalled',
        'IN CONSULTATION': 'hospital.statusInConsultation',
    };
    const statusLabel = (s: string) => (STATUS_LABEL[s] ? t(STATUS_LABEL[s]) : s);

    // Helper color picker
    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'WAITING':
                return 'bg-purple-50 text-purple-600 text-xs font-bold px-2.5 py-1 rounded-full';
            case 'CALLED':
                return 'bg-amber-50 text-amber-600 text-xs font-bold px-2.5 py-1 rounded-full';
            case 'IN CONSULTATION':
                return 'bg-sky-50 text-sky-600 text-xs font-bold px-2.5 py-1 rounded-full';
            default:
                return 'bg-gray-100 text-gray-600 text-xs font-bold px-2.5 py-1 rounded-full';
        }
    };

    return (
        <div className="space-y-6">
            {/* Hero Header */}
            <div className="rounded-2xl p-8" style={{ background: '#EBF5FF' }}>
                <h1 className="text-3xl font-extrabold" style={{ color: BLUE }}>{t('hospital.checkInTitle', 'Check-In & Queue Management')}</h1>
                <p className="mt-1 text-sm" style={{ color: lightBlue }}>{t('hospital.checkInSubtitle', 'Optimize patient flow, check-in schedules, and allocate active consulting doctors in real-time.')}</p>
            </div>

            {/* Metric Cards Grid */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                {overviewCards.map((card) => {
                    const Icon = card.icon;
                    return (
                        <div key={card.label} className="rounded-xl bg-white p-5 shadow-sm" style={{ borderLeft: `4px solid ${card.borderColor}` }}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-3xl font-bold text-gray-900">{card.title}</h2>
                                    <p className="mt-1 text-sm text-gray-500">{card.label}</p>
                                </div>
                                <div className="flex h-12 w-12 items-center justify-center rounded-full" style={{ backgroundColor: card.iconBg }}>
                                    <Icon className="h-6 w-6" style={{ color: card.iconColor }} />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col lg:flex-row lg:items-center gap-3">
                <div className="relative flex-1">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder={t('hospital.searchPatient', 'Search Patient...')}
                        className="w-full rounded-xl border border-gray-300 py-2.5 pl-10 pr-4 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
                <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm">
                {departments.map((dept) => (<option key={dept} value={dept}> {dept === 'ALL' ? t('hospital.allDepartments') : dept}</option>))}
                </select>

                <select
                value={doctor}
                onChange={(e) => setDoctor(e.target.value)}
                className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm">
                {doctors.map((doc) => ( <option key={doc} value={doc}>{doc === 'ALL' ? t('hospital.allDoctors') : doc}</option>))}
                </select>

                <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm" >
                {statuses.map((s) => (<option key={s} value={s}>{s === 'ALL' ? t('hospital.allStatuses') : statusLabel(s)} </option> ))}
                </select>
                <div className="flex items-center gap-2 lg:ml-auto">
                    <button
                    onClick={() => {
                        setSearchTerm('');
                        setDepartment('ALL');
                        setDoctor('ALL');
                        setStatus('ALL');
                        setSelectedPatient(null);
                    }}
                    className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
                    >
                    {t('hospital.reset')}
                    </button>
                    <button className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-600">
                        <PlusIcon className="h-4 w-4" />
                        {t('hospital.checkInPatient', 'Check-In Patient')}
                    </button>
                </div>
            </div>

            {/* split section*/}
            <div className="flex flex-col lg:flex-row gap-6 items-start">
                
                {/* Left Section: Queue Table */}
                <div className="flex-1 w-full overflow-hidden bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50/50 text-xs font-semibold uppercase tracking-wider text-gray-400">
                                    <th className="py-4 px-6">{t('hospital.thNo')}</th>
                                    <th className="py-4 px-6">{t('hospital.thPatientName')}</th>
                                    <th className="py-4 px-6">{t('hospital.thAssignedDoctor')}</th>
                                    <th className="py-4 px-6">{t('hospital.department')}</th>
                                    <th className="py-4 px-6">{t('hospital.thWaitDuration')}</th>
                                    <th className="py-4 px-6">{t('hospital.status')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 text-sm text-gray-700">
                                {filteredQueue.map((patient) => (
                                    <tr 
                                        key={patient.id} 
                                        onClick={() => setSelectedPatient(patient)}
                                        className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${selectedPatient?.id === patient.id ? 'bg-blue-50/40' : ''}`}
                                    >
                                        <td className="py-4 px-6 font-bold text-gray-900">{patient.id}</td>
                                        <td className="py-4 px-6 font-bold text-gray-900">{patient.name}</td>
                                        <td className="py-4 px-6 text-gray-500 whitespace-pre-line">{patient.doctor}</td>
                                        <td className="py-4 px-6 text-gray-500">{patient.department}</td>
                                        <td className="py-4 px-6 text-gray-500">{patient.waitTime}</td>
                                        <td className="py-4 px-6">
                                            <span className={getStatusStyle(patient.status)}>
                                                {statusLabel(patient.status)}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Right Section */}
                <div className="w-full lg:w-[380px] min-h-[350px] flex flex-col justify-center items-center bg-white rounded-2xl border border-gray-200/80 p-6 text-center shadow-sm sticky top-6">
                    {!selectedPatient ? (
                        <div className="max-w-xs">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border-2 border-dashed border-gray-200 text-gray-400 mb-4 text-xl font-light">
                                i
                            </div>
                            <h3 className="text-base font-bold text-slate-800 mb-1">{t('hospital.noPatientSelected')}</h3>
                            <p className="text-xs text-gray-400 leading-relaxed">
                                {t('hospital.noPatientSelectedHint')}
                            </p>
                        </div>
                    ) : (
                        <div className="w-full text-left h-full flex flex-col justify-between">
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">{selectedPatient.id}</span>
                                    <span className={getStatusStyle(selectedPatient.status)}>{selectedPatient.status}</span>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-1">{selectedPatient.name}</h3>
                                <p className="text-xs text-gray-400 mb-4">{t('hospital.waitingFor', { time: selectedPatient.waitTime })}</p>
                                
                                <hr className="border-gray-100 my-3" />
                                
                                <div className="space-y-3 text-xs">
                                    <div>
                                        <span className="block text-gray-400 uppercase tracking-wider font-medium mb-0.5">{t('hospital.assignedProvider')}</span>
                                        <span className="text-gray-800 font-semibold">{selectedPatient.doctor}</span>
                                    </div>
                                    <div>
                                        <span className="block text-gray-400 uppercase tracking-wider font-medium mb-0.5">{t('hospital.departmentUnit')}</span>
                                        <span className="text-gray-800 font-semibold">{selectedPatient.department}</span>
                                    </div>
                                </div>
                            </div>

                            <button 
                                onClick={() => setSelectedPatient(null)}
                                className="mt-8 w-full py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-xs font-semibold text-gray-600 transition-colors"
                            >
                                {t('hospital.clearSelection')}
                            </button>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}