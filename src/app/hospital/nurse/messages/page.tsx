'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
    PaperAirplaneIcon,
    MagnifyingGlassIcon,
    ChatBubbleLeftRightIcon,
    ChatBubbleOvalLeftEllipsisIcon,
    ClockIcon
} from '@heroicons/react/24/outline';
import { MOCK_CONVERSATIONS } from '@/mock/hospital/messages';
import { Conversation, Message } from '@/types/hospital';

const NAVY = '#1E3A5F';
const TEAL = '#38BDF8';

const formatTime = (ts: string) => {
    const d = new Date(ts);
    return isNaN(d.getTime())
        ? ts
        : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export default function NurseMessagesPage() {
    const { t } = useTranslation();
    const [conversations, setConversations] = useState<Conversation[]>(MOCK_CONVERSATIONS);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [inputText, setInputText] = useState('');
    const [search, setSearch] = useState('');

    const activeConversation = conversations.find(c => c.id === activeId) || null;
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const filteredConversations = conversations.filter(c =>
        c.senderName.toLowerCase().includes(search.toLowerCase()) ||
        c.role.toLowerCase().includes(search.toLowerCase())
    );

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [activeConversation?.messages]);

    const handleSendMessage = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!inputText.trim() || !activeId) return;

        const newMessage: Message = {
            id: Date.now().toString(),
            text: inputText,
            direction: 'SENT',
            timestamp: new Date().toISOString()
        };

        setConversations(prev => prev.map(c => {
            if (c.id === activeId) {
                return {
                    ...c,
                    messages: [...c.messages, newMessage],
                    lastMessage: inputText,
                    timestamp: new Date().toISOString()
                };
            }
            return c;
        }));

        setInputText('');
    };

    return (
        <div className="max-w-7xl mx-auto h-[calc(100vh-112px)] flex flex-col gap-4">
            {/* ── Page Hero ── */}
            <div
                className="rounded-2xl px-6 sm:px-10 py-8 sm:py-10 flex items-center justify-between shrink-0"
                style={{ background: '#EBF5FF' }}
            >
                <div>
                    <h1 className="text-3xl sm:text-4xl font-bold" style={{ color: NAVY }}>
                        {t('hospital.messages')}
                    </h1>
                    <p className="mt-2 text-sm sm:text-base" style={{ color: '#0284C7' }}>
                        {t('hospital.messagesSubtitle')}
                    </p>
                </div>
                <div className="opacity-20 shrink-0" style={{ color: NAVY }}>
                    <ChatBubbleLeftRightIcon className="w-16 h-16 sm:w-20 sm:h-20" />
                </div>
            </div>

            <div className="flex-1 flex gap-6 overflow-hidden min-h-0">
                {/* ── Left Panel: Conversation List ── */}
                <div className="w-80 lg:w-96 bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
                    <div className="p-5 border-b border-gray-100 bg-gray-50/50">
                        <div className="relative">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder={t('hospital.searchConversations')}
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {filteredConversations.length === 0 ? (
                            <div className="p-8 text-center text-sm text-gray-400">
                                {t('hospital.noConversations')}
                            </div>
                        ) : (
                            <ul className="divide-y divide-gray-50">
                                {filteredConversations.map((conv) => (
                                    <li
                                        key={conv.id}
                                        onClick={() => setActiveId(conv.id)}
                                        className={`p-4 cursor-pointer transition-all hover:bg-gray-50 group ${activeId === conv.id ? 'bg-gray-100' : ''
                                            }`}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-700 font-bold text-lg shadow-inner shrink-0 group-hover:scale-105 transition-transform">
                                                {conv.initials}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-center mb-0.5">
                                                    <h3 className="text-sm font-bold text-gray-900 truncate">{conv.senderName}</h3>
                                                    <span className="text-[10px] font-medium text-gray-400">{formatTime(conv.timestamp)}</span>
                                                </div>
                                                <p className="text-xs font-semibold text-blue-600 mb-1">{conv.role}</p>
                                                <p className="text-xs text-gray-500 truncate">{conv.lastMessage}</p>
                                            </div>
                                            {(conv.unreadCount ?? 0) > 0 && (
                                                <div className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-bold">
                                                    {conv.unreadCount}
                                                </div>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                {/* ── Right Panel: Message Thread ── */}
                <div className="flex-1 bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
                    {!activeConversation ? (
                        /* Empty state — no conversation selected yet */
                        <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
                            <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mb-5">
                                <ChatBubbleOvalLeftEllipsisIcon className="w-10 h-10 text-blue-300" />
                            </div>
                            <h2 className="text-lg font-bold text-gray-900">{t('hospital.yourMessages')}</h2>
                            <p className="text-sm text-gray-500 mt-1 max-w-xs">
                                {t('hospital.searchMessages')}
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Header */}
                            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold">
                                        {activeConversation.initials}
                                    </div>
                                    <div>
                                        <h2 className="text-base font-bold text-gray-900">{activeConversation.senderName}</h2>
                                        <p className="text-xs font-medium text-gray-500">{activeConversation.role}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                    <span className="text-xs font-medium text-gray-400">{t('hospital.online')}</span>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/30">
                                {activeConversation.messages.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center gap-2">
                                        <ChatBubbleLeftRightIcon className="w-12 h-12 text-gray-200" />
                                        <p className="text-sm font-semibold text-gray-500">{t('hospital.noConversations')}</p>
                                        <p className="text-xs text-gray-400">{t('hospital.sendMessages')}</p>
                                    </div>
                                ) : (
                                    <>
                                        {activeConversation.messages.map((msg) => (
                                            <div
                                                key={msg.id}
                                                className={`flex ${msg.direction === 'SENT' ? 'justify-end' : 'justify-start'}`}
                                            >
                                                <div className={`max-w-[70%] group flex flex-col ${msg.direction === 'SENT' ? 'items-end' : 'items-start'}`}>
                                                    <div
                                                        className={`px-5 py-3 rounded-2xl shadow-sm text-sm leading-relaxed ${msg.direction === 'SENT'
                                                            ? 'bg-blue-600 text-white rounded-tr-none'
                                                            : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                                                            }`}
                                                    >
                                                        {msg.text}
                                                    </div>
                                                    <div className="flex items-center gap-1 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <ClockIcon className="w-3 h-3 text-gray-400" />
                                                        <span className="text-[10px] font-medium text-gray-400">{formatTime(msg.timestamp)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        <div ref={messagesEndRef} />
                                    </>
                                )}
                            </div>

                            {/* Input */}
                            <div className="p-4 border-t border-gray-100">
                                <form
                                    onSubmit={handleSendMessage}
                                    className="flex items-center gap-3 bg-gray-50 p-2 rounded-2xl border border-gray-200 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500/50 transition-all"
                                >
                                    <input
                                        value={inputText}
                                        onChange={(e) => setInputText(e.target.value)}
                                        placeholder={t('hospital.typeMessage')}
                                        className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 px-4 placeholder:text-gray-400 text-gray-700 font-medium"
                                    />
                                    <button
                                        type="submit"
                                        className="p-3 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50"
                                        disabled={!inputText.trim()}
                                    >
                                        <PaperAirplaneIcon className="w-5 h-5 -rotate-45 -translate-y-0.5 translate-x-0.5" />
                                    </button>
                                </form>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
