'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  ShieldCheck,
  Zap,
  Send,
  Battery,
  CheckCircle2,
  Star,
  MapPin,
  Car,
  Wifi,
  Clock,
} from 'lucide-react';
import { soundFx } from '@/lib/soundFx';
import Link from 'next/link';
import Image from 'next/image';

interface FamilyMember {
  id: string;
  name: string;
  shortName: string;
  tag: string;
  avatar: string;
  statusText: string;
  speed: number;
  battery: number;
  color: string;
  x: number;
  y: number;
  activity: 'driving' | 'home' | 'school';
}

const familyMembers: FamilyMember[] = [
  {
    id: 'dad',
    name: 'Robert (Dad)',
    shortName: 'Robert',
    tag: 'In Transit',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    statusText: 'Banani Road 11',
    speed: 48,
    battery: 84,
    color: '#7C3AED',
    x: 66,
    y: 30,
    activity: 'driving',
  },
  {
    id: 'mom',
    name: 'Emma (Mom)',
    shortName: 'Emma',
    tag: 'Home',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    statusText: 'Dhanmondi 27',
    speed: 0,
    battery: 95,
    color: '#10B981',
    x: 30,
    y: 52,
    activity: 'home',
  },
  {
    id: 'son',
    name: 'Ayaan (Son)',
    shortName: 'Ayaan',
    tag: 'School',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    statusText: 'Uttara Sector 3',
    speed: 0,
    battery: 91,
    color: '#F59E0B',
    x: 55,
    y: 66,
    activity: 'school',
  },
];

