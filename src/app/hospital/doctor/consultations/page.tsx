'use client';

import { useState } from 'react';
import { MOCK_CONSULTATIONS } from '@/mock/hospital/consultations';
import type { ConsultationStatus } from '@/types/hospital';

const STATUS_BADGE: Record<ConsultationStatus, string> = {
  ACTIVE:    'bg-blue-50  border border-blue-400  text-blue-600',
  COMPLETED: 'bg-green-50 border border-green-400 text-green-600',
  PENDING:   'bg-amber-50 border border-amber-400 text-amber-600',
};

export default function HospitalDoctorConsultationsPage() {
  const [search, setSearch]       = useState('');
  const [selectedId, setSelected] = useState<string | null>(null);

  const filtered = MOCK_CONSULTATIONS.filter(c =>
    c.patientName.toLowerCase().includes(search.toLowerCase())
  );

  const selected = MOCK_CONSULTATIONS.find(c => c.id === selectedId) ?? null;

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="rounded-2xl p-8" style={{ background: '#EBF5FF' }}>
        <h1 className="text-3xl font-bold" style={{ color: '#1E3A5F' }}>
          Patient Consultations Workflow
        </h1>
        <p className="mt-1 text-sm" style={{ color: '#0284C7' }}>
          Record medical examinations, patient vitals, diagnosis codes, and treatment instructions.
        </p>
      </div>

      {/* Split panel */}
      <div className="flex gap-4">
        {/* Left — queue (fixed height, scrollable list) */}
        <div className="w-72 shrink-0 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col overflow-hidden" style={{ height: 520 }}>
          {/* Title row */}
          <div className="px-5 py-4 border-b border-gray-200 shrink-0">
            <h2 className="text-base font-bold text-gray-900">Queue for Today</h2>
          </div>

          {/* Search row */}
          <div className="px-4 py-3 border-b border-gray-200 shrink-0">
            <input
              type="text"
              placeholder="Search patient queue..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full px-4 py-2.5 text-sm bg-gray-100 rounded-full placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Scrollable patient rows */}
          <div className="flex-1 overflow-y-auto divide-y divide-gray-200">
            {filtered.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No patients found</p>
            ) : (
              filtered.map(c => (
                <button
                  key={c.id}
                  onClick={() => setSelected(c.id)}
                  className={`w-full text-left px-5 py-4 transition-colors ${
                    selectedId === c.id ? 'bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">{c.patientName}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {c.gender}, {c.age} years · BP {c.bp}
                      </p>
                    </div>
                    <span className={`shrink-0 text-[10px] font-semibold px-2.5 py-1 rounded-full ${STATUS_BADGE[c.status]}`}>
                      {c.status}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right — consultation detail / placeholder */}
        <div
          className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center justify-center"
          style={{ height: 520 }}
        >
          {selected ? (
            <div className="w-full h-full p-8 overflow-y-auto">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900">{selected.patientName}</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {selected.gender}, {selected.age} years · BP {selected.bp} · {selected.date}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <InfoCard label="Consultation Type" value={selected.type} />
                <InfoCard label="Date" value={selected.date} />
                <InfoCard label="Diagnosis" value={selected.diagnosis ?? '—'} />
                <InfoCard label="Duration" value={selected.duration ?? '—'} />
                <InfoCard
                  label="Status"
                  value={
                    <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full bg-white ${STATUS_BADGE[selected.status]}`}>
                      {selected.status}
                    </span>
                  }
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center text-center px-8">
              {/* Icon — large circle with pulse line, matches Figma */}
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center mb-5"
                style={{ background: '#EBF5FF' }}
              >
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#00A2E8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900">Begin Consultation</h3>
              <p className="text-sm text-gray-500 mt-2 max-w-xs leading-relaxed">
                Select a patient from the queue on the left to start recording vitals, taking clinical notes, and issuing treatment plans.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="bg-gray-50 rounded-xl p-4">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{label}</p>
      <div className="text-sm font-medium text-gray-900">{value}</div>
    </div>
  );
}
