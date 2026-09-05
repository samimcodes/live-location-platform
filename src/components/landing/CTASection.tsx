'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  Send,
  ShieldCheck,
  Users,
  Zap,
  Star,
  Sparkles,
  CheckCircle2,
  Smartphone,
  QrCode,
} from 'lucide-react';
import { soundFx } from '@/lib/soundFx';
import Link from 'next/link';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';

const stats = [
  { value: 2400, suffix: '+', label: 'Active Families', icon: Users, decimals: 0 },
  { value: 99.99, suffix: '%', label: 'Uptime SLA', icon: Zap, decimals: 2 },
  { value: 4.9, suffix: ' / 5', label: 'App Store Rating', icon: Star, decimals: 1 },
];

export function CTASection() {
  return (
    <section
      id="cta"
      className="py-24 sm:py-32 px-4 sm:px-6 relative overflow-hidden bg-white dark:bg-[#0B1020] scroll-mt-16 border-t border-slate-200/80 dark:border-slate-800/80"
    >
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 36 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="relative overflow-hidden rounded-[36px] border border-white/20 shadow-[0_24px_70px_rgba(124,58,237,0.25)]"
        >
          {/* Layered Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#4C1D95] via-[#6D28D9] to-[#2563EB]" />
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-purple-500/20 to-indigo-400/30" />

          {/* Decorative Blurred Orbs */}
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-white/15 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-cyan-400/15 blur-3xl pointer-events-none" />

          {/* Subtle Dot Grid Pattern Overlay */}
          <div className="absolute inset-0 opacity-[0.08] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px]" />

          <div className="relative z-10 p-8 sm:p-14 lg:p-16">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              {/* Left: Text Content */}
              <div className="lg:col-span-7 space-y-7 text-left">
                {/* Label Pill */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 border border-white/25 text-white text-xs font-bold backdrop-blur-md">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Free Forever for Families • Up to 5 Members</span>
                </div>

                {/* Headline */}
                <div className="space-y-3">
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-[1.12]">
                    Ready to keep your loved ones{' '}
                    <span className="text-violet-200">safe and connected?</span>
                  </h2>
                  <p className="text-violet-100 text-base sm:text-lg leading-relaxed font-normal max-w-lg">
                    Join thousands of families who trust LocaLink for real-time live map tracking, automated geofence safe zones, and total peace of mind.
                  </p>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-wrap gap-3.5 items-center">
                  <Button
                    size="lg"
                    className="h-13 px-8 font-bold text-sm rounded-2xl bg-white text-violet-700 hover:bg-white/95 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-0.5 active:translate-y-0 group gap-2.5 cursor-pointer"
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
                    className="h-13 px-7 font-bold text-sm rounded-2xl border border-white/30 text-white hover:bg-white/10 hover:border-white/50 transition-all backdrop-blur-sm gap-2 cursor-pointer"
                    onClick={() => soundFx.playPop()}
                    asChild
                  >
                    <Link href="/login">
                      <Send size={15} />
                      <span>Live Dashboard</span>
                    </Link>
                  </Button>
                </div>

                {/* Trust Markers */}
                <div className="flex items-center gap-2 text-white/80 text-xs font-medium pt-1">
                  <ShieldCheck size={16} className="text-emerald-400 shrink-0" />
                  <span>
                    No credit card required • Instant 60-second setup • End-to-end encrypted
                  </span>
                </div>
              </div>

              {/* Right: Stats Glass Panel & Mobile Ready Preview */}
              <div className="lg:col-span-5">
                <motion.div
                  initial={{ opacity: 0, scale: 0.94, x: 20 }}
                  whileInView={{ opacity: 1, scale: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
                  className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-[28px] p-7 sm:p-8 space-y-6 shadow-2xl"
                >
                  {/* Mini Header */}
                  <div className="flex items-center justify-between pb-4 border-b border-white/15">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center text-white shadow-sm">
                        <Smartphone size={20} />
                      </div>
                      <div className="text-left">
                        <div className="text-white font-black text-sm">Cross-Platform Sync</div>
                        <div className="text-violet-200 text-xs font-medium">
                          iOS • Android • Web Dashboard
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-bold bg-emerald-400/20 text-emerald-300 px-2.5 py-1 rounded-full border border-emerald-400/30">
                      LIVE
                    </span>
                  </div>

                  {/* Stats Counter List with Smooth Count-Up Animation */}
                  <div className="space-y-3">
                    {stats.map((s) => {
                      const Icon = s.icon;
                      return (
                        <div
                          key={s.label}
                          className="flex items-center justify-between p-3 rounded-xl bg-white/10 border border-white/10 text-white"
                        >
                          <div className="flex items-center gap-2.5 text-xs text-violet-100 font-medium">
                            <Icon size={16} className="text-violet-300" />
                            <span>{s.label}</span>
                          </div>
                          <span className="font-mono font-black text-base text-white">
                            <AnimatedCounter
                              value={s.value}
                              suffix={s.suffix}
                              decimals={s.decimals}
                              duration={2.2}
                            />
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Quick Setup Pill */}
                  <div className="pt-2 flex items-center justify-between text-xs text-violet-200 font-medium">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 size={14} className="text-emerald-300" /> Instant Circle Code
                    </span>
                    <span className="font-mono text-white/70">v2.0 Latest</span>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
