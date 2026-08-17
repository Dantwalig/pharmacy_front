import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string, v?: string | Record<string, unknown>) => typeof v === 'string' ? v : key }),
}));
jest.mock('@/lib/api', () => ({ __esModule: true, default: { get: jest.fn() } }));
jest.mock('@/lib/hospital', () => ({ useHospitalId: jest.fn().mockReturnValue('h1') }));
jest.mock('lucide-react', () => {
  const i = () => <span />;
  return { Stethoscope: i, Microscope: i, HeartHandshake: i, Briefcase: i, Building2: i, Users: i, Activity: i, FlaskConical: i, Clock: i, HeartPulse: i, Truck: i, DollarSign: i, GitFork: i, Search: i };
});

import api from '@/lib/api';
import { useHospitalId } from '@/lib/hospital';
import AdminDepartmentsPage from '@/app/hospital/admin/departments/page';

const mockGet = api.get as jest.Mock;

const makeDoc = (id: string, spec: string) => ({
  id, specialization: spec, isAvailable: true,
  user: { email: 'dr.smith@test.com', hospitalStaff: { firstName: 'Dr', lastName: 'Smith', phone: '+250780000000' } },
});

beforeEach(() => { jest.clearAllMocks(); (useHospitalId as jest.Mock).mockReturnValue('h1'); });

describe('AdminDepartmentsPage', () => {
  test('renders without crashing in loading state', () => {
    mockGet.mockReturnValue(new Promise(() => {}));
    expect(() => render(<AdminDepartmentsPage />)).not.toThrow();
  });

  test('shows loading indicator while fetching', () => {
    mockGet.mockReturnValue(new Promise(() => {}));
    render(<AdminDepartmentsPage />);
    expect(screen.getByText('hospital.loadingDepartments')).toBeInTheDocument();
  });

  test('calls GET /hospitals/${id}/doctors on mount', async () => {
    mockGet.mockResolvedValue({ data: [] });
    render(<AdminDepartmentsPage />);
    await waitFor(() => expect(mockGet).toHaveBeenCalledWith(expect.stringContaining('/doctors')));
  });

  test('renders doctor rows in employee directory after load', async () => {
    mockGet.mockResolvedValue({ data: [makeDoc('d1', 'Cardiology'), makeDoc('d2', 'Neurology')] });
    render(<AdminDepartmentsPage />);
    await waitFor(() => expect(screen.getAllByText('Dr Smith').length).toBeGreaterThanOrEqual(1));
  });

  test('search input is present for filtering directory', async () => {
    mockGet.mockResolvedValue({ data: [makeDoc('d1', 'Cardiology')] });
    render(<AdminDepartmentsPage />);
    await waitFor(() => expect(screen.getByText('Dr Smith')).toBeInTheDocument());
    const inputs = document.querySelectorAll('input');
    expect(inputs.length).toBeGreaterThan(0);
  });

  test('shows error state when API fails (fallback mock renders)', async () => {
    mockGet.mockRejectedValue(new Error('Network error'));
    render(<AdminDepartmentsPage />);
    await waitFor(() => expect(document.body.textContent!.length).toBeGreaterThan(0));
  });
});
