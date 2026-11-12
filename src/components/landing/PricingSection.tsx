'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { soundFx } from '@/lib/soundFx';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

interface PricingTier {
  id: string;
  name: string;
  tagline: string;
  monthlyPrice: string;
  yearlyPrice: string;
  yearlyTotal: string;
  cta: string;
  ctaAuthenticated: string;
  highlight: boolean;
  featureHeading: string;
  features: string[];
}

const tiers: PricingTier[] = [
  {
    id: 'free',
    name: 'Free Circle',
    tagline: 'Real-time sharing, Ghost Mode, and SOS safety for everyday personal circles.',
    monthlyPrice: '0',
    yearlyPrice: '0',
    yearlyTotal: 'Free forever · No card required',
    cta: 'Get Started Free',
    ctaAuthenticated: 'Open Dashboard',
    highlight: false,
    featureHeading: 'Core features included',
    features: [
      'Up to 5 active Circle members',
      'Sub-second WebSocket GPS updates',
      '1-tap Ghost Mode privacy toggle',
      'Instant 1-tap SOS alert broadcast',
      '24-hour route & location timeline',
    ],
  },
  {
    id: 'family-pro',
    name: 'Family Pro',
    tagline: 'Extended route history, unlimited Smart Zones, and proactive safety alerts.',
    monthlyPrice: '4.99',
    yearlyPrice: '3.99',
    yearlyTotal: 'Billed $47.88 / member annually',
    cta: 'Start Family Pro',
    ctaAuthenticated: 'Manage Plan',
    highlight: true,
    featureHeading: 'Everything in Free, plus',
    features: [
      'Unlimited Circle members & groups',
      'Unlimited Smart Arrival & Departure Zones',
      '30-day route playback & GPX export',
      'Low-battery & connectivity alerts',
      'Priority SOS escalation notifications',
    ],
  },
  {
    id: 'fleet-teams',
    name: 'Fleet & Teams',
    tagline: 'Shared dispatcher map views, multi-room coordination, and 90-day audit logs.',
    monthlyPrice: '12.99',
    yearlyPrice: '9.99',
    yearlyTotal: 'Billed $119.88 / seat annually',
    cta: 'Create Team Workspace',
    ctaAuthenticated: 'Manage Team',
    highlight: false,
    featureHeading: 'Everything in Family Pro, plus',
    features: [
      'Multiple dedicated team rooms',
      '90-day timeline & GPX activity logs',
      'Shared dispatcher map overview',
      'Bulk member invite & role controls',
      'Dedicated onboarding support',
    ],
  },
];

