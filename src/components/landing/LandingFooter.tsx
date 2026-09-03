'use client';

import React from 'react';
import Link from 'next/link';
import { Globe, Shield, Heart, Radio } from 'lucide-react';

export function LandingFooter() {
  return (
    <footer className="border-t border-slate-200/80 dark:border-border/60 bg-white dark:bg-card relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 mb-16">
          
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4 text-left">
            <Link href="/" className="flex items-center gap-3 group inline-flex">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#5B21B6] flex items-center justify-center text-white shadow-md shadow-purple-500/20 group-hover:scale-105 transition-transform">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z" fill="white" fillOpacity="0.25" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
                  <path d="M12 11.5C13.3807 11.5 14.5 10.3807 14.5 9C14.5 7.61929 13.3807 6.5 12 6.5C10.6193 6.5 9.5 7.61929 9.5 9C9.5 10.3807 10.6193 11.5 12 11.5Z" fill="white"/>
                </svg>
              </div>
              <div className="flex flex-col text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-black tracking-tight text-slate-900 dark:text-foreground leading-none">
                    LocaLink
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-purple-100 text-[#7C3AED] dark:bg-purple-950/60 dark:text-purple-300">
                    Live
                  </span>
                </div>
                <span className="text-[9px] font-black tracking-widest text-[#7C3AED] uppercase mt-0.5">
                  REALTIME GPS PLATFORM
                </span>
              </div>
            </Link>
            
            <p className="text-sm text-slate-600 dark:text-muted-foreground max-w-sm leading-relaxed font-normal">
              Real-time family location sharing and safety platform. Private, battery-optimized, and built for instant peace of mind.
            </p>
            
            <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-muted-foreground pt-2 font-medium">
              <span className="flex items-center gap-1.5">
                <Shield size={14} className="text-emerald-500" /> End-to-End Encrypted
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> All Systems Live (99.9%)
              </span>
            </div>
          </div>

          {/* Product Links */}
          <div className="text-left">
            <h4 className="text-xs font-bold text-slate-900 dark:text-foreground mb-4 uppercase tracking-wider">Product</h4>
            <ul className="space-y-2.5 text-sm text-slate-600 dark:text-muted-foreground font-medium">
              {[
                { label: 'Live Map', href: '#map-preview' },
                { label: 'Features', href: '#features' },
                { label: 'How It Works', href: '#how-it-works' },
                { label: 'Circles & Safety', href: '#circles-safety' },
                { label: 'Live Dashboard', href: '/dashboard' },
              ].map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="hover:text-[#7C3AED] transition-colors inline-block">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Platform Features */}
          <div className="text-left">
            <h4 className="text-xs font-bold text-slate-900 dark:text-foreground mb-4 uppercase tracking-wider">Safety & Tools</h4>
            <ul className="space-y-2.5 text-sm text-slate-600 dark:text-muted-foreground font-medium">
              {[
                { label: 'Geofence Safe Zones', href: '#features' },
                { label: '30-Day Trip Replay', href: '#features' },
                { label: 'Ghost Mode Privacy', href: '#circles-safety' },
                { label: 'Low Battery Alerts', href: '#circles-safety' },
                { label: 'Emergency Check-in', href: '#circles-safety' },
              ].map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="hover:text-[#7C3AED] transition-colors inline-block">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal & Security */}
          <div className="text-left">
            <h4 className="text-xs font-bold text-slate-900 dark:text-foreground mb-4 uppercase tracking-wider">Security & Legal</h4>
            <ul className="space-y-2.5 text-sm text-slate-600 dark:text-muted-foreground font-medium">
              {[
                { label: 'Privacy Policy', href: '#' },
                { label: 'Terms of Service', href: '#' },
                { label: 'Security Overview', href: '#' },
                { label: 'Data Encryption', href: '#' },
                { label: 'FAQ', href: '#faq' },
              ].map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="hover:text-[#7C3AED] transition-colors inline-block">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-100 dark:border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500 dark:text-muted-foreground font-medium">
            © {new Date().getFullYear()} LocaLink Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-muted-foreground font-medium">
            <span>Built with</span>
            <Heart size={13} className="text-red-500 fill-red-500" />
            <span>for family safety & real-time connection</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
