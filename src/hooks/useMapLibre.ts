'use client';

/**
 * useMapLibre
 * -----------
 * Encapsulates the entire MapLibre GL JS lifecycle:
 *  - Dynamic import (prevents SSR crash)
 *  - Map initialisation with OSM tiles
 *  - NavigationControl + FullscreenControl
 *  - Exposes `mapRef`, `mapLoaded`, `mapError` state
 *  - Cleans up on unmount (removes map, clears refs)
 *
 * Usage:
 *   const { containerRef, mapRef, mapLoaded, mapError } = useMapLibre({ center, zoom });
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  OSM_STYLE,
  DEFAULT_CENTER,
  DEFAULT_ZOOM,
  computeBounds,
  type LatLng,
} from '@/lib/mapUtils';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MapLibreMap = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MapLibreModule = any;

export interface UseMapLibreOptions {
  center?: [number, number];
  zoom?: number;
  /** Pass false to skip adding NavigationControl (for mini/thumbnail maps). */
  controls?: boolean;
}

export interface UseMapLibreReturn {
  /** Attach this ref to the container <div> that hosts the map canvas. */
  containerRef: React.RefObject<HTMLDivElement | null>;
  /** The raw MapLibre Map instance — null until the map has loaded. */
  mapRef: React.MutableRefObject<MapLibreMap | null>;
  /** True once the map 'load' event fires. */
  mapLoaded: boolean;
  /** True if map initialisation failed (e.g. browser blocks WebGL). */
  mapError: boolean;
  /** Fly to a coordinate with optional zoom level. */
  flyTo: (lat: number, lng: number, zoom?: number) => void;
  /** Fit the viewport to a set of points. */
  fitToPoints: (points: LatLng[], paddingPx?: number) => void;
  /** Enter or exit native fullscreen on the container element. */
  toggleFullscreen: () => void;
  /** Whether the map container is currently fullscreen. */
  isFullscreen: boolean;
}

export function useMapLibre({
  center = DEFAULT_CENTER,
  zoom = DEFAULT_ZOOM,
  controls = true,
}: UseMapLibreOptions = {}): UseMapLibreReturn {
  const containerRef = useRef<HTMLDivElement>(null);
  // MutableRefObject so we can assign mapRef.current inside effects
  const mapRef = useRef<MapLibreMap | null>(null) as React.MutableRefObject<MapLibreMap | null>;
  const mglRef = useRef<MapLibreModule | null>(null) as React.MutableRefObject<MapLibreModule | null>;

  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // ── Initialise map ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    let mounted = true;

    import('maplibre-gl')
      .then((mgl) => {
        if (!mounted || !containerRef.current) return;
        mglRef.current = mgl;

        try {
          const map: MapLibreMap = new mgl.Map({
            container: containerRef.current,
            style: OSM_STYLE,
            center,
            zoom,
            attributionControl: true,
          });

          mapRef.current = map;

          if (controls) {
            map.addControl(new mgl.NavigationControl({ showCompass: true }), 'top-right');
          }

          map.on('load', () => {
            if (mounted) setMapLoaded(true);
          });

          map.on('error', (e: { error?: Error }) => {
            console.error('[MapLibre] error:', e.error?.message);
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
    // center/zoom are intentionally excluded — we only init once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [controls]);

  // ── Fullscreen listener ──────────────────────────────────────────────────
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  // ── flyTo ────────────────────────────────────────────────────────────────
  const flyTo = useCallback((lat: number, lng: number, zoomLevel?: number) => {
    if (!mapRef.current) return;
    mapRef.current.flyTo({
      center: [lng, lat],
      zoom: zoomLevel ?? mapRef.current.getZoom(),
      speed: 1.4,
      curve: 1.2,
    });
  }, []);

  // ── fitToPoints ───────────────────────────────────────────────────────────
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

  // ── toggleFullscreen ─────────────────────────────────────────────────────
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
