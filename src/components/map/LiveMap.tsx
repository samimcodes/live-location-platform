'use client';

/**
 * LiveMap
 * -------
 * Production-ready MapLibre GL JS + OpenStreetMap live-location map.
 *
 * Modes:
 *  A) Controlled  — parent calls useMapLibre() and passes the refs in as props.
 *     Used by MapPage so the page can also call fitToPoints / toggleFullscreen.
 *  B) Self-contained (default) — LiveMap calls useMapLibre() internally.
 *     Used by mini/embedded maps (saved-places, history, etc.).
 *
 * Features:
 *  • OSM tiles, no API key
 *  • Current-user marker + accuracy circle + pulse animation
 *  • Friend markers — colour-coded, online dot, popup
 *  • Saved-place markers layer
 *  • Real-time Zustand updates (fed by Socket.IO in SocketProvider)
 *  • Auto fit-bounds on first load
 *  • flyTo on focusUserId change
 *  • Loading / error / no-location states
 *  • Full cleanup on unmount
 */

import React, { useEffect, useRef, useCallback } from 'react';
import { useMapLibre, type UseMapLibreReturn } from '@/hooks/useMapLibre';
import { useLocationStore } from '@/store/useLocationStore';
import { useAppSelector } from '@/store/store';
import { useFriends } from '@/hooks/useFriends';
import {
  createMarkerElement,
  createAccuracyElement,
  friendGradient,
  ME_GRADIENT,
  buildMePopup,
  buildFriendPopup,
  isValidLatLng,
  type LatLng,
} from '@/lib/mapUtils';
import { cn } from '@/lib/utils';
import { MapPin, WifiOff, Loader2 } from 'lucide-react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyMarker = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyPopup = any;

const ACC_THRESHOLD_PX = 5;

// ── Saved-place overlay ───────────────────────────────────────────────────
export interface SavedPlacePoint {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  color?: string;
  icon?: string;
}

// ── Controlled-mode props (all optional) ─────────────────────────────────
type ControlledMapProps = Partial<
  Pick<UseMapLibreReturn, 'containerRef' | 'mapRef' | 'mapLoaded' | 'mapError' | 'flyTo' | 'fitToPoints'>
>;

export interface LiveMapProps extends ControlledMapProps {
  className?: string;
  /** Show friend markers. Default true. */
  showFriends?: boolean;
  /** Fly to this userId when set. */
  focusUserId?: number;
  /** Overlay saved-place markers. */
  savedPlaces?: SavedPlacePoint[];
  /** Suppress the loading overlay (for mini maps). */
  hideLoadingOverlay?: boolean;
  /** Map navigation controls (pass false for mini maps). */
  controls?: boolean;
  /** Initial zoom override. */
  zoom?: number;
}

