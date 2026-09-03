'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Home, RefreshCw, Shield, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { soundFx } from '@/lib/soundFx';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = () => {
    setIsRetrying(true);
    soundFx.playAlert();
    setTimeout(() => {
      reset();
      setIsRetrying(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-between bg-[#080B16] text-white px-4 sm:px-6 relative overflow-hidden selection:bg-purple-500 selection:text-white font-sans py-8">
      
      {/* ── ISOMETRIC MAP TERRAIN & GLOWING PATHS BACKGROUND ── */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden -z-10">
        
        {/* Ambient Glows */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[550px] bg-gradient-to-br from-purple-600/25 via-indigo-600/20 to-pink-600/20 rounded-full blur-[160px]" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-cyan-500/15 rounded-full blur-[140px]" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-pink-500/15 rounded-full blur-[140px]" />

        {/* Isometric Grid Floor Projection */}
        <div 
          className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#3B82F6_1px,transparent_1px),linear-gradient(to_bottom,#3B82F6_1px,transparent_1px)] bg-[size:50px_50px]"
          style={{
            transform: 'perspective(600px) rotateX(60deg) translateY(-40px) scale(2.2)',
            transformOrigin: 'top center',
          }}
        />

        {/* Soft Fluffy Dark Clouds Background */}
        <svg className="absolute inset-0 w-full h-full opacity-40" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="20%" cy="30%" rx="180" ry="90" fill="#1E1642" filter="blur(40px)" />
          <ellipse cx="80%" cy="32%" rx="200" ry="100" fill="#181745" filter="blur(40px)" />
          <ellipse cx="50%" cy="25%" rx="240" ry="110" fill="#201140" filter="blur(45px)" />
        </svg>

        {/* Glowing GPS Pins & Dashed Road Lines in 3D Space */}
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M 120 720 Q 180 560, 110 380"
            fill="none"
            stroke="#06B6D4"
            strokeWidth="3"
            strokeDasharray="8 8"
            className="opacity-75 drop-shadow-[0_0_10px_#06B6D4]"
          />
          <path
            d="M 900 750 Q 880 580, 930 450"
            fill="none"
            stroke="#EC4899"
            strokeWidth="3"
            strokeDasharray="8 8"
            className="opacity-75 drop-shadow-[0_0_10px_#EC4899]"
          />
        </svg>

        {/* GPS Pin Left (Cyan) */}
        <div className="absolute bottom-[20%] left-[8%] sm:left-[12%] flex flex-col items-center">
          <div className="relative flex items-center justify-center">
            <span className="animate-ping absolute w-24 h-12 rounded-full border border-cyan-400 opacity-60 pointer-events-none" style={{ transform: 'rotateX(65deg)' }} />
            <div className="w-20 h-10 rounded-full border-2 border-cyan-500/40 bg-cyan-500/10 pointer-events-none" style={{ transform: 'rotateX(65deg)' }} />
            <motion.div
              animate={{ y: [-4, 4, -4] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-7 h-10 w-8 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-t-full flex items-center justify-center shadow-[0_0_20px_#06B6D4]"
              style={{ clipPath: 'path("M 16 0 C 7 0 0 7 0 16 C 0 26 16 40 16 40 C 16 40 32 26 32 16 C 32 7 25 0 16 0 Z")' }}
            >
              <div className="h-3 w-3 rounded-full bg-white -mt-2" />
            </motion.div>
          </div>
        </div>

        {/* GPS Pin Right (Pink) */}
        <div className="absolute bottom-[28%] right-[8%] sm:right-[12%] flex flex-col items-center">
          <div className="relative flex items-center justify-center">
            <span className="animate-ping absolute w-24 h-12 rounded-full border border-pink-500 opacity-60 pointer-events-none" style={{ transform: 'rotateX(65deg)' }} />
            <div className="w-20 h-10 rounded-full border-2 border-pink-500/40 bg-pink-500/10 pointer-events-none" style={{ transform: 'rotateX(65deg)' }} />
            <motion.div
              animate={{ y: [-4, 4, -4] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-7 h-10 w-8 bg-gradient-to-br from-pink-400 to-rose-600 flex items-center justify-center shadow-[0_0_20px_#EC4899]"
              style={{ clipPath: 'path("M 16 0 C 7 0 0 7 0 16 C 0 26 16 40 16 40 C 16 40 32 26 32 16 C 32 7 25 0 16 0 Z")' }}
            >
              <div className="h-3 w-3 rounded-full bg-white -mt-2" />
            </motion.div>
          </div>
        </div>

      </div>

      {/* ── TOP BRAND PILL ── */}
      <div className="w-full flex justify-center pt-2">
        <Link href="/" className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors text-xs font-semibold px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
          <div className="h-2 w-2 rounded-full bg-rose-400 animate-pulse" />
          <span>LocaLink System Status</span>
        </Link>
      </div>

      {/* ── MAIN ERROR ARTWORK & CONTENT ── */}
      <div className="max-w-xl w-full flex flex-col items-center text-center my-auto py-6 relative z-10">
        
        {/* ── 3D ARTWORK WITH FLOATING ASTRONAUT & SIGNAL SATELLITE ── */}
        <div className="relative flex items-center justify-center mb-6 select-none">
          
          <div className="absolute -bottom-6 w-72 h-16 bg-purple-600/35 rounded-full blur-2xl pointer-events-none" />

          <div className="relative flex items-center justify-center gap-2 sm:gap-4 font-black">
            
            {/* 3D Map Pin with Astronaut */}
            <div className="relative flex flex-col items-center justify-center">
              
              {/* Astronaut speech bubble */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1, y: [-2, 2, -2] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-12 -right-8 sm:-right-12 z-20 px-3 py-1 rounded-full bg-slate-900/90 border border-purple-400/50 text-white text-[11px] font-bold shadow-lg backdrop-blur-md"
              >
                Oops... Signal Lost
                <div className="absolute -bottom-1 left-3 w-2 h-2 bg-slate-900 rotate-45 border-r border-b border-purple-400/50" />
              </motion.div>

              {/* Vector 3D Astronaut */}
              <motion.div
                animate={{ y: [-4, 2, -4] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-16 z-10 flex flex-col items-center"
              >
                <svg width="68" height="68" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-[0_10px_15px_rgba(0,0,0,0.5)]">
                  <rect x="24" y="32" width="14" height="28" rx="6" fill="#8B5CF6" stroke="#C4B5FD" strokeWidth="2" />
                  <rect x="62" y="32" width="14" height="28" rx="6" fill="#8B5CF6" stroke="#C4B5FD" strokeWidth="2" />
                  <circle cx="50" cy="36" r="26" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="3" />
                  <ellipse cx="50" cy="36" rx="19" ry="16" fill="#0F172A" stroke="#818CF8" strokeWidth="2.5" />
                  <path d="M 40 26 Q 54 24 58 32" stroke="#60A5FA" strokeWidth="3" strokeLinecap="round" />
                  <circle cx="43" cy="28" r="2" fill="white" />
                  <path d="M 32 58 C 32 50 68 50 68 58 L 66 74 C 66 76 34 76 34 74 Z" fill="#F1F5F9" stroke="#CBD5E1" strokeWidth="2.5" />
                  <rect x="42" y="58" width="16" height="8" rx="2" fill="#818CF8" />
                  <path d="M 34 72 C 34 82 46 84 50 78" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M 66 72 C 66 82 54 84 50 78" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" />
                  <ellipse cx="38" cy="80" rx="6" ry="4" fill="#64748B" />
                  <ellipse cx="62" cy="80" rx="6" ry="4" fill="#64748B" />
                  <path d="M 32 58 Q 28 66 38 68" stroke="#E2E8F0" strokeWidth="4" strokeLinecap="round" fill="none" />
                  <path d="M 68 58 Q 72 66 62 68" stroke="#E2E8F0" strokeWidth="4" strokeLinecap="round" fill="none" />
                </svg>
              </motion.div>

              {/* 3D Map Pin Body */}
              <motion.div
                animate={{ y: [-3, 3, -3] }}
                transition={{ duration: 4, delay: 0.1, repeat: Infinity, ease: 'easeInOut' }}
                className="relative h-28 w-24 sm:h-36 sm:w-32 lg:h-44 lg:w-36 rounded-t-full bg-gradient-to-b from-[#A855F7] via-[#EC4899] to-[#8B5CF6] flex items-center justify-center shadow-[0_15px_40px_rgba(236,72,153,0.5)] border-2 border-white/40"
                style={{
                  clipPath: 'path("M 72 0 C 32 0 0 32 0 72 C 0 115 72 176 72 176 C 72 176 144 115 144 72 C 144 32 112 0 72 0 Z")',
                  filter: 'drop-shadow(0 15px 30px rgba(217, 70, 239, 0.5))',
                }}
              >
                <div className="h-7 w-7 sm:h-9 sm:w-9 rounded-full bg-white shadow-inner flex items-center justify-center -mt-6">
                  <WifiOff size={16} className="text-pink-600" />
                </div>
              </motion.div>
            </div>

          </div>

        </div>

        {/* ── HEADING & DESCRIPTION ── */}
        <div className="space-y-3 px-4">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
            Signal <span className="bg-gradient-to-r from-[#A78BFA] via-[#60A5FA] to-[#F472B6] bg-clip-text text-transparent">Disrupted</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300/85 max-w-md mx-auto leading-relaxed font-normal">
            A temporary connection hiccup paused your location telemetry. Click below to reconnect your live stream.
          </p>
        </div>

        {/* ── ACTION BUTTONS ── */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-8 w-full max-w-md px-4">
          
          <Button
            size="lg"
            onClick={handleRetry}
            disabled={isRetrying}
            className="w-full sm:w-auto h-12 px-7 font-bold text-sm rounded-full bg-gradient-to-r from-[#8B5CF6] via-[#7C3AED] to-[#6366F1] hover:from-[#7C3AED] hover:to-[#4F46E5] text-white shadow-[0_10px_25px_rgba(124,58,237,0.45)] hover:shadow-[0_14px_35px_rgba(124,58,237,0.6)] transition-all hover:-translate-y-0.5 active:translate-y-0 gap-2 cursor-pointer border border-white/20 disabled:opacity-75"
          >
            <RefreshCw size={16} className={isRetrying ? 'animate-spin' : ''} />
            {isRetrying ? 'Reconnecting...' : 'Reconnect Signal'}
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="w-full sm:w-auto h-12 px-7 font-bold text-sm rounded-full bg-slate-900/40 hover:bg-white/10 border-white/20 text-white shadow-md backdrop-blur-md transition-all hover:-translate-y-0.5 active:translate-y-0 gap-2 cursor-pointer"
            onClick={() => soundFx.playPop()}
            asChild
          >
            <Link href="/">
              <Home size={16} className="text-purple-300" />
              Go Back Home
            </Link>
          </Button>

        </div>

      </div>

      {/* ── FOOTER TRUST BADGE ── */}
      <div className="w-full max-w-md pt-4 pb-2 border-t border-white/10 flex items-center justify-center gap-2 text-xs text-white/50 font-medium">
        <Shield size={13} className="text-purple-400" />
        <span>Your Safety • Our Priority</span>
      </div>

    </div>
  );
}
