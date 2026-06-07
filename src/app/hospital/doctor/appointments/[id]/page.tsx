'use client';

import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { MOCK_APPOINTMENTS } from '@/mock/hospital/appointments';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function AppointmentDetailsStubPage() {
  const { t } = useTranslation();

  const params = useParams<{ id: string }>();

  const appointment = MOCK_APPOINTMENTS.find(
    (a) => a.id === params.id
  );

  const patientFullName =
    appointment?.patientName ??
    t('hospital.unknownPatient', 'Unknown Patient');

  return (
    <div className="max-w-xl mx-auto space-y-6 p-4 lg:p-6">
      <Link href="/hospital/doctor/appointments" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors">
        <ArrowLeftIcon className="w-4 h-4" />
        {t('hospital.backToAppointments', 'Back to Appointments')}
      </Link>
      
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
        <div>
          <span className="text-[10px] font-bold tracking-widest text-blue-600 uppercase bg-blue-50 px-2 py-1 rounded-md">
            {t('hospital.detailCardHeader', 'Appointment Profile Reference')}
          </span>
          <h1 className="text-2xl font-extrabold text-gray-900 mt-2">{t('hospital.appointmentDetailsTitle', 'Appointment Details')}</h1>
          <p className="text-xs text-gray-400 mt-0.5">ID Ref: {params.id}</p>
        </div>
        
        <div className="border-t border-gray-100 pt-4 space-y-3 text-sm">
          <div className="flex justify-between py-1 border-b border-gray-50">
            <span className="text-gray-500">{t('hospital.lblPatientName', 'Patient Name')}:</span>
            <span className="font-semibold text-gray-900">{patientFullName}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-gray-50">
            <span className="text-gray-500">{t('hospital.lblCondition', 'Condition / Specialty')}:</span>
            <span className="text-gray-800">{appointment?.reason || appointment?.specialization || 'N/A'}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-gray-50">
            <span className="text-gray-500">{t('hospital.lblType', 'Interaction Type')}:</span>
            <span className="text-gray-800 capitalize">{appointment?.type?.toLowerCase() || 'In-Person'}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-gray-500">{t('hospital.lblStatus', 'Current Status Mapping')}:</span>
            <span className="font-medium text-blue-600">{appointment?.status}</span>
          </div>
        </div>
      </div>
    </div>
  );
}