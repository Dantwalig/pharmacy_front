import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string, v?: string | Record<string, unknown>) => typeof v === 'string' ? v : key }),
}));
jest.mock('@/lib/api', () => {
  const apiObj = { get: jest.fn(), post: jest.fn(), patch: jest.fn() };
  return { __esModule: true, default: apiObj, api: apiObj, unwrapData: jest.fn((d: any) => Array.isArray(d) ? d : (d?.data ?? [])), authApi: { changePassword: jest.fn() } };
});
jest.mock('next/link', () => ({ __esModule: true, default: ({ children, href }: any) => <a href={href}>{children}</a> }));
jest.mock('@heroicons/react/24/outline', () => {
  const i = () => <span />;
  return { CalendarIcon: i, CheckCircleIcon: i, XCircleIcon: i, ClockIcon: i, MagnifyingGlassIcon: i, FunnelIcon: i, ChevronLeftIcon: i, ChevronRightIcon: i, EllipsisVerticalIcon: i, ArrowPathIcon: i };
});

import api from '@/lib/api';
import DoctorAppointmentsPage from '@/app/hospital/doctor/appointments/page';

const mockGet = api.get as jest.Mock;

const makeAppt = (id: string, status: string) => ({
  id, status, scheduledAt: new Date().toISOString(), type: 'OUTPATIENT', reason: 'Checkup',
  patient: { firstName: 'Pat', lastName: 'Test' }, doctor: { firstName: 'Dr', lastName: 'S' },
  hospital: { name: 'Test' },
});

beforeEach(() => jest.clearAllMocks());

describe('DoctorAppointmentsPage', () => {
  test('renders without crashing', () => {
    mockGet.mockReturnValue(new Promise(() => {}));
    expect(() => render(<DoctorAppointmentsPage />)).not.toThrow();
  });

  test('shows loading skeleton while fetching', () => {
    mockGet.mockReturnValue(new Promise(() => {}));
    const { container } = render(<DoctorAppointmentsPage />);
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
  });

  test('calls GET /appointments on mount', async () => {
    mockGet.mockResolvedValue({ data: [] });
    render(<DoctorAppointmentsPage />);
    await waitFor(() => expect(mockGet).toHaveBeenCalledWith(expect.stringContaining('/appointments')));
  });

  test('renders appointment rows after data loads', async () => {
    mockGet.mockResolvedValue({ data: [makeAppt('a1', 'SCHEDULED'), makeAppt('a2', 'COMPLETED')] });
    render(<DoctorAppointmentsPage />);
    await waitFor(() => expect(screen.getAllByText('Pat Test').length).toBeGreaterThanOrEqual(1));
  });

  test('filter tab bar is visible with status tabs', async () => {
    mockGet.mockResolvedValue({ data: [] });
    render(<DoctorAppointmentsPage />);
    await waitFor(() => expect(screen.getByText('All')).toBeInTheDocument());
  });

  test('clicking Scheduled tab filters appointments', async () => {
    mockGet.mockResolvedValue({
      data: [makeAppt('a1', 'SCHEDULED'), makeAppt('a2', 'COMPLETED')],
    });
    render(<DoctorAppointmentsPage />);
    await waitFor(() => screen.getByText('Scheduled'));
    fireEvent.click(screen.getByText('Scheduled'));
    expect(screen.queryByText('COMPLETED')).not.toBeInTheDocument();
  });

  test('shows error state and Retry button when API fails', async () => {
    mockGet.mockRejectedValue(new Error('Network error'));
    render(<DoctorAppointmentsPage />);
    await waitFor(() => {
      expect(screen.getByText('Retry')).toBeInTheDocument();
    });
  });
});
