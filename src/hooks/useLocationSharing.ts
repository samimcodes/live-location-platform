'use client';

import { useEffect, useRef } from 'react';
import { useSocketContext } from '@/components/SocketProvider';
import { useLocationStore } from '@/store/useLocationStore';
import { useAppSelector } from '@/store/store';

const LOCATION_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  maximumAge: 15_000,
  timeout: 10_000,
};

export interface LocationSharingResult {
  isSharing: boolean;
  /** Set when the browser denies or fails to provide geolocation. */
  geoError: GeolocationPositionError | null;
}

interface BatteryManager extends EventTarget {
  charging: boolean;
  chargingTime: number;
  dischargingTime: number;
  level: number;
}

interface NavigatorWithBattery extends Navigator {
  getBattery?: () => Promise<BatteryManager>;
}

async function getDeviceBattery(): Promise<{ batteryLevel?: number; isCharging?: boolean }> {
  try {
    const nav = typeof navigator !== 'undefined' ? (navigator as NavigatorWithBattery) : undefined;
    if (nav?.getBattery) {
      const b = await nav.getBattery();
      return {
        batteryLevel: Math.round(b.level * 100),
        isCharging: b.charging,
      };
    }
  } catch {
    // Battery API not supported or restricted
  }
  return {};
}

export function useLocationSharing(): LocationSharingResult {
  const { emit } = useSocketContext();
  const {
    isSharing, setMyLocation, setWatchId, watchId,
    geoError, setGeoError, ghostUntil, batterySaverMode
  } = useLocationStore();
  const { isAuthenticated, user } = useAppSelector((s) => s.auth);

  // Keep refs so callbacks never go stale without causing re-renders
  const watchIdRef          = useRef<number | null>(watchId);
  const isAuthRef           = useRef(isAuthenticated);
  const isSharingRef        = useRef(isSharing);
  const userIdRef           = useRef<number>(user?.id ?? 0);
  const ghostUntilRef       = useRef<number | null>(ghostUntil);
  const batterySaverModeRef = useRef<boolean>(batterySaverMode);
  const lastEmitTimeRef     = useRef<number>(0);

  // Sync refs safely in effect
  useEffect(() => {
    watchIdRef.current          = watchId;
    isAuthRef.current           = isAuthenticated;
    isSharingRef.current        = isSharing;
    userIdRef.current           = user?.id ?? 0;
    ghostUntilRef.current       = ghostUntil;
    batterySaverModeRef.current = batterySaverMode;
  }, [watchId, isAuthenticated, isSharing, user?.id, ghostUntil, batterySaverMode]);

  useEffect(() => {
    if (!isAuthenticated || !isSharing) {
      // Stop watching if we have an active watch
      if (watchIdRef.current !== null) {
        navigator.geolocation?.clearWatch(watchIdRef.current);
        setWatchId(null);
      }
      return;
    }

    // Already watching — don't start again
    if (watchIdRef.current !== null) return;

    if (!navigator.geolocation) return;

    // Clear any previous error when starting a new watch
    setGeoError(null);

    const id = navigator.geolocation.watchPosition(
      (position) => {
        // Clear any previous error on success
        setGeoError(null);
        void (async () => {
          const battery = await getDeviceBattery();
          const payload = {
            userId:    userIdRef.current,
            latitude:  position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy:  position.coords.accuracy  ?? undefined,
            altitude:  position.coords.altitude  ?? undefined,
            speed:     position.coords.speed     ?? undefined,
            heading:   position.coords.heading   ?? undefined,
            ...battery,
          };
          setMyLocation(payload);

          const now = Date.now();
          const isGhostActive = ghostUntilRef.current !== null && now < ghostUntilRef.current;
          const isSaverActive = batterySaverModeRef.current || ((battery.batteryLevel ?? 100) <= 20 && !battery.isCharging);
          const minInterval = isSaverActive ? 60_000 : 8_000;

          // Only broadcast to friends if ghost mode is NOT active
          if (!isGhostActive) {
            if (now - lastEmitTimeRef.current >= minInterval) {
              lastEmitTimeRef.current = now;
              emit('location:update', payload);
            }
          }
        })();
      },
      (err) => {
        // Surface the error so the UI can show a permissions prompt or warning
        setGeoError(err);
        console.warn('Geolocation error:', err.message);
      },
      LOCATION_OPTIONS
    );

    setWatchId(id);

    return () => {
      navigator.geolocation?.clearWatch(id);
      setWatchId(null);
    };
  // Only re-run when auth status or sharing toggle changes — NOT on watchId change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isSharing]);

  return { isSharing, geoError };
}
