// frontend/src/app/pharmacy/patients/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import api from '@/lib/api';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import PharmacyTopbar from '@/components/pharmacy/PharmacyTopbar';
import PharmacySidebar from '@/components/pharmacy/PharmacySidebar';
import SupportBot from '@/components/pharmacy/SupportBot';
import { 
  UserGroupIcon,
  MagnifyingGlassIcon,
  ShoppingBagIcon,
  CurrencyDollarIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';

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
      setPatients(res.data.patients);
      setTotalPatients(res.data.totalPatients);
    } catch (error) {
      console.error('Failed to fetch patients:', error);
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

  return (
    <div className="flex min-h-screen bg-gray-50">
      <PharmacySidebar />
      <SupportBot />

      <div className="flex-1 flex flex-col lg:ml-72">
        <PharmacyTopbar />

        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="bg-linear-to-r from-[#1E4D8C] via-[#2563a8] to-[#1a3d6f] rounded-2xl shadow-lg p-6 lg:p-8 text-white">
              <h1 className="text-2xl lg:text-3xl font-bold mb-2">
                Patients
              </h1>
              <p className="text-blue-100 text-sm lg:text-base">
                View all patients who have ordered from your pharmacy
              </p>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Patients</p>
                    <p className="text-3xl font-bold text-gray-900">{totalPatients}</p>
                  </div>
                  <UserGroupIcon className="w-12 h-12 text-teal-600" />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Orders</p>
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
                    <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
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
                  placeholder="Search patients by name, email, or phone..."
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
                  {searchTerm ? 'No patients found' : 'No patients yet'}
                </p>
                <p className="text-gray-400 text-sm">
                  {searchTerm ? 'Try a different search term' : 'Patients will appear here after their first order'}
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
                          <p className="text-sm text-teal-100 mb-1">Total Spent</p>
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
                        <p className="text-sm text-gray-600">Orders</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">
                          {Math.round(patient.totalSpent / patient.totalOrders).toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600">Avg Order (RWF)</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-900 font-medium">
                          {new Date(patient.lastOrderDate).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-600">Last Order</p>
                      </div>
                    </div>

                    {/* Order History */}
                    <div className="p-6">
                      <button
                        onClick={() => setSelectedPatient(selectedPatient?.id === patient.id ? null : patient)}
                        className="w-full text-left flex items-center justify-between text-gray-900 font-medium mb-4"
                      >
                        <span>Order History ({patient.orders.length})</span>
                        <span className="text-teal-600">
                          {selectedPatient?.id === patient.id ? '▼' : '▶'}
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
                                    {order.itemCount} item(s)
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
        </main>
      </div>
    </div>
  );
}