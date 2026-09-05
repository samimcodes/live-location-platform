'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Navigation,
  Sparkles,
  Zap,
  ShieldCheck,
  Battery,
  Lock,
  Radio,
  Car,
  Wifi,
  Compass,
  Users,
  Shield,
  MapPin,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import { soundFx } from '@/lib/soundFx';

interface AuthLeftHeroProps {
  badgeText?: string;
  title?: string;
  gradientTitle?: string;
  subtitle?: string;
}

type RadarMode = 'mesh' | 'vehicle' | 'geofence';

export function AuthLeftHero({
  badgeText = 'NEXT-GEN GPS NETWORK',
  title = 'Stay close to the ones',
  gradientTitle = 'who matter most.',
  subtitle = 'Sign in to access pinpoint live GPS tracking, automated safe zone geofences, and private circle telemetry.',
}: AuthLeftHeroProps) {
  const [activeMode, setActiveMode] = useState<RadarMode>('mesh');
  const [liveSpeed, setLiveSpeed] = useState(52);
  const [satelliteCount, setSatelliteCount] = useState(12);
  const [isPinging, setIsPinging] = useState(false);
  const [livePings, setLivePings] = useState(1482920);

  // Speed and ping counter live increment
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveSpeed((prev) => {
        const jitter = Math.floor(Math.random() * 5) - 2;
        return Math.max(42, Math.min(64, prev + jitter));
      });
      setLivePings((prev) => prev + Math.floor(Math.random() * 4) + 1);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  const handlePing = () => {
    soundFx?.playPing?.();
    setIsPinging(true);
    setSatelliteCount((prev) => (prev >= 14 ? 10 : prev + 1));
    setTimeout(() => setIsPinging(false), 1400);
  };

  const switchMode = (mode: RadarMode) => {
    soundFx?.playPop?.();
    setActiveMode(mode);
  };

  return (
    <div
      className="hidden lg:flex lg:w-[52%] xl:w-[54%] h-full max-h-screen flex-col relative overflow-hidden select-none p-5 xl:p-7 justify-between text-left shrink-0"
      style={{ background: 'linear-gradient(145deg, #060A17 0%, #100D33 50%, #050813 100%)' }}
    >
      {/* ── Ambient Glowing Backlight Nebulas ── */}
      <div
        className="absolute top-[-15%] left-[-10%] w-[55%] h-[55%] rounded-full opacity-35 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)' }}
      />
      <div
        className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full opacity-30 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)' }}
      />
      <div
        className="absolute top-[40%] right-[-5%] w-[40%] h-[40%] rounded-full opacity-20 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #06b6d4 0%, transparent 70%)' }}
      />

      {/* Matrix dot grid */}
      <div
        className="absolute inset-0 opacity-[0.07] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* ══════════════════════════════════════════════════════
          1. TOP LOGO & LIVE SATELLITE STATUS
          ══════════════════════════════════════════════════════ */}
      <div className="relative z-10 flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-2.5 group">
          <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-violet-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-violet-500/25 group-hover:scale-105 transition-transform">
            <Navigation size={17} className="text-white" style={{ transform: 'rotate(-30deg)' }} />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-black text-white tracking-tight leading-none">LocaLink</span>
            <span className="text-[8.5px] font-bold text-violet-400 font-mono tracking-widest uppercase mt-0.5">
              MIL-GRADE GPS MESH
            </span>
          </div>
        </Link>

        {/* Live Satellite Status Pill */}
        <button
          onClick={handlePing}
          className="flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono font-bold text-emerald-300 bg-emerald-950/70 border border-emerald-500/40 backdrop-blur-md shadow-xs hover:bg-emerald-900/60 transition-all cursor-pointer active:scale-95"
          title="Click to Sync Live Satellites"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
          </span>
          <span>{satelliteCount} Sats Locked • 15s</span>
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════
          2. IMPACTFUL HEADLINE & BADGE
          ══════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative z-10 my-1 space-y-1.5"
      >
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-violet-500/40 text-[9.5px] font-mono font-bold text-violet-300 uppercase tracking-widest bg-violet-950/60 shadow-2xs">
          <Sparkles size={10} className="text-cyan-300" />
          <span>{badgeText}</span>
        </div>

        <h1 className="text-2xl xl:text-[28px] font-black text-white leading-[1.15] tracking-tight">
          {title} <br />
          <span className="bg-gradient-to-r from-violet-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">
            {gradientTitle}
          </span>
        </h1>

        <p className="text-slate-300 text-xs leading-relaxed max-w-md font-normal line-clamp-2">
          {subtitle}
        </p>
      </motion.div>

      {/* ══════════════════════════════════════════════════════
          3. MULTI-MODE INTERACTIVE LIVE RADAR HUD
          ══════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="relative z-10 w-full rounded-2xl overflow-hidden border border-cyan-500/30 shadow-[0_20px_50px_rgba(0,0,0,0.7)] bg-[#070D1E]/95 backdrop-blur-xl"
      >
        {/* Radar HUD Mode Switcher Tabs */}
        <div className="px-3 py-1.5 bg-[#0A132C]/90 border-b border-cyan-500/20 flex items-center justify-between">
          <div className="flex items-center gap-1 bg-[#050914] p-0.5 rounded-lg border border-cyan-500/30">
            {[
              { id: 'mesh', label: 'Family Mesh', icon: Users },
              { id: 'vehicle', label: 'Speed HUD', icon: Car },
              { id: 'geofence', label: 'Safe Zone', icon: Shield },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => switchMode(id as RadarMode)}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold transition-all cursor-pointer ${
                  activeMode === id
                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-2xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon size={11} />
                <span>{label}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 text-cyan-300 font-mono text-[9px] font-bold">
            <Radio size={12} className={isPinging ? 'animate-spin text-cyan-200' : 'animate-pulse'} />
            <span className="hidden sm:inline">LIVE SIM</span>
          </div>
        </div>

        {/* Radar Matrix Viewport */}
        <div className="relative aspect-[16/7.5] bg-[#040814] overflow-hidden flex items-center justify-center">
          {/* Cyber Grid */}
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage:
                'linear-gradient(to right, #06B6D4 1px, transparent 1px), linear-gradient(to bottom, #06B6D4 1px, transparent 1px)',
              backgroundSize: '22px 22px',
            }}
          />

          {/* 360-degree radar sweep */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 7, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'conic-gradient(from 0deg at 50% 50%, rgba(6, 182, 212, 0.22) 0deg, rgba(139, 92, 246, 0.05) 60deg, transparent 90deg)',
              borderRadius: '50%',
            }}
          />

          {/* Concentric Radar Rings */}
          <div className="absolute w-[200px] h-[200px] rounded-full border border-cyan-500/20 pointer-events-none" />
          <div className="absolute w-[130px] h-[130px] rounded-full border border-indigo-500/25 pointer-events-none" />
          <div className="absolute w-[65px] h-[65px] rounded-full border border-cyan-400/30 pointer-events-none" />

          {/* ── MODE 1: FAMILY MESH ── */}
          <AnimatePresence mode="wait">
            {activeMode === 'mesh' && (
              <motion.div
                key="mesh"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0"
              >
                {/* Laser Link Lines between Family Nodes */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 460 200">
                  <polygon
                    points="95,55 365,60 235,145"
                    fill="rgba(6, 182, 212, 0.04)"
                    stroke="#06b6d4"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                    opacity="0.85"
                  />
                </svg>

                {/* Dad Node */}
                <div className="absolute top-[28%] left-[21%] -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center">
                  <span className="animate-ping absolute -inset-1 rounded-full bg-violet-400 opacity-60 pointer-events-none" />
                  <div className="h-9 w-9 rounded-full border-2 border-violet-400 overflow-hidden shadow-[0_0_15px_#8B5CF6] bg-slate-900">
                    <Image
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"
                      alt="Dad"
                      width={36}
                      height={36}
                      unoptimized
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="mt-1 px-1.5 py-0.5 rounded-md text-[8.5px] font-mono font-bold bg-[#070C1A]/95 text-violet-300 border border-violet-500/40 shadow-md whitespace-nowrap flex items-center gap-1">
                    <span>Robert • 94% 🔋</span>
                  </div>
                </div>

                {/* Mom Node */}
                <div className="absolute top-[30%] right-[8%] -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center">
                  <span className="animate-ping absolute -inset-1 rounded-full bg-emerald-400 opacity-60 pointer-events-none" />
                  <div className="h-9 w-9 rounded-full border-2 border-emerald-400 overflow-hidden shadow-[0_0_15px_#10B981] bg-slate-900">
                    <Image
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face"
                      alt="Mom"
                      width={36}
                      height={36}
                      unoptimized
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="mt-1 px-1.5 py-0.5 rounded-md text-[8.5px] font-mono font-bold bg-[#070C1A]/95 text-emerald-300 border border-emerald-500/40 shadow-md whitespace-nowrap flex items-center gap-1">
                    <span>Emma • 82% 🔋</span>
                  </div>
                </div>

                {/* Son Node */}
                <div className="absolute bottom-[8%] left-[51%] -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center">
                  <div className="h-8 w-8 rounded-full border-2 border-amber-400 overflow-hidden shadow-[0_0_12px_#F59E0B] bg-slate-900">
                    <Image
                      src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face"
                      alt="Son"
                      width={32}
                      height={32}
                      unoptimized
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="mt-1 px-1.5 py-0.5 rounded-md text-[8px] font-mono font-bold bg-[#070C1A]/95 text-amber-300 border border-amber-500/40 shadow-md whitespace-nowrap">
                    Ayaan • Campus Safe
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── MODE 2: VEHICLE SPEED HUD ── */}
            {activeMode === 'vehicle' && (
              <motion.div
                key="vehicle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-between px-8"
              >
                {/* Route line */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 460 200">
                  <path d="M 40 160 Q 180 40 420 120" stroke="#06b6d4" strokeWidth="2.5" fill="none" strokeDasharray="6 4" opacity="0.8" />
                  <path d="M 40 160 Q 180 40 420 120" stroke="#06b6d4" strokeWidth="12" fill="none" opacity="0.12" />
                </svg>

                {/* Speedometer card */}
                <div className="z-20 p-2.5 rounded-xl bg-[#080E24]/90 border border-cyan-500/40 backdrop-blur-md">
                  <span className="text-[9px] font-mono text-cyan-400 uppercase block font-bold">Speed Telemetry</span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-2xl font-black text-white font-mono">{liveSpeed}</span>
                    <span className="text-[10px] font-mono font-bold text-violet-400">KM/H</span>
                  </div>
                  <span className="text-[8.5px] font-mono text-emerald-400 flex items-center gap-1 mt-0.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                    Smooth Driving • Eco Safe
                  </span>
                </div>

                {/* Moving Vehicle Node */}
                <div className="z-20 flex flex-col items-center">
                  <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center text-white shadow-[0_0_20px_#06B6D4] border border-cyan-300">
                    <Car size={20} className="text-white animate-bounce" />
                  </div>
                  <div className="mt-1 px-2 py-0.5 rounded-md text-[8.5px] font-mono font-bold bg-[#070C1A] text-cyan-300 border border-cyan-500/40 shadow-md">
                    Tesla Model 3 • Heading NW
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── MODE 3: GEOFENCE MONITOR ── */}
            {activeMode === 'geofence' && (
              <motion.div
                key="geofence"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                {/* Geofence Circle Zone */}
                <div className="relative w-[150px] h-[150px] rounded-full border-2 border-emerald-500/50 bg-emerald-500/10 flex items-center justify-center animate-pulse">
                  <span className="absolute top-2 text-[8px] font-mono font-bold text-emerald-300 uppercase">
                    500m Home Geofence
                  </span>
                  <div className="h-9 w-9 rounded-full border-2 border-emerald-400 overflow-hidden shadow-lg shadow-emerald-500/40">
                    <Image
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face"
                      alt="Mom"
                      width={36}
                      height={36}
                      unoptimized
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-3 px-2 py-0.5 rounded-md text-[8.5px] font-mono font-bold bg-[#061510] text-emerald-300 border border-emerald-500/50 shadow-md flex items-center gap-1">
                    <CheckCircle2 size={10} className="text-emerald-400" />
                    <span>Inside Safe Zone</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Telemetry HUD Bottom Bar */}
        <div className="px-3.5 py-1.5 bg-[#080E24] border-t border-cyan-500/20 flex items-center justify-between text-[9.5px] font-mono text-cyan-400/90">
          <div className="flex items-center gap-1.5">
            <Compass size={11} className="text-cyan-400" />
            <span>23.8103° N, 90.4125° E • Banani</span>
          </div>
          <div className="flex items-center gap-1 text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>±0.8m Sub-Meter Precision</span>
          </div>
        </div>
      </motion.div>

      {/* ══════════════════════════════════════════════════════
          4. THREE VALUE PILLARS & METRICS
          ══════════════════════════════════════════════════════ */}
      <div className="relative z-10 grid grid-cols-3 gap-2 my-1">
        <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm flex flex-col justify-center">
          <div className="flex items-center gap-1.5 text-xs font-black text-violet-400">
            <Zap size={13} />
            <span>&lt;20ms</span>
          </div>
          <span className="text-[9.5px] text-slate-400 font-medium mt-0.5">Socket Latency</span>
        </div>

        <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm flex flex-col justify-center">
          <div className="flex items-center gap-1.5 text-xs font-black text-emerald-400">
            <Battery size={13} />
            <span>&lt;3% / Day</span>
          </div>
          <span className="text-[9.5px] text-slate-400 font-medium mt-0.5">Battery Drain</span>
        </div>

        <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm flex flex-col justify-center">
          <div className="flex items-center gap-1.5 text-xs font-black text-amber-400">
            <ShieldCheck size={13} />
            <span>AES-256</span>
          </div>
          <span className="text-[9.5px] text-slate-400 font-medium mt-0.5">E2E Encrypted</span>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          5. LIVE TRUST TICKER FOOTER
          ══════════════════════════════════════════════════════ */}
      <div className="relative z-10 flex items-center justify-between text-[11px] text-slate-400 font-medium pt-0.5 border-t border-white/5">
        <div className="flex items-center gap-1.5">
          <Activity size={12} className="text-cyan-400 animate-pulse" />
          <span className="font-mono text-slate-300">
            {livePings.toLocaleString()}+ Live Pings Today
          </span>
        </div>
        <div className="flex items-center gap-1 text-slate-400">
          <Lock size={11} className="text-emerald-400" />
          <span>SOC-2 &amp; GDPR Compliant</span>
        </div>
      </div>
    </div>
  );
}

