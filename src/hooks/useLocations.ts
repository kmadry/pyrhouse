import { useState, useEffect } from 'react';

export const useLocations = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(
          'https://pyrhouse-backend-f26ml.ondigitalocean.app/api/locations',
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!response.ok) throw new Error('Failed to fetch locations');
        const data = await response.json();
        setLocations(data);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, []);

  return { locations, loading, error };
};
