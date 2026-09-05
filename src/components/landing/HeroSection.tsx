'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  Shield,
  Eye,
  Bell,
  Play,
  Volume2,
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
    speed: 48,
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
    x: 30,
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

const rotatingKeywords = [
  'Modern Families',
  'Close Circles',
  'Smart Travelers',
  'Safe Commuters',
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
  const [liveSpeed, setLiveSpeed] = useState(48);
  const [satelliteCount, setSatelliteCount] = useState(10);
  const [isPinging, setIsPinging] = useState(false);
  const [keywordIndex, setKeywordIndex] = useState(0);
  const [mapMode, setMapMode] = useState<'radar' | 'satellite' | 'traffic'>('radar');
  const [sonarRipples, setSonarRipples] = useState<number[]>([]);

  // Real continuous car animation progress along path (0.0 -> 1.0)
  const [carProgress, setCarProgress] = useState(0.25);

  const selected = familyMembers.find((m) => m.id === selectedId) ?? familyMembers[0];

  // Rotating headline words effect
  useEffect(() => {
    const wordInterval = setInterval(() => {
      setKeywordIndex((prev) => (prev + 1) % rotatingKeywords.length);
    }, 3200);
    return () => clearInterval(wordInterval);
  }, []);

  // Continuous smooth vehicle movement loop & natural speed fluctuations
  useEffect(() => {
    let animFrame: number;
    let lastTime = performance.now();

    const updateLoop = (now: number) => {
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      setCarProgress((prev) => {
        const next = prev + delta * 0.08; // smooth 12-second roundtrip
        return next > 1 ? 0 : next;
      });

      animFrame = requestAnimationFrame(updateLoop);
    };

    animFrame = requestAnimationFrame(updateLoop);

    const speedInterval = setInterval(() => {
      setLiveSpeed((prev) => {
        const jitter = Math.floor(Math.random() * 5) - 2;
        return Math.max(38, Math.min(62, prev + jitter));
      });
    }, 2200);

    return () => {
      cancelAnimationFrame(animFrame);
      clearInterval(speedInterval);
    };
  }, []);

  // Sonar radar pulse trigger
  const handlePingRadar = () => {
    soundFx.playPing();
    setIsPinging(true);
    setSonarRipples((prev) => [...prev, Date.now()]);
    setSatelliteCount((prev) => (prev >= 12 ? 9 : prev + 1));
    setTimeout(() => setIsPinging(false), 1800);
  };

  // Interpolate vehicle coordinate along bezier curve
  // Curve: start (180, 290) -> control (320, 260) -> control2 (420, 160) -> end (620, 120)
  const t = carProgress;
  const carX = Math.round(
    Math.pow(1 - t, 3) * 180 +
    3 * Math.pow(1 - t, 2) * t * 300 +
    3 * (1 - t) * Math.pow(t, 2) * 440 +
    Math.pow(t, 3) * 620
  );
  const carY = Math.round(
    Math.pow(1 - t, 3) * 290 +
    3 * Math.pow(1 - t, 2) * t * 290 +
    3 * (1 - t) * Math.pow(t, 2) * 160 +
    Math.pow(t, 3) * 120
  );

  return (
    <section className="relative min-h-[96dvh] flex flex-col justify-center overflow-hidden pt-28 pb-16 bg-[#F6F8FD] dark:bg-[#070B14] transition-colors duration-500">
      {/* ── HIGH-TECH AMBIENT GLOWS & MORPHING RADIAL MESH ── */}
      <div className="absolute inset-0 -z-10 pointer-events-none select-none overflow-hidden">
        {/* Animated breathing glow spheres */}
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-32 left-[8%] w-[58vw] h-[58vw] max-w-[800px] max-h-[800px] bg-gradient-to-br from-violet-600/20 via-indigo-500/15 to-transparent rounded-full blur-[140px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            x: [0, -35, 0],
            y: [0, 25, 0],
          }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="absolute top-[18%] right-[4%] w-[48vw] h-[48vw] max-w-[700px] max-h-[700px] bg-gradient-to-bl from-cyan-500/15 via-purple-600/20 to-transparent rounded-full blur-[150px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute bottom-[-10%] left-[25%] w-[42vw] h-[42vw] max-w-[600px] max-h-[600px] bg-emerald-500/10 rounded-full blur-[160px]"
        />

        {/* High-tech matrix dot grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#80808020_1px,transparent_1px)] [background-size:24px_24px] dark:bg-[radial-gradient(#ffffff15_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_75%_65%_at_50%_35%,#000_65%,transparent_100%)]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          {/* ════════════════════════════════════════════════════
              LEFT COLUMN: HERO CONTENT & VALUE PROPOSITION
          ════════════════════════════════════════════════════ */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 space-y-7 text-left"
          >
            {/* Live Engine Status Chip */}
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/90 dark:bg-[#10172C]/90 border border-slate-200/90 dark:border-slate-800 shadow-sm backdrop-blur-xl">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <span className="text-xs font-bold text-slate-900 dark:text-foreground tracking-wide flex items-center gap-1.5">
                <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 bg-clip-text text-transparent font-black">
                  LocaLink v2.0
                </span>
                <span className="text-slate-400 dark:text-muted-foreground">•</span>
                <span>Live GPS Engine</span>
              </span>
              <span className="h-3.5 w-px bg-slate-200 dark:bg-slate-700" />
              <span className="text-[11px] font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-800/60">
                15s Sync
              </span>
            </div>

            {/* Headline with 3D Word Rotator */}
            <div className="space-y-1">
              <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-black tracking-tight leading-[1.12] text-slate-950 dark:text-white">
                Real-Time Location &amp; Safety for<br className="hidden sm:inline" />{' '}
                <span className="inline-block relative overflow-hidden align-bottom">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={keywordIndex}
                      initial={{ y: 40, opacity: 0, filter: 'blur(4px)' }}
                      animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                      exit={{ y: -40, opacity: 0, filter: 'blur(4px)' }}
                      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                      className="inline-block whitespace-nowrap bg-gradient-to-r from-violet-600 via-indigo-500 to-cyan-500 dark:from-violet-400 dark:via-indigo-300 dark:to-cyan-300 bg-clip-text text-transparent pb-1"
                    >
                      {rotatingKeywords[keywordIndex]}
                    </motion.span>
                  </AnimatePresence>
                </span>
              </h1>
            </div>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal max-w-xl">
              Always stay connected with pinpoint 15-second live GPS tracking, automated safe perimeter geofences, 30-day trip route replay, and instant Ghost Mode privacy anytime.
            </p>

            {/* CTA Action Buttons with Glow Effects */}
            <div className="flex flex-wrap items-center gap-4 pt-1">
              <Button
                size="lg"
                className="h-13 px-8 font-bold text-sm rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-700 hover:from-violet-700 hover:to-indigo-700 text-white shadow-[0_8px_25px_rgba(124,58,237,0.35)] hover:shadow-[0_14px_35px_rgba(124,58,237,0.5)] transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 group gap-2.5 cursor-pointer border border-white/20"
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
                className="h-13 px-7 font-bold text-sm rounded-2xl bg-white/80 dark:bg-[#10172C]/80 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 text-slate-800 dark:text-foreground shadow-xs hover:bg-slate-100/90 dark:hover:bg-slate-800 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 gap-2 cursor-pointer"
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
              <div className="grid grid-cols-3 gap-3 p-3.5 rounded-2xl bg-white/70 dark:bg-[#10172C]/70 border border-slate-200/80 dark:border-slate-800 backdrop-blur-md shadow-2xs">
                <div className="flex flex-col text-left">
                  <div className="flex items-center gap-1.5 text-xs font-black text-violet-600 dark:text-violet-400">
                    <Zap size={14} />
                    <span>&lt;20ms</span>
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">Socket Latency</span>
                </div>
                <div className="flex flex-col text-left border-x border-slate-200/80 dark:border-slate-800 px-3">
                  <div className="flex items-center gap-1.5 text-xs font-black text-emerald-600 dark:text-emerald-400">
                    <Battery size={14} />
                    <span>&lt;3% / Day</span>
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">Battery Drain</span>
                </div>
                <div className="flex flex-col text-left">
                  <div className="flex items-center gap-1.5 text-xs font-black text-amber-500">
                    <ShieldCheck size={14} />
                    <span>AES-256</span>
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">E2E Encrypted</span>
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
                    className="h-8 w-8 rounded-full border-2 border-white dark:border-[#10172C] overflow-hidden shadow-xs ring-1 ring-black/5"
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
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  Trusted by over 2,400+ families &amp; teams
                </div>
              </div>
            </div>
          </motion.div>

          {/* ════════════════════════════════════════════════════
              RIGHT COLUMN: 3D HOLOGRAPHIC RADAR & SATELLITE ORBIT
          ════════════════════════════════════════════════════ */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 relative flex items-center justify-center select-none"
          >
            {/* Multi-Layer Ambient Nebula Backlight */}
            <div className="absolute -inset-6 rounded-[48px] bg-gradient-to-tr from-cyan-500/20 via-violet-600/25 to-indigo-500/20 blur-3xl opacity-80 pointer-events-none" />

            {/* ── Floating Telemetry Pill 1 (Top-Right): Satellite Constellation ── */}
            <motion.div
              animate={{ y: [-5, 5, -5] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="hidden sm:flex absolute -top-5 -right-2 z-30 items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-[#091022]/95 border border-cyan-500/40 shadow-[0_10px_30px_rgba(6,182,212,0.25)] backdrop-blur-xl"
            >
              <div className="h-7 w-7 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                <Satellite size={14} className={isPinging ? 'animate-spin text-cyan-300' : 'animate-pulse'} />
              </div>
              <div className="text-left pr-1">
                <div className="text-[11px] font-black text-white flex items-center gap-1.5">
                  <span>GPS Mesh Locked</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                </div>
                <div className="text-[10px] text-cyan-400 font-mono">
                  {satelliteCount} Orbiters • 12ms
                </div>
              </div>
            </motion.div>

            {/* ── Floating Telemetry Pill 2 (Bottom-Left): Geofence Shield ── */}
            <motion.div
              animate={{ y: [5, -5, 5] }}
              transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              className="hidden sm:flex absolute -bottom-4 -left-2 z-30 items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-[#091022]/95 border border-emerald-500/40 shadow-[0_10px_30px_rgba(16,185,129,0.25)] backdrop-blur-xl"
            >
              <div className="h-7 w-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <ShieldCheck size={14} />
              </div>
              <div className="text-left pr-1">
                <div className="text-[11px] font-black text-white flex items-center gap-1.5">
                  <span>E2E Quantum Shield</span>
                  <span className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-950/80 px-1.5 py-0.2 rounded border border-emerald-500/40">AES-256</span>
                </div>
                <div className="text-[10px] text-emerald-400/90 font-mono">
                  Perimeter 100% Secured
                </div>
              </div>
            </motion.div>

            {/* ── Main 3D Holographic Cyber-Deck Frame ── */}
            <div className="relative w-full max-w-[560px] rounded-[36px] bg-[#070C1A] border border-cyan-500/30 dark:border-cyan-500/25 shadow-[0_25px_70px_rgba(0,0,0,0.8)] overflow-hidden backdrop-blur-3xl">
              
              {/* Holographic HUD Header Bar */}
              <div className="px-5 py-3.5 bg-[#0C142B]/90 border-b border-cyan-500/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center text-white shadow-[0_0_15px_rgba(6,182,212,0.5)]">
                    <Radio size={15} className={isPinging ? 'animate-spin' : 'animate-pulse'} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-white tracking-wider">
                        HOLO-RADAR MATRIX
                      </span>
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                        V4.8 LIVE
                      </span>
                    </div>
                    <div className="text-[10px] text-cyan-400/80 font-mono flex items-center gap-1.5 mt-0.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                      <span>3 Nodes Connected in Mesh</span>
                    </div>
                  </div>
                </div>

                {/* Satellite Ping Sync Action */}
                <button
                  onClick={handlePingRadar}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-mono font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-400/40 hover:bg-cyan-500/25 hover:border-cyan-300 transition-all cursor-pointer shadow-[0_0_12px_rgba(6,182,212,0.3)] active:scale-95"
                  title="Pulse Radar Sweep"
                >
                  <Sparkles size={12} className={isPinging ? 'animate-spin text-cyan-300' : ''} />
                  <span>{isPinging ? 'Pinging...' : 'Sync Satellites'}</span>
                </button>
              </div>

              {/* ── 3D Holographic Orbit & Radar Viewport ── */}
              <div className="relative aspect-[16/11] bg-[#050814] overflow-hidden flex items-center justify-center">
                
                {/* Background Cyber Grid */}
                <div 
                  className="absolute inset-0 opacity-20 pointer-events-none"
                  style={{
                    backgroundImage: `linear-gradient(to right, #06B6D4 1px, transparent 1px), linear-gradient(to bottom, #06B6D4 1px, transparent 1px)`,
                    backgroundSize: '28px 28px',
                  }}
                />

                {/* 3D Rotating Isometric Radar Globe & Orbital Rings */}
                <div className="relative w-[340px] h-[340px] flex items-center justify-center">
                  
                  {/* Outer Orbit Ring 1 (Tilted & Rotating) */}
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 32, repeat: Infinity, ease: 'linear' }}
                    className="absolute w-[320px] h-[320px] rounded-full border border-cyan-500/25 border-dashed pointer-events-none"
                    style={{ transform: 'rotateX(62deg)' }}
                  >
                    {/* Orbiting Satellite Alpha */}
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1">
                      <div className="h-3.5 w-3.5 rounded-full bg-cyan-400 shadow-[0_0_12px_#06B6D4] flex items-center justify-center text-[7px] text-black font-bold">
                        🛰️
                      </div>
                      <span className="text-[8px] font-mono text-cyan-300/80 bg-slate-950/90 px-1 rounded border border-cyan-500/30">
                        GPS-III
                      </span>
                    </div>
                  </motion.div>

                  {/* Outer Orbit Ring 2 (Counter Tilted) */}
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
                    className="absolute w-[260px] h-[260px] rounded-full border border-violet-500/30 pointer-events-none"
                    style={{ transform: 'rotateY(55deg) rotateX(25deg)' }}
                  >
                    {/* Orbiting Satellite Beta */}
                    <div className="absolute -bottom-2 right-6 flex items-center gap-1">
                      <div className="h-3 w-3 rounded-full bg-violet-400 shadow-[0_0_12px_#8B5CF6] flex items-center justify-center text-[6px] text-white">
                        📡
                      </div>
                      <span className="text-[7px] font-mono text-violet-300 bg-slate-950/90 px-1 rounded border border-violet-500/30">
                        STARLINK-8
                      </span>
                    </div>
                  </motion.div>

                  {/* Concentric 3D Radar Concentric Waves */}
                  <div className="absolute w-[220px] h-[220px] rounded-full border border-cyan-500/20" />
                  <div className="absolute w-[150px] h-[150px] rounded-full border border-indigo-500/25" />
                  <div className="absolute w-[80px] h-[80px] rounded-full border border-cyan-400/30 bg-cyan-500/5" />

                  {/* Center Core Holographic Beacon */}
                  <div className="absolute h-6 w-6 rounded-full bg-gradient-to-tr from-cyan-400 to-violet-500 shadow-[0_0_20px_#06B6D4] flex items-center justify-center z-10 animate-pulse">
                    <div className="h-2 w-2 rounded-full bg-white" />
                  </div>

                  {/* 360-degree Continuous Radar Scanner Sweep */}
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: 'conic-gradient(from 0deg at 50% 50%, rgba(6, 182, 212, 0.28) 0deg, rgba(139, 92, 246, 0.08) 60deg, transparent 90deg)',
                      borderRadius: '50%',
                    }}
                  />

                  {/* Laser Polyline Beams Connecting Family Nodes */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none z-15" viewBox="0 0 340 340">
                    <defs>
                      <linearGradient id="holoLaser" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#8B5CF6" />
                        <stop offset="50%" stopColor="#06B6D4" />
                        <stop offset="100%" stopColor="#10B981" />
                      </linearGradient>
                      <filter id="laserGlow">
                        <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                        <feMerge>
                          <feMergeNode in="coloredBlur" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                    </defs>

                    {/* Laser link between Dad(68,100), Mom(245,130), Ayaan(160,250) */}
                    <polygon
                      points="68,100 245,130 160,250"
                      fill="rgba(6, 182, 212, 0.04)"
                      stroke="url(#holoLaser)"
                      strokeWidth="2"
                      strokeDasharray="4 4"
                      filter="url(#laserGlow)"
                    />
                  </svg>

                  {/* Sonar Ripple Waves when Triggered */}
                  <AnimatePresence>
                    {sonarRipples.map((timestamp) => (
                      <motion.div
                        key={timestamp}
                        initial={{ scale: 0.1, opacity: 1 }}
                        animate={{ scale: 2.8, opacity: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.8, ease: 'easeOut' }}
                        className="absolute w-48 h-48 rounded-full border-2 border-cyan-400 bg-cyan-500/10 pointer-events-none"
                      />
                    ))}
                  </AnimatePresence>

                  {/* ── INTERACTIVE FAMILY MESH NODES ── */}
                  
                  {/* Node 1: Dad (Robert - Driving) */}
                  <div className="absolute top-[28%] left-[18%] -translate-x-1/2 -translate-y-1/2 z-25">
                    <button
                      onClick={() => {
                        soundFx?.playPop?.();
                        setSelectedId('dad');
                      }}
                      className="group flex flex-col items-center cursor-pointer focus:outline-hidden"
                    >
                      <span className="animate-ping absolute -inset-1.5 rounded-full bg-violet-400 opacity-60 pointer-events-none" />
                      <div className="relative h-10 w-10 rounded-full border-2 border-violet-400 overflow-hidden shadow-[0_0_15px_#8B5CF6] transition-transform group-hover:scale-110 bg-slate-900">
                        <Image src={familyMembers[0].avatar} alt="Robert" width={40} height={40} unoptimized className="h-full w-full object-cover" />
                      </div>
                      <div className="mt-1 px-2 py-0.5 rounded-md text-[9px] font-mono font-bold bg-slate-950/95 text-violet-300 border border-violet-500/40 shadow-md whitespace-nowrap">
                        Robert • {liveSpeed} km/h
                      </div>
                    </button>
                  </div>

                  {/* Node 2: Mom (Emma - Home Geofence) */}
                  <div className="absolute top-[36%] right-[8%] -translate-x-1/2 -translate-y-1/2 z-25">
                    <button
                      onClick={() => {
                        soundFx?.playPop?.();
                        setSelectedId('mom');
                      }}
                      className="group flex flex-col items-center cursor-pointer focus:outline-hidden"
                    >
                      <span className="animate-ping absolute -inset-1.5 rounded-full bg-emerald-400 opacity-60 pointer-events-none" />
                      <div className="relative h-10 w-10 rounded-full border-2 border-emerald-400 overflow-hidden shadow-[0_0_15px_#10B981] transition-transform group-hover:scale-110 bg-slate-900">
                        <Image src={familyMembers[1].avatar} alt="Emma" width={40} height={40} unoptimized className="h-full w-full object-cover" />
                      </div>
                      <div className="mt-1 px-2 py-0.5 rounded-md text-[9px] font-mono font-bold bg-slate-950/95 text-emerald-300 border border-emerald-500/40 shadow-md whitespace-nowrap">
                        Emma • Safe Zone
                      </div>
                    </button>
                  </div>

                  {/* Node 3: Son (Ayaan - Campus) */}
                  <div className="absolute bottom-[18%] left-[48%] -translate-x-1/2 -translate-y-1/2 z-25">
                    <button
                      onClick={() => {
                        soundFx?.playPop?.();
                        setSelectedId('son');
                      }}
                      className="group flex flex-col items-center cursor-pointer focus:outline-hidden"
                    >
                      <span className="animate-ping absolute -inset-1.5 rounded-full bg-amber-400 opacity-60 pointer-events-none" />
                      <div className="relative h-10 w-10 rounded-full border-2 border-amber-400 overflow-hidden shadow-[0_0_15px_#F59E0B] transition-transform group-hover:scale-110 bg-slate-900">
                        <Image src={familyMembers[2].avatar} alt="Ayaan" width={40} height={40} unoptimized className="h-full w-full object-cover" />
                      </div>
                      <div className="mt-1 px-2 py-0.5 rounded-md text-[9px] font-mono font-bold bg-slate-950/95 text-amber-300 border border-amber-500/40 shadow-md whitespace-nowrap">
                        Ayaan • Campus
                      </div>
                    </button>
                  </div>

                </div>

                {/* Bottom Holographic HUD Readout Overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#070C1A] via-[#070C1A]/90 to-transparent px-4 py-2 flex items-center justify-between text-[10px] font-mono text-cyan-400/80">
                  <div className="flex items-center gap-1.5">
                    <Compass size={12} className="text-cyan-400 animate-spin" style={{ animationDuration: '10s' }} />
                    <span>23.8103° N, 90.4125° E</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>±0.8m Sub-Meter Precision</span>
                  </div>
                </div>
              </div>

              {/* ── Selected Member Holographic Telemetry Strip ── */}
              <div className="p-4 bg-[#091024] border-t border-cyan-500/20">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="h-11 w-11 rounded-xl overflow-hidden border-2 shrink-0 shadow-md"
                      style={{ borderColor: selected.color, boxShadow: `0 0 12px ${selected.color}60` }}
                    >
                      <Image
                        src={selected.avatar}
                        alt={selected.name}
                        width={44}
                        height={44}
                        unoptimized
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white truncate">
                          {selected.name}
                        </h4>
                        <span
                          className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded shrink-0 border"
                          style={{
                            backgroundColor: `${selected.color}20`,
                            color: selected.color,
                            borderColor: `${selected.color}50`,
                          }}
                        >
                          {selected.tag}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono truncate mt-0.5">
                        {selected.locationName}
                      </p>
                    </div>
                  </div>

                  {/* Telemetry Status Badges */}
                  <div className="flex items-center gap-2 shrink-0">
                    {selected.activity === 'driving' && (
                      <div className="flex items-center gap-1.5 text-xs font-mono font-bold bg-violet-950/80 text-violet-300 px-2.5 py-1.5 rounded-xl border border-violet-500/40 shadow-[0_0_10px_rgba(139,92,246,0.3)]">
                        <Car size={13} className="text-violet-400" />
                        <span>{liveSpeed} km/h</span>
                      </div>
                    )}
                    {selected.activity === 'home' && (
                      <div className="flex items-center gap-1.5 text-xs font-mono font-bold bg-emerald-950/80 text-emerald-300 px-2.5 py-1.5 rounded-xl border border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                        <Wifi size={13} />
                        <span>Safe Zone</span>
                      </div>
                    )}
                    {selected.activity === 'school' && (
                      <div className="flex items-center gap-1.5 text-xs font-mono font-bold bg-amber-950/80 text-amber-300 px-2.5 py-1.5 rounded-xl border border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.3)]">
                        <CheckCircle2 size={13} />
                        <span>Campus Hub</span>
                      </div>
                    )}

                    <div className="flex items-center gap-1 text-xs font-mono font-bold text-cyan-300 bg-cyan-950/80 px-2.5 py-1.5 rounded-xl border border-cyan-500/40">
                      <Battery size={13} className="text-emerald-400" />
                      <span>{selected.battery}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Minimalist Holographic Node Switcher ── */}
              <div className="px-3 py-2 bg-[#060B18] border-t border-cyan-500/15 flex items-center justify-between gap-2">
                {familyMembers.map((m) => {
                  const isActive = selectedId === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => {
                        soundFx?.playPop?.();
                        setSelectedId(m.id);
                      }}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-mono font-semibold flex-1 transition-all duration-200 cursor-pointer ${
                        isActive
                          ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400/50 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/40 border border-transparent'
                      }`}
                    >
                      <div
                        className="h-5 w-5 rounded-full overflow-hidden border shrink-0"
                        style={{ borderColor: isActive ? m.color : 'rgba(255,255,255,0.2)' }}
                      >
                        <Image
                          src={m.avatar}
                          alt={m.shortName}
                          width={20}
                          height={20}
                          unoptimized
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <span className="truncate text-[11px]">{m.shortName}</span>
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
        <div className="mt-16 sm:mt-20 pt-8 border-t border-slate-200/80 dark:border-slate-800/80">
          <div className="text-center mb-6">
            <span className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
              Enterprise-Grade Security &amp; Reliability Standard
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4 items-center">
            {securityBadges.map((badge, idx) => {
              const Icon = badge.icon;
              return (
                <div
                  key={idx}
                  className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-white/80 dark:bg-[#0E1528] border border-slate-200/80 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 shadow-2xs backdrop-blur-sm hover:border-violet-400/50 transition-colors"
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
