'use client';

/**
 * Branch Manager — Localized Map View
 * Route: /branch/map
 *
 * Shows this branch's own location plus all sibling branches
 * from the same pharmacy network. The "Competitors" layer is
 * visually disabled until GET /map/competitors is implemented.
 *
 * APIs:
 *   GET /branches/pharmacy-branches     → sibling branches (same pharmacy)
 *   GET /branches/my-branch-details     → own branch lat/lng (optional)
 *   GET /map/competitors (not yet live) → nearby competitors
 */

import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  MapPin, Navigation, GitBranch, RefreshCw,
  AlertCircle, Building2, Eye, EyeOff, Lock,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import type { MapMarker } from '@/components/map/BaseMap';
import { MapSkeleton } from '@/components/map/MapStates';

const NAVY = '#1E4D8C';
const TEAL = '#2D9B8A';
const RED  = '#EF4444';

const BaseMap = dynamic(() => import('@/components/map/BaseMap'), { ssr: false });

// ── Coming Soon Tooltip wrapper ────────────────────────────────────────────

function ComingSoonTooltip({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={ref}
      className="relative inline-block"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div
          role="tooltip"
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 pointer-events-none"
        >
          <div className="bg-gray-900 text-white text-xs font-medium px-3 py-2 rounded-lg whitespace-nowrap shadow-lg">
            <div className="flex items-center gap-1.5">
              <Lock size={10} />
              Coming Soon — backend endpoint pending
            </div>
            {/* Arrow */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
          </div>
        </div>
      )}
    </div>
  );
}

// ── Sibling Branch Card ────────────────────────────────────────────────────

function SiblingCard({ branch, active, onClick }: { branch: any; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-xl p-3.5 border transition-all duration-150"
      style={{
        backgroundColor: active ? '#EEF2FF' : '#fff',
        borderColor:     active ? '#6366F1' : '#E5E7EB',
      }}
    >
      <div className="flex items-center gap-2.5">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: active ? '#6366F133' : '#F3F4F6' }}
        >
          <GitBranch size={14} style={{ color: active ? '#6366F1' : '#9CA3AF' }} />
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-gray-900 text-sm truncate">{branch.name}</p>
          <p className="text-xs text-gray-400 truncate">{branch.address || '—'}</p>
        </div>
      </div>
    </button>
  );
}

// ── Quick stat pill ────────────────────────────────────────────────────────

