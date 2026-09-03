'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, useMotionValue, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import { AlertTriangle, RefreshCw, Home, Radio, Activity, ShieldAlert, WifiOff, Navigation, Sparkles, Map, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { soundFx } from '@/lib/soundFx';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [reconnectStep, setReconnectStep] = useState<'idle' | 'searching' | 'synced'>('idle');

  // Mouse position values for smooth 3D tilt
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [16, -16]), {
    stiffness: 160,
    damping: 20,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-20, 20]), {
    stiffness: 160,
    damping: 20,
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width - 0.5;
    const yPct = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(xPct);
    mouseY.set(yPct);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  useEffect(() => {
    console.error('LocaLink Runtime Crash:', error);
  }, [error]);

  const handleRetry = () => {
    setIsRetrying(true);
    setReconnectStep('searching');
    soundFx.playAlert();

    setTimeout(() => {
      setReconnectStep('synced');
      soundFx.playChime();
      setTimeout(() => {
        reset();
        setIsRetrying(false);
        setReconnectStep('idle');
      }, 500);
    }, 1200);
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-b from-[#F6F8FD] via-[#F4F6FC] to-[#EEF2FB] dark:from-background dark:via-background dark:to-card/30 text-slate-900 dark:text-foreground px-4 sm:px-6 relative overflow-hidden selection:bg-purple-500 selection:text-white [perspective:1200px]">
      
      {/* ── AMBIENT AURORA GLOWS & GRID MESH ── */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden -z-10">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.35, 0.2],
          }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-purple-400/30 dark:bg-purple-900/25 rounded-full blur-[160px]"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.15, 0.3, 0.15],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-1/4 right-1/3 w-[500px] h-[500px] bg-indigo-400/25 dark:bg-indigo-900/20 rounded-full blur-[170px]"
        />

        {/* Floating Micro Particles */}
        {Array.from({ length: 16 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{
              x: (i * 75) - 600,
              y: (i * 45) - 300,
              opacity: 0.3,
            }}
            animate={{
              y: [0, -80, 0],
              opacity: [0.2, 0.6, 0.2],
            }}
            transition={{
              duration: 5 + (i % 4),
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.25,
            }}
            className="absolute top-1/2 left-1/2 h-1.5 w-1.5 rounded-full bg-purple-400/50 dark:bg-purple-400/70 shadow-xs"
          />
        ))}

        {/* Clean Mesh Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800c_1px,transparent_1px),linear-gradient(to_bottom,#8080800c_1px,transparent_1px)] bg-[size:36px_36px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
      </div>

      <div className="max-w-xl w-full text-center relative z-10 py-10 flex flex-col items-center">
        
        {/* ── TOP BRAND BAR ── */}
        <Link href="/" className="inline-flex items-center gap-2.5 group mb-6">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#5B21B6] flex items-center justify-center text-white shadow-md shadow-purple-500/25 group-hover:scale-105 transition-transform">
            <Navigation size={17} className="-rotate-45 text-white" />
          </div>
          <span className="text-lg font-black tracking-tight text-slate-900 dark:text-foreground">
            LocaLink
          </span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-100 text-[#7C3AED] dark:bg-purple-950/60 dark:text-purple-300">
            System Telemetry
          </span>
        </Link>

        {/* ── 3D INTERACTIVE TILT BEACON STAGE ── */}
        <div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={handleMouseLeave}
          className="relative cursor-pointer py-4 select-none"
          style={{ transformStyle: 'preserve-3d' }}
        >
          <motion.div
            style={{
              rotateX,
              rotateY,
              transformStyle: 'preserve-3d',
            }}
            className="relative flex items-center justify-center"
          >
            {/* 3D Ground Shadow */}
            <div
              className="absolute -bottom-10 w-48 h-12 bg-purple-500/20 dark:bg-purple-500/30 rounded-full blur-xl pointer-events-none"
              style={{ transform: 'translateZ(-50px) rotateX(90deg)' }}
            />

            {/* Orbiting Satellite Hologram Rings */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
              className="absolute w-56 h-56 rounded-full border border-purple-300/40 dark:border-purple-700/40 border-dashed pointer-events-none flex items-center justify-center"
              style={{ transform: 'translateZ(15px)' }}
            >
              <span className="h-3 w-3 rounded-full bg-[#7C3AED] shadow-md absolute -top-1.5" />
            </motion.div>

            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
              className="absolute w-72 h-72 rounded-full border border-indigo-200/40 dark:border-indigo-800/30 pointer-events-none flex items-center justify-center"
              style={{ transform: 'translateZ(-10px)' }}
            >
              <span className="h-2.5 w-2.5 rounded-full bg-indigo-500 shadow-md absolute -bottom-1" />
            </motion.div>

            {/* Pulsing Alert Waves */}
            <motion.span
              animate={{ scale: [1, 1.8, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: 'easeOut' }}
              className="absolute -inset-6 rounded-full bg-purple-500/20 dark:bg-purple-500/30 pointer-events-none"
            />

            {/* 3D Glass Warning Cube */}
            <motion.div
              animate={{
                y: [-5, 5, -5],
              }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
              className="relative h-32 w-32 sm:h-36 sm:w-36 rounded-3xl bg-gradient-to-br from-[#7C3AED] via-[#6366F1] to-[#4338CA] text-white shadow-[0_20px_60px_rgba(124,58,237,0.35)] flex items-center justify-center border-2 border-white/40"
              style={{
                transform: 'translateZ(45px)',
                boxShadow: isHovered
                  ? '0 30px 70px rgba(124, 58, 237, 0.5), inset 0 2px 10px rgba(255,255,255,0.4)'
                  : '0 20px 60px rgba(124, 58, 237, 0.35), inset 0 2px 6px rgba(255,255,255,0.25)',
              }}
            >
              {/* Subtle holographic sheen */}
              <motion.div
                animate={{ x: [-50, 50, -50] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none rounded-3xl"
              />

              <motion.div
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                style={{ transform: 'translateZ(55px)' }}
              >
                <AlertTriangle size={62} className="text-white drop-shadow-[0_8px_16px_rgba(0,0,0,0.3)]" />
              </motion.div>
            </motion.div>

            {/* 3D Floating Hologram Badge Left */}
            <motion.div
              animate={{ y: [-3, 3, -3] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -bottom-3 -left-6 px-3 py-1 rounded-xl bg-white/95 dark:bg-card/95 text-slate-700 dark:text-slate-200 text-[11px] font-mono font-bold shadow-md border border-slate-200/80 dark:border-border flex items-center gap-1.5 backdrop-blur-md"
              style={{ transform: 'translateZ(80px)' }}
            >
              <WifiOff size={12} className="text-purple-600 animate-pulse" />
              <span>STREAM PAUSED</span>
            </motion.div>

            {/* 3D Floating Alert Chip Right */}
            <motion.div
              animate={{ y: [3, -3, 3] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-3 -right-6 px-3 py-1 rounded-xl bg-[#7C3AED] text-white text-[11px] font-mono font-bold shadow-md border border-white/30 backdrop-blur-md flex items-center gap-1.5"
              style={{ transform: 'translateZ(90px)' }}
            >
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              <span>AUTO RECONNECT</span>
            </motion.div>
          </motion.div>
        </div>

        {/* ── ANIMATED TELEMETRY HEARTBEAT MONITOR ── */}
        <div className="w-full max-w-xs my-3 py-2 px-4 rounded-2xl bg-white/90 dark:bg-card/90 border border-slate-200/80 dark:border-border shadow-xs backdrop-blur-md flex items-center justify-between text-xs font-mono text-slate-700 dark:text-slate-300">
          <div className="flex items-center gap-2">
            <Activity size={14} className="animate-pulse text-[#7C3AED]" />
            <span className="text-[11px] font-semibold">
              {reconnectStep === 'searching' ? 'Re-establishing socket stream...' : reconnectStep === 'synced' ? 'GPS Signal Restored!' : 'GPS Stream: Standby Mode'}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-[#7C3AED] animate-ping" />
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          </div>
        </div>

        {/* ── HEADLINE & USER-FRIENDLY COPY ── */}
        <div className="space-y-3 pt-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EDE9FE] border border-purple-200/70 text-[#7C3AED] dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800/60 text-xs font-bold shadow-2xs">
            <Radio size={13} className="animate-pulse text-[#7C3AED]" />
            <span>GPS STREAM DISRUPTED • 100% RECOVERABLE</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-foreground leading-tight">
            Signal Disrupted
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-muted-foreground leading-relaxed max-w-md mx-auto font-normal">
            A temporary connection hiccup paused your location stream. Your private circles and safe zone configurations are safe and intact.
          </p>
        </div>

        {/* ── ACTION BUTTONS ── */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-7 w-full max-w-md">
          <Button
            onClick={handleRetry}
            disabled={isRetrying}
            size="lg"
            className="w-full sm:w-auto h-12 px-8 font-bold text-sm rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white shadow-lg shadow-purple-500/25 hover:shadow-xl transition-all hover:-translate-y-0.5 active:translate-y-0 group gap-2 cursor-pointer disabled:opacity-75"
          >
            <RefreshCw size={16} className={isRetrying ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'} />
            {isRetrying ? 'Reconnecting Socket...' : 'Reconnect & Retry'}
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="w-full sm:w-auto h-12 px-6 font-bold text-sm rounded-xl bg-white/90 dark:bg-card/90 hover:bg-white dark:hover:bg-muted border-slate-200/90 dark:border-border text-slate-800 dark:text-foreground shadow-xs transition-all hover:-translate-y-0.5 active:translate-y-0 gap-2 cursor-pointer"
            onClick={() => soundFx.playPop()}
            asChild
          >
            <Link href="/">
              <Home size={16} className="text-[#7C3AED]" />
              Return Home
            </Link>
          </Button>
        </div>

        {error?.digest && (
          <div className="pt-6 text-[11px] font-mono text-slate-500 dark:text-slate-400 bg-slate-100/80 dark:bg-muted/40 px-3 py-1.5 rounded-lg border border-slate-200/60 dark:border-border mt-4">
            Diagnostic Digest: {error.digest}
          </div>
        )}

      </div>
    </div>
  );
}
