import { useEffect, useMemo, useState } from 'react';
import type { LocationInfo, PlanetVisibility, WeatherInfo } from './lib/types';
import { buildSkyReport } from './lib/astronomy';
import { fetchWeather } from './lib/weather';
import { useGeolocation } from './hooks/useGeolocation';
import { LocationBar } from './components/LocationBar';
import { WeatherBadge } from './components/WeatherBadge';
import { TimeControl } from './components/TimeControl';
import { PlanetCard } from './components/PlanetCard';
import { PlanetDetail } from './components/PlanetDetail';
import { SkyDome } from './components/SkyDome';
import { Icon } from './components/Icon';
import './App.css';

export default function App() {
  const [location, setLocation] = useState<LocationInfo | null>(null);
  const [offsetHours, setOffsetHours] = useState(0);
  const [selected, setSelected] = useState<PlanetVisibility | null>(null);
  const [weather, setWeather] = useState<WeatherInfo | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const { locating, error, request } = useGeolocation();

  // Ask for the user's location on first load.
  useEffect(() => {
    request(setLocation);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const observationTime = useMemo(
    () => new Date(Date.now() + offsetHours * 3600_000),
    [offsetHours],
  );

  const report = useMemo(() => {
    if (!location) return null;
    return buildSkyReport(location, observationTime);
  }, [location, observationTime]);

  // Load weather whenever the location changes.
  useEffect(() => {
    if (!location) return;
    let active = true;
    setWeatherLoading(true);
    setWeather(null);
    fetchWeather(location.latitude, location.longitude)
      .then((w) => {
        if (active) setWeather(w);
      })
      .finally(() => {
        if (active) setWeatherLoading(false);
      });
    return () => {
      active = false;
    };
  }, [location]);

  const visibleCount =
    report?.planets.filter((p) => p.visibilityState === 'visible').length ?? 0;

  return (
    <div className="app">
      <header className="app__header">
        <div className="brand">
          <span className="brand__mark">
            <Icon name="sparkles" size={20} />
          </span>
          <span className="brand__name">SkyPlanets</span>
        </div>
        <LocationBar
          location={location}
          onPick={setLocation}
          onUseMyLocation={() => request(setLocation)}
          locating={locating}
        />
      </header>

      <main className="app__main">
        {!location && (
          <div className="empty-state">
            <span className="empty-state__icon">
              <Icon name="location" size={34} />
            </span>
            <h1 className="empty-state__title">See the planets above you</h1>
            <p className="empty-state__text">
              {error ??
                'Allow location access, or search for a place to find out which planets are in view.'}
            </p>
            <button
              type="button"
              className="primary-button"
              onClick={() => request(setLocation)}
              disabled={locating}
            >
              <Icon name="location" size={18} />
              {locating ? 'Locating…' : 'Use my location'}
            </button>
          </div>
        )}

        {location && report && (
          <>
            <section className="hero-card">
              <div className="hero-card__top">
                <div>
                  <p className="hero-card__eyebrow">
                    {report.isDark ? 'Dark sky' : 'Daytime sky'}
                  </p>
                  <h1 className="hero-card__headline">
                    {visibleCount > 0
                      ? `${visibleCount} planet${visibleCount > 1 ? 's' : ''} in view`
                      : report.isDark
                        ? 'No planets high enough right now'
                        : 'Wait for darkness to spot planets'}
                  </h1>
                </div>
                <WeatherBadge weather={weather} loading={weatherLoading} />
              </div>
              <TimeControl
                offsetHours={offsetHours}
                onChange={setOffsetHours}
                observationTime={observationTime}
                isDark={report.isDark}
              />
            </section>

            {error && <div className="inline-note">{error}</div>}

            <section className="sky-card">
              <SkyDome planets={report.planets} onSelect={setSelected} />
            </section>

            <section className="planet-list">
              {report.planets.map((planet) => (
                <PlanetCard
                  key={planet.name}
                  planet={planet}
                  onSelect={setSelected}
                />
              ))}
            </section>

            <p className="footnote">
              Positions calculated locally for{' '}
              {observationTime.toLocaleString([], {
                weekday: 'long',
                hour: 'numeric',
                minute: '2-digit',
              })}
              . Visibility ignores local terrain and obstructions.
            </p>
          </>
        )}
      </main>

      {selected && (
        <PlanetDetail planet={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
