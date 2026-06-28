'use client';

import React, { useMemo, useState } from 'react';
import {
    Search,
    FileText,
    Clock,
    Users,
    AlertCircle,
    Calendar,
    Save,
    RotateCcw,
    ChevronDown,
} from 'lucide-react';
import { MOCK_PATIENTS } from '@/mock/hospital/consultations';
import { MOCK_NURSE } from '@/mock/hospital/user';
import type { NursingNote } from '@/types/hospital';

const NURSE_NAME = `${MOCK_NURSE.firstName} ${MOCK_NURSE.lastName}`;
const MOCK_TODAY = '2026-06-09';

const INITIAL_NOTES: NursingNote[] = [
    {
        id: 'note-001',
        patientName: MOCK_PATIENTS[3].name,
        nurseName: NURSE_NAME,
        date: MOCK_TODAY,
        time: '05:15 PM',
        observationNotes: 'Patient is alert and stable post-load, Vitals stable: BP 115/70, HR 82, Temp 36.7C.',
        careActivities: '',
        additionalComments: '',
    },
    {
        id: 'note-002',
        patientName: MOCK_PATIENTS[4].name,
        nurseName: NURSE_NAME,
        date: MOCK_TODAY,
        time: '04:30 PM',
        observationNotes: 'Patient complains of mild shoulder pain post-surgery but is stable. Client education reviewed for breath sounds.',
        careActivities: '',
        additionalComments: '',
    },
    {
        id: 'note-003',
        patientName: MOCK_PATIENTS[5].name,
        nurseName: NURSE_NAME,
        date: '2026-06-08',
        time: '10:15 AM',
        observationNotes: 'Post-operative Day 1 following laparoscopic cholecystectomy. Patient complains of pain around incision site.',
        careActivities: '',
        additionalComments: '',
    },
];

