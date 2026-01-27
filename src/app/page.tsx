// frontend/src/app/page.tsx - Landing Page

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user) {
        // Redirect based on role
        switch (user.role) {
          case 'PATIENT':
            router.push('/patient/dashboard');
            break;
          case 'PHARMACY':
            router.push('/pharmacy/dashboard');
            break;
          case 'SUPER_ADMIN':
            router.push('/super-admin/dashboard');
            break;
          default:
            router.push('/login');
        }
      } else {
        router.push('/login');
      }
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-600 via-indigo-600 to-blue-600 flex items-center justify-center relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Content */}
      <div className="text-center relative z-10 px-4">
        {/* Logo */}
        <div className="mb-8 animate-bounce">
          <span className="text-9xl">🏥</span>
        </div>

        {/* Title */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-white mb-6 drop-shadow-2xl">
          E-Vuze
        </h1>
        <p className="text-2xl sm:text-3xl text-white/90 mb-8 drop-shadow-xl">
          Healthcare Platform
        </p>

        {/* Loading Spinner */}
        <div className="flex items-center justify-center gap-4">
          <div className="relative">
            <div className="w-20 h-20 border-8 border-white/30 rounded-full"></div>
            <div className="absolute top-0 left-0 w-20 h-20 border-8 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>

        <p className="mt-8 text-white/80 text-lg animate-pulse">
          Loading your dashboard...
        </p>
      </div>

      {/* Footer */}
      <div className="absolute bottom-4 left-0 right-0 text-center text-white/60 text-sm">
        © 2025 E-Vuze Healthcare Platform. All rights reserved.
      </div>
    </div>
  );
}