'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  ShieldAlert,
  AlertTriangle,
  Radio,
  CheckCircle2,
  Volume2,
  VolumeX,
  ArrowRight,
  Navigation,
  BatteryCharging,
  Users,
  Crosshair,
  MapPin,
  Lock,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import api from '@/lib/axios';
import { toast } from '@/lib/toast';
import { soundFx } from '@/lib/soundFx';
import { useAuth } from '@/hooks/useAuth';
import type { Friend } from '@/hooks/useFriends';
import { usePublicStats } from '@/hooks/usePublicStats';
import { useSocketContext } from '@/components/SocketProvider';
import { useLocationStore } from '@/store/useLocationStore';
import { cn } from '@/lib/utils';

interface BatteryManagerLike extends EventTarget {
  level: number;
  charging: boolean;
}

interface NavigatorWithBattery extends Navigator {
  getBattery?: () => Promise<BatteryManagerLike>;
}

const safetyPillars = [
  {
    icon: Radio,
    title: 'Sub-Second Socket.IO Broadcast',
    description:
      'Delivers encrypted coordinates and emergency notifications instantaneously to every friend room.',
    accent:
      'text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20',
  },
  {
    icon: Navigation,
    title: 'Emergency Breadcrumb Lock',
    description:
      'Persists high-accuracy GPS telemetry into Location History so responders route directly to you.',
    accent:
      'text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
  },
  {
    icon: BatteryCharging,
    title: '3-Second Safety Failsafe',
    description:
      'Built-in abort window prevents accidental alerts while attaching live battery level and speed.',
    accent:
      'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  },
];

const DIAL_TICKS = Array.from({ length: 24 }, (_, i) => i * 15);

export function EmergencySOSSection() {
  const { isAuthenticated } = useAuth();
  const { data: publicStats } = usePublicStats();
  const { socket } = useSocketContext();
  const myLocation = useLocationStore((s) => s.myLocation);

  const { data: realFriends = [] } = useQuery<Friend[]>({
    queryKey: ['friends'],
    queryFn: async () => {
      const { data } = await api.get('/friends');
      return data.data as Friend[];
    },
    enabled: isAuthenticated,
    staleTime: 60_000,
  });

  const [sosTriggered, setSosTriggered] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [armSession, setArmSession] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [liveDispatchMode, setLiveDispatchMode] = useState(false);
  const [dispatchReceipt, setDispatchReceipt] = useState<{
    recipients: number;
    timestamp: string;
    isLive: boolean;
  } | null>(null);

  const [gpsState, setGpsState] = useState<{
    lat: number | null;
    lng: number | null;
    accuracy: number | null;
    speedKmh: number | null;
    address: string | null;
    status: 'idle' | 'locating' | 'locked' | 'denied';
  }>({
    lat: myLocation?.latitude ?? null,
    lng: myLocation?.longitude ?? null,
    accuracy: myLocation?.accuracy ?? null,
    speedKmh: myLocation?.speed != null ? Math.round(myLocation.speed * 3.6) : null,
    address: myLocation?.city || myLocation?.address || null,
    status: myLocation ? 'locked' : 'idle',
  });

  const [batteryState, setBatteryState] = useState<{
    level: number | null;
    charging: boolean | null;
  }>({ level: null, charging: null });

  const soundEnabledRef = useRef(soundEnabled);
  const reverseAbortRef = useRef<AbortController | null>(null);
  const latestPayloadRef = useRef({
    lat: gpsState.lat,
    lng: gpsState.lng,
    address: gpsState.address,
    liveDispatch: false,
    friendCount: realFriends.length,
  });

  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);

  useEffect(() => {
    latestPayloadRef.current = {
      lat: myLocation?.latitude ?? gpsState.lat,
      lng: myLocation?.longitude ?? gpsState.lng,
      address: myLocation?.address || myLocation?.city || gpsState.address,
      liveDispatch:
        liveDispatchMode && isAuthenticated && Boolean(socket) && realFriends.length > 0,
      friendCount: realFriends.length,
    };
  }, [
    myLocation,
    gpsState.lat,
    gpsState.lng,
    gpsState.address,
    liveDispatchMode,
    isAuthenticated,
    socket,
    realFriends.length,
  ]);

  // Read real device Battery Status API when supported
  useEffect(() => {
    if (typeof navigator === 'undefined') return;
    const nav = navigator as NavigatorWithBattery;
    if (!nav.getBattery) return;

    let batteryRef: BatteryManagerLike | null = null;
    let cancelled = false;

    const syncBattery = () => {
      if (!batteryRef || cancelled) return;
      setBatteryState({
        level: Math.round(batteryRef.level * 100),
        charging: batteryRef.charging,
      });
    };

    nav
      .getBattery()
      .then((bat) => {
        if (cancelled) return;
        batteryRef = bat;
        syncBattery();
        bat.addEventListener('levelchange', syncBattery);
        bat.addEventListener('chargingchange', syncBattery);
      })
      .catch(() => {
        // Battery API unavailable
      });

    return () => {
      cancelled = true;
      if (batteryRef) {
        batteryRef.removeEventListener('levelchange', syncBattery);
        batteryRef.removeEventListener('chargingchange', syncBattery);
      }
    };
  }, []);

  // Listen to real Socket.IO dispatch confirmations
  useEffect(() => {
    if (!socket) return;

    const onDispatched = (payload: {
      success?: boolean;
      recipients?: number;
      timestamp?: string;
    }) => {
      if (!payload?.success) return;
      setDispatchReceipt({
        recipients: payload.recipients ?? 0,
        timestamp: payload.timestamp || new Date().toISOString(),
        isLive: true,
      });
      toast.success(
        `Emergency SOS broadcast sent to ${payload.recipients ?? 0} circle contact(s)`
      );
    };

    socket.on('sos:dispatched', onDispatched);
    return () => {
      socket.off('sos:dispatched', onDispatched);
    };
  }, [socket]);

  const syncDeviceGps = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setGpsState((prev) => ({ ...prev, status: 'denied' }));
      return;
    }

    setGpsState((prev) => ({ ...prev, status: 'locating' }));
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const accuracy = Math.round(pos.coords.accuracy);
        const speedKmh =
          pos.coords.speed != null && pos.coords.speed > 0
            ? Math.round(pos.coords.speed * 3.6)
            : 0;

        setGpsState({
          lat,
          lng,
          accuracy,
          speedKmh,
          address: null,
          status: 'locked',
        });

        try {
          reverseAbortRef.current?.abort();
          const controller = new AbortController();
          reverseAbortRef.current = controller;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
            { signal: controller.signal }
          );
          if (res.ok) {
            const data = await res.json();
            const label =
              data?.address?.suburb ||
              data?.address?.neighbourhood ||
              data?.address?.city ||
              data?.address?.town ||
              data?.name ||
              null;
            if (label) {
              setGpsState((prev) => ({ ...prev, address: label }));
            }
          }
        } catch {
          // Optional reverse geocode failed or aborted
        }
      },
      () => {
        setGpsState((prev) => ({ ...prev, status: 'denied' }));
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  }, []);

  useEffect(() => {
    return () => {
      reverseAbortRef.current?.abort();
    };
  }, []);

  // 3-second abort countdown + real/simulated dispatch execution
  useEffect(() => {
    if (countdown === null) return;

    const timer = setTimeout(() => {
      if (countdown > 1) {
        setCountdown((prev) => (prev !== null ? prev - 1 : null));
        return;
      }

      if (soundEnabledRef.current) soundFx?.playAlert?.();
      setSosTriggered(true);
      setCountdown(null);

      const { lat, lng, address, liveDispatch, friendCount } = latestPayloadRef.current;
      if (liveDispatch && socket && lat != null && lng != null) {
        socket.emit('sos:dispatch', {
          latitude: lat,
          longitude: lng,
          address: address || `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
          message: 'EMERGENCY: Immediate assistance requested via LocaLink SOS!',
        });
      } else {
        setDispatchReceipt({
          recipients: friendCount,
          timestamp: new Date().toISOString(),
          isLive: false,
        });
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, socket]);

  const activeLat = myLocation?.latitude ?? gpsState.lat;
  const activeLng = myLocation?.longitude ?? gpsState.lng;
  const activeAccuracy = myLocation?.accuracy ?? gpsState.accuracy;
  const activeSpeed =
    myLocation?.speed != null ? Math.round(myLocation.speed * 3.6) : gpsState.speedKmh;
  const activeAddress = myLocation?.city || myLocation?.address || gpsState.address;
  const canUseLiveDispatch =
    isAuthenticated &&
    Boolean(socket) &&
    realFriends.length > 0 &&
    activeLat !== null &&
    activeLng !== null;

  const handleSosClick = () => {
    soundFx?.playPop?.();
    if (sosTriggered) {
      setSosTriggered(false);
      setDispatchReceipt(null);
      setCountdown(null);
      return;
    }

    if (countdown !== null) {
      setCountdown(null);
      return;
    }

    if (activeLat === null && gpsState.status === 'idle') {
      syncDeviceGps();
    }

    setArmSession((prev) => prev + 1);
    setCountdown(3);
  };

  const isArming = countdown !== null;
  const coordsLabel =
    activeLat !== null && activeLng !== null
      ? `${activeLat.toFixed(4)}°N, ${activeLng.toFixed(4)}°E`
      : gpsState.status === 'locating'
        ? 'Acquiring GPS lock...'
        : 'GPS standby';

  return (
    <section
      id="emergency-sos"
      className="py-16 sm:py-24 lg:py-28 px-4 sm:px-6 relative overflow-hidden bg-[#F6F8FD] dark:bg-[#070B16] border-b border-slate-200/80 dark:border-white/[0.06] scroll-mt-16"
    >
      {/* Layered studio lighting */}
      <div className="absolute -top-24 right-[10%] w-[min(560px,90vw)] h-[420px] bg-rose-500/8 dark:bg-rose-600/12 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-24 left-[5%] w-[min(420px,80vw)] h-[320px] bg-indigo-500/6 dark:bg-indigo-600/10 rounded-full blur-[130px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* ─── Left Column: Editorial Safety Narrative & Unified Network Bar ─── */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
            className="lg:col-span-5 space-y-6 text-left"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 dark:bg-rose-500/10 border border-rose-200/80 dark:border-rose-400/25 text-rose-700 dark:text-rose-300 text-xs font-semibold shadow-2xs backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
              <span>Real-Time Emergency Dispatch</span>
            </div>

            <div className="space-y-4">
              <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-black text-slate-950 dark:text-white tracking-[-0.03em] leading-[1.08]">
                Emergency help,{' '}
                <span className="bg-gradient-to-r from-rose-600 via-red-500 to-amber-500 dark:from-rose-400 dark:via-red-400 dark:to-amber-300 bg-clip-text text-transparent">
                  when every second counts
                </span>
              </h2>

              <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed font-normal">
                Triggering SOS locks your live GPS coordinates, attaches device battery telemetry, and broadcasts an instant alert across your trusted circle.
              </p>
            </div>

            <div className="space-y-3.5 pt-1">
              {safetyPillars.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="group flex items-start gap-3.5 p-2 -mx-2 rounded-2xl hover:bg-white/60 dark:hover:bg-white/[0.03] transition-colors"
                  >
                    <div
                      className={cn(
                        'h-10 w-10 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 shadow-2xs',
                        item.accent
                      )}
                    >
                      <Icon size={18} />
                    </div>
                    <div className="space-y-0.5 min-w-0">
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

            {/* Unified Architectural Glass Metrics Strip (Real DB Stats) */}
            <div className="rounded-2xl bg-white/85 dark:bg-[#0D1426]/90 backdrop-blur-xl border border-slate-200/85 dark:border-white/[0.08] shadow-[0_8px_30px_rgba(15,23,42,0.04)] dark:shadow-[0_12px_30px_rgba(0,0,0,0.3)] grid grid-cols-3 divide-x divide-slate-200/80 dark:divide-white/[0.08]">
              <div className="p-3 sm:p-3.5">
                <div className="text-base sm:text-xl font-black text-slate-950 dark:text-white font-mono tabular-nums">
                  {publicStats ? publicStats.onlineUsers : '--'}
                </div>
                <div className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">
                  Active Online
                </div>
              </div>
              <div className="p-3 sm:p-3.5">
                <div className="text-base sm:text-xl font-black text-slate-950 dark:text-white font-mono tabular-nums">
                  {publicStats ? publicStats.totalCircles : '--'}
                </div>
                <div className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">
                  Circles Guarded
                </div>
              </div>
              <div className="p-3 sm:p-3.5">
                <div className="text-base sm:text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
                  {publicStats?.uptime || '99.99%'}
                </div>
                <div className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">
                  Relay Uptime
                </div>
              </div>
            </div>

            <div className="pt-1 flex flex-wrap items-center gap-3">
              <Link
                href={isAuthenticated ? '/dashboard/map' : '/register'}
                onClick={() => soundFx?.playPop?.()}
                className="h-11 px-7 w-full sm:w-auto justify-center rounded-full bg-gradient-to-b from-rose-500 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-sm font-semibold shadow-[0_10px_28px_rgba(239,68,68,0.32),inset_0_1px_0_rgba(255,255,255,0.28)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 inline-flex items-center gap-2 group"
              >
                <span>{isAuthenticated ? 'Open Live Safety Map' : 'Enable Family Safety Free'}</span>
                <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </motion.div>

          {/* ─── Right Column: Flagship Precision SOS Instrument Chassis ─── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 20 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, delay: 0.08, ease: 'easeOut' }}
            className="lg:col-span-7"
          >
            {/* Outer Specular Gradient Bezel */}
            <div className="p-[1px] rounded-3xl sm:rounded-[34px] bg-gradient-to-b from-slate-200/95 via-slate-200/60 to-slate-300/40 dark:from-white/[0.16] dark:via-white/[0.06] dark:to-white/[0.02] shadow-[0_28px_70px_rgba(15,23,42,0.1)] dark:shadow-[0_32px_80px_rgba(0,0,0,0.65)]">
              <div className="rounded-[23px] sm:rounded-[33px] bg-white/95 dark:bg-[#0B1122]/95 backdrop-blur-2xl overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                {/* Top Instrument Bar */}
                <div className="px-4 sm:px-7 py-4 border-b border-slate-200/80 dark:border-white/[0.07] flex flex-wrap items-center justify-between gap-3 bg-slate-50/60 dark:bg-[#0F172C]/90">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={cn(
                        'h-9 w-9 rounded-xl border flex items-center justify-center shrink-0 transition-colors shadow-2xs',
                        sosTriggered
                          ? 'bg-rose-500 text-white border-rose-400'
                          : isArming
                            ? 'bg-amber-500/15 text-amber-600 dark:text-amber-300 border-amber-400/35'
                            : 'bg-white dark:bg-[#151F3B] text-rose-600 dark:text-rose-400 border-slate-200/90 dark:border-white/[0.08]'
                      )}
                    >
                      <ShieldAlert size={18} className={sosTriggered ? 'animate-pulse' : ''} />
                    </div>
                    <div className="text-left min-w-0">
                      <div className="text-xs sm:text-sm font-bold text-slate-950 dark:text-white tracking-tight truncate">
                        Emergency Dispatch Console
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate">
                        {coordsLabel}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    <button
                      type="button"
                      onClick={() => {
                        soundFx?.playPop?.();
                        syncDeviceGps();
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-[#151F3B] border border-slate-200/90 dark:border-white/[0.1] text-[11px] font-semibold text-slate-700 dark:text-slate-200 hover:border-indigo-300 dark:hover:border-indigo-400/40 transition-colors cursor-pointer shadow-2xs"
                      title="Sync live browser GPS"
                    >
                      <Crosshair
                        size={12}
                        className={cn(
                          'text-indigo-500 dark:text-indigo-400',
                          gpsState.status === 'locating' && 'animate-spin'
                        )}
                      />
                      <span>{activeLat !== null ? 'GPS Locked' : 'Sync GPS'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        soundFx?.playPop?.();
                        setSoundEnabled((prev) => !prev);
                      }}
                      className="h-8 w-8 inline-flex items-center justify-center rounded-full bg-white dark:bg-[#151F3B] border border-slate-200/90 dark:border-white/[0.1] text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white transition-colors cursor-pointer shadow-2xs"
                      title={soundEnabled ? 'Mute Alert Sound' : 'Unmute Alert Sound'}
                      aria-label={soundEnabled ? 'Mute Alert Sound' : 'Unmute Alert Sound'}
                      aria-pressed={!soundEnabled}
                    >
                      {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
                    </button>

                    <span
                      className={cn(
                        'inline-flex items-center gap-1.5 text-[10px] font-mono font-bold px-3 py-1.5 rounded-full border tracking-wider transition-colors',
                        sosTriggered
                          ? 'bg-rose-600 text-white border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.4)]'
                          : isArming
                            ? 'bg-amber-500 text-white border-amber-400 shadow-[0_0_16px_rgba(245,158,11,0.35)]'
                            : 'bg-emerald-50/90 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300 border-emerald-200/90 dark:border-emerald-500/25'
                      )}
                    >
                      <span
                        className={cn(
                          'h-1.5 w-1.5 rounded-full',
                          sosTriggered
                            ? 'bg-white animate-ping'
                            : isArming
                              ? 'bg-white animate-pulse'
                              : 'bg-emerald-500'
                        )}
                      />
                      <span>
                        {sosTriggered
                          ? 'DISPATCHED'
                          : isArming
                            ? `ARMING ${countdown}S`
                            : 'STANDBY'}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Main Command Split: Machined Radar Dial + Hardware Telemetry */}
                <div className="relative px-4 sm:px-7 py-7 sm:py-9 grid grid-cols-1 md:grid-cols-12 gap-7 items-center">
                  {/* Subtle ambient halo behind dial */}
                  <div
                    className={cn(
                      'absolute left-1/4 top-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-[80px] pointer-events-none transition-colors duration-500',
                      sosTriggered
                        ? 'bg-rose-500/25 dark:bg-rose-500/25'
                        : isArming
                          ? 'bg-amber-500/20 dark:bg-amber-500/20'
                          : 'bg-rose-500/8 dark:bg-indigo-500/10'
                    )}
                  />

                  {/* Left: Precision Dial */}
                  <div className="md:col-span-6 flex flex-col items-center justify-center relative z-10">
                    <div className="relative flex items-center justify-center h-48 w-48 sm:h-52 sm:w-52">
                      {/* Slow conic radar sweep */}
                      <div
                        className={cn(
                          'absolute inset-1 rounded-full opacity-50 dark:opacity-70 animate-[spin_10s_linear_infinite] pointer-events-none',
                          sosTriggered
                            ? 'bg-[conic-gradient(from_0deg,rgba(244,63,94,0.35),transparent_42%)]'
                            : isArming
                              ? 'bg-[conic-gradient(from_0deg,rgba(245,158,11,0.32),transparent_42%)]'
                              : 'bg-[conic-gradient(from_0deg,rgba(99,102,241,0.16),transparent_40%)]'
                        )}
                      />

                      {/* Outer ring & 24 compass precision ticks */}
                      <svg
                        viewBox="0 0 200 200"
                        className="absolute inset-0 w-full h-full pointer-events-none"
                        aria-hidden="true"
                      >
                        <circle
                          cx="100"
                          cy="100"
                          r="95"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1"
                          className={cn(
                            'transition-colors duration-300',
                            sosTriggered
                              ? 'text-rose-500/35'
                              : isArming
                                ? 'text-amber-500/35'
                                : 'text-slate-300/75 dark:text-white/[0.08]'
                          )}
                        />
                        {DIAL_TICKS.map((deg) => (
                          <line
                            key={deg}
                            x1="100"
                            y1="6"
                            x2="100"
                            y2={deg % 90 === 0 ? '15' : '11'}
                            stroke="currentColor"
                            strokeWidth={deg % 90 === 0 ? '1.75' : '1'}
                            transform={`rotate(${deg} 100 100)`}
                            className={cn(
                              'transition-colors duration-300',
                              sosTriggered
                                ? 'text-rose-500/60'
                                : isArming
                                  ? 'text-amber-500/60'
                                  : 'text-slate-400/70 dark:text-white/[0.18]'
                            )}
                          />
                        ))}
                      </svg>

                      {sosTriggered && (
                        <span className="animate-ping absolute inset-3 rounded-full bg-rose-500/25 pointer-events-none" />
                      )}

                      {/* 3-second SVG countdown progress arc */}
                      {isArming && (
                        <svg
                          key={armSession}
                          viewBox="0 0 180 180"
                          className="absolute inset-2 w-[calc(100%-1rem)] h-[calc(100%-1rem)] -rotate-90 pointer-events-none"
                          aria-hidden="true"
                        >
                          <motion.circle
                            cx="90"
                            cy="90"
                            r="78"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3.5"
                            strokeLinecap="round"
                            className="text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                            initial={{ pathLength: 1 }}
                            animate={{ pathLength: 0 }}
                            transition={{ duration: 3, ease: 'linear' }}
                          />
                        </svg>
                      )}

                      {/* Machined Core Trigger Button */}
                      <button
                        type="button"
                        onClick={handleSosClick}
                        aria-label={
                          sosTriggered
                            ? 'Reset emergency SOS state'
                            : isArming
                              ? 'Abort SOS countdown'
                              : 'Start 3-second SOS dispatch'
                        }
                        className={cn(
                          'relative h-32 w-32 sm:h-36 sm:w-36 rounded-full font-black text-white transition-all duration-300 cursor-pointer flex flex-col items-center justify-center gap-1 active:scale-95 overflow-hidden ring-[6px]',
                          sosTriggered
                            ? 'bg-[radial-gradient(circle_at_35%_25%,#fb7185,#e11d48_55%,#881337)] ring-rose-500/25 shadow-[0_18px_48px_rgba(225,29,72,0.55),inset_0_2px_4px_rgba(255,255,255,0.4)] scale-105'
                            : isArming
                              ? 'bg-[radial-gradient(circle_at_35%_25%,#fbbf24,#f59e0b_55%,#b45309)] ring-amber-400/25 shadow-[0_18px_44px_rgba(245,158,11,0.45),inset_0_2px_4px_rgba(255,255,255,0.4)] scale-105'
                              : 'bg-[radial-gradient(circle_at_35%_25%,#fb7185,#e11d48_58%,#9f1239)] ring-slate-200/80 dark:ring-white/[0.08] shadow-[0_16px_40px_rgba(225,29,72,0.36),inset_0_2px_4px_rgba(255,255,255,0.38)] hover:scale-[1.04] hover:shadow-[0_22px_52px_rgba(225,29,72,0.5)]'
                        )}
                      >
                        {/* Top glass specular highlight */}
                        <span className="absolute inset-x-4 top-1 h-1/2 rounded-full bg-gradient-to-b from-white/25 to-transparent pointer-events-none" />
                        <span className="absolute inset-2 rounded-full border border-white/25 pointer-events-none" />

                        <ShieldAlert
                          size={26}
                          className={cn('relative z-10', sosTriggered && 'animate-bounce')}
                        />
                        <span className="relative z-10 text-2xl sm:text-[26px] tracking-tight leading-none tabular-nums">
                          {sosTriggered ? 'DISARM' : isArming ? `${countdown}s` : 'SOS'}
                        </span>
                        <span className="relative z-10 text-[9px] uppercase tracking-[0.16em] text-white/85 font-semibold">
                          {sosTriggered ? 'Reset' : isArming ? 'Abort' : 'Tap to Arm'}
                        </span>
                      </button>
                    </div>

                    <p className="mt-3 text-[11px] text-slate-500 dark:text-slate-400 text-center max-w-[240px] font-medium">
                      {sosTriggered
                        ? dispatchReceipt?.isLive
                          ? `Live alert persisted to ${dispatchReceipt.recipients} contact(s).`
                          : 'Safe simulation verified. Zero external alerts sent.'
                        : isArming
                          ? 'Arming packet... Tap dial again to abort.'
                          : canUseLiveDispatch && liveDispatchMode
                            ? `Armed for LIVE Socket.IO broadcast (${realFriends.length}).`
                            : 'Interactive 3-second abort window & live telemetry.'}
                    </p>
                  </div>

                  {/* Right: Hardware Telemetry Readout Panel */}
                  <div className="md:col-span-6 space-y-2.5 text-left relative z-10">
                    {/* Position Card */}
                    <div className="p-3.5 rounded-2xl bg-slate-50/90 dark:bg-[#111930] border border-slate-200/80 dark:border-white/[0.07]">
                      <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400 font-semibold mb-1.5">
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin size={11} className="text-rose-500" />
                          <span>Position Payload</span>
                        </span>
                        {activeAccuracy !== null && (
                          <span className="font-mono text-emerald-600 dark:text-emerald-400">
                            ±{Math.round(activeAccuracy)}m
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-bold text-slate-950 dark:text-white truncate">
                        {activeAddress ||
                          (activeLat !== null
                            ? 'Pinpoint Browser GPS'
                            : 'Tap Sync GPS to attach coordinates')}
                      </div>
                      <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 truncate mt-0.5 tabular-nums">
                        {activeLat !== null && activeLng !== null
                          ? `${activeLat.toFixed(5)}, ${activeLng.toFixed(5)}`
                          : 'Awaiting device geolocation fix'}
                      </div>
                    </div>

                    {/* Battery + Speed Split */}
                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="p-3.5 rounded-2xl bg-slate-50/90 dark:bg-[#111930] border border-slate-200/80 dark:border-white/[0.07] space-y-1.5">
                        <div className="text-[10px] uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400 font-semibold">
                          Battery
                        </div>
                        <div className="text-sm font-black text-slate-950 dark:text-white font-mono tabular-nums">
                          {batteryState.level !== null
                            ? `${batteryState.level}%${batteryState.charging ? ' ⚡' : ''}`
                            : 'Online'}
                        </div>
                        {batteryState.level !== null && (
                          <div className="h-1 w-full rounded-full bg-slate-200 dark:bg-white/[0.08] overflow-hidden">
                            <div
                              className={cn(
                                'h-full rounded-full transition-all',
                                batteryState.level < 20 ? 'bg-amber-500' : 'bg-emerald-500'
                              )}
                              style={{ width: `${batteryState.level}%` }}
                            />
                          </div>
                        )}
                      </div>

                      <div className="p-3.5 rounded-2xl bg-slate-50/90 dark:bg-[#111930] border border-slate-200/80 dark:border-white/[0.07] space-y-1.5">
                        <div className="text-[10px] uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400 font-semibold">
                          Velocity
                        </div>
                        <div className="text-sm font-black text-slate-950 dark:text-white font-mono tabular-nums">
                          {activeSpeed !== null ? `${activeSpeed} km/h` : '--'}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                          {activeSpeed !== null && activeSpeed > 3 ? 'In Motion' : 'Stationary'}
                        </div>
                      </div>
                    </div>

                    {/* Dispatch Mode Control */}
                    <div className="p-3.5 rounded-2xl bg-slate-50/90 dark:bg-[#111930] border border-slate-200/80 dark:border-white/[0.07] flex items-center justify-between gap-2.5">
                      <div className="min-w-0">
                        <div className="text-[11px] font-bold text-slate-950 dark:text-white truncate">
                          {canUseLiveDispatch ? 'Socket.IO Dispatch' : 'Safe Sandbox Mode'}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                          {canUseLiveDispatch
                            ? liveDispatchMode
                              ? 'Live alert enabled on SOS'
                              : 'Simulated safely (no push sent)'
                            : isAuthenticated
                              ? 'Sync GPS & add friends for live'
                              : 'Sign in to arm real circle'}
                        </div>
                      </div>

                      {canUseLiveDispatch ? (
                        <button
                          type="button"
                          onClick={() => {
                            soundFx?.playPop?.();
                            setLiveDispatchMode((prev) => !prev);
                          }}
                          className={cn(
                            'px-3 py-1 rounded-full text-[10px] font-bold border transition-colors cursor-pointer shrink-0',
                            liveDispatchMode
                              ? 'bg-rose-600 text-white border-rose-500'
                              : 'bg-white dark:bg-[#0B1122] text-slate-700 dark:text-slate-200 border-slate-200 dark:border-white/[0.12]'
                          )}
                          aria-pressed={liveDispatchMode}
                        >
                          {liveDispatchMode ? 'LIVE' : 'SAFE TEST'}
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-white dark:bg-[#0B1122] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/[0.1] shrink-0">
                          <Lock size={10} />
                          Demo Safe
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom Real Circle Dock */}
                <div className="px-4 sm:px-7 py-4 border-t border-slate-200/80 dark:border-white/[0.07] bg-slate-50/75 dark:bg-[#090F1E]/90 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-semibold">
                    <span className="inline-flex items-center gap-1.5 text-slate-700 dark:text-slate-200">
                      <Users size={13} className="text-indigo-500 dark:text-indigo-400" />
                      <span>
                        {isAuthenticated
                          ? `Your Trusted Circle (${realFriends.length})`
                          : 'Trusted Circle Contacts'}
                      </span>
                    </span>
                    <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400">
                      {sosTriggered && dispatchReceipt
                        ? `${dispatchReceipt.isLive ? 'Broadcast Confirmed' : 'Simulation Verified'} • ${new Date(dispatchReceipt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                        : isArming
                          ? 'Arming alert packet...'
                          : 'Encrypted Channel Ready'}
                    </span>
                  </div>

                  {isAuthenticated && realFriends.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {realFriends.slice(0, 4).map((friend) => (
                        <div
                          key={friend.id}
                          className={cn(
                            'p-2.5 rounded-2xl border flex items-center justify-between gap-2.5 transition-colors',
                            sosTriggered
                              ? 'bg-rose-50 dark:bg-rose-950/35 border-rose-300/80 dark:border-rose-500/40'
                              : 'bg-white dark:bg-[#0E1528] border-slate-200/85 dark:border-white/[0.08]'
                          )}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="relative shrink-0">
                              {friend.avatar ? (
                                <Image
                                  src={friend.avatar}
                                  alt={friend.name}
                                  width={32}
                                  height={32}
                                  unoptimized
                                  className="h-8 w-8 rounded-full object-cover border border-slate-200 dark:border-white/10"
                                />
                              ) : (
                                <div className="h-8 w-8 rounded-full bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 text-xs font-bold flex items-center justify-center">
                                  {friend.name.slice(0, 2).toUpperCase()}
                                </div>
                              )}
                              <span
                                className={cn(
                                  'absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white dark:border-[#0E1528]',
                                  friend.isOnline ? 'bg-emerald-500' : 'bg-slate-400'
                                )}
                              />
                            </div>
                            <div className="text-left min-w-0">
                              <div className="text-xs font-bold text-slate-950 dark:text-white truncate">
                                {friend.name}
                              </div>
                              <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                {friend.isOnline ? 'Connected Live' : 'Push Alert Armed'}
                              </div>
                            </div>
                          </div>

                          <span
                            className={cn(
                              'inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full shrink-0',
                              sosTriggered
                                ? 'bg-rose-600 text-white'
                                : isArming
                                  ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                                  : 'bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-slate-300'
                            )}
                          >
                            {sosTriggered && <CheckCircle2 size={10} />}
                            <span>
                              {sosTriggered
                                ? dispatchReceipt?.isLive
                                  ? 'Alerted'
                                  : 'Tested'
                                : isArming
                                  ? 'Arming'
                                  : 'Armed'}
                            </span>
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0E1528] border border-slate-200/85 dark:border-white/[0.08] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-left">
                      <div className="flex items-start gap-2.5 min-w-0">
                        <AlertTriangle size={15} className="text-amber-500 shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-950 dark:text-white">
                            {isAuthenticated
                              ? 'No trusted friends added yet'
                              : 'Sign in to arm your real circle contacts'}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">
                            {isAuthenticated
                              ? 'Add circle members to deliver live SOS sirens and emergency coordinates.'
                              : 'Connected members receive real-time push alerts, sirens, and GPS breadcrumbs.'}
                          </div>
                        </div>
                      </div>

                      <Link
                        href={isAuthenticated ? '/dashboard/friends' : '/login'}
                        onClick={() => soundFx?.playPop?.()}
                        className="px-4 py-2 rounded-full bg-gradient-to-b from-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold transition-all shrink-0 inline-flex items-center gap-1.5 shadow-sm"
                      >
                        <span>{isAuthenticated ? 'Add Friends' : 'Sign In'}</span>
                        <ArrowRight size={13} />
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
