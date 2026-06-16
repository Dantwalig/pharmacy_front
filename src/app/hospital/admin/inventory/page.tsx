'use client';

import React, { useState } from 'react';
import {
  Search,
  Hexagon,
  AlertTriangle,
  ClipboardList,
  Download,
} from 'lucide-react';
import { MOCK_INVENTORY, InventoryItem } from '@/mock/hospital/inventory';

export default function HospitalAdminInventoryPage() {
  const [activeTab, setActiveTab] = useState<'All Items' | 'Drugs / Meds' | 'Supplies' | 'Equipment'>('All Items');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredInventory = MOCK_INVENTORY.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    if (activeTab === 'All Items') return matchesSearch;
    if (activeTab === 'Drugs / Meds') return matchesSearch && item.category === 'Drug';
    if (activeTab === 'Supplies') return matchesSearch && item.category === 'Supply';
    if (activeTab === 'Equipment') return matchesSearch && item.category === 'Equipment';
    return matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'LOW_STOCK':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FFF1F2] text-[#E11D48] uppercase border border-[#FEE2E2]">
            <span className="w-1 h-1 rounded-full bg-[#E11D48] mr-1" />
            Low Stock
          </span>
        );
      case 'IN_STOCK':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#F0FDF4] text-[#16A34A] uppercase border border-[#DCFCE7]">
            <span className="w-1 h-1 rounded-full bg-[#16A34A] mr-1" />
            In Stock
          </span>
        );
      case 'OUT_OF_STOCK':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-800 uppercase border border-gray-200">
            <span className="w-1 h-1 rounded-full bg-gray-800 mr-1" />
            Out of Stock
          </span>
        );
      default:
        return null;
    }
  };

  const getSafetyBadge = (item: InventoryItem) => {
    switch (item.safetyStatus) {
      case 'SAFE':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#F0FDF4] text-[#16A34A] uppercase border border-[#DCFCE7]">
            Safe
          </span>
        );
      case 'EXPIRED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FEF2F2] text-[#991B1B] uppercase border border-[#FEE2E2]">
            Expired
          </span>
        );
      case 'EXPIRING':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FFFBEB] text-[#92400E] uppercase border border-[#FEF3C7]">
            Expiring ({item.expiringInDays}d)
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 bg-[#F8FAFC] min-h-screen">
      {/* Header Section */}
      <div className="rounded-3xl p-8 bg-[#EBF5FF] border border-[#D1E9FF] relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-[#1E3A5F]">Inventory Control & Supply Chain</h1>
          <p className="mt-2 text-[#4A89BF] font-medium max-w-2xl">
            Track and manage hospital stock levels, alerts, and procurement requests
          </p>
        </div>
        {/* Subtle background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#D1E9FF] opacity-20 rounded-full -mr-20 -mt-20 blur-3xl" />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] hover:shadow-lg transition-all group flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 mb-4 group-hover:scale-110 transition-transform">
            <Hexagon size={28} />
          </div>
          <h3 className="text-lg font-bold text-[#1E3A5F] mb-2">Hospital Stock</h3>
          <p className="text-sm text-[#64748B] leading-relaxed">
            Track current drug supplies, equipment, and medical inventory levels.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] hover:shadow-lg transition-all group flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-xl bg-red-50 flex items-center justify-center text-red-600 mb-4 group-hover:scale-110 transition-transform">
            <AlertTriangle size={28} />
          </div>
          <h3 className="text-lg font-bold text-[#1E3A5F] mb-2">Alerts Queue</h3>
          <p className="text-sm text-[#64748B] leading-relaxed">
            Instantly find expired, expiring, or critical low-stock items.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] hover:shadow-lg transition-all group flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-4 group-hover:scale-110 transition-transform">
            <ClipboardList size={28} />
          </div>
          <h3 className="text-lg font-bold text-[#1E3A5F] mb-2">Procurement Log</h3>
          <p className="text-sm text-[#64748B] leading-relaxed">
            Submit and review procurement requests, tracking approval & delivery stages.
          </p>
        </div>
      </div>

      {/* Filters & Actions */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex bg-white p-1.5 rounded-xl border border-gray-100 shadow-sm overflow-x-auto w-full md:w-auto">
          {['All Items', 'Drugs / Meds', 'Supplies', 'Equipment'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${activeTab === tab
                  ? 'bg-[#0070F3] text-white shadow-md'
                  : 'text-[#64748B] hover:bg-gray-50'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search stock inventory..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0070F3] focus:border-transparent transition-all"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-[#1E3A5F] hover:bg-gray-50 transition-all shadow-sm">
            <Download size={18} />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="px-6 py-4 text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Item Name</th>
                <th className="px-6 py-4 text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Available Quantity</th>
                <th className="px-6 py-4 text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Min. Reorder Limit</th>
                <th className="px-6 py-4 text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Expiry Date</th>
                <th className="px-6 py-4 text-[11px] font-bold text-[#64748B] uppercase tracking-wider text-center">Status / Alerts</th>
                <th className="px-6 py-4 text-[11px] font-bold text-[#64748B] uppercase tracking-wider text-right">Quick Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredInventory.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-5">
                    <span className="font-bold text-[#1E3A5F] group-hover:text-[#0070F3] transition-colors">{item.name}</span>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-sm font-medium text-[#64748B]">{item.category}</span>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-sm font-bold text-[#1E3A5F]">{item.availableQuantity} {item.unit}</span>
                  </td>
                  <td className="px-6 py-5 text-sm text-[#64748B]">
                    {item.reorderLimit} units
                  </td>
                  <td className="px-6 py-5 text-sm text-[#64748B]">
                    {item.expiryDate || '—'}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-center gap-2 flex-wrap max-w-[200px] mx-auto">
                      {getStatusBadge(item.status)}
                      {getSafetyBadge(item)}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button className="px-4 py-2 bg-gray-100 text-[#1E3A5F] rounded-lg text-xs font-bold hover:bg-gray-200 transition-all whitespace-nowrap">
                      Request Stock
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredInventory.length === 0 && (
          <div className="p-12 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-gray-100 rounded-full text-gray-400">
                <Search size={32} />
              </div>
            </div>
            <h4 className="text-lg font-bold text-[#1E3A5F]">No matching items</h4>
            <p className="text-[#64748B]">Try adjusting your search or filters to find what you're looking for.</p>
          </div>
        )}
      </div>
    </div>
  );
}
