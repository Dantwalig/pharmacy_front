import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string, v?: string | Record<string, unknown>) => typeof v === 'string' ? v : key }),
}));
jest.mock('@/lib/api', () => {
  const apiObj = { get: jest.fn(), post: jest.fn(), patch: jest.fn() };
  return { __esModule: true, default: apiObj, api: apiObj, unwrapData: jest.fn((d: any) => Array.isArray(d) ? d : (d?.data ?? [])), authApi: { changePassword: jest.fn() } };
});
jest.mock('@/lib/hospital', () => ({
  useHospitalId: jest.fn().mockReturnValue('h1'),
  useHospitalDoctorUser: jest.fn().mockReturnValue({ userName: 'Dr Jane Smith', hospitalName: 'Test Hospital' }),
  useHospitalDashboardStats: jest.fn().mockReturnValue({
    stats: { totalAppointments: { thisMonth: 12, allTime: 100 }, activeDoctors: 5, totalDoctors: 8, monthlyRevenue: 500000, totalRevenue: 2000000 },
    weeklyRevenue: [{ label: 'Week 1', revenue: 100000 }],
    loading: false, error: null,
  }),
}));
jest.mock('next/link', () => ({ __esModule: true, default: ({ children, href }: any) => <a href={href}>{children}</a> }));
jest.mock('@heroicons/react/24/outline', () => {
  const i = () => <span />;
  return { CalendarIcon: i, UsersIcon: i, UserPlusIcon: i, BanknotesIcon: i };
});

import api from '@/lib/api';
import { useHospitalId } from '@/lib/hospital';
import DoctorDashboardPage from '@/app/hospital/doctor/dashboard/page';

const mockGet = api.get as jest.Mock;

const makeAppt = (id: string) => ({
  id, status: 'SCHEDULED', scheduledAt: new Date().toISOString(), reason: 'Checkup',
  patient: { firstName: 'John', lastName: 'D' }, doctor: { firstName: 'Dr', lastName: 'S' },
  hospital: { name: 'Test' },
});

beforeEach(() => {
  jest.clearAllMocks();
  (useHospitalId as jest.Mock).mockReturnValue('h1');
});

describe('DoctorDashboardPage', () => {
  test('renders without crashing', () => {
    mockGet.mockReturnValue(new Promise(() => {}));
    expect(() => render(<DoctorDashboardPage />)).not.toThrow();
  });

  test('shows loading skeleton for appointments while fetching', () => {
    mockGet.mockReturnValue(new Promise(() => {}));
    const { container } = render(<DoctorDashboardPage />);
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
  });

  test('calls GET /appointments on mount', async () => {
    mockGet.mockResolvedValue({ data: [] });
    render(<DoctorDashboardPage />);
    await waitFor(() => expect(mockGet).toHaveBeenCalledWith(expect.stringContaining('/appointments')));
  });

  test('calls GET /notifications?userType=doctor on mount', async () => {
    mockGet.mockResolvedValue({ data: [] });
    render(<DoctorDashboardPage />);
    await waitFor(() => expect(mockGet).toHaveBeenCalledWith(expect.stringContaining('userType=doctor')));
  });

  test('renders greeting with doctor first name after load', async () => {
    mockGet.mockResolvedValue({ data: [] });
    render(<DoctorDashboardPage />);
    await waitFor(() => expect(screen.getAllByText(/Jane/i).length).toBeGreaterThan(0));
  });

  test('renders recent appointments table after data loads', async () => {
    mockGet
      .mockResolvedValueOnce({ data: [makeAppt('a1')] })
      .mockResolvedValue({ data: [] });
    render(<DoctorDashboardPage />);
    await waitFor(() => expect(screen.getAllByText('John D').length).toBeGreaterThanOrEqual(1));
  });
});
