import { useState, useEffect } from 'react';
import { getApiUrl } from '../config/api';

const TYPES_API = '/service-desk/request-types';

export const useServiceDeskTypes = () => {
  const [types, setTypes] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cached = sessionStorage.getItem('serviceDeskTypes');
    if (cached) {
      setTypes(JSON.parse(cached));
      return;
    }
    setLoading(true);
    const token = localStorage.getItem('token');
    fetch(getApiUrl(TYPES_API), {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then((data: any[]) => {
        const map: Record<string, any> = {};
        data.forEach((t: any) => { map[t.id] = t; });
        setTypes(map);
        sessionStorage.setItem('serviceDeskTypes', JSON.stringify(map));
      })
      .catch(e => setError(e.message || 'Błąd pobierania typów zgłoszeń'))
      .finally(() => setLoading(false));
  }, []);
  return { types, loading, error };
}; 