export default function NursingNotesPage() {
    const [notes, setNotes] = useState<NursingNote[]>(INITIAL_NOTES);
    const [search, setSearch] = useState('');
    const [patientFilter, setPatientFilter] = useState('');
    const [dateFilter, setDateFilter] = useState(MOCK_TODAY);

    const [selectedPatient, setSelectedPatient] = useState('');
    const [dateTime, setDateTime] = useState('06/09/2026 05:20 PM');
    const [observationNotes, setObservationNotes] = useState('');
    const [careActivities, setCareActivities] = useState('');
    const [additionalComments, setAdditionalComments] = useState('');

    const filteredNotes = useMemo(() => {
        const q = search.toLowerCase();
        return notes.filter((note) => {
            if (patientFilter && note.patientName !== patientFilter) return false;
            if (dateFilter && note.date !== dateFilter) return false;
            if (q && !note.patientName.toLowerCase().includes(q) && !note.observationNotes.toLowerCase().includes(q)) return false;
            return true;
        });
    }, [notes, search, patientFilter, dateFilter]);

    const stats = [
        { label: 'Notes Created Today', value: notes.filter((n) => n.date === MOCK_TODAY).length, icon: <FileText className="w-5 h-5 text-[#38BDF8]" />, bgColor: 'bg-[#F0F9FF]', borderColor: 'border-[#E0F2FE]' },
        { label: 'Recent Notes', value: notes.length, icon: <Clock className="w-5 h-5 text-purple-500" />, bgColor: 'bg-purple-50', borderColor: 'border-purple-100' },
        { label: 'Patients Monitored', value: new Set(notes.map((n) => n.patientName)).size, icon: <Users className="w-5 h-5 text-green-500" />, bgColor: 'bg-green-50', borderColor: 'border-green-100' },
        { label: 'Pending Documentation', value: 2, icon: <AlertCircle className="w-5 h-5 text-red-500" />, bgColor: 'bg-red-50', borderColor: 'border-red-100' },
    ];

    const resetForm = () => {
        setSelectedPatient('');
        setDateTime('06/09/2026 05:20 PM');
        setObservationNotes('');
        setCareActivities('');
        setAdditionalComments('');
    };

    const submitDocumentation = () => {
        if (!selectedPatient || !observationNotes) return;
        const [datePart, ...timeParts] = dateTime.split(' ');
        const newNote: NursingNote = {
            id: `note-${Date.now()}`,
            patientName: selectedPatient,
            nurseName: NURSE_NAME,
            date: datePart === '06/09/2026' ? MOCK_TODAY : datePart,
            time: timeParts.join(' ') || dateTime,
            observationNotes,
            careActivities,
            additionalComments,
        };
        setNotes((prev) => [newNote, ...prev]);
        resetForm();
    };

    return (
        <div className="p-6 lg:p-8 space-y-8 bg-[#F8FAFC]">
            {/* Header */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E2E8F0] shadow-sm relative overflow-hidden">
                <div className="relative z-10">
                    <h1 className="text-2xl sm:text-3xl font-bold text-[#1E3A5F]">Nursing Notes & Documentation</h1>
                    <p className="text-[#64748B] mt-2 max-w-2xl font-medium">
                        Document patient observations, care activities, and treatment outcomes during your shift.
                    </p>
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500 opacity-5 rounded-full -mr-20 -mt-20 blur-3xl" />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                {stats.map((stat, idx) => (
                    <div key={idx} className={`min-w-0 p-5 rounded-3xl bg-white border ${stat.borderColor} shadow-sm flex items-center gap-4`}>
                        <div className={`w-12 h-12 shrink-0 rounded-2xl ${stat.bgColor} flex items-center justify-center`}>
                            {stat.icon}
                        </div>
                        <div className="min-w-0">
                            <p className="text-2xl font-black text-[#1E3A5F]">{stat.value}</p>
                            <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-wide wrap-break-word">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column - History */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8] w-4 h-4" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search notes by patient or content..."
                            className="w-full pl-12 pr-4 py-3 bg-white border border-[#E2E8F0] rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#38BDF8] shadow-sm transition-all"
                        />
                    </div>

                    <div className="flex gap-4">
                        <div className="relative flex-1">
                            <select
                                value={patientFilter}
                                onChange={(e) => setPatientFilter(e.target.value)}
                                className="w-full pl-4 pr-10 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-xs font-bold text-[#1E3A5F] appearance-none cursor-pointer"
                            >
                                <option value="">All Patients</option>
                                {MOCK_PATIENTS.map((p) => (
                                    <option key={p.id} value={p.name}>{p.name}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] w-4 h-4 pointer-events-none" />
                        </div>
                        <div className="relative flex-1">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8] w-3.5 h-3.5 pointer-events-none" />
                            <input
                                type="date"
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value)}
                                className="w-full pl-8 pr-4 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-[10px] font-bold text-[#1E3A5F] focus:outline-none focus:ring-2 focus:ring-[#38BDF8]"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        {filteredNotes.length === 0 && (
                            <p className="py-8 text-center text-sm font-semibold text-[#94A3B8]">
                                No notes yet.
                            </p>
                        )}
                        {filteredNotes.map((note) => (
                            <div key={note.id} className="p-4 bg-white border border-[#E2E8F0] rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer group">
                                <div className="flex justify-between items-start gap-2 mb-2">
                                    <h4 className="text-sm font-black text-[#1E3A5F]">{note.patientName}</h4>
                                    <span className="shrink-0 text-[10px] font-bold text-[#94A3B8]">{note.time}</span>
                                </div>
                                <p className="text-[10px] text-[#64748B] mb-2">By {note.nurseName} • {note.date}</p>
                                <p className="text-xs text-[#475569] leading-relaxed line-clamp-3 group-hover:text-[#1E3A5F]">
                                    {note.observationNotes}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Column - Form */}
                <div className="lg:col-span-8">
                    <div className="bg-white rounded-3xl border border-[#E2E8F0] shadow-sm p-6 sm:p-8 space-y-8">
                        <h3 className="text-xl font-bold text-[#1E3A5F]">Create New Nursing Note</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-[#1E3A5F] uppercase tracking-wide ml-1">Patient Name *</label>
                                <div className="relative">
                                    <select
                                        value={selectedPatient}
                                        onChange={(e) => setSelectedPatient(e.target.value)}
                                        className="w-full pl-4 pr-10 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#38BDF8] appearance-none cursor-pointer"
                                    >
                                        <option value="">Select a patient...</option>
                                        {MOCK_PATIENTS.map((p) => (
                                            <option key={p.id} value={p.name}>{p.name}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] w-5 h-5 pointer-events-none" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-[#1E3A5F] uppercase tracking-wide ml-1">Date & Time *</label>
                                <div className="relative">
                                    <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94A3B8] w-5 h-5 pointer-events-none" />
                                    <input
                                        type="text"
                                        value={dateTime}
                                        onChange={(e) => setDateTime(e.target.value)}
                                        className="w-full px-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#38BDF8]"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-[#1E3A5F] uppercase tracking-wide ml-1">Observation Notes *</label>
                            <textarea
                                value={observationNotes}
                                onChange={(e) => setObservationNotes(e.target.value)}
                                placeholder="Enter objective assessments, patient symptoms, vitals, behavior notes..."
                                rows={4}
                                className="w-full p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#38BDF8] resize-none"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-[#1E3A5F] uppercase tracking-wide ml-1">Care Activities & Treatments</label>
                            <textarea
                                value={careActivities}
                                onChange={(e) => setCareActivities(e.target.value)}
                                placeholder="Enter care interventions, treatments performed, dressings / site checks..."
                                rows={3}
                                className="w-full p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#38BDF8] resize-none"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-[#1E3A5F] uppercase tracking-wide ml-1">Additional Comments / Plans</label>
                            <textarea
                                value={additionalComments}
                                onChange={(e) => setAdditionalComments(e.target.value)}
                                placeholder="Next steps, flags for upcoming shift, medication response..."
                                rows={2}
                                className="w-full p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#38BDF8] resize-none"
                            />
                        </div>

                        <div className="flex flex-wrap justify-end gap-4 pt-4 border-t border-[#F1F5F9]">
                            <button
                                onClick={resetForm}
                                className="px-8 py-3 bg-white border border-[#E2E8F0] text-[#64748B] text-sm font-bold rounded-xl hover:bg-gray-50 transition-all flex items-center gap-2"
                            >
                                <RotateCcw className="w-4 h-4" />
                                Reset Form
                            </button>
                            <button
                                onClick={submitDocumentation}
                                disabled={!selectedPatient || !observationNotes}
                                className="px-8 py-3 bg-[#38BDF8] text-white text-sm font-bold rounded-xl hover:bg-[#0EA5E9] transition-all shadow-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Save className="w-4 h-4" />
                                Submit Documentation
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
