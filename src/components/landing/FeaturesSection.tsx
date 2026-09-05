'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  MapPin,
  Bell,
  Users,
  History,
  Shield,
  Heart,
  Radio,
  Zap,
  Lock,
  Globe,
  CheckCircle2,
  Cpu,
  BatteryCharging,
  Share2,
  Compass,
  EyeOff,
  Eye,
  Copy,
  Check,
  Smartphone,
  Navigation,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { soundFx } from '@/lib/soundFx';

export function FeaturesSection() {
  // Interactive states inside the Bento widgets
  const [ghostActive, setGhostActive] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [livePingCount, setLivePingCount] = useState(18);

  const handleCopyCode = () => {
    soundFx.playChime();
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleToggleGhost = () => {
    soundFx.playPop();
    setGhostActive(!ghostActive);
  };

  const handleSendPing = () => {
    soundFx.playPing();
    setLivePingCount((prev) => (prev <= 14 ? 22 : prev - 2));
  };

  return (
    <section
      id="features"
      className="py-24 sm:py-32 px-4 sm:px-6 relative overflow-hidden bg-[#F6F8FD] dark:bg-background scroll-mt-16"
    >
      {/* Ambient background glows */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-violet-400/15 dark:bg-violet-900/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-center mb-16 sm:mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300 dark:border-violet-800/60 text-xs font-bold shadow-2xs mb-5">
            <Heart size={14} className="fill-violet-600/30 text-violet-600" />
            <span>Engineered for Family Safety & Privacy</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-950 dark:text-white mb-6 tracking-tight leading-[1.1]">
            Intelligent features built for{' '}
            <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 bg-clip-text text-transparent">
              complete peace of mind
            </span>
          </h2>

          <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed font-normal">
            LocaLink provides real-time awareness without ever compromising personal privacy or draining device battery.
          </p>
        </motion.div>

        {/* ── BENTO GRID ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5 auto-rows-fr">
          {/* Card 1 (Span 8): Real-time 15s GPS Engine */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="md:col-span-2 lg:col-span-8 group relative bg-white dark:bg-[#0E1528] rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_50px_rgba(124,58,237,0.1)] hover:border-violet-400/50 transition-all duration-300 p-7 sm:p-8 flex flex-col justify-between overflow-hidden"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black tracking-wider bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                LIVE WEBSOCKET PIPELINE
              </div>
              <span className="text-xs font-mono font-bold text-violet-600 dark:text-violet-400">
                {livePingCount}ms latency
              </span>
            </div>

            <div className="space-y-3 mb-6 text-left">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Continuous 15-Second High-Precision GPS Sync
              </h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed max-w-xl">
                Unlike apps that update only once every few minutes, LocaLink streams fluid coordinate updates over bi-directional WebSockets with battery-adaptive polling intervals.
              </p>
            </div>

            {/* Interactive Widget Mini-Bar */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#121B33] border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-violet-600 text-white flex items-center justify-center shadow-md">
                  <Radio size={18} className="animate-pulse" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-slate-900 dark:text-foreground">
                    Socket.IO Cluster: Active
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    23.8103°N, 90.4125°E • Bearing 48° NE
                  </div>
                </div>
              </div>

              <button
                onClick={handleSendPing}
                className="px-3.5 py-1.5 rounded-xl bg-violet-100 hover:bg-violet-200/80 text-violet-700 dark:bg-violet-950/80 dark:text-violet-300 text-xs font-bold border border-violet-200 dark:border-violet-800 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Zap size={13} />
                <span>Test WebSocket Ping</span>
              </button>
            </div>
          </motion.div>

          {/* Card 2 (Span 4): Smart Geofence Zones */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
            className="md:col-span-1 lg:col-span-4 group relative bg-white dark:bg-[#0E1528] rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_50px_rgba(236,72,153,0.1)] hover:border-pink-400/50 transition-all duration-300 p-7 sm:p-8 flex flex-col justify-between overflow-hidden"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black tracking-wider bg-pink-100 text-pink-700 dark:bg-pink-950/60 dark:text-pink-400">
                  <Bell size={11} /> SAFE ZONES
                </div>
                <span className="text-xs font-mono text-slate-400">Unlimited</span>
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight mb-2 text-left">
                Smart Geofence Boundaries
              </h3>
              <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed text-left mb-6">
                Receive instant push notifications the exact moment loved ones arrive at or depart safe spots like Home, School, or Work.
              </p>
            </div>

            {/* Notification preview widget */}
            <div className="p-3 rounded-2xl bg-pink-50/70 dark:bg-pink-950/30 border border-pink-200/70 dark:border-pink-800/50 text-left flex items-start gap-2.5">
              <div className="h-7 w-7 rounded-lg bg-pink-500 text-white flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 size={15} />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-foreground">
                  Ayaan reached School
                </div>
                <div className="text-[10px] text-pink-700 dark:text-pink-300">
                  Scholastica Campus • 08:15 AM
                </div>
              </div>
            </div>
          </motion.div>

          {/* Card 3 (Span 4): Private Family Circles */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
            className="md:col-span-1 lg:col-span-4 group relative bg-white dark:bg-[#0E1528] rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_50px_rgba(139,92,246,0.1)] hover:border-violet-400/50 transition-all duration-300 p-7 sm:p-8 flex flex-col justify-between overflow-hidden"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black tracking-wider bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-400">
                  <Users size={11} /> INVITE CODES
                </div>
                <span className="text-xs font-mono text-slate-400">Invite-Only</span>
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight mb-2 text-left">
                Private Invite-Only Circles
              </h3>
              <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed text-left mb-6">
                Organize family, close friends, or travel groups into isolated circles with custom roles, rules, and privacy.
              </p>
            </div>

            {/* Invite code preview */}
            <div className="p-3 rounded-2xl bg-violet-50 dark:bg-violet-950/40 border border-violet-200/80 dark:border-violet-800/60 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-violet-600 dark:text-violet-400">
                  Circle Code:
                </span>
                <div className="text-sm font-mono font-black text-slate-900 dark:text-foreground">
                  LOCALINK-8472
                </div>
              </div>
              <button
                onClick={handleCopyCode}
                className="p-2 rounded-xl bg-white dark:bg-card border border-violet-200 dark:border-border text-violet-700 dark:text-violet-300 hover:bg-violet-100 transition-colors cursor-pointer"
                title="Copy Invite Code"
              >
                {copiedCode ? <Check size={15} className="text-emerald-500" /> : <Copy size={15} />}
              </button>
            </div>
          </motion.div>

          {/* Card 4 (Span 4): 30-Day Journey History */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay: 0.25, ease: 'easeOut' }}
            className="md:col-span-1 lg:col-span-4 group relative bg-white dark:bg-[#0E1528] rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_50px_rgba(59,130,246,0.1)] hover:border-blue-400/50 transition-all duration-300 p-7 sm:p-8 flex flex-col justify-between overflow-hidden"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black tracking-wider bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400">
                  <History size={11} /> ROUTE REPLAY
                </div>
                <span className="text-xs font-mono text-slate-400">30-Day Logs</span>
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight mb-2 text-left">
                30-Day Interactive Trip History
              </h3>
              <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed text-left mb-6">
                Replay past journeys on the timeline with timestamps, travel duration, speed telemetry, and verified stops.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/70 dark:border-blue-800/50 text-left">
              <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-foreground mb-1">
                <span>Trip to Banani</span>
                <span className="text-blue-600 dark:text-blue-400 font-mono">14.2 km</span>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                Avg: 42 km/h • 0 stops • 24 mins
              </div>
            </div>
          </motion.div>

          {/* Card 5 (Span 4): Ghost Mode & Privacy Shield */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay: 0.3, ease: 'easeOut' }}
            className="md:col-span-1 lg:col-span-4 group relative bg-white dark:bg-[#0E1528] rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_50px_rgba(16,185,129,0.1)] hover:border-emerald-400/50 transition-all duration-300 p-7 sm:p-8 flex flex-col justify-between overflow-hidden"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black tracking-wider bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                  <Shield size={11} /> PRIVACY FIRST
                </div>
                <span className="text-xs font-mono text-slate-400">Granular</span>
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight mb-2 text-left">
                Ghost Mode Privacy Shield
              </h3>
              <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed text-left mb-6">
                Total control over your visibility. Pause sharing, set approximate city radius, or freeze your marker anytime.
              </p>
            </div>

            {/* Clickable Ghost Mode Toggle Button */}
            <button
              onClick={handleToggleGhost}
              className={`w-full p-3 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                ghostActive
                  ? 'bg-slate-900 text-white border-slate-700 shadow-md'
                  : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60'
              }`}
            >
              <div className="flex items-center gap-2 text-xs font-bold text-left">
                {ghostActive ? <EyeOff size={15} className="text-purple-400" /> : <Eye size={15} />}
                <span>{ghostActive ? 'Ghost Mode: Hidden' : 'Sharing: Precise GPS'}</span>
              </div>
              <span className="text-[10px] font-mono font-bold underline">
                {ghostActive ? 'Unhide' : 'Enable Ghost'}
              </span>
            </button>
          </motion.div>

          {/* Large Full-Width Scale & Metrics Card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay: 0.35, ease: 'easeOut' }}
            className="md:col-span-2 lg:col-span-12 rounded-3xl bg-gradient-to-br from-violet-700 via-indigo-700 to-violet-900 p-8 sm:p-10 flex flex-col lg:flex-row items-center justify-between gap-8 border border-white/20 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute inset-0 opacity-[0.07] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px]" />
            <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-white/10 blur-3xl pointer-events-none" />

            <div className="relative z-10 text-left">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 size={16} className="text-emerald-300" />
                <span className="text-emerald-300 text-xs font-black uppercase tracking-widest">
                  Infrastructure & Reliability
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Enterprise infrastructure, crafted for family peace of mind.
              </h3>
              <p className="text-violet-100 text-sm sm:text-base font-normal mt-1.5 max-w-lg">
                Ultra-low latency socket architecture, smart battery-saving geolocation polling, and instant push delivery pipelines.
              </p>
            </div>

            <div className="relative z-10 flex items-center gap-4 sm:gap-6 flex-wrap justify-center">
              {[
                { value: '15s', label: 'Refresh Rate', icon: Radio },
                { value: '99.99%', label: 'Uptime SLA', icon: Globe },
                { value: 'AES-256', label: 'Encrypted', icon: Lock },
                { value: '2.4K+', label: 'Active Families', icon: Zap },
              ].map(({ value, label, icon: StatIcon }) => (
                <div
                  key={label}
                  className="flex flex-col items-center text-center p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 min-w-[110px]"
                >
                  <StatIcon size={16} className="text-violet-200 mb-1" />
                  <span className="text-2xl sm:text-3xl font-black text-white leading-none">
                    {value}
                  </span>
                  <span className="text-violet-200 text-[10px] font-bold mt-1 tracking-wider uppercase">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
