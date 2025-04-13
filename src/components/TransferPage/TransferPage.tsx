import React, { useState, useEffect } from 'react';
import { Container, Typography } from '@mui/material';
import { useLocations } from '../../hooks/useLocations';
import { useStocks } from '../../hooks/useStocks';
import { createTransferAPI } from '../../services/transferService';
import { useNavigate } from 'react-router-dom';
import { TransferForm } from './components/TransferForm';

const TransferPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { locations, error: locationError, refetch: refetchLocations } = useLocations();
  const { stocks, error: stockError } = useStocks();
  const navigate = useNavigate();

  useEffect(() => {
    refetchLocations();
  }, [refetchLocations]);

  const handleSubmit = async (formData: any) => {
    try {
      setLoading(true);
      setError(null);

      const payload = {
        from_location_id: Number(formData.fromLocation),
        location_id: Number(formData.toLocation),
        assets: formData.items
          .filter((item: any) => item.type === 'pyr_code' && item.status === 'success')
          .map((item: any) => ({ id: item.id })),
        stocks: formData.items
          .filter((item: any) => item.type === 'stock')
          .map((item: any) => ({ id: item.id, quantity: Number(item.quantity) })),
      };

      if (!payload.assets?.length) delete payload.assets;
      if (!payload.stocks?.length) delete payload.stocks;

      const response = await createTransferAPI(payload);
      navigate(`/transfers/${response.id}`);
    } catch (err: any) {
      setError(err.message || 'Wystąpił błąd podczas tworzenia transferu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Utwórz Transfer
      </Typography>

      <TransferForm
        onSubmit={handleSubmit}
        locations={locations}
        stocks={stocks}
        loading={loading}
        error={error || locationError || stockError || undefined}
      />
    </Container>
  );
};

export default TransferPage; 