'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  MapPin, Bell, Users, History, Shield,
  Heart, Radio, Zap, Lock, Globe, CheckCircle2,
  Cpu, BatteryCharging, Share2, Compass, EyeOff
} from 'lucide-react';
import { cn } from '@/lib/utils';

const features = [
  {
    icon: MapPin,
    title: 'Live 15s Continuous GPS Sync',
    description: 'Track family members smoothly on the interactive map with sub-20ms WebSocket updates and high-precision coordinates.',
    colSpan: 'md:col-span-2 lg:col-span-8',
    gradient: 'from-[#7C3AED] to-[#6366F1]',
    glowColor: 'rgba(124,58,237,0.12)',
    badge: 'LIVE SOCKET',
    badgeColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400',
    stat: 'Sub-20ms latency',
  },
  {
    icon: Bell,
    title: 'Smart Geofencing Zones',
    description: 'Automatic push notifications the instant your loved ones enter or leave safe spots like Home, School, or Work.',
    colSpan: 'md:col-span-1 lg:col-span-4',
    gradient: 'from-[#EC4899] to-[#F43F5E]',
    glowColor: 'rgba(236,72,153,0.10)',
    badge: 'INSTANT ALERTS',
    badgeColor: 'bg-pink-100 text-pink-700 dark:bg-pink-950/50 dark:text-pink-400',
    stat: 'Unlimited safe zones',
  },
  {
    icon: Users,
    title: 'Private Family & Friends Circles',
    description: 'Organize loved ones into invite-only circles with custom map views, roles, and granular visibility permissions.',
    colSpan: 'md:col-span-1 lg:col-span-4',
    gradient: 'from-[#8B5CF6] to-[#A855F7]',
    glowColor: 'rgba(139,92,246,0.10)',
    badge: 'PRIVATE CIRCLES',
    badgeColor: 'bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-400',
    stat: '1-Click Invite Code',
  },
  {
    icon: History,
    title: '30-Day Interactive Trip History',
    description: 'Replay past routes, check average speeds, review travel stops, and view timestamped GPS journey logs on the timeline.',
    colSpan: 'md:col-span-2 lg:col-span-4',
    gradient: 'from-[#3B82F6] to-[#06B6D4]',
    glowColor: 'rgba(59,130,246,0.10)',
    badge: 'ROUTE REPLAY',
    badgeColor: 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400',
    stat: '30-Day history replay',
  },
  {
    icon: Shield,
    title: 'Ghost Mode & Privacy Matrix',
    description: 'Total control over your visibility. Pause sharing, set approximate location, or freeze your marker with one click.',
    colSpan: 'md:col-span-1 lg:col-span-4',
    gradient: 'from-[#10B981] to-[#059669]',
    glowColor: 'rgba(16,185,129,0.10)',
    badge: 'PRIVACY FIRST',
    badgeColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400',
    stat: 'End-to-End Encrypted',
  },
];

const stats = [
  { value: '15s', label: 'Refresh Rate', icon: Radio },
  { value: '99.9%', label: 'Uptime SLA', icon: Globe },
  { value: 'E2E', label: 'Encrypted', icon: Lock },
  { value: '2K+', label: 'Active Users', icon: Zap },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 sm:py-32 px-4 sm:px-6 relative overflow-hidden bg-[#F8F9FD] dark:bg-background scroll-mt-16">
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-purple-300/20 dark:bg-purple-900/15 rounded-full blur-[130px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-center mb-16 sm:mb-20"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EDE9FE] border border-purple-200/70 text-[#7C3AED] dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800/60 text-xs font-bold shadow-2xs mb-6">
            <Heart size={14} className="fill-[#7C3AED]/20 text-[#7C3AED]" />
            Built for Family Safety & Privacy
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 dark:text-foreground mb-6 tracking-tight">
            Features engineered for{' '}
            <span className="bg-gradient-to-r from-[#7C3AED] via-[#6366F1] to-[#4F46E5] bg-clip-text text-transparent">
              complete peace of mind
            </span>
          </h2>
          <p className="text-slate-600 dark:text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto leading-relaxed font-normal">
            LocaLink provides effortless real-time awareness without ever compromising personal privacy or draining device battery.
          </p>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5 auto-rows-[minmax(260px,auto)]">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 24, scale: 0.97 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: i * 0.08, ease: 'easeOut' }}
                className={cn(
                  'group relative bg-white dark:bg-card rounded-3xl border border-slate-200/80 dark:border-border/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_50px_rgba(124,58,237,0.08)] hover:border-purple-300/80 dark:hover:border-purple-700/60 transition-all duration-300 overflow-hidden flex flex-col justify-between p-8',
                  f.colSpan
                )}
                style={{ background: 'radial-gradient(ellipse at 100% 0%, ' + f.glowColor + ' 0%, transparent 60%)' }}
              >
                <div className={cn('absolute top-0 left-0 right-0 h-1 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300', f.gradient)} />
                
                <div>
                  <div className="flex items-center justify-between gap-2 mb-5">
                    <div className={cn('inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black tracking-widest', f.badgeColor)}>
                      {f.badge}
                    </div>
                    <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500 font-semibold">{f.stat}</span>
                  </div>

                  <div className={cn('h-12 w-12 rounded-2xl bg-gradient-to-br text-white flex items-center justify-center mb-5 shadow-md group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300', f.gradient)}>
                    <Icon size={22} />
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-foreground mb-3 tracking-tight">{f.title}</h3>
                  <p className="text-slate-600 dark:text-muted-foreground text-sm sm:text-base leading-relaxed font-normal">{f.description}</p>
                </div>

                <div className={cn('absolute -bottom-16 -right-16 w-44 h-44 rounded-full blur-3xl opacity-0 group-hover:opacity-25 transition-opacity duration-500 pointer-events-none bg-gradient-to-br', f.gradient)} />
              </motion.div>
            );
          })}

          {/* Large Summary Banner Card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay: 0.4, ease: 'easeOut' }}
            className="md:col-span-2 lg:col-span-12 rounded-3xl bg-gradient-to-br from-[#7C3AED] via-[#6D28D9] to-[#4F46E5] p-8 sm:p-10 flex flex-col lg:flex-row items-center justify-between gap-8 border border-purple-400/30 shadow-xl shadow-purple-500/15 relative overflow-hidden"
          >
            <div className="absolute inset-0 opacity-[0.08] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]" />
            <div className="absolute -top-24 -left-24 w-64 h-64 rounded-full bg-white/10 blur-3xl pointer-events-none" />
            
            <div className="relative z-10 text-left">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 size={16} className="text-emerald-300" />
                <span className="text-emerald-300 text-xs font-bold uppercase tracking-widest">Platform Telemetry & Scale</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Enterprise-grade reliability for your family.</h3>
              <p className="text-purple-100 text-sm sm:text-base font-normal mt-1.5 max-w-md">Real-time socket clustering, battery-throttled polling, and instant push event pipelines.</p>
            </div>

            <div className="relative z-10 flex items-center gap-6 sm:gap-10 flex-wrap justify-center">
              {stats.map(({ value, label, icon: StatIcon }) => (
                <div key={label} className="flex flex-col items-center text-center p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 min-w-[100px]">
                  <StatIcon size={16} className="text-purple-200 mb-1" />
                  <span className="text-2xl sm:text-3xl font-black text-white leading-none">{value}</span>
                  <span className="text-purple-200 text-[10px] font-bold mt-1 tracking-wider uppercase">{label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
