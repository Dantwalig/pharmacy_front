// src/mock/hospital/messages.ts
import { Conversation } from '@/types/hospital';

export const MOCK_CONVERSATIONS: Conversation[] = [
    {
        id: '1',
        senderName: 'Jean Paul Nsengimana',
        role: 'Patient',
        initials: 'JN',
        lastMessage: 'Thank you Dr. Samuel. See you in the morning.',
        timestamp: 'Yesterday',
        unreadCount: 0,
        messages: [
            { id: 'm1', text: 'Hello Doctor, I have been feeling a bit dizzy today.', direction: 'RECEIVED', timestamp: 'Yesterday, 10:00 AM' },
            { id: 'm2', text: 'Hello Jean Paul. Make sure to stay hydrated and rest.', direction: 'SENT', timestamp: 'Yesterday, 10:15 AM' },
            { id: 'm3', text: 'Thank you Dr. Samuel. See you in the morning.', direction: 'RECEIVED', timestamp: 'Yesterday, 10:30 AM' },
        ]
    },
    {
        id: '2',
        senderName: 'Alice Mukamana',
        role: 'Pharmacist',
        initials: 'AM',
        lastMessage: 'Understood. Should I reduce the dose from tomorrow?',
        timestamp: 'Today',
        unreadCount: 1,
        messages: [
            { id: 'm4', text: 'Doctor, regarding the prescription for patient 402...', direction: 'RECEIVED', timestamp: 'Today, 08:00 AM' },
            { id: 'm5', text: 'Yes, please proceed with the adjustment.', direction: 'SENT', timestamp: 'Today, 08:30 AM' },
            { id: 'm6', text: 'Understood. Should I reduce the dose from tomorrow?', direction: 'RECEIVED', timestamp: 'Today, 09:00 AM' },
        ]
    },
    {
        id: '3',
        senderName: 'Maurice Kwizera',
        role: 'Patient',
        initials: 'MK',
        lastMessage: 'Yes, Glad to hear that, Maurice. Let\'s keep monitoring.',
        timestamp: 'Yesterday',
        unreadCount: 0,
        messages: [
            { id: 'm7', text: 'The pain in my leg has subsided significantly.', direction: 'RECEIVED', timestamp: 'Yesterday, 02:00 PM' },
            { id: 'm8', text: 'Yes, Glad to hear that, Maurice. Let\'s keep monitoring.', direction: 'SENT', timestamp: 'Yesterday, 02:30 PM' },
        ]
    },
    {
        id: '4',
        senderName: 'Kevine Mugisha',
        role: 'Nurse',
        initials: 'KM',
        lastMessage: 'The patient in Room 4 is ready for consult.',
        timestamp: '2 hours ago',
        unreadCount: 0,
        messages: [
            { id: 'm9', text: 'The patient in Room 4 is ready for consult.', direction: 'RECEIVED', timestamp: '2 hours ago' },
        ]
    },
    {
        id: '5',
        senderName: 'Angelique Umutoni',
        role: 'Patient',
        initials: 'AU',
        lastMessage: 'I have uploaded my latest test results.',
        timestamp: '1 day ago',
        unreadCount: 0,
        messages: [
            { id: 'm10', text: 'I have uploaded my latest test results.', direction: 'RECEIVED', timestamp: '1 day ago' },
        ]
    }
];
