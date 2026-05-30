import { useCallback, useState } from 'react';
import type { LocationInfo } from '../lib/types';
import { reverseGeocode } from '../lib/geo';

interface GeoState {
  locating: boolean;
  error: string | null;
}

export function useGeolocation() {
  const [state, setState] = useState<GeoState>({ locating: false, error: null });

  const request = useCallback(
    (onSuccess: (loc: LocationInfo) => void) => {
      if (!('geolocation' in navigator)) {
        setState({ locating: false, error: 'Geolocation is not supported.' });
        return;
      }
      setState({ locating: true, error: null });

      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          const name = await reverseGeocode(latitude, longitude);
          onSuccess({ name, latitude, longitude });
          setState({ locating: false, error: null });
        },
        (err) => {
          const message =
            err.code === err.PERMISSION_DENIED
              ? 'Location permission denied. Search for a place instead.'
              : 'Could not get your location. Try searching instead.';
          setState({ locating: false, error: message });
        },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 },
      );
    },
    [],
  );

  return { ...state, request };
}
