import React from 'react';
import { useParams } from 'react-router-dom';
import { cancelTransferAPI } from '../services/transferService';
import { Button } from '@mui/material';

const TransferDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const numericId = parseInt(id || '0', 10);

  const handleCancelTransfer = async () => {
    try {
      await cancelTransferAPI(String(numericId));
      // Dodaj odpowiednią obsługę sukcesu
    } catch (error) {
      console.error('Error canceling transfer:', error);
    }
  };

  return (
    <div>
      <Button onClick={handleCancelTransfer} variant="contained" color="error">
        Anuluj transfer
      </Button>
    </div>
  );
};

export default TransferDetailsPage; 