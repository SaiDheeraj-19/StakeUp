"use client";

import { useState, useEffect } from 'react';

interface GeolocationState {
  lat: number | null;
  lon: number | null;
  error: string | null;
  loading: boolean;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    lat: null,
    lon: null,
    error: typeof navigator !== "undefined" && !navigator.geolocation ? 'Geolocation is not supported by your browser' : null,
    loading: typeof navigator !== "undefined" && !navigator.geolocation ? false : true,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      return;
    }

    const success = (position: GeolocationPosition) => {
      setState({
        lat: position.coords.latitude,
        lon: position.coords.longitude,
        error: null,
        loading: false,
      });
    };

    const error = (err: GeolocationPositionError) => {
      setState((s) => ({ ...s, error: err.message, loading: false }));
    };

    navigator.geolocation.getCurrentPosition(success, error, {
      enableHighAccuracy: false,
      timeout: 5000,
      maximumAge: 1000 * 60 * 15 // cache for 15 mins
    });
  }, []);

  return state;
}
