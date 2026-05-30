import { planetColor } from '../lib/format';

interface PlanetGlyphProps {
  name: string;
  size?: number;
}

/** A clean, flat planet glyph. Saturn gets a subtle ring. */
export function PlanetGlyph({ name, size = 44 }: PlanetGlyphProps) {
  const color = planetColor[name] ?? '#8e8e93';
  const hasRing = name === 'Saturn';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      <defs>
        <radialGradient id={`grad-${name}`} cx="38%" cy="34%" r="75%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
          <stop offset="55%" stopColor={color} />
          <stop offset="100%" stopColor={color} />
        </radialGradient>
      </defs>
      {hasRing && (
        <ellipse
          cx="24"
          cy="24"
          rx="20"
          ry="6.5"
          fill="none"
          stroke={color}
          strokeWidth="2.4"
          opacity="0.55"
          transform="rotate(-20 24 24)"
        />
      )}
      <circle cx="24" cy="24" r="13" fill={`url(#grad-${name})`} />
      {hasRing && (
        <path
          d="M5 27.5 A20 6.5 0 0 0 43 20.5"
          fill="none"
          stroke={color}
          strokeWidth="2.4"
          opacity="0.55"
          transform="rotate(-20 24 24)"
        />
      )}
    </svg>
  );
}
