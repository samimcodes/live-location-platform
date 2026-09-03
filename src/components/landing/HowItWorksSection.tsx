'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Users, MapPin, Bell, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const steps = [
  {
    step: '01',
    icon: UserPlus,
    title: 'Create Account',
    description: 'Sign up free in under 60 seconds with email or Google/Facebook. No credit card required.',
    gradient: 'from-[#7C3AED] to-[#6366F1]',
    glowColor: 'rgba(124,58,237,0.15)',
  },
  {
    step: '02',
    icon: Users,
    title: 'Invite Your Circle',
    description: 'Share a private 6-character code or instant invite link with family and trusted friends.',
    gradient: 'from-[#8B5CF6] to-[#A855F7]',
    glowColor: 'rgba(139,92,246,0.15)',
  },
  {
    step: '03',
    icon: MapPin,
    title: 'Pin Safe Zones',
    description: 'Set custom geofence boundaries around Home, School, or Work for automatic detection.',
    gradient: 'from-[#EC4899] to-[#F43F5E]',
    glowColor: 'rgba(236,72,153,0.15)',
  },
  {
    step: '04',
    icon: Bell,
    title: 'Stay Connected 24/7',
    description: 'Receive real-time entry/exit push alerts, battery warnings, and view live map updates.',
    gradient: 'from-[#10B981] to-[#059669]',
    glowColor: 'rgba(16,185,129,0.15)',
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 sm:py-32 px-4 sm:px-6 bg-[#F8F9FD] dark:bg-background relative overflow-hidden scroll-mt-16">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-100/30 dark:bg-indigo-900/10 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/4" />

      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EDE9FE] border border-purple-200/60 text-[#7C3AED] dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800/60 text-xs font-bold shadow-2xs mb-6">
            <Sparkles size={14} />
            Simple 4-Step Setup
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 dark:text-foreground mb-6 tracking-tight">
            Up and running in{' '}
            <span className="bg-gradient-to-r from-[#7C3AED] via-[#6366F1] to-[#4F46E5] bg-clip-text text-transparent">
              4 simple steps
            </span>
          </h2>
          <p className="text-slate-600 dark:text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto leading-relaxed font-normal">
            LocaLink is built to be completely frictionless for every member of your family, from kids to grandparents.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <React.Fragment key={s.step}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.5, delay: i * 0.12, ease: 'easeOut' }}
                  className="group relative flex flex-col items-center text-center"
                >
                  {/* Card */}
                  <div
                    className="w-full h-full rounded-3xl bg-white dark:bg-card border border-slate-200/80 dark:border-border/80 p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_50px_rgba(124,58,237,0.08)] hover:-translate-y-2 transition-all duration-300 relative overflow-hidden flex flex-col justify-between"
                    style={{ background: 'radial-gradient(ellipse at 50% 0%, ' + s.glowColor + ' 0%, transparent 70%)' }}
                  >
                    {/* Top gradient bar on hover */}
                    <div className={cn('absolute top-0 left-0 right-0 h-1 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-3xl', s.gradient)} />

                    {/* Step number badge */}
                    <div className={cn('absolute top-4 right-4 h-7 w-7 rounded-full bg-gradient-to-br text-white text-xs font-black flex items-center justify-center shadow-md', s.gradient)}>
                      {i + 1}
                    </div>

                    <div>
                      {/* Icon */}
                      <div className={cn('h-16 w-16 rounded-2xl bg-gradient-to-br text-white flex items-center justify-center mx-auto mb-6 shadow-md group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300', s.gradient)}>
                        <Icon size={28} />
                      </div>

                      <h3 className="text-lg font-bold text-slate-900 dark:text-foreground mb-2.5">{s.title}</h3>
                      <p className="text-sm text-slate-600 dark:text-muted-foreground leading-relaxed font-normal">{s.description}</p>
                    </div>
                  </div>
                </motion.div>

                {/* Arrow connector between steps (desktop) */}
                {i < steps.length - 1 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.12 + 0.3 }}
                    className="hidden lg:flex absolute items-center justify-center pointer-events-none"
                    style={{ left: `calc(${(i + 1) * 25}% - 14px)`, top: '50%', transform: 'translateY(-50%)', zIndex: 10 }}
                  >
                    <div className="h-8 w-8 rounded-full bg-white dark:bg-card border border-purple-200/80 dark:border-purple-800/60 shadow-md flex items-center justify-center">
                      <ArrowRight size={14} className="text-[#7C3AED]" />
                    </div>
                  </motion.div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </section>
  );
}
