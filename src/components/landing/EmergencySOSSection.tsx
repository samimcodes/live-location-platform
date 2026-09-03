'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, AlertTriangle, Radio, Navigation, Bell, PhoneCall, CheckCircle2, Volume2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { soundFx } from '@/lib/soundFx';
import Link from 'next/link';

export function EmergencySOSSection() {
  const [sosTriggered, setSosTriggered] = useState(false);

  const handleSosClick = () => {
    if (sosTriggered) {
      soundFx.playPop();
      setSosTriggered(false);
      return;
    }
    soundFx.playAlert();
    setSosTriggered(true);
  };

  return (
    <section className="py-24 sm:py-32 px-4 sm:px-6 relative overflow-hidden bg-gradient-to-b from-white via-red-50/25 to-white dark:from-background dark:via-red-950/10 dark:to-background border-y border-slate-100 dark:border-border/60">
      {/* Background ambient red glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-400/10 dark:bg-red-900/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: SOS Value Proposition */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="lg:col-span-6 space-y-6 text-left"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400 text-xs font-bold border border-red-200 dark:border-red-800/60 shadow-2xs">
              <ShieldAlert size={15} className="animate-pulse" />
              <span>Emergency 1-Click SOS Dispatch</span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-foreground tracking-tight leading-[1.15]">
              Instant emergency alerts when{' '}
              <span className="bg-gradient-to-r from-red-600 to-rose-500 bg-clip-text text-transparent">
                seconds count
              </span>
            </h2>

            <p className="text-slate-600 dark:text-muted-foreground text-base sm:text-lg leading-relaxed font-normal">
              In an emergency or accident, pressing the SOS button instantly sends silent sirens, live GPS coordinates, and battery telemetry to every member in your trusted circle.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              {[
                { title: 'Sub-second Broadcast', desc: 'Alerts all circle members simultaneously via Push & SMS.' },
                { title: 'Live GPS Pinpoint', desc: 'Shares real-time breadcrumb trail to navigate rescuers.' },
                { title: 'Silent Mode Trigger', desc: 'Can be activated discreetly without loud phone noises.' },
                { title: 'Battery Telemetry', desc: 'Includes remaining battery percentage and device status.' },
              ].map((item) => (
                <div key={item.title} className="p-3.5 rounded-2xl bg-white dark:bg-card border border-slate-200/80 dark:border-border shadow-2xs text-left">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-foreground mb-1">
                    <CheckCircle2 size={15} className="text-red-500 shrink-0" />
                    <span>{item.title}</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <Button size="lg" className="h-12 px-7 font-bold text-sm rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/25 transition-all group gap-2 cursor-pointer" asChild>
                <Link href="/register">
                  Enable Family Safety Free
                  <Navigation size={15} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </Button>
            </div>
          </motion.div>

          {/* Right Column: Interactive SOS Simulator Sandbox */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 24 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, delay: 0.15, ease: 'easeOut' }}
            className="lg:col-span-6"
          >
            <div className="rounded-3xl border border-slate-200/90 dark:border-border/90 bg-white dark:bg-card shadow-[0_20px_60px_rgba(239,68,68,0.12)] p-6 sm:p-8 space-y-6 relative overflow-hidden">
              
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-border pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-xl bg-red-50 dark:bg-red-950/60 text-red-600 flex items-center justify-center font-bold">
                    <ShieldAlert size={18} />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-slate-900 dark:text-foreground text-sm">Emergency SOS Simulator</h3>
                    <p className="text-[11px] text-slate-500">Interactive live broadcast demonstration</p>
                  </div>
                </div>

                <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-muted text-slate-600 dark:text-slate-300">
                  {sosTriggered ? '🚨 ALERT ACTIVE' : 'STANDBY READY'}
                </span>
              </div>

              {/* SOS Interactive Big Button Area */}
              <div className="flex flex-col items-center justify-center py-6 text-center space-y-5">
                <div className="relative">
                  {sosTriggered && (
                    <>
                      <span className="animate-ping absolute -inset-4 rounded-full bg-red-500 opacity-60 pointer-events-none" />
                      <span className="animate-pulse absolute -inset-8 rounded-full bg-red-400/30 pointer-events-none" />
                    </>
                  )}
                  
                  <button
                    onClick={handleSosClick}
                    className={`relative h-28 w-28 sm:h-32 sm:w-32 rounded-full font-black text-white text-xl sm:text-2xl shadow-2xl transition-all duration-300 cursor-pointer flex flex-col items-center justify-center gap-1 active:scale-95 ${
                      sosTriggered
                        ? 'bg-gradient-to-br from-red-600 to-rose-700 shadow-red-600/50 ring-4 ring-red-400 scale-105'
                        : 'bg-gradient-to-br from-red-500 via-rose-600 to-red-700 shadow-red-500/40 hover:scale-105 hover:shadow-red-500/60'
                    }`}
                  >
                    <ShieldAlert size={32} />
                    <span>{sosTriggered ? 'CANCEL' : 'SOS'}</span>
                  </button>
                </div>

                <div>
                  <div className="font-bold text-sm text-slate-900 dark:text-foreground">
                    {sosTriggered ? '🚨 Emergency Dispatch Signal Sent!' : 'Click the SOS button to test simulation'}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-muted-foreground mt-1 max-w-xs mx-auto">
                    {sosTriggered
                      ? 'Instant push broadcasted to 3 circle members with live GPS coordinates.'
                      : 'Simulate what happens when a family member triggers emergency safety.'}
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
                    className="p-4 rounded-2xl bg-red-500 text-white shadow-xl flex items-center justify-between gap-3 text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                        <AlertTriangle size={20} className="text-white animate-bounce" />
                      </div>
                      <div>
                        <div className="font-bold text-xs sm:text-sm">SOS Broadcast: Rasel Ahmed</div>
                        <div className="text-[11px] text-white/90">
                          Lat: 23.7937, Long: 90.4066 • Battery: 82% • Speed: 0 km/h
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono bg-white/20 px-2 py-1 rounded-md shrink-0">
                      JUST NOW
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
