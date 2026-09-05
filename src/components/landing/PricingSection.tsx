'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Check,
  Sparkles,
  Zap,
  Shield,
  Users,
  Crown,
  ArrowRight,
  HelpCircle,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { soundFx } from '@/lib/soundFx';
import Link from 'next/link';

const tiers = [
  {
    name: 'Free Circle',
    tagline: 'Essential real-time tracking for individuals and small families.',
    priceMonthly: 0,
    priceYearly: 0,
    popular: false,
    badge: 'FREE FOREVER',
    features: [
      'Up to 5 Circle Members',
      '1 Private Circle Hub',
      'Real-time 15s GPS Map Tracking',
      '2 Custom Geofence Safe Zones',
      '7-Day Location Route History',
      'Ghost Mode Privacy Controls',
      'Standard Web & Mobile Access',
    ],
    cta: 'Get Started Free',
    href: '/register',
    highlight: false,
  },
  {
    name: 'Family Pro',
    tagline: 'Total peace of mind with 30-day replay and emergency dispatch.',
    priceMonthly: 4.99,
    priceYearly: 3.99,
    popular: true,
    badge: 'MOST POPULAR',
    features: [
      'Up to 15 Circle Members',
      'Unlimited Private Circles',
      'Sub-20ms Real-Time GPS Tracking',
      'Unlimited Geofence Safe Zones',
      '30-Day Interactive Route Replay',
      '1-Click Emergency SOS Dispatch & SMS',
      'Low Battery & Speed Alerts (<15%)',
      'Individual Ghost Mode Granularity',
    ],
    cta: 'Start 14-Day Free Trial',
    href: '/register',
    highlight: true,
  },
  {
    name: 'Fleet & Teams',
    tagline: 'Advanced telemetry and admin controls for teams & organizations.',
    priceMonthly: 12.99,
    priceYearly: 9.99,
    popular: false,
    badge: 'FOR TEAMS',
    features: [
      'Unlimited Circle Members',
      'Unlimited Circles & Sub-teams',
      '1-Year GPS Timeline History',
      'Custom Geofence Radius & Polygonal Zones',
      'Admin Role Management & Audit Logs',
      'Priority Socket.IO Dedicated Bandwidth',
      'REST API & Webhook Integrations',
      '24/7 Dedicated Support Specialist',
    ],
    cta: 'Get Team Access',
    href: '/register',
    highlight: false,
  },
];

export function PricingSection() {
  const [isYearly, setIsYearly] = useState(true);

  const handleToggleBilling = (yearly: boolean) => {
    soundFx.playPop();
    setIsYearly(yearly);
  };

  return (
    <section
      id="pricing"
      className="py-24 sm:py-32 px-4 sm:px-6 relative overflow-hidden bg-[#F6F8FD] dark:bg-background scroll-mt-16"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-violet-500/10 dark:bg-violet-950/20 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-center mb-16 sm:mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300 text-xs font-bold shadow-2xs mb-5">
            <Crown size={14} />
            <span>Transparent & Fair Pricing</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-950 dark:text-white mb-6 tracking-tight leading-[1.1]">
            Simple plans for{' '}
            <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 bg-clip-text text-transparent">
              every size circle
            </span>
          </h2>

          <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed font-normal">
            Start for free with no credit card required. Upgrade anytime your family or team needs extended history and emergency features.
          </p>

          {/* Billing Switcher */}
          <div className="mt-8 inline-flex items-center gap-2 p-1.5 bg-white dark:bg-[#0E1528] rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm">
            <button
              onClick={() => handleToggleBilling(false)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                !isYearly
                  ? 'bg-violet-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => handleToggleBilling(true)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
                isYearly
                  ? 'bg-violet-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>Annual Billing</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                SAVE 20%
              </span>
            </button>
          </div>
        </motion.div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {tiers.map((tier, idx) => {
            const price = isYearly ? tier.priceYearly : tier.priceMonthly;
            return (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: idx * 0.1, ease: 'easeOut' }}
                className={`relative rounded-[30px] p-8 sm:p-9 flex flex-col justify-between transition-all duration-300 text-left ${
                  tier.highlight
                    ? 'bg-white dark:bg-[#0E1528] border-2 border-violet-600 shadow-[0_20px_60px_rgba(124,58,237,0.18)] lg:-translate-y-2'
                    : 'bg-white/95 dark:bg-[#0E1528]/80 border border-slate-200/90 dark:border-slate-800/80 shadow-[0_4px_25px_rgba(0,0,0,0.03)] hover:border-violet-300 dark:hover:border-violet-700'
                }`}
              >
                {/* Popular Pill */}
                {tier.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-[10px] font-black tracking-widest shadow-md">
                    {tier.badge}
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between pb-2">
                    <h3 className="text-xl font-black text-slate-900 dark:text-foreground">
                      {tier.name}
                    </h3>
                    {!tier.popular && (
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {tier.badge}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed min-h-[36px]">
                    {tier.tagline}
                  </p>

                  {/* Price */}
                  <div className="my-6 flex items-baseline gap-1.5">
                    <span className="text-4xl sm:text-5xl font-black text-slate-950 dark:text-white">
                      ${price}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      / user {price > 0 ? (isYearly ? '/ month (billed yearly)' : '/ month') : ''}
                    </span>
                  </div>

                  {/* Feature Checklist */}
                  <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-3">
                      Included Capabilities:
                    </span>
                    {tier.features.map((f) => (
                      <div key={f} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                        <CheckCircle2 size={15} className="text-emerald-500 shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action CTA Button */}
                <div className="pt-8 mt-6 border-t border-slate-100 dark:border-slate-800">
                  <Button
                    size="lg"
                    className={`w-full h-12 font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      tier.highlight
                        ? 'bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-500/25'
                        : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-foreground'
                    }`}
                    onClick={() => soundFx.playPop()}
                    asChild
                  >
                    <Link href={tier.href}>
                      <span>{tier.cta}</span>
                      <ArrowRight size={15} />
                    </Link>
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Guarantee Banner */}
        <div className="mt-12 flex items-center justify-center gap-6 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
          <span className="flex items-center gap-1.5 font-medium">
            <CheckCircle2 size={14} className="text-emerald-500" /> 14-day free trial on Pro
          </span>
          <span className="h-3 w-px bg-slate-200 dark:bg-border hidden sm:block" />
          <span className="flex items-center gap-1.5 font-medium">
            <ShieldCheck size={14} className="text-violet-500" /> Cancel anytime with 1 click
          </span>
          <span className="h-3 w-px bg-slate-200 dark:bg-border hidden sm:block" />
          <span className="flex items-center gap-1.5 font-medium">
            <Zap size={14} className="text-amber-500" /> No credit card required for Free Circle
          </span>
        </div>
      </div>
    </section>
  );
}
