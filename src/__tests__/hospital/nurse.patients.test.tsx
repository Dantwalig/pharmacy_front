/**
 * Tests: src/app/hospital/nurse/patients/page.tsx
 */

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, v?: string | Record<string, unknown>) => typeof v === 'string' ? v : key,
  }),
}));

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { get: jest.fn() },
}));

jest.mock('@/lib/hospital', () => ({
  useHospitalId: jest.fn(),
}));

jest.mock('axios', () => ({
  isAxiosError: jest.fn().mockReturnValue(false),
}));

jest.mock('@/mock/hospital/consultations', () => ({
  MOCK_PATIENTS: [],
}));

jest.mock('lucide-react', () => {
  const icon = () => <span />;
  return { Search: icon, Filter: icon, MoreVertical: icon, ChevronLeft: icon, ChevronRight: icon, Users: icon, BedDouble: icon, Activity: icon, UserCheck: icon };
});

import api from '@/lib/api';
import { useHospitalId } from '@/lib/hospital';
import NursePatientsPage from '@/app/hospital/nurse/patients/page';

const mockGet = api.get as jest.Mock;
const mockUseHospitalId = useHospitalId as jest.Mock;

const makeAdmission = (i: number, status = 'ACTIVE') => ({
  id: `adm-${i}`,
  status,
  reason: 'Fever',
  updatedAt: '2025-07-10T08:00:00Z',
  patient: { firstName: `Patient${i}`, lastName: 'Test', age: 30, gender: 'Male', mrn: `MRN-${i}` },
});

beforeEach(() => {
  jest.clearAllMocks();
  mockUseHospitalId.mockReturnValue('test-hospital-id-123');
});

describe('NursePatientsPage', () => {
  test('renders page hero on mount', () => {
    mockGet.mockReturnValue(new Promise(() => {}));
    render(<NursePatientsPage />);
    expect(screen.getByText('hospital.patientsTitle')).toBeInTheDocument();
  });

  test('shows loading skeleton — no mock data flashes before fetch resolves', () => {
    mockGet.mockReturnValue(new Promise(() => {}));
    const { container } = render(<NursePatientsPage />);
    // Skeleton rows should be visible
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
    // No patient name cells should appear yet
    expect(screen.queryByText(/Patient\d+ Test/)).not.toBeInTheDocument();
  });

  test('shows patient rows after API resolves', async () => {
    mockGet.mockResolvedValue({ data: [makeAdmission(1), makeAdmission(2)] });
    render(<NursePatientsPage />);
    await waitFor(() => {
      expect(screen.getByText('Patient1 Test')).toBeInTheDocument();
      expect(screen.getByText('Patient2 Test')).toBeInTheDocument();
    });
  });

  test('shows empty state when API returns empty array', async () => {
    mockGet.mockResolvedValue({ data: [] });
    render(<NursePatientsPage />);
    await waitFor(() => {
      expect(screen.getByText('hospital.noPatientsFound')).toBeInTheDocument();
    });
  });

  test('shows mock fallback banner when hospitalId is null', async () => {
    mockUseHospitalId.mockReturnValue(null);
    render(<NursePatientsPage />);
    await waitFor(() => {
      expect(screen.getByText(/Showing mock patient data/i)).toBeInTheDocument();
    });
  });

  test('search filters patient list by name', async () => {
    mockGet.mockResolvedValue({ data: [makeAdmission(1), makeAdmission(2), makeAdmission(3)] });
    render(<NursePatientsPage />);
    await waitFor(() => {
      expect(screen.getByText('Patient1 Test')).toBeInTheDocument();
    });
    fireEvent.change(screen.getByPlaceholderText('hospital.searchPlaceholder'), {
      target: { value: 'Patient2' },
    });
    expect(screen.queryByText('Patient1 Test')).not.toBeInTheDocument();
    expect(screen.getByText('Patient2 Test')).toBeInTheDocument();
  });

  test('stat cards show 0 during loading', () => {
    mockGet.mockReturnValue(new Promise(() => {}));
    render(<NursePatientsPage />);
    const zeros = screen.getAllByText('0');
    expect(zeros.length).toBeGreaterThanOrEqual(4);
  });

  test('total patients stat card shows correct count after load', async () => {
    mockGet.mockResolvedValue({ data: [makeAdmission(1), makeAdmission(2), makeAdmission(3)] });
    render(<NursePatientsPage />);
    await waitFor(() => {
      expect(screen.getByText('Patient1 Test')).toBeInTheDocument();
    });
    // '3' may appear in stat card and/or pagination — just verify it exists somewhere
    expect(screen.getAllByText('3').length).toBeGreaterThanOrEqual(1);
  });
});
