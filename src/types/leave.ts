// frontend/src/types/leave.ts

export type LeaveType =
  | 'ANNUAL'
  | 'SICK'
  | 'MATERNITY'
  | 'PATERNITY'
  | 'CIRCUMSTANTIAL'
  | 'MARRIAGE'
  | 'UNPAID';

export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface LeaveTypeInfo {
  type: LeaveType;
  label: string;
  labelFr: string;
  description: string;
  defaultDays: number;
  paid: boolean;
  requestable: boolean;
  legalReference: string;
}

export interface LeaveRequest {
  id: string;
  requesterId: string;
  requesterRole: string;
  branchId: string | null;
  pharmacyId: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  attachmentUrl?: string | null;
  status: LeaveStatus;
  reviewerId?: string | null;
  reviewedAt?: string | null;
  rejectionReason?: string | null;
  createdAt: string;
  requester?: {
    id: string;
    email: string;
    role: string;
    staff?: { firstName: string; lastName: string; branchId: string } | null;
    managedBranch?: { id: string; name: string; branchManagerName?: string | null } | null;
  };
  reviewer?: { id: string; email: string; role: string } | null;
  branch?: { id: string; name: string } | null;
}

export interface LeaveBalanceEntry {
  leaveType: LeaveType;
  label: string;
  year: number;
  allocatedDays: number;
  usedDays: number;
  remainingDays: number;
  isCustom: boolean;
}

export interface EmployeeLeaveBalances {
  userId: string;
  staffId: string | null;
  name: string;
  role: string;
  branchName?: string;
  balances: LeaveBalanceEntry[];
}

export function requesterDisplayName(req: LeaveRequest): string {
  if (req.requester?.staff) {
    return `${req.requester.staff.firstName} ${req.requester.staff.lastName}`;
  }
  if (req.requester?.managedBranch) {
    return req.requester.managedBranch.branchManagerName || req.requester.email;
  }
  return req.requester?.email ?? 'Unknown';
}
