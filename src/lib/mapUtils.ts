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

// ── Default map centre (Dhaka) ─────────────────────────────────────────────
export const DEFAULT_CENTER: [number, number] = [
  parseFloat(process.env.NEXT_PUBLIC_MAP_DEFAULT_LNG ?? '90.4125'),
  parseFloat(process.env.NEXT_PUBLIC_MAP_DEFAULT_LAT ?? '23.8103'),
];

export const DEFAULT_ZOOM = parseFloat(
  process.env.NEXT_PUBLIC_MAP_DEFAULT_ZOOM ?? '11'
);

// ── Marker colour palette ──────────────────────────────────────────────────
export const FRIEND_GRADIENTS = [
  { from: '#10b981', to: '#059669' }, // emerald
  { from: '#3b82f6', to: '#2563eb' }, // blue
  { from: '#f59e0b', to: '#d97706' }, // amber
  { from: '#ec4899', to: '#db2777' }, // pink
  { from: '#06b6d4', to: '#0891b2' }, // cyan
  { from: '#8b5cf6', to: '#7c3aed' }, // violet
  { from: '#f97316', to: '#ea580c' }, // orange
] as const;

export const ME_GRADIENT = { from: '#6366f1', to: '#8b5cf6' }; // indigo→purple

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

  const el = document.createElement('div');
  el.className = 'localink-marker';
  el.setAttribute('aria-label', label);
  el.innerHTML = /* html */ `
    <div class="marker-wrapper">
      <div class="marker-pin" style="background:${bg};">
        <span class="marker-letter">${letter}</span>
        ${isMe ? '<span class="marker-pulse"></span>' : ''}
        ${onlineDot}
      </div>
      <div class="marker-label">${label}</div>
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
  icon: string; // Unicode emoji or single letter
}

export function createPlaceMarkerElement(opts: PlaceMarkerOptions): HTMLDivElement {
  const el = document.createElement('div');
  el.className = 'localink-place-marker';
  el.innerHTML = /* html */ `
    <div class="place-pin" style="background:${opts.color};">
      <span class="place-icon">${opts.icon}</span>
    </div>
    <div class="place-arrow" style="background:${opts.color};"></div>`;
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
export function buildMePopup(name: string, city?: string, lat?: number, lng?: number): string {
  const loc =
    city ?? (lat !== undefined && lng !== undefined ? `${lat.toFixed(4)}, ${lng.toFixed(4)}` : '');
  return /* html */ `
    <div style="padding:10px 12px;min-width:140px">
      <p style="font-weight:700;margin:0 0 4px;font-size:13px">${name}</p>
      ${loc ? `<p style="color:#6b7280;font-size:11px;margin:0">${loc}</p>` : ''}
      <p style="color:#6366f1;font-size:11px;margin:4px 0 0;font-weight:500">● You</p>
    </div>`;
}

export function buildFriendPopup(
  name: string,
  isOnline: boolean,
  city?: string,
  lat?: number,
  lng?: number,
  speed?: number,
  timestamp?: string
): string {
  const loc =
    city ?? (lat !== undefined && lng !== undefined ? `${lat.toFixed(4)}, ${lng.toFixed(4)}` : '');
  const speedStr =
    speed !== undefined && speed > 0 ? `${(speed * 3.6).toFixed(0)} km/h` : null;
  const timeStr = timestamp
    ? new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null;
  return /* html */ `
    <div style="padding:10px 12px;min-width:140px">
      <p style="font-weight:700;margin:0 0 4px;font-size:13px">${name}</p>
      ${loc ? `<p style="color:#6b7280;font-size:11px;margin:0 0 3px">${loc}</p>` : ''}
      ${speedStr ? `<p style="color:#6b7280;font-size:11px;margin:0 0 3px">🚗 ${speedStr}</p>` : ''}
      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:4px">
        <span style="color:${isOnline ? '#10b981' : '#9ca3af'};font-size:11px;font-weight:500">
          ${isOnline ? '● Online' : '○ Offline'}
        </span>
        ${timeStr ? `<span style="color:#9ca3af;font-size:10px">${timeStr}</span>` : ''}
      </div>
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
