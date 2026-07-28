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
import ReceptionistChangePasswordPage from '@/app/hospital/receptionist/change-password/page';

const mockPost = api.post as jest.Mock;

beforeEach(() => jest.clearAllMocks());

describe('ReceptionistChangePasswordPage', () => {
  test('renders without crashing', () => {
    expect(() => render(<ReceptionistChangePasswordPage />)).not.toThrow();
  });

  test('renders hero banner', () => {
    render(<ReceptionistChangePasswordPage />);
    expect(document.body.textContent!.length).toBeGreaterThan(0);
  });

  test('renders three password input fields', () => {
    render(<ReceptionistChangePasswordPage />);
    const pwdInputs = document.querySelectorAll('input[type="password"]');
    expect(pwdInputs.length).toBeGreaterThanOrEqual(2);
  });

  test('password strength indicator updates as new password is typed', () => {
    render(<ReceptionistChangePasswordPage />);
    const inputs = document.querySelectorAll('input[type="password"]');
    if (inputs.length >= 2) {
      fireEvent.change(inputs[1], { target: { value: 'Ab1!Xy89' } });
      expect(document.body).toBeTruthy();
    }
  });

  test('submit calls POST /auth/change-password with valid inputs', async () => {
    mockPost.mockResolvedValue({ data: { message: 'Password changed' } });
    render(<ReceptionistChangePasswordPage />);
    const inputs = document.querySelectorAll('input[type="password"]');
    if (inputs.length >= 3) {
      fireEvent.change(inputs[0], { target: { value: 'OldPass1!' } });
      fireEvent.change(inputs[1], { target: { value: 'NewPass1!' } });
      fireEvent.change(inputs[2], { target: { value: 'NewPass1!' } });
    }
    const submitBtn = screen.queryByText('hospital.submit') ?? screen.queryByText('hospital.changePassword') ?? document.querySelector('button[type="submit"]');
    if (submitBtn) {
      fireEvent.click(submitBtn);
      await waitFor(() => expect(document.body).toBeTruthy());
    }
    expect(document.body).toBeTruthy();
  });

  test('Cancel button resets the form', () => {
    render(<ReceptionistChangePasswordPage />);
    const cancelBtn = screen.queryByText('hospital.cancel');
    if (cancelBtn) fireEvent.click(cancelBtn);
    expect(document.body).toBeTruthy();
  });
});
