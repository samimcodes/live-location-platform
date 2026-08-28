'use client';

import { SignUpForm } from '@/components/auth/signup';
import {
  Shield,
  Zap,
  Users,
  ArrowLeft,
  HeartHandshake,
  Navigation,
  Sparkles,
  Lock,
  CheckCircle,
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function RegisterPage() {
  const perks = [
    {
      icon: Shield,
      title: 'End-to-End Encrypted',
      desc: 'Your location data is private and visible only to your trusted circle.',
      color: '#818cf8',
      bg: 'rgba(99,102,241,0.15)',
    },
    {
      icon: Zap,
      title: 'Real-Time GPS Sync',
      desc: 'Instant updates every 15 seconds with zero battery drain.',
      color: '#fbbf24',
      bg: 'rgba(251,191,36,0.12)',
    },
    {
      icon: Users,
      title: 'Unlimited Circles',
      desc: 'Create separate private maps for family, close friends, and teams.',
      color: '#34d399',
      bg: 'rgba(52,211,153,0.12)',
    },
  ];

  return (
    <div className="min-h-screen w-full flex overflow-hidden" style={{ fontFamily: 'Inter, sans-serif' }}>

      {/* ══════════════════════════════════════════════════════
          LEFT PANEL — Dark brand hero (matches Login page style)
          ══════════════════════════════════════════════════════ */}
      <div
        className="hidden lg:flex lg:w-[55%] xl:w-[58%] flex-col relative overflow-hidden"
        style={{ background: 'linear-gradient(145deg, #0f1033 0%, #1a1060 50%, #0d1535 100%)' }}
      >
        {/* Ambient glows */}
        <div className="absolute top-[-15%] right-[-10%] w-[55%] h-[55%] rounded-full opacity-35 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)' }} />
        <div className="absolute bottom-[-10%] left-[5%] w-[45%] h-[45%] rounded-full opacity-25 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #4f46e5 0%, transparent 70%)' }} />
        <div className="absolute top-[30%] left-[-5%] w-[35%] h-[35%] rounded-full opacity-20 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #2563eb 0%, transparent 70%)' }} />

        {/* Dot grid overlay */}
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

        {/* Top logo bar */}
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
            <HeartHandshake size={11} className="text-pink-300" />
            Free Forever For Families
          </div>
        </div>

        {/* Main content */}
        <div className="relative z-10 flex-1 flex flex-col px-10 pt-10 pb-8 gap-6 justify-between">

          {/* Headline */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/20 text-[10px] font-bold text-white/80 uppercase tracking-widest mb-5"
              style={{ background: 'rgba(255,255,255,0.07)' }}>
              <Sparkles size={10} className="text-amber-300" />
              JOIN 10,000+ FAMILIES
            </div>

            <h1 className="text-[2.4rem] xl:text-[2.8rem] font-black text-white leading-[1.1] tracking-tight mb-4">
              Start protecting <br />
              <span style={{ background: 'linear-gradient(90deg, #a78bfa, #f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                your family today.
              </span>
            </h1>
            <p className="text-white/65 text-sm leading-relaxed max-w-sm">
              Create your account in less than 2 minutes.<br />No credit card required.
            </p>
          </motion.div>

          {/* Perks list */}
          <div className="space-y-3 flex-1 flex flex-col justify-center">
            {perks.map(({ icon: Icon, title, desc, color, bg }, idx) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.15 + idx * 0.1 }}
                className="flex items-start gap-4 p-4 rounded-2xl transition-all hover:-translate-y-0.5"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)' }}
              >
                <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: bg }}>
                  <Icon size={18} style={{ color }} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{title}</h3>
                  <p className="text-[11px] text-white/60 mt-0.5 leading-relaxed">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* What you get checklist */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.45 }}
            className="rounded-2xl p-4"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <p className="text-[11px] font-bold text-white/70 uppercase tracking-widest mb-3">What you get</p>
            <div className="grid grid-cols-2 gap-y-2 gap-x-4">
              {[
                'Live location tracking',
                'Geo-fence alerts',
                'Group family circles',
                'Location history',
                'SOS emergency mode',
                '99.9% uptime',
              ].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <CheckCircle size={11} className="text-indigo-400 shrink-0" />
                  <span className="text-[11px] text-white/70 font-medium">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Footer */}
          <div className="flex items-center gap-2 text-white/45 text-[11px] font-medium">
            <div className="h-5 w-5 rounded-md flex items-center justify-center shrink-0"
              style={{ background: 'rgba(255,255,255,0.1)' }}>
              <Lock size={10} className="text-white/60" />
            </div>
            Join over 10,000+ connected members worldwide.
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          RIGHT PANEL — Pure white register card
          ══════════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col bg-white dark:bg-[#f3f5ff] relative">

        {/* Back to Home — top right */}
        <div className="flex justify-end px-6 sm:px-10 pt-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:border-slate-300 px-4 py-2 rounded-full transition-all shadow-sm hover:shadow-md"
          >
            <ArrowLeft size={13} />
            Back to Home
          </Link>
        </div>

        {/* Mobile brand */}
        <div className="flex lg:hidden items-center gap-2 justify-center pt-4 pb-2">
          <div className="h-9 w-9 rounded-xl flex items-center justify-center shadow"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            <Navigation size={16} className="text-white" style={{ transform: 'rotate(-30deg)' }} />
          </div>
          <span className="text-lg font-black text-slate-800">LocaLink</span>
        </div>

        {/* Centered card */}
        <div className="flex-1 flex items-center justify-center px-6 sm:px-10 py-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="w-full max-w-[420px] bg-white rounded-3xl shadow-xl border border-slate-100 px-8 py-8"
          >
            {/* Card header */}
            <div className="flex flex-col items-center text-center mb-6">
              <div className="h-11 w-11 rounded-2xl flex items-center justify-center shadow-lg mb-3"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                <Navigation size={20} className="text-white" style={{ transform: 'rotate(-30deg)' }} />
              </div>
              <p className="text-xs font-bold text-indigo-600 tracking-wider uppercase mb-1">LocaLink</p>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Create Account</h1>
              <p className="text-xs text-slate-500 mt-1 font-medium">Get started with your free LocaLink account</p>
            </div>

            <SignUpForm />
          </motion.div>
        </div>
      </div>

    </div>
  );
}
