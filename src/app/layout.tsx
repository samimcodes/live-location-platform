import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ReduxProvider } from '@/components/ReduxProvider';
import { QueryProvider } from '@/components/QueryProvider';
import { SocketProvider } from '@/components/SocketProvider';
import { AuthInitializer } from '@/components/AuthInitializer';
import { Toaster } from 'sonner';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'LocaLink — Live Location Sharing',
  description: 'Share your real-time location with family and friends, stay safe together.',
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <ReduxProvider>
          <QueryProvider>
            <SocketProvider>
              <AuthInitializer />
              {children}
              <Toaster position="top-right" richColors />
            </SocketProvider>
          </QueryProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
