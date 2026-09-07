import React from 'react';
import Link from 'next/link';
import { Home, Map, ArrowRight, Shield, Compass, Navigation, Radio } from 'lucide-react';

export default function NotFound() {
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

        {/* GPS Pin 1 */}
        <div className="absolute bottom-[20%] left-[8%] sm:left-[12%] flex flex-col items-center">
          <div className="relative flex items-center justify-center">
            <span className="animate-ping absolute w-24 h-12 rounded-full border border-cyan-400 opacity-60 pointer-events-none" style={{ transform: 'rotateX(65deg)' }} />
            <div className="w-20 h-10 rounded-full border-2 border-cyan-500/40 bg-cyan-500/10 pointer-events-none" style={{ transform: 'rotateX(65deg)' }} />
            <div className="absolute -top-7 h-10 w-8 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-t-full flex items-center justify-center shadow-[0_0_20px_#06B6D4] border border-cyan-200">
              <div className="h-3 w-3 rounded-full bg-white shadow-xs" />
            </div>
          </div>
        </div>

        {/* GPS Pin 2 */}
        <div className="absolute bottom-[28%] right-[8%] sm:right-[12%] flex flex-col items-center">
          <div className="relative flex items-center justify-center">
            <span className="animate-ping absolute w-24 h-12 rounded-full border border-pink-500 opacity-60 pointer-events-none" style={{ transform: 'rotateX(65deg)' }} />
            <div className="w-20 h-10 rounded-full border-2 border-pink-500/40 bg-pink-500/10 pointer-events-none" style={{ transform: 'rotateX(65deg)' }} />
            <div className="absolute -top-7 h-10 w-8 bg-gradient-to-br from-pink-400 to-rose-600 rounded-t-full flex items-center justify-center shadow-[0_0_20px_#EC4899] border border-pink-200">
              <div className="h-3 w-3 rounded-full bg-white shadow-xs" />
            </div>
          </div>
        </div>
      </div>

      {/* ── TOP NAV BAR ── */}
      <div className="w-full max-w-6xl flex items-center justify-between z-10 px-2 sm:px-4">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/30 group-hover:scale-105 transition-transform">
            <Navigation size={18} className="fill-white/20" />
          </div>
          <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            LocaLink
          </span>
        </Link>

        <div className="flex items-center gap-2 bg-white/5 border border-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-semibold text-purple-300">
          <Radio size={12} className="text-pink-400 animate-pulse" />
          <span>Error 404 • Signal Lost</span>
        </div>
      </div>

      {/* ── CENTER HERO CONTENT ── */}
      <div className="flex flex-col items-center justify-center text-center my-auto py-8 sm:py-12 z-10 max-w-2xl w-full">
        
        {/* Isometric 404 Visual */}
        <div className="relative mb-6 select-none flex items-center justify-center">
          <div className="text-[100px] sm:text-[140px] md:text-[160px] font-black leading-none tracking-tighter bg-gradient-to-b from-white via-slate-200 to-slate-500/40 bg-clip-text text-transparent drop-shadow-[0_20px_40px_rgba(0,0,0,0.8)]">
            404
          </div>

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
            <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-3xl bg-gradient-to-tr from-violet-600/90 to-indigo-600/90 border border-purple-400/40 shadow-[0_0_40px_rgba(168,85,247,0.6)] backdrop-blur-md flex items-center justify-center text-white animate-pulse">
              <Compass size={36} className="text-white" />
            </div>
          </div>
        </div>

        {/* Text Details */}
        <div className="space-y-3 px-4">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
            Page <span className="bg-gradient-to-r from-[#A78BFA] via-[#60A5FA] to-[#F472B6] bg-clip-text text-transparent">Not</span> Found
          </h1>

          <p className="text-sm sm:text-base text-slate-300/85 max-w-md mx-auto leading-relaxed font-normal">
            The page you are looking for might have been moved, deleted, or you entered the wrong URL.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-8 w-full max-w-md px-4">
          <Link
            href="/"
            className="w-full sm:w-auto h-12 px-7 font-bold text-sm rounded-full bg-gradient-to-r from-[#8B5CF6] via-[#7C3AED] to-[#6366F1] hover:from-[#7C3AED] hover:to-[#4F46E5] text-white shadow-[0_10px_25px_rgba(124,58,237,0.45)] hover:shadow-[0_14px_35px_rgba(124,58,237,0.6)] transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 cursor-pointer border border-white/20"
          >
            <Home size={16} />
            Go Back Home
            <ArrowRight size={15} />
          </Link>

          <Link
            href="/dashboard/map"
            className="w-full sm:w-auto h-12 px-7 font-bold text-sm rounded-full bg-slate-900/40 hover:bg-white/10 border border-white/20 text-white shadow-md backdrop-blur-md transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Map size={16} className="text-purple-300" />
            View Live Map
          </Link>
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
