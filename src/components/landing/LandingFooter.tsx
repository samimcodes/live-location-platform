'use client';

import React from 'react';
import Link from 'next/link';
import { Lock } from 'lucide-react';
import { soundFx } from '@/lib/soundFx';
import { useAuth } from '@/hooks/useAuth';

export function LandingFooter() {
  const { isAuthenticated } = useAuth();

  return (
    <footer className="relative overflow-hidden border-t border-slate-200/80 bg-[#F6F8FD] dark:border-white/[0.06] dark:bg-[#070B16]">
      <div className="mx-auto max-w-7xl px-4 pb-10 pt-12 sm:px-6 sm:pt-16">
        <div className="mb-12 grid grid-cols-1 gap-10 lg:mb-14 lg:grid-cols-12 lg:gap-8">
          {/* Brand Column */}
          <div className="space-y-4 text-left lg:col-span-5">
            <Link
              href="/"
              onClick={() => soundFx?.playPop?.()}
              className="group inline-flex cursor-pointer items-center gap-3"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-sm transition-transform group-hover:scale-105">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z"
                    fill="white"
                    fillOpacity="0.25"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 11.5C13.3807 11.5 14.5 10.3807 14.5 9C14.5 7.61929 13.3807 6.5 12 6.5C10.6193 6.5 9.5 7.61929 9.5 9C9.5 10.3807 10.6193 11.5 12 11.5Z"
                    fill="white"
                  />
                </svg>
              </div>
              <div className="flex flex-col text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-bold leading-none tracking-tight text-slate-950 dark:text-white">
                    LocaLink
                  </span>
                  <span className="rounded-md bg-indigo-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-700 dark:bg-indigo-400/15 dark:text-indigo-300">
                    Live
                  </span>
                </div>
                <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-indigo-600 dark:text-indigo-400">
                  Real-Time GPS Platform
                </span>
              </div>
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

        {/* Bottom Bar */}
        <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-200/80 pt-7 text-center dark:border-white/[0.06] sm:flex-row sm:text-left">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            © {new Date().getFullYear()} LocaLink. All rights reserved.
          </p>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Built for family safety, continuous connection, and privacy.
          </p>
        </div>
      </div>
    </footer>
  );
}
