//src/app/hospital/receptionist/appointment-list/page.tsx

'use client';

import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { CalendarIcon, CheckCircleIcon, ClockIcon, PlusIcon, MagnifyingGlassIcon, XCircleIcon } from '@heroicons/react/24/outline';

const BLUE = '#1E3A8A';
const lightBlue = '#0284C7';


const MOCK_QUEUE = [
  { id: 'A-2041', name: 'Kevine Mugisha', doctor: 'Dr. Samuel Nkurunziza', department: 'General Medicine', appointmentTime: '08:30 AM', status: 'CHECKED IN', date: '2026-06-18' },
  { id: 'A-2042', name: 'Diane Mutoni', doctor: 'Dr. Samuel Nkurunziza', department: 'General Medicine', appointmentTime: '09:15 AM', status: 'SCHEDULED', date: '2026-06-18' },
  { id: 'A-2043', name: 'Jean Paul Nsengimana', doctor: 'Dr. Albert Munyaneza', department: 'Pediatrics', appointmentTime: '10:00 AM', status: 'CHECKED IN', date: '2026-06-18' },
  { id: 'A-2044', name: 'Angelique Umutoni', doctor: "Dr. Jeanne d'Arc", department: 'ICU', appointmentTime: '11:00 AM', status: 'CHECKED IN', date: '2026-06-18' },
  { id: 'A-2045', name: 'Eric Gasana', doctor: 'Dr. Eric Gasana', department: 'Emergency Room', appointmentTime: '11:30 AM', status: 'SCHEDULED', date: '2026-06-18' },
  { id: 'A-2046', name: 'Carine Uwase', doctor: 'Dr. Albert Munyaneza', department: 'Pediatrics', appointmentTime: '01:00 PM', status: 'SCHEDULED', date: '2026-06-18' },
  { id: 'A-2047', name: 'Olivier Ndayisaba', doctor: 'Dr. Samuel Nkurunziza', department: 'General Medicine', appointmentTime: '02:00 PM', status: 'CANCELLED', date: '2026-06-18' },
  { id: 'A-2048', name: 'Sonia Gisa', doctor: 'Dr. Eric Gasana', department: 'Emergency Room', appointmentTime: '03:15 PM', status: 'SCHEDULED', date: '2026-06-18' },
];

