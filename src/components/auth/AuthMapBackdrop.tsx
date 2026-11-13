'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import type { Map as MglMap, Marker as MglMarker } from 'maplibre-gl';
import { MAP_STYLES, MapThemeStyle } from '@/lib/mapUtils';
import { Crosshair, Plus, Minus, Layers } from 'lucide-react';
import { soundFx } from '@/lib/soundFx';
import { useTheme } from '@/components/ThemeProvider';

const DEFAULT_CENTER: [number, number] = [90.3994, 23.7771]; // Default coordinate (Dhaka Center)

interface AuthMapBackdropProps {
  initialStyle?: MapThemeStyle;
}

export function AuthMapBackdrop({ initialStyle }: AuthMapBackdropProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MglMap | null>(null);
  const markerRef = useRef<MglMarker | null>(null);
  const { resolvedTheme } = useTheme();

  const isDark = resolvedTheme === 'dark';
  // Use rich Satellite for dark mode, and vibrant Street or Satellite for light mode
  const defaultStyle: MapThemeStyle = initialStyle ?? (isDark ? 'satellite' : 'street');

  const [mapStyle, setMapStyle] = useState<MapThemeStyle>(defaultStyle);
  const [userPickedStyle, setUserPickedStyle] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // ─── Sync with theme changes unless user explicitly switched style ───
  useEffect(() => {
    if (userPickedStyle) return;
    const targetStyle: MapThemeStyle = resolvedTheme === 'dark' ? 'satellite' : 'street';
    setMapStyle(targetStyle);
  }, [resolvedTheme, userPickedStyle]);

  // ─── Initialize MapLibre GL Background ───────────────────
  useEffect(() => {
    if (!containerRef.current) return;
    let isCancelled = false;

    import('maplibre-gl').then((mgl) => {
      if (isCancelled || !containerRef.current) return;

      const styleObj = MAP_STYLES[mapStyle]?.style || MAP_STYLES.satellite.style;

      const map = new mgl.Map({
        container: containerRef.current,
        style: styleObj as unknown as string,
        center: DEFAULT_CENTER,
        zoom: 14.2,
        pitch: 36,
        bearing: -12,
        attributionControl: false,
        interactive: true,
      });

      mapRef.current = map;

      map.on('load', () => {
        if (isCancelled) return;
        setIsLoaded(true);

        // Add an authentic glowing live pulse beacon marker on the map
        const beaconEl = document.createElement('div');
        beaconEl.className = 'flex flex-col items-center pointer-events-none select-none';
        beaconEl.innerHTML = `
          <div class="relative flex items-center justify-center">
            <span class="absolute h-10 w-10 rounded-full bg-cyan-400/35 animate-ping"></span>
            <span class="absolute h-6 w-6 rounded-full bg-cyan-400/25 border border-cyan-400/60"></span>
            <div class="h-3.5 w-3.5 rounded-full bg-cyan-400 border-2 border-white shadow-[0_0_15px_#06B6D4]"></div>
          </div>
          <div class="mt-1 px-2 py-0.5 rounded-full bg-slate-950/85 text-[10px] font-bold text-cyan-300 border border-cyan-400/40 shadow-md backdrop-blur-md flex items-center gap-1">
            <span class="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>LocaLink Node</span>
          </div>
        `;

        const beacon = new mgl.Marker({ element: beaconEl })
          .setLngLat(DEFAULT_CENTER)
          .addTo(map);
        markerRef.current = beacon;

        // Gentle cinematic ambient camera drift
        const rotateCamera = () => {
          if (!mapRef.current || isCancelled) return;
          const currentBearing = mapRef.current.getBearing();
          mapRef.current.easeTo({
            bearing: currentBearing + 0.25,
            duration: 1000,
            easing: (t) => t,
          });
        };

        const timer = setInterval(rotateCamera, 1000);
        return () => clearInterval(timer);
      });
    });

    return () => {
      isCancelled = true;
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Update Style when Toggled ────────────────────────────
  useEffect(() => {
    if (!mapRef.current) return;
    const styleObj = MAP_STYLES[mapStyle]?.style || MAP_STYLES.satellite.style;
    mapRef.current.setStyle(styleObj as unknown as string);
  }, [mapStyle]);

  // ─── Locate Current User on the Real Map ──────────────────
  const locateUser = useCallback(() => {
    if (!navigator.geolocation || !mapRef.current) return;
    soundFx?.playPop?.();
    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        if (mapRef.current) {
          const userCoords: [number, number] = [pos.coords.longitude, pos.coords.latitude];
          mapRef.current.flyTo({
            center: userCoords,
            zoom: 15.5,
            pitch: 42,
            speed: 1.2,
            essential: true,
          });
          if (markerRef.current) {
            markerRef.current.setLngLat(userCoords);
          }
        }
      },
      () => {
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, []);

  const cycleMapStyle = () => {
    soundFx?.playPop?.();
    setUserPickedStyle(true);
    setMapStyle((prev) => {
      if (prev === 'street') return 'satellite';
      if (prev === 'satellite') return 'dark';
      return 'street';
    });
  };

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-auto">
      {/* Real Map Canvas */}
      <div ref={containerRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Loading state indicator */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs text-white z-10">
          <div className="h-6 w-6 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" />
        </div>
      )}

      {/* ── Modern Cinematic Atmospheric Vignette ── */}
      {/* Softly dims the center directly behind the card, leaving the vivid real satellite / street map visible and crisp on the perimeter */}
      <div
        className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(248,250,255,0.72)_0%,rgba(248,250,255,0.40)_42%,rgba(248,250,255,0.12)_75%,transparent_100%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(7,11,22,0.78)_0%,rgba(7,11,22,0.45)_42%,rgba(7,11,22,0.15)_75%,transparent_100%)] transition-colors duration-500"
        aria-hidden="true"
      />

      {/* Soft Top & Bottom legibility fades for the header and footer */}
      <div
        className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-slate-50/80 via-slate-50/40 to-transparent dark:from-[#070B16]/85 dark:via-[#070B16]/40 dark:to-transparent pointer-events-none transition-colors duration-500"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-slate-50/90 via-slate-50/50 to-transparent dark:from-[#070B16]/90 dark:via-[#070B16]/50 dark:to-transparent pointer-events-none transition-colors duration-500"
        aria-hidden="true"
      />

      {/* Subtle Live Telemetry Ping Ring */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[540px] h-[540px] rounded-full border border-indigo-500/10 dark:border-cyan-400/15 pointer-events-none animate-pulse"
        aria-hidden="true"
      />

      {/* Floating Interactive Map Controls (Bottom Right) */}
      <div className="absolute bottom-3 right-3 z-20 hidden sm:flex items-center gap-1 rounded-full border border-slate-200/90 bg-white/90 p-1 text-slate-700 shadow-md backdrop-blur-xl dark:border-white/15 dark:bg-slate-950/85 dark:text-slate-300">
        <button
          type="button"
          onClick={cycleMapStyle}
          className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold text-slate-700 hover:text-slate-950 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-white/10 transition-colors cursor-pointer"
          title="Toggle map style"
        >
          <Layers className="h-3 w-3 text-indigo-600 dark:text-cyan-400" />
          <span className="capitalize">{mapStyle}</span>
        </button>

        <span className="h-3 w-px bg-slate-200 dark:bg-white/20" />

        <button
          type="button"
          onClick={() => {
            soundFx?.playPop?.();
            mapRef.current?.zoomIn();
          }}
          aria-label="Zoom in"
          className="p-1 rounded-full text-slate-600 hover:text-slate-950 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-white/10 transition-colors cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>

        <button
          type="button"
          onClick={() => {
            soundFx?.playPop?.();
            mapRef.current?.zoomOut();
          }}
          aria-label="Zoom out"
          className="p-1 rounded-full text-slate-600 hover:text-slate-950 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-white/10 transition-colors cursor-pointer"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>

        <button
          type="button"
          onClick={locateUser}
          aria-label="Locate my position on map"
          title="Fly to my real location"
          className="p-1 rounded-full text-indigo-600 hover:bg-indigo-50 dark:text-cyan-400 dark:hover:bg-white/10 transition-colors cursor-pointer"
        >
          <Crosshair className={`h-3.5 w-3.5 ${isLocating ? 'animate-spin' : ''}`} />
        </button>
      </div>
    </div>
  );
}
