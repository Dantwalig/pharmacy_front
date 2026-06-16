

export interface InventoryItem {
  id: string;
  name: string;
  category: 'Drug' | 'Supply' | 'Equipment';
  availableQuantity: number;
  unit: string;
  reorderLimit: number;
  expiryDate?: string;
  status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
  safetyStatus: 'SAFE' | 'EXPIRED' | 'EXPIRING';
  expiringInDays?: number;
}

export const MOCK_INVENTORY: InventoryItem[] = [
  {
    id: '1',
    name: 'Amoxicillin 500mg',
    category: 'Drug',
    availableQuantity: 45,
    unit: 'units',
    reorderLimit: 100,
    expiryDate: '2026-09-13',
    status: 'LOW_STOCK',
    safetyStatus: 'SAFE',
  },
  {
    id: '2',
    name: 'Ibuprofen 400mg',
    category: 'Drug',
    availableQuantity: 218,
    unit: 'units',
    reorderLimit: 50,
    expiryDate: '2027-02-15',
    status: 'IN_STOCK',
    safetyStatus: 'SAFE',
  },
  {
    id: '3',
    name: 'Lisinopril 10mg',
    category: 'Drug',
    availableQuantity: 12,
    unit: 'units',
    reorderLimit: 20,
    expiryDate: '2026-06-25',
    status: 'LOW_STOCK',
    safetyStatus: 'EXPIRING',
    expiringInDays: 36,
  },
  {
    id: '4',
    name: 'Surgical Sterile Gloves',
    category: 'Supply',
    availableQuantity: 850,
    unit: 'units',
    reorderLimit: 200,
    expiryDate: '2029-10-30',
    status: 'IN_STOCK',
    safetyStatus: 'SAFE',
  },
  {
    id: '5',
    name: 'N95 Respirator Masks',
    category: 'Supply',
    availableQuantity: 80,
    unit: 'units',
    reorderLimit: 150,
    expiryDate: '2026-06-10',
    status: 'LOW_STOCK',
    safetyStatus: 'EXPIRED',
  },
  {
    id: '6',
    name: 'ECG Patient Monitor',
    category: 'Equipment',
    availableQuantity: 6,
    unit: 'units',
    reorderLimit: 2,
    status: 'IN_STOCK',
    safetyStatus: 'SAFE',
  },
  {
    id: '7',
    name: 'Automated Defibrillator',
    category: 'Equipment',
    availableQuantity: 1,
    unit: 'unit',
    reorderLimit: 2,
    status: 'LOW_STOCK',
    safetyStatus: 'SAFE',
  },
  {
    id: '8',
    name: 'Surgical Syringes 5ml',
    category: 'Supply',
    availableQuantity: 150,
    unit: 'units',
    reorderLimit: 300,
    expiryDate: '2027-08-22',
    status: 'LOW_STOCK',
    safetyStatus: 'SAFE',
  },
  {
    id: '9',
    name: 'Paracetamol 500mg',
    category: 'Drug',
    availableQuantity: 1550,
    unit: 'units',
    reorderLimit: 200,
    expiryDate: '2028-11-01',
    status: 'IN_STOCK',
    safetyStatus: 'SAFE',
  },
  {
    id: '10',
    name: 'Insulin Glargine Vials',
    category: 'Drug',
    availableQuantity: 8,
    unit: 'units',
    reorderLimit: 15,
    expiryDate: '2026-05-05',
    status: 'LOW_STOCK',
    safetyStatus: 'EXPIRED',
  },
  {
    id: '11',
    name: 'Oxygen Concentrator Mobile',
    category: 'Equipment',
    availableQuantity: 12,
    unit: 'units',
    reorderLimit: 3,
    status: 'IN_STOCK',
    safetyStatus: 'SAFE',
  },
  {
    id: '12',
    name: 'IV Catheters 18G',
    category: 'Supply',
    availableQuantity: 90,
    unit: 'units',
    reorderLimit: 100,
    expiryDate: '2026-07-20',
    status: 'LOW_STOCK',
    safetyStatus: 'SAFE',
  },
];