function StatPill({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-gray-100">
      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
      <span className="text-sm font-bold text-gray-800">{value}</span>
      <span className="text-xs text-gray-400">{label}</span>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────

export default function BranchMapPage() {
  const { t }    = useTranslation();
  const { user } = useAuth();

  const [siblings, setSiblings]             = useState<any[]>([]);
  const [myBranch, setMyBranch]             = useState<any | null>(null);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState(false);
  const [showSiblings, setShowSiblings]     = useState(true);
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);
  const [activeCard, setActiveCard]         = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(false);
    try {
      const [sibRes, branchRes] = await Promise.allSettled([
        api.get('/branches/pharmacy-branches'),
        api.get('/branches/my-branch-details'),
      ]);

      if (sibRes.status === 'fulfilled') {
        const data = sibRes.value.data?.data ?? sibRes.value.data ?? [];
        setSiblings(Array.isArray(data) ? data : []);
      }

      if (branchRes.status === 'fulfilled') {
        setMyBranch(branchRes.value.data?.data ?? branchRes.value.data);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // ── Build markers ────────────────────────────────────────────────────────
  const markers: MapMarker[] = [];

  if (myBranch?.latitude != null) {
    markers.push({
      id:       myBranch.id ?? 'my-branch',
      lat:      myBranch.latitude,
      lng:      myBranch.longitude,
      label:    myBranch.name ?? 'My Branch',
      sublabel: myBranch.address,
      type:     'own',
      status:   'My Location',
    });
  }

  if (showSiblings) {
    siblings
      .filter(b => b.latitude != null && b.longitude != null)
      .forEach(b =>
        markers.push({
          id:       b.id,
          lat:      b.latitude,
          lng:      b.longitude,
          label:    b.name,
          sublabel: b.address,
          type:     'sibling',
          status:   'Network Branch',
        })
      );
  }

  const siblingsWithCoords = siblings.filter(b => b.latitude != null);
  const siblingsNoCoords   = siblings.filter(b => b.latitude == null);

  return (
    <div className="space-y-5">

      {/* Hero */}
      <div
        className="rounded-2xl p-6 text-white flex items-start justify-between gap-4"
        style={{ backgroundColor: NAVY }}
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Navigation size={18} className="text-white/70" />
            <p className="text-white/70 text-sm font-medium">Branch Location</p>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold">Network Map</h1>
          <p className="mt-1 text-white/60 text-sm">Your branch and nearby network locations</p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 text-sm transition-all disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Stats */}
      <div className="flex flex-wrap gap-2">
        <StatPill label="Sibling branches" value={siblings.length}          color="#6366F1" />
        <StatPill label="On map"           value={siblingsWithCoords.length} color={TEAL}   />
      </div>

      {error ? (
        <div className="flex items-center justify-center h-64 rounded-2xl border border-gray-100 bg-gray-50">
          <div className="text-center space-y-2">
            <AlertCircle size={28} className="mx-auto text-gray-300" />
            <p className="text-sm text-gray-400">Failed to load map data.</p>
            <button onClick={load} className="text-xs font-medium underline" style={{ color: TEAL }}>
              Try again
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Map column */}
          <div className="lg:col-span-2 space-y-3">

            {/* Layer toggles */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide mr-1">Layers</span>

              {/* Sibling branches — fully functional */}
              <button
                onClick={() => setShowSiblings(v => !v)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all"
                style={
                  showSiblings
                    ? { backgroundColor: '#EEF2FF', borderColor: '#6366F1', color: '#6366F1' }
                    : { backgroundColor: '#fff',    borderColor: '#E5E7EB', color: '#9CA3AF' }
                }
              >
                {showSiblings ? <Eye size={12} /> : <EyeOff size={12} />}
                Sibling Branches
              </button>

              {/* Competitors — DISABLED until GET /map/competitors is live */}
              <ComingSoonTooltip>
                <button
                  disabled
                  aria-disabled="true"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium cursor-not-allowed select-none"
                  style={{
                    backgroundColor: '#F9FAFB',
                    borderColor:     '#E5E7EB',
                    color:           '#D1D5DB',
                  }}
                >
                  <Lock size={11} className="text-gray-300" />
                  Competitors
                  <span
                    className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold"
                    style={{ backgroundColor: '#FEF3C7', color: '#92400E' }}
                  >
                    Soon
                  </span>
                </button>
              </ComingSoonTooltip>
            </div>

            {/* Map canvas */}
            {loading ? (
              <div style={{ height: '480px' }}><MapSkeleton /></div>
            ) : markers.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50 gap-3"
                style={{ height: '480px' }}
              >
                <MapPin size={32} className="text-gray-200" />
                <p className="text-sm text-gray-400">No location data available.</p>
                <p className="text-xs text-gray-300 text-center max-w-xs">
                  Ask your Pharmacy Owner to add coordinates to this branch and sibling branches.
                </p>
              </div>
            ) : (
              <BaseMap
                markers={markers}
                triangulate={showSiblings && siblingsWithCoords.length > 0}
                height="480px"
                onMarkerClick={m => {
                  setSelectedMarker(m);
                  setActiveCard(m.id);
                }}
                className="shadow-sm"
              />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">

            {/* My branch info */}
            {myBranch && (
              <div
                className="rounded-2xl border p-4 space-y-3"
                style={{ borderColor: TEAL, backgroundColor: '#F0FAFA' }}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: TEAL }}
                  >
                    <Navigation size={14} className="text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{myBranch.name}</p>
                    <p className="text-xs text-gray-400">My Branch</p>
                  </div>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex gap-2">
                    <span className="text-gray-400 w-14 shrink-0">Address</span>
                    <span className="text-gray-700 font-medium">{myBranch.address || '—'}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-gray-400 w-14 shrink-0">Coords</span>
                    <span className="font-mono text-[11px] text-gray-500">
                      {myBranch.latitude != null
                        ? `${myBranch.latitude.toFixed(4)}, ${myBranch.longitude.toFixed(4)}`
                        : <span className="text-amber-500">Not set</span>
                      }
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Sibling list */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                Network Branches ({siblings.length})
              </p>
              <div className="space-y-2 overflow-y-auto pr-1" style={{ maxHeight: '300px' }}>
                {loading ? (
                  [...Array(3)].map((_, i) => (
                    <div key={i} className="h-16 rounded-xl bg-gray-100 animate-pulse" />
                  ))
                ) : siblings.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-6">No sibling branches found.</p>
                ) : (
                  siblings.map(b => (
                    <SiblingCard
                      key={b.id}
                      branch={b}
                      active={activeCard === b.id}
                      onClick={() => setActiveCard(prev => prev === b.id ? null : b.id)}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Missing coords warning */}
            {siblingsNoCoords.length > 0 && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle size={14} className="text-amber-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-amber-700">
                      {siblingsNoCoords.length} branch{siblingsNoCoords.length > 1 ? 'es' : ''} missing coordinates
                    </p>
                    <p className="text-xs text-amber-600 mt-0.5">
                      {siblingsNoCoords.map(b => b.name).join(', ')} — ask the pharmacy owner to update them.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Selected marker detail */}
            {selectedMarker && (
              <div className="rounded-2xl bg-white border border-gray-100 p-4 shadow-sm space-y-2">
                <div className="flex items-center gap-2">
                  <Building2
                    size={14}
                    style={{ color: selectedMarker.type === 'competitor' ? RED : selectedMarker.type === 'sibling' ? '#6366F1' : TEAL }}
                  />
                  <p className="font-bold text-gray-900 text-sm">{selectedMarker.label}</p>
                </div>
                {selectedMarker.sublabel && (
                  <p className="text-xs text-gray-500">{selectedMarker.sublabel}</p>
                )}
                <span
                  className="inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full"
                  style={
                    selectedMarker.type === 'competitor'
                      ? { backgroundColor: '#FEE2E2', color: '#991B1B' }
                      : selectedMarker.type === 'sibling'
                      ? { backgroundColor: '#EEF2FF', color: '#4338CA' }
                      : { backgroundColor: `${TEAL}22`, color: TEAL }
                  }
                >
                  {selectedMarker.status}
                </span>
                <p className="text-[11px] font-mono text-gray-400">
                  {selectedMarker.lat.toFixed(5)}, {selectedMarker.lng.toFixed(5)}
                </p>
              </div>
            )}

            {/* Competitors pending notice */}
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
              <div className="flex items-start gap-2">
                <Lock size={13} className="text-gray-300 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-gray-500">Competitor layer coming soon</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    The nearby competitor map requires a backend endpoint that is currently being built.
                    It will activate automatically once deployed.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
