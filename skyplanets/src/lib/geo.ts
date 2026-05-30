import type { LocationInfo } from './types';

interface GeoResult {
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  admin1?: string;
  timezone?: string;
}

/**
 * Geocode a place name using the free Open-Meteo geocoding API (no key required).
 */
export async function searchLocations(query: string): Promise<LocationInfo[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const url = new URL('https://geocoding-api.open-meteo.com/v1/search');
  url.searchParams.set('name', trimmed);
  url.searchParams.set('count', '6');
  url.searchParams.set('language', 'en');
  url.searchParams.set('format', 'json');

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error('Location search failed');
  const data: { results?: GeoResult[] } = await res.json();

  return (data.results ?? []).map((r) => ({
    name: [r.name, r.admin1, r.country].filter(Boolean).join(', '),
    latitude: r.latitude,
    longitude: r.longitude,
    timezone: r.timezone,
  }));
}

/**
 * Reverse geocode coordinates to a friendly label. Falls back to coordinates.
 */
export async function reverseGeocode(
  latitude: number,
  longitude: number,
): Promise<string> {
  try {
    const url = new URL('https://geocoding-api.open-meteo.com/v1/search');
    // Open-Meteo has no reverse endpoint; use a coordinate-rounded label fallback.
    url.searchParams.set('name', `${latitude.toFixed(2)},${longitude.toFixed(2)}`);
    const res = await fetch(url.toString());
    if (res.ok) {
      const data: { results?: GeoResult[] } = await res.json();
      if (data.results && data.results[0]) {
        const r = data.results[0];
        return [r.name, r.admin1, r.country].filter(Boolean).join(', ');
      }
    }
  } catch {
    // ignore and fall through
  }
  return `${latitude.toFixed(3)}°, ${longitude.toFixed(3)}°`;
}
