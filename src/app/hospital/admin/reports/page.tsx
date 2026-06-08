'use client';

import React, { useState } from 'react';
import {
  FileText,
  Download,
  Filter,
  Calendar,
  Search,
  MoreVertical,
  ArrowUpRight,
  PieChart as PieIcon,
  BarChart3,
  TrendingUp,
  ChevronDown
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { MOCK_REPORTS, MOCK_CHART_DATA } from '@/mock/hospital/reports';

export default function HospitalAdminReportsPage() {
  const [reportType, setReportType] = useState('All Types');
  const [dateRange, setDateRange] = useState('Last 30 Days');

  return (
    <div className="p-6 md:p-8 space-y-8 bg-[#F8FAFC] min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#1E3A5F]">Reports & Analytics</h1>
          <p className="text-[#64748B] font-medium mt-1">Deep dive into hospital performance and trends</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-[#1E3A5F] hover:bg-gray-50 shadow-sm transition-all">
            <Calendar size={18} />
            <span>{dateRange}</span>
            <ChevronDown size={14} />
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-[#0070F3] text-white rounded-xl text-sm font-semibold hover:bg-[#0060df] shadow-md transition-all">
            <TrendingUp size={18} />
            <span>Generate New Report</span>
          </button>
        </div>
      </div>

      {/* Analytics Summaries */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Patients', value: '12,842', trend: '+12%', up: true, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Avg. Stay Duration', value: '4.2 Days', trend: '-5%', up: false, icon: BarChart3, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Inventory Value', value: '45.2M RWF', trend: '+2.4%', up: true, icon: FileText, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Claim Approval Rate', value: '94.2%', trend: '+0.8%', up: true, icon: PieIcon, color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-sm hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${stat.up ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                {stat.trend}
              </span>
            </div>
            <h4 className="text-sm font-bold text-[#64748B] mb-1">{stat.label}</h4>
            <p className="text-2xl font-black text-[#1E3A5F]">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-2xl border border-[#E2E8F0] shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-[#1E3A5F]">Patient Admission Trends</h3>
            <button className="text-[#0070F3] text-sm font-bold hover:underline flex items-center gap-1">
              View Detailed <ArrowUpRight size={14} />
            </button>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_CHART_DATA}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0070F3" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#0070F3" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748B', fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748B', fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Area type="monotone" dataKey="value" stroke="#0070F3" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-[#E2E8F0] shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-[#1E3A5F]">Stock Usage by Category</h3>
            <button className="text-[#0070F3] text-sm font-bold hover:underline flex items-center gap-1">
              View Detailed <ArrowUpRight size={14} />
            </button>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MOCK_CHART_DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748B', fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748B', fontSize: 12 }}
                />
                <Tooltip
                  cursor={{ fill: '#F8FAFC' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="value" fill="#0070F3" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Reports History */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="text-lg font-bold text-[#1E3A5F]">Recent Generated Reports</h3>
          <div className="flex gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search reports..."
                className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0070F3] transition-all"
              />
            </div>
            <button className="p-2 bg-white border border-gray-200 rounded-lg text-gray-400 hover:text-[#1E3A5F] transition-all">
              <Filter size={20} />
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Report Name</th>
                <th className="px-6 py-4 text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Generated By</th>
                <th className="px-6 py-4 text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-[11px] font-bold text-[#64748B] uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {MOCK_REPORTS.map((report) => (
                <tr key={report.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-red-50 text-red-600">
                        <FileText size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#1E3A5F]">{report.name}</p>
                        <p className="text-[11px] text-[#64748B] uppercase">{report.id} • {report.size}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-semibold text-[#64748B]">{report.type}</span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-[#1E3A5F]">{report.generatedBy}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-[#64748B]">{report.date}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${report.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600' :
                        report.status === 'PENDING' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'
                      }`}>
                      {report.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-gray-400 hover:text-[#0070F3] hover:bg-blue-50 rounded-lg transition-all">
                      <Download size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
