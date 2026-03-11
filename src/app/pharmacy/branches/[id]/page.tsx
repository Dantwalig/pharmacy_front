'use client';
// src/app/(pharmacy)/branches/[id]/page.tsx
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, DollarSign, Users, User, Package, Ban } from 'lucide-react';
import { api } from '@/lib/api';

const NAVY = '#1E4D8C';
const TEAL = '#2D9B8A';

export default function BranchDetailPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useParams();
  const [branch, setBranch] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/branches/${id}`)
      .then(r => setBranch(r.data?.data ?? r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        {t('common.loading')}
      </div>
    );
  }

  if (!branch) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        {t('common.noData')}
      </div>
    );
  }

  const stats = [
    { icon: DollarSign, label: t('common.monthly_revenue'), value: `RWF ${branch.monthlyRevenue?.toLocaleString() ?? '0'}` },
    { icon: Users,      label: t('pharmacyOwner.staffMembers'),   value: branch.staffCount ?? 0 },
    { icon: User,       label: t('pharmacyOwner.manager'),         value: branch.managerName ?? t('common.unassigned') },
    { icon: Package,    label: t('common.status'),                 value: branch.status ?? '—' },
  ];

  return (
    <div className="space-y-6">
      {/* Back */}
      <button
        onClick={() => router.push('/pharmacy/branches')}
        className="flex items-center gap-2 text-sm font-medium hover:underline"
        style={{ color: NAVY }}
      >
        <ArrowLeft size={16} />
        {t('pharmacyOwner.backToBranches')}
      </button>

      {/* Hero */}
      <div className="rounded-2xl p-8 text-white" style={{ backgroundColor: NAVY }}>
        <h1 className="text-3xl font-bold">{branch.name}</h1>
        <p className="mt-1 text-white/70">{branch.address}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                style={{ backgroundColor: '#F0F7F6' }}>
                <Icon size={18} style={{ color: TEAL }} />
              </div>
              <p className="text-xs text-gray-500 mb-1">{s.label}</p>
              <p className="text-lg font-bold text-gray-900">{s.value}</p>
            </div>
          );
        })}
      </div>

      {/* Staff + Inventory */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Staff */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">{t('pharmacyOwner.staffMembers')}</h3>
          {(branch.staff ?? []).length === 0 ? (
            <p className="text-gray-400 text-sm">{t('common.noData')}</p>
          ) : (
            <div className="space-y-3">
              {(branch.staff ?? []).map((s: any) => (
                <div key={s.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{s.name}</p>
                    <p className="text-xs text-gray-500">{s.role}</p>
                  </div>
                  <span
                    className="px-2.5 py-1 rounded-full text-xs font-semibold"
                    style={{ backgroundColor: '#D1FAE5', color: '#065F46' }}
                  >
                    Active
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Inventory */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">{t('pharmacyOwner.inventorySnapshot')}</h3>
          {(branch.inventory ?? []).length === 0 ? (
            <p className="text-gray-400 text-sm">{t('common.noData')}</p>
          ) : (
            <div className="space-y-3">
              {(branch.inventory ?? []).map((item: any) => (
                <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{item.name}</p>
                    <p className="text-xs text-gray-500">{item.quantity} units</p>
                  </div>
                  <span
                    className="px-2.5 py-1 rounded-full text-xs font-semibold"
                    style={
                      item.quantity > 50
                        ? { backgroundColor: '#D1FAE5', color: '#065F46' }
                        : { backgroundColor: '#FEE2E2', color: '#991B1B' }
                    }
                  >
                    {item.quantity > 50 ? 'Healthy' : 'Low'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">
          {t('pharmacyOwner.reassignManager')}
        </button>
        <button
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium"
          style={{ backgroundColor: '#FEE2E2', color: '#991B1B' }}
        >
          <Ban size={16} />
          {t('pharmacyOwner.disableBranch')}
        </button>
      </div>
    </div>
  );
}