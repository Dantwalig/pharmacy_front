/**
 * Tests: src/app/hospital/nurse/medications/page.tsx
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, v?: string | Record<string, unknown>) => typeof v === 'string' ? v : key,
  }),
}));

jest.mock('@/lib/api', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), patch: jest.fn() },
}));

jest.mock('@/lib/hospital', () => ({
  useHospitalId: jest.fn(),
}));

jest.mock('@/mock/hospital/medications', () => ({
  MOCK_MEDICATIONS: [],
  MOCK_MEDICATION_STATS: { missedDoses: 0, dueToday: 0, upcomingMedications: 0, administeredToday: 0 },
}));

jest.mock('lucide-react', () => {
  const icon = () => <span />;
  return { Search: icon, Filter: icon, Calendar: icon, CheckCircle2: icon, Clock: icon, AlertCircle: icon, XCircle: icon, RotateCcw: icon, Pill: icon };
});

import api from '@/lib/api';
import { useHospitalId } from '@/lib/hospital';
import MedicationAdministrationPage from '@/app/hospital/nurse/medications/page';

const mockGet = api.get as jest.Mock;
const mockUseHospitalId = useHospitalId as jest.Mock;

const ADMISSION_LIST = [{ id: 'adm-1', status: 'ACTIVE' }, { id: 'adm-2', status: 'ACTIVE' }];

const makeMarRecord = (admId: string) => ({
  id: `mar-${admId}`,
  medicationName: 'Paracetamol',
  dose: '500mg',
  route: 'Oral',
  scheduledAt: new Date().toISOString(),
  administeredAt: null,
  nurse: { firstName: 'Bob', lastName: 'N' },
  admission: { patient: { firstName: 'John', lastName: 'D' } },
});

beforeEach(() => {
  jest.clearAllMocks();
  mockUseHospitalId.mockReturnValue('test-hospital-id-123');
});

describe('MedicationAdministrationPage', () => {
  test('renders page header on mount', () => {
    mockGet.mockReturnValue(new Promise(() => {}));
    render(<MedicationAdministrationPage />);
    // The h1 has this translation key
    expect(screen.getAllByText('hospital.medicationsTitle')[0]).toBeInTheDocument();
  });

  test('shows loading skeleton rows while fetching', () => {
    mockGet.mockReturnValue(new Promise(() => {}));
    const { container } = render(<MedicationAdministrationPage />);
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
  });

  test('shows mock fallback when hospitalId is null', async () => {
    mockUseHospitalId.mockReturnValue(null);
    render(<MedicationAdministrationPage />);
    await waitFor(() => {
      expect(screen.getByText(/Showing mock medication data/i)).toBeInTheDocument();
    });
  });

  test('fetches admissions then one MAR call per admission (N+1 pattern)', async () => {
    mockGet
      .mockResolvedValueOnce({ data: ADMISSION_LIST })
      .mockResolvedValueOnce({ data: [makeMarRecord('adm-1')] })
      .mockResolvedValueOnce({ data: [makeMarRecord('adm-2')] });

    render(<MedicationAdministrationPage />);
    await waitFor(() => {
      expect(mockGet).toHaveBeenCalledTimes(3);
    });
    expect(mockGet).toHaveBeenNthCalledWith(1, expect.stringContaining('/inpatient/admissions?hospitalId='));
    expect(mockGet).toHaveBeenNthCalledWith(2, '/inpatient/admissions/adm-1/mar');
    expect(mockGet).toHaveBeenNthCalledWith(3, '/inpatient/admissions/adm-2/mar');
  });

  test('renders MAR rows when data loads', async () => {
    mockGet
      .mockResolvedValueOnce({ data: [ADMISSION_LIST[0]] })
      .mockResolvedValueOnce({ data: [makeMarRecord('adm-1')] });

    render(<MedicationAdministrationPage />);
    await waitFor(() => {
      expect(screen.getByText('John D')).toBeInTheDocument();
    });
  });

  test('tolerates partial MAR failure — renders rows from successful calls', async () => {
    mockGet
      .mockResolvedValueOnce({ data: ADMISSION_LIST })
      .mockResolvedValueOnce({ data: [makeMarRecord('adm-1')] })
      .mockRejectedValueOnce(new Error('adm-2 MAR failed'));

    render(<MedicationAdministrationPage />);
    await waitFor(() => {
      expect(screen.getByText('John D')).toBeInTheDocument();
    });
  });

  test('date filter input has type="date"', () => {
    mockGet.mockReturnValue(new Promise(() => {}));
    render(<MedicationAdministrationPage />);
    const dateInputs = document.querySelectorAll('input[type="date"]');
    expect(dateInputs.length).toBeGreaterThanOrEqual(1);
  });
});
