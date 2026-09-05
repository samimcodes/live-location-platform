'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  ShieldCheck,
  Zap,
  Battery,
  MapPin,
  Car,
  Wifi,
  Radio,
  Sparkles,
  Navigation2,
  Lock,
  Compass,
  Satellite,
  CheckCircle2,
  Star,
  Activity,
  Layers,
} from 'lucide-react';
import { soundFx } from '@/lib/soundFx';
import Link from 'next/link';
import Image from 'next/image';

interface FamilyMember {
  id: string;
  name: string;
  shortName: string;
  tag: string;
  avatar: string;
  locationName: string;
  speed: number;
  battery: number;
  color: string;
  x: number;
  y: number;
  activity: 'driving' | 'home' | 'school';
  statusNote: string;
  eta?: string;
}

const familyMembers: FamilyMember[] = [
  {
    id: 'dad',
    name: 'Robert (Dad)',
    shortName: 'Robert',
    tag: 'In Transit',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    locationName: 'Banani Road 11 → Gulshan 2',
    speed: 46,
    battery: 86,
    color: '#8B5CF6',
    x: 64,
    y: 34,
    activity: 'driving',
    statusNote: 'Cruising via Expressway',
    eta: 'ETA 8 mins',
  },
  {
    id: 'mom',
    name: 'Emma (Mom)',
    shortName: 'Emma',
    tag: 'Safe at Home',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    locationName: 'Dhanmondi Lake View',
    speed: 0,
    battery: 94,
    color: '#10B981',
    x: 32,
    y: 54,
    activity: 'home',
    statusNote: 'Inside Home Safe Zone (Wi-Fi Connected)',
  },
  {
    id: 'son',
    name: 'Ayaan (Son)',
    shortName: 'Ayaan',
    tag: 'At School',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    locationName: 'Uttara Sector 3 Campus',
    speed: 0,
    battery: 89,
    color: '#F59E0B',
    x: 52,
    y: 72,
    activity: 'school',
    statusNote: 'Safe inside campus perimeter',
  },
];

const securityBadges = [
  { label: 'E2E AES-256 Encrypted', icon: Lock },
  { label: 'Sub-20ms WebSocket Latency', icon: Zap },
  { label: 'Zero Battery Drain AI', icon: Battery },
  { label: '99.99% GPS Uptime', icon: Activity },
  { label: 'SOC-2 & GDPR Compliant', icon: ShieldCheck },
];

