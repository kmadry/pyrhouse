import { useState, useCallback } from 'react';

export const useStocks = () => {
  const [stocks, setStocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchStocks = useCallback(async (locationId: string) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `https://pyrhouse-backend-f26ml.ondigitalocean.app/api/stocks?location_id=${locationId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) throw new Error('Failed to fetch stocks');
      const data = await response.json();
      setStocks(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  }, []);

  return { stocks, fetchStocks, loading, error };
};
