'use client';

import { SignInForm } from '@/components/auth/signin';
import {
  Users,
  Shield,
  Bell,
  Clock,
  Lock,
  ArrowLeft,
  Sparkles,
  Navigation,
  Radio,
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex overflow-hidden" style={{ fontFamily: 'Inter, sans-serif' }}>

      {/* ══════════════════════════════════════════════════════
          LEFT PANEL — Dark navy brand hero (matches reference)
          ══════════════════════════════════════════════════════ */}
      <div
        className="hidden lg:flex lg:w-[55%] xl:w-[58%] flex-col relative overflow-hidden"
        style={{ background: 'linear-gradient(145deg, #0f1033 0%, #1a1060 50%, #0d1535 100%)' }}
      >
        {/* Ambient glows */}
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full opacity-40 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #4f46e5 0%, transparent 70%)' }} />
        <div className="absolute bottom-[-10%] left-[10%] w-[50%] h-[50%] rounded-full opacity-30 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)' }} />
        <div className="absolute top-[40%] right-[-5%] w-[40%] h-[40%] rounded-full opacity-20 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #2563eb 0%, transparent 70%)' }} />

        {/* Subtle dot-grid overlay */}
        <div className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

        {/* ── Top logo bar ── */}
        <div className="relative z-10 flex items-center gap-3 pt-7 px-10">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="h-9 w-9 rounded-xl flex items-center justify-center shadow-lg"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
              <Navigation size={17} className="text-white" style={{ transform: 'rotate(-30deg)' }} />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">LocaLink</span>
          </Link>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold text-white/90 border border-white/20"
            style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)' }}>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            Live Location
          </div>
        </div>

        {/* ── Main content ── */}
        <div className="relative z-10 flex-1 flex flex-col px-10 pt-10 pb-8 gap-6">

          {/* Headline block */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/20 text-[10px] font-bold text-white/80 uppercase tracking-widest mb-4"
              style={{ background: 'rgba(255,255,255,0.07)' }}>
              <Sparkles size={10} className="text-amber-300" />
              WELCOME BACK
            </div>
            <h1 className="text-[2.4rem] xl:text-[2.8rem] font-black text-white leading-[1.1] tracking-tight mb-4">
              Stay close to the ones<br />
              <span style={{ background: 'linear-gradient(90deg, #a78bfa, #f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                who matter.
              </span>
            </h1>
            <p className="text-white/65 text-sm leading-relaxed max-w-sm">
              Sign in to view real-time locations, get instant alerts<br />
              and manage your private family circles.
            </p>
          </motion.div>

          {/* ── Isometric map visual ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative w-full flex-1 min-h-[180px] max-h-[240px] rounded-2xl overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(15,16,51,0.8) 0%, rgba(30,20,80,0.6) 50%, rgba(5,30,60,0.8) 100%)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            {/* Grid perspective base */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 600 250" preserveAspectRatio="xMidYMid slice">
              {/* Isometric grid lines */}
              {Array.from({ length: 14 }).map((_, i) => (
                <line key={`h${i}`} x1={0} y1={20 + i * 18} x2={600} y2={20 + i * 18}
                  stroke="rgba(99,102,241,0.12)" strokeWidth="1" />
              ))}
              {Array.from({ length: 22 }).map((_, i) => (
                <line key={`v${i}`} x1={i * 28} y1={0} x2={i * 28} y2={250}
                  stroke="rgba(99,102,241,0.1)" strokeWidth="1" />
              ))}
              {/* Diagonal lines for isometric look */}
              {Array.from({ length: 12 }).map((_, i) => (
                <line key={`d${i}`} x1={i * 55 - 50} y1={0} x2={i * 55 + 200} y2={250}
                  stroke="rgba(99,102,241,0.06)" strokeWidth="1" />
              ))}

              {/* Glowing terrain path (teal/cyan route) */}
              <path d="M 50 200 Q 200 130 280 110 T 480 70" stroke="#22d3ee" strokeWidth="2" fill="none" opacity="0.7" strokeDasharray="5 4" />
              <path d="M 50 200 Q 200 130 280 110 T 480 70" stroke="#22d3ee" strokeWidth="10" fill="none" opacity="0.12" strokeLinecap="round" />

              {/* Purple connector path */}
              <path d="M 280 110 Q 350 155 420 150" stroke="#a78bfa" strokeWidth="2" fill="none" opacity="0.8" strokeDasharray="6 3" />
              <path d="M 280 110 Q 350 155 420 150" stroke="#a78bfa" strokeWidth="8" fill="none" opacity="0.15" strokeLinecap="round" />

              {/* Glow dots at nodes */}
              <circle cx="280" cy="110" r="6" fill="#6366f1" opacity="0.4" />
              <circle cx="280" cy="110" r="3" fill="#818cf8" opacity="0.9" />
              <circle cx="50" cy="200" r="4" fill="#22d3ee" opacity="0.6" />
              <circle cx="480" cy="70" r="4" fill="#22d3ee" opacity="0.6" />
              <circle cx="420" cy="150" r="4" fill="#a78bfa" opacity="0.6" />

              {/* Terrain shading */}
              <path d="M0,180 Q120,140 200,150 T400,120 T600,140 L600,250 L0,250 Z"
                fill="rgba(30,20,80,0.5)" />
              <path d="M0,200 Q180,165 300,175 T600,165 L600,250 L0,250 Z"
                fill="rgba(15,10,60,0.6)" />
            </svg>

            {/* Center big pin — young man avatar */}
            <div className="absolute top-[38%] left-[44%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-20">
              {/* Ripple ring */}
              <div className="absolute w-16 h-16 rounded-full animate-ping opacity-20"
                style={{ background: 'rgba(99,102,241,0.4)' }} />
              <div className="absolute w-12 h-12 rounded-full opacity-30"
                style={{ background: 'rgba(99,102,241,0.4)' }} />
              {/* Avatar */}
              <div className="h-14 w-14 rounded-full border-[2.5px] border-indigo-400 overflow-hidden shadow-2xl"
                style={{ boxShadow: '0 0 24px rgba(99,102,241,0.6), 0 0 8px rgba(99,102,241,0.4)' }}>
                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face" alt="user" className="w-full h-full object-cover" />
              </div>
              {/* Pin pointer */}
              <div className="w-3 h-3 -mt-1.5 rotate-45 bg-indigo-500 rounded-sm shadow-lg" />
            </div>

            {/* Top right smaller pin */}
            <div className="absolute top-[22%] left-[76%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-20">
              <div className="absolute w-10 h-10 rounded-full animate-pulse opacity-25"
                style={{ background: 'rgba(34,211,238,0.5)' }} />
              <div className="h-9 w-9 rounded-full border-2 border-cyan-400 overflow-hidden shadow-xl"
                style={{ boxShadow: '0 0 16px rgba(34,211,238,0.5)' }}>
                <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face" alt="user2" className="w-full h-full object-cover" />
              </div>
              <div className="w-2 h-2 -mt-1 rotate-45 bg-cyan-400 rounded-sm" />
            </div>

            {/* Sparkle stars */}
            <div className="absolute top-5 right-[30%] text-white animate-pulse opacity-80">
              <Sparkles size={14} />
            </div>
            <div className="absolute bottom-10 right-[22%] text-indigo-200 animate-pulse opacity-60">
              <Sparkles size={10} />
            </div>
          </motion.div>

          {/* ── 4 Feature Cards ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-4 gap-2.5"
          >
            {[
              { icon: Users, label: 'Real-time\nLocation', sub: 'Always know\nwhere they are', color: '#818cf8' },
              { icon: Shield, label: 'Safer\nTogether', sub: 'Keep your loved\nones protected', color: '#818cf8' },
              { icon: Bell, label: 'Smart\nAlerts', sub: 'Get notified\nwhen it matters', color: '#f59e0b' },
              { icon: Clock, label: 'Location\nHistory', sub: 'View past\nmovements anytime', color: '#818cf8' },
            ].map(({ icon: Icon, label, sub, color }, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 + idx * 0.07 }}
                className="rounded-xl p-3 flex flex-col gap-2 transition-all hover:-translate-y-0.5"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <div className="h-7 w-7 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.1)' }}>
                  <Icon size={14} style={{ color }} />
                </div>
                <div>
                  <p className="text-white font-bold text-[11px] leading-tight whitespace-pre-line">{label}</p>
                  <p className="text-white/50 text-[9px] leading-tight whitespace-pre-line mt-0.5">{sub}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* ── Stats Bar ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="rounded-xl p-4 grid grid-cols-4 divide-x divide-white/10 text-center"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            {[
              { val: '10K+', label: 'Active Users' },
              { val: '1M+', label: 'Locations Shared' },
              { val: '3+', label: 'Countries' },
              { val: '99.9%', label: 'Uptime' },
            ].map(({ val, label }) => (
              <div key={label} className="px-1" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                <p className="text-xl font-black text-white tracking-tight">{val}</p>
                <p className="text-white/55 text-[10px] font-medium mt-0.5">{label}</p>
              </div>
            ))}
          </motion.div>

          {/* ── Footer security note ── */}
          <div className="flex items-center gap-2 text-white/50 text-[11px] font-medium pb-2">
            <div className="h-5 w-5 rounded-md flex items-center justify-center shrink-0"
              style={{ background: 'rgba(255,255,255,0.1)' }}>
              <Lock size={10} className="text-white/70" />
            </div>
            <span>Protected by end-to-end encryption &amp; ISO 27001 standard security.</span>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          RIGHT PANEL — Pure white/light login card
          ══════════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col bg-white dark:bg-[#f3f5ff] relative">

        {/* Back to Home — top right corner only */}
        <div className="flex justify-end px-6 sm:px-10 pt-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:border-slate-300 px-4 py-2 rounded-full transition-all shadow-sm hover:shadow-md"
          >
            <ArrowLeft size={13} />
            Back to Home
          </Link>
        </div>

        {/* Mobile brand (visible < lg) */}
        <div className="flex lg:hidden items-center gap-2 justify-center pt-4 pb-2">
          <div className="h-9 w-9 rounded-xl flex items-center justify-center shadow"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            <Navigation size={16} className="text-white" style={{ transform: 'rotate(-30deg)' }} />
          </div>
          <span className="text-lg font-black text-slate-800">LocaLink</span>
        </div>

        {/* Centered card */}
        <div className="flex-1 flex items-center justify-center px-6 sm:px-10 py-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="w-full max-w-[420px] bg-white rounded-3xl shadow-xl border border-slate-100 px-8 py-9"
          >
            {/* Card logo + heading */}
            <div className="flex flex-col items-center text-center mb-7">
              <div className="h-11 w-11 rounded-2xl flex items-center justify-center shadow-lg mb-4"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                <Navigation size={20} className="text-white" style={{ transform: 'rotate(-30deg)' }} />
              </div>
              <p className="text-xs font-bold text-indigo-600 tracking-wider uppercase mb-1">LocaLink</p>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Sign In</h1>
              <p className="text-xs text-slate-500 mt-1 font-medium">Enter your credentials to access your dashboard</p>
            </div>

            <SignInForm />
          </motion.div>
        </div>
      </div>

    </div>
  );
}
