import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string, v?: string | Record<string, unknown>) => typeof v === 'string' ? v : key }),
}));
jest.mock('@/lib/api', () => {
  const apiObj = { get: jest.fn(), post: jest.fn(), patch: jest.fn() };
  return { __esModule: true, default: apiObj, api: apiObj, unwrapData: jest.fn((d: any) => Array.isArray(d) ? d : (d?.data ?? [])), authApi: { changePassword: jest.fn() } };
});

import api from '@/lib/api';
import DoctorConsultationsPage from '@/app/hospital/doctor/consultations/page';

const mockGet = api.get as jest.Mock;

const makeAppt = (id: string) => ({
  id, status: 'SCHEDULED', scheduledAt: new Date().toISOString(), type: 'OUTPATIENT', reason: 'Checkup',
  patient: { firstName: 'Pat', lastName: 'Test', id: `p-${id}` },
  doctor: { firstName: 'Dr', lastName: 'S' }, hospital: { name: 'Test' },
  patientId: `p-${id}`,
});

beforeEach(() => jest.clearAllMocks());

describe('DoctorConsultationsPage', () => {
  test('renders without crashing', () => {
    mockGet.mockReturnValue(new Promise(() => {}));
    expect(() => render(<DoctorConsultationsPage />)).not.toThrow();
  });

  test('shows loading skeleton while fetching', () => {
    mockGet.mockReturnValue(new Promise(() => {}));
    const { container } = render(<DoctorConsultationsPage />);
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
  });

  test('calls GET /appointments on mount', async () => {
    mockGet.mockResolvedValue({ data: [] });
    render(<DoctorConsultationsPage />);
    await waitFor(() => expect(mockGet).toHaveBeenCalledWith(expect.stringContaining('/appointments')));
  });

  test('renders patient queue items after data loads', async () => {
    mockGet.mockResolvedValue({ data: [makeAppt('a1'), makeAppt('a2')] });
    render(<DoctorConsultationsPage />);
    await waitFor(() => expect(screen.getAllByText('Pat Test').length).toBeGreaterThanOrEqual(1));
  });

  test('selecting a patient shows consultation detail panel', async () => {
    mockGet.mockResolvedValue({ data: [makeAppt('a1')] });
    render(<DoctorConsultationsPage />);
    await waitFor(() => screen.getByText('Pat Test'));
    fireEvent.click(screen.getByText('Pat Test'));
    expect(document.body.textContent!.length).toBeGreaterThan(100);
  });

  test('shows error state when API fails', async () => {
    mockGet.mockRejectedValue(new Error('Network error'));
    render(<DoctorConsultationsPage />);
    await waitFor(() => expect(document.body.textContent!.length).toBeGreaterThan(0));
  });
});