export default function HospitalReceptionistAppointmentListPage() {
    const { t } = useTranslation();
    
    // Overview Cards STATS
    const overviewCards = [
      {
        title: 8,
        label: t('hospital.totalBookings', 'Total Bookings'),
        icon: CalendarIcon,
        borderColor: '#3B82F6',
        iconColor: '#0284C7',
        iconBg: '#EBF8FF',
      },
      { title: '4', label: t('hospital.confirmedToday', 'Confirmed Today'), icon: CheckCircleIcon, borderColor: '#10B981', iconColor: '#10B981', iconBg: '#D1FAE5' },
      { title: '3', label: t('hospital.checkedIn', 'Checked In'), icon: ClockIcon, borderColor: '#F59E0B', iconColor: '#F59E0B', iconBg: '#FEF3C7' },
      { title: 1, label: t('hospital.cancelled', 'Cancelled'), icon: XCircleIcon, borderColor: '#EF4444', iconColor: '#EF4444', iconBg: '#FEE2E2' },
    ];

    const [searchTerm, setSearchTerm] = useState('');
    const [department, setDepartment] = useState('ALL');
    const [doctor, setDoctor] = useState('ALL');
    const [status, setStatus] = useState('ALL');
    const [dateFilter, setDateFilter] = useState('');
    
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
    const matchesDate = !dateFilter || patient.date === dateFilter;

    return (
        matchesSearch &&
        matchesDepartment &&
        matchesDoctor &&
        matchesStatus &&
        matchesDate
    );
    });

    // Status label translator (data-driven badge values)
    const STATUS_LABEL: Record<string, string> = {
        'SCHEDULED': 'hospital.scheduled',
        'CHECKED IN': 'hospital.checkedIn',
        'CANCELLED': 'hospital.cancelled',
        'WAITING': 'hospital.statusWaiting',
    };
    const statusLabel = (s: string) => (STATUS_LABEL[s] ? t(STATUS_LABEL[s]) : s);

    // Helper color picker
    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'SCHEDULED':
                return 'inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-sky-50 text-sky-600';
            case 'CHECKED IN':
                return 'inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-600';
            case 'CANCELLED':
                return 'inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-600';
            case 'WAITING':
                return 'inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-purple-50 text-purple-600';
            default:
                return 'inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-600';
        }
    };

    return (
        <div className="space-y-6">
            {/* Hero Header */}
            <div className="rounded-2xl p-8" style={{ background: '#EBF5FF' }}>
                <h1 className="text-3xl font-extrabold" style={{ color: BLUE }}>{t('hospital.appointmentsTitle', 'Scheduled Appointment Bookings')}</h1>
                <p className="mt-1 text-sm" style={{ color: lightBlue }}>{t('hospital.appointmentsSubtitle', 'Review, search, filters, reschedule or check-in upcoming patient visits.')}</p>
            </div>

            {/* Metric Cards Grid */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                {overviewCards.map((card) => {
                    const Icon = card.icon;
                    return (
                        <div key={card.label} className="rounded-xl bg-white p-5 shadow-sm" style={{ borderLeft: `4px solid ${card.borderColor}` }}>
                            <div className="flex items-center justify-between">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full" style={{ backgroundColor: card.iconBg }}>
                                    <Icon className="h-6 w-6" style={{ color: card.iconColor }} />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-bold text-gray-900">{card.title}</h2>
                                    <p className="mt-1 text-sm text-gray-500">{card.label}</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Filter Bar */}
                <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">                <div className="relative w-64">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                     type="text"
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                     placeholder={t('hospital.searchPatient', 'Search Patient...')}
                     className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
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

                <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm"/>

                <div className="flex items-center gap-2 ">
                    <button
                    onClick={() => {
                        setSearchTerm('');
                        setDepartment('ALL');
                        setDoctor('ALL');
                        setStatus('ALL');
                        setDateFilter('');
                        setSelectedPatient(null);
                    }}
                    className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
                    >
                    {t('hospital.resetFilter')}
                    </button>
                </div>
            </div>

            {/* Table*/}
            <div className="flex-1 w-full overflow-hidden bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/50 text-xs font-semibold uppercase tracking-wider text-gray-400">
                                <th className="py-4 px-6">{t('hospital.thApptId')}</th>
                                <th className="py-4 px-6">{t('hospital.thPatientName')}</th>
                                <th className="py-4 px-6">{t('hospital.thAssignedDoctor')}</th>
                                <th className="py-4 px-6">{t('hospital.thDepartment')}</th>
                                <th className="py-4 px-6">{t('hospital.thAppointmentTime')}</th>
                                <th className="py-4 px-6">{t('hospital.status')}</th>
                                <th className="py-4 px-6 text-right">{t('hospital.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 text-sm text-gray-700">
                            {filteredQueue.map((patient) => (
                                <tr 
                                    key={patient.id} 
                                    onClick={() => setSelectedPatient(patient)}
                                    className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${selectedPatient?.id === patient.id ? 'bg-blue-50/40' : ''}`}
                                >
                                    <td className="py-4 px-6 font-bold text-gray-900 w-28">{patient.id}</td>
                                    <td className="py-4 px-6 font-medium text-gray-900">{patient.name}</td>
                                    <td className="py-4 px-6 text-gray-500 whitespace-pre-line">{patient.doctor}</td>
                                    <td className="py-4 px-6 text-gray-500">{patient.department}</td>
                                    <td className="py-4 px-6 font-semibold text-gray-800">{patient.appointmentTime}</td>
                                    <td className="py-4 px-6">
                                        <span className={getStatusStyle(patient.status)}>
                                            {statusLabel(patient.status)}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <div className="inline-flex items-center gap-2">
                                            {patient.status === 'SCHEDULED' && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); }}
                                                    className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700"
                                                >
                                                    {t('hospital.checkIn')}
                                                </button>
                                            )}
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setSelectedPatient(patient); }}
                                                className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                                            >
                                                {t('hospital.details')}
                                            </button>

                                            {patient.status !== 'CANCELLED' && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation();}}
                                                    className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                                                >
                                                    {t('hospital.reschedule')}
                                                </button>
                                            )}

                                            {patient.status !== 'CANCELLED' && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation();}}
                                                    className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-red-500 text-white hover:bg-red-600"
                                                >
                                                    {t('common.cancel')}
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}