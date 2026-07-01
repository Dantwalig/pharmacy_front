'use client';

import { useEffect, useState } from 'react';
import {
  BanknotesIcon,
  ClockIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

import RevenueChart from '@/components/hospital/finance/RevenueChart';
import PaymentBreakdownChart from '@/components/hospital/finance/PaymentBreakdownChart';
import InvoiceTable from '@/components/hospital/finance/InvoiceTable';
import RefundTable from '@/components/hospital/finance/RefundTable';

import { useHospitalId } from '@/lib/hospital';
import api from '@/lib/api';
import type { Invoice } from '@/types/hospital';


export default function HospitalAdminFinancePage() {
  const hospitalId = useHospitalId();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(false);

  useEffect(() => {
    if (!hospitalId) { setLoading(false); return; }
    api.get(`/hospitals/${hospitalId}/invoices?limit=100`)
      .then(res => {
        const raw: any[] = res.data?.data ?? [];
        setInvoices(raw.map(item => ({
          id: item.id,
          patientName: `${item.patient?.firstName ?? ''} ${item.patient?.lastName ?? ''}`.trim() || 'Unknown',
          totalAmount: item.totalAmount,
          status: item.paymentStatus,
          dueDate: item.issuedAt,
          createdAt: item.issuedAt,
        })));
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [hospitalId]);

  const totalRevenue     = invoices.reduce((s, i) => s + i.totalAmount, 0);
  const unpaid           = invoices.filter(i => i.status === 'UNPAID');
  const insurancePending = invoices.filter(i => i.status === 'INSURANCE_PENDING');

  const FINANCE_KPIS = [
    { label: 'Total Revenues',     value: loading ? '—' : (invoices.length ? `RWF ${totalRevenue.toLocaleString()}` : '—'),                                               sub: loading ? '—' : (invoices.length ? `${invoices.length} invoices total` : '—'),       trend: true,  icon: <BanknotesIcon className="w-5 h-5" />,           accentColor: 'bg-blue-100',    iconColor: 'text-blue-600'    },
    { label: 'Pending Payments',   value: loading ? '—' : (invoices.length ? `RWF ${unpaid.reduce((s, i) => s + i.totalAmount, 0).toLocaleString()}` : '—'),             sub: loading ? '—' : (invoices.length ? `${unpaid.length} Invoices` : '—'),                trend: false, icon: <ExclamationTriangleIcon className="w-5 h-5" />, accentColor: 'bg-red-100',     iconColor: 'text-red-500'     },
    { label: 'Insurance Pending',  value: loading ? '—' : (invoices.length ? `RWF ${insurancePending.reduce((s, i) => s + i.totalAmount, 0).toLocaleString()}` : '—'),   sub: loading ? '—' : (invoices.length ? `${insurancePending.length} Invoices` : '—'),     trend: false, icon: <BanknotesIcon className="w-5 h-5" />,           accentColor: 'bg-emerald-100', iconColor: 'text-emerald-600' },
    { label: 'Refunds',            value: '—',                                                                                                                     sub: '—',                                                                                 trend: false, icon: <ClockIcon className="w-5 h-5" />,               accentColor: 'bg-purple-100',  iconColor: 'text-purple-600'  },
  ];

  return (
    <div className="space-y-6">

      {/* Hero */}
      <div className="rounded-2xl p-7 bg-brand-hero relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-brand-navy">Finance</h1>
          <p className="mt-1 text-sm font-medium" style={{ color: '#0284C7' }}>Overview of hospital finances and transactions</p>
        </div>
        <svg
          className="absolute right-6 bottom-0 opacity-20 hidden sm:block"
          width="120" height="72" viewBox="0 0 120 72" fill="none"
        >
          <rect x="0"  y="36" width="16" height="36" rx="4" fill="#1E4D8C" />
          <rect x="26" y="18" width="16" height="54" rx="4" fill="#1E4D8C" />
          <rect x="52" y="28" width="16" height="44" rx="4" fill="#1E4D8C" />
          <rect x="78" y="10" width="16" height="62" rx="4" fill="#1E4D8C" />
          <rect x="104" y="24" width="16" height="48" rx="4" fill="#1E4D8C" />
          <polyline points="8,30 34,14 60,22 86,6 112,18" stroke="#2D9B8A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-5 py-3 text-sm text-red-700">
          Could not load finance data — check your connection and refresh.
        </div>
      )}

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {FINANCE_KPIS.map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${kpi.accentColor}`}>
                <span className={kpi.iconColor}>{kpi.icon}</span>
              </div>
              <span className="text-gray-300 text-lg leading-none">⋯</span>
            </div>
            <p className="mt-3 text-sm font-semibold text-slate-600">{kpi.label}</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{kpi.value}</p>
            {kpi.trend ? (
              <span className="mt-2 inline-block text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700">{kpi.sub}</span>
            ) : (
              <span className="mt-2 inline-block text-xs text-slate-400">{kpi.sub}</span>
            )}
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-5">
        <RevenueChart
          data={[]}
          title="Revenue Overview"
          showExpenses={false}
          defaultPeriod="Weekly"
          variant="bar"
        />
        <PaymentBreakdownChart
          data={[]}
          title="Payment Method Breakdown"
        />
      </div>

      {/* Invoice table + Refund panel */}
      <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-5">
        <InvoiceTable
          invoices={invoices}
          onExport={() => console.log('export')}
        />
        <RefundTable
          refunds={[]}
          onViewAll={() => console.log('view all refunds')}
        />
      </div>

    </div>
  );
}
