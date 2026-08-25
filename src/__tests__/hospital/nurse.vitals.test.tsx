/**
 * Tests: src/app/hospital/nurse/vitals/page.tsx
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';

// ── inline mocks (jest.mock factories are hoisted; cannot reference imports) ──

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

jest.mock('lucide-react', () => {
  const icon = () => <span />;
  return { ClipboardCheck: icon, BedDouble: icon, AlertCircle: icon, FilePlus: icon };
});

// ── import mocked modules after mocks are declared ───────────────────────────
import api from '@/lib/api';
import { useHospitalId } from '@/lib/hospital';
import NurseVitalsPage from '@/app/hospital/nurse/vitals/page';

const mockGet = api.get as jest.Mock;
const mockUseHospitalId = useHospitalId as jest.Mock;

// ── test data ─────────────────────────────────────────────────────────────────
const ADMISSION = { id: 'adm-1', status: 'ACTIVE', patient: { firstName: 'Jane', lastName: 'Doe' } };
const VITALS_RECORD = {
  id: 'v-1',
  recordedAt: '2025-07-15T10:00:00Z',
  nurseNotes: 'Patient stable',
  readings: [
    { name: 'temperature', value: 37.2 },
    { name: 'bloodPressure', value: '120/80' },
  ],
  nurse: { firstName: 'Alice', lastName: 'M' },
};

beforeEach(() => {
  jest.clearAllMocks();
  mockUseHospitalId.mockReturnValue('test-hospital-id-123');
});

// ── tests ─────────────────────────────────────────────────────────────────────

describe('NurseVitalsPage', () => {
  test('renders page hero text on mount', () => {
    mockGet.mockReturnValue(new Promise(() => {}));
    render(<NurseVitalsPage />);
    expect(screen.getByText('hospital.vitalsTitle')).toBeInTheDocument();
  });

  test('shows loading skeletons before API resolves', () => {
    mockGet.mockReturnValue(new Promise(() => {}));
    const { container } = render(<NurseVitalsPage />);
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  test('shows mock fallback banner when hospitalId is null', async () => {
    mockUseHospitalId.mockReturnValue(null);
    render(<NurseVitalsPage />);
    await waitFor(() => {
      expect(screen.getByText(/Showing mock vitals data/i)).toBeInTheDocument();
    });
  });

  test('loads live vitals data — calls admissions then vitals endpoint', async () => {
    mockGet
      .mockResolvedValueOnce({ data: { data: [ADMISSION] } })
      .mockResolvedValueOnce({ data: { data: [VITALS_RECORD] } });

    render(<NurseVitalsPage />);

    await waitFor(() => {
      expect(mockGet).toHaveBeenCalledTimes(2);
    });
    expect(mockGet).toHaveBeenNthCalledWith(1, expect.stringContaining('/inpatient/admissions?hospitalId='));
    expect(mockGet).toHaveBeenNthCalledWith(2, expect.stringContaining('/inpatient/admissions/adm-1/vitals'));
  });

  test('shows dev mock fallback on API error', async () => {
    mockGet.mockRejectedValue(new Error('Network Error'));
    render(<NurseVitalsPage />);
    await waitFor(() => {
      expect(screen.getByText(/Showing mock vitals data/i)).toBeInTheDocument();
    });
  });

  test('condition select initialises to "stable" matching option value', () => {
    mockGet.mockReturnValue(new Promise(() => {}));
    render(<NurseVitalsPage />);
    const selects = screen.getAllByRole('combobox');
    expect((selects[0] as HTMLSelectElement).value).toBe('stable');
  });

  test('mobility select initialises to "independent" matching option value', () => {
    mockGet.mockReturnValue(new Promise(() => {}));
    render(<NurseVitalsPage />);
    const selects = screen.getAllByRole('combobox');
    expect((selects[1] as HTMLSelectElement).value).toBe('independent');
  });

  test('shows no-admissions summary when API returns empty admissions', async () => {
    mockGet.mockResolvedValueOnce({ data: { data: [] } });
    render(<NurseVitalsPage />);
    await waitFor(() => {
      expect(screen.getByText(/No inpatient admissions found/i)).toBeInTheDocument();
    });
  });
});
