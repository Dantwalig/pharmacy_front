'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const NAVY = '#1E4D8C';
const TEAL = '#2D9B8A';

const FDA_CATEGORIES = [
  'Analgesics & Antipyretics', 'Antibiotics & Antimicrobials', 'Antifungals',
  'Antivirals & Antiretrovirals', 'Antimalaria', 'Antituberculosis',
  'Antiparasitics & Anthelmintics', 'Cardiovascular & Antihypertensives',
  'Antidiabetics', 'Gastrointestinal', 'Respiratory & Bronchodilators',
  'Central Nervous System', 'Vitamins, Minerals & Supplements', 'Dermatologicals',
  'Ophthalmologicals', 'ENT (Ear, Nose & Throat)', 'Hormones & Endocrine',
  'Vaccines & Biologicals', 'Oncologicals', 'Immunosuppressants', 'Contraceptives',
  'Haematologicals', 'Musculoskeletal & Anti-inflammatories', 'Urological',
  'Psychiatric & Psychotropic', 'Anesthetics', 'Diagnostics & Contrast Media',
  'Traditional & Herbal Medicines', 'Other',
];

export default function StaffAddMedicationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [branchName, setBranchName] = useState('');
  const [branchId, setBranchId] = useState('');
  const [profileLoading, setProfileLoading] = useState(true);

  const [form, setForm] = useState({
    name: '', category: FDA_CATEGORIES[0], chemicalName: '', description: '',
    price: '', quantity: '', lowStockThreshold: '10', requiresPrescription: false,
  });

  useEffect(() => {
    // GET /staff/profile/me returns branch info including branchId
    api.get('/staff/profile/me')
      .then(res => {
        setBranchName(res.data?.branch?.name ?? '');
        setBranchId(res.data?.branchId ?? res.data?.branch?.id ?? '');
      })
      .catch(() => toast.error('Could not load branch info'))
      .finally(() => setProfileLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchId) { toast.error('Branch not found'); return; }
    setLoading(true);
    try {
      // POST /medications — Role.PHARMACIST now permitted
      await api.post('/medications', {
        branchId,
        name: form.name,
        chemicalName: form.chemicalName || undefined,
        description: form.description || undefined,
        category: form.category,
        price: parseFloat(form.price),
        quantity: parseInt(form.quantity),
        lowStockThreshold: parseInt(form.lowStockThreshold),
        requiresPrescription: form.requiresPrescription,
      });
      toast.success('Medication added successfully');
      router.push('/staff/inventory');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add medication');
    } finally { setLoading(false); }
  };

  const inputCls = "w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-teal-400 transition-colors";
  const labelCls = "block text-sm font-semibold text-gray-700 mb-1";

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <button onClick={() => router.push('/staff/inventory')}
        className="flex items-center gap-2 text-sm font-medium hover:underline" style={{ color: NAVY }}>
        <ArrowLeftIcon className="w-4 h-4" /> Back to Inventory
      </button>

      <div className="rounded-2xl p-6 text-white" style={{ backgroundColor: NAVY }}>
        <h1 className="text-2xl font-bold">Add Medication</h1>
        <p className="mt-1 text-white/70">Add a new medication to your branch inventory</p>
      </div>

      {profileLoading ? (
        <div className="flex justify-center py-10"><LoadingSpinner /></div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 border border-gray-100 space-y-5">

          <div>
            <label className={labelCls}>Branch</label>
            <input type="text" readOnly value={branchName || 'Your branch'}
              className={`${inputCls} bg-gray-50 text-gray-500`} />
            <p className="text-xs text-gray-400 mt-1">Medication will be added to your assigned branch</p>
          </div>

          <div>
            <label className={labelCls}>Medication Name <span className="text-red-500">*</span></label>
            <input type="text" required value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Amoxicillin 500mg" className={inputCls} />
          </div>

          <div>
            <label className={labelCls}>Chemical / Generic Name</label>
            <input type="text" value={form.chemicalName}
              onChange={e => setForm(f => ({ ...f, chemicalName: e.target.value }))}
              placeholder="e.g. Amoxicillin trihydrate" className={inputCls} />
          </div>

          <div>
            <label className={labelCls}>Category <span className="text-red-500">*</span></label>
            <select required value={form.category}
              onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className={inputCls}>
              {FDA_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Price (RWF) <span className="text-red-500">*</span></label>
              <input type="number" required min="0" step="any" value={form.price}
                onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                placeholder="e.g. 1500" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Quantity (units) <span className="text-red-500">*</span></label>
              <input type="number" required min="0" value={form.quantity}
                onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))}
                placeholder="e.g. 100" className={inputCls} />
            </div>
          </div>

          <div>
            <label className={labelCls}>Low Stock Threshold (units)</label>
            <input type="number" min="1" value={form.lowStockThreshold}
              onChange={e => setForm(f => ({ ...f, lowStockThreshold: e.target.value }))} className={inputCls} />
            <p className="text-xs text-gray-400 mt-1">Alert raised when stock falls below this number</p>
          </div>

          <div>
            <label className={labelCls}>Description</label>
            <textarea rows={3} value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Optional notes" className={`${inputCls} resize-none`} />
          </div>

          <div className="flex items-center gap-3">
            <input type="checkbox" id="rx" checked={form.requiresPrescription}
              onChange={e => setForm(f => ({ ...f, requiresPrescription: e.target.checked }))}
              className="w-4 h-4 rounded" />
            <label htmlFor="rx" className="text-sm font-medium text-gray-700">Requires prescription</label>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => router.push('/staff/inventory')}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
              style={{ backgroundColor: TEAL }}>
              {loading ? 'Adding...' : 'Add Medication'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
