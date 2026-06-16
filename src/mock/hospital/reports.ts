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

export const MOCK_REPORT_SUMMARY: ReportSummary = {
  totalPatients: 412,
  newAdmissions: 87,
  discharged: 61,
  avgStayDays: 2.4,
};

// Three time-period slices — switch between them based on filter selection
export const MOCK_ADMISSIONS_MONTHLY: AdmissionDataPoint[] = [
  { label: 'Jun 1',  admissions: 18 },
  { label: 'Jun 2',  admissions: 22 },
  { label: 'Jun 3',  admissions: 15 },
  { label: 'Jun 4',  admissions: 26 },
  { label: 'Jun 5',  admissions: 20 },
  { label: 'Jun 6',  admissions: 12 },
  { label: 'Jun 7',  admissions: 19 },
];

export const MOCK_ADMISSIONS_3MONTH: AdmissionDataPoint[] = [
  { label: 'Apr Week 1', admissions: 84  },
  { label: 'Apr Week 2', admissions: 92  },
  { label: 'Apr Week 3', admissions: 78  },
  { label: 'Apr Week 4', admissions: 98  },
  { label: 'May Week 1', admissions: 110 },
  { label: 'May Week 2', admissions: 104 },
  { label: 'May Week 3', admissions: 118 },
  { label: 'May Week 4', admissions: 122 },
  { label: 'Jun Week 1', admissions: 87  },
];

export const MOCK_ADMISSIONS_YEARLY: AdmissionDataPoint[] = [
  { label: 'Jan', admissions: 380 },
  { label: 'Feb', admissions: 345 },
  { label: 'Mar', admissions: 420 },
  { label: 'Apr', admissions: 352 },
  { label: 'May', admissions: 434 },
  { label: 'Jun', admissions: 87  },
];

// Diagnosis breakdown donut chart — based on appointment reason patterns
export const MOCK_DIAGNOSIS_BREAKDOWN: DiagnosisBreakdown[] = [
  { name: 'Malaria',        value: 28 },
  { name: 'Hypertension',   value: 22 },
  { name: 'Diabetes',       value: 15 },
  { name: 'Respiratory',    value: 18 },
  { name: 'Other',          value: 17 },
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
