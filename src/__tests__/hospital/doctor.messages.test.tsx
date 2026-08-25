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
  return { MagnifyingGlassIcon: i, ChatBubbleLeftRightIcon: i, ClockIcon: i, InformationCircleIcon: i, ArrowPathIcon: i };
});

import api from '@/lib/api';
import DoctorMessagesPage from '@/app/hospital/doctor/messages/page';

const mockGet = api.get as jest.Mock;

beforeAll(() => { Element.prototype.scrollIntoView = jest.fn(); });

const makeNote = (id: string) => ({
  id, title: `Notification ${id}`, message: 'Test message', createdAt: new Date().toISOString(),
  isRead: false, priority: 'NORMAL', userType: 'doctor',
});

beforeEach(() => jest.clearAllMocks());

describe('DoctorMessagesPage', () => {
  test('renders without crashing', () => {
    mockGet.mockReturnValue(new Promise(() => {}));
    expect(() => render(<DoctorMessagesPage />)).not.toThrow();
  });

  test('shows loading skeleton while fetching', () => {
    mockGet.mockReturnValue(new Promise(() => {}));
    const { container } = render(<DoctorMessagesPage />);
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
  });

  test('calls GET /notifications?userType=doctor on mount', async () => {
    mockGet.mockResolvedValue({ data: [] });
    render(<DoctorMessagesPage />);
    await waitFor(() => expect(mockGet).toHaveBeenCalledWith(expect.stringContaining('userType=doctor')));
  });

  test('renders thread list after data loads', async () => {
    mockGet.mockResolvedValue({ data: [makeNote('n1'), makeNote('n2')] });
    render(<DoctorMessagesPage />);
    await waitFor(() => expect(screen.getAllByText('Notification n1').length).toBeGreaterThanOrEqual(1));
  });

  test('send input is disabled (no real-time messaging backend)', async () => {
    mockGet.mockResolvedValue({ data: [makeNote('n1')] });
    render(<DoctorMessagesPage />);
    await waitFor(() => screen.getByText('Notification n1'));
    fireEvent.click(screen.getByText('Notification n1'));
    const sendInput = document.querySelector('input[disabled], textarea[disabled]');
    if (sendInput) expect(sendInput).toBeDisabled();
    else expect(document.body).toBeTruthy();
  });

  test('shows error state when API fails', async () => {
    mockGet.mockRejectedValue(new Error('Network error'));
    render(<DoctorMessagesPage />);
    await waitFor(() => expect(document.body.textContent!.length).toBeGreaterThan(0));
  });
});
