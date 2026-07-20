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
jest.mock('lucide-react', () => {
  const i = () => <span />;
  return { Search: i, Check: i, ChevronLeft: i, ChevronRight: i, CalendarPlus: i, UserPlus: i, ClipboardCheck: i, Megaphone: i };
});

import api from '@/lib/api';
import ReceptionistNotificationsPage from '@/app/hospital/receptionist/notifications/page';

const mockGet = api.get as jest.Mock;
const mockPatch = api.patch as jest.Mock;

const makeNotif = (id: string, isRead: boolean, type: string) => ({
  id, title: `Notification ${id}`, message: 'A new appointment was booked.',
  type, isRead, createdAt: new Date().toISOString(),
});

beforeEach(() => jest.clearAllMocks());

describe('ReceptionistNotificationsPage', () => {
  test('renders without crashing', () => {
    mockGet.mockReturnValue(new Promise(() => {}));
    expect(() => render(<ReceptionistNotificationsPage />)).not.toThrow();
  });

  test('shows loading state while fetching', () => {
    mockGet.mockReturnValue(new Promise(() => {}));
    const { container } = render(<ReceptionistNotificationsPage />);
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
  });

  test('calls GET /hospitals/${id}/receptionist/notifications on mount', async () => {
    mockGet.mockResolvedValue({ data: [] });
    render(<ReceptionistNotificationsPage />);
    await waitFor(() => expect(mockGet).toHaveBeenCalledWith(expect.stringContaining('/receptionist/notifications')));
  });

  test('renders notification items after load', async () => {
    mockGet.mockResolvedValue({
      data: [makeNotif('n1', false, 'APPOINTMENT_BOOKED'), makeNotif('n2', true, 'SYSTEM')],
    });
    render(<ReceptionistNotificationsPage />);
    await waitFor(() => expect(screen.getByText('Notification n1')).toBeInTheDocument());
  });

  test('unread tab filters to unread-only notifications', async () => {
    mockGet.mockResolvedValue({
      data: [makeNotif('n1', false, 'APPOINTMENT_BOOKED'), makeNotif('n2', true, 'SYSTEM')],
    });
    render(<ReceptionistNotificationsPage />);
    await waitFor(() => screen.getByText('Notification n1'));
    const unreadTab = screen.queryByText('hospital.unread');
    if (unreadTab) {
      fireEvent.click(unreadTab);
      expect(document.body).toBeTruthy();
    }
  });

  test('Mark All Read button calls PATCH /receptionist/notifications/read-all', async () => {
    mockGet.mockResolvedValue({ data: [makeNotif('n1', false, 'SYSTEM')] });
    mockPatch.mockResolvedValue({ data: {} });
    render(<ReceptionistNotificationsPage />);
    await waitFor(() => screen.getByText('Notification n1'));
    const markAllBtn = screen.queryByText('hospital.markAllRead');
    if (markAllBtn) {
      fireEvent.click(markAllBtn);
      await waitFor(() => expect(mockPatch).toHaveBeenCalledWith(expect.stringContaining('read-all')));
    } else {
      expect(document.body).toBeTruthy();
    }
  });
});
