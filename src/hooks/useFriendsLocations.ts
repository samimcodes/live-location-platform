'use client';

/**
 * useFriendsLocations
 * --------------------
 * Hydrates the Zustand `friendsLocations` Map on mount by calling the REST
 * endpoint `GET /location/friends`, then keeps it live via Socket.IO events
 * that are already wired in SocketProvider (`location:receive`, `friend:offline`).
 *
 * This hook should be called once — inside the MapPage component — so that
 * the initial REST hydration only runs when the map is actually viewed,
 * not on every dashboard page.
 *
 * The hook is idempotent: calling it multiple times is safe.
 */

import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { useLocationStore, type LocationData } from '@/store/useLocationStore';
import { useAppSelector } from '@/store/store';

interface FriendLocationResponse {
  userId: number;
  latitude: number;
  longitude: number;
  accuracy?: number;
  speed?: number;
  heading?: number;
  address?: string;
  city?: string;
  country?: string;
  updatedAt: string;
  user: {
    id: number;
    name: string;
    avatar?: string | null;
    isOnline: boolean;
    sharingLocation: boolean;
  };
}

export function useFriendsLocations() {
  const { isAuthenticated } = useAppSelector((s) => s.auth);
  const updateFriendLocation = useLocationStore((s) => s.updateFriendLocation);
  const hydrated = useRef(false);

  // ── REST hydration (runs once per mount when authenticated) ──────────────
  const { data, isLoading, error } = useQuery({
    queryKey: ['friends-locations-initial'],
    queryFn: async () => {
      const { data } = await api.get<{ data: FriendLocationResponse[] }>('/location/friends');
      return data.data;
    },
    enabled: isAuthenticated,
    // Only fetch once — socket keeps it live afterwards
    staleTime: Infinity,
    retry: 2,
  });

  // Push the REST snapshot into Zustand whenever data arrives
  useEffect(() => {
    if (!data || hydrated.current) return;
    hydrated.current = true;

    data.forEach((entry) => {
      if (!entry.user.sharingLocation) return;

      const loc: LocationData = {
        userId: entry.userId,
        latitude: entry.latitude,
        longitude: entry.longitude,
        accuracy: entry.accuracy,
        speed: entry.speed,
        heading: entry.heading,
        address: entry.address,
        city: entry.city,
        // Use updatedAt as a string timestamp so the map can show "last seen"
        timestamp: entry.updatedAt,
      };
      updateFriendLocation(loc);
    });
  }, [data, updateFriendLocation]);

  return { isLoading, error, snapshotCount: data?.length ?? 0 };
}
