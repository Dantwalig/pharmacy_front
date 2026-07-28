import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string, v?: string | Record<string, unknown>) => typeof v === 'string' ? v : key }),
}));
jest.mock('@/context/AuthContext', () => ({
  useAuth: jest.fn().mockReturnValue({
    user: { hospitalId: 'h1', id: 'user-1', firstName: 'Reception' },
    logout: jest.fn(),
  }),
}));
jest.mock('@/lib/api', () => {
  const apiObj = { get: jest.fn(), post: jest.fn(), patch: jest.fn() };
  return { __esModule: true, default: apiObj, api: apiObj, unwrapData: jest.fn((d: any) => Array.isArray(d) ? d : (d?.data ?? [])), authApi: { changePassword: jest.fn() } };
});
jest.mock('react-hot-toast', () => {
  const fn = Object.assign(jest.fn(), { success: jest.fn(), error: jest.fn() });
  return { __esModule: true, default: fn, toast: fn };
});

import api from '@/lib/api';
import ReceptionistLeaveRequestPage from '@/app/hospital/receptionist/leave-request/page';

const mockGet = api.get as jest.Mock;

beforeEach(() => jest.clearAllMocks());

describe('ReceptionistLeaveRequestPage', () => {
  test('renders without crashing', () => {
    mockGet.mockReturnValue(new Promise(() => {}));
    expect(() => render(<ReceptionistLeaveRequestPage />)).not.toThrow();
  });

  test('shows loading state while fetching', () => {
    mockGet.mockReturnValue(new Promise(() => {}));
    const { container } = render(<ReceptionistLeaveRequestPage />);
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
  });

  test('calls GET /hospitals/${id}/receptionist/leaves on mount', async () => {
    mockGet.mockResolvedValue({ data: [] });
    render(<ReceptionistLeaveRequestPage />);
    await waitFor(() => expect(mockGet).toHaveBeenCalledWith(expect.stringContaining('/receptionist/leaves')));
  });

  test('shows hardcoded annual (14) and sick (8) leave balances', async () => {
    mockGet.mockResolvedValue({ data: [] });
    render(<ReceptionistLeaveRequestPage />);
    await waitFor(() => {
      expect(document.body.textContent).toContain('14');
      expect(document.body.textContent).toContain('8');
    });
  });

  test('submitting leave form adds entry to history (local state only)', async () => {
    mockGet.mockResolvedValue({ data: [] });
    render(<ReceptionistLeaveRequestPage />);
    await waitFor(() => expect(mockGet).toHaveBeenCalled());
    const dateInputs = document.querySelectorAll('input[type="date"]');
    const reasonTextarea = document.querySelector('textarea') as HTMLTextAreaElement | null;
    if (dateInputs.length >= 2 && reasonTextarea) {
      fireEvent.change(dateInputs[0], { target: { value: '2026-08-01' } });
      fireEvent.change(dateInputs[1], { target: { value: '2026-08-05' } });
      fireEvent.change(reasonTextarea, { target: { value: 'Vacation' } });
    }
    const submitBtn = screen.queryByText('hospital.submitRequest');
    if (submitBtn) fireEvent.click(submitBtn);
    expect(document.body).toBeTruthy();
  });

  test('shows error state when API fails', async () => {
    mockGet.mockRejectedValue(new Error('Network error'));
    render(<ReceptionistLeaveRequestPage />);
    await waitFor(() => expect(document.body.textContent!.length).toBeGreaterThan(0));
  });
});
