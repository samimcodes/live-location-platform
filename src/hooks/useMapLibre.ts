'use client';

/**
 * useMapLibre
 * -----------
 * Encapsulates the MapLibre GL JS lifecycle:
 *  - Dynamic import (prevents SSR crash)
 *  - Map initialisation with modern MAP_STYLES (Dark, Street, Satellite, Light)
 *  - NavigationControl
 *  - flyTo / fitToPoints / toggleFullscreen / setMapThemeStyle / toggle3D helpers
 *  - Full cleanup on unmount
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  MAP_STYLES,
  DEFAULT_CENTER,
  DEFAULT_ZOOM,
  computeBounds,
  type LatLng,
  type MapThemeStyle,
} from '@/lib/mapUtils';

import type { Map as MapLibreMap } from 'maplibre-gl';
type MapLibreModule = typeof import('maplibre-gl');

export interface UseMapLibreOptions {
  center?: [number, number];
  zoom?: number;
  /** Initial map theme style (defaults to 'dark') */
  initialTheme?: MapThemeStyle;
  /** Skip adding NavigationControl (useful for thumbnail/mini maps). */
  controls?: boolean;
  /**
   * When true the hook sets up the container ref but does NOT create a
   * MapLibre Map instance. Use this in LiveMap's self-contained mode when
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
  mapTheme: MapThemeStyle;
  setMapThemeStyle: (theme: MapThemeStyle) => void;
  is3D: boolean;
  toggle3D: () => void;
}

export function useMapLibre({
  center   = DEFAULT_CENTER,
  zoom     = DEFAULT_ZOOM,
  initialTheme = 'dark',
  controls = true,
  skipInit = false,
}: UseMapLibreOptions = {}): UseMapLibreReturn {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef    = useRef<MapLibreMap | null>(null)    as React.MutableRefObject<MapLibreMap | null>;
  const mglRef    = useRef<MapLibreModule | null>(null) as React.MutableRefObject<MapLibreModule | null>;

  const [mapLoaded,    setMapLoaded]    = useState(false);
  const [mapError,     setMapError]     = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mapTheme,     setMapTheme]     = useState<MapThemeStyle>(initialTheme);
  const [is3D,         setIs3D]         = useState(false);

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
          const selectedStyle = MAP_STYLES[initialTheme]?.style ?? MAP_STYLES.dark.style;
          const map: MapLibreMap = new mgl.Map({
            container: containerRef.current,
            style: selectedStyle,
            center,
            zoom,
            attributionControl: false,
          });

          mapRef.current = map;

          if (controls) {
            map.addControl(new mgl.NavigationControl({ showCompass: true, visualizePitch: true }), 'top-right');
            map.addControl(new mgl.AttributionControl({ compact: true }), 'bottom-left');
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
  }, [controls, skipInit, initialTheme]);

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

  // ── setMapThemeStyle ─────────────────────────────────────────────────
  const setMapThemeStyle = useCallback((theme: MapThemeStyle) => {
    setMapTheme(theme);
    if (!mapRef.current) return;
    const targetStyle = MAP_STYLES[theme]?.style ?? MAP_STYLES.dark.style;
    mapRef.current.setStyle(targetStyle);
  }, []);

  // ── toggle3D ─────────────────────────────────────────────────────────
  const toggle3D = useCallback(() => {
    if (!mapRef.current) return;
    const next = !is3D;
    setIs3D(next);
    mapRef.current.easeTo({
      pitch: next ? 55 : 0,
      bearing: next ? -25 : 0,
      duration: 800,
    });
  }, [is3D]);

  // ── toggleFullscreen ─────────────────────────────────────────────────
  const toggleFullscreen = useCallback(() => {
    // Fullscreen the wrapper around canvas + overlays, not just the GL canvas.
    const el = containerRef.current?.parentElement ?? containerRef.current;
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
    mapTheme,
    setMapThemeStyle,
    is3D,
    toggle3D,
  };
}
