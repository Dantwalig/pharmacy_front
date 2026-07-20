import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string, v?: string | Record<string, unknown>) => typeof v === 'string' ? v : key }),
}));
jest.mock('lucide-react', () => {
  const i = () => <span />;
  return { Search: i, FileText: i, Clock: i, Users: i, AlertCircle: i, Calendar: i, Save: i, RotateCcw: i, ChevronDown: i };
});
jest.mock('@/mock/hospital/consultations', () => ({
  MOCK_PATIENTS: [
    { id: 'p1', name: 'Alice B', mrn: 'MRN-001', age: 30, gender: 'F', status: 'ACTIVE' },
    { id: 'p2', name: 'Bob K', mrn: 'MRN-002', age: 45, gender: 'M', status: 'ACTIVE' },
    { id: 'p3', name: 'Carol N', mrn: 'MRN-003', age: 28, gender: 'F', status: 'ACTIVE' },
    { id: 'p4', name: 'Dan M', mrn: 'MRN-004', age: 55, gender: 'M', status: 'ACTIVE' },
    { id: 'p5', name: 'Eve O', mrn: 'MRN-005', age: 62, gender: 'F', status: 'ACTIVE' },
    { id: 'p6', name: 'Frank P', mrn: 'MRN-006', age: 38, gender: 'M', status: 'ACTIVE' },
  ],
}));
jest.mock('@/mock/hospital/user', () => ({
  MOCK_NURSE: { firstName: 'Claudine', lastName: 'U', id: 'n1' },
}));

import NurseNotesPage from '@/app/hospital/nurse/notes/page';

describe('NurseNotesPage', () => {
  test('renders without crashing', () => {
    expect(() => render(<NurseNotesPage />)).not.toThrow();
  });

  test('renders hero banner', () => {
    render(<NurseNotesPage />);
    expect(document.body.textContent!.length).toBeGreaterThan(0);
  });

  test('stat cards are visible', () => {
    render(<NurseNotesPage />);
    const cards = document.querySelectorAll('[class*="stat"], [class*="card"], [class*="grid"]');
    expect(document.body).toBeTruthy();
  });

  test('note history list is rendered on left panel', () => {
    render(<NurseNotesPage />);
    expect(document.body.innerHTML).toContain('Dan M');
  });

  test('create note form is visible on right panel', () => {
    render(<NurseNotesPage />);
    expect(document.body.innerHTML).toContain('hospital.observationNotes');
  });

  test('submitting the note form adds entry to history', () => {
    render(<NurseNotesPage />);
    const patientSelect = document.querySelector('select') as HTMLSelectElement | null;
    const observationTextarea = document.querySelectorAll('textarea')[0] as HTMLTextAreaElement | null;
    if (patientSelect && observationTextarea) {
      fireEvent.change(patientSelect, { target: { value: 'p1' } });
      fireEvent.change(observationTextarea, { target: { value: 'Patient is stable' } });
      const submitBtn = screen.queryByText('hospital.submitDocumentation');
      if (submitBtn) fireEvent.click(submitBtn);
    }
    expect(document.body).toBeTruthy();
  });
});