export function HeroSection() {
  const [selectedId, setSelectedId] = useState('dad');
  const [liveSpeed, setLiveSpeed] = useState(46);
  const [satelliteCount, setSatelliteCount] = useState(9);
  const [isPinging, setIsPinging] = useState(false);
  const [carProgress, setCarProgress] = useState(0.65);

  const selected = familyMembers.find((m) => m.id === selectedId) ?? familyMembers[0];

  // Natural speed telemetry variation & moving car simulation
  useEffect(() => {
    const speedInterval = setInterval(() => {
      setLiveSpeed((prev) => {
        const delta = Math.floor(Math.random() * 5) - 2;
        return Math.max(38, Math.min(58, prev + delta));
      });
      setCarProgress((prev) => (prev > 0.95 ? 0.2 : prev + 0.03));
    }, 2400);

    return () => clearInterval(speedInterval);
  }, []);

  const handlePingRadar = () => {
    soundFx.playPing();
    setIsPinging(true);
    setSatelliteCount((prev) => (prev >= 11 ? 9 : prev + 1));
    setTimeout(() => setIsPinging(false), 1600);
  };

  return (
    <section className="relative min-h-[94dvh] flex flex-col justify-center overflow-hidden pt-28 pb-16 bg-[#F6F8FD] dark:bg-background">
      {/* ── AMBIENT GRADIENT MESH & GRID PATTERN ── */}
      <div className="absolute inset-0 -z-10 pointer-events-none select-none overflow-hidden">
        {/* Soft atmospheric gradient orbs */}
        <div className="absolute -top-24 left-[10%] w-[55vw] h-[55vw] max-w-[750px] max-h-[750px] bg-gradient-to-br from-violet-600/15 via-indigo-500/10 to-transparent rounded-full blur-[140px]" />
        <div className="absolute top-[20%] right-[5%] w-[45vw] h-[45vw] max-w-[650px] max-h-[650px] bg-gradient-to-bl from-cyan-500/10 via-purple-500/15 to-transparent rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-[30%] w-[40vw] h-[40vw] max-w-[550px] max-h-[550px] bg-emerald-500/8 rounded-full blur-[160px]" />

        {/* High-tech radial micro-dot matrix */}
        <div className="absolute inset-0 bg-[radial-gradient(var(--border)_1px,transparent_1px)] [background-size:28px_28px] opacity-40 dark:opacity-25 [mask-image:radial-gradient(ellipse_75%_65%_at_50%_35%,#000_60%,transparent_100%)]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          {/* ════════════════════════════════════════════════════
              LEFT COLUMN: HERO CONTENT & VALUE PROPOSITION
          ════════════════════════════════════════════════════ */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 space-y-7 text-left"
          >
            {/* Live Engine Status Chip */}
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/90 dark:bg-card/90 border border-slate-200/80 dark:border-border/80 shadow-sm backdrop-blur-xl">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <span className="text-xs font-bold text-slate-900 dark:text-foreground tracking-wide flex items-center gap-1.5">
                <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent font-extrabold">
                  LocaLink v2.0
                </span>
                <span className="text-slate-400 dark:text-muted-foreground">•</span>
                <span>Live GPS Engine</span>
              </span>
              <span className="h-3.5 w-px bg-slate-200 dark:bg-border" />
              <span className="text-[11px] font-mono font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-800/60">
                15s Sync
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[3.6rem] font-black tracking-tight leading-[1.08] text-slate-950 dark:text-white">
              Real-Time Location & Safety for{' '}
              <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 dark:from-violet-400 dark:via-indigo-300 dark:to-cyan-400 bg-clip-text text-transparent underline decoration-violet-500/30 decoration-wavy underline-offset-8">
                Modern Families
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal max-w-xl">
              Always stay connected with pinpoint 15-second live GPS tracking, automated safe perimeter geofences, 30-day trip history replay, and instant Ghost Mode privacy anytime.
            </p>

            {/* CTA Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-1">
              <Button
                size="lg"
                className="h-13 px-8 font-bold text-sm rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-700 hover:from-violet-700 hover:to-indigo-700 text-white shadow-[0_8px_25px_rgba(124,58,237,0.35)] hover:shadow-[0_12px_32px_rgba(124,58,237,0.45)] transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 group gap-2.5 cursor-pointer border border-white/20"
                onClick={() => soundFx.playPop()}
                asChild
              >
                <Link href="/register">
                  <span>Start Tracking Free</span>
                  <ArrowRight size={17} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="h-13 px-7 font-bold text-sm rounded-2xl bg-white/80 dark:bg-card/80 backdrop-blur-xl border border-slate-200/90 dark:border-border text-slate-800 dark:text-foreground shadow-xs hover:bg-slate-100/90 dark:hover:bg-muted transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 gap-2 cursor-pointer"
                onClick={() => soundFx.playPop()}
                asChild
              >
                <Link href="/login">
                  <Navigation2 size={16} className="text-violet-600 dark:text-violet-400" />
                  <span>Live Dashboard</span>
                </Link>
              </Button>
            </div>

            {/* Telemetry Micro-Trust Metrics */}
            <div className="pt-2">
              <div className="grid grid-cols-3 gap-3 p-3.5 rounded-2xl bg-white/70 dark:bg-card/70 border border-slate-200/80 dark:border-border/80 backdrop-blur-md shadow-2xs">
                <div className="flex flex-col text-left">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-violet-600 dark:text-violet-400">
                    <Zap size={14} />
                    <span>&lt;20ms</span>
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-muted-foreground">Socket Latency</span>
                </div>
                <div className="flex flex-col text-left border-x border-slate-200/80 dark:border-border/80 px-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    <Battery size={14} />
                    <span>&lt;3% / Day</span>
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-muted-foreground">Battery Drain</span>
                </div>
                <div className="flex flex-col text-left">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-500">
                    <ShieldCheck size={14} />
                    <span>AES-256</span>
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-muted-foreground">E2E Encrypted</span>
                </div>
              </div>
            </div>

            {/* Social Proof & Rating Bar */}
            <div className="flex items-center gap-4 pt-1">
              <div className="flex -space-x-2.5">
                {[
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
                  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80',
                  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80',
                  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80',
                ].map((src, i) => (
                  <div
                    key={i}
                    className="h-8 w-8 rounded-full border-2 border-white dark:border-card overflow-hidden shadow-xs ring-1 ring-black/5"
                  >
                    <Image
                      src={src}
                      alt="User"
                      width={32}
                      height={32}
                      unoptimized
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1 text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={13} className="fill-amber-400 text-amber-400" />
                  ))}
                  <span className="text-xs font-black text-slate-900 dark:text-foreground ml-1.5">4.9 / 5.0</span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-muted-foreground font-medium">
                  Trusted by over 2,400+ families & teams
                </div>
              </div>
            </div>
          </motion.div>

          {/* ════════════════════════════════════════════════════
              RIGHT COLUMN: HIGH-TECH LIVE RADAR CONSOLE
          ════════════════════════════════════════════════════ */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 relative flex items-center justify-center"
          >
            {/* Ambient Backlight Glow */}
            <div className="absolute -inset-4 rounded-[36px] bg-gradient-to-tr from-violet-600/25 via-indigo-500/20 to-cyan-400/20 blur-2xl opacity-70 dark:opacity-50 pointer-events-none" />

            {/* Radar Device Container */}
            <div className="relative w-full max-w-[580px] rounded-[32px] bg-white dark:bg-[#0E1528] border border-slate-200/90 dark:border-slate-800 shadow-[0_20px_50px_rgba(15,23,42,0.12)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.4)] overflow-hidden">
              {/* ── Console Header Bar ── */}
              <div className="px-5 py-3.5 bg-slate-50/90 dark:bg-[#121B33] border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-violet-600/30">
                    <Radio size={16} className={isPinging ? 'animate-spin' : 'animate-pulse'} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-slate-900 dark:text-foreground">
                        Family Safe Circle
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-300/40">
                        LIVE
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>3 of 3 members online</span>
                    </div>
                  </div>
                </div>

                {/* Right controls */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePingRadar}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-mono font-bold bg-violet-100 text-violet-700 dark:bg-violet-950/70 dark:text-violet-300 border border-violet-200 dark:border-violet-800/80 hover:bg-violet-200/80 transition-colors cursor-pointer"
                    title="Ping GPS Satellites"
                  >
                    <Satellite size={12} className={isPinging ? 'animate-bounce' : ''} />
                    <span>{satelliteCount} Sats</span>
                  </button>
                </div>
              </div>

              {/* ── High-Contrast Radar Map Canvas ── */}
              <div className="relative aspect-[16/11] bg-[#0A0F1F] overflow-hidden select-none">
                {/* SVG Vector Map & Roads */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    {/* Linear gradient for glowing polyline route */}
                    <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#8B5CF6" />
                      <stop offset="50%" stopColor="#6366F1" />
                      <stop offset="100%" stopColor="#06B6D4" />
                    </linearGradient>

                    {/* Radial gradient for radar glow */}
                    <radialGradient id="radarSweep" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
                    </radialGradient>
                  </defs>

                  {/* Dark block zones */}
                  <rect x="4%" y="6%" width="38%" height="36%" rx="12" fill="#10182E" />
                  <rect x="48%" y="6%" width="48%" height="32%" rx="12" fill="#10182E" />
                  <rect x="4%" y="48%" width="36%" height="46%" rx="12" fill="#10182E" />
                  <rect x="46%" y="44%" width="50%" height="50%" rx="12" fill="#10182E" />

                  {/* Major expressways and avenues */}
                  <path d="M0 160 H 800" stroke="#1B2644" strokeWidth="22" />
                  <path d="M0 320 H 800" stroke="#1B2644" strokeWidth="18" />
                  <path d="M300 0 V 600" stroke="#1B2644" strokeWidth="24" />
                  <path d="M620 0 V 600" stroke="#1B2644" strokeWidth="16" />

                  {/* Lane dash dividers */}
                  <path d="M0 160 H 800" stroke="#2F3E68" strokeWidth="1.5" strokeDasharray="8 8" />
                  <path d="M0 320 H 800" stroke="#2F3E68" strokeWidth="1.5" strokeDasharray="8 8" />
                  <path d="M300 0 V 600" stroke="#2F3E68" strokeWidth="1.5" strokeDasharray="8 8" />

                  {/* Live Travel Route with Neon Glow */}
                  <path
                    d="M 180 290 Q 300 290, 420 160 T 620 120"
                    fill="none"
                    stroke="url(#routeGradient)"
                    strokeWidth="4.5"
                    strokeLinecap="round"
                    className="drop-shadow-[0_0_12px_rgba(139,92,246,0.9)]"
                  />
                </svg>

                {/* Radar Sweep Effect */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-[320px] h-[320px] rounded-full border border-violet-500/15 animate-ping opacity-30 pointer-events-none" />
                  <div className="w-[460px] h-[460px] rounded-full border border-indigo-500/10 pointer-events-none" />
                </div>

                {/* Home Safe Zone Circle */}
                <div
                  className="absolute pointer-events-none"
                  style={{ top: '54%', left: '32%', transform: 'translate(-50%,-50%)' }}
                >
                  <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full border-2 border-dashed border-emerald-400/70 bg-emerald-500/10 flex items-center justify-center animate-pulse">
                    <span className="text-[9px] font-mono font-black text-emerald-300 bg-slate-950/80 px-2.5 py-1 rounded-full border border-emerald-400/40 shadow-sm backdrop-blur-md">
                      🏠 Home Safe Zone
                    </span>
                  </div>
                </div>

                {/* School Safe Zone Circle */}
                <div
                  className="absolute pointer-events-none"
                  style={{ top: '72%', left: '52%', transform: 'translate(-50%,-50%)' }}
                >
                  <div className="w-24 h-24 sm:w-30 sm:h-30 rounded-full border-2 border-dashed border-amber-400/70 bg-amber-500/10 flex items-center justify-center">
                    <span className="text-[9px] font-mono font-black text-amber-300 bg-slate-950/80 px-2 py-0.5 rounded-full border border-amber-400/40 shadow-sm backdrop-blur-md">
                      🎓 Campus Zone
                    </span>
                  </div>
                </div>

                {/* Animated Moving Vehicle Marker along Route */}
                <div
                  className="absolute transition-all duration-1000 ease-linear pointer-events-none"
                  style={{
                    left: `${carProgress * 70 + 10}%`,
                    top: `${40 - carProgress * 15}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  <div className="h-6 w-6 rounded-full bg-violet-500 text-white flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,1)] border-2 border-white">
                    <Car size={12} className="text-white" />
                  </div>
                </div>

                {/* ── Interactive Member Map Markers ── */}
                {familyMembers.map((m) => {
                  const isActive = selectedId === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => {
                        soundFx.playPop();
                        setSelectedId(m.id);
                      }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-20 cursor-pointer group focus:outline-hidden"
                      style={{ left: `${m.x}%`, top: `${m.y}%` }}
                    >
                      {/* Pulse wave when active */}
                      {isActive && (
                        <span
                          className="animate-ping absolute -inset-2 rounded-full opacity-70 pointer-events-none"
                          style={{ backgroundColor: m.color }}
                        />
                      )}

                      {/* Avatar Pin */}
                      <div
                        className={`relative h-11 w-11 sm:h-12 sm:w-12 rounded-full border-2 overflow-hidden shadow-xl transition-all duration-300 group-hover:scale-115 ${
                          isActive
                            ? 'ring-4 scale-115 border-white'
                            : 'border-white/80 opacity-90 group-hover:opacity-100'
                        }`}
                        style={isActive ? { boxShadow: `0 0 20px ${m.color}` } : undefined}
                      >
                        <Image
                          src={m.avatar}
                          alt={m.name}
                          width={48}
                          height={48}
                          unoptimized
                          className="h-full w-full object-cover"
                        />
                      </div>

                      {/* Name Tag Pill */}
                      <div
                        className={`mt-1.5 px-2.5 py-0.5 rounded-lg text-[10px] font-black tracking-wide whitespace-nowrap shadow-lg border backdrop-blur-md transition-all ${
                          isActive
                            ? 'bg-violet-600 text-white border-violet-400 scale-105'
                            : 'bg-slate-900/90 text-slate-200 border-white/20'
                        }`}
                      >
                        {m.shortName}
                      </div>
                    </button>
                  );
                })}

                {/* Bottom Coordinates & Accuracy HUD bar */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-950/95 via-slate-950/80 to-transparent px-4 py-2.5 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    <span>23.8103°N, 90.4125°E</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-violet-400 bg-violet-950/80 px-2.5 py-0.5 rounded-md border border-violet-800/60 font-semibold">
                    <Compass size={12} />
                    <span>±1.5m High Precision</span>
                  </div>
                </div>
              </div>

              {/* ── Active Member Live Telemetry Panel ── */}
              <div className="p-4 sm:p-5 bg-white dark:bg-[#10172C] border-t border-slate-200/90 dark:border-slate-800 transition-all">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className="h-12 w-12 rounded-2xl overflow-hidden border-2 shrink-0 shadow-md ring-2 ring-black/5"
                      style={{ borderColor: selected.color }}
                    >
                      <Image
                        src={selected.avatar}
                        alt={selected.name}
                        width={48}
                        height={48}
                        unoptimized
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-black text-slate-900 dark:text-foreground truncate">
                          {selected.name}
                        </h4>
                        <span
                          className="text-[10px] font-extrabold px-2 py-0.5 rounded-md shrink-0 border"
                          style={{
                            backgroundColor: `${selected.color}15`,
                            color: selected.color,
                            borderColor: `${selected.color}40`,
                          }}
                        >
                          {selected.tag}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate mt-0.5">
                        {selected.locationName}
                      </p>
                    </div>
                  </div>

                  {/* Telemetry Chips */}
                  <div className="flex items-center gap-2.5 shrink-0">
                    {selected.activity === 'driving' && (
                      <div className="flex items-center gap-1.5 text-xs font-mono font-black bg-violet-100 text-violet-700 dark:bg-violet-950/70 dark:text-violet-300 px-3 py-1.5 rounded-xl border border-violet-200 dark:border-violet-800/70 shadow-2xs">
                        <Car size={14} className="text-violet-600 dark:text-violet-400" />
                        <span>{liveSpeed}</span>
                        <span className="text-[10px] text-violet-500/80 font-normal">km/h</span>
                      </div>
                    )}
                    {selected.activity === 'home' && (
                      <div className="flex items-center gap-1.5 text-xs font-mono font-black bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-400 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800/70 shadow-2xs">
                        <Wifi size={14} />
                        <span>Safe</span>
                      </div>
                    )}
                    {selected.activity === 'school' && (
                      <div className="flex items-center gap-1.5 text-xs font-mono font-black bg-amber-100 text-amber-700 dark:bg-amber-950/70 dark:text-amber-400 px-3 py-1.5 rounded-xl border border-amber-200 dark:border-amber-800/70 shadow-2xs">
                        <CheckCircle2 size={14} />
                        <span>Inside Zone</span>
                      </div>
                    )}

                    <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/90 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                      <Battery size={14} className="text-emerald-500" />
                      <span>{selected.battery}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Member Switcher Quick Selector Tabs ── */}
              <div className="px-4 py-3 bg-slate-50/90 dark:bg-[#0B1020] border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-2.5">
                {familyMembers.map((m) => {
                  const isActive = selectedId === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => {
                        soundFx.playPop();
                        setSelectedId(m.id);
                      }}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-2xl text-xs font-bold flex-1 transition-all duration-200 cursor-pointer ${
                        isActive
                          ? 'bg-white dark:bg-card shadow-md border border-slate-200 dark:border-border text-slate-900 dark:text-foreground scale-[1.02]'
                          : 'text-slate-500 dark:text-muted-foreground hover:bg-white/60 dark:hover:bg-card/40'
                      }`}
                    >
                      <div
                        className="h-7 w-7 rounded-full overflow-hidden border-2 shrink-0"
                        style={{ borderColor: isActive ? m.color : 'transparent' }}
                      >
                        <Image
                          src={m.avatar}
                          alt={m.shortName}
                          width={28}
                          height={28}
                          unoptimized
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="text-left hidden sm:block min-w-0">
                        <div className="text-[11px] font-black leading-tight truncate">{m.shortName}</div>
                        <div className="text-[9px] font-medium leading-tight truncate" style={{ color: m.color }}>
                          {m.tag}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>

        {/* ════════════════════════════════════════════════════
            SECURITY & REPUTATION MARQUEE TICKER
        ════════════════════════════════════════════════════ */}
        <div className="mt-16 sm:mt-20 pt-8 border-t border-slate-200/80 dark:border-border/60">
          <div className="text-center mb-6">
            <span className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-muted-foreground">
              Enterprise-Grade Security & Reliability Standard
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4 items-center">
            {securityBadges.map((badge, idx) => {
              const Icon = badge.icon;
              return (
                <div
                  key={idx}
                  className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-white/70 dark:bg-card/70 border border-slate-200/70 dark:border-border/70 text-xs font-bold text-slate-700 dark:text-slate-300 shadow-2xs backdrop-blur-sm hover:border-violet-400/50 transition-colors"
                >
                  <Icon size={14} className="text-violet-600 dark:text-violet-400 shrink-0" />
                  <span className="truncate">{badge.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
