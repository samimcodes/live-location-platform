'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useLocationStore } from '@/store/useLocationStore';
import { useAppSelector } from '@/store/store';
import { useFriends } from '@/hooks/useFriends';
import { cn } from '@/lib/utils';

// We avoid importing mapbox-gl types at top level to prevent SSR issues.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MapboxInstance = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MarkerInstance = any;

interface LiveMapProps {
  className?: string;
  showFriends?: boolean;
  focusUserId?: number;
}

export function LiveMap({ className, showFriends = true, focusUserId }: LiveMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapboxInstance>(null);
  const myMarkerRef = useRef<MarkerInstance>(null);
  // Use a plain object as a marker registry to avoid JS Map / mapbox Map name collision
  const friendMarkersRef = useRef<Record<number, MarkerInstance>>({});

  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);

  const { myLocation, friendsLocations } = useLocationStore();
  const { user } = useAppSelector((s) => s.auth);
  const { data: friends = [] } = useFriends();

  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? '';

  // ── Init map ───────────────────────────────────────────────
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;
    if (!token || token === 'pk.your_mapbox_public_token_here') {
      setMapError(true);
      return;
    }

    let mounted = true;

    import('mapbox-gl').then((mgl) => {
      if (!mounted || !mapContainer.current) return;
      mgl.default.accessToken = token;

      try {
        const m = new mgl.default.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/streets-v12',
          center: [90.4125, 23.8103],
          zoom: 11,
        });
        mapRef.current = m;
        m.addControl(new mgl.default.NavigationControl(), 'top-right');
        m.addControl(
          new mgl.default.GeolocateControl({
            positionOptions: { enableHighAccuracy: true },
            trackUserLocation: true,
            showUserHeading: true,
          }),
          'top-right'
        );
        m.on('load', () => { if (mounted) setMapLoaded(true); });
      } catch {
        if (mounted) setMapError(true);
      }
    }).catch(() => { if (mounted) setMapError(true); });

    return () => {
      mounted = false;
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
      myMarkerRef.current = null;
      friendMarkersRef.current = {};
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Marker helper ──────────────────────────────────────────
  const createMarkerEl = useCallback((name: string, isMe: boolean, letter: string, gradient: string): HTMLDivElement => {
    const el = document.createElement('div');
    el.className = 'localink-marker';
    el.innerHTML = `
      <div class="marker-wrapper">
        <div class="marker-pin" style="background:${gradient};border:3px solid white;box-shadow:0 4px 12px rgba(0,0,0,0.3);">
          <span class="marker-letter">${letter}</span>
          ${isMe ? '<span class="marker-pulse"></span>' : ''}
        </div>
        <div class="marker-label">${name}</div>
        <div class="marker-arrow" style="background:${gradient}"></div>
      </div>`;
    return el;
  }, []);

  // ── My marker ──────────────────────────────────────────────
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || !myLocation) return;
    const { latitude, longitude } = myLocation;
    import('mapbox-gl').then((mgl) => {
      if (!mapRef.current) return;
      if (!myMarkerRef.current) {
        const el = createMarkerEl('You', true, user?.name?.charAt(0).toUpperCase() ?? 'M', 'linear-gradient(135deg,#6366f1,#8b5cf6)');
        myMarkerRef.current = new mgl.default.Marker({ element: el, anchor: 'bottom' })
          .setLngLat([longitude, latitude])
          .setPopup(new mgl.default.Popup({ offset: 25 }).setHTML(
            `<div style="padding:8px"><p style="font-weight:600;margin:0 0 4px">${user?.name ?? 'You'}</p><p style="color:#6b7280;font-size:12px;margin:0">${myLocation.city ?? `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`}</p></div>`
          ))
          .addTo(mapRef.current);
      } else {
        myMarkerRef.current.setLngLat([longitude, latitude]);
      }
      if (!focusUserId) mapRef.current.easeTo({ center: [longitude, latitude], zoom: 14 });
    });
  }, [mapLoaded, myLocation, user, createMarkerEl, focusUserId]);

  // ── Friend markers ─────────────────────────────────────────
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || !showFriends) return;
    const GRADS = [
      'linear-gradient(135deg,#10b981,#059669)',
      'linear-gradient(135deg,#3b82f6,#2563eb)',
      'linear-gradient(135deg,#f59e0b,#d97706)',
      'linear-gradient(135deg,#ec4899,#db2777)',
      'linear-gradient(135deg,#06b6d4,#0891b2)',
    ];
    import('mapbox-gl').then((mgl) => {
      if (!mapRef.current) return;
      friendsLocations.forEach((loc, userId) => {
        const friend = friends.find((f) => f.id === userId);
        if (!friend?.sharingLocation) return;
        const { latitude, longitude } = loc;
        const grad = GRADS[userId % GRADS.length];
        if (friendMarkersRef.current[userId]) {
          friendMarkersRef.current[userId].setLngLat([longitude, latitude]);
        } else {
          const el = createMarkerEl(friend.name, false, friend.name.charAt(0).toUpperCase(), grad);
          const marker = new mgl.default.Marker({ element: el, anchor: 'bottom' })
            .setLngLat([longitude, latitude])
            .setPopup(new mgl.default.Popup({ offset: 25 }).setHTML(
              `<div style="padding:8px"><p style="font-weight:600;margin:0 0 4px">${friend.name}</p><p style="color:${friend.isOnline ? '#10b981' : '#9ca3af'};font-size:11px;margin:0">${friend.isOnline ? '● Online' : '○ Offline'}</p></div>`
            ))
            .addTo(mapRef.current!);
          friendMarkersRef.current[userId] = marker;
        }
      });
      // Remove stale markers
      Object.keys(friendMarkersRef.current).forEach((key) => {
        const uid = Number(key);
        if (!friendsLocations.has(uid)) {
          friendMarkersRef.current[uid].remove();
          delete friendMarkersRef.current[uid];
        }
      });
    });
  }, [mapLoaded, friendsLocations, friends, showFriends, createMarkerEl]);

  // ── Focus user ─────────────────────────────────────────────
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || !focusUserId) return;
    const loc = friendsLocations.get(focusUserId);
    if (loc) mapRef.current.flyTo({ center: [loc.longitude, loc.latitude], zoom: 15 });
  }, [mapLoaded, focusUserId, friendsLocations]);

  if (mapError) {
    return (
      <div className={cn('flex flex-col items-center justify-center bg-muted/50 rounded-2xl border border-border', className)}>
        <div className="text-center p-8">
          <p className="text-lg font-semibold mb-2">Map unavailable</p>
          <p className="text-sm text-muted-foreground">
            Set <code className="bg-muted px-1 rounded text-xs">NEXT_PUBLIC_MAPBOX_TOKEN</code> in <code className="bg-muted px-1 rounded text-xs">.env</code>
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
