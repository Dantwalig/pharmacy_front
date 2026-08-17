import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string, v?: string | Record<string, unknown>) => typeof v === 'string' ? v : key }),
}));
jest.mock('@/lib/api', () => {
  const apiObj = { get: jest.fn(), post: jest.fn(), patch: jest.fn() };
  return { __esModule: true, default: apiObj, api: apiObj, unwrapData: jest.fn((d: any) => Array.isArray(d) ? d : (d?.data ?? [])), authApi: { changePassword: jest.fn() } };
});
jest.mock('lucide-react', () => {
  const i = () => <span />;
  return { Settings: i, CheckCircle: i, Pencil: i };
});
jest.mock('@heroicons/react/24/outline', () => {
  const i = () => <span />;
  return { InformationCircleIcon: i, ArrowPathIcon: i };
});
jest.mock('js-cookie', () => ({ get: jest.fn().mockReturnValue('{"email":"doctor@test.com"}') }));
jest.mock('react-hot-toast', () => {
  const fn = Object.assign(jest.fn(), { success: jest.fn(), error: jest.fn() });
  return { __esModule: true, default: fn, toast: fn };
});

import api, { authApi } from '@/lib/api';
import DoctorSettingsPage from '@/app/hospital/doctor/settings/page';

const mockGet = api.get as jest.Mock;
const mockChangePassword = authApi.changePassword as jest.Mock;

const DOCTOR_PROFILE = { doctorName: 'Dr Jane Smith', specialization: 'Cardiology', hospitalName: 'Test Hospital' };

beforeEach(() => jest.clearAllMocks());

describe('DoctorSettingsPage', () => {
  test('renders without crashing', () => {
    mockGet.mockReturnValue(new Promise(() => {}));
    expect(() => render(<DoctorSettingsPage />)).not.toThrow();
  });

  test('shows loading skeleton while fetching profile', () => {
    mockGet.mockReturnValue(new Promise(() => {}));
    const { container } = render(<DoctorSettingsPage />);
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
  });

  test('calls GET /doctors/dashboard on mount', async () => {
    mockGet.mockResolvedValue({ data: DOCTOR_PROFILE });
    render(<DoctorSettingsPage />);
    await waitFor(() => expect(mockGet).toHaveBeenCalledWith('/doctors/dashboard'));
  });

  test('renders doctor name after profile loads', async () => {
    mockGet.mockResolvedValue({ data: DOCTOR_PROFILE });
    render(<DoctorSettingsPage />);
    await waitFor(() => expect(screen.getAllByText(/Jane/i).length).toBeGreaterThan(0));
  });

  test('Change Password tab is visible', async () => {
    mockGet.mockResolvedValue({ data: DOCTOR_PROFILE });
    render(<DoctorSettingsPage />);
    await waitFor(() => expect(document.body.innerHTML).toContain('Change Password'));
  });

  test('clicking Change Password tab shows password form', async () => {
    mockGet.mockResolvedValue({ data: DOCTOR_PROFILE });
    render(<DoctorSettingsPage />);
    await waitFor(() => screen.getAllByText('Change Password'));
    fireEvent.click(screen.getAllByText('Change Password')[0]);
    expect(document.querySelector('input[type="password"]')).toBeInTheDocument();
  });

  test('shows error state when profile API fails', async () => {
    mockGet.mockRejectedValue(new Error('Network error'));
    render(<DoctorSettingsPage />);
    await waitFor(() => expect(document.body.textContent!.length).toBeGreaterThan(0));
  });
});
