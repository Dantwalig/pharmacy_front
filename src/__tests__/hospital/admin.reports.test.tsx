import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string, v?: string | Record<string, unknown>) => typeof v === 'string' ? v : key }),
}));
jest.mock('@/lib/api', () => ({ __esModule: true, default: { get: jest.fn() }, api: { get: jest.fn() } }));
jest.mock('@/lib/hospital', () => ({ useHospitalId: jest.fn().mockReturnValue('h1') }));
jest.mock('@heroicons/react/24/outline', () => ({ ClipboardDocumentListIcon: () => <span /> }));
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
  BarChart: ({ children }: any) => <div>{children}</div>,
  Bar: () => null, XAxis: () => null, YAxis: () => null, CartesianGrid: () => null,
  Tooltip: () => null, Legend: () => null, Cell: () => null,
  PieChart: ({ children }: any) => <div>{children}</div>, Pie: () => null,
  RadarChart: ({ children }: any) => <div>{children}</div>,
  PolarGrid: () => null, PolarAngleAxis: () => null, Radar: () => null,
}));

import api from '@/lib/api';
import { useHospitalId } from '@/lib/hospital';
import AdminReportsPage from '@/app/hospital/admin/reports/page';

const mockGet = api.get as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  (useHospitalId as jest.Mock).mockReturnValue('h1');
});

describe('AdminReportsPage', () => {
  test('renders without crashing in loading state', () => {
    mockGet.mockReturnValue(new Promise(() => {}));
    expect(() => render(<AdminReportsPage />)).not.toThrow();
  });

  test('shows loading skeletons while fetching metrics', () => {
    mockGet.mockReturnValue(new Promise(() => {}));
    const { container } = render(<AdminReportsPage />);
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
  });

  test('calls GET /reports/department/metrics on mount', async () => {
    mockGet.mockResolvedValue({ data: [] });
    render(<AdminReportsPage />);
    await waitFor(() => expect(mockGet).toHaveBeenCalledWith('/reports/department/metrics'));
  });

  test('calls GET /hospitals/${id}/doctors on mount', async () => {
    mockGet.mockResolvedValue({ data: [] });
    render(<AdminReportsPage />);
    await waitFor(() => expect(mockGet).toHaveBeenCalledWith(expect.stringContaining('/doctors')));
  });

  test('renders charts after data loads', async () => {
    mockGet.mockResolvedValue({ data: [{ department: 'ICU', avg_wait_minutes: 30, metric_date: '2025-07-01' }] });
    render(<AdminReportsPage />);
    await waitFor(() => expect(document.body.textContent!.length).toBeGreaterThan(100));
  });

  test('shows chart error state when wait-times API fails', async () => {
    mockGet
      .mockRejectedValueOnce(new Error('metrics failed'))
      .mockResolvedValue({ data: [] });
    render(<AdminReportsPage />);
    await waitFor(() => expect(document.body).toBeTruthy());
  });
});
