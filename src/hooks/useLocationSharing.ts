'use client';

import { useEffect, useCallback } from 'react';
import { useSocketContext } from '@/components/SocketProvider';
import { useLocationStore } from '@/store/useLocationStore';
import { useAppSelector } from '@/store/store';

const LOCATION_INTERVAL_MS = 15_000; // 15 seconds

export function useLocationSharing() {
  const { emit } = useSocketContext();
  const { isSharing, setMyLocation, setWatchId, watchId } = useLocationStore();
  const { isAuthenticated } = useAppSelector((s) => s.auth);

  const startSharing = useCallback(() => {
    if (!navigator.geolocation) return;

    const id = navigator.geolocation.watchPosition(
      (position) => {
        const payload = {
          userId: 0, // will be overwritten on server
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy ?? undefined,
          altitude: position.coords.altitude ?? undefined,
          speed: position.coords.speed ?? undefined,
          heading: position.coords.heading ?? undefined,
        };
        setMyLocation(payload);
        emit('location:update', payload);
      },
      (err) => console.warn('Geolocation error:', err),
      { enableHighAccuracy: true, maximumAge: LOCATION_INTERVAL_MS, timeout: 10_000 }
    );
    setWatchId(id);
  }, [emit, setMyLocation, setWatchId]);

  const stopSharing = useCallback(() => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
  }, [watchId, setWatchId]);

  useEffect(() => {
    if (isAuthenticated && isSharing) {
      startSharing();
    } else {
      stopSharing();
    }
    return () => stopSharing();
  }, [isAuthenticated, isSharing, startSharing, stopSharing]);

  return { startSharing, stopSharing, isSharing };
}
