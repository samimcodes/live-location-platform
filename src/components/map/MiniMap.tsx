'use client';

/**
 * MiniMap
 * -------
 * A lightweight, self-contained MapLibre GL JS map for embedding in cards.
 *
 * Used by:
 *  - Saved Places page: show a single pin for a place
 *  - History page: draw a route polyline from history points
 *
 * Props:
 *  - center: [lng, lat] to centre the map
 *  - zoom?: initial zoom (default 13)
 *  - markers?: array of points to render as small dots
 *  - routeCoords?: [[lng, lat], ...] for a polyline route layer
 *  - className?: container class
 */

import React, { useEffect, useRef, useState } from 'react';
import { OSM_STYLE, isValidLatLng } from '@/lib/mapUtils';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

import type { Map as MglMap } from 'maplibre-gl';

type AnyMap = MglMap;

export interface MiniMapMarker {
  latitude: number;
  longitude: number;
  color?: string;
  label?: string;
}

export interface MiniMapProps {
  center: [number, number]; // [lng, lat]
  zoom?: number;
  markers?: MiniMapMarker[];
  /** GeoJSON LineString coordinate pairs [[lng, lat], ...] */
  routeCoords?: [number, number][];
  /** Colour of the route line. Default: #6366f1 */
  routeColor?: string;
  className?: string;
  /** Whether to show navigation controls. Default: false for mini maps. */
  controls?: boolean;
}

export function MiniMap({
  center,
  zoom = 13,
  markers = [],
  routeCoords,
  routeColor = 'var(--primary,oklch(0.55 0.2 280))',
  className,
  controls = false,
}: MiniMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<AnyMap | null>(null) as React.MutableRefObject<AnyMap | null>;
  const [loaded, setLoaded] = useState(false);

  // Re-centre and re-drop markers when center/zoom/markers change.
  // We destroy and recreate the map instance because MapLibre GL does not
  // expose a simple "update all layers" API on a static thumbnail.
  useEffect(() => {
    // Tear down any existing map so the effect runs fresh on prop changes
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
      setLoaded(false);
    }
    if (!containerRef.current) return;
    if (typeof window === 'undefined') return;
    let mounted = true;

    import('maplibre-gl').then((mgl) => {
      if (!mounted || !containerRef.current) return;

      const map: AnyMap = new mgl.Map({
        container: containerRef.current,
        style: OSM_STYLE,
        center,
        zoom,
        interactive: controls, // disable pan/zoom for pure thumbnail
        attributionControl: false,
      });

      mapRef.current = map;

      if (controls) {
        map.addControl(new mgl.NavigationControl({ showCompass: false }), 'top-right');
      }

      map.on('load', () => {
        if (!mounted) return;
        setLoaded(true);

        // ── Drop markers ──────────────────────────────────────────────
        markers.forEach(({ latitude, longitude, color }) => {
          if (!isValidLatLng(latitude, longitude)) return;
          const el = document.createElement('div');
          el.style.cssText = `
            width:12px;height:12px;border-radius:50%;
            background:${color ?? 'var(--primary,oklch(0.55 0.2 280))'};
            border:2px solid white;
            box-shadow:0 2px 4px rgba(0,0,0,.3);`;
          new mgl.Marker({ element: el }).setLngLat([longitude, latitude]).addTo(map);
        });

        // ── Draw route line ───────────────────────────────────────────
        if (routeCoords && routeCoords.length > 1) {
          map.addSource('route', {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: { type: 'LineString', coordinates: routeCoords },
            },
          });

          // Outer glow
          map.addLayer({
            id: 'route-glow',
            type: 'line',
            source: 'route',
            paint: { 'line-color': routeColor, 'line-width': 6, 'line-opacity': 0.2 },
          });

          // Main line
          map.addLayer({
            id: 'route-line',
            type: 'line',
            source: 'route',
            layout: { 'line-join': 'round', 'line-cap': 'round' },
            paint: { 'line-color': routeColor, 'line-width': 3, 'line-opacity': 0.9 },
          });

          // Start dot (green)
          const startEl = document.createElement('div');
          startEl.style.cssText = `
            width:10px;height:10px;border-radius:50%;
            background:var(--chart-5,oklch(0.8 0.15 150));border:2px solid white;
            box-shadow:0 2px 4px rgba(0,0,0,.3);`;
          new mgl.Marker({ element: startEl })
            .setLngLat(routeCoords[routeCoords.length - 1])
            .addTo(map);

          // End dot (red)
          const endEl = document.createElement('div');
          endEl.style.cssText = `
            width:10px;height:10px;border-radius:50%;
            background:var(--destructive,oklch(0.577 0.245 27.325));border:2px solid white;
            box-shadow:0 2px 4px rgba(0,0,0,.3);`;
          new mgl.Marker({ element: endEl })
            .setLngLat(routeCoords[0])
            .addTo(map);

          // Fit to route extent
          let minLng = Infinity, maxLng = -Infinity, minLat = Infinity, maxLat = -Infinity;
          routeCoords.forEach(([lng, lat]) => {
            if (lng < minLng) minLng = lng;
            if (lng > maxLng) maxLng = lng;
            if (lat < minLat) minLat = lat;
            if (lat > maxLat) maxLat = lat;
          });
          map.fitBounds([[minLng - 0.002, minLat - 0.002], [maxLng + 0.002, maxLat + 0.002]], {
            padding: 20,
            duration: 0,
          });
        }
      });
    }).catch(console.error);

    return () => {
      mounted = false;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center[0], center[1], zoom, markers, routeCoords, routeColor, controls]);

  return (
    <div className={cn('relative overflow-hidden rounded-xl', className)}>
      <div ref={containerRef} className="w-full h-full" />
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/60 rounded-xl">
          <Loader2 size={16} className="animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  );
}
