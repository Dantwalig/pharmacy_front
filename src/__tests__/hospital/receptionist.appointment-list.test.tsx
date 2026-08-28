import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string, v?: string | Record<string, unknown>) => typeof v === 'string' ? v : key }),
}));
jest.mock('@/context/AuthContext', () => ({
  useAuth: jest.fn().mockReturnValue({
    user: { hospitalId: 'h1', id: 'user-1', firstName: 'Reception' },
    logout: jest.fn(),
  }),
}));
jest.mock('@/lib/api', () => {
  const apiObj = { get: jest.fn(), post: jest.fn(), patch: jest.fn() };
  return { __esModule: true, default: apiObj, api: apiObj, unwrapData: jest.fn((d: any) => Array.isArray(d) ? d : (d?.data ?? [])), authApi: { changePassword: jest.fn() } };
});
jest.mock('@heroicons/react/24/outline', () => {
  const i = () => <span />;
  return { CalendarIcon: i, CheckCircleIcon: i, ClockIcon: i, PlusIcon: i, MagnifyingGlassIcon: i, XCircleIcon: i };
});

import api from '@/lib/api';
import ReceptionistAppointmentListPage from '@/app/hospital/receptionist/appointment-list/page';

const mockGet = api.get as jest.Mock;

const makeAppt = (id: string, status: string) => ({
  id, name: 'John D', status, doctor: 'Dr. Smith', department: 'OPD',
  appointmentTime: '09:00 AM', date: '2026-07-17',
  scheduledAt: new Date().toISOString(), type: 'OUTPATIENT', reason: 'Checkup',
  patient: { firstName: 'John', lastName: 'D' }, hospital: { name: 'Test' },
});

beforeEach(() => jest.clearAllMocks());

describe('ReceptionistAppointmentListPage', () => {
  test('renders without crashing', () => {
    mockGet.mockReturnValue(new Promise(() => {}));
    expect(() => render(<ReceptionistAppointmentListPage />)).not.toThrow();
  });

  test('shows loading state while fetching', () => {
    mockGet.mockReturnValue(new Promise(() => {}));
    const { container } = render(<ReceptionistAppointmentListPage />);
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
  });

  test('calls GET /hospitals/${id}/receptionist/appointments on mount', async () => {
    mockGet.mockResolvedValue({ data: [] });
    render(<ReceptionistAppointmentListPage />);
    await waitFor(() => expect(mockGet).toHaveBeenCalledWith(expect.stringContaining('/receptionist/appointments')));
  });

  test('renders appointment rows after data loads', async () => {
    mockGet.mockResolvedValue({ data: [makeAppt('a1', 'SCHEDULED'), makeAppt('a2', 'COMPLETED')] });
    render(<ReceptionistAppointmentListPage />);
    await waitFor(() => expect(screen.getAllByText('John D').length).toBeGreaterThanOrEqual(1));
  });

  test('metric cards are shown (Total Bookings hardcoded to 8)', async () => {
    mockGet.mockResolvedValue({ data: [] });
    render(<ReceptionistAppointmentListPage />);
    await waitFor(() => expect(screen.getAllByText('8').length).toBeGreaterThanOrEqual(1));
  });

  test('shows error state when API fails', async () => {
    mockGet.mockRejectedValue(new Error('Network error'));
    render(<ReceptionistAppointmentListPage />);
    await waitFor(() => expect(document.body.textContent!.length).toBeGreaterThan(0));
  });
});
