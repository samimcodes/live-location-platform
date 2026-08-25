export interface LocationFields {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  speed?: number;
  heading?: number;
  address?: string;
  city?: string;
  country?: string;
}

const lastHistoryWrite = new Map<number, { at: number; lat: number; lng: number }>();

const HISTORY_MIN_INTERVAL_MS = 30_000;
const HISTORY_MIN_DISTANCE_M = 50;
export const LOCATION_HISTORY_RETENTION_MS = 30 * 24 * 60 * 60 * 1000;

function optionalNumber(value: unknown): number | undefined {
  return typeof value === 'number' && isFinite(value) ? value : undefined;
}

function optionalString(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 && value.length < 500
    ? value
    : undefined;
}

export function pickLocationFields(input: unknown): LocationFields | null {
  if (!input || typeof input !== 'object') return null;
  const obj = input as Record<string, unknown>;
  const latitude = obj.latitude;
  const longitude = obj.longitude;
  if (
    typeof latitude !== 'number' ||
    typeof longitude !== 'number' ||
    !isFinite(latitude) ||
    !isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return null;
  }

  const fields: LocationFields = { latitude, longitude };
  const accuracy = optionalNumber(obj.accuracy);
  const altitude = optionalNumber(obj.altitude);
  const speed = optionalNumber(obj.speed);
  const heading = optionalNumber(obj.heading);
  const address = optionalString(obj.address);
  const city = optionalString(obj.city);
  const country = optionalString(obj.country);

  if (accuracy !== undefined) fields.accuracy = accuracy;
  if (altitude !== undefined) fields.altitude = altitude;
  if (speed !== undefined) fields.speed = speed;
  if (heading !== undefined) fields.heading = heading;
  if (address !== undefined) fields.address = address;
  if (city !== undefined) fields.city = city;
  if (country !== undefined) fields.country = country;

  return fields;
}

function haversineMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Record history at most every 30s, unless the user moved 50m+. */
export function shouldRecordHistory(userId: number, lat: number, lng: number): boolean {
  const prev = lastHistoryWrite.get(userId);
  const now = Date.now();
  if (!prev) {
    lastHistoryWrite.set(userId, { at: now, lat, lng });
    return true;
  }
  const moved = haversineMeters(prev.lat, prev.lng, lat, lng);
  if (now - prev.at >= HISTORY_MIN_INTERVAL_MS || moved >= HISTORY_MIN_DISTANCE_M) {
    lastHistoryWrite.set(userId, { at: now, lat, lng });
    return true;
  }
  return false;
}
