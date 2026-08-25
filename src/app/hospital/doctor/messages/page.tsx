'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  MagnifyingGlassIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  InformationCircleIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { api, unwrapData } from '@/lib/api';

// The backend has no real-time messaging API. This page loads the doctor's
// notification feed from GET /api/notifications and displays each notification
// as a conversation thread. The send-message input is disabled.
// See src/docs/DOCTOR_REMAINING_PAGES_API_GAPS.md for the full gap description.

interface BackendNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

interface Thread {
  id: string;
  senderName: string;
  lastMessage: string;
  timestamp: string;
  unread: boolean;
  body: string;
}

function toThread(n: BackendNotification): Thread {
  return {
    id:          n.id,
    senderName:  n.title,
    lastMessage: n.message,
    timestamp:   n.createdAt,
    unread:      !n.isRead,
    body:        n.message,
  };
}

export default function DoctorMessagesPage() {
  const { t } = useTranslation();

  const [threads,  setThreads]  = useState<Thread[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [search,   setSearch]   = useState('');
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/notifications?userType=doctor');
      const raw = unwrapData<BackendNotification>(res.data);
      const sorted = [...raw].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setThreads(sorted.map(toThread));
    } catch (err: any) {
      setError(err?.response?.data?.message ?? err?.message ?? 'Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [activeId]);

  const filtered = threads.filter(th => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return th.senderName.toLowerCase().includes(q) || th.lastMessage.toLowerCase().includes(q);
  });

  const active = threads.find(th => th.id === activeId) ?? null;

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-8 h-[calc(100vh-140px)] flex flex-col gap-6">
      {/* Hero */}
      <div className="rounded-2xl px-8 py-8 shrink-0" style={{ background: '#EBF5FF' }}>
        <h1 className="text-3xl font-bold tracking-tight" style={{ color: '#1E3A5F' }}>
          {t('hospital.doctorMessagingHub', 'Notifications & Messages')}
        </h1>
        <p className="mt-1 text-sm font-medium" style={{ color: '#0284C7' }}>
          {t('hospital.messagesSubtitle', 'Your notification feed — real-time chat coming soon')}
        </p>
      </div>

      {/* Gap notice */}
      <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 shrink-0">
        <InformationCircleIcon className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        <p className="text-sm text-amber-800">
          <span className="font-semibold">Backend gap:</span> A real-time doctor-to-staff messaging API is not yet available.
          This page shows your <span className="font-semibold">notification feed</span> as a fallback.
          See <code className="text-xs bg-amber-100 px-1 rounded">src/docs/DOCTOR_REMAINING_PAGES_API_GAPS.md</code>.
        </p>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden min-h-0">
        {/* Left panel — thread list */}
        <div className="w-80 lg:w-96 bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
          <div className="p-5 border-b border-gray-100 bg-gray-50/50">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={t('hospital.searchConversations', 'Search notifications...')}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="animate-pulse space-y-1.5 px-1 py-2">
                    <div className="h-3 w-32 bg-gray-200 rounded" />
                    <div className="h-2.5 w-48 bg-gray-200 rounded" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="p-6 text-center space-y-3">
                <p className="text-sm text-gray-400">{error}</p>
                <button onClick={fetchNotifications} className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 mx-auto">
                  <ArrowPathIcon className="w-4 h-4" /> {t('common.retry', 'Retry')}
                </button>
              </div>
            ) : filtered.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">{t('hospital.noConversationsFound', 'No notifications found.')}</p>
            ) : (
              <ul className="divide-y divide-gray-50">
                {filtered.map(th => (
                  <li
                    key={th.id}
                    onClick={() => setActiveId(th.id)}
                    className={`px-5 py-4 cursor-pointer transition-all hover:bg-gray-50 ${activeId === th.id ? 'bg-blue-50/80' : ''}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-gray-900 truncate">{th.senderName}</h3>
                        <p className="text-xs text-gray-500 truncate mt-1">{th.lastMessage}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <span className="text-[10px] font-medium text-gray-400">
                          {new Date(th.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                        {th.unread && <span className="w-2 h-2 rounded-full bg-blue-600" />}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Right panel — thread detail */}
        <div className="flex-1 bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
          {active ? (
            <>
              <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-sm">
                  {active.senderName.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">{active.senderName}</h2>
                  <p className="text-xs font-medium text-gray-500">{t('hospital.systemNotification', 'System Notification')}</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30">
                <div className="flex justify-start">
                  <div className="max-w-[70%] flex flex-col items-start">
                    <div className="px-5 py-3 rounded-2xl shadow-sm text-sm leading-relaxed bg-white text-gray-800 border border-gray-100 rounded-tl-none">
                      {active.body}
                    </div>
                    <div className="flex items-center gap-1 mt-1.5">
                      <ClockIcon className="w-3 h-3 text-gray-400" />
                      <span className="text-[10px] font-medium text-gray-400">
                        {new Date(active.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>
                <div ref={messagesEndRef} />
              </div>

              {/* Disabled send — no messaging backend */}
              <div className="p-4 border-t border-gray-100">
                <div className="flex items-center gap-3 bg-gray-100 p-2 rounded-2xl border border-gray-200 cursor-not-allowed opacity-60">
                  <input
                    disabled
                    placeholder={t('hospital.chatNotAvailable', 'Chat messaging not yet available — backend API pending')}
                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 px-4 text-gray-400 cursor-not-allowed"
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mb-5" style={{ background: '#EBF5FF' }}>
                <ChatBubbleLeftRightIcon className="w-9 h-9" style={{ color: '#38BDF8' }} />
              </div>
              <h3 className="text-xl font-bold text-gray-900">{t('hospital.yourMessages', 'Your Notifications')}</h3>
              <p className="text-sm text-gray-500 mt-2 max-w-xs leading-relaxed">
                {t('hospital.selectConversationHint', 'Select a notification from the left to view its details.')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
