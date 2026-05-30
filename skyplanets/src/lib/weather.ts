import type { WeatherInfo } from './types';

function qualityFromClouds(cloudCover: number): WeatherInfo['quality'] {
  if (cloudCover < 30) return 'good';
  if (cloudCover <= 70) return 'fair';
  return 'poor';
}

/**
 * Fetch current cloud cover and temperature from the free Open-Meteo API.
 * Returns null if the service is unavailable so the UI can degrade gracefully.
 */
export async function fetchWeather(
  latitude: number,
  longitude: number,
): Promise<WeatherInfo | null> {
  try {
    const url = new URL('https://api.open-meteo.com/v1/forecast');
    url.searchParams.set('latitude', String(latitude));
    url.searchParams.set('longitude', String(longitude));
    url.searchParams.set('current', 'cloud_cover,temperature_2m');

    const res = await fetch(url.toString());
    if (!res.ok) return null;
    const data: {
      current?: { cloud_cover?: number; temperature_2m?: number };
    } = await res.json();

    const cloud = data.current?.cloud_cover;
    if (cloud === undefined) return null;

    return {
      cloudCoverPct: cloud,
      quality: qualityFromClouds(cloud),
      temperatureC: data.current?.temperature_2m,
    };
  } catch {
    return null;
  }
}
