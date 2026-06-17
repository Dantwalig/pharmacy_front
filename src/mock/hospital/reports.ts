export interface Report {
  id: string;
  name: string;
  type: 'Inventory' | 'Financial' | 'Staff' | 'Patient';
  generatedBy: string;
  date: string;
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
  size: string;
}
// Mock data for Reports & Analysis tab
// Source: API doc states "advanced telemetry analytics endpoints are in-progress"
// → frontend uses mock data until the aggregate reporting engine is deployed
// CSV export endpoints are live: GET /api/reports/export/appointments|revenue|prescriptions
// The mock data includes a summary of key metrics for the hospital, such as total patients, new admissions, discharges, and average stay duration. It also includes datasets for visualizations like line charts showing admissions over time and donut charts breaking down diagnoses by category. This allows the frontend to display a rich reporting dashboard with insights into hospital operations and patient trends without needing live backend data during development.
import type {
  ReportSummary,
  AdmissionDataPoint,
  DiagnosisBreakdown,
  DepartmentWaitTime,
  SatisfactionSlice,
  DepartmentStaffCount,
  AdmissionsTrendPoint,
} from '@/types/hospital';

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

// Analytics charts (per Figma) 

// Average wait time (minutes) per department — horizontal bar chart
export const MOCK_WAIT_TIMES: DepartmentWaitTime[] = [
  { department: 'Cardiology',  minutes: 45 },
  { department: 'Dermatology', minutes: 55 },
  { department: 'Neurology',   minutes: 50 },
  { department: 'Orthopedics', minutes: 62 },
  { department: 'Oncology',    minutes: 34 },
  { department: 'Gynecology',  minutes: 78 },
  { department: 'Surgery',     minutes: 22 },
];

// Patient satisfaction split — donut chart
export const MOCK_PATIENT_SATISFACTION: SatisfactionSlice[] = [
  { name: 'Excellent', value: 60 },
  { name: 'Good',      value: 25 },
  { name: 'Poor',      value: 15 },
];

// Staff headcount per department — radar chart
export const MOCK_STAFF_PER_DEPARTMENT: DepartmentStaffCount[] = [
  { department: 'Cardiology',  staff: 80 },
  { department: 'Surgery',     staff: 95 },
  { department: 'Dermatology', staff: 55 },
  { department: 'Gynecology',  staff: 70 },
  { department: 'Orthopedics', staff: 60 },
  { department: 'Neurology',   staff: 48 },
];

// Admitted vs outpatient volume over time — grouped bar chart
export const MOCK_ADMITTED_OVER_TIME: AdmissionsTrendPoint[] = [
  { period: 'Jan - Feb', admitted: 3900, outpatients: 1500 },
  { period: 'Mar - Apr', admitted: 2200, outpatients: 3200 },
  { period: 'May - Jun', admitted: 3300, outpatients: 2500 },
  { period: 'Jul - Aug', admitted: 3400, outpatients: 950  },
  { period: 'Sep - Oct', admitted: 1300, outpatients: 3600 },
];
