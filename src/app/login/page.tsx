'use client';

import { SignInForm } from '@/components/auth/signin';
import { AuthLeftHero } from '@/components/auth/AuthLeftHero';
import { ArrowLeft, Navigation, Sun, Moon } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTheme } from '@/components/ThemeProvider';
import { soundFx } from '@/lib/soundFx';

export default function LoginPage() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    soundFx?.playPop?.();
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="h-screen max-h-screen w-full flex overflow-hidden bg-white dark:bg-[#070B16] text-slate-900 dark:text-foreground">

      {/* ══════════════════════════════════════════════════════
          LEFT PANEL — Interactive Live Radar HUD & Family Mesh (Option 1)
          ══════════════════════════════════════════════════════ */}
      <AuthLeftHero
        badgeText="LIVE GPS MESH ACTIVE"
        title="Stay close to the ones"
        gradientTitle="who matter most."
        subtitle="Sign in to access pinpoint live GPS tracking, automated safe zone geofences, and private circle telemetry."
      />

      {/* ══════════════════════════════════════════════════════
          RIGHT PANEL — Clean, Theme-Aware Login Form Panel
          ══════════════════════════════════════════════════════ */}
      <div className="flex-1 h-full max-h-screen flex flex-col bg-slate-50 dark:bg-[#070B16] relative transition-colors duration-300 overflow-y-auto lg:overflow-hidden justify-between py-4 sm:py-6 px-4 sm:px-8">

        {/* Back to Home & Theme Toggle — top bar */}
        <div className="flex justify-between items-center w-full">
          <Link href="/" className="lg:hidden flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <Navigation size={15} style={{ transform: 'rotate(-30deg)' }} />
            </div>
            <span className="text-base font-black text-slate-900 dark:text-white">LocaLink</span>
          </Link>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="h-8 w-8 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300 bg-white dark:bg-[#0E1528] border border-slate-200/80 dark:border-slate-800 hover:text-violet-600 dark:hover:text-violet-400 transition-all shadow-2xs hover:shadow-xs cursor-pointer"
            >
              {theme === 'dark' ? <Sun size={14} className="text-amber-400" /> : <Moon size={14} className="text-violet-600" />}
            </button>

            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-violet-600 dark:hover:text-violet-400 bg-white dark:bg-[#0E1528] border border-slate-200/80 dark:border-slate-800 px-3.5 py-1.5 rounded-full transition-all shadow-2xs hover:shadow-xs"
            >
              <ArrowLeft size={13} />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>

        {/* Centered card */}
        <div className="flex-1 flex items-center justify-center py-2">
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-[410px] bg-white dark:bg-[#0E1528] rounded-3xl shadow-xl dark:shadow-[0_20px_50px_rgba(0,0,0,0.6)] border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7"
          >
            {/* Card heading */}
            <div className="flex flex-col items-center text-center mb-4">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-600 via-indigo-600 to-cyan-600 flex items-center justify-center text-white shadow-md shadow-violet-500/25 mb-2.5">
                <Navigation size={18} className="text-white" style={{ transform: 'rotate(-30deg)' }} />
              </div>
              <h1 className="text-2xl font-black text-slate-950 dark:text-white tracking-tight">
                Sign In
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                Enter credentials to access your live dashboard
              </p>
            </div>

            <SignInForm />
          </motion.div>
        </div>

        {/* Bottom subtle note */}
        <div className="text-center text-[11px] text-slate-400 dark:text-slate-500 font-mono">
          LocaLink Security Mesh • 256-Bit SSL
        </div>
      </div>

    </div>
  );
}
