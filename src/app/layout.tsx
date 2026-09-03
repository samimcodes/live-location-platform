import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { ReduxProvider } from '@/components/ReduxProvider';
import { QueryProvider } from '@/components/QueryProvider';
import { SocketProvider } from '@/components/SocketProvider';
import { AuthInitializer } from '@/components/AuthInitializer';
import { Toaster } from 'sonner';

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: '--font-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'LocaLink — Real-Time Family & Friends GPS Platform',
  description: 'Share your real-time location with family and friends, stay safe together with smart geofencing, route history, and emergency alerts.',
  icons: { icon: '/favicon.ico' },
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // suppressHydrationWarning prevents React from warning about the
    // `style` and `class` attributes that ThemeProvider sets on <html>
    // client-side (they differ from the server-rendered HTML).
    <html
      lang="en"
      className={`${plusJakartaSans.variable} ${geistMono.variable} font-sans h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans">
        <ReduxProvider>
          <QueryProvider>
            <ThemeProvider
              defaultTheme="system"
              disableTransitionOnChange
            >
              <SocketProvider>
                <AuthInitializer />
                {children}
                <Toaster position="top-right" richColors />
              </SocketProvider>
            </ThemeProvider>
          </QueryProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