export function PricingSection() {
  const { isAuthenticated } = useAuth();
  const [isYearly, setIsYearly] = useState(true);

  const handleToggleBilling = (yearly: boolean) => {
    if (yearly === isYearly) return;
    soundFx?.playPop();
    setIsYearly(yearly);
  };

  return (
    <section
      id="pricing"
      className="relative scroll-mt-16 border-t border-slate-200/80 bg-[#F6F8FD] px-4 py-16 dark:border-white/[0.06] dark:bg-[#070B16] sm:px-6 sm:py-24 lg:py-28"
    >
      <div className="mx-auto max-w-6xl">
        {/* Clean Editorial Header */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.4 }}
          className="mx-auto mb-12 max-w-2xl text-center sm:mb-14"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-600 dark:text-indigo-400">
            Pricing
          </p>

          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl lg:text-[42px] lg:leading-[1.15]">
            Transparent plans that scale with your circle
          </h2>

          <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-400 sm:text-base">
            Start free with real-time GPS, Ghost Mode, and SOS alerts. Upgrade only when you need extended history or team workspaces.
          </p>

          {/* Clean Segmented Billing Toggle */}
          <div className="mt-8 inline-flex items-center rounded-xl border border-slate-200 bg-white p-1 shadow-xs dark:border-white/[0.08] dark:bg-[#0D1426]">
            <button
              type="button"
              aria-pressed={!isYearly}
              onClick={() => handleToggleBilling(false)}
              className={`relative rounded-lg px-4 py-1.5 text-xs font-semibold transition-colors sm:text-sm ${
                !isYearly
                  ? 'text-white dark:text-slate-900'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              {!isYearly && (
                <motion.span
                  layoutId="pricing-billing-pill"
                  transition={{ type: 'spring', stiffness: 450, damping: 36 }}
                  className="absolute inset-0 rounded-lg bg-slate-900 dark:bg-white"
                />
              )}
              <span className="relative z-10">Monthly</span>
            </button>

            <button
              type="button"
              aria-pressed={isYearly}
              onClick={() => handleToggleBilling(true)}
              className={`relative flex items-center gap-2 rounded-lg px-4 py-1.5 text-xs font-semibold transition-colors sm:text-sm ${
                isYearly
                  ? 'text-white dark:text-slate-900'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              {isYearly && (
                <motion.span
                  layoutId="pricing-billing-pill"
                  transition={{ type: 'spring', stiffness: 450, damping: 36 }}
                  className="absolute inset-0 rounded-lg bg-slate-900 dark:bg-white"
                />
              )}
              <span className="relative z-10">Annual</span>
              <span
                className={`relative z-10 rounded-md px-1.5 py-0.5 text-[10px] font-semibold tracking-wide transition-colors ${
                  isYearly
                    ? 'bg-emerald-500/20 text-emerald-300 dark:bg-emerald-600/15 dark:text-emerald-700'
                    : 'bg-emerald-500/10 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-400'
                }`}
              >
                Save 20%
              </span>
            </button>
          </div>
        </motion.div>

        {/* Aligned 3-Column Grid */}
        <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-3 lg:gap-6">
          {tiers.map((tier, idx) => {
            const activePrice = isYearly ? tier.yearlyPrice : tier.monthlyPrice;
            const isFree = activePrice === '0';
            const showDiscount = isYearly && !isFree;
            const ctaHref = isAuthenticated
              ? tier.id === 'free'
                ? '/dashboard'
                : '/dashboard/settings'
              : '/register';
            const ctaLabel = isAuthenticated ? tier.ctaAuthenticated : tier.cta;

            return (
              <motion.div
                key={tier.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.35, delay: idx * 0.06 }}
                className={`relative flex h-full flex-col rounded-2xl bg-white p-6 transition-colors dark:bg-[#0D1426] sm:p-8 ${
                  tier.highlight
                    ? 'border border-indigo-500/70 shadow-[0_18px_45px_-22px_rgba(79,70,229,0.28)] ring-1 ring-indigo-500/15 dark:border-indigo-400/50 dark:ring-indigo-400/15'
                    : 'border border-slate-200/90 shadow-xs hover:border-slate-300 dark:border-white/[0.08] dark:hover:border-white/[0.16]'
                }`}
              >
                {/* Title & Inline Popular Pill */}
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
                    {tier.name}
                  </h3>
                  {tier.highlight && (
                    <span className="rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-600 dark:bg-indigo-400/15 dark:text-indigo-300">
                      Most Popular
                    </span>
                  )}
                </div>

                <p className="mt-2 min-h-[42px] text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  {tier.tagline}
                </p>

                {/* Price */}
                <div className="mt-6 border-b border-slate-200/80 pb-6 dark:border-white/[0.08]">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold tracking-tight text-slate-900 tabular-nums dark:text-white">
                      ${activePrice}
                    </span>
                    {showDiscount && (
                      <span className="text-sm font-medium text-slate-400 line-through tabular-nums dark:text-slate-500">
                        ${tier.monthlyPrice}
                      </span>
                    )}
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      {isFree ? '/ forever' : '/ member / month'}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                    {isFree
                      ? tier.yearlyTotal
                      : isYearly
                        ? tier.yearlyTotal
                        : 'Billed monthly · Cancel anytime'}
                  </p>
                </div>

                {/* Features */}
                <div className="mt-6 flex-1">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    {tier.featureHeading}
                  </p>
                  <ul className="mt-4 space-y-3">
                    {tier.features.map((feat) => (
                      <li
                        key={feat}
                        className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-200"
                      >
                        <Check
                          className={`mt-0.5 h-4 w-4 shrink-0 ${
                            tier.highlight
                              ? 'text-indigo-600 dark:text-indigo-400'
                              : 'text-slate-400 dark:text-slate-500'
                          }`}
                        />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA */}
                <Link href={ctaHref} className="mt-8 block w-full">
                  <Button
                    type="button"
                    onClick={() => soundFx?.playPop()}
                    className={`group flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all ${
                      tier.highlight
                        ? 'bg-indigo-600 text-white shadow-sm hover:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400'
                        : 'border border-slate-200 bg-slate-50 text-slate-900 hover:bg-slate-100 dark:border-white/[0.1] dark:bg-white/[0.04] dark:text-white dark:hover:bg-white/[0.09]'
                    }`}
                  >
                    <span>{ctaLabel}</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Button>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Clean Minimal Trust Line */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-500 dark:text-slate-400">
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            End-to-end encrypted telemetry
          </span>
          <span aria-hidden="true" className="hidden text-slate-300 dark:text-slate-700 sm:inline">
            •
          </span>
          <span>No ad tracking or data resale</span>
          <span aria-hidden="true" className="hidden text-slate-300 dark:text-slate-700 sm:inline">
            •
          </span>
          <span>Switch or cancel anytime</span>
        </div>
      </div>
    </section>
  );
}

export default PricingSection;
