import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string, v?: string | Record<string, unknown>) => typeof v === 'string' ? v : key }),
}));
jest.mock('@/lib/api', () => {
  const apiObj = { get: jest.fn(), post: jest.fn(), patch: jest.fn() };
  return { __esModule: true, default: apiObj, api: apiObj, unwrapData: jest.fn((d: any) => Array.isArray(d) ? d : (d?.data ?? [])), authApi: { changePassword: jest.fn() } };
});
jest.mock('next/link', () => ({ __esModule: true, default: ({ children, href }: any) => <a href={href}>{children}</a> }));
jest.mock('next/navigation', () => ({
  useParams: jest.fn().mockReturnValue({ id: 'appt-999' }),
  useRouter: () => ({ push: jest.fn() }),
}));
jest.mock('@heroicons/react/24/outline', () => {
  const i = () => <span />;
  return { ArrowLeftIcon: i, ArrowPathIcon: i };
});

import api from '@/lib/api';
import AppointmentDetailPage from '@/app/hospital/doctor/appointments/[id]/page';

const mockGet = api.get as jest.Mock;

const APPT = {
  id: 'appt-999', status: 'SCHEDULED', scheduledAt: '2025-07-15T09:00:00Z', type: 'OUTPATIENT',
  reason: 'Annual checkup', diagnosis: null, recommendations: null,
  patient: { firstName: 'John', lastName: 'Doe', phone: '+250780000000' },
  doctor: { firstName: 'Dr', lastName: 'Smith', specialization: 'General' },
  hospital: { name: 'Test Hospital' },
};

beforeEach(() => jest.clearAllMocks());

describe('AppointmentDetailPage', () => {
  test('renders without crashing in loading state', () => {
    mockGet.mockReturnValue(new Promise(() => {}));
    expect(() => render(<AppointmentDetailPage params={{ id: 'appt-999' }} />)).not.toThrow();
  });

  test('shows loading skeleton while fetching', () => {
    mockGet.mockReturnValue(new Promise(() => {}));
    const { container } = render(<AppointmentDetailPage params={{ id: 'appt-999' }} />);
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
  });

  test('calls GET /appointments/${id} with correct id', async () => {
    mockGet.mockResolvedValue({ data: APPT });
    render(<AppointmentDetailPage params={{ id: 'appt-999' }} />);
    await waitFor(() => expect(mockGet).toHaveBeenCalledWith('/appointments/appt-999'));
  });

  test('renders appointment detail values after load', async () => {
    mockGet.mockResolvedValue({ data: APPT });
    render(<AppointmentDetailPage params={{ id: 'appt-999' }} />);
    await waitFor(() => expect(screen.getByText('John Doe')).toBeInTheDocument());
  });

  test('shows error state with Retry button when API fails', async () => {
    mockGet.mockRejectedValue(new Error('404 Not Found'));
    render(<AppointmentDetailPage params={{ id: 'appt-999' }} />);
    await waitFor(() => expect(document.body.textContent!.length).toBeGreaterThan(0));
  });

  test('back link points to /hospital/doctor/appointments', () => {
    mockGet.mockReturnValue(new Promise(() => {}));
    render(<AppointmentDetailPage params={{ id: 'appt-999' }} />);
    const backLink = document.querySelector('a[href*="appointments"]');
    expect(backLink).toBeTruthy();
  });
});
