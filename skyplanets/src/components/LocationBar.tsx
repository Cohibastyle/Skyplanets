import { useEffect, useRef, useState } from 'react';
import type { LocationInfo } from '../lib/types';
import { searchLocations } from '../lib/geo';
import { Icon } from './Icon';

interface LocationBarProps {
  location: LocationInfo | null;
  onPick: (location: LocationInfo) => void;
  onUseMyLocation: () => void;
  locating: boolean;
}

export function LocationBar({
  location,
  onPick,
  onUseMyLocation,
  locating,
}: LocationBarProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LocationInfo[]>([]);
  const [searching, setSearching] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      return;
    }
    let active = true;
    setSearching(true);
    const id = setTimeout(async () => {
      try {
        const found = await searchLocations(trimmed);
        if (active) setResults(found);
      } catch {
        if (active) setResults([]);
      } finally {
        if (active) setSearching(false);
      }
    }, 280);
    return () => {
      active = false;
      clearTimeout(id);
    };
  }, [query]);

  return (
    <div className="location-bar" ref={boxRef}>
      <button
        type="button"
        className="location-pill"
        onClick={() => setOpen((v) => !v)}
      >
        <Icon name="location" size={18} />
        <span className="location-pill__text">
          {location ? location.name : 'Choose a location'}
        </span>
        <Icon name="chevron" size={16} className="location-pill__chevron" />
      </button>

      {open && (
        <div className="location-popover">
          <button
            type="button"
            className="location-popover__gps"
            onClick={() => {
              onUseMyLocation();
              setOpen(false);
            }}
            disabled={locating}
          >
            <Icon name="location" size={18} />
            {locating ? 'Locating…' : 'Use my current location'}
          </button>

          <div className="search-field">
            <Icon name="search" size={18} />
            <input
              type="text"
              value={query}
              autoFocus
              placeholder="Search city or place"
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className="search-results">
            {searching && <div className="search-hint">Searching…</div>}
            {!searching && query.trim().length >= 2 && results.length === 0 && (
              <div className="search-hint">No matches found</div>
            )}
            {results.map((r) => (
              <button
                key={`${r.latitude},${r.longitude}`}
                type="button"
                className="search-result"
                onClick={() => {
                  onPick(r);
                  setOpen(false);
                  setQuery('');
                  setResults([]);
                }}
              >
                <Icon name="location" size={16} />
                <span>{r.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
