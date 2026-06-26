'use client';

import { useState } from 'react';
import {
  Stethoscope,
  Microscope,
  HeartHandshake,
  Briefcase,
  Building2,
  Users,
  Activity,
  FlaskConical,
  Clock,
  HeartPulse,
  Truck,
  DollarSign,
  GitFork,
  Search,
  type LucideIcon,
} from 'lucide-react';

const NAVY = '#1E3A5F';

interface ServiceRow { icon: LucideIcon; label: string; value: string; }
interface ServiceGroup { title: string; color: string; icon: LucideIcon; rows: ServiceRow[]; }

const SERVICE_GROUPS: ServiceGroup[] = [
  {
    title: 'Clinical Services', color: '#16A34A', icon: Stethoscope,
    rows: [
      { icon: Building2, label: 'Departments', value: '16' },
      { icon: Users,     label: 'Staff',       value: '250 Doctors' },
      { icon: Activity,  label: 'Status',      value: 'High Activity' },
    ],
  },
  {
    title: 'Diagnostic Services', color: '#7C3AED', icon: Microscope,
    rows: [
      { icon: Building2,    label: 'Departments',    value: '8' },
      { icon: FlaskConical, label: 'Tests Today',    value: '130' },
      { icon: Clock,        label: 'Avg Turnaround', value: '1.4 Hrs' },
    ],
  },
  {
    title: 'Patient Support Services', color: '#2563EB', icon: HeartHandshake,
    rows: [
      { icon: Building2, label: 'Departments',          value: '10' },
      { icon: HeartPulse, label: 'Active Cases',        value: '67' },
      { icon: Truck,     label: 'Ambulance Trips Today', value: '12' },
    ],
  },
  {
    title: 'Administrative & Operations', color: '#EA580C', icon: Briefcase,
    rows: [
      { icon: Building2,  label: 'Departments',      value: '12' },
      { icon: Users,      label: 'Staff',            value: '35 Employees' },
      { icon: DollarSign, label: "Today's billing",  value: 'Rwf 1,250,000' },
    ],
  },
];

interface Employee { name: string; department: string; phone: string; available: boolean; }

const EMPLOYEES: Employee[] = [
  { name: 'Ella Mutesi',  department: 'Clinical Services',         phone: '+250784266000', available: true  },
  { name: 'Kelly Butera', department: 'Patient Support Services',  phone: '+250788013456', available: true  },
  { name: 'Mary Kagabo',  department: 'Administrative & Operations', phone: '+250783000876', available: false },
  { name: 'Howard Magaju',department: 'Diagnostic Services',       phone: '+250788456521', available: false },
];

export default function HospitalAdminDepartmentsPage() {
  const [search, setSearch] = useState('');
  const [dept, setDept] = useState('All');
  const [availability, setAvailability] = useState('All');

  const departments = ['All', ...SERVICE_GROUPS.map(g => g.title)];

  const filtered = EMPLOYEES.filter(e => {
    if (search.trim() && !e.name.toLowerCase().includes(search.trim().toLowerCase())) return false;
    if (dept !== 'All' && e.department !== dept) return false;
    if (availability === 'Available' && !e.available) return false;
    if (availability === 'Unavailable' && e.available) return false;
    return true;
  });

  return (
    <div className="space-y-6 w-full max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="rounded-2xl px-6 py-7 flex items-start justify-between" style={{ background: '#EBF5FF' }}>
        <div className="space-y-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: NAVY }}>Departments</h1>
            <p className="mt-1 text-sm font-medium" style={{ color: '#0284C7' }}>
              Access and manage doctors, nurses and hospital staff in one place.
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity" style={{ background: 'linear-gradient(to right, #0284C7, #38BDF8)' }}>
            <Stethoscope size={15} />
            Select Department
          </button>
        </div>
        <div className="opacity-10 shrink-0 ml-4 hidden sm:block" style={{ color: NAVY }}>
          <GitFork size={72} className="rotate-180" />
        </div>
      </div>

      {/* Service group cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {SERVICE_GROUPS.map(group => {
          const Icon = group.icon;
          return (
            <div key={group.title} className="bg-white rounded-2xl border shadow-sm p-6" style={{ borderColor: `${group.color}25` }}>
              <div className="flex flex-col items-center gap-2 mb-5">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: `${group.color}15` }}>
                  <Icon size={22} style={{ color: group.color }} />
                </div>
                <h3 className="text-base font-bold" style={{ color: group.color }}>{group.title}</h3>
              </div>
              <div className="space-y-3 max-w-xs mx-auto">
                {group.rows.map(row => {
                  const RowIcon = row.icon;
                  return (
                    <div key={row.label} className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${group.color}12` }}>
                        <RowIcon size={14} style={{ color: group.color }} />
                      </div>
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold text-gray-700">{row.label}:</span> {row.value}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Employee Directory */}
      <div>
        <h2 className="text-lg font-bold mb-4" style={{ color: NAVY }}>Employee Directory</h2>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Employee Details</label>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Type in a keyword or name ..."
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Department</label>
            <select value={dept} onChange={e => setDept(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
              {departments.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Availability</label>
            <select value={availability} onChange={e => setAvailability(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="All">All</option>
              <option value="Available">Available</option>
              <option value="Unavailable">Unavailable</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[560px]">
              <thead>
                <tr className="border-b border-gray-100 text-xs font-semibold text-gray-500">
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Department</th>
                  <th className="px-6 py-3">Phone Number</th>
                  <th className="px-6 py-3">Availability</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm">
                {filtered.length === 0 ? (
                  <tr><td colSpan={4} className="px-6 py-10 text-center text-gray-400 font-medium">No employees found.</td></tr>
                ) : filtered.map(emp => (
                  <tr key={emp.name} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900">{emp.name}</td>
                    <td className="px-6 py-4 text-gray-600">{emp.department}</td>
                    <td className="px-6 py-4 text-gray-600">{emp.phone}</td>
                    <td className="px-6 py-4">
                      <span
                        className="inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                        style={emp.available ? { background: '#ECFDF5', color: '#15803D' } : { background: '#FEF2F2', color: '#DC2626' }}
                      >
                        {emp.available ? 'Available' : 'Unavailable'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
