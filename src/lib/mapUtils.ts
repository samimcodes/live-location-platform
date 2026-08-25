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
    <div style="padding:10px 12px;min-width:140px">
      <p style="font-weight:700;margin:0 0 4px;font-size:13px">${safeName}</p>
      ${safeLoc ? `<p style="color:var(--muted-foreground,#6b7280);font-size:11px;margin:0">${safeLoc}</p>` : ''}
      <p style="color:var(--primary,#6366f1);font-size:11px;margin:4px 0 0;font-weight:500">● You</p>
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
  const safeName = escapeHtml(name);
  const rawLoc = city ?? (lat !== undefined && lng !== undefined ? `${lat.toFixed(4)}, ${lng.toFixed(4)}` : '');
  const safeLoc = rawLoc ? escapeHtml(rawLoc) : '';
  const speedStr =
    speed !== undefined && speed > 0 ? `${(speed * 3.6).toFixed(0)} km/h` : null;
  const timeStr = timestamp
    ? new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null;
  // online/offline use CSS custom properties so they respect the theme
  const onlineColor   = isOnline ? 'var(--chart-5,#10b981)' : 'var(--muted-foreground,#9ca3af)';
  const secondaryColor = 'var(--muted-foreground,#9ca3af)';
  return /* html */ `
    <div style="padding:10px 12px;min-width:140px">
      <p style="font-weight:700;margin:0 0 4px;font-size:13px">${safeName}</p>
      ${safeLoc ? `<p style="color:${secondaryColor};font-size:11px;margin:0 0 3px">${safeLoc}</p>` : ''}
      ${speedStr ? `<p style="color:${secondaryColor};font-size:11px;margin:0 0 3px">🚗 ${escapeHtml(speedStr)}</p>` : ''}
      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:4px">
        <span style="color:${onlineColor};font-size:11px;font-weight:500">
          ${isOnline ? '● Online' : '○ Offline'}
        </span>
        ${timeStr ? `<span style="color:${secondaryColor};font-size:10px">${escapeHtml(timeStr)}</span>` : ''}
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
