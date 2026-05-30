import type { WeatherInfo } from '../lib/types';
import { Icon } from './Icon';

interface WeatherBadgeProps {
  weather: WeatherInfo | null;
  loading: boolean;
}

const qualityText: Record<WeatherInfo['quality'], string> = {
  good: 'Clear skies',
  fair: 'Partly cloudy',
  poor: 'Cloudy',
};

const qualityColor: Record<WeatherInfo['quality'], string> = {
  good: '#34c759',
  fair: '#ff9f0a',
  poor: '#8e8e93',
};

export function WeatherBadge({ weather, loading }: WeatherBadgeProps) {
  if (loading) {
    return (
      <div className="weather-badge weather-badge--muted">
        <Icon name="cloud" size={18} />
        <span>Checking sky conditions…</span>
      </div>
    );
  }

  if (!weather) {
    return (
      <div className="weather-badge weather-badge--muted">
        <Icon name="cloud" size={18} />
        <span>Weather unavailable</span>
      </div>
    );
  }

  const color = qualityColor[weather.quality];

  return (
    <div className="weather-badge">
      <Icon name="cloud" size={18} style={{ color }} />
      <span className="weather-badge__quality" style={{ color }}>
        {qualityText[weather.quality]}
      </span>
      <span className="weather-badge__detail">
        {Math.round(weather.cloudCoverPct)}% cloud
        {weather.temperatureC !== undefined &&
          ` · ${Math.round(weather.temperatureC)}°`}
      </span>
    </div>
  );
}
