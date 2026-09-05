'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  UserPlus,
  Users,
  MapPin,
  Bell,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { soundFx } from '@/lib/soundFx';

const steps = [
  {
    step: '01',
    icon: UserPlus,
    title: 'Create Account',
    description:
      'Sign up free in under 60 seconds with email or Google/Facebook. No credit card required.',
    gradient: 'from-violet-600 to-indigo-600',
    tag: 'Quick 60s Onboarding',
  },
  {
    step: '02',
    icon: Users,
    title: 'Invite Your Circle',
    description:
      'Share a private 6-character code or instant invite link with family members and close friends.',
    gradient: 'from-purple-600 to-violet-600',
    tag: 'Private & Encrypted',
  },
  {
    step: '03',
    icon: MapPin,
    title: 'Pin Safe Zones',
    description:
      'Set custom geofence perimeter zones around Home, School, or Office for automatic detection.',
    gradient: 'from-pink-500 to-rose-600',
    tag: 'Automated Geofencing',
  },
  {
    step: '04',
    icon: Bell,
    title: 'Stay Connected 24/7',
    description:
      'Receive real-time entry and exit push alerts, battery warnings, and view live map updates.',
    gradient: 'from-emerald-500 to-teal-600',
    tag: 'Total Peace of Mind',
  },
];

export function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="py-24 sm:py-32 px-4 sm:px-6 bg-[#F6F8FD] dark:bg-background relative overflow-hidden scroll-mt-16"
    >
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 dark:bg-indigo-900/10 rounded-full blur-[130px] pointer-events-none -translate-y-1/2 translate-x-1/4" />

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-center mb-16 sm:mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300 text-xs font-bold shadow-2xs mb-5">
            <Sparkles size={14} />
            <span>Frictionless Setup</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-950 dark:text-white mb-6 tracking-tight leading-[1.1]">
            Up and running in{' '}
            <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 bg-clip-text text-transparent">
              4 simple steps
            </span>
          </h2>

          <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed font-normal">
            LocaLink is built to be completely frictionless for every member of your family, from young kids to grandparents.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: i * 0.1, ease: 'easeOut' }}
                onMouseEnter={() => soundFx?.playPop?.()}
                className="group relative flex flex-col justify-between rounded-3xl bg-white dark:bg-[#0E1528] border border-slate-200/80 dark:border-slate-800/80 p-7 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_25px_rgba(0,0,0,0.3)] hover:shadow-[0_20px_45px_rgba(124,58,237,0.12)] hover:border-violet-400/50 dark:hover:border-violet-600/50 hover:-translate-y-1.5 transition-all duration-300 text-left overflow-hidden"
              >
                {/* Step indicator header */}
                <div className="flex items-center justify-between mb-6">
                  <div
                    className={cn(
                      'h-14 w-14 rounded-2xl bg-gradient-to-br text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300',
                      s.gradient
                    )}
                  >
                    <Icon size={24} />
                  </div>

                  <span className="text-3xl font-black font-mono text-slate-200 dark:text-slate-800/80 group-hover:text-violet-500/50 transition-colors">
                    {s.step}
                  </span>
                </div>

                {/* Content */}
                <div>
                  <span className="text-[10px] font-mono font-black text-violet-600 dark:text-violet-400 uppercase tracking-wider block mb-1.5">
                    {s.tag}
                  </span>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
                    {s.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                    {s.description}
                  </p>
                </div>

                {/* Bottom decorative subtle indicator */}
                <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-emerald-500" />
                    <span>Instant Activation</span>
                  </span>
                  <span className="text-[10px] font-mono font-bold text-violet-600 dark:text-violet-400">
                    Step {s.step} of 04
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
