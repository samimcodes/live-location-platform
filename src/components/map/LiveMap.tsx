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
  calculateDistanceKm,
  formatDistance,
  type LatLng,
  type RouteInfo,
} from '@/lib/mapUtils';
import { cn } from '@/lib/utils';
import { MapPin, WifiOff, Gauge, Navigation2 } from 'lucide-react';
import type { Marker as MglMarker, Popup as MglPopup } from 'maplibre-gl';

type AnyMarker = MglMarker;
type AnyPopup  = MglPopup;
type MarkerConstructor = typeof import('maplibre-gl').Marker;
type PopupConstructor  = typeof import('maplibre-gl').Popup;

const ACC_THRESHOLD_PX = 5;

// ── Types ────────────────────────────────────────────────────────────────
export interface SavedPlacePoint {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  color?: string | null;
  icon?: string | null;
}

export interface SearchMarkerPoint {
  latitude: number;
  longitude: number;
  name: string;
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
  searchMarker?: SearchMarkerPoint | null;
  routeInfo?: RouteInfo | null;
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
  searchMarker,
  routeInfo,
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
  const myMarkerRef        = useRef<AnyMarker | null>(null);
  const myPopupRef         = useRef<AnyPopup  | null>(null);
  const myPopupHtmlRef     = useRef<string>('');
  const myAccuracyRef      = useRef<AnyMarker | null>(null);
  const myAccuracyPxRef    = useRef<number>(0);
  const friendMarkersRef   = useRef<Record<number, AnyMarker>>({});
  const friendPopupsRef    = useRef<Record<number, AnyPopup >>({});
  const friendPopupHtmlRef = useRef<Record<number, string>>({});
  const placeMarkersRef    = useRef<Record<number, AnyMarker>>({});
  const searchMarkerRef    = useRef<AnyMarker | null>(null);
  const lastFocusRef       = useRef<number | undefined>(undefined);

  // Stable cache for { Marker, Popup }
  const mglCacheRef = useRef<{ Marker: MarkerConstructor; Popup: PopupConstructor } | null>(null);

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

      const userName = user?.name ?? 'You';
      const myHtml = buildMePopup(userName, myLocation.city, latitude, longitude);

      if (!myMarkerRef.current) {
        const el = createMarkerElement({
          label:    userName,
          letter:   userName.charAt(0).toUpperCase(),
          gradient: ME_GRADIENT,
          isMe:     true,
          isOnline: true,
        });

        const popup = new Popup({ offset: [0, -42], closeButton: false, maxWidth: '200px' })
          .setHTML(myHtml);
        myPopupHtmlRef.current = myHtml;
        myPopupRef.current = popup;

        myMarkerRef.current = new Marker({ element: el, anchor: 'bottom' })
          .setLngLat([longitude, latitude])
          .setPopup(popup)
          .addTo(mapRef.current);
      } else {
        myMarkerRef.current.setLngLat([longitude, latitude]);
        if (myHtml !== myPopupHtmlRef.current) {
          myPopupHtmlRef.current = myHtml;
          myPopupRef.current?.setHTML(myHtml);
        }
      }

