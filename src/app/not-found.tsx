'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { Compass, Home, Map, Radio, ArrowRight, ShieldCheck, Navigation, Sparkles, Satellite } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { soundFx } from '@/lib/soundFx';

export default function NotFound() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Mouse position values for smooth 3D tilt
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Spring physics for buttery smooth 3D rotation
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [20, -20]), {
    stiffness: 160,
    damping: 18,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-24, 24]), {
    stiffness: 160,
    damping: 18,
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const xPct = (e.clientX - rect.left) / width - 0.5;
    const yPct = (e.clientY - rect.top) / height - 0.5;
    mouseX.set(xPct);
    mouseY.set(yPct);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-b from-[#0B0F19] via-[#111827] to-[#0A0D16] text-white px-4 sm:px-6 relative overflow-hidden selection:bg-purple-500 selection:text-white [perspective:1200px]">
      
      {/* ── 3D AMBIENT SPACE LIGHTING & PARTICLES ── */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden -z-10">
        <motion.div
          animate={{
            scale: [1, 1.25, 1],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-purple-600 rounded-full blur-[170px]"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.1, 0.22, 0.1],
          }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-1/4 right-1/3 w-[500px] h-[500px] bg-indigo-600 rounded-full blur-[180px]"
        />

        {/* Floating 3D Cyber Particles */}
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{
              x: Math.random() * 1200 - 600,
              y: Math.random() * 800 - 400,
              opacity: Math.random() * 0.5 + 0.2,
              scale: Math.random() * 0.8 + 0.5,
            }}
            animate={{
              y: [0, -120, 0],
              opacity: [0.2, 0.7, 0.2],
            }}
            transition={{
              duration: Math.random() * 4 + 4,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.18,
            }}
            className="absolute top-1/2 left-1/2 h-1.5 w-1.5 rounded-full bg-purple-400 shadow-[0_0_8px_#A855F7]"
          />
        ))}
        
        {/* 3D Perspective Grid Background */}
        <div 
          className="absolute inset-0 opacity-[0.14] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:40px_40px]"
          style={{
            transform: 'rotateX(60deg) translateY(-80px) scale(2)',
            transformOrigin: 'top center',
          }}
        />
      </div>

      <div className="max-w-xl w-full text-center relative z-10 py-12 flex flex-col items-center">
        
        {/* ── 3D INTERACTIVE TILT OBJECT STAGE ── */}
        <div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={handleMouseLeave}
          className="relative cursor-pointer py-6 select-none"
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
            {/* 3D Ground Shadow Ring */}
            <div
              className="absolute -bottom-12 w-48 h-12 bg-purple-500/30 rounded-full blur-xl pointer-events-none"
              style={{ transform: 'translateZ(-60px) rotateX(90deg)' }}
            />

            {/* Orbiting Satellite Hologram Ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
              className="absolute w-56 h-56 rounded-full border border-purple-500/30 border-dashed pointer-events-none flex items-center justify-center"
              style={{ transform: 'translateZ(15px)' }}
            >
              <span className="h-3 w-3 rounded-full bg-purple-400 shadow-[0_0_12px_#A855F7] absolute -top-1.5" />
            </motion.div>

            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="absolute w-72 h-72 rounded-full border border-indigo-500/20 pointer-events-none flex items-center justify-center"
              style={{ transform: 'translateZ(-10px)' }}
            >
              <span className="h-2.5 w-2.5 rounded-full bg-cyan-400 shadow-[0_0_10px_#22D3EE] absolute -bottom-1" />
            </motion.div>

            {/* Pulsing Radar Rings */}
            <motion.span
              animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeOut' }}
              className="absolute -inset-6 rounded-full bg-purple-500/30 pointer-events-none"
            />
            <motion.span
              animate={{ scale: [1, 2.2, 1], opacity: [0.4, 0, 0.4] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeOut', delay: 0.4 }}
              className="absolute -inset-10 rounded-full bg-indigo-500/20 pointer-events-none"
            />

            {/* 3D Multi-Layer Glass Compass Cube */}
            <motion.div
              animate={{
                y: [-6, 6, -6],
              }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
              className="relative h-36 w-36 sm:h-44 sm:w-44 rounded-3xl bg-gradient-to-br from-purple-600/80 via-indigo-600/70 to-purple-900/90 backdrop-blur-2xl border-2 border-white/30 shadow-[0_25px_60px_rgba(124,58,237,0.4)] flex items-center justify-center transition-shadow duration-300"
              style={{
                transform: 'translateZ(40px)',
                boxShadow: isHovered
                  ? '0 35px 80px rgba(124, 58, 237, 0.6), inset 0 2px 10px rgba(255,255,255,0.4)'
                  : '0 25px 60px rgba(124, 58, 237, 0.4), inset 0 2px 6px rgba(255,255,255,0.2)',
              }}
            >
              {/* Inner 3D Dial */}
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                style={{ transform: 'translateZ(60px)' }}
                className="relative flex items-center justify-center"
              >
                <Compass size={76} className="text-white drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]" />
              </motion.div>

              {/* Holographic Radar Scanner Needle */}
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 rounded-3xl pointer-events-none overflow-hidden"
              >
                <div className="w-1/2 h-full bg-gradient-to-r from-transparent to-white/20 origin-right" />
              </motion.div>

              {/* Floating 3D Corner Screws */}
              <span className="absolute top-2.5 left-2.5 h-1.5 w-1.5 rounded-full bg-white/60 shadow-xs" style={{ transform: 'translateZ(20px)' }} />
              <span className="absolute top-2.5 right-2.5 h-1.5 w-1.5 rounded-full bg-white/60 shadow-xs" style={{ transform: 'translateZ(20px)' }} />
              <span className="absolute bottom-2.5 left-2.5 h-1.5 w-1.5 rounded-full bg-white/60 shadow-xs" style={{ transform: 'translateZ(20px)' }} />
              <span className="absolute bottom-2.5 right-2.5 h-1.5 w-1.5 rounded-full bg-white/60 shadow-xs" style={{ transform: 'translateZ(20px)' }} />
            </motion.div>

            {/* Floating 3D Satellite Badge */}
            <motion.div
              animate={{ y: [-4, 4, -4] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-4 -right-6 px-3 py-1 rounded-xl bg-purple-500 text-white text-[11px] font-mono font-bold shadow-lg border border-white/30 backdrop-blur-md flex items-center gap-1.5"
              style={{ transform: 'translateZ(90px)' }}
            >
              <span className="h-2 w-2 rounded-full bg-white animate-ping" />
              <span>🛰️ 404 OFF-GRID</span>
            </motion.div>

            {/* Floating 3D Lat/Long Badge */}
            <motion.div
              animate={{ y: [4, -4, 4] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -bottom-4 -left-6 px-3 py-1 rounded-xl bg-slate-900/90 text-emerald-400 text-[11px] font-mono font-bold shadow-lg border border-emerald-500/40 backdrop-blur-md"
              style={{ transform: 'translateZ(80px)' }}
            >
              ±0.0000° N, ±0.0000° E
            </motion.div>
          </motion.div>
        </div>

        {/* ── ERROR HEADLINE & TELEMETRY ── */}
        <div className="space-y-4 pt-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-purple-300 text-xs font-bold backdrop-blur-md shadow-2xs">
            <Radio size={13} className="animate-pulse text-red-400" />
            <span>GPS SATELLITE DISCONNECTED • 404 NOT FOUND</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
            Lost in Coordinates?
          </h1>

          <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-md mx-auto font-normal">
            The latitude and longitude you are navigating to are outside the tracked safe zone perimeter.
          </p>
        </div>

        {/* ── 3D ACTION BUTTONS ── */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-8 w-full max-w-md">
          <Button
            size="lg"
            className="w-full sm:w-auto h-12 px-7 font-bold text-sm rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white shadow-xl shadow-purple-500/30 hover:shadow-2xl transition-all hover:-translate-y-0.5 active:translate-y-0 group gap-2 cursor-pointer"
            onClick={() => soundFx.playPop()}
            asChild
          >
            <Link href="/">
              <Home size={16} />
              Return to Safe Zone
              <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="w-full sm:w-auto h-12 px-6 font-bold text-sm rounded-xl bg-white/10 hover:bg-white/15 border-white/20 text-white shadow-md backdrop-blur-md transition-all hover:-translate-y-0.5 active:translate-y-0 gap-2 cursor-pointer"
            onClick={() => soundFx.playPop()}
            asChild
          >
            <Link href="/dashboard/map">
              <Map size={16} className="text-purple-400" />
              Open Live Map
            </Link>
          </Button>
        </div>

        {/* Diagnostic Telemetry Note */}
        <div className="pt-10 flex items-center justify-center gap-3 text-xs text-slate-500 font-mono">
          <span>Target: Unknown Perimeter</span>
          <span>•</span>
          <span className="text-emerald-400">Core Network: Online</span>
        </div>

      </div>
    </div>
  );
}
