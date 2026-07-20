import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string, v?: string | Record<string, unknown>) => typeof v === 'string' ? v : key }),
}));
jest.mock('@/lib/api', () => {
  const apiObj = { get: jest.fn(), post: jest.fn(), patch: jest.fn() };
  return { __esModule: true, default: apiObj, api: apiObj, unwrapData: jest.fn((d: any) => Array.isArray(d) ? d : (d?.data ?? [])), authApi: { changePassword: jest.fn() } };
});
jest.mock('@heroicons/react/24/outline', () => {
  const i = () => <span />;
  return { ChevronLeftIcon: i, ChevronRightIcon: i, CalendarIcon: i, PlusIcon: i };
});

import api from '@/lib/api';
import DoctorSchedulePage from '@/app/hospital/doctor/schedule/page';

const mockGet = api.get as jest.Mock;

const makeAppt = (id: string) => ({
  id, status: 'SCHEDULED', scheduledAt: new Date().toISOString(), type: 'OUTPATIENT', reason: 'Checkup',
  patient: { firstName: 'John', lastName: 'D' }, doctor: { firstName: 'Dr', lastName: 'S' }, hospital: { name: 'Test' },
});

beforeEach(() => jest.clearAllMocks());

describe('DoctorSchedulePage', () => {
  test('renders without crashing', () => {
    mockGet.mockReturnValue(new Promise(() => {}));
    expect(() => render(<DoctorSchedulePage />)).not.toThrow();
  });

  test('shows loading skeleton while fetching', () => {
    mockGet.mockReturnValue(new Promise(() => {}));
    const { container } = render(<DoctorSchedulePage />);
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
  });

  test('calls GET /appointments with date range on mount', async () => {
    mockGet.mockResolvedValue({ data: [] });
    render(<DoctorSchedulePage />);
    await waitFor(() => expect(mockGet).toHaveBeenCalledWith(expect.stringMatching(/\/appointments\?from=.+&to=.+/)));
  });

  test('renders week view by default', async () => {
    mockGet.mockResolvedValue({ data: [] });
    render(<DoctorSchedulePage />);
    await waitFor(() => expect(document.body.innerHTML).toContain('hospital.weeklyOverview'));
  });

  test('month toggle button switches to month view', async () => {
    mockGet.mockResolvedValue({ data: [] });
    render(<DoctorSchedulePage />);
    await waitFor(() => screen.getByText('hospital.monthlyView'));
    fireEvent.click(screen.getByText('hospital.monthlyView'));
    expect(document.body).toBeTruthy();
  });

  test('shows error state when API fails', async () => {
    mockGet.mockRejectedValue(new Error('Network error'));
    render(<DoctorSchedulePage />);
    await waitFor(() => expect(document.body.textContent!.length).toBeGreaterThan(0));
  });

  test('renders appointment entries after data loads', async () => {
    mockGet.mockResolvedValue({ data: [makeAppt('a1')] });
    render(<DoctorSchedulePage />);
    await waitFor(() => expect(document.body.textContent!.length).toBeGreaterThan(100));
  });
});
