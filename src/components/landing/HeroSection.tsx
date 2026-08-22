'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
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
} from 'lucide-react';
import Link from 'next/link';

export function HeroSection() {
  const [activeTab, setActiveTab] = useState<'live' | 'circles' | 'alerts' | 'history' | 'settings'>('live');
  const [zoomLevel, setZoomLevel] = useState(1);

  return (
    <section className="relative min-h-[100dvh] flex flex-col justify-center overflow-hidden pt-28 pb-16 bg-[#F8F9FD] dark:bg-background text-slate-900 dark:text-foreground">
      
      {/* ── Background Subtle Ambient Waves ── */}
      <div className="absolute inset-0 -z-10 pointer-events-none select-none overflow-hidden">
        <div className="absolute top-[8%] left-[5%] w-[45vw] h-[45vw] max-w-[650px] max-h-[650px] bg-purple-200/30 dark:bg-purple-900/10 rounded-full blur-[140px]" />
        <div className="absolute top-[20%] right-[5%] w-[45vw] h-[45vw] max-w-[650px] max-h-[650px] bg-indigo-200/25 dark:bg-indigo-900/10 rounded-full blur-[160px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* ── LEFT COLUMN ── */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="lg:col-span-5 space-y-6 text-left"
          >
            {/* Status Pill Badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EDE9FE] border border-purple-200/50 text-[#7C3AED] text-xs font-bold shadow-sm"
            >
              <span className="h-2 w-2 rounded-full bg-[#10B981] animate-pulse" />
              LocaLink 2.0 • Ultra-Low Latency GPS Tracking
            </motion.div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-[#0F172A] dark:text-foreground leading-[1.12]">
              Always stay close<br />
              to <span className="text-[#7C3AED] dark:text-purple-400">the people</span><br />
              you love.
            </h1>

            {/* Subtitle */}
            <p className="text-base text-[#64748B] dark:text-muted-foreground leading-relaxed font-normal max-w-md">
              LocaLink brings your family and friends together on an interactive, real-time map with automatic safety geofences and instant alerts.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-1">
              <Button
                size="lg"
                className="h-13 px-7 font-bold text-sm rounded-2xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white shadow-lg shadow-purple-500/30 hover:shadow-xl transition-all hover:-translate-y-0.5 active:translate-y-0 group gap-2"
                asChild
              >
                <Link href="/register">
                  Get Started Free
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="h-13 px-6 font-bold text-sm rounded-2xl bg-white border border-slate-200 text-[#1E293B] dark:bg-card dark:border-border dark:text-foreground shadow-sm hover:bg-slate-50 dark:hover:bg-muted transition-all hover:-translate-y-0.5 active:translate-y-0 gap-2"
                asChild
              >
                <Link href="/login">
                  <Send size={15} className="text-[#7C3AED]" />
                  Sign In to Dashboard
                </Link>
              </Button>
            </div>

            {/* Micro Trust Badges */}
            <div className="grid grid-cols-3 gap-3 pt-4">
              <div className="flex items-center gap-2.5 group">
                <div className="h-8 w-8 rounded-full bg-[#ECFDF5] text-[#10B981] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <ShieldCheck size={16} />
                </div>
                <div className="text-[11px] font-bold text-[#475569] dark:text-muted-foreground leading-tight">
                  End-to-End<br />Encrypted
                </div>
              </div>

              <div className="flex items-center gap-2.5 group">
                <div className="h-8 w-8 rounded-full bg-[#EDE9FE] text-[#7C3AED] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Target size={16} />
                </div>
                <div className="text-[11px] font-bold text-[#475569] dark:text-muted-foreground leading-tight">
                  High-Precision<br />GPS
                </div>
              </div>

              <div className="flex items-center gap-2.5 group">
                <div className="h-8 w-8 rounded-full bg-[#FDF2F8] text-[#EC4899] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Zap size={16} />
                </div>
                <div className="text-[11px] font-bold text-[#475569] dark:text-muted-foreground leading-tight">
                  Instant 15s<br />Socket Sync
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── RIGHT COLUMN: EXACT INTERACTIVE MAP CARD ── */}
          <motion.div
            id="map-preview"
            initial={{ opacity: 0, scale: 0.96, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
            className="lg:col-span-7 relative"
          >
            {/* Outer Subtle Glow Container */}
            <div className="absolute -inset-3 bg-gradient-to-r from-purple-400/15 to-indigo-400/15 rounded-[3rem] blur-2xl -z-10" />

            {/* Main Interactive Card Frame */}
            <div className="relative bg-white dark:bg-card rounded-[2.5rem] p-3 sm:p-5 border border-slate-100 dark:border-border shadow-[0_25px_70px_rgba(124,58,237,0.09)] overflow-hidden aspect-[16/11]">
              
              {/* Map Surface Background with subtle scale zoom interaction */}
              <motion.div
                animate={{ scale: zoomLevel }}
                transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                className="relative w-full h-full rounded-[2rem] bg-[#EEF2F7] dark:bg-slate-900 overflow-hidden flex items-center justify-center"
              >
                
                {/* ── High-Fidelity Vector Map Graphics matching image exactly ── */}
                <svg className="absolute inset-0 w-full h-full fill-none" xmlns="http://www.w3.org/2000/svg">
                  {/* City Land & Building Blocks */}
                  <rect x="3%" y="6%" width="32%" height="26%" rx="14" fill="#F8FAFC" className="dark:fill-slate-800/40" />
                  <rect x="38%" y="5%" width="28%" height="30%" rx="14" fill="#E2E8F0" className="dark:fill-slate-800/60" />
                  <rect x="69%" y="10%" width="28%" height="35%" rx="14" fill="#F8FAFC" className="dark:fill-slate-800/40" />
                  <rect x="6%" y="38%" width="36%" height="30%" rx="14" fill="#E2E8F0" className="dark:fill-slate-800/60" />
                  <rect x="48%" y="42%" width="48%" height="36%" rx="14" fill="#F8FAFC" className="dark:fill-slate-800/40" />

                  {/* Green Park Areas */}
                  <path d="M 52% 8% Q 62% 6%, 60% 20% Q 50% 22%, 52% 8%" fill="#DCFCE7" className="dark:fill-emerald-950/30" />
                  <path d="M 12% 52% Q 24% 50%, 22% 66% Q 10% 68%, 12% 52%" fill="#DCFCE7" className="dark:fill-emerald-950/30" />
                  <path d="M 76% 54% Q 86% 52%, 84% 64% Q 74% 66%, 76% 54%" fill="#DCFCE7" className="dark:fill-emerald-950/30" />

                  {/* Blue Winding River (matching image) */}
                  <path
                    d="M-50 100 Q 200 130, 380 260 T 600 480 T 1000 650"
                    stroke="#BAE6FD"
                    strokeWidth="20"
                    strokeLinecap="round"
                    className="dark:stroke-sky-950/40"
                  />

                  {/* Clean City Street Lines */}
                  <path d="M-50 120 H 1200" stroke="#FFFFFF" strokeWidth="12" className="dark:stroke-slate-700/60" />
                  <path d="M-50 240 H 1200" stroke="#FFFFFF" strokeWidth="10" className="dark:stroke-slate-700/60" />
                  <path d="M-50 380 H 1200" stroke="#FFFFFF" strokeWidth="14" className="dark:stroke-slate-700/60" />
                  <path d="M 180 -50 V 800" stroke="#FFFFFF" strokeWidth="12" className="dark:stroke-slate-700/60" />
                  <path d="M 440 -50 V 800" stroke="#FFFFFF" strokeWidth="14" className="dark:stroke-slate-700/60" />
                  <path d="M 700 -50 V 800" stroke="#FFFFFF" strokeWidth="10" className="dark:stroke-slate-700/60" />

                  {/* Glowing Purple Navigation Path connecting Mim/Home to Rasel (matching image) */}
                  <path
                    d="M 440 290 C 440 210, 390 200, 390 170 C 390 140, 520 160, 560 120"
                    stroke="url(#route-gradient)"
                    strokeWidth="5"
                    strokeLinecap="round"
                    className="drop-shadow-[0_0_12px_rgba(124,58,237,0.7)]"
                  />

                  <defs>
                    <linearGradient id="route-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#A855F7" />
                      <stop offset="50%" stopColor="#8B5CF6" />
                      <stop offset="100%" stopColor="#7C3AED" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* ── Top Left Floating Status Badge ── */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="absolute top-4 left-4 bg-white shadow-md rounded-2xl px-4 py-2 border border-slate-100 flex flex-col text-left z-10"
                >
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#10B981]">
                    <span className="h-2 w-2 rounded-full bg-[#10B981] animate-ping" />
                    • Live
                  </div>
                  <span className="text-[11px] text-[#64748B] font-medium">All systems active</span>
                </motion.div>

                {/* ── GEOFENCE SAFE ZONES ── */}

                {/* 1. Home Zone (Center Green Oval) */}
                <div className="absolute top-[52%] left-[45%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10">
                  <div className="w-40 h-28 rounded-[50%] bg-[#10B981]/15 border border-[#10B981]/40 flex items-center justify-center">
                    <div className="h-10 w-10 rounded-full bg-[#10B981] text-white flex items-center justify-center shadow-lg">
                      <Home size={20} />
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-[#047857] mt-1">
                    Home
                  </span>
                </div>

                {/* 2. School Zone (Right Blue Oval) */}
                <div className="absolute top-[58%] left-[74%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10">
                  <div className="w-44 h-32 rounded-[50%] bg-[#3B82F6]/15 border border-[#3B82F6]/40 flex items-center justify-center">
                    <div className="h-10 w-10 rounded-full bg-[#3B82F6] text-white flex items-center justify-center shadow-lg">
                      <GraduationCap size={20} />
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-[#1D4ED8] mt-1">
                    School
                  </span>
                </div>

                {/* ── USER PIN MARKERS WITH GENTLE FLOATING ANIMATION ── */}

                {/* 1. RASEL (Top Right - Purple Teardrop Pin) */}
                <motion.div
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute top-[10%] right-[15%] flex items-center gap-3 z-20"
                >
                  {/* Teardrop Map Pin */}
                  <div className="relative flex flex-col items-center">
                    <div className="h-14 w-14 rounded-full bg-[#7C3AED] p-0.5 shadow-2xl ring-4 ring-purple-500/25 overflow-hidden flex items-center justify-center">
                      <img
                        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"
                        alt="Rasel"
                        className="w-full h-full object-cover rounded-full"
                      />
                    </div>
                    {/* Downward Pointer Triangle & Ground Dot */}
                    <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-[#7C3AED] -mt-0.5" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#7C3AED] shadow-[0_0_8px_#7C3AED] mt-0.5" />
                  </div>
                  
                  {/* Floating Info Box */}
                  <div className="bg-white p-3.5 rounded-2xl shadow-xl border border-slate-100 text-left min-w-[145px] hover:shadow-2xl transition-shadow">
                    <div className="font-bold text-sm text-[#0F172A]">Rasel</div>
                    <div className="text-xs font-bold text-[#10B981] mt-0.5 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                      Moving • 45 km/h
                    </div>
                    <div className="text-xs text-[#64748B] font-medium mt-0.5">Battery 72%</div>
                  </div>
                </motion.div>

                {/* 2. MIM (Left Center - Blue Teardrop Pin) */}
                <motion.div
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                  className="absolute top-[38%] left-[12%] flex items-center gap-3 z-20"
                >
                  {/* Teardrop Map Pin */}
                  <div className="relative flex flex-col items-center">
                    <div className="h-14 w-14 rounded-full bg-[#3B82F6] p-0.5 shadow-2xl ring-4 ring-blue-500/25 overflow-hidden flex items-center justify-center">
                      <img
                        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
                        alt="Mim"
                        className="w-full h-full object-cover rounded-full"
                      />
                    </div>
                    <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-[#3B82F6] -mt-0.5" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#3B82F6] shadow-[0_0_8px_#3B82F6] mt-0.5" />
                  </div>
                  
                  {/* Floating Info Box */}
                  <div className="bg-white p-3.5 rounded-2xl shadow-xl border border-slate-100 text-left min-w-[135px] hover:shadow-2xl transition-shadow">
                    <div className="font-bold text-sm text-[#0F172A]">Mim</div>
                    <div className="text-xs font-bold text-[#2563EB] mt-0.5 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />
                      At Home
                    </div>
                    <div className="text-xs text-[#64748B] font-medium mt-0.5">Battery 92%</div>
                  </div>
                </motion.div>

                {/* 3. AYAAN (Right Center - Amber Teardrop Pin) */}
                <motion.div
                  animate={{ y: [0, -3.5, 0] }}
                  transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                  className="absolute top-[38%] right-[4%] flex items-center gap-3 z-20"
                >
                  {/* Teardrop Map Pin */}
                  <div className="relative flex flex-col items-center">
                    <div className="h-14 w-14 rounded-full bg-[#F59E0B] p-0.5 shadow-2xl ring-4 ring-amber-500/25 overflow-hidden flex items-center justify-center">
                      <img
                        src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80"
                        alt="Ayaan"
                        className="w-full h-full object-cover rounded-full"
                      />
                    </div>
                    <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-[#F59E0B] -mt-0.5" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] shadow-[0_0_8px_#F59E0B] mt-0.5" />
                  </div>
                  
                  {/* Floating Info Box */}
                  <div className="bg-white p-3.5 rounded-2xl shadow-xl border border-slate-100 text-left min-w-[135px] hover:shadow-2xl transition-shadow">
                    <div className="font-bold text-sm text-[#0F172A]">Ayaan</div>
                    <div className="text-xs font-bold text-[#D97706] mt-0.5 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]" />
                      At School
                    </div>
                    <div className="text-xs text-[#64748B] font-medium mt-0.5">Battery 85%</div>
                  </div>
                </motion.div>

                {/* ── MAP CONTROL ZOOM WIDGET (Interactive Zoom & Center) ── */}
                <div className="absolute bottom-16 right-4 flex flex-col items-center gap-1.5 bg-white shadow-xl border border-slate-100 rounded-2xl p-2 z-10 text-slate-700">
                  <button
                    onClick={() => setZoomLevel((prev) => Math.min(prev + 0.1, 1.3))}
                    className="p-1 hover:bg-slate-100 rounded-xl transition-colors active:scale-95"
                    title="Zoom In"
                  >
                    <Plus size={16} />
                  </button>
                  <button
                    onClick={() => setZoomLevel((prev) => Math.max(prev - 0.1, 0.8))}
                    className="p-1 hover:bg-slate-100 rounded-xl transition-colors active:scale-95"
                    title="Zoom Out"
                  >
                    <Minus size={16} />
                  </button>
                  <div className="h-px w-4 bg-slate-200 my-0.5" />
                  <button
                    onClick={() => setZoomLevel(1)}
                    className="p-1 hover:bg-slate-100 rounded-xl transition-colors text-[#7C3AED] active:scale-95"
                    title="Reset Center"
                  >
                    <Crosshair size={16} />
                  </button>
                </div>

                {/* ── FLOATING APP NAVIGATION BAR (Interactive Tabs) ── */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white shadow-[0_10px_35px_rgba(0,0,0,0.08)] border border-slate-100 px-7 py-2.5 rounded-2xl flex items-center gap-8 z-30">
                  {[
                    { id: 'live', label: 'Live', icon: Radio },
                    { id: 'circles', label: 'Circles', icon: Users2 },
                    { id: 'alerts', label: 'Alerts', icon: Bell },
                    { id: 'history', label: 'History', icon: History },
                    { id: 'settings', label: 'Settings', icon: Settings },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex flex-col items-center transition-all ${
                          isActive
                            ? 'text-[#7C3AED] font-bold scale-105'
                            : 'text-[#64748B] hover:text-slate-900 font-semibold'
                        }`}
                      >
                        <Icon size={20} />
                        <span className="text-[10px] mt-0.5">{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

              </motion.div>
            </div>
          </motion.div>

        </div>

        {/* ── BOTTOM SOCIAL PROOF SECTION ── */}
        <div className="relative mt-20 pt-10">
          {/* Subtle Wave SVG line spanning horizontally */}
          <svg className="absolute top-0 left-0 right-0 w-full h-6 stroke-purple-200/60 fill-none" viewBox="0 0 1200 24" preserveAspectRatio="none">
            <path d="M0 12 Q 300 24, 600 12 T 1200 12" strokeWidth="1.5" />
          </svg>

          <div className="flex flex-col items-center text-center space-y-4 pt-2">
            <p className="text-sm font-semibold text-[#64748B] dark:text-muted-foreground">
              Trusted by families across Bangladesh and beyond
            </p>

            <div className="flex items-center gap-3">
              {/* Overlapping Avatar Stack */}
              <div className="flex -space-x-2.5 overflow-hidden">
                {[
                  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
                  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
                  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
                  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
                  "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=150&q=80",
                ].map((url, idx) => (
                  <img
                    key={idx}
                    src={url}
                    alt={`User ${idx}`}
                    className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-background object-cover shadow-sm hover:scale-110 transition-transform"
                  />
                ))}
              </div>

              {/* 2K+ Purple Badge */}
              <span className="px-3 py-1 rounded-full bg-[#7C3AED] text-white font-bold text-xs shadow-md">
                2K+
              </span>

              <span className="text-sm font-bold text-[#1E293B] dark:text-foreground">
                Active Families
              </span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
