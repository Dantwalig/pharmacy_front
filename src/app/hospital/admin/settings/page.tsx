'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  Settings,
  BadgeDollarSign,
  Megaphone,
  Building2,
  UserCircle2,
  Plus,
  ChevronRight,
  MoreVertical,
  Save,
} from 'lucide-react';
import {
  MOCK_HOSPITAL_SETTINGS,
  MOCK_HOSPITAL_FEES,
  MOCK_HOSPITAL_ANNOUNCEMENTS,
  MOCK_HOSPITAL_DEPARTMENTS,
} from '@/mock/hospital/settings';

const NAVY     = '#1E3A5F';
const GRADIENT = 'linear-gradient(90deg, #1E4D8C 0%, #2D9B8A 100%)';

type Tab = 'general' | 'fees' | 'announcements' | 'departments';

const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: 'general',       label: 'General',       icon: UserCircle2    },
  { key: 'fees',          label: 'Fees',           icon: BadgeDollarSign},
  { key: 'announcements', label: 'Announcements',  icon: Megaphone      },
  { key: 'departments',   label: 'Departments',    icon: Building2      },
];

const announcementBadge: Record<string, { bg: string; color: string }> = {
  Urgent:  { bg: '#FFF3E0', color: '#E65100' },
  Formal:  { bg: '#E3F2FD', color: '#1565C0' },
  General: { bg: '#F3F4F6', color: '#374151' },
};

export default function HospitalAdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('general');

  return (
    /* Fix 1: prevent any child from blowing out the page width */
    <div className="space-y-6 w-full max-w-full overflow-x-hidden">

      {/* ── Hero ── */}
      <div
        className="rounded-2xl px-6 py-7 flex items-center justify-between"
        style={{ background: '#EBF5FF' }}
      >
        <div className="min-w-0">
          {/* Fix 5: semibold instead of bold — matches portal design language */}
          <h1 className="text-2xl sm:text-3xl font-semibold truncate" style={{ color: NAVY }}>
            Settings
          </h1>
          <p className="mt-1 text-sm font-medium" style={{ color: '#0284C7' }}>
            Manage Hospital Preferences and Configurations
          </p>
        </div>
        <div className="relative opacity-20 shrink-0 ml-4" style={{ color: NAVY }}>
          <Settings size={56} />
        </div>
      </div>

      {/* ── Tabs + Save Changes ── */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        {/* Fix 3: scrollable tab bar — overflow-x:auto + whitespace-nowrap */}
        <div
          className="flex items-center gap-2 min-w-0 flex-1"
          style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}
        >
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className="flex items-center gap-1.5 shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all"
              style={{
                whiteSpace: 'nowrap',
                ...(activeTab === key
                  ? { background: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE' }
                  : { background: '#fff', color: '#6b7280', border: '1px solid #d1d5db' }),
              }}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>

        {/* Fix 4: full-width on mobile, auto on sm+ */}
        <button
          className="flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-all min-h-11 shrink-0"
          style={{ background: 'linear-gradient(to right, #0284C7, #38BDF8)' }}
        >
          <Save size={15} />
          Save Changes
        </button>
      </div>

      {/* ── Content ── */}
      {activeTab === 'general' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <HospitalPageCard />
          <FeeStructureCard />
          <AnnouncementsCard />
          <DepartmentsCard />
        </div>
      )}
      {activeTab === 'fees'          && <FeeStructureCard full />}
      {activeTab === 'announcements' && <AnnouncementsCard full />}
      {activeTab === 'departments'   && <DepartmentsCard full />}
    </div>
  );
}

