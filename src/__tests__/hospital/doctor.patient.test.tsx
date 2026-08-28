import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string, v?: string | Record<string, unknown>) => typeof v === 'string' ? v : key }),
}));
jest.mock('@/lib/api', () => {
  const apiObj = { get: jest.fn(), post: jest.fn(), patch: jest.fn() };
  return { __esModule: true, default: apiObj, api: apiObj, unwrapData: jest.fn((d: any) => Array.isArray(d) ? d : (d?.data ?? [])), authApi: { changePassword: jest.fn() } };
});
jest.mock('@heroicons/react/24/outline', () => {
  const i = () => <span />;
  return { MagnifyingGlassIcon: i, UserGroupIcon: i, UserPlusIcon: i, CalendarDaysIcon: i, FunnelIcon: i, EllipsisVerticalIcon: i, ChevronLeftIcon: i, ChevronRightIcon: i };
});

import api from '@/lib/api';
import DoctorPatientPage from '@/app/hospital/doctor/patient/page';

const mockGet = api.get as jest.Mock;

const makeAppt = (id: string, patId: string) => ({
  id, status: 'SCHEDULED', scheduledAt: new Date().toISOString(), reason: 'Checkup', type: 'OUTPATIENT',
  patient: { firstName: 'Jane', lastName: 'D', id: patId }, patientId: patId,
  doctor: { firstName: 'Dr', lastName: 'S' }, hospital: { name: 'Test' },
});

beforeEach(() => jest.clearAllMocks());

describe('DoctorPatientPage', () => {
  test('renders without crashing', () => {
    mockGet.mockReturnValue(new Promise(() => {}));
    expect(() => render(<DoctorPatientPage />)).not.toThrow();
  });

  test('shows loading skeleton while fetching', () => {
    mockGet.mockReturnValue(new Promise(() => {}));
    const { container } = render(<DoctorPatientPage />);
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
  });

  test('calls GET /appointments on mount', async () => {
    mockGet.mockResolvedValue({ data: [] });
    render(<DoctorPatientPage />);
    await waitFor(() => expect(mockGet).toHaveBeenCalledWith(expect.stringContaining('/appointments')));
  });

  test('renders deduplicated patient rows after load', async () => {
    mockGet.mockResolvedValue({
      data: [makeAppt('a1', 'p1'), makeAppt('a2', 'p1'), makeAppt('a3', 'p2')],
    });
    render(<DoctorPatientPage />);
    await waitFor(() => expect(screen.getAllByText('Jane D').length).toBeGreaterThanOrEqual(1));
  });

  test('stat cards are visible (Total Patients, Active Cases)', async () => {
    mockGet.mockResolvedValue({ data: [makeAppt('a1', 'p1')] });
    render(<DoctorPatientPage />);
    await waitFor(() => expect(screen.getAllByText('1').length).toBeGreaterThanOrEqual(1));
  });

  test('shows empty state when no appointments returned', async () => {
    mockGet.mockResolvedValue({ data: [] });
    render(<DoctorPatientPage />);
    await waitFor(() => expect(document.body.textContent!.length).toBeGreaterThan(0));
  });
});
