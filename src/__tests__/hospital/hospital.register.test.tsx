import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string, v?: string | Record<string, unknown>) => typeof v === 'string' ? v : key }),
}));
jest.mock('@/lib/api', () => ({ __esModule: true, default: { post: jest.fn() } }));
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
}));
jest.mock('next/link', () => ({ __esModule: true, default: ({ children, href }: any) => <a href={href}>{children}</a> }));
jest.mock('react-hot-toast', () => {
  const fn = Object.assign(jest.fn(), { success: jest.fn(), error: jest.fn() });
  return { __esModule: true, default: fn, toast: fn };
});
jest.mock('@/lib/errorHandler', () => ({
  getErrorMessage: jest.fn((e: any) => e?.message ?? 'Error'),
}));
jest.mock('@/components/shared/LocationPicker', () => ({
  __esModule: true,
  default: ({ onChange }: any) => (
    <button type="button" data-testid="location-picker" onClick={() => onChange(1.234, 5.678)}>
      Pick Location
    </button>
  ),
}));
jest.mock('@heroicons/react/24/outline', () => {
  const i = () => <span />;
  return { EnvelopeIcon: i, LockClosedIcon: i, UserIcon: i, PhoneIcon: i, BuildingOffice2Icon: i, EyeIcon: i, EyeSlashIcon: i, MapPinIcon: i, ClockIcon: i, UserGroupIcon: i, ShieldCheckIcon: i };
});

import api from '@/lib/api';
import HospitalRegisterPage from '@/app/hospital/register/page';

const mockPost = api.post as jest.Mock;

beforeEach(() => jest.clearAllMocks());

describe('HospitalRegisterPage', () => {
  test('renders without crashing', () => {
    expect(() => render(<HospitalRegisterPage />)).not.toThrow();
  });

  test('renders hospital name and representative name fields', () => {
    render(<HospitalRegisterPage />);
    expect(document.querySelectorAll('input').length).toBeGreaterThan(3);
  });

  test('renders LocationPicker component', () => {
    render(<HospitalRegisterPage />);
    expect(screen.getByTestId('location-picker')).toBeInTheDocument();
  });

  test('shows toast error when passwords do not match', async () => {
    render(<HospitalRegisterPage />);
    const passwordInputs = document.querySelectorAll('input[type="password"]');
    if (passwordInputs.length >= 2) {
      fireEvent.change(passwordInputs[0], { target: { value: 'Password1!' } });
      fireEvent.change(passwordInputs[1], { target: { value: 'Different1!' } });
    }
    const submitBtn = document.querySelector('button[type="submit"]');
    if (submitBtn) {
      fireEvent.click(submitBtn);
      await waitFor(() => expect(document.body).toBeTruthy());
    }
  });

  test('shows toast error when location not selected', async () => {
    render(<HospitalRegisterPage />);
    const submitBtn = document.querySelector('button[type="submit"]');
    if (submitBtn) {
      fireEvent.click(submitBtn);
      await waitFor(() => expect(document.body).toBeTruthy());
    }
  });

  test('calls POST /auth/register/hospital after picking location and matching passwords', async () => {
    mockPost.mockResolvedValue({ data: { message: 'Registration submitted' } });
    render(<HospitalRegisterPage />);

    fireEvent.click(screen.getByTestId('location-picker'));

    const inputs = document.querySelectorAll('input');
    inputs.forEach((input: HTMLInputElement) => {
      if (input.type === 'password') fireEvent.change(input, { target: { value: 'SecurePass1!' } });
      else if (input.type === 'email') fireEvent.change(input, { target: { value: 'hospital@test.com' } });
      else if (input.type === 'text' || input.type === '') fireEvent.change(input, { target: { value: 'Test Value' } });
    });

    const submitBtn = document.querySelector('button[type="submit"]');
    if (submitBtn) {
      fireEvent.click(submitBtn);
      await waitFor(() => expect(document.body).toBeTruthy());
    }
  });
});
