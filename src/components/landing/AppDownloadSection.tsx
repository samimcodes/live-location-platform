'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Smartphone, Download, QrCode, Shield, Zap, Sparkles, Check, Apple } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { soundFx } from '@/lib/soundFx';
import Link from 'next/link';

export function AppDownloadSection() {
  return (
    <section className="py-20 sm:py-28 px-4 sm:px-6 relative overflow-hidden bg-white dark:bg-[#0B1020] border-t border-slate-200/80 dark:border-slate-800/80">
      <div className="max-w-7xl mx-auto">
        <div className="rounded-[36px] bg-gradient-to-br from-slate-950 via-[#101730] to-violet-950 text-white p-8 sm:p-14 relative overflow-hidden shadow-2xl border border-white/10">
          {/* Ambient Glows */}
          <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-violet-600/20 rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[350px] h-[350px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-violet-200 text-xs font-bold backdrop-blur-md">
                <Smartphone size={14} className="text-emerald-400" />
                <span>Zero Installation Friction • Modern Progressive Web App</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.15]">
                Available on every smartphone,<br />
                <span className="bg-gradient-to-r from-violet-300 via-indigo-200 to-cyan-300 bg-clip-text text-transparent">
                  instant real-time sync.
                </span>
              </h2>

              <p className="text-white/75 text-base leading-relaxed max-w-lg font-normal">
                LocaLink runs directly in any modern mobile browser with push notifications, offline caching, and sub-second background GPS telemetry.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {[
                  'Zero download required to join circles',
                  'Instant push alerts on iOS & Android',
                  'Sub-20ms low battery background sync',
                  'High precision ±1.5m live GPS coordinates',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-xs text-white/90">
                    <div className="h-4 w-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <Check size={11} strokeWidth={3} />
                    </div>
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-3.5 pt-4">
                <Button
                  size="lg"
                  className="h-12 px-7 font-bold text-sm rounded-xl bg-white text-slate-950 hover:bg-white/90 shadow-xl transition-all hover:-translate-y-0.5 cursor-pointer"
                  onClick={() => soundFx.playPop()}
                  asChild
                >
                  <Link href="/register">Open Instant Web App</Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="h-12 px-6 font-bold text-sm rounded-xl border border-white/30 text-white hover:bg-white/10 transition-all backdrop-blur-sm cursor-pointer"
                  onClick={() => soundFx.playPop()}
                  asChild
                >
                  <Link href="/login">Sign In to Dashboard</Link>
                </Button>
              </div>
            </div>

            {/* Right: Modern QR Code Scan Device Card */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-[30px] p-6 sm:p-8 text-center space-y-4 max-w-xs shadow-2xl">
                <div className="h-12 w-12 rounded-2xl bg-white/15 flex items-center justify-center mx-auto text-white shadow-md">
                  <QrCode size={26} />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Scan & Open Instant App</h3>
                  <p className="text-xs text-white/70 mt-1">
                    Scan with any smartphone camera to open LocaLink immediately
                  </p>
                </div>

                {/* Stylized QR Code SVG graphic with Laser Scanner Beam */}
                <div className="p-4 bg-white rounded-2xl inline-block shadow-lg relative overflow-hidden group">
                  {/* Glowing Laser Scan Line */}
                  <motion.div
                    animate={{ y: [0, 130, 0] }}
                    transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-cyan-500 to-transparent shadow-[0_0_12px_#06B6D4] z-20 pointer-events-none"
                  >
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-3 bg-cyan-400/20 blur-xs -translate-y-1/2" />
                  </motion.div>

                  <svg
                    width="140"
                    height="140"
                    viewBox="0 0 140 140"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="mx-auto relative z-10"
                  >
                    {/* Corner 1 */}
                    <rect x="10" y="10" width="36" height="36" rx="6" stroke="#0F172A" strokeWidth="6" />
                    <rect x="22" y="22" width="12" height="12" rx="3" fill="#6D28D9" />

                    {/* Corner 2 */}
                    <rect x="94" y="10" width="36" height="36" rx="6" stroke="#0F172A" strokeWidth="6" />
                    <rect x="106" y="22" width="12" height="12" rx="3" fill="#6D28D9" />

                    {/* Corner 3 */}
                    <rect x="10" y="94" width="36" height="36" rx="6" stroke="#0F172A" strokeWidth="6" />
                    <rect x="22" y="106" width="12" height="12" rx="3" fill="#6D28D9" />

                    {/* Dot matrix bits */}
                    <rect x="56" y="14" width="8" height="8" rx="2" fill="#0F172A" />
                    <rect x="74" y="14" width="8" height="8" rx="2" fill="#0F172A" />
                    <rect x="56" y="32" width="8" height="8" rx="2" fill="#0F172A" />
                    <rect x="74" y="32" width="8" height="8" rx="2" fill="#0F172A" />

                    {/* Center Icon Badge */}
                    <rect x="50" y="50" width="40" height="40" rx="10" fill="#6D28D9" />
                    <circle cx="70" cy="70" r="8" fill="white" />
                    <circle cx="70" cy="70" r="4" fill="#6D28D9" />

                    {/* Lower dots */}
                    <rect x="56" y="100" width="8" height="8" rx="2" fill="#0F172A" />
                    <rect x="74" y="100" width="8" height="8" rx="2" fill="#0F172A" />
                    <rect x="56" y="118" width="8" height="8" rx="2" fill="#0F172A" />
                    <rect x="74" y="118" width="8" height="8" rx="2" fill="#0F172A" />
                    <rect x="100" y="60" width="8" height="8" rx="2" fill="#0F172A" />
                    <rect x="118" y="74" width="8" height="8" rx="2" fill="#0F172A" />
                    <rect x="100" y="100" width="16" height="16" rx="4" fill="#0F172A" />
                  </svg>
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
