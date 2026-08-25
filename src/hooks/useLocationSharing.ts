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

export function useLocationSharing(): LocationSharingResult {
  const { emit } = useSocketContext();
  const { isSharing, setMyLocation, setWatchId, watchId, geoError, setGeoError } = useLocationStore();
  const { isAuthenticated, user } = useAppSelector((s) => s.auth);

  // Keep refs so callbacks never go stale without causing re-renders
  const watchIdRef   = useRef<number | null>(watchId);
  const isAuthRef    = useRef(isAuthenticated);
  const isSharingRef = useRef(isSharing);
  const userIdRef    = useRef<number>(user?.id ?? 0);

  // Sync refs on every render (no re-render side-effects)
  watchIdRef.current   = watchId;
  isAuthRef.current    = isAuthenticated;
  isSharingRef.current = isSharing;
  userIdRef.current    = user?.id ?? 0;

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
        const payload = {
          userId:    userIdRef.current,
          latitude:  position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy:  position.coords.accuracy  ?? undefined,
          altitude:  position.coords.altitude  ?? undefined,
          speed:     position.coords.speed     ?? undefined,
          heading:   position.coords.heading   ?? undefined,
        };
        setMyLocation(payload);
        emit('location:update', payload);
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
