'use client';

import React, { useEffect, useState, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { 
  Heart, 
  Activity, 
  Thermometer, 
  Scale, 
  Droplet, 
  Calendar, 
  User, 
  ArrowLeft, 
  ShieldAlert, 
  Clock, 
  Loader2, 
  VideoOff, 
  MicOff 
} from 'lucide-react';
import axios from 'axios';

// Resolve backend API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

interface TriageVitals {
  bloodPressure: string;
  temperature: number;
  weight: number;
  heartRate: number;
  oxygenSaturation: number;
  nurseNotes?: string;
}

interface RoomConfig {
  roomName: string;
  domain: string;
  jitsiUrl: string;
  appointmentId: string;
  doctorName: string;
  patientName: string;
  appointmentType: string;
  triageVitals?: TriageVitals;
  reason?: string;
}

interface PageProps {
  params: Promise<{ id: string }> | { id: string };
}

export default function TelemedicineRoomPage({ params }: PageProps) {
  const router = useRouter();
  const resolvedParams = params instanceof Promise ? use(params) : params;
  const appointmentId = resolvedParams.id;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<RoomConfig | null>(null);
  
  // Simulation states
  const [simulatedRole, setSimulatedRole] = useState<'DOCTOR' | 'PATIENT'>('DOCTOR');
  const [isJoined, setIsJoined] = useState(false);
  const [simulatedUserId, setSimulatedUserId] = useState<string>('');
  const [isSimulatorCollapsed, setIsSimulatorCollapsed] = useState(false);

  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  const jitsiApiRef = useRef<any>(null);

  // Read current user profile or fallback to simulation parameters
  useEffect(() => {
    const userCookie = Cookies.get('user');
    const userRole = Cookies.get('userRole');
    if (userCookie && userRole) {
      try {
        const user = JSON.parse(userCookie);
        setSimulatedUserId(user.id || 'usr-test-01');
        setSimulatedRole(userRole === 'PATIENT' ? 'PATIENT' : 'DOCTOR');
      } catch (e) {
        console.error('Failed to parse user cookie', e);
        setSimulatedUserId('usr-test-01');
      }
    } else {
      // Default fallback for public testing
      setSimulatedUserId(simulatedRole === 'DOCTOR' ? 'doc-sim-01' : 'pat-sim-01');
    }
  }, [simulatedRole]);

  // Fetch room configuration from backend
  useEffect(() => {
    if (!appointmentId) return;

    const fetchRoomConfig = async () => {
      try {
        setLoading(true);
        // Request backend room configurations (using axios directly or fetch to handle unauthenticated test case)
        const response = await axios.get(`${API_URL}/appointments/${appointmentId}/telemedicine-room`, {
          withCredentials: true
        });
        setConfig(response.data);
        setError(null);
      } catch (err: any) {
        console.error('Failed to fetch room configs', err);
        setError(err.response?.data?.message || 'Failed to load consultation room configurations.');
      } finally {
        setLoading(false);
      }
    };

    fetchRoomConfig();
  }, [appointmentId]);

  // Load Jitsi script and initialize
  useEffect(() => {
    if (!config || !appointmentId) return;

    const script = document.createElement('script');
    script.src = 'https://meet.jit.si/external_api.js';
    script.async = true;
    script.onload = () => {
      initJitsiMeet();
    };
    script.onerror = () => {
      setError('Failed to load Jitsi external script. Check internet connectivity.');
    };
    document.body.appendChild(script);

    return () => {
      if (jitsiApiRef.current) {
        jitsiApiRef.current.dispose();
      }
      document.body.removeChild(script);
    };
  }, [config, appointmentId]);

  const initJitsiMeet = () => {
    if (!config || !jitsiContainerRef.current) return;

    try {
      const domain = config.domain || 'meet.jit.si';
      const options = {
        roomName: config.roomName,
        width: '100%',
        height: '100%',
        parentNode: jitsiContainerRef.current,
        interfaceConfigOverwrite: {
          TOOLBAR_BUTTONS: [
            'microphone', 'camera', 'closedcaptions', 'desktop', 'embedmeeting', 'fullscreen',
            'fodeviceselection', 'hangup', 'profile', 'chat', 'recording',
            'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
            'videoquality', 'filmstrip', 'invite', 'feedback', 'stats', 'shortcuts',
            'tileview', 'videobackgroundblur', 'download', 'help', 'mute-everyone',
            'security'
          ],
        },
        configOverwrite: {
          startWithAudioMuted: false,
          startWithVideoMuted: false,
        },
        userInfo: {
          displayName: simulatedRole === 'DOCTOR' ? config.doctorName : config.patientName,
        }
      };

      const api = new (window as any).JitsiMeetExternalAPI(domain, options);
      jitsiApiRef.current = api;

      // Telemetry log hooks
      api.addEventListener('videoConferenceJoined', () => {
        setIsJoined(true);
        triggerTelemetry('JOIN');
      });

      api.addEventListener('videoConferenceLeft', () => {
        setIsJoined(false);
        triggerTelemetry('LEAVE');
      });

    } catch (e) {
      console.error('Failed to instantiate Jitsi Meet', e);
    }
  };

  const triggerTelemetry = async (action: 'JOIN' | 'LEAVE') => {
    try {
      await axios.post(`${API_URL}/appointments/${appointmentId}/consultation-session`, {
        userId: simulatedUserId,
        role: simulatedRole,
        action: action
      });
      console.log(`📡 Telemetry log dispatched: ${simulatedRole} -> ${action}`);
    } catch (e) {
      console.error('Failed to log telemetry connection event', e);
    }
  };

  // Helper to trigger simulated telemetry manually
  const simulateEvent = async (action: 'JOIN' | 'LEAVE') => {
    setIsJoined(action === 'JOIN');
    await triggerTelemetry(action);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white gap-4">
        <Loader2 className="animate-spin text-teal-400" size={48} />
        <p className="text-slate-400 text-sm animate-pulse">Initializing Telemedicine Consultation Session...</p>
      </div>
    );
  }

  if (error || !config) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white p-6">
        <div className="bg-slate-900 border border-red-500/20 p-8 rounded-2xl max-w-md w-full text-center shadow-xl shadow-red-500/5">
          <ShieldAlert className="mx-auto text-red-500 mb-4" size={48} />
          <h2 className="text-xl font-bold text-slate-100 mb-2">Failed to Enter Consultation</h2>
          <p className="text-slate-400 text-sm mb-6">{error || 'Appointment data is unavailable.'}</p>
          <button 
            onClick={() => router.push('/hospital/doctor/appointments')}
            className="flex items-center justify-center gap-2 w-full py-3 bg-red-600 hover:bg-red-500 rounded-xl font-medium transition-all"
          >
            <ArrowLeft size={16} /> Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Video Stream Main Area */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Header Bar */}
        <header className="h-16 border-b border-slate-900 px-6 flex items-center justify-between shrink-0 bg-slate-950/80 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.back()} 
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded-xl transition-all"
              aria-label="Back"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                Consultation Room
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping inline-block" />
              </h1>
              <p className="text-xs text-slate-500">ID: {appointmentId.slice(0, 8)}...</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <span className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-full text-slate-400 flex items-center gap-1.5">
              <Clock size={14} className="text-teal-400" />
              <span>Doctor-Centric Billing</span>
            </span>
          </div>
        </header>

        {/* Video Containment area */}
        <div className="flex-1 bg-slate-900/50 p-4 relative flex items-center justify-center">
          <div 
            ref={jitsiContainerRef} 
            className="w-full h-full rounded-2xl overflow-hidden shadow-2xl border border-slate-900 bg-slate-950 relative"
          >
            {/* Fallback frame before local connection joins */}
            {!isJoined && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 text-slate-400 z-10 p-6 text-center">
                <VideoOff size={48} className="text-slate-600 mb-3 animate-pulse" />
                <h3 className="text-lg font-medium text-slate-300">Ready to Connect</h3>
                <p className="text-sm text-slate-500 max-w-sm mt-1 mb-4">
                  Please grant camera & microphone permissions when Jitsi loads inside the container.
                </p>
                <button
                  onClick={() => simulateEvent('JOIN')}
                  className="px-6 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-teal-600/20 text-sm"
                >
                  Join Meeting Call
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Simulation Controls for testing without active logins */}
        <div className={`absolute bottom-6 left-6 z-20 bg-slate-950/95 border border-slate-800/80 p-4 rounded-2xl backdrop-blur-lg shadow-xl transition-all duration-300 ${isSimulatorCollapsed ? 'w-48' : 'max-w-sm w-[calc(100%-3rem)]'} flex flex-col gap-3`}>
          <div className="flex justify-between items-center border-b border-slate-900 pb-2 gap-4">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider truncate">
              {isSimulatorCollapsed ? 'Simulator' : 'Test Simulator (Bypassed Auth)'}
            </p>
            <div className="flex items-center gap-2 shrink-0">
              <span className={`w-2 h-2 rounded-full ${isJoined ? 'bg-emerald-500' : 'bg-red-500'}`} />
              <button 
                onClick={() => setIsSimulatorCollapsed(!isSimulatorCollapsed)} 
                className="text-[10px] text-teal-400 hover:text-teal-300 hover:underline focus:outline-none"
              >
                {isSimulatorCollapsed ? 'Expand' : 'Collapse'}
              </button>
            </div>
          </div>

          {!isSimulatorCollapsed && (
            <>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label className="text-[10px] text-slate-500 block mb-1">Simulate Caller Role</label>
                  <select 
                    value={simulatedRole} 
                    onChange={(e) => setSimulatedRole(e.target.value as any)}
                    className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 w-full focus:outline-none focus:ring-1 focus:ring-teal-500"
                  >
                    <option value="DOCTOR">Doctor (Tracks Call Time)</option>
                    <option value="PATIENT">Patient</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="text-[10px] text-slate-500 block mb-1">Simulated User ID</label>
                  <input 
                    type="text" 
                    value={simulatedUserId}
                    readOnly
                    className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-400 w-full focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button 
                  disabled={isJoined}
                  onClick={() => simulateEvent('JOIN')}
                  className="flex-1 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 disabled:opacity-40 disabled:hover:bg-emerald-600/20 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs font-medium transition-all"
                >
                  Simulate JOIN Hook
                </button>
                <button 
                  disabled={!isJoined}
                  onClick={() => simulateEvent('LEAVE')}
                  className="flex-1 py-2 bg-rose-600/20 hover:bg-rose-600/30 disabled:opacity-40 disabled:hover:bg-rose-600/20 border border-rose-500/20 rounded-xl text-rose-400 text-xs font-medium transition-all"
                >
                  Simulate LEAVE Hook
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Clinical Glassmorphism Sidebar (Drawer for Vitals & Diagnosis) */}
      <aside className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-slate-900 flex flex-col bg-slate-950 shrink-0 overflow-y-auto">
        <div className="p-6 border-b border-slate-900">
          <h2 className="font-bold text-base text-slate-100">Consultation File</h2>
          <p className="text-xs text-slate-500">Real-time clinical references</p>
        </div>

        {/* Patient Overview */}
        <div className="p-6 border-b border-slate-900 space-y-4">
          <div className="flex items-center gap-3 bg-slate-900/40 border border-slate-900 p-3.5 rounded-xl">
            <div className="w-10 h-10 rounded-full bg-teal-500/10 flex items-center justify-center text-teal-400">
              <User size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-200">{config.patientName}</p>
              <p className="text-[11px] text-slate-500 uppercase tracking-wider">Patient</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-900/40 border border-slate-900 p-3.5 rounded-xl">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
              <Calendar size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-200">{config.doctorName}</p>
              <p className="text-[11px] text-slate-500 uppercase tracking-wider">Assigned Clinician</p>
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-slate-500 font-medium">Reason for Consultation</p>
            <p className="text-sm bg-slate-900/30 p-3 rounded-lg text-slate-300 italic border border-slate-900">
              "{config.reason || 'No description provided.'}"
            </p>
          </div>
        </div>

        {/* Vitals Summary Card Grid */}
        <div className="p-6 space-y-5">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Triage Vitals</h3>

          {config.triageVitals ? (
            <div className="grid grid-cols-2 gap-3.5">
              {/* BP */}
              <div className="bg-slate-900/30 border border-slate-900 p-3.5 rounded-xl flex flex-col gap-1">
                <div className="text-rose-400 flex items-center gap-1.5">
                  <Activity size={16} />
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Blood Press.</span>
                </div>
                <span className="text-base font-bold text-slate-100 mt-1">{config.triageVitals.bloodPressure}</span>
                <span className="text-[9px] text-slate-500">mmHg</span>
              </div>

              {/* Temp */}
              <div className="bg-slate-900/30 border border-slate-900 p-3.5 rounded-xl flex flex-col gap-1">
                <div className="text-amber-400 flex items-center gap-1.5">
                  <Thermometer size={16} />
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Temperature</span>
                </div>
                <span className="text-base font-bold text-slate-100 mt-1">{config.triageVitals.temperature}</span>
                <span className="text-[9px] text-slate-500">°C</span>
              </div>

              {/* Heart Rate */}
              <div className="bg-slate-900/30 border border-slate-900 p-3.5 rounded-xl flex flex-col gap-1">
                <div className="text-emerald-400 flex items-center gap-1.5">
                  <Heart size={16} />
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Pulse Rate</span>
                </div>
                <span className="text-base font-bold text-slate-100 mt-1">{config.triageVitals.heartRate}</span>
                <span className="text-[9px] text-slate-500">bpm</span>
              </div>

              {/* SpO2 */}
              <div className="bg-slate-900/30 border border-slate-900 p-3.5 rounded-xl flex flex-col gap-1">
                <div className="text-blue-400 flex items-center gap-1.5">
                  <Droplet size={16} />
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Oxygen Sat.</span>
                </div>
                <span className="text-base font-bold text-slate-100 mt-1">{config.triageVitals.oxygenSaturation}</span>
                <span className="text-[9px] text-slate-500">% SpO2</span>
              </div>

              {/* Weight span-2 */}
              <div className="col-span-2 bg-slate-900/30 border border-slate-900 p-3.5 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-indigo-400">
                  <Scale size={18} />
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Recorded Weight</span>
                </div>
                <span className="text-base font-bold text-indigo-200">{config.triageVitals.weight} <span className="text-[10px] text-slate-500 font-normal">kg</span></span>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/20 border border-dashed border-slate-900 p-6 rounded-xl text-center">
              <p className="text-xs text-slate-500">No triage vitals recorded for this session.</p>
            </div>
          )}

          {config.triageVitals?.nurseNotes && (
            <div className="space-y-1.5 mt-4">
              <p className="text-xs text-slate-500 font-medium">Triage Nurse Comments</p>
              <div className="p-3 bg-slate-900/40 border border-slate-900 rounded-lg text-xs text-slate-400 leading-relaxed">
                {config.triageVitals.nurseNotes}
              </div>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
