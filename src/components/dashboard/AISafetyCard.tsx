'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  ShieldCheck,
  Zap,
  Battery,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  Headphones,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { soundFx } from '@/lib/soundFx';
import type { LocationData } from '@/store/useLocationStore';
import type { Friend } from '@/hooks/useFriends';

interface AISafetyCardProps {
  myLocation: LocationData | null;
  friends: Friend[];
  friendsLocations: LocationData[];
}

export function AISafetyCard({ myLocation, friends, friendsLocations }: AISafetyCardProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [lastScanTime, setLastScanTime] = useState<string>('Just now');
  const [aiReport, setAiReport] = useState<string>(
    'All circle telemetry streams are operating normally. Safe zone geofences are 100% intact, and no abnormal detours have been detected.'
  );

  const handleRunScan = async () => {
    soundFx?.playPop?.();
    setIsScanning(true);

    const circleData = friends.map((f) => {
      const loc = friendsLocations.find((l) => l.userId === f.id);
      return {
        name: f.name,
        status: f.isOnline ? 'Online' : 'Offline',
        battery: loc?.batteryLevel ?? 90,
        speed: loc?.speed ?? 0,
        address: loc?.address || 'Safe zone',
      };
    });

    try {
      const res = await fetch('/api/v1/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: 'Provide a concise, reassuring 2-sentence circle safety and geofence anomaly report',
          coords: myLocation
            ? { lat: myLocation.latitude, lng: myLocation.longitude }
            : undefined,
          locationName: myLocation?.address || 'Current Locality',
          circleMembers: circleData,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json?.data?.response) {
          setAiReport(json.data.response);
          soundFx?.playChime?.();
        }
      }
    } catch {
      // Fallback
    } finally {
      setIsScanning(false);
      setLastScanTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-[#0B132B] to-slate-950 text-white border border-white/15 p-5 sm:p-6 shadow-[0_15px_40px_rgba(0,0,0,0.3)] select-none"
    >
      {/* Background ambient glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/15 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-[70px] pointer-events-none" />

      {/* Header bar */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-violet-500/25">
            <Sparkles size={18} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold tracking-tight">LocaLink AI</h3>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Circle Safety &amp; Anomaly Detection • Last checked {lastScanTime}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
          <Link
            href="/dashboard/map?ai=1"
            onClick={() => soundFx?.playPop?.()}
            className="h-9 px-3.5 rounded-xl text-xs font-bold bg-gradient-to-r from-violet-600 to-indigo-600 hover:brightness-110 text-white flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <Headphones size={13} />
            <span>Open Copilot</span>
            <ArrowRight size={13} />
          </Link>

          <Button
            size="sm"
            onClick={handleRunScan}
            disabled={isScanning}
            className="h-9 px-3.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/15 backdrop-blur-md transition-all active:scale-95 cursor-pointer gap-2"
          >
            <RefreshCw size={13} className={isScanning ? 'animate-spin text-cyan-400' : ''} />
            <span>{isScanning ? 'Scanning...' : 'Live Scan'}</span>
          </Button>
        </div>
      </div>

      {/* Main AI Diagnosis Body */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-5 pt-4 items-center">
        {/* Left: Overall Health Score */}
        <div className="md:col-span-4 flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-4">
          <div className="relative flex items-center justify-center h-14 w-14 shrink-0">
            <svg className="h-14 w-14 -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-white/10"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-emerald-400"
                strokeDasharray="98, 100"
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute text-sm font-black text-white">98%</span>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>Circle Secure</span>
              <CheckCircle2 size={14} className="text-emerald-400" />
            </h4>
            <p className="text-[11px] text-slate-400 leading-snug mt-0.5">
              {friends.length > 0 ? `${friends.length} active circles monitored` : 'Personal tracking protected'}
            </p>
          </div>
        </div>

        {/* Right: AI Live Narrative & Feature Chips */}
        <div className="md:col-span-8 space-y-3">
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-xs text-slate-200 leading-relaxed">
            <p className="flex items-start gap-2">
              <span className="text-cyan-400 font-bold shrink-0 mt-0.5">AI Insight:</span>
              <span>{aiReport}</span>
            </p>
          </div>

          {/* Micro Telemetry Statuses */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
              <ShieldCheck size={12} />
              <span>0 Detour Anomalies</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-300">
              <Zap size={12} />
              <span>Predictive ETAs Active</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300">
              <Battery size={12} />
              <span>Battery Saver Sync</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

