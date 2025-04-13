import { useState, useEffect } from 'react';
import { getApiUrl } from '../config/api';

interface TransferDetails {
  id: number;
  status: string;
  from_location: {
    id: number;
    name: string;
  };
  to_location: {
    id: number;
    name: string;
  };
  assets: Array<{
    id: number;
    pyrcode: string;
    category: {
      id: number;
      label: string;
    };
  }>;
  stocks: Array<{
    id: number;
    quantity: number;
    category: {
      id: number;
      label: string;
    };
  }>;
}

export const useTransferDetails = (id: number) => {
  const [transfer, setTransfer] = useState<TransferDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransferDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(getApiUrl(`/transfers/${id}`), {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Failed to fetch transfer details');
        const data = await response.json();
        setTransfer(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchTransferDetails();
  }, [id]);

  return { transfer, loading, error };
};