      if (accuracy != null && accuracy > 0) {
        const currentZoom = mapRef.current.getZoom();
        const metersPerPixel =
          (156543.03392 * Math.cos((latitude * Math.PI) / 180)) / Math.pow(2, currentZoom);
        const radiusPx = Math.max(16, Math.round(accuracy / metersPerPixel));

        if (!myAccuracyRef.current) {
          const accEl = createAccuracyElement();
          accEl.style.width  = `${radiusPx * 2}px`;
          accEl.style.height = `${radiusPx * 2}px`;
          myAccuracyPxRef.current = radiusPx;

          myAccuracyRef.current = new Marker({ element: accEl, anchor: 'center' })
            .setLngLat([longitude, latitude])
            .addTo(mapRef.current);
        } else {
          myAccuracyRef.current.setLngLat([longitude, latitude]);
          if (Math.abs(radiusPx - myAccuracyPxRef.current) > ACC_THRESHOLD_PX) {
            const el = myAccuracyRef.current.getElement();
            el.style.width  = `${radiusPx * 2}px`;
            el.style.height = `${radiusPx * 2}px`;
            myAccuracyPxRef.current = radiusPx;
          }
        }
      } else if (myAccuracyRef.current) {
        myAccuracyRef.current.remove();
        myAccuracyRef.current = null;
      }
    });
  }, [mapLoaded, myLocation, user, getMgl, mapRef]);

  // ── Friend markers ────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapLoaded || !showFriends) return;

    getMgl().then(({ Marker, Popup }) => {
      if (!mapRef.current) return;

      friendsLocations.forEach((loc, userId) => {
        const { latitude, longitude } = loc;
        if (!isValidLatLng(latitude, longitude)) return;

        const friend   = friends.find((f) => f.id === userId);
        if (friend && !friend.sharingLocation) {
          if (friendMarkersRef.current[userId]) {
            friendMarkersRef.current[userId].remove();
            friendPopupsRef.current[userId]?.remove();
            delete friendMarkersRef.current[userId];
            delete friendPopupsRef.current[userId];
            delete friendPopupHtmlRef.current[userId];
          }
          return;
        }

        const name     = friend?.name    ?? `User ${userId}`;
        const isOnline = friend?.isOnline ?? false;

        let distStr: string | undefined;
        if (myLocation && isValidLatLng(myLocation.latitude, myLocation.longitude)) {
          const d = calculateDistanceKm(myLocation.latitude, myLocation.longitude, latitude, longitude);
          distStr = formatDistance(d);
        }

        if (friendMarkersRef.current[userId]) {
          friendMarkersRef.current[userId].setLngLat([longitude, latitude]);
          const newHtml = buildFriendPopup(name, isOnline, loc.city, latitude, longitude, loc.speed, loc.timestamp, distStr);
          if (newHtml !== friendPopupHtmlRef.current[userId]) {
            friendPopupHtmlRef.current[userId] = newHtml;
            friendPopupsRef.current[userId]?.setHTML(newHtml);
          }
          const dot = friendMarkersRef.current[userId]
            .getElement()
            ?.querySelector('.marker-online-dot') as HTMLSpanElement | null;
          if (dot) dot.className = `marker-online-dot ${isOnline ? 'is-online' : 'is-offline'}`;
        } else {
          const grad   = friendGradient(userId);
          const el     = createMarkerElement({ label: name, letter: name.charAt(0).toUpperCase(), gradient: grad, isOnline });
          const html   = buildFriendPopup(name, isOnline, loc.city, latitude, longitude, loc.speed, loc.timestamp, distStr);
          friendPopupHtmlRef.current[userId] = html;
          const popup  = new Popup({ offset: [0, -42], closeButton: false, maxWidth: '240px' })
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
  }, [mapLoaded, friendsLocations, friends, showFriends, getMgl, myLocation, mapRef]);

  // ── Saved-place markers ───────────────────────────────────────────────
  useEffect(() => {
    if (!mapLoaded) return;

    getMgl().then(({ Marker, Popup }) => {
      if (!mapRef.current) return;

      if (!savedPlaces?.length) {
        Object.values(placeMarkersRef.current).forEach((m) => m.remove());
        placeMarkersRef.current = {};
        return;
      }

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
        if (placeMarkersRef.current[place.id]) return;

        const el = createPlaceMarkerElement({
          color: place.color ?? 'var(--primary)',
          icon:  place.icon ?? '📍',
          name:  place.name,
        });

        const safeName = place.name
          .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const popup = new Popup({ offset: [0, -38], closeButton: false, maxWidth: '180px' })
          .setHTML(`<div style="padding:8px 12px;font-size:12px;font-weight:700;color:var(--foreground)">📍 ${safeName}</div>`);

        placeMarkersRef.current[place.id] = new Marker({ element: el, anchor: 'bottom' })
          .setLngLat([place.longitude, place.latitude])
          .setPopup(popup)
          .addTo(mapRef.current!);
      });
    });
  }, [mapLoaded, savedPlaces, getMgl, mapRef]);

  // ── Search dropped pin ────────────────────────────────────────────────
  useEffect(() => {
    if (!mapLoaded) return;

    getMgl().then(({ Marker, Popup }) => {
      if (!mapRef.current) return;

      if (!searchMarker) {
        searchMarkerRef.current?.remove();
        searchMarkerRef.current = null;
        return;
      }

      if (searchMarkerRef.current) {
        searchMarkerRef.current.setLngLat([searchMarker.longitude, searchMarker.latitude]);
      } else {
        const el = createPlaceMarkerElement({
          color: '#ef4444',
          icon: '📍',
          name: searchMarker.name,
        });
        const popup = new Popup({ offset: [0, -38], closeButton: false })
          .setHTML(`<div style="padding:8px 12px;font-size:12px;font-weight:700">🔍 ${searchMarker.name}</div>`);

        searchMarkerRef.current = new Marker({ element: el, anchor: 'bottom' })
          .setLngLat([searchMarker.longitude, searchMarker.latitude])
          .setPopup(popup)
          .addTo(mapRef.current);
      }
    });
  }, [mapLoaded, searchMarker, getMgl, mapRef]);

  // ── Route Polyline Layer (OSRM Live Directions) ───────────────────────
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;
    const map = mapRef.current;

    const sourceId = 'route-source';
    const casingId = 'route-layer-casing';
    const lineId   = 'route-layer';

    if (!routeInfo || routeInfo.coordinates.length < 2) {
      if (map.getLayer(lineId))   map.removeLayer(lineId);
      if (map.getLayer(casingId)) map.removeLayer(casingId);
      if (map.getSource(sourceId)) map.removeSource(sourceId);
      return;
    }

    const geojsonData = {
      type: 'Feature' as const,
      properties: {},
      geometry: {
        type: 'LineString' as const,
        coordinates: routeInfo.coordinates,
      },
    };

    const source = map.getSource(sourceId) as { setData: (data: unknown) => void } | undefined;
    if (source) {
      source.setData(geojsonData);
    } else {
      map.addSource(sourceId, {
        type: 'geojson',
        data: geojsonData,
      });

      map.addLayer({
        id: casingId,
        type: 'line',
        source: sourceId,
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': '#1e1b4b',
          'line-width': 8,
          'line-opacity': 0.6,
        },
      });

      map.addLayer({
        id: lineId,
        type: 'line',
        source: sourceId,
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': '#6366f1',
          'line-width': 4,
          'line-opacity': 0.95,
        },
      });
    }
  }, [mapLoaded, routeInfo, mapRef]);

  // ── flyTo on focusUserId ──────────────────────────────────────────────
  useEffect(() => {
    if (!mapLoaded || !focusUserId || focusUserId === lastFocusRef.current) return;
    lastFocusRef.current = focusUserId;
    const loc = friendsLocations.get(focusUserId);
    if (loc && isValidLatLng(loc.latitude, loc.longitude)) {
      flyTo(loc.latitude, loc.longitude, 15);
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

    if (pts.length > 1)        fitToPoints(pts, 80);
    else if (pts.length === 1) flyTo(pts[0].latitude, pts[0].longitude, 14);
  }, [mapLoaded]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Cleanup on unmount ────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      myMarkerRef.current?.remove();
      myAccuracyRef.current?.remove();
      myPopupRef.current?.remove();
      searchMarkerRef.current?.remove();
      myMarkerRef.current   = null;
      myAccuracyRef.current = null;
      myPopupRef.current    = null;
      searchMarkerRef.current = null;

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

  const speedKmh = myLocation?.speed != null && myLocation.speed > 0
    ? Math.round(myLocation.speed * 3.6)
    : 0;

  return (
    <div className={cn('relative rounded-2xl overflow-hidden', className)}>
      {/* Map canvas */}
      <div ref={containerRef} className="w-full h-full" />

      {/* ── Overlay controls (floating inside canvas, top bar) ──── */}
      {overlayControls && mapLoaded && (
        <div className="absolute top-0 left-0 right-0 z-20 pointer-events-none">
          <div className="m-3 pointer-events-auto rounded-2xl overflow-hidden
            bg-card/90 dark:bg-card/85 backdrop-blur-2xl
            border border-border/70 shadow-xl shadow-black/10">
            <MapControls {...overlayControls} />
          </div>
        </div>
      )}

      {/* ── Live Speedometer & Compass HUD (Bottom-Left) ────────── */}
      {mapLoaded && myLocation && (
        <div className="absolute bottom-6 left-4 z-20 pointer-events-none hidden sm:flex items-center gap-2">
          <div className="pointer-events-auto flex items-center gap-3 px-3.5 py-2 rounded-2xl bg-card/85 backdrop-blur-2xl border border-border/70 shadow-xl">
            <div className="flex items-center gap-1.5">
              <Gauge size={15} className="text-primary animate-pulse" />
              <span className="text-xs font-mono font-bold text-foreground tabular-nums">
                {speedKmh} <span className="text-[10px] font-normal text-muted-foreground">km/h</span>
              </span>
            </div>
            {myLocation.heading != null && (
              <div className="flex items-center gap-1 border-l border-border/50 pl-2.5">
                <Navigation2
                  size={13}
                  className="text-chart-5 transition-transform duration-300"
                  style={{ transform: `rotate(${myLocation.heading}deg)` }}
                />
                <span className="text-[10px] font-mono font-semibold text-muted-foreground tabular-nums">
                  {Math.round(myLocation.heading)}°
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Loading skeleton ──────────────────────────────────────── */}
      {!mapLoaded && !hideLoadingOverlay && (
        <div className="absolute inset-0 z-10 rounded-2xl overflow-hidden bg-muted">
          <div className="absolute inset-0 grid grid-cols-4 grid-rows-3 opacity-30">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="border border-muted-foreground/10 animate-pulse"
                style={{ animationDelay: `${(i % 4) * 120}ms` }}
              />
            ))}
          </div>
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
        <div className="absolute bottom-20 lg:bottom-10 left-1/2 -translate-x-1/2 z-10 pointer-events-none max-w-[min(90%,20rem)]">
          <div className="flex items-center gap-2 bg-background/90 backdrop-blur-sm border border-border/60 rounded-full px-4 py-2 shadow-lg">
            <MapPin size={12} className="text-muted-foreground shrink-0" />
            <p className="text-xs text-muted-foreground">
              Enable location sharing to see your position
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