export function LiveMap({
  className,
  showFriends = true,
  focusUserId,
  savedPlaces,
  hideLoadingOverlay = false,
  controls = true,
  zoom,
  // Controlled-mode overrides
  containerRef: externalContainerRef,
  mapRef: externalMapRef,
  mapLoaded: externalMapLoaded,
  mapError: externalMapError,
  flyTo: externalFlyTo,
  fitToPoints: externalFitToPoints,
}: LiveMapProps) {
  // ── Self-contained mode: create our own map instance ──────────────────
  const internal = useMapLibre({ controls, zoom });

  // Prefer external (controlled) values, fall back to internal
  const containerRef = externalContainerRef ?? internal.containerRef;
  const mapRef       = externalMapRef       ?? internal.mapRef;
  const mapLoaded    = externalMapLoaded    ?? internal.mapLoaded;
  const mapError     = externalMapError     ?? internal.mapError;
  const flyTo        = externalFlyTo        ?? internal.flyTo;
  const fitToPoints  = externalFitToPoints  ?? internal.fitToPoints;

  const { myLocation, friendsLocations } = useLocationStore();
  const { user } = useAppSelector((s) => s.auth);
  const { data: friends = [] } = useFriends();

  // ── Marker registries ─────────────────────────────────────────────────
  const myMarkerRef     = useRef<AnyMarker | null>(null);
  const myPopupRef      = useRef<AnyPopup | null>(null);
  const myAccuracyRef   = useRef<AnyMarker | null>(null);
  const myAccuracyPxRef = useRef<number>(0);
  const friendMarkersRef = useRef<Record<number, AnyMarker>>({});
  const friendPopupsRef  = useRef<Record<number, AnyPopup>>({});
  const placeMarkersRef  = useRef<Record<number, AnyMarker>>({});
  const lastFocusRef     = useRef<number | undefined>(undefined);

  // Cache { Marker, Popup } after first dynamic import
  const mglCacheRef = useRef<{ Marker: AnyMarker; Popup: AnyPopup } | null>(null);
  const getMgl = useCallback(async () => {
    if (mglCacheRef.current) return mglCacheRef.current;
    const mgl = await import('maplibre-gl');
    mglCacheRef.current = { Marker: mgl.Marker, Popup: mgl.Popup };
    return mglCacheRef.current;
  }, []);

  // ── My location marker + accuracy circle ────────────────────────────
  useEffect(() => {
    if (!mapLoaded || !myLocation) return;
    const { latitude, longitude, accuracy } = myLocation;
    if (!isValidLatLng(latitude, longitude)) return;

    getMgl().then(({ Marker, Popup }) => {
      if (!mapRef.current) return;

      if (!myMarkerRef.current) {
        const el = createMarkerElement({
          label: user?.name ?? 'You',
          letter: (user?.name?.charAt(0) ?? 'Y').toUpperCase(),
          gradient: ME_GRADIENT,
          isMe: true,
        });
        const popup = new Popup({ offset: [0, -42], closeButton: false, maxWidth: '200px' })
          .setHTML(buildMePopup(user?.name ?? 'You', myLocation.city, latitude, longitude));
        myPopupRef.current = popup;

        myMarkerRef.current = new Marker({ element: el, anchor: 'bottom' })
          .setLngLat([longitude, latitude])
          .setPopup(popup)
          .addTo(mapRef.current);
      } else {
        myMarkerRef.current.setLngLat([longitude, latitude]);
        myPopupRef.current?.setHTML(
          buildMePopup(user?.name ?? 'You', myLocation.city, latitude, longitude)
        );
      }

      // Accuracy circle
      if (accuracy && accuracy > 0 && mapRef.current) {
        const zoom = mapRef.current.getZoom();
        const mpp = (156543.03392 * Math.cos((latitude * Math.PI) / 180)) / Math.pow(2, zoom);
        const radiusPx = Math.max(20, Math.round(accuracy / mpp));

        if (!myAccuracyRef.current) {
          const accEl = createAccuracyElement();
          const d = radiusPx * 2;
          accEl.style.width = `${d}px`;
          accEl.style.height = `${d}px`;
          myAccuracyPxRef.current = radiusPx;
          myAccuracyRef.current = new Marker({ element: accEl, anchor: 'center' })
            .setLngLat([longitude, latitude])
            .addTo(mapRef.current);
        } else {
          myAccuracyRef.current.setLngLat([longitude, latitude]);
          if (Math.abs(radiusPx - myAccuracyPxRef.current) > ACC_THRESHOLD_PX) {
            const accEl = myAccuracyRef.current.getElement() as HTMLDivElement;
            const d = radiusPx * 2;
            accEl.style.width = `${d}px`;
            accEl.style.height = `${d}px`;
            myAccuracyPxRef.current = radiusPx;
          }
        }
      }
    });
  }, [mapLoaded, myLocation, user, getMgl, mapRef]);

  // ── Friend markers ───────────────────────────────────────────────────
  useEffect(() => {
    if (!mapLoaded || !showFriends) return;

    getMgl().then(({ Marker, Popup }) => {
      if (!mapRef.current) return;

      friendsLocations.forEach((loc, userId) => {
        const { latitude, longitude } = loc;
        if (!isValidLatLng(latitude, longitude)) return;

        const friend = friends.find((f) => f.id === userId);
        if (friend && !friend.sharingLocation) return;

        const name     = friend?.name ?? `User ${userId}`;
        const isOnline = friend?.isOnline ?? false;

        if (friendMarkersRef.current[userId]) {
          friendMarkersRef.current[userId].setLngLat([longitude, latitude]);
          friendPopupsRef.current[userId]?.setHTML(
            buildFriendPopup(name, isOnline, loc.city, latitude, longitude, loc.speed, loc.timestamp)
          );
          const dot = friendMarkersRef.current[userId]
            .getElement()
            ?.querySelector('.marker-online-dot') as HTMLSpanElement | null;
          if (dot) dot.className = `marker-online-dot ${isOnline ? 'is-online' : 'is-offline'}`;
        } else {
          const grad = friendGradient(userId);
          const el = createMarkerElement({ label: name, letter: name.charAt(0).toUpperCase(), gradient: grad, isOnline });
          const popup = new Popup({ offset: [0, -42], closeButton: false, maxWidth: '200px' })
            .setHTML(buildFriendPopup(name, isOnline, loc.city, latitude, longitude, loc.speed, loc.timestamp));
          friendPopupsRef.current[userId] = popup;
          friendMarkersRef.current[userId] = new Marker({ element: el, anchor: 'bottom' })
            .setLngLat([longitude, latitude])
            .setPopup(popup)
            .addTo(mapRef.current!);
        }
      });

      // Remove stale markers
      Object.keys(friendMarkersRef.current).forEach((key) => {
        const uid = Number(key);
        if (!friendsLocations.has(uid)) {
          friendMarkersRef.current[uid].remove();
          friendPopupsRef.current[uid]?.remove();
          delete friendMarkersRef.current[uid];
          delete friendPopupsRef.current[uid];
        }
      });
    });
  }, [mapLoaded, friendsLocations, friends, showFriends, getMgl, mapRef]);

  // ── Saved-place markers ──────────────────────────────────────────────
  useEffect(() => {
    if (!mapLoaded || !savedPlaces?.length) return;

    getMgl().then(({ Marker, Popup }) => {
      if (!mapRef.current) return;

      // Remove stale
      Object.keys(placeMarkersRef.current).forEach((key) => {
        const id = Number(key);
        if (!savedPlaces.find((p) => p.id === id)) {
          placeMarkersRef.current[id].remove();
          delete placeMarkersRef.current[id];
        }
      });

      savedPlaces.forEach((place) => {
        if (!isValidLatLng(place.latitude, place.longitude)) return;
        if (placeMarkersRef.current[place.id]) return;

        const bg = place.color ?? '#6366f1';
        const el = document.createElement('div');
        el.className = 'localink-place-marker';
        el.innerHTML = `
          <div class="place-pin" style="background:${bg};">
            <span class="place-icon">${place.icon ?? '📍'}</span>
          </div>
          <div class="place-arrow" style="background:${bg};"></div>`;

        const popup = new Popup({ offset: [0, -38], closeButton: false, maxWidth: '160px' })
          .setHTML(`<div style="padding:8px 10px;font-size:12px;font-weight:600">${place.name}</div>`);

        placeMarkersRef.current[place.id] = new Marker({ element: el, anchor: 'bottom' })
          .setLngLat([place.longitude, place.latitude])
          .setPopup(popup)
          .addTo(mapRef.current!);
      });
    });
  }, [mapLoaded, savedPlaces, getMgl, mapRef]);

  // ── flyTo focused user ───────────────────────────────────────────────
  useEffect(() => {
    if (!mapLoaded || !focusUserId || focusUserId === lastFocusRef.current) return;
    lastFocusRef.current = focusUserId;
    const loc = friendsLocations.get(focusUserId);
    if (loc && isValidLatLng(loc.latitude, loc.longitude)) {
      flyTo(loc.latitude, loc.longitude, 15);
      setTimeout(() => friendMarkersRef.current[focusUserId]?.togglePopup(), 900);
    }
  }, [mapLoaded, focusUserId, friendsLocations, flyTo]);

  useEffect(() => { if (!focusUserId) lastFocusRef.current = undefined; }, [focusUserId]);

  // ── Auto fit-bounds on first load ─────────────────────────────────────
  useEffect(() => {
    if (!mapLoaded || focusUserId) return;

    const pts: LatLng[] = [];
    if (myLocation && isValidLatLng(myLocation.latitude, myLocation.longitude)) {
      pts.push({ latitude: myLocation.latitude, longitude: myLocation.longitude });
    }
    friendsLocations.forEach((loc) => {
      if (isValidLatLng(loc.latitude, loc.longitude))
        pts.push({ latitude: loc.latitude, longitude: loc.longitude });
    });

    if (pts.length > 1) fitToPoints(pts, 80);
    else if (pts.length === 1) flyTo(pts[0].latitude, pts[0].longitude, 14);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapLoaded]);

  // ── Cleanup on unmount ────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      myMarkerRef.current?.remove();
      myAccuracyRef.current?.remove();
      myPopupRef.current?.remove();
      myMarkerRef.current    = null;
      myAccuracyRef.current  = null;
      myPopupRef.current     = null;

      Object.values(friendMarkersRef.current).forEach((m) => m.remove());
      Object.values(friendPopupsRef.current).forEach((p) => p.remove());
      Object.values(placeMarkersRef.current).forEach((m) => m.remove());
      friendMarkersRef.current = {};
      friendPopupsRef.current  = {};
      placeMarkersRef.current  = {};
    };
  }, []);

  // ── Error state ───────────────────────────────────────────────────────
  if (mapError) {
    return (
      <div className={cn('flex flex-col items-center justify-center bg-muted/50 rounded-2xl border border-border', className)}>
        <div className="text-center p-8 space-y-3">
          <WifiOff size={32} className="mx-auto text-muted-foreground/40" />
          <p className="text-sm font-semibold">Map failed to load</p>
          <p className="text-xs text-muted-foreground">
            WebGL may be disabled or the network is unavailable.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('relative rounded-2xl overflow-hidden', className)}>
      {/* Canvas — containerRef goes here */}
      <div ref={containerRef} className="w-full h-full" />

      {/* Loading overlay */}
      {!mapLoaded && !hideLoadingOverlay && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/80 backdrop-blur-sm rounded-2xl z-10">
          <div className="flex flex-col items-center gap-3">
            <Loader2 size={28} className="animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading map…</p>
          </div>
        </div>
      )}

      {/* No-location hint */}
      {mapLoaded && !myLocation && showFriends && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          <div className="flex items-center gap-2 bg-background/90 backdrop-blur-sm border border-border rounded-full px-4 py-2 shadow-lg">
            <MapPin size={13} className="text-muted-foreground shrink-0" />
            <p className="text-xs text-muted-foreground whitespace-nowrap">
              Enable location sharing to see your position
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
