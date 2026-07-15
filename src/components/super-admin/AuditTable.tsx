'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
    createdAt: string | null;
    metadata: any;
}

interface AuditTableProps {
    category: 'ALL' | 'AUTH' | 'SYSTEM' | 'PHARMACY';
}

export default function AuditTable({ category }: AuditTableProps) {
    const { t } = useTranslation();
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [outcomeFilter, setOutcomeFilter] = useState('');

    useEffect(() => {
        fetchLogs();
    }, [outcomeFilter, category]);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            setError(null);
            let url = `/audit/logs?limit=50`;

            if (outcomeFilter) url += `&outcome=${outcomeFilter}`;

            if (category === 'AUTH') url += `&targetType=User`;
            if (category === 'SYSTEM') url += `&targetType=System`;
            if (category === 'PHARMACY') url += `&targetType=Pharmacy`;

            const response = await api.get(url);
            setLogs(response.data.items || []);
        } catch {
            setError(t('superAdmin.audit.table.errorBanner'));
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateStr: string | null) =>
        dateStr ? format(new Date(dateStr), 'MMM d, yyyy HH:mm:ss') : t('superAdmin.audit.na');

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            {error && (
                <div className="px-4 py-3 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
                    {error}
                </div>
            )}
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800">
                <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <ShieldCheckIcon className="w-5 h-5 text-brand-teal" />
                    {t('superAdmin.audit.title')}
                </h2>
                <select
                    value={outcomeFilter}
                    onChange={(e) => setOutcomeFilter(e.target.value)}
                    className="text-sm border-gray-200 rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-brand-teal"
                >
                    <option value="">{t('superAdmin.audit.filter.allOutcomes')}</option>
                    <option value="SUCCESS">{t('superAdmin.audit.filter.successOnly')}</option>
                    <option value="FAILURE">{t('superAdmin.audit.filter.failuresOnly')}</option>
                </select>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th className="px-4 py-3">{t('superAdmin.audit.table.timestamp')}</th>
                            <th className="px-4 py-3">{t('superAdmin.audit.table.actor')}</th>
                            <th className="px-4 py-3">{t('superAdmin.audit.table.action')}</th>
                            <th className="px-4 py-3">{t('superAdmin.audit.table.target')}</th>
                            <th className="px-4 py-3">{t('superAdmin.audit.table.outcome')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">{t('superAdmin.audit.table.loading')}</td></tr>
                        ) : logs.length === 0 ? (
                            <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">{t('superAdmin.audit.table.empty')}</td></tr>
                        ) : logs.map((log) => (
                            <tr key={log.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <td className="px-4 py-3 whitespace-nowrap">{formatDate(log.createdAt)}</td>
                                <td className="px-4 py-3">
                                    <div className="font-medium text-gray-900 dark:text-white">{log.actorEmail ?? t('superAdmin.audit.system')}</div>
                                    <div className="text-xs text-gray-400">{log.actorRole ?? t('superAdmin.audit.na')}</div>
                                </td>
                                <td className="px-4 py-3 font-mono text-xs">{log.action}</td>
                                <td className="px-4 py-3">{log.targetType}</td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${log.outcome === 'SUCCESS' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {log.outcome === 'SUCCESS' ? t('superAdmin.audit.outcome.success') : t('superAdmin.audit.outcome.failure')}
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
