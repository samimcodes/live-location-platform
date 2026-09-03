'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  ShieldCheck,
  Zap,
  Target,
  Send,
  Home,
  GraduationCap,
  Plus,
  Minus,
  Crosshair,
  Radio,
  Users2,
  Bell,
  History,
  Settings,
  Navigation,
  Battery,
  CheckCircle2,
  Play,
  Pause,
  ChevronDown,
  Star,
  Sparkles,
  Share2,
  Copy,
  Check,
  Lock,
  Compass,
  MapPin,
  Eye,
  EyeOff,
  Activity,
  Car,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface Member {
  id: string;
  name: string;
  role: string;
  avatar: string;
  status: string;
  speed: number;
  battery: number;
  address: string;
  color: string;
  pinX: string;
  pinY: string;
  state: 'driving' | 'home' | 'school' | 'ghost';
}

const mockMembers: Member[] = [
  {
    id: 'rasel',
    name: 'Rasel Ahmed',
    role: 'Driving',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    status: 'In Transit • 48 km/h',
    speed: 48,
    battery: 82,
    address: 'Road 11, Banani, Dhaka',
    color: '#7C3AED',
    pinX: '72%',
    pinY: '26%',
    state: 'driving',
  },
  {
    id: 'mim',
    name: 'Mim Akter',
    role: 'Safe at Home',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    status: 'Safe at Home (WiFi Connected)',
    speed: 0,
    battery: 96,
    address: 'Dhanmondi 27, Dhaka',
    color: '#3B82F6',
    pinX: '28%',
    pinY: '54%',
    state: 'home',
  },
  {
    id: 'ayaan',
    name: 'Ayaan (Son)',
    role: 'At School',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    status: 'Scholastica Campus Zone',
    speed: 0,
    battery: 89,
    address: 'Sector 3, Uttara, Dhaka',
    color: '#F59E0B',
    pinX: '65%',
    pinY: '70%',
    state: 'school',
  },
];

const mockAlerts = [
  {
    id: 1,
    title: 'Ayaan arrived at Scholastica Campus',
    desc: 'Safe Zone auto-triggered • Checked in',
    time: '2m ago',
    icon: CheckCircle2,
    color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800',
  },
  {
    id: 2,
    title: 'Rasel is in transit (Speed: 48 km/h)',
    desc: 'Heading to Banani • ETA: 10 mins',
    time: '5m ago',
    icon: Navigation,
    color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/50 border-purple-200 dark:border-purple-800',
  },
  {
    id: 3,
    title: 'Mim battery level at 96%',
    desc: 'Device active on Home High-Speed Wi-Fi',
    time: '18m ago',
    icon: Battery,
    color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800',
  },
];

