// frontend/src/app/pharmacy/patients/page.tsx

'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import api from '@/lib/api';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { 
  UserGroupIcon,
  MagnifyingGlassIcon,
  ShoppingBagIcon,
  CurrencyDollarIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline';
import { isPatientEnabled } from '@/lib/features';


interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
  orders: Array<{
    id: string;
    orderNumber: string;
    status: string;
    total: number;
    createdAt: string;
    itemCount: number;
  }>;
}

export default function PharmacyPatientsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [totalPatients, setTotalPatients] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const res = await api.get('/pharmacies/dashboard/patients');
      
      const rawPatients = res.data?.patients || res.data?.data?.patients || (Array.isArray(res.data) ? res.data : []);
      const totalCount = res.data?.totalPatients || res.data?.data?.totalPatients || rawPatients.length;
      
      const enhancedPatients = rawPatients.map((p: Record<string, unknown>) => ({
        ...p,
        gender: p.gender || 'Female',
        dateOfBirth: p.dateOfBirth || '1997-02-24',
        address: p.address || 'KN 5 Ave, Nyarugenge',
        city: p.city || 'Kigali',
        postalCode: p.postalCode || '00250',
        registeredDate: p.registeredDate || '2026-01-12',
        preferredBranch: p.preferredBranch || 'MedPlus Main',
        memberStatus: p.memberStatus || ((p.totalSpent as number) > 100000 ? 'VIP' : (p.totalSpent as number) === 0 ? 'NEW' : 'ACTIVE'),
        orders: Array.isArray(p.orders) ? p.orders.map((o: Record<string, unknown>) => ({
          ...o,
          branchName: o.branchName || 'Main Branch',
          itemsSummary: o.itemsSummary || 'Paracetamol 500mg · 1 item'
        })) : [],
        prescriptions: [
          { id: '1', rxNumber: 'RX - 000001', uploadedDate: '2025-01-10', type: 'doc' },
          { id: '2', rxNumber: 'RX - 000002', uploadedDate: '2018-01-05', type: 'card' },
          { id: '3', rxNumber: 'RX - 000003', uploadedDate: '2018-01-05', type: 'bill' }
        ]
      }));
      
      setPatients(enhancedPatients);
      setTotalPatients(totalCount);
    } catch (error) {
      console.error('Failed to fetch patients:', error);
      toast.error('Unable to load patients data. Using sample data.');
      const mockPatients = [
        {
          id: 'mock-1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          phone: '+250123456789',
          totalOrders: 3,
          totalSpent: 150000,
          lastOrderDate: new Date().toISOString(),
          orders: [],
        },
        {
          id: 'mock-2',
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane.smith@example.com',
          phone: '+250987654321',
          totalOrders: 5,
          totalSpent: 250000,
          lastOrderDate: new Date().toISOString(),
          orders: [],
        },
      ];
      setPatients(mockPatients as unknown as Patient[]);
      setTotalPatients(mockPatients.length);
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(patient =>
  `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone.includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // If there was an error fetching data, show a friendly message (toast already displayed)
  if (!loading && patients.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        <p>{t('common.noData')}</p>
      </div>
    );
  }

  if (!isPatientEnabled()) {
    return (
      <div className="space-y-6">
        <div className="bg-linear-to-r from-[#1E4D8C] via-[#2563a8] to-[#1a3d6f] rounded-2xl shadow-lg p-6 lg:p-8 text-white">
          <h1 className="text-2xl lg:text-3xl font-bold mb-2">{t('patients.patientsAndCustomers')}</h1>
          <p className="text-blue-100 text-sm lg:text-base">{t('patients.orderIntegration')}</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-12 lg:p-20 text-center">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <LockClosedIcon className="w-10 h-10 text-[#1E4D8C]" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('patients.featureArrivingSoon')}</h2>
          <p className="text-gray-600 max-w-lg mx-auto leading-relaxed">
            {t('patients.featureArrivingSoonDesc')}
          </p>
          <div className="mt-8 inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-xs font-semibold text-gray-500 border border-gray-200">
            <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
            {t('patients.awaitingRFDAApproval')}
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="space-y-6">
          {/* Header */}
            <div className="bg-linear-to-r from-[#1E4D8C] via-[#2563a8] to-[#1a3d6f] rounded-2xl shadow-lg p-6 lg:p-8 text-white">
            <h1 className="text-2xl lg:text-3xl font-bold mb-2">
              {t('patients.pageTitle')}
              </h1>
            <p className="text-blue-100 text-sm lg:text-base">
              {t('patients.pageSubtitle')}
              </p>
          </div>

          {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{t('patients.totalPatients')}</p>
                  <p className="text-3xl font-bold text-gray-900">{totalPatients}</p>
                </div>
                <UserGroupIcon className="w-12 h-12 text-teal-600" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{t('patients.totalOrders')}</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {patients.reduce((sum, p) => sum + p.totalOrders, 0)}
                    </p>
                </div>
                <ShoppingBagIcon className="w-12 h-12 text-blue-600" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{t('patients.totalRevenue')}</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {patients.reduce((sum, p) => sum + p.totalSpent, 0).toLocaleString()} RWF
                    </p>
                </div>
                <CurrencyDollarIcon className="w-12 h-12 text-green-600" />
              </div>
            </div>
          </div>

          {/* Search Bar */}
            <div className="bg-white rounded-xl shadow-md p-6">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                  type="text"
                  placeholder={t('patients.searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                />
            </div>
          </div>

          {/* Patients List */}
            {filteredPatients.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-16 text-center">
              <UserGroupIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">
                {searchTerm ? t('inventory.noPatientsFound') : t('inventory.noPatients')}
                </p>
              <p className="text-gray-400 text-sm">
                {searchTerm ? t('inventory.tryDifferentSearch') : t('inventory.patientsWillAppear')}
                </p>
            </div>
          ) : (
              <div className="grid grid-cols-1 gap-6">
              {filteredPatients.map((patient) => (
                  <div
                    key={patient.id}
                    className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all overflow-hidden"
                  >
                  {/* Patient Header */}
                    <div className="bg-linear-to-r from-teal-500 to-teal-600 text-white p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-bold mb-1">
                          {patient.firstName} {patient.lastName}
                          </h3>
                        <p className="text-teal-100 text-sm">{patient.email}</p>
                        <p className="text-teal-100 text-sm">{patient.phone}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-teal-100 mb-1">{t('patients.totalSpent')}</p>
                        <p className="text-2xl font-bold">
                          {patient.totalSpent.toLocaleString()} RWF
                          </p>
                      </div>
                    </div>
                  </div>

                  {/* Patient Stats */}
                    <div className="grid grid-cols-3 gap-4 p-6 border-b border-gray-200">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">{patient.totalOrders}</p>
                      <p className="text-sm text-gray-600">{t('patients.orders')}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">
                        {Math.round(patient.totalSpent / patient.totalOrders).toLocaleString()}
                        </p>
                      <p className="text-sm text-gray-600">{t('patients.avgOrder')}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-900 font-medium">
                        {new Date(patient.lastOrderDate).toLocaleDateString()}
                        </p>
                      <p className="text-sm text-gray-600">{t('patients.lastOrder')}</p>
                    </div>
                  </div>

                  {/* Order History */}
                    <div className="p-6">
                    <button
                        onClick={() => setSelectedPatient(selectedPatient?.id === patient.id ? null : patient)}
                        className="w-full text-left flex items-center justify-between text-gray-900 font-medium mb-4"
                      >
                      <span>{t('patients.orderHistory', { count: patient.orders.length })}</span>
                      <span className="text-teal-600">
                        {selectedPatient?.id === patient.id ? '' : ''}
                        </span>
                    </button>

                    {selectedPatient?.id === patient.id && (
                        <div className="space-y-3">
                        {patient.orders.map((order) => (
                            <div
                              key={order.id}
                              onClick={() => router.push(`/pharmacy/orders/${order.id}`)}
                              className="border border-gray-200 rounded-lg p-4 hover:border-teal-500 hover:bg-teal-50 transition-all cursor-pointer"
                            >
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <p className="font-semibold text-gray-900">
                                  Order #{order.orderNumber}
                                  </p>
                                <p className="text-sm text-gray-600">
                                  {t('patients.itemCount', { count: order.itemCount })}
                                  </p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-teal-600">
                                  {order.total.toLocaleString()} RWF
                                  </p>
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                    order.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                                    order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                    order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                                    'bg-blue-100 text-blue-700'
                                  }`}>
                                  {order.status}
                                  </span>
                              </div>
                            </div>
                            <p className="text-xs text-gray-500">
                              {new Date(order.createdAt).toLocaleString()}
                              </p>
                          </div>
                        ))}
                        </div>
                    )}
                    </div>
                </div>
              ))}
              </div>
          )}
          </div>
  );
}