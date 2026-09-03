'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Smartphone, Download, QrCode, Shield, Zap, Sparkles, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function AppDownloadSection() {
  return (
    <section className="py-20 sm:py-28 px-4 sm:px-6 relative overflow-hidden bg-white dark:bg-background border-t border-slate-100 dark:border-border/60">
      <div className="max-w-7xl mx-auto">
        <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-purple-950 to-indigo-950 text-white p-8 sm:p-14 relative overflow-hidden shadow-2xl border border-white/10">
          
          {/* Ambient Glows */}
          <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-purple-500/20 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[350px] h-[350px] bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-purple-200 text-xs font-bold backdrop-blur-md">
                <Smartphone size={14} className="text-emerald-400" />
                Cross-Platform & Progressive Web App
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.15]">
                Available on every device,<br />
                <span className="text-purple-300">anytime, everywhere.</span>
              </h2>

              <p className="text-white/75 text-base leading-relaxed max-w-lg font-normal">
                LocaLink runs instantly in any modern mobile browser as a zero-install Progressive Web App (PWA) with full offline caching and push notifications.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {[
                  'Zero download required to join circles',
                  'Instant push alerts on iOS & Android',
                  'Sub-20ms low battery background sync',
                  'High precision live GPS updates',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-xs text-white/85">
                    <div className="h-4 w-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <Check size={11} strokeWidth={3} />
                    </div>
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-4">
                <Button size="lg" className="h-12 px-7 font-bold text-sm rounded-xl bg-white text-slate-900 hover:bg-white/90 shadow-xl transition-all" asChild>
                  <Link href="/register">
                    Open Web App
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="h-12 px-6 font-bold text-sm rounded-xl border border-white/30 text-white hover:bg-white/10 transition-all backdrop-blur-sm" asChild>
                  <Link href="/login">
                    Sign In Directly
                  </Link>
                </Button>
              </div>
            </div>

            {/* Right: Quick Launch Card */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 sm:p-8 text-center space-y-4 max-w-xs shadow-xl">
                <div className="h-12 w-12 rounded-2xl bg-white/15 flex items-center justify-center mx-auto text-white shadow-md">
                  <QrCode size={26} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Scan & Open Instant App</h3>
                  <p className="text-xs text-white/70 mt-1">
                    Scan with any smartphone camera to open LocaLink instantly
                  </p>
                </div>
                <div className="p-3 bg-white rounded-2xl inline-block shadow-md">
                  {/* Decorative QR Pattern */}
                  <div className="h-32 w-32 bg-slate-900 rounded-xl flex items-center justify-center text-white text-[11px] font-mono font-bold">
                    [LocaLink PWA]
                  </div>
                </div>
                <div className="text-[10px] text-white/60 font-mono">
                  iOS Safari • Android Chrome • MacOS • Windows
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
