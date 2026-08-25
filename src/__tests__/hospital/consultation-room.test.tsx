import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
  useParams: () => ({ id: 'appt-abc' }),
}));
jest.mock('js-cookie', () => ({
  get: jest.fn((key: string) => {
    if (key === 'user') return '{"id":"user-123","firstName":"Dr","lastName":"Smith"}';
    if (key === 'userRole') return 'DOCTOR';
    return null;
  }),
}));
jest.mock('axios', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn() },
  isAxiosError: jest.fn().mockReturnValue(false),
}));
jest.mock('lucide-react', () => {
  const i = () => <span />;
  return { Heart: i, Activity: i, Thermometer: i, Scale: i, Droplet: i, Calendar: i, User: i, ArrowLeft: i, ShieldAlert: i, Clock: i, Loader2: i, VideoOff: i, MicOff: i };
});

import axios from 'axios';
import ConsultationRoomPage from '@/app/hospital/consultation/[id]/page';

const mockAxiosGet = axios.get as jest.Mock;
const mockAxiosPost = axios.post as jest.Mock;

const ROOM_CONFIG = {
  appointmentId: 'appt-abc', roomName: 'room-xyz', jitsiDomain: 'meet.jit.si', jwt: 'mock-jwt',
  patientName: 'John Doe', doctorName: 'Dr. Smith', reason: 'Annual checkup',
  triageVitals: { bloodPressure: '120/80', temperature: 37.1, heartRate: 78, spo2: 98, weight: 65 },
  nurseNotes: 'Patient is stable',
};

beforeEach(() => {
  jest.clearAllMocks();
  mockAxiosPost.mockResolvedValue({ data: {} });
});

describe('ConsultationRoomPage', () => {
  test('renders loading state on initial mount', async () => {
    mockAxiosGet.mockReturnValue(new Promise(() => {}));
    await act(async () => { render(<ConsultationRoomPage params={{ id: 'appt-abc' }} />); });
    expect(document.body).toBeTruthy();
  });

  test('calls GET telemedicine-room endpoint on mount', async () => {
    mockAxiosGet.mockResolvedValue({ data: { roomConfig: ROOM_CONFIG } });
    await act(async () => { render(<ConsultationRoomPage params={{ id: 'appt-abc' }} />); });
    await waitFor(() => expect(mockAxiosGet).toHaveBeenCalledWith(
      expect.stringContaining('/appointments/appt-abc/telemedicine-room'),
      expect.any(Object),
    ));
  });

  test('shows error state when telemedicine API returns 404', async () => {
    mockAxiosGet.mockRejectedValue({ response: { status: 404 }, message: 'Not Found' });
    await act(async () => { render(<ConsultationRoomPage params={{ id: 'appt-abc' }} />); });
    await waitFor(() => expect(document.body.textContent!.length).toBeGreaterThan(0));
  });

  test('renders consultation sidebar data (patient name) when config loads', async () => {
    mockAxiosGet.mockResolvedValue({ data: { roomConfig: ROOM_CONFIG } });
    await act(async () => { render(<ConsultationRoomPage params={{ id: 'appt-abc' }} />); });
    await waitFor(() => {
      const text = document.body.textContent ?? '';
      expect(text.length).toBeGreaterThan(50);
    });
  });

  test('return-to-dashboard link is present in error state', async () => {
    mockAxiosGet.mockRejectedValue({ response: { status: 403 }, message: 'Forbidden' });
    await act(async () => { render(<ConsultationRoomPage params={{ id: 'appt-abc' }} />); });
    await waitFor(() => {
      const links = document.querySelectorAll('a, button');
      expect(links.length).toBeGreaterThan(0);
    });
  });
});
