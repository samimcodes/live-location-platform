'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles, Zap, Shield, Users, Crown, ArrowRight, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
      '1 Private Circle',
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

  return (
    <section id="pricing" className="py-24 sm:py-32 px-4 sm:px-6 relative overflow-hidden bg-[#F8F9FD] dark:bg-background scroll-mt-16">
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-purple-200/20 dark:bg-purple-950/20 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EDE9FE] border border-purple-200/60 text-[#7C3AED] dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800/60 text-xs font-bold shadow-2xs mb-6">
            <Crown size={14} />
            Transparent & Fair Pricing
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 dark:text-foreground mb-6 tracking-tight">
            Simple plans for{' '}
            <span className="bg-gradient-to-r from-[#7C3AED] via-[#6366F1] to-[#4F46E5] bg-clip-text text-transparent">
              every size circle
            </span>
          </h2>

          <p className="text-slate-600 dark:text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto leading-relaxed font-normal">
            Start for free with no credit card required. Upgrade anytime your family or team needs extended history and emergency features.
          </p>

          {/* Billing Switcher */}
          <div className="mt-8 inline-flex items-center gap-3 p-1.5 bg-white dark:bg-card rounded-2xl border border-slate-200/80 dark:border-border shadow-2xs">
            <button
              onClick={() => setIsYearly(false)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                !isYearly
                  ? 'bg-[#7C3AED] text-white shadow-xs'
                  : 'text-slate-600 dark:text-muted-foreground hover:text-slate-900 dark:hover:text-foreground'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
                isYearly
                  ? 'bg-[#7C3AED] text-white shadow-xs'
                  : 'text-slate-600 dark:text-muted-foreground hover:text-slate-900 dark:hover:text-foreground'
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
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: idx * 0.1, ease: 'easeOut' }}
                className={`relative rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 ${
                  tier.highlight
                    ? 'bg-white dark:bg-card border-2 border-[#7C3AED] shadow-[0_20px_60px_rgba(124,58,237,0.15)] lg:-translate-y-2'
                    : 'bg-white/90 dark:bg-card/90 border border-slate-200/80 dark:border-border/80 shadow-[0_4px_25px_rgba(0,0,0,0.03)] hover:border-purple-200 dark:hover:border-purple-800'
                }`}
              >
                {/* Popular Pill */}
                {tier.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-[#7C3AED] to-[#6366F1] text-white text-[11px] font-black tracking-widest shadow-md">
                    {tier.badge}
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between pb-2">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-foreground">{tier.name}</h3>
                    {!tier.popular && (
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-muted text-slate-600 dark:text-slate-400">
                        {tier.badge}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 dark:text-muted-foreground leading-relaxed min-h-[36px]">
                    {tier.tagline}
                  </p>

                  {/* Price */}
                  <div className="my-6 flex items-baseline gap-1.5">
                    <span className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-foreground">
                      ${price}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      / user {price > 0 ? '/ month' : ''}
                    </span>
                  </div>

                  {/* Feature Checklist */}
                  <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-border">
                    {tier.features.map((feat) => (
                      <div key={feat} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                        <div className="h-4 w-4 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                          <Check size={11} strokeWidth={3} />
                        </div>
                        <span className="leading-snug">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA Button */}
                <div className="pt-8">
                  <Button
                    size="lg"
                    className={`w-full h-12 font-bold text-sm rounded-xl transition-all ${
                      tier.highlight
                        ? 'bg-[#7C3AED] hover:bg-[#6D28D9] text-white shadow-lg shadow-purple-500/25'
                        : 'bg-slate-100 hover:bg-slate-200 dark:bg-muted dark:hover:bg-muted/80 text-slate-900 dark:text-foreground'
                    }`}
                    asChild
                  >
                    <Link href={tier.href}>
                      {tier.cta}
                      <ArrowRight size={15} className="ml-1" />
                    </Link>
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
