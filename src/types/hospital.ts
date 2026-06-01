// src/types/hospital.ts

export type EntryColor = 'blue' | 'green' | 'orange' | 'purple' | 'red';

export interface ScheduleEntry {
    id: string;
    patientName: string;
    time: string;
    date: string; // ISO string or yyyy-MM-dd
    color: EntryColor;
    type?: string;
}

export interface Message {
    id: string;
    text: string;
    direction: 'SENT' | 'RECEIVED';
    timestamp: string;
}

export interface Conversation {
    id: string;
    senderName: string;
    role: string;
    initials: string;
    lastMessage: string;
    timestamp: string;
    unreadCount: number;
    messages: Message[];
}
