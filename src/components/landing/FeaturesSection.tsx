'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  MapPin, Bell, Users, History, Shield,
  Heart, Radio, Zap, Lock, Globe, CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const features = [
  {
    icon: MapPin,
    title: 'Live 15s Location Sync',
    description: 'Track movements smoothly on an interactive map with continuous refresh intervals and high-accuracy GPS coordinates.',
    colSpan: 'md:col-span-2 lg:col-span-8',
    gradient: 'from-[#7C3AED] to-[#6366F1]',
    glowColor: 'rgba(124,58,237,0.10)',
    badge: 'LIVE',
    badgeColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400',
  },
  {
    icon: Bell,
    title: 'Smart Geofencing',
    description: 'Get automated alerts when family members arrive at or leave home, school, or work zones.',
    colSpan: 'md:col-span-1 lg:col-span-4',
    gradient: 'from-[#EC4899] to-[#F43F5E]',
    glowColor: 'rgba(236,72,153,0.08)',
    badge: 'INSTANT',
    badgeColor: 'bg-pink-100 text-pink-700 dark:bg-pink-950/50 dark:text-pink-400',
  },
  {
    icon: Users,
    title: 'Private Family Circles',
    description: 'Organize loved ones into invite-only circles with custom map views and individual permissions.',
    colSpan: 'md:col-span-1 lg:col-span-4',
    gradient: 'from-[#8B5CF6] to-[#A855F7]',
    glowColor: 'rgba(139,92,246,0.08)',
    badge: 'PRIVATE',
    badgeColor: 'bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-400',
  },
  {
    icon: History,
    title: '30-Day Route History',
    description: 'Replay past trips, review travel routes, and inspect timestamped location logs with interactive playback.',
    colSpan: 'md:col-span-2 lg:col-span-4',
    gradient: 'from-[#3B82F6] to-[#06B6D4]',
    glowColor: 'rgba(59,130,246,0.08)',
    badge: 'HISTORY',
    badgeColor: 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400',
  },
  {
    icon: Shield,
    title: 'Ghost Mode and Privacy',
    description: 'Control your visibility anytime. Enable Ghost Mode to pause sharing or freeze location on demand.',
    colSpan: 'md:col-span-1 lg:col-span-4',
    gradient: 'from-[#10B981] to-[#059669]',
    glowColor: 'rgba(16,185,129,0.08)',
    badge: 'GHOST',
    badgeColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400',
  },
];

const stats = [
  { value: '15s', label: 'Update Interval', icon: Radio },
  { value: '99.9%', label: 'Uptime', icon: Globe },
  { value: 'E2E', label: 'Encrypted', icon: Lock },
  { value: '2K+', label: 'Active Users', icon: Zap },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 sm:py-32 px-4 sm:px-6 relative overflow-hidden bg-[#F8F9FD] dark:bg-background">
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-purple-200/20 dark:bg-purple-900/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-center mb-16 sm:mb-20"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EDE9FE] border border-purple-200/60 text-[#7C3AED] text-xs font-bold shadow-sm mb-6">
            <Heart size={14} className="fill-[#7C3AED]/20 text-[#7C3AED]" />
            Built for Family Safety
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-[#0F172A] dark:text-foreground mb-6 tracking-tight">
            Features engineered for{' '}
            <span className="text-[#7C3AED] dark:text-purple-400">complete peace of mind</span>
          </h2>
          <p className="text-[#64748B] dark:text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto leading-relaxed font-normal">
            LocaLink provides effortless real-time awareness without intruding on individual privacy.
          </p>
        </motion.div>

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
                  'group relative bg-white dark:bg-card rounded-3xl border border-slate-100 dark:border-border/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] hover:border-purple-200/60 dark:hover:border-purple-800/50 transition-all duration-300 overflow-hidden flex flex-col p-8',
                  f.colSpan
                )}
                style={{ background: 'radial-gradient(ellipse at 100% 0%, ' + f.glowColor + ' 0%, transparent 55%)' }}
              >
                <div className={cn('absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300', f.gradient)} />
                <div className={cn('self-start inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black tracking-widest mb-5', f.badgeColor)}>
                  {f.badge}
                </div>
                <div className={cn('h-12 w-12 rounded-2xl bg-gradient-to-br text-white flex items-center justify-center mb-5 shadow-md group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300', f.gradient)}>
                  <Icon size={22} />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-[#0F172A] dark:text-foreground mb-3 tracking-tight">{f.title}</h3>
                <p className="text-[#64748B] dark:text-muted-foreground text-sm sm:text-base leading-relaxed font-normal max-w-sm">{f.description}</p>
                <div className={cn('absolute -bottom-16 -right-16 w-40 h-40 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none bg-gradient-to-br', f.gradient)} />
              </motion.div>
            );
          })}

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay: 0.4, ease: 'easeOut' }}
            className="md:col-span-2 lg:col-span-12 rounded-3xl bg-gradient-to-br from-[#7C3AED] via-[#6D28D9] to-[#4F46E5] p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-8 border border-purple-500/20 shadow-xl shadow-purple-500/10 relative overflow-hidden"
          >
            <div className="absolute inset-0 opacity-[0.07] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]" />
            <div className="absolute -top-24 -left-24 w-64 h-64 rounded-full bg-white/10 blur-3xl pointer-events-none" />
            <div className="relative z-10 text-left">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 size={16} className="text-emerald-400" />
                <span className="text-emerald-300 text-xs font-bold uppercase tracking-widest">Platform Reliability</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Platform you can rely on.</h3>
              <p className="text-purple-200 text-sm font-normal mt-1.5 max-w-sm">Built for real-time families, engineered for scale and privacy.</p>
            </div>
            <div className="relative z-10 flex items-center gap-8 sm:gap-12 flex-wrap justify-center">
              {stats.map(({ value, label, icon: StatIcon }) => (
                <div key={label} className="flex flex-col items-center text-center">
                  <StatIcon size={15} className="text-purple-300 mb-1.5" />
                  <span className="text-3xl font-black text-white leading-none">{value}</span>
                  <span className="text-purple-300 text-[11px] font-semibold mt-1 tracking-wide uppercase">{label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
