interface AltitudeChartProps {
  trend: { time: Date; altitude: number; azimuth: number; sunAltitude: number }[];
  accent: string;
}

const WIDTH = 320;
const HEIGHT = 140;
const PAD_X = 8;
const PAD_TOP = 10;
const PAD_BOTTOM = 22;

/** Simple SVG line chart of altitude over the next 24 hours. */
export function AltitudeChart({ trend, accent }: AltitudeChartProps) {
  if (trend.length === 0) return null;

  const innerW = WIDTH - PAD_X * 2;
  const innerH = HEIGHT - PAD_TOP - PAD_BOTTOM;

  // Altitude scale: -20° to 90°.
  const minAlt = -20;
  const maxAlt = 90;
  const x = (i: number) => PAD_X + (i / (trend.length - 1)) * innerW;
  const y = (alt: number) =>
    PAD_TOP + innerH - ((alt - minAlt) / (maxAlt - minAlt)) * innerH;

  const horizonY = y(0);

  const linePoints = trend
    .map((p, i) => `${x(i).toFixed(1)},${y(p.altitude).toFixed(1)}`)
    .join(' ');

  const areaPoints = `${PAD_X},${horizonY} ${linePoints} ${PAD_X + innerW},${horizonY}`;

  // Shade dark (night) hours where the sun is below -6°.
  const darkBands: { x0: number; x1: number }[] = [];
  let start: number | null = null;
  trend.forEach((p, i) => {
    const dark = p.sunAltitude <= -6;
    if (dark && start === null) start = i;
    if (!dark && start !== null) {
      darkBands.push({ x0: x(start), x1: x(i) });
      start = null;
    }
  });
  if (start !== null) darkBands.push({ x0: x(start), x1: x(trend.length - 1) });

  const startHour = trend[0].time.getHours();
  const labels = [0, 6, 12, 18, 24].map((h) => ({
    i: h,
    label: `${(startHour + h) % 24}h`,
  }));

  return (
    <svg
      width="100%"
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      role="img"
      aria-label="Altitude over the next 24 hours"
      className="altitude-chart"
    >
      {darkBands.map((b, i) => (
        <rect
          key={i}
          x={b.x0}
          y={PAD_TOP}
          width={b.x1 - b.x0}
          height={innerH}
          fill="#0a1736"
          opacity="0.05"
        />
      ))}

      {/* Horizon line */}
      <line
        x1={PAD_X}
        x2={WIDTH - PAD_X}
        y1={horizonY}
        y2={horizonY}
        stroke="#c7c7cc"
        strokeWidth="1"
        strokeDasharray="3 3"
      />

      <polygon points={areaPoints} fill={accent} opacity="0.12" />
      <polyline
        points={linePoints}
        fill="none"
        stroke={accent}
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {labels.map((l) => (
        <text
          key={l.i}
          x={x(l.i)}
          y={HEIGHT - 6}
          fontSize="10"
          fill="#8e8e93"
          textAnchor="middle"
        >
          {l.label}
        </text>
      ))}
    </svg>
  );
}
