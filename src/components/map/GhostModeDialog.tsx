'use client';

import React from 'react';
import {
  Ghost, Zap, Shield, EyeOff, Clock, Check, X, ShieldAlert, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocationStore } from '@/store/useLocationStore';
import { toast } from '@/lib/toast';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface GhostModeDialogProps {
  open: boolean;
  onClose: () => void;
}

export function GhostModeDialog({ open, onClose }: GhostModeDialogProps) {
  const {
    ghostUntil, setGhostUntil,
    batterySaverMode, setBatterySaverMode,
    myLocation
  } = useLocationStore();

  const isGhostActive = ghostUntil !== null && Date.now() < ghostUntil;
  const isPermanentGhost = ghostUntil !== null && ghostUntil > Date.now() + 100 * 365 * 24 * 3600 * 1000;

  const handleSelectDuration = (durationMs: number | null) => {
    if (durationMs === null) {
      setGhostUntil(null);
      toast.success('Ghost Mode disabled — your friends can now see your live location!');
    } else {
      const until = Date.now() + durationMs;
      setGhostUntil(until);
      const timeStr = new Date(until).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      toast.success(`Ghost Mode activated until ${timeStr}`);
    }
  };

  const handlePermanentGhost = () => {
    // 100 years in future
    const farFuture = Date.now() + 100 * 365 * 24 * 3600 * 1000;
    setGhostUntil(farFuture);
    toast.success('Permanent Ghost Mode activated — location hidden until toggled off.');
  };

  const getTomorrowMorningMs = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(8, 0, 0, 0);
    return Math.max(d.getTime() - Date.now(), 60 * 60 * 1000);
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-md"
          onClick={onClose}
        />

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 16 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 16 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative z-10 w-full max-w-md bg-card border border-border/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col p-6 space-y-5"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                <Ghost size={20} />
              </div>
              <div>
                <h2 className="font-extrabold text-base text-foreground">Privacy & Battery Controls</h2>
                <p className="text-xs text-muted-foreground">Manage Ghost Mode and GPS power usage</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="h-8 w-8 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Section 1: Ghost Mode Options */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider">
                <EyeOff size={13} className="text-indigo-500" />
                Ghost Mode (Hide Location)
              </span>
              {isGhostActive && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30">
                  Active
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              When Ghost Mode is on, you can still see where you are, but friends in your circle will not receive live location updates.
            </p>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleSelectDuration(null)}
                className={cn(
                  'p-3 rounded-2xl border text-left transition-all flex flex-col justify-between',
                  !isGhostActive
                    ? 'border-primary bg-primary/10 text-primary font-bold shadow-xs'
                    : 'border-border/60 bg-muted/30 text-foreground hover:bg-muted/60'
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">Ghost Off</span>
                  {!isGhostActive && <Check size={14} className="text-primary" />}
                </div>
                <span className="text-[10px] text-muted-foreground mt-1">Share in real-time</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectDuration(60 * 60 * 1000)}
                className={cn(
                  'p-3 rounded-2xl border text-left transition-all flex flex-col justify-between',
                  isGhostActive && !isPermanentGhost && ghostUntil && ghostUntil - Date.now() <= 70 * 60 * 1000
                    ? 'border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold shadow-xs'
                    : 'border-border/60 bg-muted/30 text-foreground hover:bg-muted/60'
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">For 1 Hour</span>
                  <Clock size={13} className="text-muted-foreground" />
                </div>
                <span className="text-[10px] text-muted-foreground mt-1">60 mins privacy</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectDuration(8 * 60 * 60 * 1000)}
                className={cn(
                  'p-3 rounded-2xl border text-left transition-all flex flex-col justify-between',
                  isGhostActive && !isPermanentGhost && ghostUntil && ghostUntil - Date.now() > 70 * 60 * 1000 && ghostUntil - Date.now() <= 9 * 3600 * 1000
                    ? 'border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold shadow-xs'
                    : 'border-border/60 bg-muted/30 text-foreground hover:bg-muted/60'
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">For 8 Hours</span>
                  <Clock size={13} className="text-muted-foreground" />
                </div>
                <span className="text-[10px] text-muted-foreground mt-1">Work / night privacy</span>
              </button>

              <button
                type="button"
                onClick={handlePermanentGhost}
                className={cn(
                  'p-3 rounded-2xl border text-left transition-all flex flex-col justify-between',
                  isPermanentGhost
                    ? 'border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold shadow-xs'
                    : 'border-border/60 bg-muted/30 text-foreground hover:bg-muted/60'
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">Until Disabled</span>
                  <Ghost size={13} className="text-muted-foreground" />
                </div>
                <span className="text-[10px] text-muted-foreground mt-1">Always hidden</span>
              </button>
            </div>
          </div>

          {/* Section 2: Adaptive Battery Saver */}
          <div className="p-4 rounded-2xl bg-muted/40 border border-border/60 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center">
                  <Zap size={16} />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">GPS Battery Saver</p>
                  <p className="text-[11px] text-muted-foreground">Throttles GPS updates to 60s</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  const next = !batterySaverMode;
                  setBatterySaverMode(next);
                  toast.success(next ? 'Battery Saver Mode enabled' : 'Battery Saver Mode disabled');
                }}
                className={cn(
                  'w-12 h-6 rounded-full transition-colors relative flex items-center px-1',
                  batterySaverMode ? 'bg-amber-500' : 'bg-muted-foreground/30'
                )}
              >
                <motion.div
                  layout
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className={cn(
                    'h-4 w-4 rounded-full bg-white shadow-xs',
                    batterySaverMode ? 'ml-auto' : 'ml-0'
                  )}
                />
              </button>
            </div>

            {myLocation?.batteryLevel !== undefined && (
              <div className="flex items-center justify-between pt-1 border-t border-border/30 text-[11px] text-muted-foreground">
                <span>Device Battery:</span>
                <span className="font-bold text-foreground">
                  {myLocation.batteryLevel}% {myLocation.isCharging ? '(Charging)' : ''}
                </span>
              </div>
            )}
          </div>

          <Button
            onClick={onClose}
            className="w-full h-10 font-bold rounded-xl"
          >
            Done
          </Button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
