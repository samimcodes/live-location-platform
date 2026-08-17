import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
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
    // suppressHydrationWarning is required for next-themes:
    // ThemeProvider injects `style={{color-scheme:…}}` on the <html> tag
    // client-side, which doesn't match the server-rendered HTML.
    // This prop tells React to ignore that specific attribute mismatch.
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ReduxProvider>
          <QueryProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
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
