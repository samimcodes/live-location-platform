/**
 * MapLibre GL JS + OpenStreetMap utilities.
 * Pure functions — no side effects, no React, no global state.
 * Fully typed; safe to import from both client components and hooks.
 */

// ── OSM tile source ────────────────────────────────────────────────────────
export const OSM_STYLE = {
  version: 8 as const,
  sources: {
    osm: {
      type: 'raster' as const,
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '© <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors',
      maxzoom: 19,
    },
  },
  layers: [
    {
      id: 'osm-tiles',
      type: 'raster' as const,
      source: 'osm',
      minzoom: 0,
      maxzoom: 22,
    },
  ],
};

// ── Map Styles (Dark Navigation, Clean Street, Satellite, Light) ───────────
export type MapThemeStyle = 'dark' | 'street' | 'satellite' | 'light';

export interface MapRasterStyle {
  version: 8;
  sources: Record<string, {
    type: 'raster';
    tiles: string[];
    tileSize?: number;
    attribution?: string;
    maxzoom?: number;
  }>;
  layers: Array<{
    id: string;
    type: 'raster';
    source: string;
    minzoom?: number;
    maxzoom?: number;
  }>;
}

export const MAP_STYLES: Record<MapThemeStyle, { id: MapThemeStyle; name: string; style: MapRasterStyle }> = {
  dark: {
    id: 'dark',
    name: 'Dark Navigation',
    style: {
      version: 8,
      sources: {
        'carto-dark': {
          type: 'raster',
          tiles: [
            'https://a.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png',
            'https://b.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png',
            'https://c.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png',
          ],
          tileSize: 256,
          attribution: '© CARTO, © OpenStreetMap',
          maxzoom: 19,
        },
      },
      layers: [
        { id: 'carto-dark-tiles', type: 'raster', source: 'carto-dark', minzoom: 0, maxzoom: 22 },
      ],
    },
  },
  street: {
    id: 'street',
    name: 'Clean Street',
    style: {
      version: 8,
      sources: {
        'carto-voyager': {
          type: 'raster',
          tiles: [
            'https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
            'https://b.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
            'https://c.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
          ],
          tileSize: 256,
          attribution: '© CARTO, © OpenStreetMap',
          maxzoom: 19,
        },
      },
      layers: [
        { id: 'carto-voyager-tiles', type: 'raster', source: 'carto-voyager', minzoom: 0, maxzoom: 22 },
      ],
    },
  },
  satellite: {
    id: 'satellite',
    name: 'Satellite',
    style: {
      version: 8,
      sources: {
        'esri-sat': {
          type: 'raster',
          tiles: [
            'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          ],
          tileSize: 256,
          attribution: '© Esri, Maxar, Earthstar Geographics',
          maxzoom: 19,
        },
      },
      layers: [
        { id: 'esri-sat-tiles', type: 'raster', source: 'esri-sat', minzoom: 0, maxzoom: 22 },
      ],
    },
  },
  light: {
    id: 'light',
    name: 'Standard OSM',
    style: OSM_STYLE,
  },
};

// ── Default map centre (Dhaka) ─────────────────────────────────────────────
export const DEFAULT_CENTER: [number, number] = [
  parseFloat(process.env.NEXT_PUBLIC_MAP_DEFAULT_LNG ?? '90.4125'),
  parseFloat(process.env.NEXT_PUBLIC_MAP_DEFAULT_LAT ?? '23.8103'),
];

export const DEFAULT_ZOOM = parseFloat(
  process.env.NEXT_PUBLIC_MAP_DEFAULT_ZOOM ?? '11'
);

// ── Distance calculations (Haversine) ──────────────────────────────────────
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m away`;
  }
  return `${distanceKm.toFixed(1)} km away`;
}

// ── Marker colour palette ──────────────────────────────────────────────────
// Using CSS custom properties so markers respect the design token theme.
// The inline style.background strings support var() in all modern browsers.
export const FRIEND_GRADIENTS = [
  { from: 'var(--chart-5)',  to: 'color-mix(in oklch, var(--chart-5) 80%, black)'  }, // emerald
  { from: 'var(--chart-3)',  to: 'color-mix(in oklch, var(--chart-3) 80%, black)'  }, // blue/indigo
  { from: 'var(--chart-4)',  to: 'color-mix(in oklch, var(--chart-4) 80%, black)'  }, // amber
  { from: 'var(--chart-2)',  to: 'color-mix(in oklch, var(--chart-2) 80%, black)'  }, // pink/violet
  { from: 'var(--chart-1)',  to: 'color-mix(in oklch, var(--chart-1) 80%, black)'  }, // purple
  { from: 'var(--ring)',     to: 'color-mix(in oklch, var(--ring) 80%, black)'     }, // ring/violet
  { from: 'var(--primary)',  to: 'color-mix(in oklch, var(--primary) 80%, black)'  }, // primary
] as const;

export const ME_GRADIENT = {
  from: 'var(--primary)',
  to:   'color-mix(in oklch, var(--primary) 70%, var(--chart-2))',
};

/** Pick a stable gradient for a friend based on their numeric id. */
export function friendGradient(userId: number): { from: string; to: string } {
  return FRIEND_GRADIENTS[userId % FRIEND_GRADIENTS.length];
}

/** CSS `background` value for a gradient object. */
export function gradientCss(g: { from: string; to: string }): string {
  return `linear-gradient(135deg, ${g.from}, ${g.to})`;
}

// ── Marker DOM element factory ─────────────────────────────────────────────
export interface MarkerOptions {
  label: string;
  letter: string;
  gradient: { from: string; to: string };
  isMe?: boolean;
  isOnline?: boolean;
  /** Popup HTML string — set via marker.setPopup() externally if preferred. */
  popupHtml?: string;
}

/**
 * Creates a custom HTML element for a MapLibre Marker.
 * The returned element owns the `localink-marker` class so the global CSS
 * (globals.css) can style it without specificity fights.
 */
export function createMarkerElement(opts: MarkerOptions): HTMLDivElement {
  const { label, letter, gradient, isMe = false, isOnline } = opts;
  const bg = gradientCss(gradient);
  const onlineDot =
    isOnline !== undefined
      ? `<span class="marker-online-dot ${isOnline ? 'is-online' : 'is-offline'}"></span>`
      : '';

  const safeLabel = escapeHtml(label);
  const safeLetter = escapeHtml(letter.slice(0, 2));
  const el = document.createElement('div');
  el.className = 'localink-marker';
  el.setAttribute('aria-label', label);
  el.innerHTML = /* html */ `
    <div class="marker-wrapper">
      <div class="marker-pin" style="background:${bg};">
        <span class="marker-letter">${safeLetter}</span>
        ${isMe ? '<span class="marker-pulse"></span>' : ''}
        ${onlineDot}
      </div>
      <div class="marker-label">${safeLabel}</div>
      <div class="marker-arrow" style="background:${gradient.to};"></div>
    </div>`;
  return el;
}

/**
 * Creates an accuracy circle element that sits under a marker.
 * Sized in CSS via a custom property `--radius-px`.
 */
export function createAccuracyElement(): HTMLDivElement {
  const el = document.createElement('div');
  el.className = 'localink-accuracy-circle';
  return el;
}

// ── Saved-place marker element ─────────────────────────────────────────────
export interface PlaceMarkerOptions {
  color: string;
  icon: string; // Unicode emoji or single letter — must be sanitized before passing
  name?: string; // Accessible label for aria-label
}

export function createPlaceMarkerElement(opts: PlaceMarkerOptions): HTMLDivElement {
  // Sanitize: only allow emoji / short text — strip any HTML tags
  const safeIcon = escapeHtml(opts.icon.slice(0, 4)); // max 4 chars, no HTML
  const el = document.createElement('div');
  el.className = 'localink-place-marker';
  if (opts.name) el.setAttribute('aria-label', opts.name);
  el.innerHTML = /* html */ `
    <div class="place-pin" style="background:${escapeHtml(opts.color)};">
      <span class="place-icon">${safeIcon}</span>
    </div>
    <div class="place-arrow" style="background:${escapeHtml(opts.color)};"></div>`;
  return el;
}

// ── Viewport / bounds helpers ──────────────────────────────────────────────
export interface LatLng {
  latitude: number;
  longitude: number;
}

/**
 * Computes a [west, south, east, north] bounding box that contains all
 * provided coordinates plus an optional padding factor (degrees).
 * Returns null if the array is empty.
 */
export function computeBounds(
  points: LatLng[],
  padDeg = 0.01
): [[number, number], [number, number]] | null {
  if (points.length === 0) return null;

  let minLat = Infinity,
    maxLat = -Infinity,
    minLng = Infinity,
    maxLng = -Infinity;

  for (const p of points) {
    if (p.latitude < minLat) minLat = p.latitude;
    if (p.latitude > maxLat) maxLat = p.latitude;
    if (p.longitude < minLng) minLng = p.longitude;
    if (p.longitude > maxLng) maxLng = p.longitude;
  }

  return [
    [minLng - padDeg, minLat - padDeg],
    [maxLng + padDeg, maxLat + padDeg],
  ];
}

// ── Accuracy-circle pixel radius ──────────────────────────────────────────
/**
 * Converts a GPS accuracy value (metres) into an approximate pixel radius at
 * the given map zoom level and latitude.
 * Formula: metres_per_pixel = (156543.03392 * cos(lat * π/180)) / 2^zoom
 */
export function accuracyToPixels(
  accuracyMetres: number,
  zoom: number,
  latitude: number
): number {
  const metersPerPixel =
    (156543.03392 * Math.cos((latitude * Math.PI) / 180)) / Math.pow(2, zoom);
  return Math.max(20, Math.round(accuracyMetres / metersPerPixel));
}

// ── Popup HTML builders ────────────────────────────────────────────────────

/** Escape HTML special characters to prevent XSS in innerHTML popup strings. */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function buildMePopup(name: string, city?: string, lat?: number, lng?: number): string {
  const safeName = escapeHtml(name);
  const rawLoc = city ?? (lat !== undefined && lng !== undefined ? `${lat.toFixed(4)}, ${lng.toFixed(4)}` : '');
  const safeLoc = rawLoc ? escapeHtml(rawLoc) : '';
  return /* html */ `
    <div style="padding:10px 14px;min-width:160px">
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
        <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:var(--primary,#6366f1)"></span>
        <p style="font-weight:800;margin:0;font-size:13px;color:var(--foreground,#0f172a)">${safeName} (You)</p>
      </div>
      ${safeLoc ? `<p style="color:var(--muted-foreground,#64748b);font-size:11px;margin:0 0 4px;font-weight:500">${safeLoc}</p>` : ''}
      <div style="display:inline-flex;align-items:center;gap:4px;background:color-mix(in oklch, var(--primary) 12%, transparent);color:var(--primary,#6366f1);font-size:10px;font-weight:700;padding:2px 8px;border-radius:9999px">
        <span>Broadcasting Live</span>
      </div>
    </div>`;
}

export function buildFriendPopup(
  name: string,
  isOnline: boolean,
  city?: string,
  lat?: number,
  lng?: number,
  speed?: number,
  timestamp?: string,
  distanceStr?: string,
): string {
  const safeName = escapeHtml(name);
  const rawLoc = city ?? (lat !== undefined && lng !== undefined ? `${lat.toFixed(4)}, ${lng.toFixed(4)}` : '');
  const safeLoc = rawLoc ? escapeHtml(rawLoc) : '';
  const speedStr =
    speed !== undefined && speed > 0 ? `${(speed * 3.6).toFixed(0)} km/h` : null;
  const timeStr = timestamp
    ? new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null;
  const onlineColor = isOnline ? 'var(--chart-5,#10b981)' : 'var(--muted-foreground,#9ca3af)';
  const secondaryColor = 'var(--muted-foreground,#64748b)';

  return /* html */ `
    <div style="padding:12px 14px;min-width:170px">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:5px">
        <p style="font-weight:800;margin:0;font-size:13px;color:var(--foreground,#0f172a)">${safeName}</p>
        <span style="color:${onlineColor};font-size:10px;font-weight:700;background:color-mix(in oklch, ${onlineColor} 12%, transparent);padding:2px 6px;border-radius:6px">
          ${isOnline ? '● Live' : '○ Offline'}
        </span>
      </div>
      ${safeLoc ? `<p style="color:${secondaryColor};font-size:11px;margin:0 0 4px;font-weight:500">${safeLoc}</p>` : ''}
      <div style="display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin:6px 0 2px">
        ${distanceStr ? `<span style="font-size:10px;font-weight:700;background:color-mix(in oklch, var(--primary) 10%, transparent);color:var(--primary);padding:2px 6px;border-radius:6px">📍 ${escapeHtml(distanceStr)}</span>` : ''}
        ${speedStr ? `<span style="font-size:10px;font-weight:700;background:color-mix(in oklch, var(--chart-3) 12%, transparent);color:var(--chart-3);padding:2px 6px;border-radius:6px">🚗 ${escapeHtml(speedStr)}</span>` : ''}
      </div>
      ${timeStr ? `<p style="color:${secondaryColor};font-size:10px;margin:4px 0 0;opacity:0.75">Updated at ${escapeHtml(timeStr)}</p>` : ''}
    </div>`;
}

// ── Validation ────────────────────────────────────────────────────────────
export function isValidLatLng(lat: unknown, lng: unknown): boolean {
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    isFinite(lat) &&
    isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}
