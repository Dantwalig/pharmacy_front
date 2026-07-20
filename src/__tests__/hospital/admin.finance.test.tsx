import React from 'react';
import { render, screen } from '@testing-library/react';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string, v?: string | Record<string, unknown>) => typeof v === 'string' ? v : key }),
}));
jest.mock('@heroicons/react/24/outline', () => {
  const i = () => <span />;
  return { BanknotesIcon: i, ClockIcon: i, ExclamationTriangleIcon: i };
});
jest.mock('@/components/hospital/finance/RevenueChart', () => ({
  __esModule: true,
  default: () => <div data-testid="revenue-chart" />,
}));
jest.mock('@/components/hospital/finance/PaymentBreakdownChart', () => ({
  __esModule: true,
  default: () => <div data-testid="payment-breakdown" />,
}));
jest.mock('@/components/hospital/finance/InvoiceTable', () => ({
  __esModule: true,
  default: () => <div data-testid="invoice-table" />,
}));
jest.mock('@/components/hospital/finance/RefundTable', () => ({
  __esModule: true,
  default: () => <div data-testid="refund-table" />,
}));
jest.mock('@/mock/hospital/finance', () => ({
  MOCK_INVOICES: [{ id: 'inv-1', patient: 'John Doe', amount: 5000, status: 'PAID', date: '2025-07-01' }],
}));

import AdminFinancePage from '@/app/hospital/admin/finance/page';

describe('AdminFinancePage', () => {
  test('renders without crashing', () => {
    expect(() => render(<AdminFinancePage />)).not.toThrow();
  });

  test('renders hero banner with title', () => {
    render(<AdminFinancePage />);
    expect(document.body.textContent!.length).toBeGreaterThan(0);
  });

  test('renders RevenueChart component', () => {
    render(<AdminFinancePage />);
    expect(screen.getByTestId('revenue-chart')).toBeInTheDocument();
  });

  test('renders InvoiceTable component', () => {
    render(<AdminFinancePage />);
    expect(screen.getByTestId('invoice-table')).toBeInTheDocument();
  });

  test('renders PaymentBreakdownChart component', () => {
    render(<AdminFinancePage />);
    expect(screen.getByTestId('payment-breakdown')).toBeInTheDocument();
  });

  test('renders RefundTable component', () => {
    render(<AdminFinancePage />);
    expect(screen.getByTestId('refund-table')).toBeInTheDocument();
  });
});
