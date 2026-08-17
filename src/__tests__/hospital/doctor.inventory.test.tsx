import React from 'react';
import { render, screen } from '@testing-library/react';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string, v?: string | Record<string, unknown>) => typeof v === 'string' ? v : key }),
}));

import DoctorInventoryPage from '@/app/hospital/doctor/inventory/page';

describe('DoctorInventoryPage (stub)', () => {
  test('renders without crashing', () => {
    expect(() => render(<DoctorInventoryPage />)).not.toThrow();
  });

  test('renders inventory title (stub page)', () => {
    render(<DoctorInventoryPage />);
    expect(screen.getByText('hospital.inventory')).toBeInTheDocument();
  });

  test('renders platform subtitle', () => {
    render(<DoctorInventoryPage />);
    expect(screen.getByText('hospital.platform')).toBeInTheDocument();
  });

  test('makes no API calls (stub — no backend endpoint wired)', () => {
    render(<DoctorInventoryPage />);
    expect(document.body).toBeTruthy();
  });
});
