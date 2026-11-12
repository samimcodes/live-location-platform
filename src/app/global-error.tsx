'use client';

import React from 'react';

export default function GlobalError({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#080B16] text-white flex flex-col items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full text-center space-y-4 p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl">
          <div className="h-14 w-14 rounded-2xl bg-rose-500/20 text-rose-400 mx-auto flex items-center justify-center text-2xl font-bold">
            ⚠️
          </div>
          <h2 className="text-xl font-bold text-white">Something went wrong</h2>
          <p className="text-xs text-slate-400">
            A critical application error occurred. Click below to reload.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            className="px-5 py-2.5 rounded-full text-xs font-bold bg-violet-600 hover:bg-violet-700 text-white transition-all cursor-pointer shadow-md"
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}

