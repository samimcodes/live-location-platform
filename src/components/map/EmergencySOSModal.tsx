'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  ShieldAlert,
  X,
  Radio,
  MapPin,
  Users,
  CheckCircle2,
  Volume2,
  PhoneCall,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { soundFx } from '@/lib/soundFx';
import { useLocationStore } from '@/store/useLocationStore';
import { useFriends } from '@/hooks/useFriends';
import { toast } from '@/lib/toast';
import { cn } from '@/lib/utils';

export function MapSOSButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isDispatched, setIsDispatched] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const { myLocation } = useLocationStore();
  const { data: friends = [] } = useFriends();

  // Handle countdown
  useEffect(() => {
    if (countdown === null) return;

    if (countdown > 0) {
      soundFx.playAlert();
      timerRef.current = setTimeout(() => {
        setCountdown((prev) => (prev !== null ? prev - 1 : null));
      }, 1000);
    } else if (countdown === 0) {
      soundFx.playAlert();
      setIsDispatched(true);
      setCountdown(null);
      toast.error('EMERGENCY SOS DISPATCHED', {
        description: 'Pinpoint GPS broadcasted to all circle members with high-priority siren.',
      });
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [countdown]);

  const handleStartSOS = () => {
    soundFx.playPop();
    setIsOpen(true);
    setIsDispatched(false);
    setCountdown(3);
  };

  const handleCancel = () => {
    soundFx.playPop();
    if (timerRef.current) clearTimeout(timerRef.current);
    setCountdown(null);
    setIsDispatched(false);
    setIsOpen(false);
    toast.info('Emergency SOS cancelled');
  };

  return (
    <>
      {/* ── Floating SOS Button on Map ────────────────────────── */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="absolute bottom-6 left-4 sm:left-52 z-20"
      >
        <button
          onClick={handleStartSOS}
          title="Emergency 1-Click SOS Dispatch"
          className="relative group flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-600 text-white font-extrabold text-xs shadow-[0_4px_20px_rgba(239,68,68,0.45)] hover:shadow-[0_6px_28px_rgba(239,68,68,0.6)] border border-red-400/40 active:scale-95 transition-all duration-300 cursor-pointer overflow-hidden select-none"
        >
          {/* Pulsing Beacon Halo */}
          <span className="absolute -inset-1 rounded-2xl bg-red-500/30 animate-ping pointer-events-none opacity-40" />

          {/* Shimmer line */}
          <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" />

          <ShieldAlert size={16} className="relative z-10 animate-pulse text-white" />
          <span className="relative z-10 tracking-wider uppercase font-black text-[11px] sm:text-xs">
            SOS Dispatch
          </span>
        </button>
      </motion.div>

      {/* ── Emergency SOS Modal ──────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCancel}
              className="absolute inset-0 bg-red-950/40 backdrop-blur-md"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', stiffness: 350, damping: 28 }}
              className="relative w-full max-w-md bg-card/95 dark:bg-[#12070A]/95 border-2 border-red-500/50 rounded-3xl p-6 sm:p-7 shadow-[0_24px_70px_rgba(239,68,68,0.35)] backdrop-blur-2xl overflow-hidden text-center z-10"
            >
              {/* Decorative Red Ambient Glow */}
              <div className="absolute -top-20 -left-20 w-48 h-48 bg-red-500/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />

              {/* Close Button */}
              <button
                onClick={handleCancel}
                className="absolute top-4 right-4 h-8 w-8 rounded-full bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>

              {!isDispatched ? (
                <>
                  {/* Countdown State */}
                  <div className="mx-auto mb-4 flex items-center justify-center">
                    <div className="relative h-24 w-24 rounded-full flex items-center justify-center bg-red-500/10 border-2 border-red-500/30">
                      <span className="absolute inset-0 rounded-full bg-red-500/20 animate-ping opacity-60" />
                      <span className="text-4xl font-black text-red-600 dark:text-red-400 font-mono">
                        {countdown ?? 3}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
                    Dispatching Emergency SOS
                  </h3>
                  <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground max-w-xs mx-auto">
                    Sending loud audio sirens and high-priority live coordinates to all your circle members in{' '}
                    <strong className="text-red-500">{countdown ?? 3} seconds</strong>.
                  </p>

                  {/* Telemetry info */}
                  <div className="my-5 p-3.5 rounded-2xl bg-muted/40 border border-border/60 text-left space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                        <MapPin size={13} className="text-red-500" /> Current Coordinates
                      </span>
                      <span className="font-mono font-bold text-foreground text-[11px]">
                        {myLocation
                          ? `${myLocation.latitude.toFixed(5)}, ${myLocation.longitude.toFixed(5)}`
                          : 'Detecting GPS…'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                        <Users size={13} className="text-primary" /> Recipients
                      </span>
                      <span className="font-bold text-foreground">
                        {friends.length} Circle Member{friends.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex flex-col gap-2.5">
                    <Button
                      variant="destructive"
                      onClick={() => setCountdown(0)}
                      className="w-full h-11 rounded-2xl font-black text-sm bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/30 cursor-pointer"
                    >
                      Dispatch Immediately
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleCancel}
                      className="w-full h-11 rounded-2xl font-bold text-sm cursor-pointer"
                    >
                      Cancel (Accidental Press)
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  {/* Dispatched State */}
                  <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-red-500/20 text-red-500 border border-red-500/40">
                    <Radio size={36} className="animate-pulse" />
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black text-red-600 dark:text-red-400 tracking-tight">
                    Emergency Alert Active
                  </h3>
                  <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto">
                    Your distress beacon is now broadcasting live. All circle members have received push alerts with directions to your marker.
                  </p>

                  <div className="my-5 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-left space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-red-600 dark:text-red-400">
                      <Volume2 size={15} />
                      <span>Audible Sirens Broadcasted</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Stay where you are if safe, or navigate towards public spaces. Keep your device powered on.
                    </p>
                  </div>

                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    className="w-full h-11 rounded-2xl font-bold text-sm border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-500/10 cursor-pointer"
                  >
                    Resolve & Cancel Emergency Beacon
                  </Button>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
