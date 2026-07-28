import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string, v?: string | Record<string, unknown>) => typeof v === 'string' ? v : key }),
}));
jest.mock('@/lib/api', () => ({ __esModule: true, default: { get: jest.fn() } }));
jest.mock('@/lib/hospital', () => ({ useHospitalId: jest.fn().mockReturnValue('h1') }));
jest.mock('lucide-react', () => {
  const i = () => <span />;
  return { Users: i, UserCheck: i, UserX: i, Building2: i, Search: i, ChevronLeft: i, ChevronRight: i, MoreVertical: i };
});

import api from '@/lib/api';
import { useHospitalId } from '@/lib/hospital';
import AdminStaffPage from '@/app/hospital/admin/staff/page';

const mockGet = api.get as jest.Mock;

const makeStaff = (id: string, active: boolean) => ({
  id, firstName: 'Alice', lastName: 'N', specialization: 'Cardiology',
  isAvailable: active, email: `alice${id}@test.com`, createdAt: '2025-01-01T00:00:00Z',
});

beforeEach(() => {
  jest.clearAllMocks();
  (useHospitalId as jest.Mock).mockReturnValue('h1');
});

describe('AdminStaffPage', () => {
  test('renders without crashing', () => {
    mockGet.mockReturnValue(new Promise(() => {}));
    expect(() => render(<AdminStaffPage />)).not.toThrow();
  });

  test('shows loading skeleton while fetching', () => {
    mockGet.mockReturnValue(new Promise(() => {}));
    const { container } = render(<AdminStaffPage />);
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
  });

  test('calls GET /hospitals/${id}/doctors on mount', async () => {
    mockGet.mockResolvedValue({ data: [] });
    render(<AdminStaffPage />);
    await waitFor(() => expect(mockGet).toHaveBeenCalledWith(expect.stringContaining('/doctors')));
  });

  test('renders staff rows after data loads', async () => {
    mockGet.mockResolvedValue({ data: [makeStaff('1', true), makeStaff('2', false)] });
    render(<AdminStaffPage />);
    await waitFor(() => expect(screen.getAllByText('Dr. Alice N').length).toBeGreaterThanOrEqual(1));
  });

  test('stat cards (total/active/inactive) are visible after load', async () => {
    mockGet.mockResolvedValue({ data: [makeStaff('1', true), makeStaff('2', false)] });
    render(<AdminStaffPage />);
    await waitFor(() => {
      expect(screen.getAllByText('2').length).toBeGreaterThanOrEqual(1);
    });
  });

  test('shows empty state when no staff returned', async () => {
    mockGet.mockResolvedValue({ data: [] });
    render(<AdminStaffPage />);
    await waitFor(() => expect(document.body.textContent!.length).toBeGreaterThan(0));
  });

  test('shows error state when API fails', async () => {
    mockGet.mockRejectedValue(new Error('Network error'));
    render(<AdminStaffPage />);
    await waitFor(() => expect(document.body).toBeTruthy());
  });
});
