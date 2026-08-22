'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation, Compass, ShieldCheck, Zap, Layers, Bell, Smartphone, Radio } from 'lucide-react';
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
    <section className="py-24 sm:py-32 px-4 sm:px-6 relative overflow-hidden bg-muted/10 border-y border-border/40">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-primary/5 rounded-full blur-[140px] -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Information & Feature Cards */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="lg:col-span-6 space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider">
              <Radio size={14} className="animate-pulse" />
              Live Map Intelligence
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground tracking-tight leading-[1.15]">
              Real-time map tracking designed for <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent">instant clarity</span>
            </h2>

            <p className="text-muted-foreground text-lg leading-relaxed">
              LocaLink turns raw GPS data into a smooth, interactive live map experience. Keep tabs on family members, monitor speed, and set automated alerts effortlessly.
            </p>

            {/* Interactive Feature List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {mapFeatures.map((feat) => {
                const Icon = feat.icon;
                return (
                  <div
                    key={feat.title}
                    className="p-5 rounded-2xl bg-card border border-border/60 shadow-sm hover:border-primary/40 transition-all duration-300 group"
                  >
                    <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <Icon size={20} />
                    </div>
                    <h3 className="font-bold text-foreground text-base mb-1">{feat.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{feat.description}</p>
                  </div>
                );
              })}
            </div>

            <div className="pt-2">
              <Button size="lg" className="rounded-2xl font-bold shadow-md gap-2" asChild>
                <Link href="/register">
                  Explore Live Map Demo
                  <Navigation size={16} />
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
            <div className="relative rounded-3xl overflow-hidden border border-border/70 bg-card shadow-2xl">
              {/* Card Header Switcher */}
              <div className="p-4 border-b border-border/50 bg-muted/30 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                  <Layers size={14} className="text-primary" />
                  Map Layer Control
                </div>
                <div className="flex bg-background rounded-xl p-1 border border-border/50 gap-1 text-xs">
                  {(['live', 'geofence', 'history'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={cn(
                        "px-3 py-1 rounded-lg font-semibold capitalize transition-all",
                        activeTab === tab
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Map Preview Display */}
              <div className="relative aspect-[4/3] bg-muted/40 overflow-hidden flex items-center justify-center">
                {/* Simulated Grid SVG */}
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:16px_16px]" />

                {/* Simulated Road Lines */}
                <svg className="absolute inset-0 w-full h-full stroke-primary/20 fill-none stroke-[3]" xmlns="http://www.w3.org/2000/svg">
                  <path d="M-20 100 Q 150 40 300 180 T 600 250" />
                  <path d="M 100 -20 Q 200 200 400 350" />
                  <circle cx="300" cy="180" r="70" className="stroke-primary/40 stroke-[2] stroke-dasharray-[4_4]" />
                </svg>

                {/* Center Pulse Geofence Circle */}
                <div className="absolute w-44 h-44 rounded-full border-2 border-primary/40 bg-primary/5 animate-pulse flex items-center justify-center">
                  <span className="text-[10px] font-mono font-bold text-primary bg-background/80 px-2 py-0.5 rounded-full border border-primary/20 shadow-sm">
                    Home Safe Zone (500m)
                  </span>
                </div>

                {/* Active Member Pins */}
                <div className="absolute top-1/3 left-1/3 flex flex-col items-center">
                  <div className="relative">
                    <span className="animate-ping absolute inset-0 rounded-full bg-emerald-500 opacity-75" />
                    <div className="relative h-10 w-10 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center border-2 border-background shadow-lg text-sm">
                      S
                    </div>
                  </div>
                  <div className="mt-1 bg-background/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-bold shadow-md border border-border flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Sarah • 42 km/h
                  </div>
                </div>

                <div className="absolute bottom-1/4 right-1/4 flex flex-col items-center">
                  <div className="relative h-10 w-10 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center border-2 border-background shadow-lg text-sm">
                    A
                  </div>
                  <div className="mt-1 bg-background/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-bold shadow-md border border-border flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                    Alex • Arrived Home
                  </div>
                </div>

                {/* Status Bar */}
                <div className="absolute bottom-4 left-4 right-4 bg-card/90 backdrop-blur-md border border-border/80 rounded-xl p-3 flex items-center justify-between text-xs shadow-lg">
                  <div className="flex items-center gap-2 text-foreground font-medium">
                    <Smartphone size={14} className="text-primary" />
                    GPS Signal: <span className="font-bold text-emerald-600 dark:text-emerald-400">Excellent (±3m)</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-mono">Updated 2s ago</span>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
