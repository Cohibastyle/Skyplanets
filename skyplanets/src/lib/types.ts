export type VisibilityState = 'visible' | 'low' | 'hidden';

export interface LocationInfo {
  name: string;
  latitude: number;
  longitude: number;
  timezone?: string;
}

export interface PlanetVisibility {
  name: string;
  altitudeDeg: number;
  azimuthDeg: number;
  azimuthLabel: string;
  riseTimeLocal: Date | null;
  setTimeLocal: Date | null;
  transitTimeLocal: Date | null;
  magnitude: number | null;
  visibilityState: VisibilityState;
  /** Hour (local) with maximal altitude while the sky is dark tonight. */
  bestTimeLocal: Date | null;
  /** Altitude samples for the next 24 hours, one per hour. */
  altitudeTrend: { time: Date; altitude: number; azimuth: number; sunAltitude: number }[];
  guidance: string;
}

export interface SkyReport {
  location: LocationInfo;
  observationTime: Date;
  sunAltitudeDeg: number;
  isDark: boolean;
  planets: PlanetVisibility[];
  generatedAt: Date;
}

export interface WeatherInfo {
  cloudCoverPct: number;
  quality: 'good' | 'fair' | 'poor';
  temperatureC?: number;
}
