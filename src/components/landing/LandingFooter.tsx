'use client';

import React from 'react';
import Link from 'next/link';
import { Lock, ArrowUp } from 'lucide-react';
import { soundFx } from '@/lib/soundFx';
import { useAuth } from '@/hooks/useAuth';
import { LocaLinkLogo } from '@/components/brand/LocaLinkLogo';

export function LandingFooter() {
  const { isAuthenticated } = useAuth();

  const scrollToTop = () => {
    soundFx?.playPop?.();
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="relative overflow-hidden border-t border-slate-200/80 bg-[#F6F8FD] dark:border-white/[0.06] dark:bg-[#070B16]">
      {/* Subtle ambient architectural glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 h-[320px] w-[680px] -translate-x-1/2 rounded-full bg-indigo-500/[0.04] blur-[120px] dark:bg-indigo-500/[0.07]"
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-10 pt-12 sm:px-6 sm:pt-16">
        <div className="mb-12 grid grid-cols-1 gap-10 lg:mb-14 lg:grid-cols-12 lg:gap-8">
          {/* Brand Column */}
          <div className="space-y-4 text-left lg:col-span-5">
            <Link
              href="/"
              onClick={() => soundFx?.playPop?.()}
              className="group inline-flex cursor-pointer items-center"
            >
              <LocaLinkLogo size="lg" showSubtitle={true} />
            </Link>

            <p className="max-w-sm text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              Continuous live GPS location sharing designed for modern families, trusted circles, and safety teams. Encrypted telemetry with adaptive battery efficiency.
            </p>

            {/* System Status Indicators */}
            <div className="flex flex-wrap items-center gap-4 pt-1 text-xs font-medium text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                Encrypted Telemetry
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                Real-Time WebSocket Sync
              </span>
            </div>
          </div>

          {/* Link Columns Wrapper */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-7">
            {/* Product Navigation */}
            <div className="text-left">
              <h4 className="mb-4 text-xs font-semibold uppercase tracking-[0.12em] text-slate-900 dark:text-white">
                Product
              </h4>
              <ul className="space-y-2.5 text-sm font-medium text-slate-600 dark:text-slate-400">
                {[
                  { label: 'Live Map Preview', href: '#map-preview' },
                  { label: 'Features Grid', href: '#features' },
                  { label: 'Circles & Privacy', href: '#circles-safety' },
                  { label: 'Emergency SOS', href: '#emergency-sos' },
                  { label: 'How It Works', href: '#how-it-works' },
                  { label: 'Pricing Plans', href: '#pricing' },
                ].map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="inline-block transition-colors hover:text-indigo-600 dark:hover:text-indigo-400"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Safety & Tools */}
            <div className="text-left">
              <h4 className="mb-4 text-xs font-semibold uppercase tracking-[0.12em] text-slate-900 dark:text-white">
                Safety & Tools
              </h4>
              <ul className="space-y-2.5 text-sm font-medium text-slate-600 dark:text-slate-400">
                {[
                  { label: 'Geofence Safe Zones', href: '#features' },
                  { label: 'Route Replay & GPX', href: '#features' },
                  { label: 'Ghost Mode Privacy', href: '#circles-safety' },
                  { label: 'Battery Telemetry', href: '#circles-safety' },
                  { label: 'Emergency Dispatch', href: '#emergency-sos' },
                  {
                    label: isAuthenticated ? 'Open Dashboard' : 'Live Web Dashboard',
                    href: isAuthenticated ? '/dashboard' : '/login',
                  },
                ].map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="inline-block transition-colors hover:text-indigo-600 dark:hover:text-indigo-400"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Security & Support */}
            <div className="text-left">
              <h4 className="mb-4 text-xs font-semibold uppercase tracking-[0.12em] text-slate-900 dark:text-white">
                Support & Trust
              </h4>
              <ul className="space-y-2.5 text-sm font-medium text-slate-600 dark:text-slate-400">
                {[
                  { label: 'Privacy & Security', href: '#faq' },
                  { label: 'Battery Optimization', href: '#faq' },
                  { label: 'OSRM Navigation', href: '#faq' },
                  { label: 'FAQ', href: '#faq' },
                  {
                    label: isAuthenticated ? 'Account Settings' : 'Create Free Account',
                    href: isAuthenticated ? '/dashboard/settings' : '/register',
                  },
                ].map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="inline-block transition-colors hover:text-indigo-600 dark:hover:text-indigo-400"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar with Back to Top */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-200/80 pt-7 text-center dark:border-white/[0.06] sm:flex-row sm:text-left">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            © {new Date().getFullYear()} LocaLink. All rights reserved. Built for family safety and privacy.
          </p>

          <button
            type="button"
            onClick={scrollToTop}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200/90 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs transition-colors hover:bg-slate-100 hover:text-indigo-600 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-slate-300 dark:hover:bg-white/[0.08] dark:hover:text-white"
            aria-label="Scroll back to top"
          >
            <span>Back to top</span>
            <ArrowUp className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
}
