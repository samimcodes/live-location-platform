'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Home, RefreshCw, Shield, AlertTriangle } from 'lucide-react';

export default function Error({
  _error,
  reset,
}: {
  _error?: Error & { digest?: string };
  reset: () => void;
}) {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = () => {
    setIsRetrying(true);
    setTimeout(() => {
      reset();
      setIsRetrying(false);
    }, 500);
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-between bg-[#080B16] text-white px-4 sm:px-6 relative overflow-hidden font-sans py-8">
      
      {/* Ambient Glows */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[500px] bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* ── TOP BAR ── */}
      <div className="w-full max-w-6xl flex items-center justify-between z-10 px-2 sm:px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            LocaLink
          </span>
        </Link>
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-full text-xs font-semibold text-purple-300">
          <AlertTriangle size={12} className="text-amber-400" />
          <span>Application Error</span>
        </div>
      </div>

      {/* ── CENTER CONTENT ── */}
      <div className="flex flex-col items-center justify-center text-center my-auto py-8 sm:py-12 z-10 max-w-lg w-full">
        <div className="h-16 w-16 rounded-3xl bg-gradient-to-tr from-rose-600/80 to-purple-600/80 border border-purple-400/40 shadow-xl flex items-center justify-center text-white mb-6 animate-pulse">
          <AlertTriangle size={32} className="text-white" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-3">
          Something went wrong
        </h1>

        <p className="text-sm text-slate-300/80 max-w-sm mx-auto leading-relaxed mb-8">
          A temporary error occurred while processing your request. You can attempt to reload the view.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full">
          <button
            type="button"
            onClick={handleRetry}
            disabled={isRetrying}
            className="w-full sm:w-auto h-11 px-6 font-bold text-sm rounded-full bg-gradient-to-r from-[#8B5CF6] via-[#7C3AED] to-[#6366F1] hover:from-[#7C3AED] hover:to-[#4F46E5] text-white shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer border border-white/20 disabled:opacity-75"
          >
            <RefreshCw size={15} className={isRetrying ? 'animate-spin' : ''} />
            {isRetrying ? 'Reconnecting...' : 'Try Again'}
          </button>

          <Link
            href="/"
            className="w-full sm:w-auto h-11 px-6 font-bold text-sm rounded-full bg-slate-900/60 hover:bg-white/10 border border-white/20 text-white transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Home size={15} className="text-purple-300" />
            Go Home
          </Link>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <div className="w-full max-w-md pt-4 pb-2 border-t border-white/10 flex items-center justify-center gap-2 text-xs text-white/50 font-medium">
        <Shield size={13} className="text-purple-400" />
        <span>LocaLink System • Protected</span>
      </div>

    </div>
  );
}
