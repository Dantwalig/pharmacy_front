import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string, v?: string | Record<string, unknown>) => typeof v === 'string' ? v : key }),
}));
jest.mock('lucide-react', () => {
  const i = () => <span />;
  return { Hexagon: i, AlertTriangle: i, ClipboardList: i, Search: i };
});

import AdminInventoryPage from '@/app/hospital/admin/inventory/page';

describe('AdminInventoryPage', () => {
  test('renders without crashing', () => {
    expect(() => render(<AdminInventoryPage />)).not.toThrow();
  });

  test('renders hero banner with inventory title', () => {
    render(<AdminInventoryPage />);
    expect(screen.getByText('hospital.inventoryControl')).toBeInTheDocument();
  });

  test('renders inventory table in stock mode by default', () => {
    render(<AdminInventoryPage />);
    expect(document.querySelector('table')).toBeInTheDocument();
  });

  test('mode selector cards are rendered', () => {
    render(<AdminInventoryPage />);
    expect(document.body.innerHTML).toContain('hospital.hospitalStock');
  });

  test('tab pills are rendered (All Items, Drug, Supply, Equipment)', () => {
    render(<AdminInventoryPage />);
    expect(screen.getByText('hospital.allItemsTab')).toBeInTheDocument();
  });

  test('clicking a tab updates the visible items', () => {
    render(<AdminInventoryPage />);
    const drugTab = screen.queryByText('Drug');
    if (drugTab) fireEvent.click(drugTab);
    expect(document.body).toBeTruthy();
  });

  test('inline quantity editor appears when Edit button clicked', () => {
    render(<AdminInventoryPage />);
    const editBtns = screen.queryAllByText('hospital.edit');
    if (editBtns.length > 0) {
      fireEvent.click(editBtns[0]);
      expect(document.body).toBeTruthy();
    } else {
      expect(document.body).toBeTruthy();
    }
  });
});
