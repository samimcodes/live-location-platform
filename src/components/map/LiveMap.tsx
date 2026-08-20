'use client';

/**
 * LiveMap
 * -------
 * Production-ready MapLibre GL JS + OpenStreetMap live-location map.
 *
 * Modes:
 *  A) Controlled  — parent passes containerRef/mapRef/mapLoaded/mapError/flyTo/fitToPoints.
 *     The internal useMapLibre() still runs but its map IS NOT created (controlled guard).
 *     Used by MapPage so the page owns the map lifecycle.
 *  B) Self-contained (default) — all refs managed internally.
 *     Used for mini/embedded maps.
 *
 * Fixes applied vs first version:
 *  • Controlled-mode guard: internal hook only creates a map when no external ref is given.
 *  • mapRef removed from useEffect dependency arrays (refs are stable objects, not reactive values).
 *  • maplibre-gl CSS imported once via dynamic import side-effect.
 *  • Stale-closure-safe getMgl via useRef (not re-created on every render).
 */

import React, { useEffect, useRef, useCallback } from 'react';
import { useMapLibre, type UseMapLibreReturn } from '@/hooks/useMapLibre';
import { useLocationStore } from '@/store/useLocationStore';
import { useAppSelector } from '@/store/store';
import { useFriends } from '@/hooks/useFriends';
import { MapControls, type MapControlsProps } from '@/components/map/MapControls';
import {
  createMarkerElement,
  createAccuracyElement,
  createPlaceMarkerElement,
  friendGradient,
  ME_GRADIENT,
  buildMePopup,
  buildFriendPopup,
  isValidLatLng,
  type LatLng,
} from '@/lib/mapUtils';
import { cn } from '@/lib/utils';
import { MapPin, WifiOff } from 'lucide-react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyMarker = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyPopup  = any;

const ACC_THRESHOLD_PX = 5;

// ── Types ────────────────────────────────────────────────────────────────
export interface SavedPlacePoint {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  color?: string;
  icon?: string;
}

// All controlled-mode props are optional so the component works in both modes
type ControlledProps = Partial<
  Pick<
    UseMapLibreReturn,
    'containerRef' | 'mapRef' | 'mapLoaded' | 'mapError' | 'flyTo' | 'fitToPoints'
  >
>;

export interface LiveMapProps extends ControlledProps {
  className?: string;
  showFriends?: boolean;
  focusUserId?: number;
  savedPlaces?: SavedPlacePoint[];
  hideLoadingOverlay?: boolean;
  controls?: boolean;
  zoom?: number;
  /** Props for the overlay MapControls. When provided, controls render inside the canvas. */
  overlayControls?: Omit<MapControlsProps, 'className'>;
}

