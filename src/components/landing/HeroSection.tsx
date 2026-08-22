'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { MapPin, ArrowRight, ShieldCheck, Zap, Globe, Lock, Navigation, Smartphone } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export function HeroSection() {
  return (
    <section className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden pt-28 pb-20">
      {/* ── Animated Background ── */}
      <div className="absolute inset-0 -z-10 bg-background overflow-hidden">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:24px_24px] opacity-15" />
        
        {/* Soft background glow orbs */}
        <div className="absolute top-[15%] left-[15%] w-[35vw] h-[35vw] max-w-[500px] max-h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[10%] right-[15%] w-[40vw] h-[40vw] max-w-[600px] max-h-[600px] bg-purple-500/10 rounded-full blur-[140px] pointer-events-none" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full">
        <div className="flex flex-col items-center text-center">
          
          {/* Live Status Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-primary/25 bg-primary/10 text-primary text-xs sm:text-sm font-bold mb-8 shadow-sm backdrop-blur-md"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
            LocaLink 2.0 is now live — Real-time Family GPS Platform
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
            className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight text-foreground mb-6 max-w-5xl leading-[1.1]"
          >
            Always stay close to{' '}
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
              the people
            </span>{' '}
            you love.
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
            className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed font-normal"
          >
            LocaLink brings your family and friends together on a beautifully simple, secure, real-time map with automatic safety alerts.
          </motion.p>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
            className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center"
          >
            <Button size="lg" className="h-14 px-8 text-base font-bold rounded-2xl shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 transition-all hover:-translate-y-0.5 group" asChild>
              <Link href="/register">
                Get Started Free
                <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="h-14 px-8 text-base font-bold rounded-2xl border-border/80 bg-card/60 backdrop-blur-md hover:bg-muted/80 transition-all" asChild>
              <Link href="/login">Sign In to Dashboard</Link>
            </Button>
          </motion.div>

          {/* Micro Trust Badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-wrap justify-center gap-x-8 gap-y-3 mt-10 text-xs sm:text-sm font-semibold text-muted-foreground"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-primary" />
              End-to-End Encrypted
            </div>
            <div className="flex items-center gap-2">
              <Globe size={16} className="text-primary" />
              High-Precision GPS
            </div>
            <div className="flex items-center gap-2">
              <Zap size={16} className="text-primary" />
              Instant Socket Sync
            </div>
          </motion.div>

          {/* ── Mock Dashboard & Live Map Preview ── */}
          <motion.div
            id="map-preview"
            initial={{ opacity: 0, y: 50, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
            className="mt-16 w-full max-w-5xl relative scroll-mt-28"
          >
            {/* Outer Subtle Ambient Glow */}
            <div className="absolute -inset-3 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-fuchsia-500/20 rounded-3xl blur-xl -z-10" />
            
            {/* Container Frame */}
            <div className="relative rounded-3xl overflow-hidden border border-border/80 shadow-2xl bg-card">
              {/* Header Window Controller */}
              <div className="h-12 border-b border-border/60 flex items-center justify-between px-4 bg-muted/40">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                </div>
                <div className="px-4 py-1 rounded-lg bg-background/80 border border-border/50 text-[11px] font-mono text-muted-foreground flex items-center gap-2 shadow-inner">
                  <Lock size={11} className="text-emerald-500" />
                  localink.app/dashboard/map
                </div>
                <div className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  Live Socket Active
                </div>
              </div>

              {/* Map Preview Stage */}
              <div className="relative aspect-[16/10] md:aspect-[21/9] bg-muted/20 flex items-center justify-center overflow-hidden">
                {/* Background Grid Pattern */}
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#6366f1_1.5px,transparent_1.5px)] [background-size:20px_20px]" />
                
                {/* Center Callout Pill */}
                <div className="relative z-10 text-center p-6 rounded-2xl bg-card/90 backdrop-blur-xl border border-border/80 shadow-xl max-w-xs">
                  <div className="inline-flex h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 items-center justify-center mb-3 shadow-md text-white">
                    <MapPin size={24} />
                  </div>
                  <h3 className="font-bold text-foreground text-base mb-1">Interactive Family Map</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">Sign in to track real-time locations, battery levels, and route history.</p>
                </div>

                {/* Simulated Floating Markers */}
                {[
                  { top: '22%', left: '16%', name: 'Mom', letter: 'M', info: 'At Home • 92% Battery', color: 'from-emerald-500 to-teal-600', delay: 0 },
                  { top: '68%', left: '22%', name: 'Dad', letter: 'D', info: 'Speed: 45 km/h', color: 'from-blue-500 to-indigo-600', delay: 0.15 },
                  { top: '30%', left: '76%', name: 'Alex', letter: 'A', info: 'Arrived at Campus', color: 'from-purple-500 to-fuchsia-600', delay: 0.3 },
                  { top: '72%', left: '78%', name: 'Sarah', letter: 'S', info: 'At Gym • 2.1 km away', color: 'from-amber-500 to-orange-600', delay: 0.45 },
                ].map((m) => (
                  <motion.div
                    key={m.name}
                    initial={{ opacity: 0, scale: 0, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 + m.delay, type: 'spring' }}
                    className="absolute flex flex-col items-center gap-1"
                    style={{ top: m.top, left: m.left }}
                  >
                    <div className="relative">
                      <div className={cn("absolute -inset-1 rounded-full opacity-60 animate-ping bg-gradient-to-br", m.color)} />
                      <div className={cn("relative h-11 w-11 rounded-full border-2 border-background shadow-lg flex items-center justify-center text-white text-base font-bold bg-gradient-to-br", m.color)}>
                        {m.letter}
                      </div>
                    </div>
                    <div className="bg-card/95 backdrop-blur-md px-2.5 py-1 rounded-xl shadow-lg border border-border/80 text-foreground flex flex-col items-center text-center">
                      <span className="text-[11px] font-extrabold">{m.name}</span>
                      <span className="text-[9px] text-muted-foreground">{m.info}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
