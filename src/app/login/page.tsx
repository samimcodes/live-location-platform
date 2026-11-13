'use client';

import React from 'react';
import { SignInForm } from '@/components/auth/signin';
import { AuthMapBackdrop } from '@/components/auth/AuthMapBackdrop';
import { ArrowLeft, Sun, Moon, ShieldCheck, Radio, MapPin } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTheme } from '@/components/ThemeProvider';
import { soundFx } from '@/lib/soundFx';
import { LocaLinkLogo } from '@/components/brand/LocaLinkLogo';

export default function LoginPage() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    soundFx?.playPop?.();
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="relative flex h-screen h-[100dvh] max-h-screen w-full flex-col justify-between overflow-hidden bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-[#070B16] dark:text-white px-4 py-2 sm:px-6 sm:py-3">
      {/* ── Dynamic Geospatial Background ── */}
      <AuthMapBackdrop />

      {/* ── Top Header Navigation Bar ── */}
      <header className="relative z-10 mx-auto flex w-full max-w-5xl shrink-0 items-center justify-between">
        <Link
          href="/"
          onClick={() => soundFx?.playPop?.()}
          className="group inline-flex cursor-pointer items-center"
        >
          <LocaLinkLogo size="sm" showSubtitle={true} />
        </Link>

        {/* Right Header Controls (Frosted Glass Pill) */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl border border-white/60 bg-white/70 text-slate-600 shadow-2xs backdrop-blur-xl transition-all hover:border-slate-300 hover:text-slate-950 active:scale-95 dark:border-white/10 dark:bg-[#0D1426]/70 dark:text-slate-300 dark:hover:border-white/20 dark:hover:text-white"
          >
            {theme === 'dark' ? (
              <Sun className="h-3.5 w-3.5 text-amber-400 transition-transform hover:rotate-45" />
            ) : (
              <Moon className="h-3.5 w-3.5 text-indigo-600 transition-transform hover:-rotate-12" />
            )}
          </button>

          <Link
            href="/"
            onClick={() => soundFx?.playPop?.()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/60 bg-white/70 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs backdrop-blur-xl transition-all hover:border-slate-300 hover:text-slate-950 active:scale-95 dark:border-white/10 dark:bg-[#0D1426]/70 dark:text-slate-300 dark:hover:border-white/20 dark:hover:text-white"
          >
            <ArrowLeft className="h-3 w-3" />
            <span className="hidden sm:inline">Back to Home</span>
            <span className="sm:hidden">Home</span>
          </Link>
        </div>
      </header>

      {/* ── Centered Ultra-Premium Frosted Glass Card ── */}
      <main className="relative z-10 flex w-full flex-1 items-center justify-center py-1.5 sm:py-2 min-h-0 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="relative w-full max-w-[400px] sm:max-w-[416px] rounded-3xl border border-white/70 bg-white/75 p-4.5 sm:p-6 shadow-[0_24px_60px_-15px_rgba(15,23,42,0.12),inset_0_1px_1px_0_rgba(255,255,255,0.95)] backdrop-blur-2xl backdrop-saturate-150 transition-all dark:border-white/[0.12] dark:bg-slate-950/70 dark:shadow-[0_28px_70px_rgba(0,0,0,0.75),inset_0_1px_0_0_rgba(255,255,255,0.15)] overflow-hidden my-auto"
        >
          {/* Top Specular Rim Reflection */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500/80 to-transparent dark:via-cyan-400/80"
          />

          {/* Card Header */}
          <div className="mb-3 text-center">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Welcome back
            </h1>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Sign in to access your live family radar and timeline
            </p>
          </div>

          {/* Frosted Glass Segmented Tab Switcher */}
          <div className="mb-3">
            <div className="grid grid-cols-2 rounded-xl border border-white/60 bg-slate-200/50 p-1 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.06]">
              <span className="flex items-center justify-center rounded-lg bg-white/95 py-1.5 text-xs font-semibold text-slate-900 shadow-2xs border border-white/80 backdrop-blur-md dark:bg-white/[0.15] dark:text-white dark:border-white/10">
                Sign In
              </span>
              <Link
                href="/register"
                onClick={() => soundFx?.playPop?.()}
                className="flex items-center justify-center rounded-lg py-1.5 text-xs font-medium text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              >
                Create Account
              </Link>
            </div>
          </div>

          <SignInForm />
        </motion.div>
      </main>

      {/* ── Bottom Compact Telemetry Strip ── */}
      <footer className="relative z-10 flex shrink-0 flex-wrap items-center justify-center gap-x-4 gap-y-1 text-center text-[11px] text-slate-500 dark:text-slate-400 py-0.5">
        <span className="inline-flex items-center gap-1 font-medium">
          <ShieldCheck className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
          <span>End-to-End Encrypted</span>
        </span>
        <span aria-hidden="true" className="hidden text-slate-300 dark:text-slate-700 sm:inline">
          •
        </span>
        <span className="inline-flex items-center gap-1">
          <Radio className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />
          <span>Real-time WebSocket</span>
        </span>
        <span aria-hidden="true" className="hidden text-slate-300 dark:text-slate-700 sm:inline">
          •
        </span>
        <span className="inline-flex items-center gap-1">
          <MapPin className="h-3 w-3 text-cyan-600 dark:text-cyan-400" />
          <span>MapLibre Spatial</span>
        </span>
      </footer>
    </div>
  );
}
