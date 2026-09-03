'use client';

import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen w-full flex flex-col items-center justify-center bg-[#0F172A] text-white px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="h-20 w-20 rounded-2xl bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center mx-auto shadow-xl">
            <AlertTriangle size={42} />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              System Critical Crash
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed">
              A root layout error occurred. You can attempt to reload the application.
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <Button
              onClick={() => reset()}
              className="h-11 px-6 font-bold text-sm rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white shadow-lg"
            >
              <RefreshCw size={15} className="mr-2" />
              Reload App
            </Button>
            <Button
              variant="outline"
              onClick={() => window.location.href = '/'}
              className="h-11 px-6 font-bold text-sm rounded-xl border-white/20 text-white hover:bg-white/10"
            >
              <Home size={15} className="mr-2" />
              Go Home
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
}
