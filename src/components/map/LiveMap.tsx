'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useLocationStore } from '@/store/useLocationStore';
import { useAppSelector } from '@/store/store';
import { useFriends } from '@/hooks/useFriends';
import { cn } from '@/lib/utils';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? '';

interface LiveMapProps {
  className?: string;
  showFriends?: boolean;
  focusUserId?: number;
}

export function LiveMap({ className, showFriends = true, focusUserId }: LiveMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const myMarker = useRef<mapboxgl.Marker | null>(null);
  const friendMarkers = useRef<Map<number, mapboxgl.Marker>>(new Map());
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);

  const { myLocation, friendsLocations } = useLocationStore();
  const { user } = useAppSelector((s) => s.auth);
  const { data: friends = [] } = useFriends();

  // ── Init map ───────────────────────────────────────────────
  useEffect(() => {
    if (!mapContainer.current || map.current) return;
    if (!mapboxgl.accessToken) {
      setMapError(true);
      return;
    }

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [90.4125, 23.8103], // Default: Dhaka
        zoom: 11,
      });

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
      map.current.addControl(
        new mapboxgl.GeolocateControl({
          positionOptions: { enableHighAccuracy: true },
          trackUserLocation: true,
          showUserHeading: true,
        }),
        'top-right'
      );

      map.current.on('load', () => setMapLoaded(true));
    } catch {
      setMapError(true);
    }

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // ── Create custom HTML marker element ──────────────────────
  const createMarkerEl = useCallback((
    name: string,
    isMe: boolean,
    avatarLetter: string,
    gradient: string
  ): HTMLDivElement => {
    const el = document.createElement('div');
    el.className = 'localink-marker';
    el.innerHTML = `
      <div class="marker-wrapper">
        <div class="marker-pin" style="background: ${gradient}; border: 3px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.3);">
          <span class="marker-letter">${avatarLetter}</span>
          ${isMe ? '<span class="marker-pulse"></span>' : ''}
        </div>
        <div class="marker-label">${name}</div>
        <div class="marker-arrow" style="background: ${gradient}"></div>
      </div>
    `;
    return el;
  }, []);

  // ── Update my marker ───────────────────────────────────────
  useEffect(() => {
    if (!mapLoaded || !map.current || !myLocation) return;

    const { latitude, longitude } = myLocation;

    if (!myMarker.current) {
      const el = createMarkerEl(
        'You',
        true,
        user?.name?.charAt(0).toUpperCase() ?? 'M',
        'linear-gradient(135deg, #6366f1, #8b5cf6)'
      );
      myMarker.current = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([longitude, latitude])
        .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(`
          <div style="padding: 8px; min-width: 120px">
            <p style="font-weight: 600; margin: 0 0 4px">${user?.name ?? 'You'}</p>
            <p style="color: #6b7280; font-size: 12px; margin: 0">
              ${myLocation.city ?? `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`}
            </p>
          </div>
        `))
        .addTo(map.current!);
    } else {
      myMarker.current.setLngLat([longitude, latitude]);
    }

    if (!focusUserId) {
      map.current.easeTo({ center: [longitude, latitude], zoom: 14 });
    }
  }, [mapLoaded, myLocation, user, createMarkerEl, focusUserId]);

  // ── Update friend markers ──────────────────────────────────
  useEffect(() => {
    if (!mapLoaded || !map.current || !showFriends) return;

    const GRADIENTS = [
      'linear-gradient(135deg, #10b981, #059669)',
      'linear-gradient(135deg, #3b82f6, #2563eb)',
      'linear-gradient(135deg, #f59e0b, #d97706)',
      'linear-gradient(135deg, #ec4899, #db2777)',
      'linear-gradient(135deg, #06b6d4, #0891b2)',
    ];

    friendsLocations.forEach((loc, userId) => {
      const friend = friends.find((f) => f.id === userId);
      if (!friend?.sharingLocation) return;

      const gradient = GRADIENTS[userId % GRADIENTS.length];
      const { latitude, longitude } = loc;

      if (friendMarkers.current.has(userId)) {
        friendMarkers.current.get(userId)!.setLngLat([longitude, latitude]);
      } else {
        const el = createMarkerEl(
          friend.name,
          false,
          friend.name.charAt(0).toUpperCase(),
          gradient
        );
        const marker = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
          .setLngLat([longitude, latitude])
          .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(`
            <div style="padding: 8px; min-width: 140px">
              <p style="font-weight: 600; margin: 0 0 4px">${friend.name}</p>
              <p style="color: #6b7280; font-size: 12px; margin: 0 0 2px">
                ${loc.city ?? `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`}
              </p>
              <p style="color: ${friend.isOnline ? '#10b981' : '#9ca3af'}; font-size: 11px; margin: 0">
                ${friend.isOnline ? '● Online' : '○ Offline'}
              </p>
            </div>
          `))
          .addTo(map.current!);
        friendMarkers.current.set(userId, marker);
      }
    });

    // Remove markers for friends no longer in store
    friendMarkers.current.forEach((marker, uid) => {
      if (!friendsLocations.has(uid)) {
        marker.remove();
        friendMarkers.current.delete(uid);
      }
    });
  }, [mapLoaded, friendsLocations, friends, showFriends, createMarkerEl]);

  // ── Auto-fit bounds when focusUserId is set ────────────────
  useEffect(() => {
    if (!mapLoaded || !map.current || !focusUserId) return;
    const loc = friendsLocations.get(focusUserId);
    if (loc) {
      map.current.flyTo({ center: [loc.longitude, loc.latitude], zoom: 15 });
    }
  }, [mapLoaded, focusUserId, friendsLocations]);

  if (mapError) {
    return (
      <div className={cn('flex flex-col items-center justify-center bg-muted/50 rounded-2xl border border-border', className)}>
        <div className="text-center p-8">
          <p className="text-lg font-semibold text-foreground mb-2">Map unavailable</p>
          <p className="text-sm text-muted-foreground">
            Set <code className="bg-muted px-1 rounded text-xs">NEXT_PUBLIC_MAPBOX_TOKEN</code> in your <code className="bg-muted px-1 rounded text-xs">.env</code> file.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('relative rounded-2xl overflow-hidden', className)}>
      <div ref={mapContainer} className="w-full h-full" />
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            <p className="text-sm text-muted-foreground">Loading map…</p>
          </div>
        </div>
      )}
    </div>
  );
}
