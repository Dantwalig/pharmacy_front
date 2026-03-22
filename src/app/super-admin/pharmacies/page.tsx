// frontend/src/app/super-admin/pharmacies/page.tsx
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import SuperAdminTopbar from '@/components/super-admin/SuperAdminTopbar';
import SuperAdminSidebar from '@/components/super-admin/SuperAdminSidebar';
import { MagnifyingGlassIcon, CheckCircleIcon, XCircleIcon, EyeIcon, BuildingStorefrontIcon } from '@heroicons/react/24/outline';

function PharmaciesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pharmacies, setPharmacies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(searchParams.get('filter')?.toUpperCase() || 'ALL');
  const [search, setSearch] = useState('');
  const [actionId, setActionId] = useState<string | null>(null);
  const [rejectModal, setRejectModal] = useState<{ id: string; name: string } | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => { fetchPharmacies(); }, [filter]);

  const fetchPharmacies = async () => {
    setLoading(true);
    try {
      const url = filter === 'ALL' ? '/super-admin/pharmacies' : `/super-admin/pharmacies?status=${filter}`;
      const res = await api.get(url);
      setPharmacies(res.data);
    } catch { toast.error('Failed to load pharmacies'); }
    finally { setLoading(false); }
  };

  const handleApprove = async (id: string) => {
    setActionId(id);
    try {
      await api.patch(`/super-admin/pharmacies/${id}/approve`);
      toast.success('Pharmacy approved!');
      fetchPharmacies();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed to approve'); }
    finally { setActionId(null); }
  };

  const handleReject = async () => {
    if (!rejectModal || !rejectReason.trim()) { toast.error('Please provide a rejection reason'); return; }
    setActionId(rejectModal.id);
    try {
      await api.patch(`/super-admin/pharmacies/${rejectModal.id}/reject`, { reason: rejectReason });
      toast.success('Pharmacy rejected');
      setRejectModal(null);
      setRejectReason('');
      fetchPharmacies();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed to reject'); }
    finally { setActionId(null); }
  };

  const filtered = pharmacies.filter(p =>
  p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.user?.email?.toLowerCase().includes(search.toLowerCase())
  );

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-700',
      APPROVED: 'bg-green-100 text-green-700',
      REJECTED: 'bg-red-100 text-red-700',
    };
    return map[status] || 'bg-gray-100 text-gray-600';
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
    <SuperAdminSidebar />
    <div className="flex-1 flex flex-col">
      <SuperAdminTopbar />
      <main className="flex-1 p-6 overflow-auto">
        <div className="space-y-6">

          {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                 Pharmacies
                </h1>
              <p className="text-gray-500 text-sm mt-1">{filtered.length} pharmacies found</p>
            </div>
            <div className="relative w-full sm:w-72">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Search by name or email..."
                  value={search} onChange={e => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm" />
            </div>
          </div>

          {/* Filter tabs */}
            <div className="flex flex-wrap gap-2">
            {['ALL','PENDING','APPROVED','REJECTED'].map(s => (
                <button key={s} onClick={() => setFilter(s)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === s ? 'bg-red-600 text-white shadow' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:shadow-md'}`}>
                {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
                  {s === 'PENDING' && (
                    <span className="ml-2 bg-yellow-500 text-white text-xs rounded-full px-1.5 py-0.5">
                    {pharmacies.filter(p => p.status === 'PENDING').length}
                    </span>
                )}
                </button>
            ))}
            </div>

          {/* Table */}
            {loading ? (
              <div className="flex justify-center py-20"><LoadingSpinner /></div>
          ) : filtered.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-16 text-center">
              <BuildingStorefrontIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No pharmacies found</p>
            </div>
          ) : (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                  <tr>
                    {['Pharmacy', 'Owner Email', 'Phone', 'Address', 'Status', 'Submitted', 'Actions'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">{h}</th>
                    ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {filtered.map(p => (
                      <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xs shrink-0">
                            {p.name?.charAt(0)}
                            </div>
                          <span className="font-medium text-gray-900 dark:text-gray-100">{p.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{p.user?.email}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{p.phone || '—'}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400 max-w-40 truncate">{p.address || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusBadge(p.status)}`}>{p.status}</span>
                        {p.status === 'REJECTED' && p.rejectionReason && (
                            <p className="text-xs text-red-500 mt-1 max-w-[120px] truncate" title={p.rejectionReason}>{p.rejectionReason}</p>
                        )}
                        </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{new Date(p.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => router.push(`/super-admin/pharmacies/${p.id}`)}
                              className="p-1.5 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition-colors" title="View details">
                            <EyeIcon className="w-4 h-4" />
                          </button>
                          {p.status === 'PENDING' && (
                              <>
                              <button onClick={() => handleApprove(p.id)} disabled={actionId === p.id}
                                  className="p-1.5 bg-green-100 hover:bg-green-200 text-green-600 rounded-lg transition-colors disabled:opacity-50" title="Approve">
                                <CheckCircleIcon className="w-4 h-4" />
                              </button>
                              <button onClick={() => setRejectModal({ id: p.id, name: p.name })} disabled={actionId === p.id}
                                  className="p-1.5 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors disabled:opacity-50" title="Reject">
                                <XCircleIcon className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          </div>
                      </td>
                    </tr>
                  ))}
                  </tbody>
              </table>
            </div>
          )}
          </div>
      </main>
    </div>

    {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-md">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Reject Pharmacy</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            You are rejecting <strong>{rejectModal.name}</strong>. Please provide a reason:
            </p>
          <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)}
              rows={4} placeholder="Explain why this pharmacy is being rejected..."
              className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none text-sm resize-none" />
          <div className="flex gap-3 mt-4">
            <button onClick={() => { setRejectModal(null); setRejectReason(''); }}
                className="flex-1 px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50">
              Cancel
              </button>
            <button onClick={handleReject} disabled={!rejectReason.trim()}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium disabled:opacity-50">
              Confirm Rejection
              </button>
          </div>
        </div>
      </div>
    )}
    </div>
);
}

export default function PharmaciesPage() {
  return <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>}><PharmaciesContent /></Suspense>;
}