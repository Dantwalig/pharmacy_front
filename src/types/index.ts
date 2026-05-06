// src/types/index.ts

export type UserRole = 'SUPER_ADMIN' | 'PHARMACY' | 'PATIENT' | 'BRANCH_MANAGER' | 'PHARMACIST' | 'CASHIER' | 'NURSE';

export type PharmacyStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type BranchStatus = 'INVITED' | 'PENDING' | 'APPROVED' | 'REJECTED';

export type OrderStatus = 'PENDING' | 'ACCEPTED' | 'PREPARING' | 'READY_FOR_PICKUP' | 'OUT_FOR_DELIVERY' | 'COMPLETED' | 'DELIVERED' | 'CANCELLED';

export type OrderType = 'DELIVERY' | 'PICKUP';

export type PaymentMethod = 'MTN_MOMO' | 'AIRTEL_MONEY' | 'CARD' | 'INSURANCE' | 'CASH';

export interface Profile {
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  [key: string]: any;
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  isVerified: boolean;
  pharmacyStatus?: PharmacyStatus;
  rejectionReason?: string | null;
  branchStatus?: BranchStatus;
  requiresPasswordChange?: boolean;
  profile?: Profile;
}

export interface Medication {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
  requiresPrescription: boolean;
  category: string;
  description?: string;
  quantity: number;
  pharmacy?: Pharmacy;
  branchId?: string;
}

export interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  medication: Medication;
}

export interface Pharmacy {
  id: string;
  name: string;
  address: string;
  phone: string;
  logoUrl?: string;
  latitude?: number;
  longitude?: number;
  medications: Medication[];
}

export interface Branch {
  id: string;
  name: string;
  address?: string;
  branchStatus: BranchStatus;
}

export interface Order {
  id: string;
  status: OrderStatus;
  type: OrderType;
  total: number;
  paymentMethod: PaymentMethod;
  deliveryAddress?: string;
  items: OrderItem[];
  orderItems: OrderItem[]; // Some endpoints use orderItems instead of items
  patient: {
    firstName: string;
    lastName: string;
    [key: string]: any;
  };
  pharmacy: Pharmacy;
  branch?: Branch;
  prescription?: {
    id: string;
    status: string;
    fileUrl?: string;
  } | null;
  createdAt: string;
  [key: string]: any;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page?: number;
  limit?: number;
}

export interface DecodedToken {
  sub: string;
  email: string;
  role: UserRole;
  isVerified?: boolean;
  pharmacyStatus?: PharmacyStatus;
  branchStatus?: BranchStatus;
  iat: number;
  exp: number;
}