export function HeroSection() {
  const [activeTab, setActiveTab] = useState<'live' | 'circles' | 'geofence' | 'history' | 'privacy'>('live');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedMember, setSelectedMember] = useState<Member>(mockMembers[0]);
  const [liveSpeed, setLiveSpeed] = useState(48);
  const [ghostMode, setGhostMode] = useState(false);
  const [historyProgress, setHistoryProgress] = useState(65);
  const [isPlayingHistory, setIsPlayingHistory] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Speed fluctuation simulation for live telemetry
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveSpeed((prev) => {
        const delta = Math.floor(Math.random() * 5) - 2;
        return Math.max(40, Math.min(55, prev + delta));
      });
    }, 2400);
    return () => clearInterval(interval);
  }, []);

  // History playback
  useEffect(() => {
    if (!isPlayingHistory) return;
    const interval = setInterval(() => {
      setHistoryProgress((prev) => {
        if (prev >= 100) {
          setIsPlayingHistory(false);
          return 100;
        }
        return prev + 5;
      });
    }, 320);
    return () => clearInterval(interval);
  }, [isPlayingHistory]);

  const handleCopyCode = () => {
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <section className="relative min-h-[92dvh] flex flex-col justify-center overflow-hidden pt-28 pb-16 bg-gradient-to-b from-[#F6F8FD] via-[#F1F4FA] to-[#E9EEF8] dark:from-background dark:via-background dark:to-card/30 text-slate-900 dark:text-foreground">
      
      {/* Background Ambient Aurora Glows */}
      <div className="absolute inset-0 -z-10 pointer-events-none select-none overflow-hidden">
        <div className="absolute top-[2%] left-[10%] w-[45vw] h-[45vw] max-w-[650px] max-h-[650px] bg-purple-400/20 dark:bg-purple-900/15 rounded-full blur-[140px]" />
        <div className="absolute top-[15%] right-[10%] w-[45vw] h-[45vw] max-w-[650px] max-h-[650px] bg-indigo-400/20 dark:bg-indigo-900/15 rounded-full blur-[160px]" />
        <div className="absolute bottom-[5%] left-[30%] w-[35vw] h-[35vw] max-w-[500px] max-h-[500px] bg-blue-400/15 dark:bg-blue-900/10 rounded-full blur-[150px]" />
        
        {/* Subtle grid mesh overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* ── LEFT COLUMN: HERO CONTENT & VALUE PROPOSITION ── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="lg:col-span-5 space-y-6 text-left"
          >
            {/* Live Telemetry Pill */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/95 dark:bg-card/90 border border-purple-200/80 dark:border-purple-800/60 text-[#7C3AED] dark:text-purple-300 text-xs font-bold shadow-xs backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="font-semibold tracking-wide">Socket.IO 4.8 Live Engine</span>
              <span className="h-3.5 w-px bg-purple-200 dark:bg-purple-800" />
              <span className="text-emerald-600 dark:text-emerald-400 font-mono text-[11px]">15s GPS Sync</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[3.35rem] font-black tracking-tight text-slate-900 dark:text-foreground leading-[1.12]">
              Real-Time Location & Safety for{' '}
              <span className="bg-gradient-to-r from-[#7C3AED] via-[#6366F1] to-[#4F46E5] bg-clip-text text-transparent">
                Loved Ones
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-600 dark:text-muted-foreground leading-relaxed font-normal max-w-lg">
              Know when family members arrive safely, replay past routes, and track movements on an interactive map — with instant Ghost Mode privacy anytime.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 pt-1">
              <Button
                size="lg"
                className="h-12 px-7 font-bold text-sm rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30 transition-all hover:-translate-y-0.5 active:translate-y-0 group gap-2"
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
                className="h-12 px-6 font-bold text-sm rounded-xl bg-white/90 dark:bg-card/90 backdrop-blur-md border-slate-200/90 dark:border-border text-slate-800 dark:text-foreground shadow-xs hover:bg-white dark:hover:bg-muted transition-all hover:-translate-y-0.5 active:translate-y-0 gap-2"
                asChild
              >
                <Link href="/login">
                  <Send size={15} className="text-[#7C3AED]" />
                  Live Dashboard
                </Link>
              </Button>
            </div>

            {/* Key Micro Trust Pills */}
            <div className="grid grid-cols-3 gap-2.5 pt-2">
              <div className="p-3 rounded-2xl bg-white/80 dark:bg-card/80 border border-slate-100 dark:border-border/80 shadow-xs flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center shrink-0">
                  <ShieldCheck size={16} />
                </div>
                <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200 leading-tight">
                  E2E Private<br />Encryption
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-white/80 dark:bg-card/80 border border-slate-100 dark:border-border/80 shadow-xs flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-[#7C3AED] flex items-center justify-center shrink-0">
                  <Target size={16} />
                </div>
                <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200 leading-tight">
                  Precise GPS<br />Geofencing
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-white/80 dark:bg-card/80 border border-slate-100 dark:border-border/80 shadow-xs flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center shrink-0">
                  <Zap size={16} />
                </div>
                <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200 leading-tight">
                  Low Battery<br />Consumption
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── RIGHT COLUMN: INTERACTIVE LIVE SANDBOX WINDOW ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: 'easeOut' }}
            className="lg:col-span-7 relative"
          >
            {/* Ambient Backlight Glow */}
            <div className="absolute -inset-4 bg-gradient-to-tr from-purple-500/25 via-indigo-500/20 to-transparent rounded-[2.5rem] blur-2xl -z-10" />

            {/* Main Interactive Glass Console */}
            <div className="relative bg-white/95 dark:bg-card/95 backdrop-blur-2xl rounded-3xl border border-slate-200/90 dark:border-border/90 shadow-[0_24px_70px_rgba(15,23,42,0.09)] dark:shadow-[0_24px_70px_rgba(0,0,0,0.45)] overflow-hidden flex flex-col aspect-[16/11]">
              
              {/* Top Chrome Window Header */}
              <div className="h-12 px-4 bg-slate-50/95 dark:bg-muted/40 border-b border-slate-100 dark:border-border flex items-center justify-between shrink-0 select-none">
                
                {/* Traffic Lights */}
                <div className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-[#FF5F56] border border-[#E0443E]" />
                  <span className="h-3 w-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]" />
                  <span className="h-3 w-3 rounded-full bg-[#27C93F] border border-[#1AAB29]" />
                </div>

                {/* Circle Pill Switcher */}
                <div className="flex items-center gap-2 bg-white dark:bg-card px-3 py-1 rounded-xl border border-slate-200/80 dark:border-border shadow-2xs text-xs font-bold text-slate-800 dark:text-foreground">
                  <Users2 size={13} className="text-[#7C3AED]" />
                  <span>Dhaka Family Circle (3)</span>
                  <ChevronDown size={12} className="text-slate-400" />
                </div>

                {/* Real-time Status Badge */}
                <div className="flex items-center gap-2 font-mono text-[11px] text-slate-600 dark:text-muted-foreground">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">Live 12ms</span>
                </div>
              </div>

              {/* Dynamic Sandbox Display Body */}
              <div className="relative flex-1 bg-[#EDF2F8] dark:bg-slate-950 overflow-hidden">
                
                {/* ────── TAB 1: LIVE MAP ────── */}
                {activeTab === 'live' && (
                  <motion.div
                    key="live-map-view"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="relative w-full h-full flex items-center justify-center select-none"
                  >
                    {/* Zoomable Vector Map Canvas */}
                    <motion.div
                      animate={{ scale: zoomLevel }}
                      transition={{ type: 'spring', stiffness: 220, damping: 26 }}
                      className="absolute inset-0 w-full h-full flex items-center justify-center"
                    >
                      {/* Stylized Modern High-Contrast Vector Map */}
                      <svg className="absolute inset-0 w-full h-full fill-none" xmlns="http://www.w3.org/2000/svg">
                        {/* Land Blocks */}
                        <rect x="4%" y="6%" width="30%" height="28%" rx="14" fill="#FFFFFF" className="dark:fill-slate-900/85" />
                        <rect x="38%" y="5%" width="28%" height="32%" rx="14" fill="#E4ECF4" className="dark:fill-slate-900/50" />
                        <rect x="70%" y="8%" width="26%" height="36%" rx="14" fill="#FFFFFF" className="dark:fill-slate-900/85" />
                        <rect x="6%" y="42%" width="36%" height="34%" rx="14" fill="#E4ECF4" className="dark:fill-slate-900/50" />
                        <rect x="48%" y="44%" width="46%" height="36%" rx="14" fill="#FFFFFF" className="dark:fill-slate-900/85" />

                        {/* Parks & Green Zones */}
                        <path d="M 52% 8% Q 64% 6%, 62% 22% Q 50% 24%, 52% 8%" fill="#DCFCE7" className="dark:fill-emerald-950/30" />
                        <path d="M 12% 52% Q 26% 50%, 24% 68% Q 10% 70%, 12% 52%" fill="#DCFCE7" className="dark:fill-emerald-950/30" />

                        {/* Lake / River */}
                        <path
                          d="M-50 110 Q 200 140, 380 270 T 600 480 T 1000 650"
                          stroke="#BAE6FD"
                          strokeWidth="24"
                          strokeLinecap="round"
                          className="dark:stroke-sky-950/40"
                        />

                        {/* Main Streets & Boulevards */}
                        <path d="M-50 120 H 1200" stroke="#FFFFFF" strokeWidth="14" className="dark:stroke-slate-800" />
                        <path d="M-50 250 H 1200" stroke="#FFFFFF" strokeWidth="12" className="dark:stroke-slate-800" />
                        <path d="M-50 380 H 1200" stroke="#FFFFFF" strokeWidth="14" className="dark:stroke-slate-800" />
                        <path d="M 180 -50 V 800" stroke="#FFFFFF" strokeWidth="12" className="dark:stroke-slate-800" />
                        <path d="M 440 -50 V 800" stroke="#FFFFFF" strokeWidth="14" className="dark:stroke-slate-800" />
                        <path d="M 700 -50 V 800" stroke="#FFFFFF" strokeWidth="12" className="dark:stroke-slate-800" />

                        {/* Animated Glowing Transit Path connecting Home to Banani */}
                        <path
                          d="M 280 260 C 280 200, 390 190, 420 160 C 450 130, 520 150, 570 110"
                          stroke="url(#sleek-route-glow)"
                          strokeWidth="6"
                          strokeLinecap="round"
                          className="drop-shadow-[0_0_12px_rgba(124,58,237,0.85)]"
                        />

                        <defs>
                          <linearGradient id="sleek-route-glow" x1="0%" y1="100%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#A855F7" />
                            <stop offset="50%" stopColor="#8B5CF6" />
                            <stop offset="100%" stopColor="#7C3AED" />
                          </linearGradient>
                        </defs>
                      </svg>

                      {/* Geofence 1: Safe Home */}
                      <div className="absolute top-[54%] left-[28%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10 pointer-events-none">
                        <div className="w-32 h-26 rounded-full bg-emerald-500/15 border-2 border-dashed border-emerald-500/50 flex items-center justify-center animate-pulse">
                          <div className="h-7 w-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md">
                            <Home size={14} />
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 mt-0.5 bg-white/95 dark:bg-card px-2.5 py-0.5 rounded-full shadow-xs border border-emerald-200 dark:border-emerald-900">
                          Home Zone (Dhanmondi)
                        </span>
                      </div>

                      {/* Geofence 2: School Campus */}
                      <div className="absolute top-[70%] left-[65%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10 pointer-events-none">
                        <div className="w-32 h-26 rounded-full bg-amber-500/15 border-2 border-dashed border-amber-500/50 flex items-center justify-center">
                          <div className="h-7 w-7 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-md">
                            <GraduationCap size={14} />
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 mt-0.5 bg-white/95 dark:bg-card px-2.5 py-0.5 rounded-full shadow-xs border border-amber-200 dark:border-amber-900">
                          Scholastica (Uttara)
                        </span>
                      </div>

                      {/* Interactive Moving Member Markers */}
                      {mockMembers.map((member) => {
                        const isSelected = selectedMember.id === member.id;
                        return (
                          <motion.div
                            key={member.id}
                            animate={{ y: isSelected ? [0, -6, 0] : [0, -3, 0] }}
                            transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
                            style={{ top: member.pinY, left: member.pinX }}
                            className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-20 cursor-pointer"
                            onClick={() => setSelectedMember(member)}
                          >
                            <div className="relative">
                              {isSelected && (
                                <span className="animate-ping absolute -inset-1 rounded-full bg-[#7C3AED] opacity-75" />
                              )}
                              <div
                                className={`relative h-11 w-11 rounded-full p-0.5 shadow-xl transition-all ${
                                  isSelected
                                    ? 'ring-4 ring-purple-500 scale-110 shadow-purple-500/40'
                                    : 'ring-2 ring-white/95 dark:ring-card hover:scale-105'
                                }`}
                                style={{ backgroundColor: member.color }}
                              >
                                <Image
                                  src={member.avatar}
                                  alt={member.name}
                                  width={44}
                                  height={44}
                                  unoptimized
                                  className="w-full h-full object-cover rounded-full"
                                />
                              </div>
                              <div
                                className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[7px] mx-auto -mt-0.5"
                                style={{ borderTopColor: member.color }}
                              />
                            </div>

                            {/* Crisp Compact Pin Badge */}
                            <div className="mt-1 bg-white/95 dark:bg-card px-2 py-0.5 rounded-lg shadow-md border border-slate-100 dark:border-border text-center flex items-center gap-1.5 backdrop-blur-sm">
                              <span className="font-bold text-[11px] text-slate-900 dark:text-foreground">
                                {member.name.split(' ')[0]}
                              </span>
                              {member.speed > 0 ? (
                                <span className="text-[9px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                                  {liveSpeed} km/h
                                </span>
                              ) : (
                                <span className="text-[9px] text-slate-500 dark:text-slate-400 font-medium">
                                  {member.role}
                                </span>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                    </motion.div>

                    {/* Top Left Floating Telemetry HUD */}
                    <div className="absolute top-3 left-3 z-20 pointer-events-none">
                      <div className="bg-white/95 dark:bg-card/95 backdrop-blur-md rounded-2xl p-2.5 shadow-md border border-slate-100 dark:border-border flex flex-col gap-1 text-left min-w-[140px]">
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-900 dark:text-foreground">
                          <span className="flex items-center gap-1">
                            <Radio size={12} className="text-[#7C3AED] animate-pulse" /> Live Telemetry
                          </span>
                          <span className="text-emerald-600 font-mono text-[10px]">{liveSpeed} km/h</span>
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-between font-mono">
                          <span>Battery: {selectedMember.battery}%</span>
                          <span>±2.5m GPS</span>
                        </div>
                      </div>
                    </div>

                    {/* Top Right Zoom Controls */}
                    <div className="absolute top-3 right-3 flex flex-col items-center gap-1 bg-white/95 dark:bg-card/95 backdrop-blur-md shadow-md border border-slate-100 dark:border-border rounded-xl p-1 z-20 text-slate-700 dark:text-slate-300">
                      <button
                        onClick={() => setZoomLevel((p) => Math.min(p + 0.15, 1.35))}
                        className="p-1 hover:bg-slate-100 dark:hover:bg-muted rounded-lg transition-colors"
                        title="Zoom In"
                      >
                        <Plus size={14} />
                      </button>
                      <button
                        onClick={() => setZoomLevel((p) => Math.max(p - 0.15, 0.85))}
                        className="p-1 hover:bg-slate-100 dark:hover:bg-muted rounded-lg transition-colors"
                        title="Zoom Out"
                      >
                        <Minus size={14} />
                      </button>
                      <button
                        onClick={() => setZoomLevel(1)}
                        className="p-1 hover:bg-slate-100 dark:hover:bg-muted rounded-lg transition-colors text-[#7C3AED]"
                        title="Recenter"
                      >
                        <Crosshair size={14} />
                      </button>
                    </div>

                    {/* Bottom Floating Member Focus Chip */}
                    <div className="absolute bottom-3 left-3 right-3 z-20">
                      <div className="bg-white/95 dark:bg-card/95 backdrop-blur-xl border border-slate-100 dark:border-border rounded-2xl px-3.5 py-2.5 shadow-lg flex items-center justify-between gap-3 text-left">
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <div className="relative shrink-0">
                            <div className="h-9 w-9 rounded-full overflow-hidden ring-2 ring-purple-500">
                              <Image
                                src={selectedMember.avatar}
                                alt={selectedMember.name}
                                width={36}
                                height={36}
                                unoptimized
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                          </div>
                          <div className="overflow-hidden">
                            <div className="font-bold text-xs text-slate-900 dark:text-foreground truncate flex items-center gap-1.5">
                              {selectedMember.name}
                              <span className="text-[10px] font-normal text-slate-500 truncate">
                                • {selectedMember.address}
                              </span>
                            </div>
                            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium truncate">
                              {selectedMember.status}
                            </div>
                          </div>
                        </div>

                        <Button size="sm" className="h-8 px-3 text-xs font-bold rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white shrink-0 gap-1.5 shadow-xs" asChild>
                          <Link href="/dashboard/map">
                            <Navigation size={12} />
                            Track Live
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ────── TAB 2: CIRCLES & INVITES ────── */}
                {activeTab === 'circles' && (
                  <motion.div
                    key="circles-view"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="p-4 sm:p-5 h-full overflow-y-auto space-y-3.5 text-left"
                  >
                    <div className="flex items-center justify-between pb-1">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-foreground">Circle Management</h3>
                        <p className="text-[11px] text-slate-500">3 Family members sharing live GPS</p>
                      </div>
                      <button
                        onClick={handleCopyCode}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-purple-50 text-[#7C3AED] dark:bg-purple-950/60 dark:text-purple-300 text-xs font-bold border border-purple-200 dark:border-purple-800 transition-colors hover:bg-purple-100"
                      >
                        {copiedCode ? <Check size={12} /> : <Copy size={12} />}
                        <span>{copiedCode ? 'Copied!' : 'Code: #LNK892'}</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {mockMembers.map((m) => (
                        <div
                          key={m.id}
                          className="bg-white dark:bg-card p-3.5 rounded-2xl border border-slate-100 dark:border-border shadow-xs flex flex-col justify-between"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="h-10 w-10 rounded-full overflow-hidden ring-2 ring-purple-400 shrink-0">
                              <Image src={m.avatar} alt={m.name} width={40} height={40} unoptimized className="w-full h-full object-cover" />
                            </div>
                            <div className="overflow-hidden">
                              <div className="font-bold text-xs text-slate-900 dark:text-foreground truncate">{m.name}</div>
                              <div className="text-[10px] text-slate-500 truncate">{m.address}</div>
                            </div>
                          </div>
                          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-border/60 flex items-center justify-between text-[10px] text-slate-600 dark:text-slate-400 font-mono">
                            <span>🔋 {m.battery}%</span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                              Active
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="p-3 rounded-2xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200/60 dark:border-purple-800/40 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-semibold text-purple-900 dark:text-purple-200">
                        <Share2 size={14} className="text-[#7C3AED]" />
                        <span>Invite more family members to this circle</span>
                      </div>
                      <Link href="/register" className="text-xs font-bold text-[#7C3AED] hover:underline">
                        Generate Invite Link →
                      </Link>
                    </div>
                  </motion.div>
                )}

                {/* ────── TAB 3: GEOFENCE ZONES ────── */}
                {activeTab === 'geofence' && (
                  <motion.div
                    key="geofence-view"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="p-4 sm:p-5 h-full overflow-y-auto space-y-3.5 text-left"
                  >
                    <div className="flex items-center justify-between pb-1">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-foreground">Geofence Safe Zones</h3>
                        <p className="text-[11px] text-slate-500">Automated entry & exit push notifications</p>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 border border-emerald-200">
                        3 Zones Active
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {mockAlerts.map((alert) => {
                        const Icon = alert.icon;
                        return (
                          <div
                            key={alert.id}
                            className="bg-white dark:bg-card p-3 rounded-2xl border border-slate-100 dark:border-border shadow-xs flex items-center justify-between gap-3"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 border ${alert.color}`}>
                                <Icon size={16} />
                              </div>
                              <div>
                                <div className="font-bold text-xs text-slate-900 dark:text-foreground">{alert.title}</div>
                                <div className="text-[10px] text-slate-500">{alert.desc}</div>
                              </div>
                            </div>
                            <span className="text-[10px] font-mono text-slate-400 shrink-0">{alert.time}</span>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* ────── TAB 4: TRIP TIMELINE REPLAY ────── */}
                {activeTab === 'history' && (
                  <motion.div
                    key="history-view"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="p-4 sm:p-5 h-full overflow-y-auto space-y-3.5 text-left"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-foreground">30-Day Trip Route Replay</h3>
                        <p className="text-[11px] text-slate-500">Rasel Ahmed • Today • 18.4 km total commute</p>
                      </div>
                      <button
                        onClick={() => setIsPlayingHistory(!isPlayingHistory)}
                        className="px-3 py-1.5 rounded-xl bg-[#7C3AED] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs hover:bg-[#6D28D9] transition-colors"
                      >
                        {isPlayingHistory ? <Pause size={12} /> : <Play size={12} />}
                        {isPlayingHistory ? 'Pause' : 'Replay Trip'}
                      </button>
                    </div>

                    <div className="bg-white dark:bg-card p-4 rounded-2xl border border-slate-100 dark:border-border space-y-3">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-600 dark:text-slate-300">08:30 AM (Dhanmondi)</span>
                        <span className="text-purple-600 font-mono font-black">{historyProgress}% complete</span>
                        <span className="text-slate-600 dark:text-slate-300">05:45 PM (Banani)</span>
                      </div>
                      
                      <div className="w-full bg-slate-100 dark:bg-muted h-2.5 rounded-full overflow-hidden">
                        <motion.div
                          className="bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-600 h-full rounded-full"
                          style={{ width: `${historyProgress}%` }}
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center pt-1 border-t border-slate-100 dark:border-border/60">
                        <div className="p-2 rounded-xl bg-slate-50 dark:bg-muted/40">
                          <div className="text-[10px] text-slate-500">Avg Speed</div>
                          <div className="text-xs font-bold font-mono text-slate-800 dark:text-foreground">38 km/h</div>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-50 dark:bg-muted/40">
                          <div className="text-[10px] text-slate-500">Top Speed</div>
                          <div className="text-xs font-bold font-mono text-purple-600">54 km/h</div>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-50 dark:bg-muted/40">
                          <div className="text-[10px] text-slate-500">Stops Made</div>
                          <div className="text-xs font-bold font-mono text-slate-800 dark:text-foreground">2 Stops</div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ────── TAB 5: PRIVACY & GHOST MODE ────── */}
                {activeTab === 'privacy' && (
                  <motion.div
                    key="privacy-view"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="p-4 sm:p-5 h-full overflow-y-auto space-y-3 text-left"
                  >
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-foreground">Privacy Shield & Controls</h3>
                      <p className="text-[11px] text-slate-500">Instant toggle visibility across circles</p>
                    </div>

                    <div className="bg-white dark:bg-card p-3.5 rounded-2xl border border-slate-100 dark:border-border flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-purple-50 text-[#7C3AED] dark:bg-purple-950/50 flex items-center justify-center">
                          {ghostMode ? <EyeOff size={18} /> : <Eye size={18} />}
                        </div>
                        <div>
                          <div className="font-bold text-xs text-slate-900 dark:text-foreground">Ghost Mode (Incognito)</div>
                          <div className="text-[10px] text-slate-500">Freeze location to last known safe pin</div>
                        </div>
                      </div>
                      <button
                        onClick={() => setGhostMode(!ghostMode)}
                        className={`w-11 h-6 rounded-full p-0.5 transition-colors ${
                          ghostMode ? 'bg-[#7C3AED]' : 'bg-slate-200 dark:bg-muted'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full bg-white transition-transform ${
                            ghostMode ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="bg-white dark:bg-card p-3.5 rounded-2xl border border-slate-100 dark:border-border flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 flex items-center justify-center">
                          <Activity size={18} />
                        </div>
                        <div>
                          <div className="font-bold text-xs text-slate-900 dark:text-foreground">Ultra Precision GPS Sync</div>
                          <div className="text-[10px] text-slate-500">15s update intervals via WebSockets</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-full">
                        Active (±2.5m)
                      </span>
                    </div>
                  </motion.div>
                )}

              </div>

              {/* Bottom Minimalist Navigation Dock */}
              <div className="h-12 bg-white/95 dark:bg-card/95 backdrop-blur-md border-t border-slate-100 dark:border-border px-3 flex items-center justify-around shrink-0 select-none">
                {[
                  { id: 'live', label: 'Live Map', icon: Radio },
                  { id: 'circles', label: 'Circles', icon: Users2 },
                  { id: 'geofence', label: 'Geofence', icon: Bell },
                  { id: 'history', label: 'Timeline', icon: History },
                  { id: 'privacy', label: 'Privacy', icon: ShieldCheck },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all text-xs ${
                        isActive
                          ? 'bg-purple-50 dark:bg-purple-950/40 text-[#7C3AED] dark:text-purple-300 font-bold'
                          : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-medium'
                      }`}
                    >
                      <Icon size={14} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

            </div>
          </motion.div>

        </div>

        {/* ── BOTTOM SOCIAL PROOF & METRICS ── */}
        <div className="relative mt-20 pt-10">
          <svg className="absolute top-0 left-0 right-0 w-full h-6 stroke-purple-200/60 dark:stroke-purple-900/40 fill-none" viewBox="0 0 1200 24" preserveAspectRatio="none">
            <path d="M0 12 Q 300 24, 600 12 T 1200 12" strokeWidth="1.5" />
          </svg>

          <div className="flex flex-col items-center text-center space-y-3 pt-2">
            <div className="flex items-center gap-1.5 text-amber-500 text-sm">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={15} className="fill-amber-400 text-amber-400" />
              ))}
              <span className="font-bold text-slate-800 dark:text-foreground text-xs ml-1">4.9 / 5.0 Rating</span>
            </div>

            <p className="text-sm font-semibold text-slate-600 dark:text-muted-foreground">
              Trusted by 2,000+ families and circles worldwide for real-time safety
            </p>

            <div className="flex items-center gap-3">
              <div className="flex -space-x-2.5 overflow-hidden">
                {[
                  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
                  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
                  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
                  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
                  "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=150&q=80",
                ].map((url, idx) => (
                  <Image
                    key={idx}
                    src={url}
                    alt={`User ${idx}`}
                    width={32}
                    height={32}
                    unoptimized
                    className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-background object-cover shadow-xs hover:scale-110 transition-transform"
                  />
                ))}
              </div>

              <span className="px-3 py-1 rounded-full bg-[#7C3AED] text-white font-bold text-xs shadow-xs">
                Active Circles 2K+
              </span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
