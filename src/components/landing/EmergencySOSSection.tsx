'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldAlert,
  AlertTriangle,
  Radio,
  Navigation,
  Bell,
  PhoneCall,
  CheckCircle2,
  Volume2,
  VolumeX,
  Sparkles,
  ArrowRight,
  Battery,
  MapPin,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { soundFx } from '@/lib/soundFx';
import Link from 'next/link';

export function EmergencySOSSection() {
  const [sosTriggered, setSosTriggered] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Countdown handler for realistic SOS dispatch abort window
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown !== null && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (countdown === 0) {
      if (soundEnabled) soundFx.playAlert();
      setSosTriggered(true);
      setCountdown(null);
    }
    return () => clearTimeout(timer);
  }, [countdown, soundEnabled]);

  const handleSosClick = () => {
    if (sosTriggered) {
      soundFx.playPop();
      setSosTriggered(false);
      setCountdown(null);
      return;
    }

    if (countdown !== null) {
      // Abort
      soundFx.playPop();
      setCountdown(null);
      return;
    }

    // Start 3-second countdown before final dispatch
    soundFx.playPop();
    setCountdown(3);
  };

  return (
    <section
      id="emergency-sos"
      className="py-24 sm:py-32 px-4 sm:px-6 relative overflow-hidden bg-slate-50 dark:bg-[#0A0D18] border-y border-slate-200/80 dark:border-slate-800/80 scroll-mt-16"
    >
      {/* Background ambient red aura */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-red-500/10 dark:bg-red-950/20 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: SOS Value Proposition */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.65, ease: 'easeOut' }}
            className="lg:col-span-6 space-y-7 text-left"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400 text-xs font-bold border border-red-200 dark:border-red-800/60 shadow-2xs">
              <ShieldAlert size={15} className="animate-pulse" />
              <span>1-Click Emergency SOS Dispatch</span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-950 dark:text-white tracking-tight leading-[1.12]">
              Instant emergency alerts when{' '}
              <span className="bg-gradient-to-r from-red-600 via-rose-500 to-orange-500 bg-clip-text text-transparent">
                seconds count the most
              </span>
            </h2>

            <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg leading-relaxed font-normal">
              In an unexpected accident, unsafe situation, or vehicle breakdown, triggering the SOS broadcast sends live coordinates, high-accuracy breadcrumbs, and battery telemetry to every contact in your trusted circle.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
              {[
                {
                  title: 'Sub-Second Broadcast',
                  desc: 'Pushes sirens and SMS coordinates simultaneously to all circle members.',
                },
                {
                  title: 'Live Breadcrumb Trail',
                  desc: 'Shares an interactive GPS navigation link to guide emergency responders.',
                },
                {
                  title: 'Discreet Silent Trigger',
                  desc: 'Can be initiated silently without drawing unwanted phone attention.',
                },
                {
                  title: 'Device & Battery Telemetry',
                  desc: 'Broadcasts remaining battery percentage, speed, and exact altitude.',
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="p-4 rounded-2xl bg-white dark:bg-[#10172C] border border-slate-200/80 dark:border-slate-800/80 shadow-2xs text-left"
                >
                  <div className="flex items-center gap-2 text-xs font-black text-slate-900 dark:text-foreground mb-1">
                    <CheckCircle2 size={15} className="text-red-500 shrink-0" />
                    <span>{item.title}</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <Button
                size="lg"
                className="h-12 px-7 font-bold text-sm rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/25 transition-all group gap-2 cursor-pointer border border-red-500/30"
                onClick={() => soundFx.playPop()}
                asChild
              >
                <Link href="/register">
                  <span>Enable Family Safety Free</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
          </motion.div>

          {/* Right Column: Interactive SOS Simulator Command Sandbox */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 24 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.7, delay: 0.15, ease: 'easeOut' }}
            className="lg:col-span-6"
          >
            <div className="rounded-[30px] border border-red-200/80 dark:border-red-900/50 bg-white dark:bg-[#0E1528] shadow-[0_20px_50px_rgba(239,68,68,0.1)] p-6 sm:p-8 space-y-6 relative overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-3 text-left">
                  <div className="h-10 w-10 rounded-xl bg-red-100 dark:bg-red-950/80 text-red-600 flex items-center justify-center font-bold">
                    <ShieldAlert size={20} className={sosTriggered ? 'animate-bounce' : ''} />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 dark:text-foreground text-sm">
                      Emergency SOS Command Simulator
                    </h3>
                    <p className="text-[11px] text-slate-500 font-mono">
                      LAT 23.8103°N • LON 90.4125°E
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      soundFx.playPop();
                      setSoundEnabled(!soundEnabled);
                    }}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors cursor-pointer"
                    title={soundEnabled ? 'Siren Sound On' : 'Siren Muted'}
                  >
                    {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
                  </button>
                  <span
                    className={`text-[11px] font-mono font-bold px-3 py-1 rounded-full border ${
                      sosTriggered
                        ? 'bg-red-600 text-white border-red-500 animate-pulse'
                        : countdown !== null
                        ? 'bg-amber-500 text-white border-amber-400'
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-300'
                    }`}
                  >
                    {sosTriggered
                      ? '🚨 DISPATCH ACTIVE'
                      : countdown !== null
                      ? `ARMING IN ${countdown}s`
                      : 'STANDBY READY'}
                  </span>
                </div>
              </div>

              {/* SOS Interactive Big Button Area */}
              <div className="flex flex-col items-center justify-center py-6 text-center space-y-6">
                <div className="relative flex items-center justify-center">
                  {/* Outer pulsating rings */}
                  {(sosTriggered || countdown !== null) && (
                    <>
                      <span className="animate-ping absolute w-44 h-44 rounded-full bg-red-500 opacity-40 pointer-events-none" />
                      <span className="animate-pulse absolute w-56 h-56 rounded-full bg-red-400/20 pointer-events-none" />
                    </>
                  )}

                  <button
                    onClick={handleSosClick}
                    className={`relative h-32 w-32 sm:h-36 sm:w-36 rounded-full font-black text-white text-xl sm:text-2xl shadow-2xl transition-all duration-300 cursor-pointer flex flex-col items-center justify-center gap-1 active:scale-95 border-4 border-white dark:border-[#0E1528] ${
                      sosTriggered
                        ? 'bg-gradient-to-br from-red-600 to-rose-800 shadow-red-600/60 scale-105 ring-4 ring-red-400'
                        : countdown !== null
                        ? 'bg-gradient-to-br from-amber-500 to-red-600 shadow-amber-500/50 scale-105 ring-4 ring-amber-300'
                        : 'bg-gradient-to-br from-red-500 via-rose-600 to-red-700 shadow-red-500/40 hover:scale-105 hover:shadow-red-500/60'
                    }`}
                  >
                    <ShieldAlert size={36} />
                    <span>{sosTriggered ? 'DISARM' : countdown !== null ? `${countdown}s` : 'SOS'}</span>
                  </button>
                </div>

                <div className="space-y-1">
                  <div className="font-black text-base text-slate-900 dark:text-foreground">
                    {sosTriggered
                      ? '🚨 Emergency Dispatch Broadcast Active!'
                      : countdown !== null
                      ? '⚠️ Warning: Click again to cancel emergency dispatch'
                      : 'Click the SOS button to test emergency dispatch'}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                    {sosTriggered
                      ? 'Instant push broadcast sent to all circle members with live GPS tracking.'
                      : countdown !== null
                      ? 'Simulating abort safety countdown window before sirens sound.'
                      : 'Simulates what happens when a family member triggers emergency safety.'}
                  </p>
                </div>
              </div>

              {/* Dynamic Notification Popup Simulation */}
              <AnimatePresence>
                {sosTriggered && (
                  <motion.div
                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 15, scale: 0.95 }}
                    className="p-4 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-xl flex items-center justify-between gap-3 text-left border border-white/20"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                        <AlertTriangle size={20} className="text-white animate-bounce" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-black text-xs sm:text-sm truncate">
                          SOS Broadcast: Robert (Dad)
                        </div>
                        <div className="text-[11px] text-white/90 font-mono truncate">
                          Lat: 23.8103, Lon: 90.4125 • Battery: 86% • Speed: 0 km/h
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-bold bg-white/20 px-2.5 py-1 rounded-md shrink-0">
                      DISPATCHED
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
