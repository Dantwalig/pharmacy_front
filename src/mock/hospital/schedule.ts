// src/mock/hospital/schedule.ts
import { ScheduleEntry } from '@/types/hospital';

export const MOCK_SCHEDULE: ScheduleEntry[] = [
    { id: '1', patientName: 'Kevine Mugisha', time: '08:00 AM', date: '2026-06-02', color: 'blue', type: 'PEDIATRICS CHECKUP' },
    { id: '2', patientName: 'Jean Paul Nsengimana', time: '10:00 AM', date: '2026-06-02', color: 'green', type: 'GENERAL CONSULT' },
    { id: '3', patientName: 'Angelique Umutoni', time: '11:00 AM', date: '2026-06-02', color: 'orange', type: 'GYNECOLOGY REVIEW' },
    { id: '4', patientName: 'Maurice Kwizera', time: '02:00 PM', date: '2026-06-02', color: 'blue', type: 'ORTHOPEDICS FOLLOW-UP' },

    { id: '5', patientName: 'Alice Mukamana', time: '09:00 AM', date: '2026-06-03', color: 'purple', type: 'DENTAL CLEANING' },
    { id: '6', patientName: 'Jean de Dieu', time: '11:30 AM', date: '2026-06-03', color: 'blue', type: 'CARDIOLOGY EXAM' },
    { id: '7', patientName: 'Marie Claire', time: '03:00 PM', date: '2026-06-03', color: 'green', type: 'PRENATAL CARE' },

    { id: '8', patientName: 'Samuel Nkurunziza', time: '08:30 AM', date: '2026-06-04', color: 'orange', type: 'EYE EXAMINATION' },
    { id: '9', patientName: 'Grace Uwase', time: '10:15 AM', date: '2026-06-04', color: 'blue', type: 'PHYSIOTHERAPY' },
    { id: '10', patientName: 'Emmanuel Hakizimana', time: '01:00 PM', date: '2026-06-04', color: 'purple', type: 'DERMATOLOGY' },
    { id: '11', patientName: 'Sonia Umutoniwase', time: '04:00 PM', date: '2026-06-04', color: 'red', type: 'EMERGENCY FOLLOW-UP' },

    { id: '12', patientName: 'Fabrice Munyaneza', time: '09:00 AM', date: '2026-06-05', color: 'green', type: 'ROUTINE CHECKUP' },
    { id: '13', patientName: 'Diane Uwineza', time: '11:00 AM', date: '2026-06-05', color: 'orange', type: 'VACCINATION' },
    { id: '14', patientName: 'Pierre Kayitaba', time: '02:30 PM', date: '2026-06-05', color: 'blue', type: 'LAB RESULTS REVIEW' },

    { id: '15', patientName: 'Oliver Twist', time: '08:00 AM', date: '2026-06-06', color: 'purple', type: 'SURGERY CONSULT' },
    { id: '16', patientName: 'Jane Doe', time: '10:00 AM', date: '2026-06-06', color: 'green', type: 'GENERAL CHECKUP' },
    { id: '17', patientName: 'John Smith', time: '12:00 PM', date: '2026-06-06', color: 'orange', type: 'MENS HEALTH' },
    { id: '18', patientName: 'Sarah Connor', time: '03:00 PM', date: '2026-06-06', color: 'red', type: 'URGENT CARE' },
];
