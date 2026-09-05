'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Navigation,
  Compass,
  ShieldCheck,
  Layers,
  Bell,
  Smartphone,
  Radio,
  History,
  Play,
  Pause,
  MapPin,
  CheckCircle2,
  Zap,
  Sliders,
  Sparkles,
  ArrowRight,
  Eye,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { soundFx } from '@/lib/soundFx';
import Link from 'next/link';
import Image from 'next/image';

const mapFeatures = [
  {
    icon: Navigation,
    title: 'Pinpoint 15s Refresh',
    badge: 'WEBSOCKET ENGINE',
    description:
      'Ultra-low latency GPS coordinates sync continuously via WebSockets so you experience smooth, fluid real-time movement.',
    gradient: 'from-violet-600 to-indigo-600',
    color: 'text-violet-600 dark:text-violet-400',
  },
  {
    icon: Bell,
    title: 'Smart Geofence Safe Zones',
    badge: 'AUTOMATED ALERTS',
    description:
      'Define safe perimeters around Home, School, or Work. Receive instant push and SMS notifications on every arrival and departure.',
    gradient: 'from-pink-500 to-rose-600',
    color: 'text-pink-600 dark:text-pink-400',
  },
  {
    icon: Compass,
    title: 'Speed & Motion AI Tracking',
    badge: 'DRIVE TELEMETRY',
    description:
      'Live speed telemetry, motion state detection (driving, walking, transit, stationary), and heading compass directions.',
    gradient: 'from-cyan-500 to-blue-600',
    color: 'text-cyan-600 dark:text-cyan-400',
  },
  {
    icon: ShieldCheck,
    title: 'Ghost Mode Privacy Shield',
    badge: 'ZERO-KNOWLEDGE',
    description:
      'Total control over your visibility. Pause sharing, set approximate neighborhood location, or freeze your pin anytime.',
    gradient: 'from-emerald-500 to-teal-600',
    color: 'text-emerald-600 dark:text-emerald-400',
  },
];

