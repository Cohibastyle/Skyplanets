import { useEffect } from 'react';
import type { PlanetVisibility } from '../lib/types';
import {
  formatTime,
  formatMagnitude,
  visibilityLabel,
  visibilityColor,
  planetColor,
} from '../lib/format';
import { PlanetGlyph } from './PlanetGlyph';
import { AltitudeChart } from './AltitudeChart';
import { Icon } from './Icon';

interface PlanetDetailProps {
  planet: PlanetVisibility;
  onClose: () => void;
}

export function PlanetDetail({ planet, onClose }: PlanetDetailProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const accent = planetColor[planet.name] ?? '#4f6bd8';
  const statusColor = visibilityColor[planet.visibilityState];

  return (
    <div
      className="sheet-backdrop"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="sheet"
        role="dialog"
        aria-modal="true"
        aria-label={`${planet.name} details`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sheet__grabber" />
        <button
          type="button"
          className="sheet__close"
          onClick={onClose}
          aria-label="Close"
        >
          <Icon name="close" size={18} />
        </button>

        <div className="sheet__hero">
          <PlanetGlyph name={planet.name} size={64} />
          <div>
            <h2 className="sheet__title">{planet.name}</h2>
            <span className="status-badge" style={{ color: statusColor }}>
              <span className="status-dot" style={{ background: statusColor }} />
              {visibilityLabel[planet.visibilityState]}
            </span>
          </div>
        </div>

        <p className="sheet__guidance">
          <Icon name="eye" size={18} />
          {planet.guidance}
        </p>

        <div className="stat-grid">
          <Stat label="Altitude" value={`${Math.round(planet.altitudeDeg)}°`} />
          <Stat label="Direction" value={planet.azimuthLabel} />
          <Stat label="Magnitude" value={formatMagnitude(planet.magnitude)} />
          <Stat label="Rises" value={formatTime(planet.riseTimeLocal)} />
          <Stat label="Sets" value={formatTime(planet.setTimeLocal)} />
          <Stat label="Highest" value={formatTime(planet.transitTimeLocal)} />
        </div>

        {planet.bestTimeLocal && (
          <div className="best-window">
            <Icon name="sparkles" size={18} />
            <span>
              Best viewing tonight around{' '}
              <strong>{formatTime(planet.bestTimeLocal)}</strong>
            </span>
          </div>
        )}

        <div className="sheet__section">
          <h3 className="sheet__section-title">Next 24 hours</h3>
          <AltitudeChart trend={planet.altitudeTrend} accent={accent} />
          <p className="chart-caption">
            Height above the horizon. Shaded areas are dark-sky hours.
          </p>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="stat">
      <span className="stat__value">{value}</span>
      <span className="stat__label">{label}</span>
    </div>
  );
}
