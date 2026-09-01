/**
 * Tests: src/app/hospital/admin/dashboard/page.tsx
 */

import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, v?: string | Record<string, unknown>) => typeof v === 'string' ? v : key,
  }),
}));

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), patch: jest.fn() },
}));

// Stats shape must match what the page actually accesses (see page.tsx lines 70-114)
const HOOK_STATS = {
  totalAppointments: { thisMonth: 340, allTime: 1200 },
  activeDoctors: 15,
  totalDoctors: 20,
  monthlyRevenue: 1500000,
  totalRevenue: 5000000,
};

jest.mock('@/lib/hospital', () => ({
  useHospitalId: jest.fn().mockReturnValue('test-hospital-id-123'),
  useHospitalAdminUser: jest.fn().mockReturnValue({ userName: 'Admin User', hospitalName: 'Test Hospital' }),
  useHospitalDashboardStats: jest.fn().mockReturnValue({
    stats: {
      totalAppointments: { thisMonth: 340, allTime: 1200 },
      activeDoctors: 15,
      totalDoctors: 20,
      monthlyRevenue: 1500000,
      totalRevenue: 5000000,
    },
    weeklyRevenue: [{ label: 'Week 1', revenue: 300000 }],
    loading: false,
    error: null,
  }),
}));

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

jest.mock('@heroicons/react/24/outline', () => {
  const icon = () => <span />;
  return { CalendarIcon: icon, UsersIcon: icon, BanknotesIcon: icon, ExclamationTriangleIcon: icon };
});

jest.mock('recharts', () => ({
  LineChart: ({ children }: any) => <div>{children}</div>,
  BarChart: ({ children }: any) => <div>{children}</div>,
  Line: () => null, Bar: () => null, Pie: () => null, Cell: () => null,
  XAxis: () => null, YAxis: () => null, CartesianGrid: () => null,
  Tooltip: () => null, Legend: () => null,
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
}));

import api from '@/lib/api';

const mockGet = api.get as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  mockGet.mockResolvedValue({ data: [] });
});

describe('AdminDashboardPage', () => {
  test('renders page without crashing', async () => {
    const { default: AdminDashboardPage } = await import('@/app/hospital/admin/dashboard/page');
    await act(async () => { render(<AdminDashboardPage />); });
    expect(document.body).toBeTruthy();
  });

  test('renders admin greeting — heading includes first name from userName', async () => {
    const { default: AdminDashboardPage } = await import('@/app/hospital/admin/dashboard/page');
    await act(async () => { render(<AdminDashboardPage />); });
    // userName = 'Admin User' → firstName = 'Admin'
    const allAdminText = screen.getAllByText(/Admin/i);
    expect(allAdminText.length).toBeGreaterThan(0);
  });

  test('stat card shows 340 appointments this month after data loads', async () => {
    const { default: AdminDashboardPage } = await import('@/app/hospital/admin/dashboard/page');
    render(<AdminDashboardPage />);
    await waitFor(() => {
      expect(screen.getAllByText('340').length).toBeGreaterThanOrEqual(1);
    });
  });

  test('stat card shows 15 active doctors after data loads', async () => {
    const { default: AdminDashboardPage } = await import('@/app/hospital/admin/dashboard/page');
    render(<AdminDashboardPage />);
    await waitFor(() => {
      expect(screen.getAllByText('15').length).toBeGreaterThanOrEqual(1);
    });
  });

  test('page still renders hook stats when secondary API calls fail (drug-stock / daily-appts non-fatal)', async () => {
    mockGet.mockRejectedValue(new Error('secondary call failed'));
    const { default: AdminDashboardPage } = await import('@/app/hospital/admin/dashboard/page');
    render(<AdminDashboardPage />);
    // Stats come from hook (not api.get) — 340 appointments from hook should still appear
    await waitFor(() => {
      expect(screen.getAllByText('340').length).toBeGreaterThanOrEqual(1);
    });
  });
});
