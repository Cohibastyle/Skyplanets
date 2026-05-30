import {
  Body,
  Observer,
  Equator,
  Horizon,
  SearchRiseSet,
  SearchHourAngle,
  Illumination,
} from 'astronomy-engine';
import type {
  LocationInfo,
  PlanetVisibility,
  SkyReport,
  VisibilityState,
} from './types';

const PLANETS: Body[] = [
  Body.Mercury,
  Body.Venus,
  Body.Mars,
  Body.Jupiter,
  Body.Saturn,
  Body.Uranus,
  Body.Neptune,
];

// FSD rules (Section 9)
const VISIBILITY_ALTITUDE_CUTOFF = 10; // degrees
const LOW_HORIZON_CUTOFF = 0; // degrees
const TWILIGHT_SUN_ALTITUDE = -6; // degrees (civil twilight)

const COMPASS_16 = [
  'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
  'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW',
];

export function azimuthToLabel(azimuth: number): string {
  const index = Math.round(azimuth / 22.5) % 16;
  return COMPASS_16[index];
}

function compassToCardinal(azimuth: number): string {
  const label = azimuthToLabel(azimuth);
  const map: Record<string, string> = {
    N: 'north', NNE: 'north-northeast', NE: 'northeast', ENE: 'east-northeast',
    E: 'east', ESE: 'east-southeast', SE: 'southeast', SSE: 'south-southeast',
    S: 'south', SSW: 'south-southwest', SW: 'southwest', WSW: 'west-southwest',
    W: 'west', WNW: 'west-northwest', NW: 'northwest', NNW: 'north-northwest',
  };
  return map[label] ?? label;
}

function altitudeOf(body: Body, date: Date, observer: Observer): {
  altitude: number;
  azimuth: number;
} {
  const equ = Equator(body, date, observer, true, true);
  const hor = Horizon(date, observer, equ.ra, equ.dec, 'normal');
  return { altitude: hor.altitude, azimuth: hor.azimuth };
}

function sunAltitude(date: Date, observer: Observer): number {
  return altitudeOf(Body.Sun, date, observer).altitude;
}

function classify(altitude: number, sunAlt: number): VisibilityState {
  const dark = sunAlt <= TWILIGHT_SUN_ALTITUDE;
  if (!dark) return 'hidden';
  if (altitude >= VISIBILITY_ALTITUDE_CUTOFF) return 'visible';
  if (altitude >= LOW_HORIZON_CUTOFF) return 'low';
  return 'hidden';
}

function safeRiseSet(
  body: Body,
  observer: Observer,
  direction: 1 | -1,
  start: Date,
): Date | null {
  try {
    const event = SearchRiseSet(body, observer, direction, start, 1);
    return event ? event.date : null;
  } catch {
    return null;
  }
}

function safeTransit(body: Body, observer: Observer, start: Date): Date | null {
  try {
    const event = SearchHourAngle(body, observer, 0, start);
    return event ? event.time.date : null;
  } catch {
    return null;
  }
}

function safeMagnitude(body: Body, date: Date): number | null {
  try {
    return Illumination(body, date).mag;
  } catch {
    return null;
  }
}

function buildTrend(body: Body, start: Date, observer: Observer) {
  const trend: {
    time: Date;
    altitude: number;
    azimuth: number;
    sunAltitude: number;
  }[] = [];
  for (let h = 0; h <= 24; h++) {
    const t = new Date(start.getTime() + h * 3600_000);
    const { altitude, azimuth } = altitudeOf(body, t, observer);
    trend.push({ time: t, altitude, azimuth, sunAltitude: sunAltitude(t, observer) });
  }
  return trend;
}

function bestDarkTime(
  trend: { time: Date; altitude: number; azimuth: number; sunAltitude: number }[],
): Date | null {
  let best: { time: Date; altitude: number } | null = null;
  for (const point of trend) {
    if (point.sunAltitude <= TWILIGHT_SUN_ALTITUDE) {
      if (!best || point.altitude > best.altitude) {
        if (point.altitude > 0) best = { time: point.time, altitude: point.altitude };
      }
    }
  }
  return best ? best.time : null;
}

const STATE_ORDER: Record<VisibilityState, number> = {
  visible: 0,
  low: 1,
  hidden: 2,
};

export function buildSkyReport(
  location: LocationInfo,
  observationTime: Date,
): SkyReport {
  const observer = new Observer(location.latitude, location.longitude, 0);
  const sunAlt = sunAltitude(observationTime, observer);
  const isDark = sunAlt <= TWILIGHT_SUN_ALTITUDE;

  const planets: PlanetVisibility[] = PLANETS.map((body) => {
    const { altitude, azimuth } = altitudeOf(body, observationTime, observer);
    const trend = buildTrend(body, observationTime, observer);
    const visibilityState = classify(altitude, sunAlt);
    const cardinal = compassToCardinal(azimuth);
    const guidance =
      altitude > 0
        ? `Look ${cardinal}, about ${Math.round(altitude)}° above the horizon.`
        : `Currently below the horizon — not in view from here.`;

    return {
      name: String(body),
      altitudeDeg: altitude,
      azimuthDeg: azimuth,
      azimuthLabel: azimuthToLabel(azimuth),
      riseTimeLocal: safeRiseSet(body, observer, 1, observationTime),
      setTimeLocal: safeRiseSet(body, observer, -1, observationTime),
      transitTimeLocal: safeTransit(body, observer, observationTime),
      magnitude: safeMagnitude(body, observationTime),
      visibilityState,
      bestTimeLocal: bestDarkTime(trend),
      altitudeTrend: trend,
      guidance,
    };
  });

  planets.sort((a, b) => {
    const order = STATE_ORDER[a.visibilityState] - STATE_ORDER[b.visibilityState];
    if (order !== 0) return order;
    return b.altitudeDeg - a.altitudeDeg;
  });

  return {
    location,
    observationTime,
    sunAltitudeDeg: sunAlt,
    isDark,
    planets,
    generatedAt: new Date(),
  };
}
