import { useState } from 'react';
import type { PlanetVisibility } from '../lib/types';
import { planetColor, visibilityColor } from '../lib/format';

interface SkyDomeProps {
  planets: PlanetVisibility[];
  onSelect: (planet: PlanetVisibility) => void;
}

const SIZE = 360;
const CENTER = SIZE / 2;
const RADIUS = 158;

/** Project altitude/azimuth onto the dome. Center = zenith, edge = horizon. */
function project(altitude: number, azimuth: number) {
  // Clamp altitude into the visible disc; below horizon is clipped by caller.
  const r = (1 - altitude / 90) * RADIUS;
  const theta = (azimuth * Math.PI) / 180; // 0 = North, clockwise
  return {
    x: CENTER + r * Math.sin(theta),
    y: CENTER - r * Math.cos(theta),
  };
}

/** Build path segments for the parts of the trend that are above the horizon. */
function buildSegments(
  trend: PlanetVisibility['altitudeTrend'],
): string[] {
  const segments: string[] = [];
  let current: string[] = [];

  for (const p of trend) {
    if (p.altitude >= 0) {
      const { x, y } = project(p.altitude, p.azimuth);
      current.push(`${x.toFixed(1)},${y.toFixed(1)}`);
    } else if (current.length > 1) {
      segments.push(current.join(' '));
      current = [];
    } else {
      current = [];
    }
  }
  if (current.length > 1) segments.push(current.join(' '));
  return segments;
}

export function SkyDome({ planets, onSelect }: SkyDomeProps) {
  const [hovered, setHovered] = useState<string | null>(null);

  const cardinals = [
    { label: 'N', az: 0 },
    { label: 'E', az: 90 },
    { label: 'S', az: 180 },
    { label: 'W', az: 270 },
  ];

  // Altitude rings at 60° and 30° above the horizon.
  const rings = [
    { alt: 60, r: (1 - 60 / 90) * RADIUS },
    { alt: 30, r: (1 - 30 / 90) * RADIUS },
  ];

  return (
    <div className="sky-dome">
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        width="100%"
        role="img"
        aria-label="Sky map showing planet positions. Center is straight up, edge is the horizon."
      >
        <defs>
          <radialGradient id="dome-bg" cx="50%" cy="42%" r="62%">
            <stop offset="0%" stopColor="#1b2440" />
            <stop offset="60%" stopColor="#0a0f20" />
            <stop offset="100%" stopColor="#05070f" />
          </radialGradient>
        </defs>

        {/* Dome background */}
        <circle cx={CENTER} cy={CENTER} r={RADIUS} fill="url(#dome-bg)" />

        {/* Altitude rings */}
        {rings.map((ring) => (
          <circle
            key={ring.alt}
            cx={CENTER}
            cy={CENTER}
            r={ring.r}
            fill="none"
            stroke="rgba(255,255,255,0.16)"
            strokeWidth="1"
            strokeDasharray="2 4"
          />
        ))}

        {/* Cross hairs */}
        <line
          x1={CENTER}
          y1={CENTER - RADIUS}
          x2={CENTER}
          y2={CENTER + RADIUS}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="1"
        />
        <line
          x1={CENTER - RADIUS}
          y1={CENTER}
          x2={CENTER + RADIUS}
          y2={CENTER}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="1"
        />

        {/* Horizon edge */}
        <circle
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          fill="none"
          stroke="rgba(255,255,255,0.28)"
          strokeWidth="1.5"
        />

        {/* Zenith marker */}
        <circle cx={CENTER} cy={CENTER} r="2" fill="rgba(255,255,255,0.4)" />

        {/* Cardinal labels */}
        {cardinals.map((c) => {
          const { x, y } = project(0, c.az);
          const lx = CENTER + (x - CENTER) * 1.085;
          const ly = CENTER + (y - CENTER) * 1.085;
          return (
            <text
              key={c.label}
              x={lx}
              y={ly + 4}
              fontSize="13"
              fontWeight="600"
              fill="#8e8e93"
              textAnchor="middle"
            >
              {c.label}
            </text>
          );
        })}

        {/* Planet paths */}
        {planets.map((planet) => {
          const color = planetColor[planet.name] ?? '#8e8e93';
          const segments = buildSegments(planet.altitudeTrend);
          const dim = hovered && hovered !== planet.name;
          return segments.map((seg, i) => (
            <polyline
              key={`${planet.name}-path-${i}`}
              points={seg}
              fill="none"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="1 5"
              opacity={dim ? 0.18 : 0.7}
            />
          ));
        })}

        {/* Planet current positions */}
        {planets
          .filter((p) => p.altitudeDeg >= 0)
          .map((planet) => {
            const color = planetColor[planet.name] ?? '#8e8e93';
            const { x, y } = project(planet.altitudeDeg, planet.azimuthDeg);
            const dim = hovered && hovered !== planet.name;
            const ring = visibilityColor[planet.visibilityState];
            return (
              <g
                key={`${planet.name}-dot`}
                className="sky-planet"
                opacity={dim ? 0.3 : 1}
                onMouseEnter={() => setHovered(planet.name)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => onSelect(planet)}
                role="button"
                aria-label={`${planet.name}, ${Math.round(planet.altitudeDeg)} degrees above the horizon`}
              >
                <circle cx={x} cy={y} r="9" fill="#05070f" opacity="0.9" />
                <circle cx={x} cy={y} r="6.5" fill={color} />
                <circle
                  cx={x}
                  cy={y}
                  r="9"
                  fill="none"
                  stroke={ring}
                  strokeWidth="1.6"
                />
                <text
                  x={x}
                  y={y - 13}
                  fontSize="11"
                  fontWeight="600"
                  fill="#f5f5f7"
                  textAnchor="middle"
                >
                  {planet.name}
                </text>
              </g>
            );
          })}
      </svg>
      <p className="sky-dome__caption">
        Center is straight up; the edge is the horizon. Dotted lines trace each
        planet&rsquo;s path over the next 24 hours.
      </p>
    </div>
  );
}
