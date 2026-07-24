// frontend/src/app/layout.tsx - Root Layout

import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { Toaster } from 'react-hot-toast';
import I18nProvider from '@/components/providers/I18nProvider';
import SentryInit from '@/components/SentryInit';

const inter = Inter({ subsets: ['latin'] });

export const viewport: Viewport = {
  themeColor: '#1E4D8C',
};

export const metadata: Metadata = {
  title: 'E-Vuze Healthcare Hub',
  description: 'Rwanda\'s unified healthcare management system',
  icons: {
    icon: '/E-Vuze Logo.svg',
    apple: '/E-Vuze Logo.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <SentryInit />
        <I18nProvider>
          <AuthProvider>
            <CartProvider>
              {children}
              <Toaster position="top-right" />
            </CartProvider>
          </AuthProvider>
        </I18nProvider>
      </body>
    </html>
  );
}