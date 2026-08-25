'use client';

import { useTranslation } from 'react-i18next';

export default function HospitalDoctorInventoryPage() {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      <div className="rounded-2xl p-8" style={{ background: '#EBF5FF' }}>
        <h1 className="text-3xl font-bold" style={{ color: '#1E3A5F' }}>{t('hospital.inventory')}</h1>
        <p className="mt-1 text-sm font-medium" style={{ color: '#0284C7' }}>{t('hospital.platform')}</p>
      </div>
    </div>
  );
}