export function HeroSection() {
  const [selectedId, setSelectedId] = useState('dad');
  const [liveSpeed, setLiveSpeed] = useState(48);

  const selected = familyMembers.find((m) => m.id === selectedId) ?? familyMembers[0];

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveSpeed((prev) => {
        const delta = Math.floor(Math.random() * 5) - 2;
        const next = prev + delta;
        return Math.max(34, Math.min(62, next));
      });
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-[92dvh] flex flex-col justify-center overflow-hidden pt-28 pb-20 bg-background">

      {/* ── AMBIENT BACKGROUND ── */}
      <div className="absolute inset-0 -z-10 pointer-events-none select-none overflow-hidden">
        <div className="absolute top-0 left-[8%] w-[50vw] h-[50vw] max-w-[700px] max-h-[700px] bg-primary/15 rounded-full blur-[160px]" />
        <div className="absolute top-[10%] right-[5%] w-[40vw] h-[40vw] max-w-[600px] max-h-[600px] bg-chart-3/15 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-[25%] w-[35vw] h-[35vw] max-w-[500px] max-h-[500px] bg-chart-5/10 rounded-full blur-[140px]" />
        <div className="absolute inset-0 bg-[radial-gradient(#80808010_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* ════════════════════════════════════════════════════
              LEFT COLUMN: VALUE PROPOSITION
          ════════════════════════════════════════════════════ */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-7"
          >
            {/* Live Status Chip */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-card/90 border border-border/60 text-xs font-semibold shadow-xs backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-primary font-bold tracking-wide">Real-Time GPS Engine</span>
              <span className="h-3.5 w-px bg-border" />
              <span className="text-chart-5 font-mono text-[11px]">15s Live Sync</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[3.4rem] font-extrabold tracking-tight leading-[1.1] text-foreground">
              Live Location &<br className="hidden sm:block" /> Safety for{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-indigo-600 to-chart-3 dark:from-primary dark:via-indigo-400 dark:to-chart-3">
                Every Family
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-md">
              Know when loved ones arrive safely, get automatic geofence alerts, and track live — with instant Ghost Mode privacy anytime.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3.5">
              <Button
                size="lg"
                className="h-12 px-7 font-bold text-sm rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/35 transition-all hover:-translate-y-0.5 active:translate-y-0 group gap-2"
                onClick={() => soundFx.playPop()}
                asChild
              >
                <Link href="/register">
                  Start Tracking Free
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-12 px-6 font-bold text-sm rounded-full bg-card backdrop-blur-md border border-border text-foreground shadow-xs hover:bg-muted transition-all hover:-translate-y-0.5 active:translate-y-0 gap-2"
                onClick={() => soundFx.playPop()}
                asChild
              >
                <Link href="/login">
                  <Send size={15} className="text-primary" />
                  Live Dashboard
                </Link>
              </Button>
            </div>

            {/* Inline Trust Line */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1 flex-wrap">
              <span className="flex items-center gap-1.5 font-medium"><ShieldCheck size={14} className="text-chart-5" /> E2E Encrypted</span>
              <span className="h-3 w-px bg-border" />
              <span className="flex items-center gap-1.5 font-medium"><Zap size={14} className="text-primary" /> Sub-20ms Latency</span>
              <span className="h-3 w-px bg-border" />
              <span className="flex items-center gap-1.5 font-medium"><Battery size={14} className="text-chart-3" /> &lt;3% Battery Use</span>
            </div>

            {/* Social Proof */}
            <div className="flex items-center gap-4 pt-1">
              <div className="flex -space-x-2.5">
                {[
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
                  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80',
                  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80',
                  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80',
                ].map((src, i) => (
                  <div key={i} className="h-8 w-8 rounded-full border-[2.5px] border-card overflow-hidden shadow-xs">
                    <Image src={src} alt="User" width={32} height={32} unoptimized className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-0.5 text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={13} className="fill-amber-400" />)}
                  <span className="text-xs font-bold text-foreground ml-1.5">4.9/5</span>
                </div>
                <div className="text-[11px] text-muted-foreground font-medium">Trusted by 2,000+ families</div>
              </div>
            </div>
          </motion.div>

          {/* ════════════════════════════════════════════════════
              RIGHT COLUMN: CLEAN APP UI PREVIEW CARD
          ════════════════════════════════════════════════════ */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="relative flex items-center justify-center"
          >
            {/* Ambient Glow Behind Card */}
            <div className="absolute w-[85%] h-[85%] rounded-[40px] bg-gradient-to-tr from-primary/20 via-chart-3/10 to-chart-5/15 blur-3xl pointer-events-none" />

            {/* Main App Preview Card */}
            <div className="relative w-full max-w-[560px] rounded-[28px] bg-card border border-border/60 shadow-sm overflow-hidden">

              {/* ── App Header Bar ── */}
              <div className="px-5 py-3.5 bg-card border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-md shadow-primary/20">
                    <MapPin size={15} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-foreground">Family Circle</div>
                    <div className="text-[10px] text-chart-5 font-semibold flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      3 members online
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground bg-muted px-2.5 py-1 rounded-lg border border-border">
                  <Clock size={11} /> Live
                </div>
              </div>

              {/* ── Map Canvas ── */}
              <div className="relative aspect-[16/10] bg-[#0B1022] overflow-hidden select-none">
                {/* Map SVG Layer */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                  {/* Blocks */}
                  <rect x="5%" y="6%" width="38%" height="34%" rx="10" fill="#111932" />
                  <rect x="50%" y="8%" width="44%" height="32%" rx="10" fill="#111932" />
                  <rect x="7%" y="46%" width="34%" height="44%" rx="10" fill="#111932" />
                  <rect x="48%" y="44%" width="46%" height="48%" rx="10" fill="#111932" />

                  {/* Roads */}
                  <path d="M0 145 H 700" stroke="#1A2342" strokeWidth="20" />
                  <path d="M0 300 H 700" stroke="#1A2342" strokeWidth="16" />
                  <path d="M290 0 V 500" stroke="#1A2342" strokeWidth="22" />
                  <path d="M600 0 V 500" stroke="#1A2342" strokeWidth="14" />

                  {/* Lane Lines */}
                  <path d="M0 145 H 700" stroke="#2A3A5C" strokeWidth="1.5" strokeDasharray="6 6" />
                  <path d="M0 300 H 700" stroke="#2A3A5C" strokeWidth="1.5" strokeDasharray="6 6" />
                  <path d="M290 0 V 500" stroke="#2A3A5C" strokeWidth="1.5" strokeDasharray="6 6" />

                  {/* Route */}
                  <path d="M 200 270 Q 290 270, 400 145 T 580 110" fill="none" stroke="#7C3AED" strokeWidth="4" strokeLinecap="round" className="drop-shadow-[0_0_10px_rgba(124,58,237,0.8)]" />
                </svg>

                {/* Home Geofence */}
                <div className="absolute" style={{ top: '50%', left: '28%', transform: 'translate(-50%,-50%)' }}>
                  <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-2 border-dashed border-emerald-400/60 bg-emerald-500/8 flex items-center justify-center">
                    <span className="text-[9px] font-mono font-bold text-emerald-300 bg-slate-900/80 px-2 py-0.5 rounded-full border border-emerald-400/40 backdrop-blur-sm">
                      🏠 Home
                    </span>
                  </div>
                </div>

                {/* School Geofence */}
                <div className="absolute" style={{ top: '64%', left: '56%', transform: 'translate(-50%,-50%)' }}>
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 border-dashed border-amber-400/60 bg-amber-500/8 flex items-center justify-center">
                    <span className="text-[9px] font-mono font-bold text-amber-300 bg-slate-900/80 px-2 py-0.5 rounded-full border border-amber-400/40 backdrop-blur-sm">
                      🎓 School
                    </span>
                  </div>
                </div>

                {/* ── MEMBER PINS ── */}
                {familyMembers.map((m) => {
                  const isActive = selectedId === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => { soundFx.playPop(); setSelectedId(m.id); }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10 cursor-pointer group"
                      style={{ left: `${m.x}%`, top: `${m.y}%` }}
                    >
                      {isActive && (
                        <span className="animate-ping absolute -inset-1.5 rounded-full opacity-60" style={{ backgroundColor: m.color }} />
                      )}
                      <div
                        className={`relative h-10 w-10 sm:h-11 sm:w-11 rounded-full border-2 overflow-hidden shadow-lg transition-transform duration-200 group-hover:scale-110 ${isActive ? 'border-white ring-[3px] scale-110' : 'border-white/80'
                          }`}
                        style={isActive ? { boxShadow: `0 0 0 3px ${m.color}40` } : undefined}
                      >
                        <Image src={m.avatar} alt={m.name} width={44} height={44} unoptimized className="h-full w-full object-cover" />
                      </div>
                      <div
                        className={`mt-1 px-2 py-0.5 rounded-md text-[10px] font-bold whitespace-nowrap shadow-md border backdrop-blur-sm ${isActive
                            ? 'bg-primary text-primary-foreground border-primary/50'
                            : 'bg-slate-900/85 text-slate-200 border-white/10'
                          }`}
                      >
                        {m.shortName}
                      </div>
                    </button>
                  );
                })}

                {/* Bottom GPS Coordinates Bar */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-950/90 to-transparent px-4 py-2 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span>23.8103°N, 90.4125°E</span>
                  <span className="text-primary bg-primary/15 px-2 py-0.5 rounded-md border border-primary/20">±2.5m Accuracy</span>
                </div>
              </div>

              {/* ── SELECTED MEMBER DETAIL PANEL ── */}
              <div className="p-4 bg-card border-t border-border">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-xl overflow-hidden border-2 shrink-0 shadow-md" style={{ borderColor: selected.color }}>
                    <Image src={selected.avatar} alt={selected.name} width={44} height={44} unoptimized className="h-full w-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-foreground truncate">{selected.name}</span>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md shrink-0" style={{ backgroundColor: `${selected.color}15`, color: selected.color, border: `1px solid ${selected.color}30` }}>
                        {selected.tag}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{selected.statusText}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {selected.activity === 'driving' && (
                      <div className="flex items-center gap-1 text-xs font-mono font-bold bg-primary/10 text-primary px-2.5 py-1.5 rounded-lg border border-primary/20">
                        <Car size={13} />
                        <span>{liveSpeed}</span>
                        <span className="text-[9px] text-primary/60 font-normal">km/h</span>
                      </div>
                    )}
                    {selected.activity === 'home' && (
                      <div className="flex items-center gap-1 text-xs font-mono font-bold bg-chart-5/10 text-chart-5 px-2.5 py-1.5 rounded-lg border border-chart-5/20">
                        <Wifi size={13} />
                        <span>Home</span>
                      </div>
                    )}
                    {selected.activity === 'school' && (
                      <div className="flex items-center gap-1 text-xs font-mono font-bold bg-chart-4/10 text-chart-4 px-2.5 py-1.5 rounded-lg border border-chart-4/20">
                        <CheckCircle2 size={13} />
                        <span>Safe</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1 text-xs font-mono text-muted-foreground bg-muted px-2 py-1.5 rounded-lg border border-border">
                      <Battery size={13} className="text-chart-5" />
                      <span>{selected.battery}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── BOTTOM MEMBER QUICK SELECT TABS ── */}
              <div className="px-4 py-3 bg-muted/40 border-t border-border flex items-center justify-between gap-2">
                {familyMembers.map((m) => {
                  const isActive = selectedId === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => { soundFx.playPop(); setSelectedId(m.id); }}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold flex-1 transition-all cursor-pointer ${isActive
                          ? 'bg-card shadow-md border border-border text-foreground'
                          : 'text-muted-foreground hover:bg-card/40'
                        }`}
                    >
                      <div className="h-7 w-7 rounded-full overflow-hidden border-2 shrink-0" style={{ borderColor: isActive ? m.color : 'transparent' }}>
                        <Image src={m.avatar} alt={m.shortName} width={28} height={28} unoptimized className="h-full w-full object-cover" />
                      </div>
                      <div className="text-left hidden sm:block">
                        <div className="text-[11px] font-bold leading-tight truncate">{m.shortName}</div>
                        <div className="text-[9px] font-medium leading-tight" style={{ color: m.color }}>{m.tag}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

          </motion.div>
        </div>
      </div>
    </section>
  );
}
