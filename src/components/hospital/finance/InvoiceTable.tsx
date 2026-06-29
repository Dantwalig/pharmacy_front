'use client';

import { useState, useMemo } from 'react';
import { MagnifyingGlassIcon, ArrowDownTrayIcon, EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import StatusBadge from '@/components/shared/StatusBadge';
import type { Invoice, InvoiceStatus } from '@/types/hospital';

interface InvoiceTableProps {
  invoices: Invoice[];
  onExport?: () => void;
}

const ALL_STATUSES: InvoiceStatus[] = ['PAID', 'UNPAID', 'INSURANCE_PENDING'];
const STATUS_LABELS: Record<InvoiceStatus, string> = {
  PAID: 'Paid',
  UNPAID: 'Unpaid',
  INSURANCE_PENDING: 'Insurance Pending',
};
const METHOD_OPTIONS = ['All Methods', 'Mobile Money', 'Cash', 'Card', 'Insurance'];

function fmtRWF(n: number) {
  return `RWF ${n.toLocaleString()}`;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function InvoiceTable({ invoices, onExport }: InvoiceTableProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | InvoiceStatus>('ALL');
  const [methodFilter, setMethodFilter] = useState('All Methods');

  const filtered = useMemo(() => {
    return invoices.filter((inv) => {
      const matchSearch = inv.patientName.toLowerCase().includes(search.toLowerCase()) ||
        inv.id.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'ALL' || inv.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [invoices, search, statusFilter, methodFilter]);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
      {/* Table header */}
      <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center gap-3">
        <h2 className="text-base font-semibold text-slate-900 shrink-0">Invoice Management</h2>
        <div className="flex flex-1 flex-wrap items-center gap-2 sm:justify-end">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search invoices..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl outline-none focus:border-brand-navy w-44"
            />
          </div>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="text-sm border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-brand-navy bg-white"
          >
            <option value="ALL">All Status</option>
            {ALL_STATUSES.map((s) => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </select>

          {/* Method filter */}
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="text-sm border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-brand-navy bg-white"
          >
            {METHOD_OPTIONS.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>

          {/* Export */}
          <button
            onClick={onExport}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <ArrowDownTrayIcon className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/60">
              {['Invoice ID', 'Patient', 'Amount', 'Method', 'Status', 'Due Date', ''].map((h) => (
                <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-slate-400 text-sm">
                  No invoices match your filters.
                </td>
              </tr>
            ) : (
              filtered.map((inv) => (
                <tr key={inv.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3.5 font-mono text-xs text-slate-500 whitespace-nowrap">
                    {inv.id.toUpperCase()}
                  </td>
                  <td className="px-5 py-3.5 font-medium text-slate-800 whitespace-nowrap">
                    {inv.patientName}
                  </td>
                  <td className="px-5 py-3.5 font-semibold text-slate-900 whitespace-nowrap">
                    {fmtRWF(inv.totalAmount)}
                  </td>
                  <td className="px-5 py-3.5 text-slate-600 whitespace-nowrap">
                    Mobile Money
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge
                      status={inv.status}
                      label={STATUS_LABELS[inv.status]}
                    />
                  </td>
                  <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap">
                    {fmtDate(inv.dueDate)}
                  </td>
                  <td className="px-5 py-3.5">
                    <button className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
                      <EllipsisVerticalIcon className="w-4 h-4 text-slate-400" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer count */}
      <div className="px-5 py-3 border-t border-gray-100">
        <p className="text-xs text-slate-400">
          Showing {filtered.length} of {invoices.length} invoices
        </p>
      </div>
    </div>
  );
}
