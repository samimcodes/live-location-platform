'use client';

import React from 'react';
import Link from 'next/link';
import { Globe, Shield, Heart, Radio, Activity, Lock, ArrowUpRight } from 'lucide-react';
import { soundFx } from '@/lib/soundFx';

export function LandingFooter() {
  return (
    <footer className="border-t border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#080C16] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 mb-16">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4 text-left">
            <Link
              href="/"
              onClick={() => soundFx.playPop()}
              className="flex items-center gap-3 group inline-flex cursor-pointer"
            >
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-violet-500/20 group-hover:scale-105 transition-transform">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z" fill="white" fillOpacity="0.25" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
                  <path d="M12 11.5C13.3807 11.5 14.5 10.3807 14.5 9C14.5 7.61929 13.3807 6.5 12 6.5C10.6193 6.5 9.5 7.61929 9.5 9C9.5 10.3807 10.6193 11.5 12 11.5Z" fill="white"/>
                </svg>
              </div>
              <div className="flex flex-col text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-black tracking-tight text-slate-950 dark:text-white leading-none">
                    LocaLink
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300">
                    Live
                  </span>
                </div>
                <span className="text-[9px] font-black tracking-widest text-violet-600 dark:text-violet-400 uppercase mt-0.5">
                  REALTIME GPS PLATFORM
                </span>
              </div>
            </Link>

            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm leading-relaxed font-normal">
              Continuous live GPS location platform designed for modern families, trusted circles, and safety teams. End-to-end encrypted and battery optimized.
            </p>

            {/* System Status Indicators */}
            <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-2 font-medium flex-wrap">
              <span className="flex items-center gap-1.5">
                <Lock size={14} className="text-emerald-500" /> AES-256 Encrypted
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> All Systems Live (99.99%)
              </span>
            </div>
          </div>

          {/* Product Navigation */}
          <div className="text-left">
            <h4 className="text-xs font-black text-slate-900 dark:text-white mb-4 uppercase tracking-wider">
              Product
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-600 dark:text-slate-400 font-medium">
              {[
                { label: 'Live Map Intelligence', href: '#map-preview' },
                { label: 'Features Grid', href: '#features' },
                { label: 'Emergency SOS', href: '#emergency-sos' },
                { label: 'How It Works', href: '#how-it-works' },
                { label: 'Circles & Privacy', href: '#circles-safety' },
                { label: 'Pricing Plans', href: '#pricing' },
              ].map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors inline-block"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Safety & Tools */}
          <div className="text-left">
            <h4 className="text-xs font-black text-slate-900 dark:text-white mb-4 uppercase tracking-wider">
              Safety & Tools
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-600 dark:text-slate-400 font-medium">
              {[
                { label: 'Geofence Safe Zones', href: '#features' },
                { label: '30-Day Trip Replay', href: '#features' },
                { label: 'Ghost Mode Privacy', href: '#circles-safety' },
                { label: 'Low Battery Warnings', href: '#circles-safety' },
                { label: 'Emergency Dispatch', href: '#emergency-sos' },
                { label: 'Live Web Dashboard', href: '/login' },
              ].map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors inline-block"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal & Security */}
          <div className="text-left">
            <h4 className="text-xs font-black text-slate-900 dark:text-white mb-4 uppercase tracking-wider">
              Security & Legal
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-600 dark:text-slate-400 font-medium">
              {[
                { label: 'Privacy Policy', href: '#' },
                { label: 'Terms of Service', href: '#' },
                { label: 'Security Architecture', href: '#' },
                { label: 'Data Zero-Knowledge', href: '#' },
                { label: 'Customer Reviews', href: '#testimonials' },
                { label: 'FAQ', href: '#faq' },
              ].map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors inline-block"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            © {new Date().getFullYear()} LocaLink Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span>Built for family safety, continuous connection, and absolute privacy</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
