'use client';

import { useState } from 'react';
import { ClipboardCheck, BedDouble, AlertCircle, FilePlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';




const RECENT_RECORDS = [
  { date: '20/07/25', time: '14:00', summary: 'Temp- 38.0 C BP- 120/80 HR- 72', nurse: 'Ange' },
  { date: '19/07/25', time: '08:45', summary: 'Temp- 38.0 C BP- 120/80 HR- 72', nurse: 'Beni' },
  { date: '10/07/25', time: '12:30', summary: 'Temp- 38.0 C BP- 120/80 HR- 72', nurse: 'Clare' },
];

export default function NurseVitalsPage() {
const { t } = useTranslation();
const VITAL_FIELDS = [
  { key: 'temperature', label: t('hospital.temperature') },
  { key: 'bloodPressure', label: t('hospital.bloodPressure') },
  { key: 'heartRate', label: t('hospital.heartRate') },
  { key: 'respiratoryRate', label: t('hospital.respiratoryRate') },
  { key: 'oxygen', label: t('hospital.oxygen') },
  { key: 'weight', label: t('hospital.weight') },
] as const;


  const [vitals, setVitals] = useState<Record<string, string>>({
    temperature: '35', bloodPressure: '120/80', heartRate: '72',
    respiratoryRate: '16', oxygen: '98', weight: '60.0',
  });
  const [condition, setCondition] = useState('stable');
  const [painLevel, setPainLevel] = useState(4);
  const [mobility, setMobility] = useState('independent');
  const [observation, setObservation] = useState('');

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="rounded-2xl p-8" style={{ background: '#EBF5FF' }}>
        <h1 className="text-3xl font-bold" style={{ color: '#1E3A5F' }}>{t('hospital.vitalsTitle')}</h1>
        <p className="mt-1 text-sm font-medium" style={{ color: '#0284C7' }}>{t('hospital.vitalsSubtitle')}</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label={t('hospital.completeAssessment')} value={50} icon={<ClipboardCheck className="w-6 h-6" />} color="red"    sub={t('hospital.today')} />
        <StatCard label={t('hospital.admitPatients')}       value={20} icon={<BedDouble className="w-6 h-6" />}     color="purple" sub={t('hospital.admitted')} />
        <StatCard label={t('hospital.criticalAlert')}        value={15} icon={<AlertCircle className="w-6 h-6" />}   color="blue"   sub={t('hospital.today')} />
        <StatCard label={t('hospital.newAssessment')}        value={25} icon={<FilePlus className="w-6 h-6" />}      color="green"  sub={t('hospital.today')} />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Vitals Entry */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-base font-bold mb-4" style={{ color: '#1E3A5F' }}>{t('hospital.vitalsEntry')}</h3>
          <div className="space-y-3">
            {VITAL_FIELDS.map(f => (
              <div key={f.key} className="flex items-center justify-between gap-3">
                <label className="text-sm text-gray-600">{f.label}</label>
                <input
                  type="text"
                  value={vitals[f.key]}
                  onChange={e => setVitals(v => ({ ...v, [f.key]: e.target.value }))}
                  className="w-24 px-3 py-1.5 text-sm border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Assessment */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-base font-bold mb-4" style={{ color: '#1E3A5F' }}>{t('hospital.assessment')}</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <label className="text-sm text-gray-600">{t('hospital.generalCondition')}</label>
              <select value={condition} onChange={e => setCondition(e.target.value)} className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400">
                <option value="stable">{t('hospital.stable')}</option>
                <option value="critical">{t('hospital.critical')}</option>
                <option value="improving">{t('hospital.improving')}</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-600 block mb-2">{t('hospital.painLevel')}</label>
              <input type="range" min={0} max={10} value={painLevel} onChange={e => setPainLevel(Number(e.target.value))} className="w-full accent-blue-500" />
            </div>
            <div className="flex items-center justify-between gap-3">
              <label className="text-sm text-gray-600">{t('hospital.mobilityStatus')}</label>
              <select value={mobility} onChange={e => setMobility(e.target.value)} className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400">
                <option value="independent">{t('hospital.independent')}</option>
                <option value="assisted">{t('hospital.assisted')}</option>
                <option value="bedridden">{t('hospital.bedridden')}</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-600 block mb-2">{t('hospital.additionalObservation')}</label>
              <textarea
                value={observation}
                onChange={e => setObservation(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Recent Records */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-base font-bold mb-4" style={{ color: '#1E3A5F' }}>{t('hospital.recentRecords')}</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                  <th className="pb-2 pr-2">{t('hospital.date')}</th>
                  <th className="pb-2 pr-2">{t('hospital.time')}</th>
                  <th className="pb-2 pr-2">{t('hospital.vitalsSummary')}</th>
                  <th className="pb-2">{t('hospital.nurse')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-xs">
                {RECENT_RECORDS.map((r, i) => (
                  <tr key={i}>
                    <td className="py-3 pr-2 text-gray-600 whitespace-nowrap">{r.date}</td>
                    <td className="py-3 pr-2 text-gray-600">{r.time}</td>
                    <td className="py-3 pr-2 text-gray-500">{r.summary}</td>
                    <td className="py-3 text-gray-600">{r.nurse}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap items-center justify-center gap-4">
        <button className="px-8 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: '#1E3A5F' }}>
          {t('hospital.saveAssessment')}
        </button>
        <button className="px-8 py-2.5 rounded-xl text-sm font-semibold text-blue-600 border border-blue-200 hover:bg-blue-50 transition-colors">
          {t('hospital.updateAssessment')}
        </button>
        <button className="px-8 py-2.5 rounded-xl text-sm font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors">
          {t('hospital.viewHistory')}
        </button>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color, sub }: {
  label: string; value: number; icon: React.ReactNode; color: 'red' | 'purple' | 'blue' | 'green'; sub: string;
}) {
  const palette = {
    red:    { bg: 'bg-red-50',    text: 'text-red-500',    border: 'border-red-100' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-500', border: 'border-purple-100' },
    blue:   { bg: 'bg-blue-50',   text: 'text-blue-500',   border: 'border-blue-100' },
    green:  { bg: 'bg-green-50',  text: 'text-green-500',  border: 'border-green-100' },
  }[color];
  return (
    <div className={`bg-white rounded-xl p-5 border ${palette.border} shadow-sm`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
          <p className="text-xs text-gray-400 mt-1">{sub}</p>
        </div>
        <div className={`w-10 h-10 ${palette.bg} ${palette.text} rounded-lg flex items-center justify-center shrink-0`}>{icon}</div>
      </div>
    </div>
  );
}
