import { useState, useEffect, useCallback } from 'react';
import { Location } from '../models/Location';

export const useLocations = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchLocations = useCallback(async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/locations`);
      if (!response.ok) {
        throw new Error('Nie udało się pobrać lokalizacji');
      }
      const data = await response.json();
      setLocations(data);
    } catch (err: any) {
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  return { locations, error, refetch: fetchLocations };
};
