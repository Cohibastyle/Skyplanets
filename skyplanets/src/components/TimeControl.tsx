import { Icon } from './Icon';

interface TimeControlProps {
  offsetHours: number;
  onChange: (hours: number) => void;
  observationTime: Date;
  isDark: boolean;
}

export function TimeControl({
  offsetHours,
  onChange,
  observationTime,
  isDark,
}: TimeControlProps) {
  const isNow = offsetHours === 0;
  const timeLabel = observationTime.toLocaleString([], {
    weekday: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <div className="time-control">
      <div className="time-control__head">
        <span className="time-control__label">
          <Icon name={isDark ? 'moon' : 'sun'} size={16} />
          {isNow ? 'Right now' : timeLabel}
        </span>
        {!isNow && (
          <button
            type="button"
            className="time-control__reset"
            onClick={() => onChange(0)}
          >
            Now
          </button>
        )}
      </div>
      <input
        type="range"
        min={0}
        max={48}
        step={0.05}
        value={offsetHours}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label="Hours from now"
        className="time-slider"
      />
      <div className="time-control__scale">
        <span>Now</span>
        <span>+24h</span>
        <span>+48h</span>
      </div>
    </div>
  );
}