export function LiveMap({
  className,
  showFriends = true,
  focusUserId,
  savedPlaces,
  hideLoadingOverlay = false,
  controls = true,
  zoom,
  overlayControls,
  containerRef: extContainerRef,
  mapRef:       extMapRef,
  mapLoaded:    extMapLoaded,
  mapError:     extMapError,
  flyTo:        extFlyTo,
  fitToPoints:  extFitToPoints,
}: LiveMapProps) {
  // When running in controlled mode the parent already owns a map instance.
  // We still call the hook unconditionally (Rules of Hooks) but pass
  // `skipInit: true` so it does NOT create a second Map object.
  const isControlled = extContainerRef !== undefined;
  const internal = useMapLibre({ controls, zoom, skipInit: isControlled });

  const containerRef = extContainerRef ?? internal.containerRef;
  const mapRef       = extMapRef       ?? internal.mapRef;
  const mapLoaded    = extMapLoaded    ?? internal.mapLoaded;
  const mapError     = extMapError     ?? internal.mapError;
  const flyTo        = extFlyTo        ?? internal.flyTo;
  const fitToPoints  = extFitToPoints  ?? internal.fitToPoints;

  const { myLocation, friendsLocations } = useLocationStore();
  const { user }                         = useAppSelector((s) => s.auth);
  const { data: friends = [] }           = useFriends();

  // ── Marker registries ────────────────────────────────────────────────
  const myMarkerRef      = useRef<AnyMarker | null>(null);
  const myPopupRef       = useRef<AnyPopup  | null>(null);
  const myPopupHtmlRef   = useRef<string>(''); // cache last HTML to skip redundant setHTML
  const myAccuracyRef    = useRef<AnyMarker | null>(null);
  const myAccuracyPxRef  = useRef<number>(0);
  const friendMarkersRef = useRef<Record<number, AnyMarker>>({});
  const friendPopupsRef  = useRef<Record<number, AnyPopup >>({});
  const friendPopupHtmlRef = useRef<Record<number, string>>({}); // cache last HTML to skip redundant setHTML
  const placeMarkersRef  = useRef<Record<number, AnyMarker>>({});
  const lastFocusRef     = useRef<number | undefined>(undefined);

  // Stable cache for { Marker, Popup } — imported once, reused forever
  const mglCacheRef = useRef<{ Marker: AnyMarker; Popup: AnyPopup } | null>(null);

  // getMgl is stored in a ref so it's never recreated and never stale
  const getMglRef = useRef(async () => {
    if (mglCacheRef.current) return mglCacheRef.current;
    const mgl = await import('maplibre-gl');
    mglCacheRef.current = { Marker: mgl.Marker, Popup: mgl.Popup };
    return mglCacheRef.current;
  });
  const getMgl = useCallback(() => getMglRef.current(), []);

  // ── My location marker + accuracy circle ─────────────────────────────
  useEffect(() => {
    if (!mapLoaded || !myLocation) return;
    const { latitude, longitude, accuracy } = myLocation;
    if (!isValidLatLng(latitude, longitude)) return;
    if (!mapRef.current) return;

    getMgl().then(({ Marker, Popup }) => {
      if (!mapRef.current) return;

      // Create marker on first appearance
      if (!myMarkerRef.current) {
        const el = createMarkerElement({
          label: user?.name ?? 'You',
          letter: (user?.name?.charAt(0) ?? 'Y').toUpperCase(),
          gradient: ME_GRADIENT,
          isMe: true,
        });
        const html = buildMePopup(user?.name ?? 'You', myLocation.city, latitude, longitude);
        myPopupHtmlRef.current = html;
        const popup = new Popup({ offset: [0, -42], closeButton: false, maxWidth: '200px' })
          .setHTML(html);
        myPopupRef.current = popup;
        myMarkerRef.current = new Marker({ element: el, anchor: 'bottom' })
          .setLngLat([longitude, latitude])
          .setPopup(popup)
          .addTo(mapRef.current);
      } else {
        // Update position
        myMarkerRef.current.setLngLat([longitude, latitude]);
        // Only rebuild popup HTML when content actually changes
        const newHtml = buildMePopup(user?.name ?? 'You', myLocation.city, latitude, longitude);
        if (newHtml !== myPopupHtmlRef.current) {
          myPopupHtmlRef.current = newHtml;
          myPopupRef.current?.setHTML(newHtml);
        }
      }

      // Accuracy circle
      if (accuracy && accuracy > 0) {
        const z   = mapRef.current.getZoom();
        const mpp = (156543.03392 * Math.cos((latitude * Math.PI) / 180)) / Math.pow(2, z);
        const rpx = Math.max(20, Math.round(accuracy / mpp));

        if (!myAccuracyRef.current) {
          const accEl = createAccuracyElement();
          accEl.style.width  = `${rpx * 2}px`;
          accEl.style.height = `${rpx * 2}px`;
          myAccuracyPxRef.current = rpx;
          myAccuracyRef.current = new Marker({ element: accEl, anchor: 'center' })
            .setLngLat([longitude, latitude])
            .addTo(mapRef.current);
        } else {
          myAccuracyRef.current.setLngLat([longitude, latitude]);
          if (Math.abs(rpx - myAccuracyPxRef.current) > ACC_THRESHOLD_PX) {
            const el = myAccuracyRef.current.getElement() as HTMLDivElement;
            el.style.width  = `${rpx * 2}px`;
            el.style.height = `${rpx * 2}px`;
            myAccuracyPxRef.current = rpx;
          }
        }
      }
    });
  // mapRef is intentionally excluded — it's a stable ref object, not reactive
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapLoaded, myLocation, user, getMgl]);

  // ── Friend markers ────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapLoaded || !showFriends) return;

    getMgl().then(({ Marker, Popup }) => {
      if (!mapRef.current) return;

      friendsLocations.forEach((loc, userId) => {
        const { latitude, longitude } = loc;
        if (!isValidLatLng(latitude, longitude)) return;

        const friend   = friends.find((f) => f.id === userId);
        if (friend && !friend.sharingLocation) return;

        const name     = friend?.name    ?? `User ${userId}`;
        const isOnline = friend?.isOnline ?? false;

        if (friendMarkersRef.current[userId]) {
          // Update existing marker
          friendMarkersRef.current[userId].setLngLat([longitude, latitude]);
          // Only rebuild popup HTML when content changed (avoids DOM teardown on every tick)
          const newHtml = buildFriendPopup(name, isOnline, loc.city, latitude, longitude, loc.speed, loc.timestamp);
          if (newHtml !== friendPopupHtmlRef.current[userId]) {
            friendPopupHtmlRef.current[userId] = newHtml;
            friendPopupsRef.current[userId]?.setHTML(newHtml);
          }
          const dot = friendMarkersRef.current[userId]
            .getElement()
            ?.querySelector('.marker-online-dot') as HTMLSpanElement | null;
          if (dot) dot.className = `marker-online-dot ${isOnline ? 'is-online' : 'is-offline'}`;
        } else {
          // Create new marker
          const grad   = friendGradient(userId);
          const el     = createMarkerElement({ label: name, letter: name.charAt(0).toUpperCase(), gradient: grad, isOnline });
          const html   = buildFriendPopup(name, isOnline, loc.city, latitude, longitude, loc.speed, loc.timestamp);
          friendPopupHtmlRef.current[userId] = html;
          const popup  = new Popup({ offset: [0, -42], closeButton: false, maxWidth: '200px' })
            .setHTML(html);
          friendPopupsRef.current[userId]  = popup;
          friendMarkersRef.current[userId] = new Marker({ element: el, anchor: 'bottom' })
            .setLngLat([longitude, latitude])
            .setPopup(popup)
            .addTo(mapRef.current!);
        }
      });

      // Remove markers whose userId is no longer in the Zustand Map
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
  // mapRef intentionally excluded — stable ref
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapLoaded, friendsLocations, friends, showFriends, getMgl]);

  // ── Saved-place markers ───────────────────────────────────────────────
  useEffect(() => {
    if (!mapLoaded || !savedPlaces?.length) return;

    getMgl().then(({ Marker, Popup }) => {
      if (!mapRef.current) return;

      // Remove stale place markers
      Object.keys(placeMarkersRef.current).forEach((key) => {
        const id = Number(key);
        if (!savedPlaces.find((p) => p.id === id)) {
          placeMarkersRef.current[id].remove();
          delete placeMarkersRef.current[id];
        }
      });

      savedPlaces.forEach((place) => {
        if (!isValidLatLng(place.latitude, place.longitude)) return;
        if (placeMarkersRef.current[place.id]) return; // already on map

        // Use the shared factory which sanitizes icon and color
        const el = createPlaceMarkerElement({
          color: place.color ?? 'var(--primary)',
          icon:  place.icon ?? '📍',
          name:  place.name,
        });

        // Sanitize place.name before injecting into popup innerHTML
        const safeName = place.name
          .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const popup = new Popup({ offset: [0, -38], closeButton: false, maxWidth: '160px' })
          .setHTML(`<div style="padding:8px 10px;font-size:12px;font-weight:600">${safeName}</div>`);

        placeMarkersRef.current[place.id] = new Marker({ element: el, anchor: 'bottom' })
          .setLngLat([place.longitude, place.latitude])
          .setPopup(popup)
          .addTo(mapRef.current!);
      });
    });
  // mapRef intentionally excluded
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapLoaded, savedPlaces, getMgl]);

  // ── flyTo on focusUserId ──────────────────────────────────────────────
  useEffect(() => {
    if (!mapLoaded || !focusUserId || focusUserId === lastFocusRef.current) return;
    lastFocusRef.current = focusUserId;
    const loc = friendsLocations.get(focusUserId);
    if (loc && isValidLatLng(loc.latitude, loc.longitude)) {
      flyTo(loc.latitude, loc.longitude, 15);
      // Clear the timer on cleanup so stale callbacks don't fire on unmount
      const timer = setTimeout(() => friendMarkersRef.current[focusUserId]?.togglePopup(), 900);
      return () => clearTimeout(timer);
    }
  }, [mapLoaded, focusUserId, friendsLocations, flyTo]);

  useEffect(() => {
    if (!focusUserId) lastFocusRef.current = undefined;
  }, [focusUserId]);

  // ── Auto fit-bounds when map first loads ──────────────────────────────
  useEffect(() => {
    if (!mapLoaded || focusUserId) return;

    const pts: LatLng[] = [];
    if (myLocation && isValidLatLng(myLocation.latitude, myLocation.longitude))
      pts.push({ latitude: myLocation.latitude, longitude: myLocation.longitude });
    friendsLocations.forEach((loc) => {
      if (isValidLatLng(loc.latitude, loc.longitude))
        pts.push({ latitude: loc.latitude, longitude: loc.longitude });
    });

    if (pts.length > 1)      fitToPoints(pts, 80);
    else if (pts.length === 1) flyTo(pts[0].latitude, pts[0].longitude, 14);
  // Run only when mapLoaded flips to true
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapLoaded]);

  // ── Cleanup on unmount ────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      myMarkerRef.current?.remove();
      myAccuracyRef.current?.remove();
      myPopupRef.current?.remove();
      myMarkerRef.current   = null;
      myAccuracyRef.current = null;
      myPopupRef.current    = null;

      Object.values(friendMarkersRef.current).forEach((m) => m.remove());
      Object.values(friendPopupsRef.current).forEach((p) => p.remove());
      Object.values(placeMarkersRef.current).forEach((m) => m.remove());
      friendMarkersRef.current  = {};
      friendPopupsRef.current   = {};
      friendPopupHtmlRef.current = {};
      placeMarkersRef.current   = {};
    };
  }, []);

  // ── Error state ───────────────────────────────────────────────────────
  if (mapError) {
    return (
      <div className={cn('flex items-center justify-center bg-muted/50 rounded-2xl border border-border', className)}>
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
      {/* Map canvas */}
      <div ref={containerRef} className="w-full h-full" />

      {/* ── Overlay controls (floating inside canvas, top bar) ──── */}
      {overlayControls && mapLoaded && (
        <div className="absolute top-0 left-0 right-0 z-20 pointer-events-none">
          <div className="m-3 pointer-events-auto rounded-xl overflow-hidden
            bg-card/80 dark:bg-card/75 backdrop-blur-xl
            border border-white/20 dark:border-white/10
            shadow-lg shadow-black/10">
            <MapControls {...overlayControls} />
          </div>
        </div>
      )}

      {/* ── Loading skeleton ──────────────────────────────────────── */}
      {!mapLoaded && !hideLoadingOverlay && (
        <div className="absolute inset-0 z-10 rounded-2xl overflow-hidden bg-muted">
          {/* Fake map tiles grid */}
          <div className="absolute inset-0 grid grid-cols-4 grid-rows-3 opacity-30">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="border border-muted-foreground/10 animate-pulse"
                style={{ animationDelay: `${(i % 4) * 120}ms` }}
              />
            ))}
          </div>
          {/* Fake roads */}
          <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
            <line x1="0" y1="40%" x2="100%" y2="35%" stroke="currentColor" strokeWidth="2" />
            <line x1="0" y1="65%" x2="100%" y2="70%" stroke="currentColor" strokeWidth="1.5" />
            <line x1="30%" y1="0" x2="25%" y2="100%" stroke="currentColor" strokeWidth="1.5" />
            <line x1="70%" y1="0" x2="72%" y2="100%" stroke="currentColor" strokeWidth="1" />
          </svg>
          {/* Spinner */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <div className="relative">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <MapPin size={22} className="text-primary" />
              </div>
              <div className="absolute inset-0 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">Loading map…</p>
          </div>
        </div>
      )}

      {/* ── No-location hint ─────────────────────────────────────── */}
      {mapLoaded && !myLocation && showFriends && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          <div className="flex items-center gap-2 bg-background/90 backdrop-blur-sm border border-border/60 rounded-full px-4 py-2 shadow-lg">
            <MapPin size={12} className="text-muted-foreground shrink-0" />
            <p className="text-xs text-muted-foreground whitespace-nowrap">
              Enable location sharing to see your position
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
