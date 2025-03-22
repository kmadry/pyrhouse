import { useState, useEffect, useCallback } from 'react';
import { Location } from '../models/Location';

export const useLocations = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchLocations = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/locations`);
      if (!response.ok) {
        throw new Error('Nie udało się pobrać lokalizacji');
      }
      const data = await response.json();
      setLocations(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  return { locations, error, loading, refetch: fetchLocations };
};
