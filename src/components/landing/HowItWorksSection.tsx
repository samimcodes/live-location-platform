'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  UserPlus,
  QrCode,
  Compass,
  Mic,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { soundFx } from '@/lib/soundFx';
import { useAuth } from '@/hooks/useAuth';

const steps = [
  {
    step: '01',
    icon: UserPlus,
    title: 'Instant Sign-Up',
    description:
      'Create your encrypted LocaLink account in under 30 seconds with email or Google OAuth. No card required.',
    gradient: 'from-indigo-500 to-violet-600',
    accentText: 'text-indigo-600 dark:text-indigo-400',
    accentBg: 'bg-indigo-500/10 border-indigo-500/20',
    tag: '20s Onboarding',
    outcome: 'AES-256 Session',
    previewLabel: 'Account & Device Key Provisioned',
    previewDetail: 'Ready to create private circles or sync existing contacts immediately.',
    authHref: '/dashboard',
    guestHref: '/register',
    authCta: 'Open Dashboard',
    guestCta: 'Create Free Account',
  },
  {
    step: '02',
    icon: QrCode,
    title: 'Scan QR or Share Link',
    description:
      'Pair loved ones using your personal camera QR code or send a 1-tap WhatsApp invite link—zero manual codes.',
    gradient: 'from-cyan-500 to-indigo-600',
    accentText: 'text-cyan-600 dark:text-cyan-400',
    accentBg: 'bg-cyan-500/10 border-cyan-500/20',
    tag: 'Zero Typing',
    outcome: '1-Tap Pairing',
    previewLabel: 'Cryptographic Circle Invite Ready',
    previewDetail: 'Scan friend QR or share an expiring invite link via WhatsApp or SMS.',
    authHref: '/dashboard/friends',
    guestHref: '/register',
    authCta: 'Manage Friends & Invites',
    guestCta: 'Start Your Circle',
  },
  {
    step: '03',
    icon: Compass,
    title: 'Safe Zones & OSRM Routes',
    description:
      'Pin Home, School, or Work geofences for arrival alerts, and launch live turn-by-turn driving or walking routes.',
    gradient: 'from-rose-500 to-violet-600',
    accentText: 'text-rose-600 dark:text-rose-400',
    accentBg: 'bg-rose-500/10 border-rose-500/20',
    tag: 'Smart Geofencing',
    outcome: 'Auto Arrival Ping',
    previewLabel: 'Geofence & Turn-by-Turn Engine Active',
    previewDetail: 'Receive automated entry/exit alerts and live OSRM ETA routes to circle members.',
    authHref: '/dashboard/saved-places',
    guestHref: '/register',
    authCta: 'Configure Safe Zones',
    guestCta: 'Explore Safe Zones',
  },
  {
    step: '04',
    icon: Mic,
    title: 'Voice Notes & Ghost Mode',
    description:
      'Drop voice notes on the map, track live battery warnings, enable timed Ghost Mode, or export GPX trip history.',
    gradient: 'from-emerald-500 to-teal-600',
    accentText: 'text-emerald-600 dark:text-emerald-400',
    accentBg: 'bg-emerald-500/10 border-emerald-500/20',
    tag: 'Full Control',
    outcome: 'Privacy First',
    previewLabel: 'Live Map, Audio & GPX Export Ready',
    previewDetail: 'Stay connected silently with adaptive battery saver and timed Ghost privacy.',
    authHref: '/dashboard/map',
    guestHref: '/register',
    authCta: 'Launch Live Map',
    guestCta: 'Try Live Platform',
  },
];

