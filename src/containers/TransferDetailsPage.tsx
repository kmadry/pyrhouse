import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTransferDetailsAPI, confirmTransferAPI } from '../services/transferService';
import { toast } from 'react-toastify';

interface Transfer {
  id: number;
  status: string;
  // dodaj inne potrzebne pola
}

const TransferDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [transfer, setTransfer] = useState<Transfer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [actionMenuAnchor, setActionMenuAnchor] = useState<null | HTMLElement>(null);

  const numericId = Number(id);

  const fetchTransferDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getTransferDetailsAPI(numericId);
      setTransfer(data);
    } catch (err: any) {
      setError(err.message || 'Wystąpił błąd podczas pobierania danych transferu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isNaN(numericId)) {
      setError('Nieprawidłowe ID transferu');
      setLoading(false);
      return;
    }

    fetchTransferDetails();
  }, [numericId]);

  const handleConfirmDelivery = async () => {
    setLoading(true);
    setError('');
    try {
      // Wyślij żądanie potwierdzenia
      await confirmTransferAPI(numericId, { status: 'delivered' });
      
      // Pobierz zaktualizowane dane transferu
      const updatedTransfer = await getTransferDetailsAPI(numericId);
      
      // Zaktualizuj stan komponentu
      setTransfer(updatedTransfer);
      
      // Zaktualizuj krok na podstawie nowego statusu
      if (updatedTransfer.status === 'delivered') {
        setCurrentStep(2);
      }
      
      // Pokaż toast o sukcesie
      toast.success('Transfer został potwierdzony');
    } catch (err: any) {
      console.error('Błąd podczas potwierdzania transferu:', err);
      setError(err.message || 'Nie udało się potwierdzić dostawy');
      toast.error('Nie udało się potwierdzić dostawy');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Render your component content here */}
    </div>
  );
};

export default TransferDetailsPage; 