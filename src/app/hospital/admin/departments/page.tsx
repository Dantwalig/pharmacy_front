'use client';

import {
  Heart,
  Stethoscope,
  SmilePlus,
  Scissors,
  Brain,
  Bone,
  Fingerprint,
  Users,
  UserCog,
  GitFork,
  MoreVertical,
  type LucideIcon,
} from 'lucide-react';
import { MOCK_DEPARTMENTS } from '@/mock/hospital/staff';

const NAVY = '#1E3A5F';
const TEAL = '#2D9B8A';

const DEPT_META: Record<string, { color: string; icon: LucideIcon }> = {
  'Cardiology':       { color: '#2563EB', icon: Heart        },
  'General Medicine': { color: '#0F766E', icon: Stethoscope  },
  'Paediatrics':      { color: '#BE185D', icon: SmilePlus    },
  'Surgery':          { color: '#BE123C', icon: Scissors     },
  'Neurology':        { color: '#6D28D9', icon: Brain        },
  'Orthopaedics':     { color: '#4338CA', icon: Bone         },
  'Dermatology':      { color: '#B45309', icon: Fingerprint  },
};

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  ACTIVE:   { bg: '#F0FDF4', color: '#15803D' },
  INACTIVE: { bg: '#FFF7ED', color: '#C2410C' },
};

export default function HospitalAdminDepartmentsPage() {
  return (
    <div className="space-y-6 w-full max-w-full overflow-x-hidden">

      {/* ── Header ── */}
      <div
        className="rounded-2xl px-6 py-7 flex items-start justify-between"
        style={{ background: '#EBF5FF' }}
      >
        <div className="space-y-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: NAVY }}>
              Departments
            </h1>
            <p className="mt-1 text-sm font-medium" style={{ color: TEAL }}>
              Access and manage doctors, nurses and hospital staff in one place.
            </p>
          </div>
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity"
            style={{ background: TEAL }}
          >
            <Stethoscope size={15} />
            Select Department
          </button>
        </div>
        <div className="opacity-10 shrink-0 ml-4 hidden sm:block" style={{ color: NAVY }}>
          <GitFork size={72} className="rotate-180" />
        </div>
      </div>

      {/* ── Department cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {MOCK_DEPARTMENTS.map(dept => {
          const meta  = DEPT_META[dept.name] ?? { color: TEAL, icon: Stethoscope };
          const { color, icon: Icon } = meta;
          const badge = STATUS_STYLE[dept.status] ?? STATUS_STYLE.ACTIVE;

          const rows = [
            { icon: Users,   label: 'Doctors',    value: String(dept.doctorCount)                         },
            { icon: Users,   label: 'Nurses',      value: String(dept.nurseCount)                          },
            { icon: Users,   label: 'Total Staff', value: String(dept.doctorCount + dept.nurseCount)       },
            { icon: UserCog, label: 'Head',         value: dept.head ?? '—'                                },
          ];

          return (
            <div
              key={dept.id}
              className="bg-white rounded-2xl border shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer"
              style={{ borderColor: `${color}30` }}
            >
              {/* Icon + name + status */}
              <div className="flex flex-col items-center gap-2 mb-4">
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center"
                  style={{ background: `${color}15` }}
                >
                  <Icon size={20} style={{ color }} />
                </div>
                <h3 className="text-sm font-bold text-center" style={{ color }}>
                  {dept.name}
                </h3>
                <span
                  className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold"
                  style={{ background: badge.bg, color: badge.color }}
                >
                  {dept.status.charAt(0) + dept.status.slice(1).toLowerCase()}
                </span>
              </div>

              <div className="border-t border-gray-100 mb-3" />

              {/* Stat rows */}
              <div className="space-y-1">
                {rows.map(row => (
                  <div key={row.label} className="flex items-center gap-2.5 py-1">
                    <div
                      className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: `${color}12` }}
                    >
                      <row.icon size={12} style={{ color }} />
                    </div>
                    <p className="text-xs text-gray-600 truncate">
                      <span className="font-semibold text-gray-700">{row.label}:</span>{' '}
                      {row.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="mt-3 flex justify-end">
                <button className="text-gray-300 hover:text-gray-500 transition-colors p-1">
                  <MoreVertical size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
