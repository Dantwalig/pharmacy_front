// src/app/super-admin/map/page.tsx
// Super Admin Global Pharmacy Triangulation Map
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import dynamic from 'next/dynamic';
import {
  BuildingStorefrontIcon,
  CheckCircleIcon,
  XCircleIcon,
  MapPinIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';
import { fetchPharmacyLocations } from '@/services/pharmacies';
import { PharmacyLocation } from '@/features/map/pharmacyData';
import { MapSkeleton } from '@/components/map/MapStates';
import MapLayout from '@/components/map/MapLayout';

const MapView = dynamic(() => import('@/components/map/MapView'), {
  ssr: false,
  loading: () => <MapSkeleton />,
});

const NAVY = '#1E4D8C';
const TEAL = '#2D9B8A';

// Rwanda-wide: zoom out enough to see all provinces
const RWANDA_CENTER: [number, number] = [-1.9403, 29.8739];
const RWANDA_ZOOM = 8;

type FilterStatus = 'all' | 'open' | 'closed';
type FilterActive = 'all' | 'active' | 'inactive';

export default function SuperAdminMapPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [allPharmacies, setAllPharmacies] = useState<PharmacyLocation[]>([]);
  const [filtered, setFiltered] = useState<PharmacyLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedPharmacy, setSelectedPharmacy] = useState<PharmacyLocation | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [activeFilter, setActiveFilter] = useState<FilterActive>('all');

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchPharmacyLocations();
        setAllPharmacies(data);
        setFiltered(data);
      } catch {
        setAllPharmacies([]);
        setFiltered([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    let result = allPharmacies;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.address.toLowerCase().includes(q) ||
          p.region.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'all')
      result = result.filter((p) => (statusFilter === 'open' ? p.status === 'OPEN' : p.status === 'CLOSED'));
    if (activeFilter !== 'all')
      result = result.filter((p) => (activeFilter === 'active' ? p.isActive : !p.isActive));
    setFiltered(result);
  }, [search, statusFilter, activeFilter, allPharmacies]);

  const handleSelectPharmacy = useCallback((p: PharmacyLocation) => {
    setSelectedId(p.id);
    setSelectedPharmacy(p);
  }, []);

  const stats = {
    total: allPharmacies.length,
    active: allPharmacies.filter((p) => p.isActive).length,
    inactive: allPharmacies.filter((p) => !p.isActive).length,
    open: allPharmacies.filter((p) => p.status === 'OPEN').length,
  };

  // ── Sidebar content for MapLayout ──
  const sidebarContent = (
    <div className="flex flex-col gap-4 h-full">
      {/* Detail panel or placeholder */}
      {selectedPharmacy ? (
        <DetailsPanel
          pharmacy={selectedPharmacy}
          onViewDetails={(id) => router.push(`/super-admin/pharmacies/${id}`)}
          onClose={() => { setSelectedId(null); setSelectedPharmacy(null); }}
        />
      ) : (
        <SelectPrompt />
      )}

      {/* Pharmacy index list */}
      <div className="bg-white rounded-2xl shadow-xl overflow-y-auto flex-1" style={{ maxHeight: 300 }}>
        <div className="p-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h3 className="font-bold text-gray-800 text-sm">
            {t('superAdminMap.pharmacyIndex')}
            <span className="ml-2 text-xs font-normal text-gray-400">
              {filtered.length} {t('superAdminMap.shown')}
            </span>
          </h3>
        </div>
        <div className="divide-y divide-gray-50">
          {loading
            ? [1, 2, 3, 4].map((i) => (
                <div key={i} className="p-3 flex gap-3 animate-pulse">
                  <div className="w-8 h-8 bg-gray-200 rounded-lg shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 bg-gray-200 rounded w-3/4" />
                    <div className="h-2.5 bg-gray-100 rounded w-1/2" />
                  </div>
                </div>
              ))
            : filtered.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleSelectPharmacy(p)}
                  className={`w-full text-left p-3 flex items-center gap-3 transition-all hover:bg-gray-50 ${
                    selectedId === p.id ? 'bg-blue-50' : ''
                  }`}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: p.isActive ? `${TEAL}20` : '#f3f4f6' }}
                  >
                    <BuildingStorefrontIcon
                      className="w-4 h-4"
                      style={{ color: p.isActive ? TEAL : '#9ca3af' }}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-gray-800 truncate">{p.name}</p>
                    <p className="text-xs text-gray-400 truncate">{p.region}</p>
                  </div>
                  <span
                    className={`shrink-0 w-2 h-2 rounded-full ${p.status === 'OPEN' ? 'bg-emerald-400' : 'bg-gray-300'}`}
                  />
                </button>
              ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="rounded-2xl p-6 lg:p-8" style={{ background: 'linear-gradient(135deg, #EBF5FF 0%, #f0f9ff 100%)' }}>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: '#DBEAFE' }}>
            <MapPinIcon className="w-8 h-8" style={{ color: '#1E4D8C' }} />
          </div>
          <div>
            <h1 className="text-3xl font-bold" style={{ color: '#1E3A5F' }}>{t('superAdminMap.title')}</h1>
            <p className="text-sm mt-1" style={{ color: '#4B7BAE' }}>{t('superAdminMap.subtitle')}</p>
          </div>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { labelKey: 'superAdminMap.totalPharmacies', value: stats.total,    icon: BuildingStorefrontIcon, color: NAVY,       bg: `${NAVY}12` },
          { labelKey: 'superAdminMap.active',          value: stats.active,   icon: CheckCircleIcon,        color: TEAL,       bg: `${TEAL}12` },
          { labelKey: 'superAdminMap.inactive',        value: stats.inactive, icon: XCircleIcon,            color: '#ef4444',  bg: '#fef2f2'   },
          { labelKey: 'superAdminMap.openNow',         value: stats.open,     icon: MapPinIcon,             color: '#f59e0b',  bg: '#fffbeb'   },
        ].map((s) => (
          <div key={s.labelKey} className="bg-white rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-3">
              <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">{t(s.labelKey)}</p>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: s.bg }}>
                <s.icon className="w-5 h-5" style={{ color: s.color }} />
              </div>
            </div>
            <p className="text-4xl font-bold" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-lg p-4 flex flex-wrap gap-3 items-center">
        <FunnelIcon className="w-5 h-5 text-gray-400 shrink-0" />
        <div className="relative flex-1 min-w-[180px]">
          <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={t('superAdminMap.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl outline-none focus:ring-2"
            style={{ '--tw-ring-color': TEAL } as any}
          />
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {([
            { value: 'all',    labelKey: 'superAdminMap.all'    },
            { value: 'open',   labelKey: 'superAdminMap.open'   },
            { value: 'closed', labelKey: 'superAdminMap.closed' },
          ] as { value: FilterStatus; labelKey: string }[]).map(({ value: v, labelKey }) => (
            <button
              key={v}
              onClick={() => setStatusFilter(v)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={statusFilter === v ? { background: 'linear-gradient(135deg, #0284C7, #38BDF8)', color: '#fff' } : { color: '#6b7280' }}
            >
              {t(labelKey)}
            </button>
          ))}
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {([
            { value: 'all',      labelKey: 'superAdminMap.all'      },
            { value: 'active',   labelKey: 'superAdminMap.active'   },
            { value: 'inactive', labelKey: 'superAdminMap.inactive' },
          ] as { value: FilterActive; labelKey: string }[]).map(({ value: v, labelKey }) => (
            <button
              key={v}
              onClick={() => setActiveFilter(v)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={activeFilter === v ? { background: 'linear-gradient(135deg, #0284C7, #38BDF8)', color: '#fff' } : { color: '#6b7280' }}
            >
              {t(labelKey)}
            </button>
          ))}
        </div>
        <span className="text-xs text-gray-400 ml-auto">
          {t('superAdminMap.showing')} {filtered.length} / {allPharmacies.length}
        </span>
      </div>

      {/* Map + sidebar via MapLayout */}
      <MapLayout
        mapHeightMobile={360}
        mapHeightTablet={440}
        mapHeightDesktop={540}
        map={
          loading ? (
            <MapSkeleton />
          ) : (
            <MapView
              pharmacies={filtered}
              center={RWANDA_CENTER}
              zoom={RWANDA_ZOOM}
              selectedId={selectedId}
              onSelectPharmacy={handleSelectPharmacy}
              onViewDetails={(id) => router.push(`/super-admin/pharmacies/${id}`)}
              className="h-full"
            />
          )
        }
        sidebar={sidebarContent}
      />
    </div>
  );
}

function SelectPrompt() {
  const { t } = useTranslation();
  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 text-center">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: `${NAVY}12` }}>
        <BuildingStorefrontIcon className="w-7 h-7" style={{ color: NAVY }} />
      </div>
      <p className="text-gray-700 font-semibold text-sm">{t('superAdminMap.selectPharmacy')}</p>
      <p className="text-gray-400 text-xs mt-1">{t('superAdminMap.selectPrompt')}</p>
    </div>
  );
}

function DetailsPanel({
  pharmacy,
  onViewDetails,
  onClose,
}: {
  pharmacy: PharmacyLocation;
  onViewDetails: (id: string) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const isOpen = pharmacy.status === 'OPEN';

  const fields: [string, string | undefined | null][] = [
    [t('superAdminMap.region'),      pharmacy.region],
    [t('common.address'),            pharmacy.address],
    [t('common.phone'),              pharmacy.phone],
    [t('superAdminMap.hours'),       pharmacy.hours],
    [t('superAdminMap.rating'),      pharmacy.rating ? `${pharmacy.rating} / 5` : '—'],
    [t('superAdminMap.coordinates'), `${pharmacy.latitude.toFixed(4)}, ${pharmacy.longitude.toFixed(4)}`],
  ];

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      <div
        className="px-5 py-4 flex items-center justify-between text-white"
        style={{ background: `linear-gradient(135deg, ${NAVY}, #1a3d6f)` }}
      >
        <p className="font-bold text-sm truncate">{pharmacy.name}</p>
        <button
          onClick={onClose}
          className="text-white/70 hover:text-white text-xl leading-none ml-2 shrink-0"
          aria-label={t('common.close') || 'Close'}
        >
          ×
        </button>
      </div>
      <div className="p-4 space-y-3 text-sm">
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
            isOpen ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${isOpen ? 'bg-emerald-400' : 'bg-red-400'}`} />
          {isOpen ? t('superAdminMap.openNow') : t('superAdminMap.closed')}
          {' · '}
          {pharmacy.isActive ? t('superAdminMap.active') : t('superAdminMap.inactive')}
        </span>
        {fields.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-3 text-xs">
            <span className="text-gray-400 font-medium shrink-0">{label}</span>
            <span className="text-gray-700 text-right">{value || '—'}</span>
          </div>
        ))}
        <button
          onClick={() => onViewDetails(pharmacy.id)}
          className="w-full mt-1 py-2.5 rounded-xl text-white font-semibold text-sm transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #0284C7, #38BDF8)' }}
        >
          {t('superAdminMap.openFullProfile')} →
        </button>
      </div>
    </div>
  );
}

