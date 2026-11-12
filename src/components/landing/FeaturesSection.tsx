'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  MapPin,
  Building2,
  CheckCircle2,
  BatteryCharging,
  BatteryLow,
  EyeOff,
  Eye,
  Copy,
  Check,
  Mic,
  Play,
  Pause,
  Route,
  QrCode,
  Car,
  Footprints,
  Download,
  Clock,
  Sparkles,
  Zap,
} from 'lucide-react';
import { soundFx } from '@/lib/soundFx';
import { cn } from '@/lib/utils';

const SAMPLE_GPX_XML = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="LocaLink 2.0" xmlns="http://www.topografix.com/GPX/1/1">
  <trk>
    <name>Gulshan to Banani Commute</name>
    <trkseg>
      <trkpt lat="23.7945" lon="90.4146"><ele>14</ele></trkpt>
      <trkpt lat="23.7885" lon="90.4158"><ele>14</ele></trkpt>
      <trkpt lat="23.7805" lon="90.4167"><ele>15</ele></trkpt>
      <trkpt lat="23.7712" lon="90.4072"><ele>13</ele></trkpt>
    </trkseg>
  </trk>
</gpx>`;

const WAVEFORM_BARS = [38, 68, 92, 58, 100, 78, 48, 88, 62, 84, 44, 90, 72, 42];

export function FeaturesSection() {
  const [ghostTimer, setGhostTimer] = useState<'off' | '1h' | '8h'>('off');
  const [copiedCode, setCopiedCode] = useState(false);
  const [lastPing, setLastPing] = useState<string | null>(null);
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [travelMode, setTravelMode] = useState<'driving' | 'walking'>('driving');
  const [ecoPreview, setEcoPreview] = useState(false);
  const [downloadedGpx, setDownloadedGpx] = useState(false);

  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const scheduleTimer = (fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms);
    timersRef.current.push(id);
  };

  useEffect(() => {
    const activeTimers = timersRef.current;
    return () => {
      activeTimers.forEach(clearTimeout);
    };
  }, []);

  const handleCopyCode = async () => {
    soundFx?.playChime?.();
    try {
      await navigator.clipboard.writeText('https://localink.app/invite?id=284');
    } catch {
      // Fallback gracefully when clipboard permission is unavailable
    }
    setCopiedCode(true);
    scheduleTimer(() => setCopiedCode(false), 2500);
  };

  const handlePlayVoice = () => {
    if (isPlayingVoice) {
      setIsPlayingVoice(false);
    } else {
      soundFx?.playChime?.();
      setIsPlayingVoice(true);
      scheduleTimer(() => setIsPlayingVoice(false), 3800);
    }
  };

  const handleSendPing = (label: string) => {
    soundFx?.playPing?.();
    setLastPing(label);
    scheduleTimer(() => setLastPing((cur) => (cur === label ? null : cur)), 2400);
  };

  const handleDownloadGpx = () => {
    soundFx?.playChime?.();
    try {
      const blob = new Blob([SAMPLE_GPX_XML], { type: 'application/gpx+xml' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'localink-sample-route.gpx';
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch {
      // Ignore if browser blocks programmatic download
    }
    setDownloadedGpx(true);
    scheduleTimer(() => setDownloadedGpx(false), 2500);
  };

  const batteryLevel = ecoPreview ? 18 : 86;
  const isCharging = !ecoPreview;

  const ghostDescription =
    ghostTimer === 'off'
      ? 'Live GPS sharing active for circle members'
      : ghostTimer === '1h'
        ? 'Location paused for 1h • Auto-resumes safely'
        : 'Marker frozen overnight for 8h • Zero alerts sent';

  return (
    <section
      id="features"
      className="py-16 sm:py-24 lg:py-28 px-4 sm:px-6 relative overflow-hidden bg-[#F6F8FD] dark:bg-[#070B16] scroll-mt-16"
    >
      {/* Subtle ambient glow */}
      <div className="absolute -top-36 left-1/2 -translate-x-1/2 w-[min(760px,95vw)] h-[360px] bg-indigo-400/12 dark:bg-indigo-600/12 rounded-full blur-[130px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          className="text-center mb-12 sm:mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50/90 dark:bg-indigo-500/10 border border-indigo-200/80 dark:border-indigo-400/20 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-4">
            <Sparkles size={13} className="text-indigo-600 dark:text-indigo-400" />
            <span>LocaLink 2.0 Feature Suite</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 dark:text-white mb-4 tracking-[-0.025em] leading-[1.1]">
            Intelligent tools built for{' '}
            <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 dark:from-indigo-400 dark:via-violet-300 dark:to-cyan-300 bg-clip-text text-transparent">
              complete peace of mind
            </span>
          </h2>

          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto leading-relaxed font-normal">
            Voice notes, OSRM turn-by-turn routing, adaptive battery telemetry, and timed Ghost Mode—every interaction crafted to work effortlessly across devices.
          </p>
        </motion.div>

        {/* ── BENTO GRID ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5 lg:gap-6">
          {/* ── Card 1 (Span 8): Real-Time Voice Notes & Quick Pings ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="md:col-span-2 lg:col-span-8 group relative bg-white dark:bg-[#0D1426] rounded-3xl border border-slate-200/85 dark:border-white/[0.08] shadow-[0_4px_24px_rgba(15,23,42,0.04)] hover:shadow-[0_18px_45px_rgba(99,102,241,0.1)] hover:border-indigo-400/50 dark:hover:border-indigo-500/40 transition-all duration-300 p-5 sm:p-7 flex flex-col justify-between overflow-hidden"
          >
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300 border border-indigo-200/70 dark:border-indigo-400/20">
                  <Mic size={12} />
                  <span>Voice Notes &amp; Quick Pings</span>
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Interactive Preview
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white tracking-tight mb-2 text-left">
                Walkie-Talkie Voice Notes on the Map
              </h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed max-w-xl text-left mb-5">
                Leave crisp audio messages pinned to your circle with real-time waveforms, or tap a quick status reaction while commuting.
              </p>
            </div>

            {/* Interactive Voice Player & Quick Ping Card */}
            <div className="p-4 rounded-2xl bg-slate-50/90 dark:bg-[#121B33] border border-slate-200/80 dark:border-white/[0.08] space-y-3.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={handlePlayVoice}
                    className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-gradient-to-b from-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white flex items-center justify-center shadow-md shadow-indigo-500/25 transition-transform active:scale-95 cursor-pointer shrink-0"
                    title={isPlayingVoice ? 'Pause Voice Note' : 'Play Voice Note'}
                    aria-label={isPlayingVoice ? 'Pause Voice Note' : 'Play Voice Note'}
                  >
                    {isPlayingVoice ? <Pause size={17} /> : <Play size={17} className="ml-0.5" />}
                  </button>
                  <div className="text-left min-w-0 flex-1">
                    <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span className="truncate">Robert (Dad)</span>
                      <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-300 bg-indigo-100/90 dark:bg-indigo-500/20 px-1.5 py-0.5 rounded shrink-0">
                        0:04s
                      </span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 italic mt-0.5 truncate">
                      &quot;Traffic is moving fast on Expressway, see you in 10 mins!&quot;
                    </p>
                  </div>
                </div>

                {/* Animated Waveform Bars */}
                <div
                  className="flex items-center justify-between sm:justify-end gap-1 h-6 w-full sm:w-auto px-1 sm:px-0 shrink-0"
                  aria-hidden="true"
                >
                  {WAVEFORM_BARS.map((heightPct, i) => (
                    <motion.span
                      key={i}
                      animate={
                        isPlayingVoice
                          ? { scaleY: [0.35, 1, 0.45] }
                          : { scaleY: 1 }
                      }
                      transition={
                        isPlayingVoice
                          ? {
                              duration: 0.55,
                              repeat: Infinity,
                              repeatType: 'reverse',
                              delay: i * 0.05,
                            }
                          : { duration: 0.2 }
                      }
                      className={cn(
                        'w-1 rounded-full origin-center transition-colors',
                        isPlayingVoice
                          ? 'bg-indigo-600 dark:bg-indigo-400'
                          : 'bg-slate-300 dark:bg-slate-600'
                      )}
                      style={{ height: `${heightPct}%` }}
                    />
                  ))}
                </div>
              </div>

              {/* Quick Ping Row */}
              <div className="pt-3 border-t border-slate-200/80 dark:border-white/[0.08] flex items-center justify-between text-xs flex-wrap gap-2">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  {lastPing ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                      Ping sent: &quot;{lastPing}&quot;
                    </span>
                  ) : (
                    '1-Tap Quick Reactions:'
                  )}
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleSendPing("I'm Here!")}
                    className="px-2.5 py-1 rounded-lg bg-emerald-100/90 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300 text-xs font-semibold hover:bg-emerald-200/80 dark:hover:bg-emerald-500/25 transition-colors cursor-pointer"
                  >
                    I&apos;m Here
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSendPing('Charging Phone')}
                    className="px-2.5 py-1 rounded-lg bg-indigo-100/90 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300 text-xs font-semibold hover:bg-indigo-200/80 dark:hover:bg-indigo-500/25 transition-colors cursor-pointer"
                  >
                    Charging
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSendPing('In Transit')}
                    className="px-2.5 py-1 rounded-lg bg-amber-100/90 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300 text-xs font-semibold hover:bg-amber-200/80 dark:hover:bg-amber-500/25 transition-colors cursor-pointer"
                  >
                    In Transit
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── Card 2 (Span 4): Instant QR Code Connect ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay: 0.06, ease: 'easeOut' }}
            className="md:col-span-1 lg:col-span-4 group relative bg-white dark:bg-[#0D1426] rounded-3xl border border-slate-200/85 dark:border-white/[0.08] shadow-[0_4px_24px_rgba(15,23,42,0.04)] hover:shadow-[0_18px_45px_rgba(6,182,212,0.1)] hover:border-cyan-400/50 dark:hover:border-cyan-500/40 transition-all duration-300 p-5 sm:p-7 flex flex-col justify-between overflow-hidden"
          >
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-cyan-50 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-300 border border-cyan-200/70 dark:border-cyan-400/20">
                  <QrCode size={12} />
                  <span>1-Tap QR Connect</span>
                </div>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Zero Typing</span>
              </div>

              <h3 className="text-xl font-black text-slate-950 dark:text-white tracking-tight mb-2 text-left">
                Instant QR &amp; Invite Links
              </h3>
              <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-[13px] leading-relaxed text-left mb-5">
                Scan a friend&apos;s personal QR code directly with your camera or copy a private link for immediate circle pairing.
              </p>
            </div>

            {/* QR Code Demo Box */}
            <div className="p-3.5 rounded-2xl bg-cyan-50/70 dark:bg-cyan-950/30 border border-cyan-200/80 dark:border-cyan-800/50 flex items-center justify-between gap-2.5">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-10 w-10 rounded-xl bg-slate-900 p-1 border border-cyan-400/40 shadow-xs flex items-center justify-center shrink-0">
                  <QrCode size={22} className="text-cyan-400" />
                </div>
                <div className="text-left min-w-0">
                  <span className="text-[11px] font-semibold text-cyan-700 dark:text-cyan-300 block">
                    {copiedCode ? 'Copied to Clipboard!' : 'Private Invite Link'}
                  </span>
                  <span className="text-xs font-mono font-semibold text-slate-900 dark:text-white truncate block">
                    localink.app/invite?id=284
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCopyCode}
                className="p-2.5 rounded-xl bg-white dark:bg-[#121B33] border border-cyan-200 dark:border-cyan-800/60 text-cyan-700 dark:text-cyan-300 hover:bg-cyan-100 dark:hover:bg-cyan-900/50 transition-colors cursor-pointer shrink-0"
                title="Copy Invite Link"
                aria-label="Copy Invite Link"
              >
                {copiedCode ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
              </button>
            </div>
          </motion.div>

          {/* ── Card 3 (Span 4): Turn-by-Turn OSRM Friend Routing ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
            className="md:col-span-1 lg:col-span-4 group relative bg-white dark:bg-[#0D1426] rounded-3xl border border-slate-200/85 dark:border-white/[0.08] shadow-[0_4px_24px_rgba(15,23,42,0.04)] hover:shadow-[0_18px_45px_rgba(139,92,246,0.1)] hover:border-violet-400/50 dark:hover:border-violet-500/40 transition-all duration-300 p-5 sm:p-7 flex flex-col justify-between overflow-hidden"
          >
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-violet-50 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300 border border-violet-200/70 dark:border-violet-400/20">
                  <Route size={12} />
                  <span>OSRM Routing</span>
                </div>
                <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-100 dark:bg-[#141E36] border border-slate-200/70 dark:border-white/[0.07] text-[11px] font-semibold">
                  <button
                    type="button"
                    onClick={() => {
                      soundFx?.playPop?.();
                      setTravelMode('driving');
                    }}
                    className={cn(
                      'px-2.5 py-0.5 rounded-md cursor-pointer transition-colors',
                      travelMode === 'driving'
                        ? 'bg-violet-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
                    )}
                  >
                    Drive
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      soundFx?.playPop?.();
                      setTravelMode('walking');
                    }}
                    className={cn(
                      'px-2.5 py-0.5 rounded-md cursor-pointer transition-colors',
                      travelMode === 'walking'
                        ? 'bg-violet-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
                    )}
                  >
                    Walk
                  </button>
                </div>
              </div>

              <h3 className="text-xl font-black text-slate-950 dark:text-white tracking-tight mb-2 text-left">
                Turn-by-Turn Friend Navigation
              </h3>
              <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-[13px] leading-relaxed text-left mb-5">
                Calculate live driving or walking routes straight to any family member with maneuver steps and real-time ETAs.
              </p>
            </div>

            {/* Navigation Maneuver Box */}
            <div className="p-3.5 rounded-2xl bg-violet-50/70 dark:bg-violet-950/30 border border-violet-200/80 dark:border-violet-800/60 text-left flex items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="h-9 w-9 rounded-xl bg-violet-600 text-white flex items-center justify-center font-bold shrink-0">
                  {travelMode === 'driving' ? <Car size={16} /> : <Footprints size={16} />}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    In 250m • Turn Right
                  </div>
                  <div className="text-[11px] text-violet-600 dark:text-violet-300 font-mono truncate">
                    Banani Rd 11 • {travelMode === 'driving' ? 'Fastest Drive' : 'Pedestrian Path'}
                  </div>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 font-mono block tabular-nums">
                  {travelMode === 'driving' ? '8 mins' : '28 mins'}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">3.8 km</span>
              </div>
            </div>
          </motion.div>

          {/* ── Card 4 (Span 4): Smart Battery Telemetry & GPS Saver ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay: 0.14, ease: 'easeOut' }}
            className="md:col-span-1 lg:col-span-4 group relative bg-white dark:bg-[#0D1426] rounded-3xl border border-slate-200/85 dark:border-white/[0.08] shadow-[0_4px_24px_rgba(15,23,42,0.04)] hover:shadow-[0_18px_45px_rgba(16,185,129,0.1)] hover:border-emerald-400/50 dark:hover:border-emerald-500/40 transition-all duration-300 p-5 sm:p-7 flex flex-col justify-between overflow-hidden"
          >
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-400/20">
                  <BatteryCharging size={12} />
                  <span>Adaptive Battery</span>
                </div>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  75% Power Saved
                </span>
              </div>

              <h3 className="text-xl font-black text-slate-950 dark:text-white tracking-tight mb-2 text-left">
                Live Battery &amp; Eco Throttling
              </h3>
              <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-[13px] leading-relaxed text-left mb-5">
                See charging status in real time. Below 20%, GPS polling automatically eases to preserve remaining phone battery.
              </p>
            </div>

            {/* Interactive Battery Telemetry Preview */}
            <button
              type="button"
              onClick={() => {
                soundFx?.playPop?.();
                setEcoPreview((prev) => !prev);
              }}
              className={cn(
                'w-full p-3.5 rounded-2xl border text-left flex items-center justify-between gap-2.5 cursor-pointer transition-colors',
                ecoPreview
                  ? 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-300/70 dark:border-amber-700/60 hover:border-amber-400'
                  : 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200/80 dark:border-emerald-800/60 hover:border-emerald-400'
              )}
              aria-pressed={ecoPreview}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={cn(
                    'h-9 w-9 rounded-xl text-white flex items-center justify-center font-bold shrink-0 transition-colors',
                    ecoPreview ? 'bg-amber-500' : 'bg-emerald-500'
                  )}
                >
                  {ecoPreview ? <BatteryLow size={16} /> : <Zap size={16} />}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 dark:text-white truncate tabular-nums">
                    Robert&apos;s Phone • {batteryLevel}%
                  </div>
                  <div
                    className={cn(
                      'text-[11px] font-mono truncate',
                      ecoPreview
                        ? 'text-amber-700 dark:text-amber-300'
                        : 'text-emerald-700 dark:text-emerald-300'
                    )}
                  >
                    {isCharging ? 'Fast Charging • Full 15s Sync' : 'Low Power • Adaptive Throttle'}
                  </div>
                </div>
              </div>

              <span
                className={cn(
                  'text-[10px] font-semibold px-2.5 py-1 rounded-lg border shrink-0 transition-colors',
                  ecoPreview
                    ? 'bg-white dark:bg-amber-950/80 text-amber-800 dark:text-amber-200 border-amber-300/80 dark:border-amber-700'
                    : 'bg-white dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-300/80 dark:border-emerald-800'
                )}
              >
                {ecoPreview ? 'Reset 86%' : 'Test 18%'}
              </span>
            </button>
          </motion.div>

          {/* ── Card 5 (Span 4): Timed Ghost Mode ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay: 0.18, ease: 'easeOut' }}
            className="md:col-span-1 lg:col-span-4 group relative bg-white dark:bg-[#0D1426] rounded-3xl border border-slate-200/85 dark:border-white/[0.08] shadow-[0_4px_24px_rgba(15,23,42,0.04)] hover:shadow-[0_18px_45px_rgba(99,102,241,0.1)] hover:border-indigo-400/50 dark:hover:border-indigo-500/40 transition-all duration-300 p-5 sm:p-7 flex flex-col justify-between overflow-hidden"
          >
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300 border border-indigo-200/70 dark:border-indigo-400/20">
                  <EyeOff size={12} />
                  <span>Privacy Shield</span>
                </div>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Zero Leakage</span>
              </div>

              <h3 className="text-xl font-black text-slate-950 dark:text-white tracking-tight mb-2 text-left">
                Timed Ghost Mode (1h / 8h)
              </h3>
              <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-[13px] leading-relaxed text-left mb-5">
                Freeze your pin for an hour or overnight without notifying anyone—live updates resume automatically when time is up.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[11px] font-medium text-slate-600 dark:text-slate-300 px-1">
                {ghostTimer === 'off' ? (
                  <Eye size={13} className="text-emerald-500 shrink-0" />
                ) : (
                  <EyeOff size={13} className="text-indigo-500 shrink-0" />
                )}
                <span className="truncate">{ghostDescription}</span>
              </div>

              {/* Single-line Ghost Timer Segmented Control */}
              <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 dark:bg-[#141E36] border border-slate-200/70 dark:border-white/[0.07] rounded-xl text-center text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => {
                    soundFx?.playPop?.();
                    setGhostTimer('1h');
                  }}
                  className={cn(
                    'py-1.5 px-1 rounded-lg transition-colors cursor-pointer whitespace-nowrap',
                    ghostTimer === '1h'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
                  )}
                >
                  1 Hour
                </button>
                <button
                  type="button"
                  onClick={() => {
                    soundFx?.playPop?.();
                    setGhostTimer('8h');
                  }}
                  className={cn(
                    'py-1.5 px-1 rounded-lg transition-colors cursor-pointer whitespace-nowrap',
                    ghostTimer === '8h'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
                  )}
                >
                  8 Hours
                </button>
                <button
                  type="button"
                  onClick={() => {
                    soundFx?.playPop?.();
                    setGhostTimer('off');
                  }}
                  className={cn(
                    'py-1.5 px-1 rounded-lg transition-colors cursor-pointer whitespace-nowrap',
                    ghostTimer === 'off'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
                  )}
                >
                  Live
                </button>
              </div>
            </div>
          </motion.div>

          {/* ── Card 6 (Span 12): Stay Points Detection & GPX Route Export ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay: 0.22, ease: 'easeOut' }}
            className="md:col-span-2 lg:col-span-12 rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-700 to-slate-900 p-6 sm:p-9 lg:p-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 lg:gap-8 border border-white/15 shadow-[0_20px_50px_rgba(79,70,229,0.22)] relative overflow-hidden"
          >
            <div className="absolute inset-0 opacity-[0.07] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px]" />
            <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-white/10 blur-3xl pointer-events-none" />

            <div className="relative z-10 text-left max-w-xl">
              <div className="flex items-center gap-2 mb-2">
                <Clock size={15} className="text-emerald-300" />
                <span className="text-emerald-300 text-xs font-semibold uppercase tracking-wider">
                  History &amp; Analytics Engine
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Intelligent Stay Points &amp; GPX Export
              </h3>
              <p className="text-indigo-100/90 text-sm sm:text-base font-normal mt-2 leading-relaxed">
                Automatically detects stops when circle members pause for 10+ minutes and lets you export full routes in standard GPX 1.1 format.
              </p>

              <div className="flex items-center gap-2 mt-4 flex-wrap">
                <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-white/12 text-white border border-white/15 inline-flex items-center gap-1.5">
                  <MapPin size={11} className="text-cyan-300" />
                  Banani Cafe • 45m stop
                </span>
                <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-white/12 text-white border border-white/15 inline-flex items-center gap-1.5">
                  <Building2 size={11} className="text-indigo-200" />
                  Office Tower • 7h 20m stay
                </span>
                <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-emerald-400/18 text-emerald-200 border border-emerald-400/30 inline-flex items-center gap-1.5">
                  <CheckCircle2 size={11} />
                  Spatial Clustering
                </span>
              </div>
            </div>

            <div className="relative z-10 w-full lg:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-4 shrink-0">
              <button
                type="button"
                onClick={handleDownloadGpx}
                className="w-full sm:w-auto justify-center px-6 py-3.5 rounded-full bg-white text-slate-950 font-semibold text-sm shadow-xl hover:bg-slate-100 transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                {downloadedGpx ? <Check size={17} className="text-emerald-600" /> : <Download size={17} />}
                <span>{downloadedGpx ? 'Sample GPX Saved!' : 'Download Sample (.gpx)'}</span>
              </button>

              <div className="text-left text-indigo-200 text-xs font-mono hidden sm:block">
                <div>GPX 1.1 XML Standard</div>
                <div>Garmin, Strava, Google Earth</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
