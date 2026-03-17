// frontend/src/app/super-admin/pharmacies/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import SuperAdminTopbar from '@/components/super-admin/SuperAdminTopbar';
import SuperAdminSidebar from '@/components/super-admin/SuperAdminSidebar';
import { ArrowLeftIcon, CheckCircleIcon, XCircleIcon, DocumentTextIcon, MapPinIcon, PhoneIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

export default function SuperAdminPharmacyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [pharmacy, setPharmacy] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showReject, setShowReject] = useState(false);

  useEffect(() => { fetchPharmacy(); }, [params.id]);

  const fetchPharmacy = async () => {
    try {
      const res = await api.get(`/super-admin/pharmacies/${params.id}`);
      setPharmacy(res.data);
    } catch { toast.error('Failed to load pharmacy'); }
    finally { setLoading(false); }
  };

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      await api.patch(`/super-admin/pharmacies/${params.id}/approve`);
      toast.success('Pharmacy approved!');
      fetchPharmacy();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setActionLoading(false); }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) { toast.error('Provide a rejection reason'); return; }
    setActionLoading(true);
    try {
      await api.patch(`/super-admin/pharmacies/${params.id}/reject`, { reason: rejectReason });
      toast.success('Pharmacy rejected');
      setShowReject(false);
      fetchPharmacy();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setActionLoading(false); }
  };

  if (loading) return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <SuperAdminSidebar /><div className="flex-1 flex flex-col"><SuperAdminTopbar />
        <div className="flex-1 flex items-center justify-center"><LoadingSpinner /></div>
      </div>
    </div>
  );

  if (!pharmacy) return null;
  const statusColor: Record<string,string> = { PENDING:'bg-yellow-100 text-yellow-700', APPROVED:'bg-green-100 text-green-700', REJECTED:'bg-red-100 text-red-700' };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <SuperAdminSidebar />
      <div className="flex-1 flex flex-col">
        <SuperAdminTopbar />
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-4xl mx-auto space-y-6">
            <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm">
              <ArrowLeftIcon className="w-4 h-4" /> Back to Pharmacies
            </button>

            {/* Header */}
            <div className="bg-linear-to-r from-red-600 to-pink-600 rounded-2xl p-6 text-white flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold mb-1">{pharmacy.name}</h1>
                <p className="text-red-200 text-sm">Submitted: {new Date(pharmacy.createdAt).toLocaleDateString()}</p>
              </div>
              <span className={`px-4 py-2 rounded-xl text-sm font-bold ${statusColor[pharmacy.status] || 'bg-gray-100 text-gray-600'}`}>
                {pharmacy.status}
              </span>
            </div>

            {/* Actions for PENDING */}
            {pharmacy.status === 'PENDING' && (
              <div className="flex flex-wrap gap-3">
                <button onClick={handleApprove} disabled={actionLoading}
                  className="flex items-center gap-2 px-6 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-semibold disabled:opacity-50">
                  <CheckCircleIcon className="w-4 h-4" /> Approve Pharmacy
                </button>
                <button onClick={() => setShowReject(true)}
                  className="flex items-center gap-2 px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-semibold">
                  <XCircleIcon className="w-4 h-4" /> Reject
                </button>
              </div>
            )}

            {/* Rejection reason */}
            {pharmacy.status === 'REJECTED' && pharmacy.rejectionReason && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 rounded-xl p-4">
                <p className="text-sm font-semibold text-red-700 dark:text-red-400 mb-1">Rejection Reason:</p>
                <p className="text-sm text-red-600 dark:text-red-300">{pharmacy.rejectionReason}</p>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Owner Info */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-5">
                <h2 className="font-bold text-gray-900 dark:text-gray-100 mb-4">Owner / Representative</h2>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <span className="font-semibold w-28 text-gray-500">Name:</span>
                    {pharmacy.representativeName || pharmacy.user?.email}
                  </div>
                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <EnvelopeIcon className="w-4 h-4 text-gray-400 shrink-0" />
                    {pharmacy.user?.email}
                  </div>
                  {pharmacy.phone && <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <PhoneIcon className="w-4 h-4 text-gray-400 shrink-0" />{pharmacy.phone}
                  </div>}
                  {pharmacy.address && <div className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                    <MapPinIcon className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />{pharmacy.address}
                  </div>}
                </div>
              </div>

              {/* Business Info */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-5">
                <h2 className="font-bold text-gray-900 dark:text-gray-100 mb-4">Business Details</h2>
                <div className="space-y-3 text-sm">
                  {pharmacy.licenseNumber && <div className="flex gap-2"><span className="font-semibold text-gray-500 w-28">License No:</span><span className="text-gray-700 dark:text-gray-300">{pharmacy.licenseNumber}</span></div>}
                  {pharmacy.dateOfIncorporation && <div className="flex gap-2"><span className="font-semibold text-gray-500 w-28">Incorporated:</span><span className="text-gray-700 dark:text-gray-300">{new Date(pharmacy.dateOfIncorporation).toLocaleDateString()}</span></div>}
                  {pharmacy.operatingHours && <div className="flex gap-2"><span className="font-semibold text-gray-500 w-28">Hours:</span><span className="text-gray-700 dark:text-gray-300">{pharmacy.operatingHours}</span></div>}
                </div>
              </div>
            </div>

            {/* Documents */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-5">
              <h2 className="font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <DocumentTextIcon className="w-5 h-5 text-purple-500" /> Submitted Documents
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: 'RDB Certificate', url: pharmacy.rdbCertificate || pharmacy.businessRegistrationUrl },
                  { label: 'Pharmacy License', url: pharmacy.pharmacyLicense || pharmacy.pharmacyLicenseUrl },
                ].map(doc => (
                  <div key={doc.label} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{doc.label}</p>
                      {doc.url ? <p className="text-xs text-green-600">✓ Uploaded</p> : <p className="text-xs text-red-500">✗ Missing</p>}
                    </div>
                    {doc.url && (
                      <a href={doc.url} target="_blank" rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-200">
                        View
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Reject Modal */}
      {showReject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">Reject Pharmacy</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Provide a clear rejection reason — it will be shown to the pharmacy owner.</p>
            <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} rows={4} placeholder="e.g. License is expired, invalid document..."
              className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none resize-none" />
            <div className="flex gap-3 mt-4">
              <button onClick={() => setShowReject(false)} className="flex-1 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg text-sm font-medium">Cancel</button>
              <button onClick={handleReject} disabled={actionLoading || !rejectReason.trim()}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium disabled:opacity-50">
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}