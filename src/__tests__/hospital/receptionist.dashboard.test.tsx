/**
 * Tests: src/app/hospital/receptionist/dashboard/page.tsx
 * All GET endpoints are missing from the backend (Gaps Rec-1 through Rec-6).
 * The page should render gracefully with hardcoded fallback values.
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, v?: string | Record<string, unknown>) => typeof v === 'string' ? v : key,
  }),
}));

jest.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    user: { hospitalId: 'test-hospital-id-123', id: 'user-1', firstName: 'Reception' },
    logout: jest.fn(),
  }),
}));

jest.mock('@/lib/api', () => {
  const apiObj = { get: jest.fn().mockRejectedValue(new Error('Not found')) };
  return {
    __esModule: true,
    default: apiObj,
    api: apiObj,
    unwrapData: jest.fn((d: any) => (Array.isArray(d) ? d : d?.data ?? [])),
  };
});

jest.mock('recharts', () => ({
  LineChart: ({ children }: any) => <div>{children}</div>,
  BarChart: ({ children }: any) => <div>{children}</div>,
  Line: () => null, Bar: () => null, Cell: () => null,
  XAxis: () => null, YAxis: () => null, CartesianGrid: () => null,
  Tooltip: () => null,
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
}));

jest.mock('lucide-react', () => {
  const icon = () => <span />;
  return { Users: icon, Clock: icon, CheckCircle: icon, AlertTriangle: icon, Calendar: icon, Search: icon, Bell: icon, LogOut: icon, ChevronRight: icon, MoreVertical: icon, Activity: icon, UserCheck: icon, Home: icon, FileText: icon, Settings: icon, Menu: icon, X: icon };
});

import ReceptionistDashboardPage from '@/app/hospital/receptionist/dashboard/page';

describe('ReceptionistDashboardPage', () => {
  test('renders without crashing (graceful fallback when backend missing)', async () => {
    expect(() => render(<ReceptionistDashboardPage />)).not.toThrow();
    await waitFor(() => {
      expect(document.body.innerHTML.length).toBeGreaterThan(100);
    });
  });

  test('no uncaught errors thrown during render', () => {
    expect(() => render(<ReceptionistDashboardPage />)).not.toThrow();
  });

  test('renders page content with hardcoded fallback stat values', async () => {
    render(<ReceptionistDashboardPage />);
    await waitFor(() => {
      // Stat values (hardcoded while Rec-1 through Rec-6 are missing)
      const numbers = document.querySelectorAll('[class*="font-bold"]');
      expect(numbers.length).toBeGreaterThan(0);
    });
  });

  test('renders a greeting with the user first name', async () => {
    render(<ReceptionistDashboardPage />);
    await waitFor(() => {
      // Use heading role to avoid matching "receptionistDashboardSubtitle" translation key
      expect(screen.getByRole('heading', { name: /Reception/i })).toBeInTheDocument();
    });
  });
});
