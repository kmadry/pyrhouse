import { useState, useCallback } from 'react';
import { Transfer } from '../models/transfer';

export const useTransfers = () => {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchTransfers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        'https://pyrhouse-backend-f26ml.ondigitalocean.app/api/transfers',
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) throw new Error('Nie udało się załadować transferów');

      const data: Transfer[] = await response.json();
      setTransfers(data);
    } catch (err: any) {
      setError(err.message || 'Wystąpił nieoczekiwany błąd.');
    } finally {
      setLoading(false);
    }
  }, []);

  return { transfers, loading, error, fetchTransfers };
};
