'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Navigation, Compass, ShieldCheck, Layers, Bell, Smartphone, Radio } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const mapFeatures = [
  {
    icon: Navigation,
    title: 'Pinpoint 15s Refresh',
    description: 'Ultra-low latency coordinates update continuously so you always see precise movements in real time.',
  },
  {
    icon: Bell,
    title: 'Custom Geofence Zones',
    description: 'Create safe perimeters around Home, School, or Work. Get notified the second a family member enters or exits.',
  },
  {
    icon: Compass,
    title: 'Speed & Route Tracking',
    description: 'Monitor movement speed, heading direction, and elevation during road trips or daily commutes.',
  },
  {
    icon: ShieldCheck,
    title: 'End-to-End Privacy',
    description: 'Location data is encrypted in transit and at rest. You retain full control over who gets access to your map.',
  },
];

export function LocationMapSection() {
  const [activeTab, setActiveTab] = useState<'live' | 'geofence' | 'history'>('live');

  return (
    <section className="py-24 sm:py-32 px-4 sm:px-6 relative overflow-hidden bg-white dark:bg-background border-y border-slate-100 dark:border-border/60">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Information & Feature Cards */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="lg:col-span-6 space-y-8 text-left"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EDE9FE] border border-purple-200/60 text-[#7C3AED] text-xs font-bold shadow-sm">
              <Radio size={14} className="animate-pulse" />
              Live Map Intelligence
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#0F172A] dark:text-foreground tracking-tight leading-[1.15]">
              Real-time map tracking designed for{' '}
              <span className="text-[#7C3AED] dark:text-purple-400">instant clarity</span>
            </h2>

            <p className="text-[#64748B] dark:text-muted-foreground text-base sm:text-lg leading-relaxed font-normal">
              LocaLink turns raw GPS data into a smooth, interactive live map experience. Keep tabs on family members, monitor speed, and set automated alerts effortlessly.
            </p>

            {/* Interactive Feature List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {mapFeatures.map((feat) => {
                const Icon = feat.icon;
                return (
                  <div
                    key={feat.title}
                    className="p-5 rounded-2xl bg-[#F8F9FD] dark:bg-card border border-slate-100 dark:border-border/80 shadow-sm hover:border-purple-200 hover:shadow-md transition-all duration-300 group text-left"
                  >
                    <div className="h-10 w-10 rounded-xl bg-[#EDE9FE] text-[#7C3AED] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <Icon size={20} />
                    </div>
                    <h3 className="font-bold text-[#0F172A] dark:text-foreground text-base mb-1">{feat.title}</h3>
                    <p className="text-xs text-[#64748B] dark:text-muted-foreground leading-relaxed">{feat.description}</p>
                  </div>
                );
              })}
            </div>

            <div className="pt-2">
              <Button
                size="lg"
                className="h-13 px-7 font-bold text-sm rounded-2xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white shadow-lg shadow-purple-500/30 hover:shadow-xl transition-all group gap-2"
                asChild
              >
                <Link href="/register">
                  Explore Live Map Demo
                  <Navigation size={16} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </Button>
            </div>
          </motion.div>

          {/* Right Column: Visual Interactive Map Graphic Frame */}
          <motion.div
            initial={{ opacity: 0, x: 30, scale: 0.96 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
            className="lg:col-span-6 relative"
          >
            <div className="relative rounded-[2.5rem] overflow-hidden border border-slate-100 dark:border-border bg-white dark:bg-card shadow-[0_20px_60px_rgba(124,58,237,0.08)]">
              {/* Card Header Switcher */}
              <div className="p-4 border-b border-slate-100 dark:border-border bg-slate-50/70 dark:bg-muted/30 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-muted-foreground">
                  <Layers size={14} className="text-[#7C3AED]" />
                  Map Layer Control
                </div>
                <div className="flex bg-white dark:bg-card rounded-xl p-1 border border-slate-200/60 dark:border-border gap-1 text-xs shadow-sm">
                  {(['live', 'geofence', 'history'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={cn(
                        "px-3 py-1 rounded-lg font-bold capitalize transition-all",
                        activeTab === tab
                          ? "bg-[#7C3AED] text-white shadow-sm"
                          : "text-slate-600 dark:text-muted-foreground hover:text-slate-900"
                      )}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Map Preview Display */}
              <div className="relative aspect-[4/3] bg-[#EEF2F7] dark:bg-slate-900 overflow-hidden flex items-center justify-center">
                {/* Simulated Road Lines */}
                <svg className="absolute inset-0 w-full h-full fill-none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="5%" y="10%" width="35%" height="30%" rx="14" fill="#F8FAFC" />
                  <rect x="50%" y="15%" width="45%" height="35%" rx="14" fill="#F8FAFC" />
                  <rect x="10%" y="50%" width="40%" height="35%" rx="14" fill="#F8FAFC" />

                  <path d="M-20 120 H 600" stroke="#FFFFFF" strokeWidth="12" />
                  <path d="M-20 260 H 600" stroke="#FFFFFF" strokeWidth="10" />
                  <path d="M 220 -20 V 500" stroke="#FFFFFF" strokeWidth="12" />

                  <path d="M 120 260 Q 220 260, 320 180 T 480 120" stroke="#7C3AED" strokeWidth="4" strokeLinecap="round" className="drop-shadow-[0_0_8px_rgba(124,58,237,0.7)]" />
                </svg>

                {/* Center Pulse Geofence Circle */}
                <div className="absolute w-44 h-44 rounded-full border-2 border-[#7C3AED]/40 bg-[#7C3AED]/10 animate-pulse flex items-center justify-center">
                  <span className="text-[10px] font-mono font-bold text-[#7C3AED] bg-white px-2.5 py-0.5 rounded-full border border-purple-200 shadow-sm">
                    Home Safe Zone (500m)
                  </span>
                </div>

                {/* Active Member Pins */}
                <div className="absolute top-1/3 left-1/4 flex flex-col items-center z-10">
                  <div className="relative">
                    <span className="animate-ping absolute inset-0 rounded-full bg-[#10B981] opacity-75" />
                    <div className="relative h-10 w-10 rounded-full bg-[#10B981] text-white font-bold flex items-center justify-center border-2 border-white shadow-lg text-sm overflow-hidden">
                      <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80" alt="Sarah" className="w-full h-full object-cover" />
                    </div>
                  </div>
                  <div className="mt-1 bg-white px-2.5 py-1 rounded-full text-[11px] font-bold shadow-md border border-slate-100 flex items-center gap-1.5 text-slate-800">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
                    Sarah • 42 km/h
                  </div>
                </div>

                <div className="absolute bottom-1/4 right-1/4 flex flex-col items-center z-10">
                  <div className="h-10 w-10 rounded-full bg-[#7C3AED] text-white font-bold flex items-center justify-center border-2 border-white shadow-lg text-sm overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80" alt="Alex" className="w-full h-full object-cover" />
                  </div>
                  <div className="mt-1 bg-white px-2.5 py-1 rounded-full text-[11px] font-bold shadow-md border border-slate-100 flex items-center gap-1.5 text-slate-800">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#7C3AED]" />
                    Alex • Arrived Home
                  </div>
                </div>

                {/* Status Bar */}
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md border border-slate-100 rounded-xl p-3 flex items-center justify-between text-xs shadow-lg z-20">
                  <div className="flex items-center gap-2 text-slate-800 font-medium">
                    <Smartphone size={14} className="text-[#7C3AED]" />
                    GPS Signal: <span className="font-bold text-[#10B981]">Excellent (±3m)</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">Updated 2s ago</span>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
