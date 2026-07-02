'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { format } from 'date-fns';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';

interface AuditLog {
    id: string;
    actorEmail: string | null;
    actorRole: string | null;
    action: string;
    targetType: string;
    outcome: 'SUCCESS' | 'FAILURE';
    ip: string | null;
    createdAt: string;
    metadata: any;
}

interface AuditTableProps {
    category: 'ALL' | 'AUTH' | 'SYSTEM' | 'PHARMACY';
}

export default function AuditTable({ category }: AuditTableProps) {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [outcomeFilter, setOutcomeFilter] = useState('');

    useEffect(() => {
        fetchLogs();
    }, [outcomeFilter, category]);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            let url = `/audit/logs?limit=50`;

            if (outcomeFilter) url += `&outcome=${outcomeFilter}`;

            // Map our frontend tabs to backend targetTypes
            if (category === 'AUTH') url += `&targetType=User`;
            if (category === 'SYSTEM') url += `&targetType=System`;
            if (category === 'PHARMACY') url += `&targetType=Pharmacy`;

            const response = await api.get(url);
            setLogs(response.data.items || []);
        } catch (error) {
            console.error('Failed to fetch audit logs', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800">
                <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <ShieldCheckIcon className="w-5 h-5 text-brand-teal" />
                    {category === 'ALL' ? 'All Audit Logs' : `${category} Logs`}
                </h2>
                <select
                    value={outcomeFilter}
                    onChange={(e) => setOutcomeFilter(e.target.value)}
                    className="text-sm border-gray-200 rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-brand-teal"
                >
                    <option value="">All Outcomes</option>
                    <option value="SUCCESS">Success Only</option>
                    <option value="FAILURE">Failures Only</option>
                </select>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th className="px-4 py-3">Timestamp</th>
                            <th className="px-4 py-3">Actor</th>
                            <th className="px-4 py-3">Action</th>
                            <th className="px-4 py-3">Target</th>
                            <th className="px-4 py-3">Outcome</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">Loading logs...</td></tr>
                        ) : logs.length === 0 ? (
                            <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No logs found for this category</td></tr>
                        ) : logs.map((log) => (
                            <tr key={log.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <td className="px-4 py-3 whitespace-nowrap">{format(new Date(log.createdAt), 'MMM d, yyyy HH:mm:ss')}</td>
                                <td className="px-4 py-3">
                                    <div className="font-medium text-gray-900 dark:text-white">{log.actorEmail || 'System'}</div>
                                    <div className="text-xs text-gray-400">{log.actorRole || 'N/A'}</div>
                                </td>
                                <td className="px-4 py-3 font-mono text-xs">{log.action}</td>
                                <td className="px-4 py-3">{log.targetType}</td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${log.outcome === 'SUCCESS' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                        }`}>
                                        {log.outcome}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
