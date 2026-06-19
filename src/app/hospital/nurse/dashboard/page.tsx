'use client';

import React from 'react';
import {
    Calendar,
    Users,
    ClipboardList,
    MessageSquare,
    ChevronRight,
    TrendingUp,
} from 'lucide-react';
import Image from 'next/image';

export default function NurseDashboard() {
    const patientOverview = [
        { id: '101', name: 'John D.', gender: 'Male', age: 28, status: 'Stable', statusColor: 'text-green-500', bp: '128/78', hr: 72, temp: '98.6°F' },
        { id: '102', name: 'Mary S.', gender: 'Female', age: 54, status: 'Stable', statusColor: 'text-green-500', bp: '118/72', hr: 80, temp: '99.1°F' },
        { id: '103', name: 'Robert T.', gender: 'Male', age: 39, status: 'High Risk', statusColor: 'text-red-500', bp: '142/88', hr: 98, temp: '97.8°F' },
        { id: '104', name: 'Linda K.', gender: 'Female', age: 62, status: 'Stable', statusColor: 'text-green-500', bp: '124/75', hr: 104, temp: '100.2°F' },
    ];

    const schedule = [
        { time: '07:00 AM', title: 'Shift Start/Report', subtitle: 'Medical Surgery Unit', status: 'Completed' },
        { time: '08:00 AM', title: 'Medication Pass', subtitle: 'Room 101-110', status: 'Upcoming' },
        { time: '09:00 AM', title: 'Rounds', subtitle: 'Medical Surgery Unit', status: 'Upcoming' },
        { time: '12:00 PM', title: 'Lunch Break', subtitle: '30 min', status: 'Upcoming' },
    ];

    return (
        <div className="p-6 lg:p-8 space-y-8 bg-[#F8FAFC]">
            {/* Welcome Banner */}
            <div className="bg-[#EFF6FF] rounded-[40px] p-10 flex flex-col md:flex-row items-center justify-between relative overflow-hidden group">
                <div className="space-y-6 relative z-10">
                    <h1 className="text-4xl md:text-5xl font-black text-[#1E3A5F]">Good Evening Nurse</h1>
                    <p className="text-[#38BDF8] text-lg font-bold">Check what's on your agenda today</p>
                    <button className="bg-[#38BDF8] text-white px-8 py-4 rounded-2xl font-black flex items-center gap-3 shadow-lg hover:bg-[#0EA5E9] transition-all transform hover:-translate-y-1">
                        <Calendar className="w-6 h-6" />
                        Today
                    </button>
                </div>
                <div className="mt-8 md:mt-0 relative z-10">
                    <div className="w-48 h-48 bg-white/50 backdrop-blur-sm rounded-full flex items-center justify-center relative shadow-inner">
                        {/* Simple symbolic illustration placeholder */}
                        <div className="w-32 h-32 bg-[#38BDF8]/20 rounded-full flex items-center justify-center">
                            <Users className="w-16 h-16 text-[#38BDF8]" />
                        </div>
                    </div>
                </div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/20 rounded-full -mr-48 -mt-48 blur-3xl" />
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <div className="bg-white p-10 rounded-[32px] border border-[#E2E8F0] shadow-sm hover:shadow-xl transition-all group">
                    <div className="flex justify-between items-start mb-4">
                        <Users className="w-8 h-8 text-[#38BDF8]" />
                        <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[#38BDF8] transition-colors" />
                    </div>
                    <p className="text-5xl font-black text-[#1E3A5F]">6</p>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-2">Total Patients</p>
                    <p className="text-xs font-bold text-[#38BDF8] mt-4 flex items-center justify-center gap-1 cursor-pointer">View Patients <ChevronRight className="w-3 h-3" /></p>
                </div>
                <div className="bg-white p-10 rounded-[32px] border border-[#E2E8F0] shadow-sm hover:shadow-xl transition-all group">
                    <div className="flex justify-between items-start mb-4">
                        <ClipboardList className="w-8 h-8 text-orange-400" />
                        <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-orange-400 transition-colors" />
                    </div>
                    <p className="text-5xl font-black text-[#1E3A5F]">8</p>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-2">Pending Tasks</p>
                    <p className="text-xs font-bold text-orange-400 mt-4 flex items-center justify-center gap-1 cursor-pointer">View Nursing notes <ChevronRight className="w-3 h-3" /></p>
                </div>
                <div className="bg-white p-10 rounded-[32px] border border-[#E2E8F0] shadow-sm hover:shadow-xl transition-all group">
                    <div className="flex justify-between items-start mb-4">
                        <MessageSquare className="w-8 h-8 text-purple-500" />
                        <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-purple-500 transition-colors" />
                    </div>
                    <p className="text-5xl font-black text-[#1E3A5F]">2</p>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-2">Unread Messages</p>
                    <p className="text-xs font-bold text-purple-400 mt-4 flex items-center justify-center gap-1 cursor-pointer">View Messages <ChevronRight className="w-3 h-3" /></p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Patient Overview */}
                <div className="bg-white rounded-[32px] border border-[#E2E8F0] shadow-sm p-8 space-y-8">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                                <Users className="w-5 h-5 text-[#38BDF8]" />
                            </div>
                            <h3 className="text-xl font-black text-[#1E3A5F]">Patient Overview</h3>
                        </div>
                        <button className="text-[#38BDF8] text-xs font-bold hover:underline">View all</button>
                    </div>

                    <div className="space-y-4">
                        {patientOverview.map((p) => (
                            <div key={p.id} className="flex items-center justify-between p-4 bg-[#F8FAFC] rounded-2xl border border-transparent hover:border-[#E2E8F0] hover:bg-white hover:shadow-sm transition-all cursor-pointer group">
                                <div className="flex items-center gap-4">
                                    <span className="text-xs font-black text-gray-300 group-hover:text-[#38BDF8]">{p.id}</span>
                                    <div>
                                        <p className="text-sm font-black text-[#1E3A5F]">{p.name}</p>
                                        <p className="text-[10px] font-bold text-gray-400">{p.gender}, {p.age}</p>
                                    </div>
                                </div>
                                <span className={`text-[10px] font-black uppercase ${p.statusColor}`}>{p.status}</span>
                                <div className="hidden md:flex gap-6 text-center">
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase">BP</p>
                                        <p className="text-xs font-black text-[#1E3A5F]">{p.bp}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase">HR</p>
                                        <p className="text-xs font-black text-[#1E3A5F]">{p.hr}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase">Temp</p>
                                        <p className="text-xs font-black text-[#1E3A5F]">{p.temp}</p>
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[#1E3A5F]" />
                            </div>
                        ))}
                    </div>
                    <button className="w-full py-4 text-[#38BDF8] text-sm font-bold border-t border-gray-50 hover:bg-blue-50 transition-colors">View all Patients</button>
                </div>

                {/* Schedule */}
                <div className="bg-white rounded-[32px] border border-[#E2E8F0] shadow-sm p-8 space-y-8">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
                                <Calendar className="w-5 h-5 text-orange-400" />
                            </div>
                            <h3 className="text-xl font-black text-[#1E3A5F]">Today's Schedule</h3>
                        </div>
                        <button className="text-[#38BDF8] text-xs font-bold hover:underline">View full schedule</button>
                    </div>

                    <div className="space-y-6 relative before:absolute before:left-[41px] before:top-2 before:bottom-2 before:w-[2px] before:bg-[#E2E8F0]">
                        {schedule.map((item, idx) => (
                            <div key={idx} className="flex gap-10 relative">
                                <p className="text-xs font-bold text-[#1E3A5F] w-20 pt-1">{item.time}</p>
                                <div className={`w-3 h-3 rounded-full mt-2 z-10 border-2 bg-white ${item.status === 'Completed' ? 'border-green-500' : 'border-[#38BDF8]'}`} />
                                <div className="flex-1 p-5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex justify-between items-center group hover:bg-white hover:shadow-md transition-all">
                                    <div>
                                        <p className="text-sm font-black text-[#1E3A5F]">{item.title}</p>
                                        <p className="text-[10px] font-bold text-gray-400">{item.subtitle}</p>
                                    </div>
                                    <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase ${item.status === 'Completed' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-[#38BDF8]'}`}>
                                        {item.status} {item.status === 'Completed' && '✓'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