export function LocationMapSection() {
  const [activeTab, setActiveTab] = useState<'live' | 'geofence' | 'history'>('live');
  const [geofenceRadius, setGeofenceRadius] = useState(350);
  const [isPlayingRoute, setIsPlayingRoute] = useState(true);
  const [routeProgress, setRouteProgress] = useState(45);
  const [showGeofenceToast, setShowGeofenceToast] = useState(true);

  const handleTabChange = (tab: 'live' | 'geofence' | 'history') => {
    soundFx.playPop();
    setActiveTab(tab);
  };

  // Route playback simulation loop
  useEffect(() => {
    if (!isPlayingRoute || activeTab !== 'history') return;
    const interval = setInterval(() => {
      setRouteProgress((prev) => (prev >= 98 ? 10 : prev + 2));
    }, 400);
    return () => clearInterval(interval);
  }, [isPlayingRoute, activeTab]);

  return (
    <section
      id="map-preview"
      className="py-24 sm:py-32 px-4 sm:px-6 relative overflow-hidden bg-white dark:bg-[#0B1020] border-y border-slate-200/80 dark:border-slate-800/80 scroll-mt-20"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 -left-48 w-96 h-96 bg-violet-500/10 dark:bg-violet-900/15 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-10 -right-48 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-900/15 rounded-full blur-[130px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Information & Feature Cards */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.65, ease: 'easeOut' }}
            className="lg:col-span-6 space-y-8 text-left"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-50 dark:bg-violet-950/60 border border-violet-200/80 dark:border-violet-800/70 text-violet-700 dark:text-violet-300 text-xs font-bold shadow-2xs">
              <Radio size={14} className="animate-pulse text-violet-600 dark:text-violet-400" />
              <span>Live Map Intelligence Hub</span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-950 dark:text-white tracking-tight leading-[1.12]">
              Real-time map tracking engineered for{' '}
              <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 bg-clip-text text-transparent">
                absolute peace of mind
              </span>
            </h2>

            <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg leading-relaxed font-normal">
              LocaLink turns raw GPS satellite coordinates into a fluid, battery-optimized live map experience. Keep tabs on family members, monitor travel speeds, and receive instant automated entry and exit alerts.
            </p>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {mapFeatures.map((feat) => {
                const Icon = feat.icon;
                return (
                  <div
                    key={feat.title}
                    className="p-5 rounded-2xl bg-slate-50/80 dark:bg-[#10172C] border border-slate-200/80 dark:border-slate-800/80 shadow-2xs hover:border-violet-400/50 dark:hover:border-violet-700/60 hover:shadow-md transition-all duration-300 group text-left relative overflow-hidden"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div
                        className={cn(
                          'h-10 w-10 rounded-xl bg-gradient-to-br text-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300',
                          feat.gradient
                        )}
                      >
                        <Icon size={18} />
                      </div>
                      <span className="text-[10px] font-mono font-black tracking-wider text-slate-400 dark:text-slate-400 uppercase">
                        {feat.badge}
                      </span>
                    </div>
                    <h3 className="font-black text-slate-900 dark:text-foreground text-sm mb-1.5">
                      {feat.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {feat.description}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 flex items-center gap-4">
              <Button
                size="lg"
                className="h-12 px-7 font-bold text-sm rounded-xl bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-500/25 hover:shadow-xl transition-all group gap-2 cursor-pointer border border-violet-400/30"
                onClick={() => soundFx.playPop()}
                asChild
              >
                <Link href="/register">
                  <span>Explore Live Map</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
          </motion.div>

          {/* Right Column: Interactive Map Sandbox Graphics */}
          <motion.div
            initial={{ opacity: 0, x: 30, scale: 0.97 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.7, delay: 0.15, ease: 'easeOut' }}
            className="lg:col-span-6 relative"
          >
            {/* Ambient backlight */}
            <div className="absolute -inset-3 rounded-3xl bg-gradient-to-r from-violet-600/20 to-indigo-500/20 blur-2xl pointer-events-none" />

            <div className="relative rounded-[28px] overflow-hidden border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#0E1528] shadow-[0_20px_50px_rgba(15,23,42,0.12)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.5)]">
              {/* Card Header Interactive Switcher */}
              <div className="p-4 border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/90 dark:bg-[#121B33] flex items-center justify-between flex-wrap gap-2.5 backdrop-blur-md">
                <div className="flex items-center gap-2 text-xs font-black text-slate-800 dark:text-slate-200">
                  <Layers size={16} className="text-violet-600 dark:text-violet-400" />
                  <span>Interactive Map Sandbox</span>
                </div>
                <div className="flex bg-white dark:bg-[#0A0F1F] rounded-xl p-1 border border-slate-200/80 dark:border-slate-800 gap-1 text-xs shadow-2xs">
                  {(['live', 'geofence', 'history'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => handleTabChange(tab)}
                      className={cn(
                        'px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer text-xs',
                        activeTab === tab
                          ? 'bg-violet-600 text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      )}
                    >
                      {tab === 'live'
                        ? 'Live GPS'
                        : tab === 'geofence'
                        ? 'Safe Zones'
                        : 'Trip Replay'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Map Preview Canvas */}
              <div className="relative aspect-[4/3] bg-[#0C1224] overflow-hidden flex items-center justify-center select-none">
                {/* SVG Roads & Blocks */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="5%" y="8%" width="38%" height="34%" rx="12" fill="#131C35" />
                  <rect x="50%" y="8%" width="44%" height="34%" rx="12" fill="#131C35" />
                  <rect x="8%" y="50%" width="38%" height="42%" rx="12" fill="#131C35" />
                  <rect x="52%" y="48%" width="42%" height="44%" rx="12" fill="#131C35" />

                  {/* Expressways */}
                  <path d="M0 160 H 700" stroke="#1D2A4F" strokeWidth="20" />
                  <path d="M0 320 H 700" stroke="#1D2A4F" strokeWidth="16" />
                  <path d="M280 0 V 500" stroke="#1D2A4F" strokeWidth="22" />

                  {/* Route Polyline */}
                  <path
                    d="M 120 280 Q 240 280, 360 160 T 560 110"
                    fill="none"
                    stroke="#8B5CF6"
                    strokeWidth="4"
                    strokeLinecap="round"
                    className="drop-shadow-[0_0_10px_rgba(139,92,246,0.9)]"
                  />
                </svg>

                {/* ── Mode 1: Safe Zones Tab with Dynamic Slider Ring ── */}
                {activeTab === 'geofence' && (
                  <motion.div
                    key="geofence-mode"
                    initial={{ scale: 0.85, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute z-10 flex flex-col items-center justify-center pointer-events-none"
                  >
                    <div
                      className="rounded-full border-2 border-dashed border-emerald-400 bg-emerald-500/15 flex items-center justify-center transition-all duration-300 shadow-[0_0_25px_rgba(16,185,129,0.3)]"
                      style={{
                        width: `${Math.min(270, geofenceRadius / 1.5)}px`,
                        height: `${Math.min(270, geofenceRadius / 1.5)}px`,
                      }}
                    >
                      <div className="h-4 w-4 rounded-full bg-emerald-400 animate-ping opacity-60" />
                    </div>
                    <span className="mt-2 text-[10px] font-mono font-black text-emerald-300 bg-slate-950/90 px-3 py-1 rounded-full border border-emerald-400/50 shadow-md backdrop-blur-md">
                      School Perimeter: {geofenceRadius}m
                    </span>
                  </motion.div>
                )}

                {/* ── Mode 2: Live GPS Tab ── */}
                {activeTab === 'live' && (
                  <div className="absolute w-44 h-44 rounded-full border border-dashed border-violet-400/50 bg-violet-500/10 animate-pulse flex items-center justify-center pointer-events-none">
                    <span className="text-[10px] font-mono font-bold text-violet-300 bg-slate-950/80 px-2.5 py-0.5 rounded-full border border-violet-400/40">
                      Home Safe Zone (500m)
                    </span>
                  </div>
                )}

                {/* ── Mode 3: Trip Replay Mode ── */}
                {activeTab === 'history' && (
                  <motion.div
                    key="history-mode"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute top-4 left-4 right-4 z-10 bg-slate-950/90 border border-violet-500/40 rounded-2xl p-3 backdrop-blur-md shadow-xl flex items-center justify-between text-xs text-white"
                  >
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                      <span className="font-bold">Route Log:</span>
                      <span className="text-violet-300 font-mono">14.2 km • 28 mins • 46 km/h</span>
                    </div>
                    <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded-md border border-cyan-800">
                      {routeProgress}% completed
                    </span>
                  </motion.div>
                )}

                {/* Member Pins on Map */}
                <div className="absolute top-[32%] left-[26%] flex flex-col items-center z-20">
                  <div className="relative">
                    <span className="animate-ping absolute inset-0 rounded-full bg-emerald-500 opacity-60" />
                    <div className="relative h-10 w-10 rounded-full bg-emerald-500 border-2 border-white shadow-xl overflow-hidden">
                      <Image
                        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
                        alt="Emma"
                        width={40}
                        height={40}
                        unoptimized
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <div className="mt-1 bg-slate-950/90 text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-white/20 flex items-center gap-1.5 shadow-md">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Emma • Safe at Home
                  </div>
                </div>

                <div className="absolute bottom-[28%] right-[22%] flex flex-col items-center z-20">
                  <div className="h-10 w-10 rounded-full bg-violet-600 border-2 border-white shadow-xl overflow-hidden">
                    <Image
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"
                      alt="Robert"
                      width={40}
                      height={40}
                      unoptimized
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="mt-1 bg-slate-950/90 text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-white/20 flex items-center gap-1.5 shadow-md">
                    <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
                    Robert • 48 km/h
                  </div>
                </div>

                {/* Simulated Geofence Entry Notification Pill */}
                {activeTab === 'geofence' && showGeofenceToast && (
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="absolute top-3 left-4 right-4 bg-emerald-950/90 border border-emerald-500/50 text-emerald-200 px-3 py-2 rounded-xl text-xs font-medium backdrop-blur-md shadow-lg flex items-center justify-between z-30"
                  >
                    <div className="flex items-center gap-2">
                      <Bell size={14} className="text-emerald-400 animate-bounce" />
                      <span>
                        <strong>Geofence Alert:</strong> Emma arrived safely at Home.
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400">Just now</span>
                  </motion.div>
                )}

                {/* Bottom Interactive Controls Strip */}
                <div className="absolute bottom-3 left-3 right-3 bg-slate-950/90 backdrop-blur-md border border-slate-800 rounded-xl p-3 flex items-center justify-between text-xs text-slate-200 shadow-xl z-20">
                  {activeTab === 'geofence' ? (
                    <div className="flex items-center justify-between w-full gap-3">
                      <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5 shrink-0">
                        <Sliders size={13} className="text-violet-400" /> Radius: {geofenceRadius}m
                      </span>
                      <input
                        type="range"
                        min="150"
                        max="600"
                        step="50"
                        value={geofenceRadius}
                        onChange={(e) => setGeofenceRadius(Number(e.target.value))}
                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-violet-500"
                      />
                    </div>
                  ) : activeTab === 'history' ? (
                    <div className="flex items-center justify-between w-full gap-3">
                      <button
                        onClick={() => {
                          soundFx.playPop();
                          setIsPlayingRoute(!isPlayingRoute);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors"
                      >
                        {isPlayingRoute ? <Pause size={13} /> : <Play size={13} />}
                        <span>{isPlayingRoute ? 'Pause' : 'Play'}</span>
                      </button>
                      <div className="flex-1">
                        <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-violet-500 to-cyan-400 h-full rounded-full transition-all duration-300"
                            style={{ width: `${routeProgress}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-[11px] font-mono text-slate-400">Speed: 2x</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2 text-slate-200 font-medium">
                        <Smartphone size={14} className="text-violet-400" />
                        <span>
                          GPS Signal: <strong className="text-emerald-400">Active (±1.5m)</strong>
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">15s Live Sync</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
