// frontend/src/app/pharmacy/inventory/add/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import PharmacyTopbar from '@/components/pharmacy/PharmacyTopbar';
import PharmacySidebar from '@/components/pharmacy/PharmacySidebar';
import SupportBot from '@/components/pharmacy/SupportBot';
import { ArrowLeftIcon, PlusIcon, ArrowUpTrayIcon, DocumentArrowUpIcon } from '@heroicons/react/24/outline';

// Rwanda FDA Medicine Register categories
const FDA_CATEGORIES = [
  'Analgesics & Antipyretics',
  'Antibiotics & Antimicrobials',
  'Antifungals',
  'Antivirals & Antiretrovirals',
  'Antimalaria',
  'Antituberculosis',
  'Antiparasitics & Anthelmintics',
  'Cardiovascular & Antihypertensives',
  'Antidiabetics',
  'Gastrointestinal',
  'Respiratory & Bronchodilators',
  'Central Nervous System',
  'Vitamins, Minerals & Supplements',
  'Dermatologicals',
  'Ophthalmologicals',
  'ENT (Ear, Nose & Throat)',
  'Hormones & Endocrine',
  'Vaccines & Biologicals',
  'Oncologicals',
  'Immunosuppressants',
  'Contraceptives',
  'Haematologicals',
  'Musculoskeletal & Anti-inflammatories',
  'Urological',
  'Psychiatric & Psychotropic',
  'Anesthetics',
  'Diagnostics & Contrast Media',
  'Traditional & Herbal Medicines',
  'Other',
];

type Mode = 'manual' | 'upload';