export function HowItWorksSection() {
  const { isAuthenticated } = useAuth();
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const currentStep = steps[activeStepIndex];
  const CurrentIcon = currentStep.icon;

  return (
    <section
      id="how-it-works"
      className="py-16 sm:py-24 lg:py-28 px-4 sm:px-6 bg-white dark:bg-[#080D1A] border-b border-slate-200/80 dark:border-white/[0.06] relative overflow-hidden scroll-mt-16"
    >
      {/* Subtle ambient light */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[min(640px,95vw)] h-[340px] bg-indigo-500/8 dark:bg-indigo-600/10 rounded-full blur-[130px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          className="text-center mb-12 sm:mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50/90 dark:bg-indigo-500/10 border border-indigo-200/80 dark:border-indigo-400/20 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-4">
            <Sparkles size={13} className="text-indigo-600 dark:text-indigo-400" />
            <span>Frictionless Setup</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 dark:text-white mb-4 tracking-[-0.025em] leading-[1.1]">
            Up and running in{' '}
            <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 dark:from-indigo-400 dark:via-violet-300 dark:to-cyan-300 bg-clip-text text-transparent">
              4 simple steps
            </span>
          </h2>

          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto leading-relaxed font-normal">
            Designed so every family member—from kids to grandparents—can connect safely in under a minute.
          </p>
        </motion.div>

        {/* Interactive 4-Step Cards with Desktop Connector Rail */}
        <div className="relative">
          <div
            className="hidden lg:block absolute top-14 left-[12%] right-[12%] h-px bg-gradient-to-r from-indigo-500/25 via-violet-500/35 to-emerald-500/25 pointer-events-none"
            aria-hidden="true"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6 relative">
            {steps.map((s, i) => {
              const Icon = s.icon;
              const isSelected = activeStepIndex === i;

              return (
                <motion.button
                  key={s.step}
                  type="button"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.45, delay: i * 0.07, ease: 'easeOut' }}
                  onClick={() => {
                    soundFx?.playPop?.();
                    setActiveStepIndex(i);
                  }}
                  aria-pressed={isSelected}
                  className={cn(
                    'group relative flex flex-col justify-between rounded-3xl p-6 sm:p-7 transition-all duration-300 text-left overflow-hidden cursor-pointer border',
                    isSelected
                      ? 'bg-white dark:bg-[#0E162B] border-indigo-400/70 dark:border-indigo-400/45 shadow-[0_18px_45px_rgba(99,102,241,0.12)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.45)] -translate-y-1'
                      : 'bg-slate-50/75 dark:bg-[#0B1120] border-slate-200/85 dark:border-white/[0.08] hover:bg-white dark:hover:bg-[#0D1426] hover:border-indigo-300/70 dark:hover:border-white/[0.16] hover:-translate-y-0.5'
                  )}
                >
                  {/* Subtle top active bar */}
                  <div
                    className={cn(
                      'absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r transition-opacity duration-300',
                      s.gradient,
                      isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'
                    )}
                  />

                  <div>
                    {/* Step indicator header */}
                    <div className="flex items-center justify-between mb-6">
                      <div
                        className={cn(
                          'h-12 w-12 rounded-2xl bg-gradient-to-br text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-300',
                          s.gradient
                        )}
                      >
                        <Icon size={21} />
                      </div>

                      <span
                        className={cn(
                          'text-2xl font-black font-mono transition-colors tabular-nums',
                          isSelected
                            ? 'text-indigo-600 dark:text-indigo-400'
                            : 'text-slate-300 dark:text-slate-700 group-hover:text-slate-400 dark:group-hover:text-slate-500'
                        )}
                      >
                        {s.step}
                      </span>
                    </div>

                    {/* Content */}
                    <span
                      className={cn(
                        'inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold border mb-2.5',
                        s.accentBg,
                        s.accentText
                      )}
                    >
                      {s.tag}
                    </span>

                    <h3 className="text-lg sm:text-xl font-black text-slate-950 dark:text-white mb-2 tracking-tight">
                      {s.title}
                    </h3>

                    <p className="text-xs sm:text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                      {s.description}
                    </p>
                  </div>

                  {/* Step Footer */}
                  <div className="pt-5 mt-5 border-t border-slate-200/70 dark:border-white/[0.07] flex flex-wrap items-center justify-between gap-2 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    <span className="inline-flex items-center gap-1.5">
                      <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                      <span>{s.outcome}</span>
                    </span>
                    <span className={cn('text-[10px] font-mono font-bold', s.accentText)}>
                      Step {s.step}
                    </span>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Interactive Guided Action Bar */}
        <div className="mt-8 rounded-2xl sm:rounded-3xl bg-slate-50/90 dark:bg-[#0D1426] border border-slate-200/85 dark:border-white/[0.08] p-4 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-start sm:items-center gap-3.5 text-left min-w-0">
            <div
              className={cn(
                'h-11 w-11 rounded-2xl bg-gradient-to-br text-white flex items-center justify-center shrink-0 shadow-sm',
                currentStep.gradient
              )}
            >
              <CurrentIcon size={20} />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Step {currentStep.step} Preview
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck size={11} />
                  {isAuthenticated ? 'Account Connected' : 'Free Forever Plan'}
                </span>
              </div>
              <div className="text-sm sm:text-base font-bold text-slate-950 dark:text-white truncate">
                {currentStep.previewLabel}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                {currentStep.previewDetail}
              </p>
            </div>
          </div>

          <Link
            href={isAuthenticated ? currentStep.authHref : currentStep.guestHref}
            onClick={() => soundFx?.playPop?.()}
            className="h-11 px-6 w-full md:w-auto justify-center rounded-full bg-gradient-to-b from-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs sm:text-sm font-semibold shadow-[0_6px_20px_rgba(99,102,241,0.28)] hover:-translate-y-0.5 active:translate-y-0 transition-all inline-flex items-center gap-2 shrink-0 group"
          >
            <span>{isAuthenticated ? currentStep.authCta : currentStep.guestCta}</span>
            <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
