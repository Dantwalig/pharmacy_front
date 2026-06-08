export interface Report {
  id: string;
  name: string;
  type: 'Inventory' | 'Financial' | 'Staff' | 'Patient';
  generatedBy: string;
  date: string;
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
  size: string;
}

export const MOCK_REPORTS: Report[] = [
  {
    id: 'REP-001',
    name: 'Monthly Inventory Audit - May 2026',
    type: 'Inventory',
    generatedBy: 'Alice Mutoni',
    date: '2026-06-01',
    status: 'COMPLETED',
    size: '2.4 MB',
  },
  {
    id: 'REP-002',
    name: 'Quarterly Financial Summary Q1',
    type: 'Financial',
    generatedBy: 'System Admin',
    date: '2026-05-15',
    status: 'COMPLETED',
    size: '1.1 MB',
  },
  {
    id: 'REP-003',
    name: 'Staff Performance Analytics',
    type: 'Staff',
    generatedBy: 'Hospital Director',
    date: '2026-05-10',
    status: 'COMPLETED',
    size: '850 KB',
  },
  {
    id: 'REP-004',
    name: 'Patient Admission Trends 2026',
    type: 'Patient',
    generatedBy: 'Alice Mutoni',
    date: '2026-05-02',
    status: 'COMPLETED',
    size: '3.7 MB',
  },
  {
    id: 'REP-005',
    name: 'Emergency Stock Depletion Report',
    type: 'Inventory',
    generatedBy: 'Pharmacy Head',
    date: '2026-04-28',
    status: 'FAILED',
    size: '0 KB',
  },
];

export const MOCK_CHART_DATA = [
  { name: 'Jan', value: 4000 },
  { name: 'Feb', value: 3000 },
  { name: 'Mar', value: 2000 },
  { name: 'Apr', value: 2780 },
  { name: 'May', value: 1890 },
  { name: 'Jun', value: 2390 },
  { name: 'Jul', value: 3490 },
];