/* ── Shared shell ── */
function CardShell({
  title, subtitle, action, children,
}: {
  title: string; subtitle?: string; action?: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 w-full min-w-0">
      <div className="flex items-start justify-between mb-4 gap-2">
        <div className="min-w-0">
          <h3 className="font-semibold text-sm truncate" style={{ color: NAVY }}>{title}</h3>
          {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      {children}
    </div>
  );
}

function ActionBtn({ label, onClick }: { label: string; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg hover:opacity-90 transition-all whitespace-nowrap"
      style={{ background: '#EFF6FF', color: '#2563EB' }}
    >
      <Plus size={12} />
      {label}
    </button>
  );
}

/* ── Hospital Page ── */
function HospitalPageCard() {
  return (
    <CardShell title="Hospital Page" subtitle="Update your hospital information">
      {/* Fix 2: stack vertically on mobile, side-by-side on sm+ */}
      <div className="flex flex-col sm:flex-row gap-5 items-start">
        <div className="relative shrink-0 w-full sm:w-auto" style={{ height: 177 }}>
          <div className="relative w-full sm:w-[177px] h-[177px]">
            <Image
              src="/hospital-logo.jpg"
              alt="Hospital logo"
              fill
              className="object-cover rounded-lg"
            />
            <div
              className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center shadow"
              style={{ background: GRADIENT }}
            >
              <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="white">
                <path d="M11.5 2.5a1.5 1.5 0 0 1 2.12 2.12L5 13.24l-3 .76.76-3L11.5 2.5z"/>
              </svg>
            </div>
          </div>
        </div>

        <div className="space-y-2.5 flex-1 min-w-0 text-sm">
          {[
            { label: 'Hospital Name', value: MOCK_HOSPITAL_SETTINGS.hospitalName },
            { label: 'Phone Number',  value: MOCK_HOSPITAL_SETTINGS.phone        },
            { label: 'Info Address',  value: MOCK_HOSPITAL_SETTINGS.address      },
            { label: 'Website',       value: 'www.evuzehospital.rw'              },
          ].map(({ label, value }) => (
            <div key={label}>
              <span className="text-xs text-gray-400 font-medium">{label}</span>
              <p className="text-gray-700 font-medium wrap-break-word">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </CardShell>
  );
}

/* ── Fee Structure ── */
function FeeStructureCard({ full }: { full?: boolean }) {
  return (
    <CardShell
      title="Fee Structure"
      subtitle="Manage service fees"
      action={<ActionBtn label="Add Service" />}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[260px]">
          <thead>
            <tr className="text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
              <th className="text-left py-2 font-medium">Service</th>
              <th className="text-left py-2 font-medium">Price</th>
              <th className="text-left py-2 font-medium">Status</th>
              <th className="py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {MOCK_HOSPITAL_FEES.map((fee) => (
              <tr key={fee.id}>
                <td className="py-2.5 font-medium text-gray-700">{fee.service}</td>
                <td className="py-2.5 text-gray-600">{fee.price.toLocaleString()}</td>
                <td className="py-2.5">
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
                    {fee.status}
                  </span>
                </td>
                <td className="py-2.5 text-right">
                  <button className="text-gray-400 hover:text-gray-600">
                    <MoreVertical size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button className="mt-3 w-full text-xs font-semibold py-2 rounded-lg border border-dashed border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-500 transition-all flex items-center justify-center gap-1">
        <Plus size={12} /> New Service
      </button>
    </CardShell>
  );
}

/* ── Announcements ── */
function AnnouncementsCard({ full }: { full?: boolean }) {
  return (
    <CardShell
      title="Announcements"
      subtitle="Manage Announcements"
      action={<ActionBtn label="Add Announcements" />}
    >
      <div className="space-y-3">
        {MOCK_HOSPITAL_ANNOUNCEMENTS.map((ann) => {
          const badge = announcementBadge[ann.type] ?? announcementBadge.General;
          return (
            <div
              key={ann.id}
              className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-all cursor-pointer gap-2"
            >
              <div className="flex flex-col gap-1 min-w-0">
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-full w-fit"
                  style={{ background: badge.bg, color: badge.color }}
                >
                  {ann.type}
                </span>
                <p className="text-sm font-semibold text-gray-700 truncate">{ann.title}</p>
                <p className="text-xs text-gray-400">{ann.date} · {ann.time}</p>
              </div>
              <ChevronRight size={16} className="text-gray-300 shrink-0" />
            </div>
          );
        })}
      </div>
    </CardShell>
  );
}

/* ── Departments ── */
function DepartmentsCard({ full }: { full?: boolean }) {
  return (
    <CardShell
      title="Departments"
      subtitle="Manage Departments"
      action={<ActionBtn label="Add Department" />}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[260px]">
          <thead>
            <tr className="text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
              <th className="text-left py-2 font-medium">Department</th>
              <th className="text-left py-2 font-medium">Head</th>
              <th className="text-left py-2 font-medium">Staff Count</th>
              <th className="py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {MOCK_HOSPITAL_DEPARTMENTS.map((dept) => (
              <tr key={dept.id}>
                <td className="py-2.5 font-medium text-gray-700">{dept.name}</td>
                <td className="py-2.5 text-gray-600">{dept.head}</td>
                <td className="py-2.5 text-gray-600">{dept.staffCount}</td>
                <td className="py-2.5 text-right">
                  <button className="text-gray-400 hover:text-gray-600">
                    <MoreVertical size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </CardShell>
  );
}
