'use client';

import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Search, Check, ChevronLeft, ChevronRight,
  CalendarPlus, UserPlus, ClipboardCheck, Megaphone,
} from 'lucide-react';
import {
  MOCK_RECEPTIONIST_NOTIFICATIONS,
  type ReceptionistNotification,
  type ReceptionistNotificationType,
} from '@/mock/hospital/receptionist';

const NAVY = '#1E3A5F';
const TEAL = '#38BDF8';

type Tab = 'all' | 'unread' | 'read';

const iconConfig: Record<ReceptionistNotificationType, { Icon: typeof CalendarPlus; bg: string; color: string }> = {
  APPOINTMENT_BOOKED:   { Icon: CalendarPlus,    bg: '#EBF5FF', color: '#2563EB' },
  PATIENT_REGISTERED:   { Icon: UserPlus,        bg: '#EEF2FF', color: '#4F46E5' },
  APPOINTMENT_REMINDER: { Icon: ClipboardCheck,  bg: '#ECFEFF', color: '#0891B2' },
  SYSTEM:               { Icon: Megaphone,       bg: '#EFF6FF', color: '#3B82F6' },
};

export default function ReceptionistNotificationsPage() {
  const { t } = useTranslation();
  const [items, setItems] = useState<ReceptionistNotification[]>(MOCK_RECEPTIONIST_NOTIFICATIONS);
  const [tab, setTab] = useState<Tab>('all');
  const [query, setQuery] = useState('');

  const unreadCount = items.filter((n) => !n.isRead).length;

  const markAllRead = () => setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
  const markRead = (id: string) =>
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));

  const filtered = useMemo(() => {
    return items.filter((n) => {
      if (tab === 'unread' && n.isRead) return false;
      if (tab === 'read' && !n.isRead) return false;
      if (query.trim()) {
        const q = query.toLowerCase();
        return n.title.toLowerCase().includes(q) || n.message.toLowerCase().includes(q);
      }
      return true;
    });
  }, [items, tab, query]);

  const tabs: { key: Tab; labelKey: string; badge?: number }[] = [
    { key: 'all',    labelKey: 'common.all' },
    { key: 'unread', labelKey: 'common.unread', badge: unreadCount },
    { key: 'read',   labelKey: 'common.read' },
  ];

  return (
    <div className="space-y-6">

      {/* ── Hero header ── */}
      <div className="rounded-2xl px-6 sm:px-10 py-7" style={{ background: '#EBF5FF' }}>
        <h1 className="text-3xl sm:text-4xl font-bold" style={{ color: NAVY }}>{t('common.notifications')}</h1>
        <p className="mt-2 text-sm sm:text-base" style={{ color: TEAL }}>{t('hospital.notificationsViewSubtitle')}</p>
      </div>

      {/* ── Search ── */}
      <div className="relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('hospital.searchNotifications')}
          className="w-full bg-white border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm text-gray-700 outline-none focus:ring-2 transition-all"
          style={{ '--tw-ring-color': TEAL } as React.CSSProperties}
        />
      </div>

      {/* ── List card ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">

        {/* Tabs + mark all */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-2">
          <div className="flex items-center gap-5">
            {tabs.map((tabItem) => (
              <button
                key={tabItem.key}
                onClick={() => setTab(tabItem.key)}
                className={`relative flex items-center gap-1.5 pb-2 text-sm font-semibold transition-colors ${
                  tab === tabItem.key ? '' : 'text-gray-500 hover:text-gray-700'
                }`}
                style={tab === tabItem.key ? { color: '#2563EB' } : {}}
              >
                {t(tabItem.labelKey)}
                {tabItem.badge ? (
                  <span
                    className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full text-[11px] font-bold text-white"
                    style={{ backgroundColor: '#2563EB' }}
                  >
                    {tabItem.badge}
                  </span>
                ) : null}
                {tab === tabItem.key && (
                  <span className="absolute left-0 -bottom-[13px] h-0.5 w-full rounded-full" style={{ backgroundColor: '#2563EB' }} />
                )}
              </button>
            ))}
          </div>

          <button
            onClick={markAllRead}
            className="flex items-center gap-1.5 text-sm font-semibold transition-colors hover:opacity-80"
            style={{ color: '#2563EB' }}
          >
            <Check size={15} />
            <span className="hidden sm:inline">{t('common.markAllRead')}</span>
          </button>
        </div>

        {/* Items */}
        {filtered.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-12">{t('hospital.noNotificationsFound')}</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {filtered.map((n) => {
              const cfg = iconConfig[n.type];
              const Icon = cfg.Icon;
              return (
                <div
                  key={n.id}
                  onClick={() => markRead(n.id)}
                  className="flex items-start gap-4 py-4 cursor-pointer transition-colors hover:bg-gray-50/60 rounded-lg px-2"
                >
                  {/* Unread dot */}
                  <span className="pt-2 w-2.5 shrink-0">
                    {!n.isRead && (
                      <span className="block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#2563EB' }} />
                    )}
                  </span>

                  {/* Icon badge */}
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: cfg.bg }}
                  >
                    <Icon size={20} style={{ color: cfg.color }} />
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm">{n.title}</p>
                    <p className="text-sm text-gray-400 mt-0.5">{n.message}</p>
                  </div>

                  {/* Time */}
                  <span className="text-xs text-gray-400 shrink-0 whitespace-nowrap pt-0.5">{n.time}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-end gap-2 mt-6">
          <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors" aria-label="Previous">
            <ChevronLeft size={16} />
          </button>
          {[1, 2, 3].map((page) => (
            <button
              key={page}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-sm font-semibold transition-colors"
              style={page === 1
                ? { backgroundColor: '#2563EB', color: '#fff' }
                : { border: '1px solid #E5E7EB', color: '#6B7280' }}
            >
              {page}
            </button>
          ))}
          <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors" aria-label="Next">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
