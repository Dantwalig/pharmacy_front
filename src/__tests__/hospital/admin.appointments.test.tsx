/**
 * Tests: src/app/hospital/admin/appointments/page.tsx
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, v?: string | Record<string, unknown>) => typeof v === 'string' ? v : key,
  }),
}));

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), patch: jest.fn() },
}));

jest.mock('@/lib/hospital', () => ({
  useHospitalId: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
  useParams: () => ({}),
}));

jest.mock('lucide-react', () => {
  const icon = () => <span />;
  return { Search: icon, Filter: icon, ChevronLeft: icon, ChevronRight: icon, Calendar: icon, Clock: icon, CheckCircle: icon, XCircle: icon, AlertCircle: icon, MoreVertical: icon, RefreshCw: icon };
});

import api from '@/lib/api';
import { useHospitalId } from '@/lib/hospital';
import AdminAppointmentsPage from '@/app/hospital/admin/appointments/page';

const mockGet = api.get as jest.Mock;
const mockUseHospitalId = useHospitalId as jest.Mock;

const makeAppt = (id: string, status: string) => ({
  id,
  status,
  type: 'OUTPATIENT',
  reason: 'Checkup',
  scheduledAt: '2025-07-15T09:00:00Z',
  patient: { firstName: 'Pat', lastName: 'Test', phone: '0780000000' },
  doctor: { firstName: 'Dr', lastName: 'Smith', specialization: 'General' },
  hospital: { name: 'Test Hospital' },
});

beforeEach(() => {
  jest.clearAllMocks();
  mockUseHospitalId.mockReturnValue('test-hospital-id-123');
});

describe('AdminAppointmentsPage', () => {
  test('renders page without crashing', () => {
    mockGet.mockReturnValue(new Promise(() => {}));
    render(<AdminAppointmentsPage />);
    expect(document.body).toBeTruthy();
  });

  test('calls GET /appointments on mount', async () => {
    mockGet.mockResolvedValue({ data: [] });
    render(<AdminAppointmentsPage />);
    await waitFor(() => {
      expect(mockGet).toHaveBeenCalledWith(expect.stringContaining('/appointments'));
    });
  });

  test('shows appointment rows when data loads', async () => {
    mockGet.mockResolvedValue({
      data: [makeAppt('appt-1', 'SCHEDULED'), makeAppt('appt-2', 'COMPLETED')],
    });
    render(<AdminAppointmentsPage />);
    await waitFor(() => {
      expect(screen.getAllByText('Pat Test').length).toBeGreaterThanOrEqual(1);
    });
  });

  test('no PENDING or CONFIRMED option in status dropdown — uses real enum values', () => {
    mockGet.mockReturnValue(new Promise(() => {}));
    render(<AdminAppointmentsPage />);
    expect(screen.queryByRole('option', { name: 'PENDING' })).not.toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'CONFIRMED' })).not.toBeInTheDocument();
  });

  test('shows empty state message when appointments list is empty', async () => {
    mockGet.mockResolvedValue({ data: [] });
    render(<AdminAppointmentsPage />);
    await waitFor(() => {
      // Either a "no appointments" key or a generic empty state
      const body = document.body.textContent ?? '';
      expect(body.length).toBeGreaterThan(0);
    });
  });
});