export default function AddMedicationPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('manual');
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: '', category: FDA_CATEGORIES[0], dosage: '',
    description: '', unitPrice: '', quantityInStock: '',
    lowStockThreshold: '10', requiresPrescription: false,
    manufacturer: '', expiryDate: '',
  });

  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<any[]>([]);

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/medications', {
        ...form,
        unitPrice: parseFloat(form.unitPrice),
        quantityInStock: parseInt(form.quantityInStock),
        lowStockThreshold: parseInt(form.lowStockThreshold),
      });
      toast.success('Medication added successfully!');
      router.push('/pharmacy/inventory');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add medication');
    } finally { setLoading(false); }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['pdf', 'xlsx', 'xls'].includes(ext || '')) {
      toast.error('Only PDF and Excel files (.xlsx, .xls) are supported');
      return;
    }
    setUploadFile(file);
    toast.success(`File "${file.name}" ready to upload`);
  };

  const handleFileUpload = async () => {
    if (!uploadFile) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      const res = await api.post('/medications/bulk-upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success(`Successfully imported ${res.data.count || 'medications'}`);
      router.push('/pharmacy/inventory');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally { setLoading(false); }
  };

  const inputCls = "w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none text-sm";
  const labelCls = "block text-sm font-semibold text-gray-700 mb-1";

  return (
    <div className="flex min-h-screen bg-gray-50">
      <PharmacySidebar />
      <SupportBot />
      <div className="flex-1 flex flex-col lg:ml-72">
        <PharmacyTopbar />
        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          <div className="max-w-4xl mx-auto space-y-6">

            {/* Header */}
            <div className="flex items-center gap-4">
              <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm">
                <ArrowLeftIcon className="w-5 h-5" /> Back
              </button>
            </div>
            <div className="bg-linear-to-r from-[#1E4D8C] via-[#2563a8] to-[#1a3d6f] rounded-2xl p-6 text-white">
              <h1 className="text-2xl font-bold mb-1">Add Medication</h1>
              <p className="text-blue-100 text-sm">Add medications to your inventory manually or upload a file</p>
            </div>

            {/* Mode Switcher */}
            <div className="flex bg-white rounded-xl shadow-sm border border-gray-200 p-1 w-fit">
              <button onClick={() => setMode('manual')}
                className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all ${mode === 'manual' ? 'bg-teal-500 text-white shadow' : 'text-gray-600 hover:text-gray-900'}`}>
                <PlusIcon className="w-4 h-4" /> Add Manually
              </button>
              <button onClick={() => setMode('upload')}
                className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all ${mode === 'upload' ? 'bg-teal-500 text-white shadow' : 'text-gray-600 hover:text-gray-900'}`}>
                <ArrowUpTrayIcon className="w-4 h-4" /> Upload File
              </button>
            </div>

            {/* MANUAL FORM */}
            {mode === 'manual' && (
              <form onSubmit={handleManualSubmit} className="bg-white rounded-xl shadow-md p-6 space-y-5">
                <h2 className="text-lg font-bold text-gray-900 border-b pb-3">Medication Details</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Medication Name <span className="text-red-500">*</span></label>
                    <input type="text" required value={form.name}
                      onChange={e => setForm({...form, name: e.target.value})}
                      className={inputCls} placeholder="e.g. Paracetamol 500mg" />
                  </div>
                  <div>
                    <label className={labelCls}>Category <span className="text-red-500">*</span></label>
                    <select required value={form.category}
                      onChange={e => setForm({...form, category: e.target.value})}
                      className={inputCls}>
                      {FDA_CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Categories from Rwanda FDA Medicine Register</p>
                  </div>
                  <div>
                    <label className={labelCls}>Dosage / Strength</label>
                    <input type="text" value={form.dosage}
                      onChange={e => setForm({...form, dosage: e.target.value})}
                      className={inputCls} placeholder="e.g. 500mg, 10mg/5ml" />
                  </div>
                  <div>
                    <label className={labelCls}>Manufacturer</label>
                    <input type="text" value={form.manufacturer}
                      onChange={e => setForm({...form, manufacturer: e.target.value})}
                      className={inputCls} placeholder="e.g. Cipla Ltd" />
                  </div>
                  <div>
                    <label className={labelCls}>Unit Price (RWF) <span className="text-red-500">*</span></label>
                    <input type="number" required min="0" step="0.01" value={form.unitPrice}
                      onChange={e => setForm({...form, unitPrice: e.target.value})}
                      className={inputCls} placeholder="e.g. 500" />
                  </div>
                  <div>
                    <label className={labelCls}>Quantity In Stock <span className="text-red-500">*</span></label>
                    <input type="number" required min="0" value={form.quantityInStock}
                      onChange={e => setForm({...form, quantityInStock: e.target.value})}
                      className={inputCls} placeholder="e.g. 100" />
                  </div>
                  <div>
                    <label className={labelCls}>Low Stock Threshold</label>
                    <input type="number" min="1" value={form.lowStockThreshold}
                      onChange={e => setForm({...form, lowStockThreshold: e.target.value})}
                      className={inputCls} placeholder="e.g. 10" />
                    <p className="text-xs text-gray-500 mt-1">Alert when stock falls below this</p>
                  </div>
                  <div>
                    <label className={labelCls}>Expiry Date</label>
                    <input type="date" value={form.expiryDate}
                      onChange={e => setForm({...form, expiryDate: e.target.value})}
                      className={inputCls} />
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Description</label>
                  <textarea value={form.description}
                    onChange={e => setForm({...form, description: e.target.value})}
                    className={`${inputCls} resize-none`} rows={3}
                    placeholder="Usage instructions, side effects, storage info..." />
                </div>

                <div className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <input type="checkbox" id="prescription" checked={form.requiresPrescription}
                    onChange={e => setForm({...form, requiresPrescription: e.target.checked})}
                    className="w-4 h-4 text-teal-500 rounded" />
                  <label htmlFor="prescription" className="text-sm font-medium text-gray-700">
                    Requires Prescription — this medication will only be dispensed with a valid prescription
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => router.back()}
                    className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-50">
                    Cancel
                  </button>
                  <button type="submit" disabled={loading}
                    className="px-6 py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-medium text-sm disabled:opacity-50 flex items-center gap-2">
                    {loading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/> Saving...</> : 'Add Medication'}
                  </button>
                </div>
              </form>
            )}

            {/* FILE UPLOAD */}
            {mode === 'upload' && (
              <div className="bg-white rounded-xl shadow-md p-6 space-y-5">
                <h2 className="text-lg font-bold text-gray-900 border-b pb-3">Bulk Upload Medications</h2>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-700 space-y-2">
                  <p className="font-semibold">📋 Supported file formats:</p>
                  <ul className="list-disc pl-5 space-y-1 text-xs">
                    <li><strong>Excel (.xlsx, .xls)</strong> — Spreadsheet with columns: Name, Category, Dosage, Price, Quantity, Requires Prescription (Yes/No)</li>
                    <li><strong>PDF</strong> — Rwanda FDA formatted medicine register export</li>
                  </ul>
                  <p className="text-xs text-blue-600 mt-2">💡 Categories must match Rwanda FDA Medicine Register categories for correct classification.</p>
                </div>

                {/* Download Template */}
                <div className="border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-sm text-gray-800">Download Excel Template</p>
                    <p className="text-xs text-gray-500">Use our template to ensure correct formatting</p>
                  </div>
                  <a href="/templates/medication-upload-template.xlsx" download
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium flex items-center gap-2">
                    <DocumentArrowUpIcon className="w-4 h-4" /> Download
                  </a>
                </div>

                {/* Upload Zone */}
                <div
                  className={`border-2 border-dashed rounded-xl p-10 text-center transition-all ${uploadFile ? 'border-teal-400 bg-teal-50' : 'border-gray-300 hover:border-teal-400 hover:bg-gray-50'}`}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => {
                    e.preventDefault();
                    const file = e.dataTransfer.files[0];
                    if (file) {
                      const ext = file.name.split('.').pop()?.toLowerCase();
                      if (!['pdf','xlsx','xls'].includes(ext || '')) {
                        toast.error('Only PDF and Excel files are supported'); return;
                      }
                      setUploadFile(file);
                    }
                  }}>
                  {uploadFile ? (
                    <div>
                      <div className="text-4xl mb-3">📄</div>
                      <p className="font-semibold text-gray-800">{uploadFile.name}</p>
                      <p className="text-sm text-gray-500">{(uploadFile.size / 1024).toFixed(1)} KB</p>
                      <button onClick={() => setUploadFile(null)} className="mt-3 text-red-500 text-sm hover:underline">Remove</button>
                    </div>
                  ) : (
                    <div>
                      <div className="text-5xl mb-3">☁️</div>
                      <p className="font-semibold text-gray-700 mb-1">Drag & drop your file here</p>
                      <p className="text-sm text-gray-500 mb-4">or click to browse</p>
                      <label className="px-5 py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-lg text-sm font-medium cursor-pointer">
                        Browse File
                        <input type="file" accept=".pdf,.xlsx,.xls" onChange={handleFileChange} className="hidden" />
                      </label>
                      <p className="text-xs text-gray-400 mt-3">Accepted: PDF, Excel (.xlsx, .xls) — Max 10MB</p>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3">
                  <button onClick={() => router.back()}
                    className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-50">
                    Cancel
                  </button>
                  <button onClick={handleFileUpload} disabled={!uploadFile || loading}
                    className="px-6 py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-medium text-sm disabled:opacity-50 flex items-center gap-2">
                    {loading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/> Uploading...</> : <><ArrowUpTrayIcon className="w-4 h-4"/> Upload & Import</>}
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}