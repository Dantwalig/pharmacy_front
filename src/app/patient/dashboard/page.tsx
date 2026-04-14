// src/app/patient/dashboard/page.tsx

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import api from '@/lib/api';
import dynamic from 'next/dynamic';
import {
  MagnifyingGlassIcon,
  ClipboardDocumentListIcon,
  ShoppingCartIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { fetchPharmacyLocations } from '@/services/pharmacies';
import { PharmacyLocation, DEFAULT_CENTER, DEFAULT_ZOOM } from '@/features/map/pharmacyData';
import { MapSkeleton } from '@/components/map/MapStates';
import MapLayout from '@/components/map/MapLayout';

const MapView = dynamic(() => import('@/components/map/MapView'), {
  ssr: false,
  loading: () => <MapSkeleton />,
});

const NAVY = '#1E4D8C';
const TEAL = '#2D9B8A';

export default function PatientDashboard() {
  const { t } = useTranslation();
  const router = useRouter();

  const [stats, setStats] = useState({ totalOrders: 0, completedOrders: 0, pendingOrders: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Map state
  const [mapPharmacies, setMapPharmacies] = useState<PharmacyLocation[]>([]);
  const [mapLoading, setMapLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
    loadMapPharmacies();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const ordersRes = await api.get('/orders/my-orders');
      const orders = ordersRes.data;
      setStats({
        totalOrders: orders.length,
        completedOrders: orders.filter((o: any) =>
          ['COMPLETED', 'DELIVERED'].includes(o.status)
        ).length,
        pendingOrders: orders.filter((o: any) =>
          ['PENDING', 'ACCEPTED', 'PREPARING'].includes(o.status)
        ).length,
      });
      setRecentOrders(orders.slice(0, 5));
    } catch {
      setStats({ totalOrders: 0, completedOrders: 0, pendingOrders: 0 });
      setRecentOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const loadMapPharmacies = async () => {
    try {
      const data = await fetchPharmacyLocations();
      // Show only first 6 on dashboard preview
      setMapPharmacies(data.slice(0, 6));
    } catch {
      setMapPharmacies([]);
    } finally {
      setMapLoading(false);
    }
  };

  const quickActions = [
    {
      title: 'Find Pharmacy & Medicine',
      description: 'Browse pharmacies and search medications',
      icon: MagnifyingGlassIcon,
      href: '/patient/search',
      bg: `linear-gradient(135deg, ${NAVY}, #1a3d6f)`,
    },
    {
      title: 'View Orders',
      description: 'Track your current and past orders',
      icon: ClipboardDocumentListIcon,
      href: '/patient/orders',
      bg: `linear-gradient(135deg, ${TEAL}, #207a6c)`,
    },
    {
      title: 'Shopping Cart',
      description: 'Review items in your cart',
      icon: ShoppingCartIcon,
      href: '/patient/cart',
      bg: `linear-gradient(135deg, ${NAVY}, ${TEAL})`,
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div
        className="rounded-2xl shadow-xl p-8 text-white"
        style={{ background: `linear-gradient(135deg, ${NAVY}, #1a3d6f)` }}
      >
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">{t('dashboard.welcomeBack')}</h1>
        <p className="text-blue-100 text-lg">{t('dashboard.manageHealthcare')}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: t('dashboard.totalOrders'), value: stats.totalOrders, emoji: '📦', color: NAVY },
          { label: t('dashboard.completed'), value: stats.completedOrders, emoji: '✅', color: TEAL },
          { label: t('dashboard.pending'), value: stats.pendingOrders, emoji: '⏰', color: NAVY },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">{s.label}</h3>
              <span className="text-3xl">{s.emoji}</span>
            </div>
            <p className="text-4xl font-bold" style={{ color: s.color }}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
          {t('dashboard.quickActions')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickActions.map((action) => (
            <Link key={action.href} href={action.href}>
              <div
                className="text-white p-8 rounded-2xl shadow-xl cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                style={{ background: action.bg }}
              >
                <action.icon className="w-12 h-12 mb-4 opacity-90" />
                <h3 className="font-bold text-xl mb-2">{action.title}</h3>
                <p className="text-sm opacity-90">{action.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ─── NEARBY PHARMACIES MAP SECTION ─── */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: `${TEAL}15` }}
            >
              <MapPinIcon className="w-6 h-6" style={{ color: TEAL }} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                Nearby Pharmacies
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {mapPharmacies.length} pharmacies on the map
              </p>
            </div>
          </div>
          <Link
            href="/patient/search"
            className="text-sm font-semibold px-4 py-2 rounded-xl text-white transition-all hover:opacity-90"
            style={{ background: NAVY }}
          >
            View All →
          </Link>
        </div>

        <div className="p-4" style={{ height: 380 }}>
          {mapLoading ? (
            <MapSkeleton />
          ) : (
            <MapView
              pharmacies={mapPharmacies}
              center={DEFAULT_CENTER}
              zoom={DEFAULT_ZOOM}
              selectedId={selectedId}
              onSelectPharmacy={(p) => setSelectedId(p.id)}
              onViewDetails={(id) => router.push(`/patient/pharmacies/${id}`)}
              className="h-full rounded-xl"
            />
          )}
        </div>

        {/* Quick pharmacy chips below map */}
        {!mapLoading && mapPharmacies.length > 0 && (
          <div className="px-4 pb-4 flex gap-2 flex-wrap">
            {mapPharmacies.slice(0, 5).map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedId(p.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                  selectedId === p.id
                    ? 'text-white border-transparent'
                    : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-teal-400'
                }`}
                style={selectedId === p.id ? { background: TEAL, borderColor: TEAL } : {}}
              >
                {p.status === 'OPEN' ? '🟢' : '🔴'} {p.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Recent Orders */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            {t('dashboard.recentOrders')}
          </h2>
          <Link href="/patient/orders" className="text-sm font-medium hover:underline" style={{ color: NAVY }}>
            View All →
          </Link>
        </div>
        {recentOrders.length > 0 ? (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {recentOrders.map((order: any) => (
              <Link key={order.id} href={`/patient/orders/${order.id}`}>
                <div className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-gray-800 dark:text-gray-100">
                        Order #{order.id.slice(0, 8)}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">{order.pharmacy?.name}</p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`px-4 py-1.5 rounded-full text-xs font-semibold ${
                          ['COMPLETED', 'DELIVERED'].includes(order.status)
                            ? 'bg-emerald-50 text-emerald-700'
                            : order.status === 'CANCELLED'
                            ? 'bg-red-50 text-red-600'
                            : 'bg-blue-50 text-blue-700'
                        }`}
                      >
                        {order.status}
                      </span>
                      <p className="text-sm text-gray-500 mt-1 font-medium">
                        {order.total?.toLocaleString()} RWF
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 m-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
            <ClipboardDocumentListIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-700 dark:text-gray-200 text-lg font-semibold mb-1">
              {t('dashboard.noOrdersYet')}
            </p>
            <p className="text-sm text-gray-400">{t('dashboard.startShopping')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
