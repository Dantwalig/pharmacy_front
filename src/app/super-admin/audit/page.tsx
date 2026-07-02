'use client';

import { useState } from 'react';
import AuditTable from '@/components/super-admin/AuditTable';

type TabCategory = 'ALL' | 'AUTH' | 'SYSTEM' | 'PHARMACY';

export default function AuditPage() {
    const [activeTab, setActiveTab] = useState<TabCategory>('ALL');

    const tabs: { id: TabCategory; label: string }[] = [
        { id: 'ALL', label: 'All Logs' },
        { id: 'AUTH', label: 'Auth Events' },
        { id: 'SYSTEM', label: 'System Logs' },
        { id: 'PHARMACY', label: 'Pharmacy Actions' },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Security & Audit</h1>
                <p className="text-sm text-gray-500 mt-1">
                    Monitor system activity, access logs, and critical security events in real-time.
                </p>
            </div>

            {/* Tabs Navigation */}
            <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`
                                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                                ${activeTab === tab.id
                                    ? 'border-brand-teal text-brand-teal'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                                }
                            `}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            <AuditTable category={activeTab} />
        </div>
    );
}
