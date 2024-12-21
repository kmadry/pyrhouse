import { useState, useCallback } from 'react';

export const useTransferDetails = () => {
  const [transfer, setTransfer] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchTransferDetails = useCallback(async (id: string) => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `https://pyrhouse-backend-f26ml.ondigitalocean.app/api/transfers/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) throw new Error('Nie udało się załadować szczegółów transferu');

      const data = await response.json();
      setTransfer(data);
    } catch (err: any) {
      setError(err.message || 'Wystąpił nieoczekiwany błąd.');
    } finally {
      setLoading(false);
    }
  }, []);

  return { transfer, loading, error, fetchTransferDetails };
};
