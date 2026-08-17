'use client';

/**
 * useMapLibre
 * -----------
 * Encapsulates the MapLibre GL JS lifecycle:
 *  - Dynamic import (prevents SSR crash)
 *  - Map initialisation with OSM tiles
 *  - NavigationControl
 *  - flyTo / fitToPoints / toggleFullscreen helpers
 *  - Full cleanup on unmount
 *
 * `skipInit` — pass true when a parent component already owns the map
 * instance and is passing refs down to LiveMap in "controlled mode".
 * The hook still runs (Rules of Hooks) but never creates a Map object,
 * preventing the double-map bug.
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  OSM_STYLE,
  DEFAULT_CENTER,
  DEFAULT_ZOOM,
  computeBounds,
  type LatLng,
} from '@/lib/mapUtils';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MapLibreMap    = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MapLibreModule = any;

export interface UseMapLibreOptions {
  center?: [number, number];
  zoom?: number;
  /** Skip adding NavigationControl (useful for thumbnail/mini maps). */
  controls?: boolean;
  /**
   * When true the hook sets up the container ref but does NOT create a
   * MapLibre Map instance.  Use this in LiveMap's self-contained mode when
   * MapPage already owns the map.
   */
  skipInit?: boolean;
}

export interface UseMapLibreReturn {
  /** Attach to the <div> that will host the map canvas. */
  containerRef: React.RefObject<HTMLDivElement | null>;
  /** The raw MapLibre Map — null until loaded (or when skipInit=true). */
  mapRef: React.MutableRefObject<MapLibreMap | null>;
  /** True after the map 'load' event fires. */
  mapLoaded: boolean;
  /** True if map initialisation failed. */
  mapError: boolean;
  flyTo: (lat: number, lng: number, zoom?: number) => void;
  fitToPoints: (points: LatLng[], paddingPx?: number) => void;
  toggleFullscreen: () => void;
  isFullscreen: boolean;
}

export function useMapLibre({
  center   = DEFAULT_CENTER,
  zoom     = DEFAULT_ZOOM,
  controls = true,
  skipInit = false,
}: UseMapLibreOptions = {}): UseMapLibreReturn {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef    = useRef<MapLibreMap | null>(null)    as React.MutableRefObject<MapLibreMap | null>;
  const mglRef    = useRef<MapLibreModule | null>(null) as React.MutableRefObject<MapLibreModule | null>;

  const [mapLoaded,    setMapLoaded]    = useState(false);
  const [mapError,     setMapError]     = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // ── Map initialisation ───────────────────────────────────────────────
  useEffect(() => {
    // In controlled mode the parent owns the map — do nothing
    if (skipInit) return;
    if (!containerRef.current || mapRef.current) return;
    // Guard: never import maplibre-gl on the server
    if (typeof window === 'undefined') return;

    let mounted = true;

    import('maplibre-gl')
      .then(async (mgl) => {
        if (!mounted || !containerRef.current) return;
        mglRef.current = mgl;

        try {
          const map: MapLibreMap = new mgl.Map({
            container: containerRef.current,
            style: OSM_STYLE,
            center,
            zoom,
            attributionControl: { compact: false },
          });

          mapRef.current = map;

          if (controls) {
            map.addControl(new mgl.NavigationControl({ showCompass: true }), 'top-right');
          }

          map.on('load',  () => { if (mounted) setMapLoaded(true);  });
          map.on('error', (e: { error?: Error }) => {
            console.error('[MapLibre]', e.error?.message);
            if (mounted) setMapError(true);
          });
        } catch (err) {
          console.error('[MapLibre] init failed:', err);
          if (mounted) setMapError(true);
        }
      })
      .catch((err) => {
        console.error('[MapLibre] import failed:', err);
        if (mounted) setMapError(true);
      });

    return () => {
      mounted = false;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  // center/zoom excluded — init runs only once; skipInit change would be abnormal
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [controls, skipInit]);

  // ── Fullscreen listener ──────────────────────────────────────────────
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  // ── flyTo ────────────────────────────────────────────────────────────
  const flyTo = useCallback((lat: number, lng: number, zoomLevel?: number) => {
    if (!mapRef.current) return;
    mapRef.current.flyTo({
      center: [lng, lat],
      zoom:   zoomLevel ?? mapRef.current.getZoom(),
      speed:  1.4,
      curve:  1.2,
    });
  }, []);

  // ── fitToPoints ──────────────────────────────────────────────────────
  const fitToPoints = useCallback((points: LatLng[], paddingPx = 80) => {
    if (!mapRef.current || points.length === 0) return;
    const bounds = computeBounds(points);
    if (!bounds) return;
    mapRef.current.fitBounds(bounds, {
      padding: paddingPx,
      maxZoom: 16,
      duration: 800,
    });
  }, []);

  // ── toggleFullscreen ─────────────────────────────────────────────────
  const toggleFullscreen = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen().catch(console.warn);
    } else {
      document.exitFullscreen().catch(console.warn);
    }
  }, []);

  return {
    containerRef,
    mapRef,
    mapLoaded,
    mapError,
    flyTo,
    fitToPoints,
    toggleFullscreen,
    isFullscreen,
  };
}
