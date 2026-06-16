'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
    PaperAirplaneIcon,
    MagnifyingGlassIcon,
    ChatBubbleLeftRightIcon,
    ClockIcon
} from '@heroicons/react/24/outline';
import { MOCK_CONVERSATIONS } from '@/mock/hospital/messages';
import { Conversation, Message } from '@/types/hospital';

export default function DoctorMessagesPage() {
    const { t } = useTranslation();
    const [conversations, setConversations] = useState<Conversation[]>(MOCK_CONVERSATIONS);
    const [activeId, setActiveId] = useState<string>(MOCK_CONVERSATIONS[0].id);
    const [inputText, setInputText] = useState('');

    const activeConversation = conversations.find(c => c.id === activeId) || conversations[0];
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom of messages
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [activeConversation.messages]);

    const handleSendMessage = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!inputText.trim()) return;

        const newMessage: Message = {
            id: Date.now().toString(),
            text: inputText,
            direction: 'SENT',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', Today'
        };

        setConversations(prev => prev.map(c => {
            if (c.id === activeId) {
                return {
                    ...c,
                    messages: [...c.messages, newMessage],
                    lastMessage: inputText,
                    timestamp: 'Just now'
                };
            }
            return c;
        }));

        setInputText('');
    };

    return (
        <div className="max-w-7xl mx-auto p-4 lg:p-8 h-[calc(100vh-140px)] flex flex-col gap-6">
            {/* ── Page Hero ── */}
            <div
                className="relative rounded-3xl overflow-hidden px-8 py-10 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 shadow-sm shrink-0"
            >
                <div className="relative z-10">
                    <h1 className="text-3xl font-extrabold text-blue-900 tracking-tight">
                        {t('hospital.messages') || 'Doctor Messaging Hub'}
                    </h1>
                    <p className="text-blue-600/80 mt-1 text-base font-medium">
                        Communicate directly with patients, pharmacists, and medical staff in real-time.
                    </p>
                </div>
                <div className="absolute top-1/2 -right-6 -translate-y-1/2 opacity-5">
                    <ChatBubbleLeftRightIcon className="w-48 h-48 text-blue-600" />
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
                                placeholder="Search conversations..."
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        <ul className="divide-y divide-gray-50">
                            {conversations.map((conv) => (
                                <li
                                    key={conv.id}
                                    onClick={() => setActiveId(conv.id)}
                                    className={`p-4 cursor-pointer transition-all hover:bg-gray-50 group border-l-4 ${activeId === conv.id ? 'bg-blue-50/80 border-blue-600' : 'border-transparent'
                                        }`}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-700 font-bold text-lg shadow-inner shrink-0 group-hover:scale-105 transition-transform">
                                            {conv.initials}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-center mb-0.5">
                                                <h3 className="text-sm font-bold text-gray-900 truncate">{conv.senderName}</h3>
                                                <span className="text-[10px] font-medium text-gray-400">{conv.timestamp}</span>
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
                    </div>
                </div>

                {/* ── Right Panel: Message Thread ── */}
                <div className="flex-1 bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
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
                            <span className="text-xs font-medium text-gray-400">Online</span>
                        </div>
                    </div>

                    {/* Messages */}
                    <div
                        className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/30"
                    >
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
                                        <span className="text-[10px] font-medium text-gray-400">{msg.timestamp}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
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
                                placeholder="Type your message here..."
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
                </div>
            </div>
        </div>
    );
}
