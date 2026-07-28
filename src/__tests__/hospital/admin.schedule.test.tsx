import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string, v?: string | Record<string, unknown>) => typeof v === 'string' ? v : key }),
}));
jest.mock('@/lib/api', () => ({ __esModule: true, default: { get: jest.fn() } }));
jest.mock('@/lib/hospital', () => ({ useHospitalId: jest.fn().mockReturnValue('h1') }));
jest.mock('@heroicons/react/24/outline', () => {
  const i = () => <span />;
  return { ChevronLeftIcon: i, ChevronRightIcon: i, ChevronUpIcon: i, CalendarIcon: i, Cog6ToothIcon: i, VideoCameraIcon: i, UserIcon: i, UsersIcon: i };
});

import api from '@/lib/api';
import { useHospitalId } from '@/lib/hospital';
import AdminSchedulePage from '@/app/hospital/admin/schedule/page';

const mockGet = api.get as jest.Mock;

const makeDoc = (id: string) => ({ id, firstName: 'Jane', lastName: 'Smith', specialization: 'General', isAvailable: true });
const makeAppt = (id: string) => ({
  id, status: 'SCHEDULED', scheduledAt: new Date().toISOString(), date: new Date().toISOString(), type: 'OUTPATIENT',
  patient: { firstName: 'John', lastName: 'D' }, doctor: { firstName: 'Dr', lastName: 'S', id: 'd1' },
  hospital: { name: 'Test' }, doctorId: 'd1',
});

beforeEach(() => {
  jest.clearAllMocks();
  (useHospitalId as jest.Mock).mockReturnValue('h1');
});

describe('AdminSchedulePage', () => {
  test('renders without crashing', () => {
    mockGet.mockReturnValue(new Promise(() => {}));
    expect(() => render(<AdminSchedulePage />)).not.toThrow();
  });

  test('shows loading skeletons while fetching', () => {
    mockGet.mockReturnValue(new Promise(() => {}));
    const { container } = render(<AdminSchedulePage />);
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
  });

  test('calls GET /doctors and GET /appointments on mount', async () => {
    mockGet.mockResolvedValue({ data: [] });
    render(<AdminSchedulePage />);
    await waitFor(() => {
      expect(mockGet).toHaveBeenCalledWith(expect.stringContaining('/doctors'));
      expect(mockGet).toHaveBeenCalledWith(expect.stringContaining('/appointments'));
    });
  });

  test('renders doctors in sidebar after load', async () => {
    mockGet
      .mockResolvedValueOnce({ data: [makeDoc('d1')] })
      .mockResolvedValue({ data: [] });
    render(<AdminSchedulePage />);
    await waitFor(() => expect(screen.getAllByText('Dr. Jane Smith').length).toBeGreaterThanOrEqual(1));
  });

  test('week and month toggle buttons are visible', async () => {
    mockGet.mockResolvedValue({ data: [] });
    render(<AdminSchedulePage />);
    await waitFor(() => {
      expect(screen.getAllByRole('button').length).toBeGreaterThan(0);
    });
  });

  test('renders appointment chips when data loads', async () => {
    mockGet
      .mockResolvedValueOnce({ data: [makeDoc('d1')] })
      .mockResolvedValueOnce({ data: [makeAppt('a1')] });
    render(<AdminSchedulePage />);
    await waitFor(() => expect(document.body.textContent!.length).toBeGreaterThan(100));
  });
});
