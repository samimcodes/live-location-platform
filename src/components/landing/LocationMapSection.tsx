'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ArrowRight, Bell, Radio, Route, ShieldCheck } from 'lucide-react';
import { soundFx } from '@/lib/soundFx';
import { useAuth } from '@/hooks/useAuth';

const highlights = [
  {
    icon: Bell,
    title: 'Instant Safe Zone Alerts',
    description: 'Automatic arrival and departure notifications for Home, School, or Work.',
    accent: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  },
  {
    icon: Route,
    title: 'Live Routing & Precision ETAs',
    description: 'Sub-15s GPS updates with live travel speeds and clear arrival predictions.',
    accent: 'text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  },
  {
    icon: ShieldCheck,
    title: 'One-Tap Ghost Shield',
    description: 'AES-256 encrypted sharing you can pause or blur anytime without friction.',
    accent: 'text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
  },
];

const FEATHER_MASK_STYLE: React.CSSProperties = {
  maskImage:
    'radial-gradient(ellipse 72% 72% at 50% 50%, #000 54%, rgba(0,0,0,0.45) 75%, transparent 96%)',
  WebkitMaskImage:
    'radial-gradient(ellipse 72% 72% at 50% 50%, #000 54%, rgba(0,0,0,0.45) 75%, transparent 96%)',
};

export function LocationMapSection() {
  const { isAuthenticated } = useAuth();
  const objectRef = useRef<HTMLDivElement>(null);

  // Smooth spring-damped 3D pointer tilt
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const smoothX = useSpring(mouseX, { stiffness: 180, damping: 22 });
  const smoothY = useSpring(mouseY, { stiffness: 180, damping: 22 });

  const rotateY = useTransform(smoothX, [-0.5, 0.5], [-10, 10]);
  const rotateX = useTransform(smoothY, [-0.5, 0.5], [10, -10]);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!objectRef.current) return;
    const rect = objectRef.current.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(nx);
    mouseY.set(ny);
  };

  const handlePointerLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <section
      id="map-preview"
      className="py-16 sm:py-24 lg:py-28 px-4 sm:px-6 relative overflow-hidden bg-white dark:bg-[#080D1A] border-y border-slate-200/80 dark:border-white/[0.06] scroll-mt-20"
    >
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          {/* ─── Left Column: Clean Editorial Typography & 3 Minimal Highlights ─── */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
            className="lg:col-span-5 space-y-7 text-left"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50/90 dark:bg-indigo-500/10 border border-indigo-200/80 dark:border-indigo-400/20 text-indigo-700 dark:text-indigo-300 text-xs font-semibold">
              <Radio size={13} className="text-indigo-600 dark:text-indigo-400 animate-pulse" />
              <span>Designed for Everyday Peace</span>
            </div>

            <div className="space-y-4">
              <h2 className="text-3xl sm:text-4xl md:text-[42px] font-black text-slate-950 dark:text-white tracking-[-0.025em] leading-[1.1]">
                Real-time presence,{' '}
                <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 dark:from-indigo-400 dark:via-violet-300 dark:to-cyan-300 bg-clip-text text-transparent">
                  quietly in your pocket
                </span>
              </h2>

              <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed font-normal">
                LocaLink works silently in the background—alerting you the moment loved ones arrive safely, while keeping privacy completely under their control.
              </p>
            </div>

            <div className="space-y-4 pt-1">
              {highlights.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="flex items-start gap-3.5">
                    <div
                      className={`h-10 w-10 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 ${item.accent}`}
                    >
                      <Icon size={18} />
                    </div>
                    <div className="space-y-0.5">
                      <h3 className="text-sm font-bold text-slate-950 dark:text-white tracking-tight">
                        {item.title}
                      </h3>
                      <p className="text-xs sm:text-[13px] text-slate-600 dark:text-slate-400 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                href={isAuthenticated ? '/dashboard/map' : '/register'}
                onClick={() => soundFx?.playPop?.()}
                className="h-11 px-7 w-full sm:w-auto justify-center rounded-full bg-gradient-to-b from-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-semibold shadow-[0_8px_24px_rgba(99,102,241,0.3),inset_0_1px_0_rgba(255,255,255,0.22)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 inline-flex items-center gap-2 group"
              >
                <span>{isAuthenticated ? 'Open Live Map' : 'Get Started Free'}</span>
                <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <a
                href="#features"
                onClick={() => soundFx?.playPop?.()}
                className="h-11 px-5 w-full sm:w-auto justify-center rounded-full border border-slate-200 dark:border-white/[0.12] bg-white dark:bg-white/[0.03] hover:bg-slate-50 dark:hover:bg-white/[0.07] text-slate-700 dark:text-slate-200 text-sm font-semibold transition-colors inline-flex items-center"
              >
                Explore Features
              </a>
            </div>
          </motion.div>

          {/* ─── Right Column: Pure Box-Free Floating & Draggable 3D Product Render ─── */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, delay: 0.08, ease: 'easeOut' }}
            className="lg:col-span-7 relative flex items-center justify-center"
            style={{ perspective: 1200 }}
          >
            {/* Continuous floating animation */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
              className="w-full"
            >
              {/* Pure borderless, boxless draggable 3D object */}
              <motion.div
                ref={objectRef}
                drag
                dragSnapToOrigin
                dragElastic={0.22}
                dragTransition={{ bounceStiffness: 260, bounceDamping: 18 }}
                whileDrag={{ scale: 1.03 }}
                onPointerMove={handlePointerMove}
                onPointerLeave={handlePointerLeave}
                style={{
                  rotateX,
                  rotateY,
                  transformStyle: 'preserve-3d',
                  ...FEATHER_MASK_STYLE,
                }}
                className="relative w-full cursor-grab active:cursor-grabbing select-none touch-pan-y"
              >
                {/* Light mode seamless studio render */}
                <Image
                  src="/images/localink-3d-showcase.jpg"
                  alt="LocaLink 3D mobile experience showcasing live GPS route, Safe Zone perimeter, and privacy shield"
                  width={1200}
                  height={896}
                  draggable={false}
                  className="w-full h-auto block dark:hidden object-contain pointer-events-none"
                />

                {/* Dark mode seamless obsidian render */}
                <Image
                  src="/images/localink-3d-showcase-dark.jpg"
                  alt="LocaLink 3D mobile experience showcasing live GPS route, Safe Zone perimeter, and privacy shield"
                  width={1376}
                  height={768}
                  draggable={false}
                  className="w-full h-auto hidden dark:block object-contain pointer-events-none"
                />
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
