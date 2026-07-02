'use client';

import {
  BanknotesIcon,
  ClockIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

import RevenueChart from '@/components/hospital/finance/RevenueChart';
import PaymentBreakdownChart from '@/components/hospital/finance/PaymentBreakdownChart';
import InvoiceTable from '@/components/hospital/finance/InvoiceTable';
import RefundTable from '@/components/hospital/finance/RefundTable';
import {useTranslation} from 'react-i18next';
import { MOCK_INVOICES } from '@/mock/hospital/finance';
import type { PaymentBreakdownItem } from '@/components/hospital/finance/PaymentBreakdownChart';
import type { RefundItem } from '@/components/hospital/finance/RefundTable';

const REVENUE_CHART_DATA = [
  { label: 'JAN', revenue: 3_800_000, expenses: 2_200_000 },
  { label: 'FEB', revenue: 4_500_000, expenses: 2_900_000 },
  { label: 'MAR', revenue: 3_200_000, expenses: 2_400_000 },
  { label: 'APR', revenue: 2_900_000, expenses: 2_100_000 },
  { label: 'MAY', revenue: 4_100_000, expenses: 2_700_000 },
  { label: 'JUN', revenue: 3_600_000, expenses: 2_500_000 },
  { label: 'JUL', revenue: 4_800_000, expenses: 3_100_000 },
];



const REFUNDS: RefundItem[] = [
  { id: 'RF-008', amount: 1_000,  status: 'APPROVED', date: '2023-05-21' },
  { id: 'RF-007', amount: 17_000, status: 'REJECTED', date: '2023-05-19' },
  { id: 'RF-006', amount: 67_090, status: 'PENDING',  date: '2023-05-10' },
  { id: 'RF-005', amount: 34_100, status: 'REJECTED', date: '2023-05-18' },
];

export default function HospitalAdminFinancePage() {
  const { t } = useTranslation();
  
  const PAYMENT_BREAKDOWN: PaymentBreakdownItem[] = [
  { name: t('hospital.mobileMoney'), value: 1_530_769, color: '#1E4D8C' },
  { name: t('hospital.cash'),         value: 2_037_670, color: '#93c5fd' },
  ];
  const FINANCE_KPIS = [
  { label: t('hospital.totalRevenue'),   value: 'RWF 123,456', sub: '+12.5% ' + t('hospital.fromLastWeek'), trend: true,  icon: <BanknotesIcon className="w-5 h-5" />,           accentColor: 'bg-blue-100',    iconColor: 'text-blue-600'    },
  { label: t('hospital.pendingPayments'), value: 'RWF 54,321',  sub: '18 ' + t('hospital.invoices'),           trend: false, icon: <ExclamationTriangleIcon className="w-5 h-5" />, accentColor: 'bg-red-100',     iconColor: 'text-red-500'     },
  { label: t('hospital.overduePayments'), value: 'RWF 3,456',   sub: '9 ' + t('hospital.invoices'),            trend: false, icon: <BanknotesIcon className="w-5 h-5" />,           accentColor: 'bg-emerald-100', iconColor: 'text-emerald-600' },
  { label: t('hospital.refund'),          value: 'RWF 350,000', sub: '+24% ' + t('hospital.fromLastWeek'),   trend: true,  icon: <ClockIcon className="w-5 h-5" />,               accentColor: 'bg-purple-100',  iconColor: 'text-purple-600'  },
  ];

  return (
    <div className="space-y-6">

      {/* Hero */}
      <div className="rounded-2xl p-7 bg-brand-hero relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-brand-navy">{t('hospital.finance')}</h1>
          <p className="mt-1 text-sm font-medium" style={{ color: '#0284C7' }}>{t('hospital.financeDescription')}</p>
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
          data={REVENUE_CHART_DATA}
          title={t('hospital.revenueOverview')}
          showExpenses={false}
          defaultPeriod="Weekly"
          variant="bar"
        />
        <PaymentBreakdownChart
          data={PAYMENT_BREAKDOWN}
          title={t('hospital.paymentBreakdown')}
        />
      </div>

      {/* Invoice table + Refund panel */}
      <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-5">
        <InvoiceTable
          invoices={MOCK_INVOICES}
          onExport={() => console.log('export')}
        />
        <RefundTable
          refunds={REFUNDS}
          onViewAll={() => console.log('view all refunds')}
        />
      </div>

    </div>
  );
}
