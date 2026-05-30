import type { PlanetVisibility } from '../lib/types';
import {
  formatTime,
  formatMagnitude,
  visibilityLabel,
  visibilityColor,
} from '../lib/format';
import { PlanetGlyph } from './PlanetGlyph';
import { Icon } from './Icon';

interface PlanetCardProps {
  planet: PlanetVisibility;
  onSelect: (planet: PlanetVisibility) => void;
}

export function PlanetCard({ planet, onSelect }: PlanetCardProps) {
  const color = visibilityColor[planet.visibilityState];

  return (
    <button
      type="button"
      className="planet-card"
      onClick={() => onSelect(planet)}
      aria-label={`${planet.name}, ${visibilityLabel[planet.visibilityState]}`}
    >
      <div className="planet-card__glyph">
        <PlanetGlyph name={planet.name} />
      </div>

      <div className="planet-card__body">
        <div className="planet-card__title-row">
          <span className="planet-card__name">{planet.name}</span>
          <span className="status-badge" style={{ color }}>
            <span className="status-dot" style={{ background: color }} />
            {visibilityLabel[planet.visibilityState]}
          </span>
        </div>

        <div className="planet-card__meta">
          <span className="meta-item">
            <Icon name="compass" size={15} />
            {planet.azimuthLabel} · {Math.round(planet.altitudeDeg)}°
          </span>
          <span className="meta-item">
            <Icon name="clock" size={15} />
            Rise {formatTime(planet.riseTimeLocal)} · Set{' '}
            {formatTime(planet.setTimeLocal)}
          </span>
          <span className="meta-item">
            <Icon name="sparkles" size={15} />
            Mag {formatMagnitude(planet.magnitude)}
          </span>
        </div>
      </div>

      <Icon name="chevron" size={18} className="planet-card__chevron" />
    </button>
  );
}
