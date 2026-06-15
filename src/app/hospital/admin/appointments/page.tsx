'use client';

import { useState, useMemo } from 'react';
import {
  MagnifyingGlassIcon,
  ChevronDownIcon,
  PencilSquareIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { MOCK_APPOINTMENTS } from '@/mock/hospital/appointments';
import type { AppointmentStatus } from '@/types/hospital';

const NAVY = '#1E3A5F';
const TEAL = '#38BDF8';

const STATUS_META: Record<AppointmentStatus, { label: string; dot: string; bg: string; color: string }> = {
  CONFIRMED:        { label: 'CONFIRMED',  dot: '#16A34A', bg: '#DCFCE7', color: '#166534' },
  PENDING:          { label: 'PENDING',    dot: '#D97706', bg: '#FEF9C3', color: '#854D0E' },
  CANCELLED:        { label: 'CANCELLED',  dot: '#DC2626', bg: '#FEE2E2', color: '#991B1B' },
  READY_FOR_DOCTOR: { label: 'READY',      dot: '#2563EB', bg: '#DBEAFE', color: '#1E40AF' },
  COMPLETED:        { label: 'COMPLETED',  dot: '#6B7280', bg: '#F3F4F6', color: '#4B5563' },
};

const DEPT_META: Record<string, { bg: string; color: string }> = {
  'Cardiology':       { bg: '#FFE4E6', color: '#9F1239' },
  'General Medicine': { bg: '#DBEAFE', color: '#1D4ED8' },
  'Paediatrics':      { bg: '#DCFCE7', color: '#166534' },
  'Surgery':          { bg: '#FED7AA', color: '#C2410C' },
  'Neurology':        { bg: '#EDE9FE', color: '#5B21B6' },
  'Orthopaedics':     { bg: '#FEF3C7', color: '#92400E' },
  'Dermatology':      { bg: '#FCE7F3', color: '#9D174D' },
};

function formatDateTime(iso: string) {
  const d = new Date(iso);
  const date = d.toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC',
  });
  const time = d.toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', timeZone: 'UTC',
  });
  return `${date}, ${time}`;
}

export default function HospitalAdminAppointmentsPage() {
  const [search, setSearch] = useState('');
  const [doctorFilter, setDoctorFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const doctors = useMemo(
    () => [...new Set(MOCK_APPOINTMENTS.map(a => a.doctorName))].sort(),
    [],
  );
  const departments = useMemo(
    () => [...new Set(MOCK_APPOINTMENTS.map(a => a.specialization))].sort(),
    [],
  );

  const filtered = useMemo(() =>
    MOCK_APPOINTMENTS.filter(a => {
      const q = search.toLowerCase();
      if (q && !a.patientName.toLowerCase().includes(q) && !a.doctorName.toLowerCase().includes(q)) return false;
      if (doctorFilter && a.doctorName !== doctorFilter) return false;
      if (deptFilter && a.specialization !== deptFilter) return false;
      if (dateFilter && !a.date.startsWith(dateFilter)) return false;
      return true;
    }),
    [search, doctorFilter, deptFilter, dateFilter],
  );

  const resetFilters = () => {
    setSearch('');
    setDoctorFilter('');
    setDeptFilter('');
    setDateFilter('');
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="rounded-2xl px-4 py-5 sm:p-8" style={{ background: '#EBF5FF' }}>
        <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: NAVY }}>
          Appointment Scheduling &amp; Tracking
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage and track scheduled patient appointments
        </p>
      </div>

      {/* Table card */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {/* Filter bar */}
        <div className="p-3 sm:p-4 border-b border-gray-100 flex flex-wrap gap-2 sm:gap-3 items-center">
          <div className="relative flex-1 min-w-[140px]">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search patient or doctor..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-200"
            />
          </div>

          <div className="relative">
            <select
              value={doctorFilter}
              onChange={e => setDoctorFilter(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-sky-200 min-w-[130px]"
            >
              <option value="">All Doctors</option>
              {doctors.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={deptFilter}
              onChange={e => setDeptFilter(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-sky-200 min-w-[150px]"
            >
              <option value="">All Departments</option>
              {departments.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          <input
            type="date"
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-200"
          />

          <button
            onClick={resetFilters}
            className="px-4 py-2 text-sm font-semibold text-white rounded-lg transition-opacity hover:opacity-90"
            style={{ backgroundColor: TEAL }}
          >
            Reset
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                <th className="px-4 sm:px-6 py-3">Patient Name</th>
                <th className="px-4 sm:px-6 py-3">Assigned Doctor</th>
                <th className="hidden md:table-cell px-6 py-3">Department</th>
                <th className="hidden sm:table-cell px-6 py-3">Scheduled Date &amp; Time</th>
                <th className="px-4 sm:px-6 py-3">Status</th>
                <th className="px-4 sm:px-6 py-3">Options</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(a => {
                const sm = STATUS_META[a.status];
                const dm = DEPT_META[a.specialization] ?? { bg: '#F3F4F6', color: '#374151' };
                return (
                  <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 sm:px-6 py-4 font-semibold" style={{ color: NAVY }}>
                      {a.patientName}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-gray-600">{a.doctorName}</td>
                    <td className="hidden md:table-cell px-6 py-4">
                      <span
                        className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide whitespace-nowrap"
                        style={{ background: dm.bg, color: dm.color }}
                      >
                        {a.specialization}
                      </span>
                    </td>
                    <td className="hidden sm:table-cell px-6 py-4 text-gray-600 whitespace-nowrap">
                      {formatDateTime(a.date)}
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <span
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap"
                        style={{ background: sm.bg, color: sm.color }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: sm.dot }} />
                        {sm.label}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-400 transition-colors"
                          title="Edit appointment"
                        >
                          <PencilSquareIcon className="w-4 h-4" />
                        </button>
                        <button
                          className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-colors"
                          title="Delete appointment"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    No appointments match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
