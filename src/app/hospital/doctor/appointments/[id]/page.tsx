'use client';

import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { api, unwrapData } from '@/lib/api';
import { Appointment } from '@/types/hospital';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

interface PatientChart {
  vitals?: Record<string, string>;
  allergies?: string[];
  history?: string;
  notes?: string;
  [key: string]: any;
}

export default function AppointmentDetailsStubPage() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [chart, setChart] = useState<PatientChart | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [aptRes, chartRes] = await Promise.all([
          api.get(`/appointments/${params.id}`),
          api.get(`/appointments/${params.id}/patient-chart`).catch(() => ({ data: null }))
        ]);

        if (aptRes.data) {
          setAppointment(aptRes.data.data ?? aptRes.data);
          setChart(chartRes.data?.data ?? chartRes.data ?? null);
        } else {
          setNotFound(true);
        }
      } catch (err) {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    if (params.id) loadData();
  }, [params.id]);

  if (loading) {
    return (
      <div className="max-w-xl mx-auto space-y-6 p-4 lg:p-6 animate-pulse">
        <div className="h-6 w-32 bg-gray-200 rounded"></div>
        <div className="h-48 w-full bg-gray-200 rounded-2xl"></div>
        <div className="h-48 w-full bg-gray-200 rounded-2xl"></div>
      </div>
    );
  }

  if (notFound || !appointment) {
    return (
      <div className="max-w-xl mx-auto p-4 lg:p-6 text-center space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">404 - Appointment Not Found</h2>
        <p className="text-gray-500">The appointment you are looking for does not exist or has been removed.</p>
        <Link href="/hospital/doctor/appointments" className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800">
          <ArrowLeftIcon className="w-4 h-4" /> Go back
        </Link>
      </div>
    );
  }

  const patientFullName = appointment.patientName ?? t('hospital.unknownPatient', 'Unknown Patient');

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
          <p className="text-xs text-gray-400 mt-0.5">{t('hospital.idRef', 'ID Ref')}: {params.id}</p>
        </div>

        <div className="border-t border-gray-100 pt-4 space-y-3 text-sm">
          <div className="flex justify-between py-1 border-b border-gray-50">
            <span className="text-gray-500">{t('hospital.lblPatientName', 'Patient Name')}:</span>
            <span className="font-semibold text-gray-900">{patientFullName}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-gray-50">
            <span className="text-gray-500">{t('hospital.lblCondition', 'Condition / Specialty')}:</span>
            <span className="text-gray-800">{appointment?.reason || appointment?.specialization || t('hospital.notAvailableShort', 'N/A')}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-gray-50">
            <span className="text-gray-500">{t('hospital.lblType', 'Interaction Type')}:</span>
            <span className="text-gray-800 capitalize">{appointment?.type?.toLowerCase() || t('hospital.inPerson', 'In-Person')}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-gray-50">
            <span className="text-gray-500">{t('hospital.lblStatus', 'Current Status Mapping')}:</span>
            <span className="font-medium text-blue-600">{appointment.status}</span>
          </div>
          {appointment.notes && (
            <div className="flex flex-col py-1 border-b border-gray-50">
              <span className="text-gray-500 mb-1">{t('hospital.lblNotes', 'Notes')}:</span>
              <span className="text-gray-800 whitespace-pre-wrap text-xs">{appointment.notes}</span>
            </div>
          )}
        </div>
      </div>

      {chart && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-gray-900">Pre-Consultation Patient Chart</h2>
          <div className="border-t border-gray-100 pt-4 space-y-3 text-sm">
            {chart.vitals && (
              <div className="flex flex-col py-1 text-xs">
                <span className="text-gray-500 mb-1 font-semibold">Vitals:</span>
                <span className="text-gray-800">{JSON.stringify(chart.vitals, null, 2)}</span>
              </div>
            )}
            {chart.allergies && (
              <div className="flex flex-col py-1 text-xs">
                <span className="text-gray-500 mb-1 font-semibold">Allergies:</span>
                <span className="text-gray-800">{chart.allergies.join(', ')}</span>
              </div>
            )}
            {chart.history && (
              <div className="flex flex-col py-1 text-xs">
                <span className="text-gray-500 mb-1 font-semibold">History:</span>
                <span className="text-gray-800 whitespace-pre-wrap">{chart.history}</span>
              </div>
            )}
            {(!chart.vitals && !chart.allergies && !chart.history) && (
              <p className="text-gray-500 italic">No specific chart records found for this appointment.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}