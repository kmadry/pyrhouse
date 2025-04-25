import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Alert,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { useLocations } from '../../hooks/useLocations';
import { useStocks } from '../../hooks/useStocks';
import { createTransferAPI } from '../../services/transferService';
import { getUsersAPI } from '../../services/userService';
import { ErrorMessage } from '../ui/ErrorMessage';
import { useLocation, useNavigate } from 'react-router-dom';
import TransferForm from './components/TransferForm';
import { ConfirmationDialog } from './components/ConfirmationDialog';
import { QuestSection } from './components/QuestSection';
import { TransferFormData } from '../../types/transfer.types';

interface User {
  id: number;
  username: string;
  fullname: string;
}

interface Stock {
  id: number;
  category: {
    label: string;
  };
  quantity: number;
}

interface FormItem {
  type: 'pyr_code' | 'stock';
  id: string;
  pyrcode: string;
  quantity: number;
  status: string;
  category?: {
    label: string;
  };
}

const TransferPage: React.FC = () => {
  const { reset } = useForm<TransferFormData>({
    defaultValues: {
      fromLocation: 1,
      toLocation: '',
      items: [{ type: 'pyr_code', id: '', pyrcode: '', quantity: 0, status: '' }],
      users: [],
    },
  });

  const [users, setUsers] = useState<Array<{ id: number; username: string; fullname: string }>>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [transferData, setTransferData] = useState<TransferFormData | null>(null);

  const { locations, loading: locationsLoading, error: locationsError } = useLocations();
  const { stocks, loading: stocksLoading, error: stocksError } = useStocks();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchUsers = async () => {
      setUsersLoading(true);
      try {
        const data = await getUsersAPI();
        setUsers(data);
      } catch (error: any) {
        setUsersError(error.message);
      } finally {
        setUsersLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleFormSubmit = (formData: TransferFormData) => {
    setTransferData(formData);
    setShowConfirmation(true);
  };

  const handleConfirmSubmit = async () => {
    if (!transferData) return;

    if (!transferData.toLocation) {
      setSubmitError('Wybierz lokalizację docelową');
      return;
    }

    if (Number(transferData.fromLocation) === Number(transferData.toLocation)) {
      setSubmitError('Lokalizacja źródłowa i docelowa nie mogą być takie same');
      return;
    }

    const stockValidationErrors = transferData.items
      .filter((item: FormItem) => item.type === 'stock' && item.id)
      .map((item: FormItem) => {
        const selectedStock = stocks.find((stock: Stock) => stock.id === Number(item.id));
        if (!selectedStock) {
          return 'Nie znaleziono wybranego przedmiotu magazynowego';
        }
        if (Number(item.quantity) > selectedStock.quantity) {
          return `Dla przedmiotu "${selectedStock.category.label}" maksymalna dostępna ilość to: ${selectedStock.quantity}`;
        }
        if (Number(item.quantity) <= 0) {
          return `Dla przedmiotu "${selectedStock.category.label}" ilość musi być większa niż 0`;
        }
        return null;
      })
      .filter(Boolean);

    if (stockValidationErrors.length > 0) {
      setSubmitError(stockValidationErrors[0] as string);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const assets = transferData.items
        .filter((item: FormItem) => item.type === 'pyr_code' && item.status === 'success')
        .map((item: FormItem) => ({ id: Number(item.id) }));

      const stocks = transferData.items
        .filter((item: FormItem) => item.type === 'stock')
        .map((item: FormItem) => ({ id: Number(item.id), quantity: Number(item.quantity) }));

      const users = transferData.users.map((user: User) => ({ id: user.id }));

      const payload: {
        from_location_id: number;
        location_id: number;
        assets?: typeof assets;
        stocks?: typeof stocks;
        users?: typeof users;
      } = {
        from_location_id: Number(transferData.fromLocation),
        location_id: Number(transferData.toLocation),
      };

      if (assets.length > 0) payload.assets = assets;
      if (stocks.length > 0) payload.stocks = stocks;
      if (users.length > 0) payload.users = users;

      if (!assets.length && !stocks.length) {
        setSubmitError('Dodaj co najmniej jeden zasób lub pozycję magazynową');
        return;
      }

      const response = await createTransferAPI(payload);
      setSubmitError('Transfer został utworzony pomyślnie!');
      setTimeout(() => {
        navigate(`/transfers/${response.id}`);
      }, 500);
      reset();
    } catch (error: any) {
      setSubmitError(getErrorMessage(error.message));
    } finally {
      setIsSubmitting(false);
      setShowConfirmation(false);
    }
  };

  const getErrorMessage = (error: string): string => {
    const errorMessages: { [key: string]: string } = {
      'Invalid transfer data': 'Nieprawidłowe dane transferu',
      'Unauthorized access': 'Brak autoryzacji',
      'Access forbidden': 'Dostęp zabroniony',
      'Resource not found': 'Nie znaleziono zasobu',
      'Server error occurred': 'Wystąpił błąd serwera',
      'Request timeout': 'Przekroczono limit czasu żądania',
      'An unexpected error occurred': 'Wystąpił nieoczekiwany błąd',
      'Transfer from and to location cannot be the same': 'Lokalizacja źródłowa i docelowa nie mogą być takie same',
    };

    return errorMessages[error] || 'Wystąpił błąd podczas przetwarzania transferu';
  };

  return (
    <Container maxWidth="lg" sx={{ py: 2 }}>
      <QuestSection questData={location.state?.questData} />

      <Typography variant="h5" gutterBottom>
        Nowy transfer
      </Typography>

      {locationsError && <ErrorMessage message="Błąd podczas ładowania lokalizacji" details={locationsError} />}
      {stocksError && <ErrorMessage message="Błąd podczas ładowania zasobów" details={stocksError} />}
      {usersError && <ErrorMessage message="Błąd podczas ładowania użytkowników" details={usersError} />}
      {submitError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {submitError}
        </Alert>
      )}

      <TransferForm
        onSubmit={handleFormSubmit}
        onCancel={() => navigate('/transfers')}
        locations={locations}
        stocks={stocks}
        loading={locationsLoading || stocksLoading}
        error={submitError || undefined}
        users={users}
        usersLoading={usersLoading}
      />

      <ConfirmationDialog
        open={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={handleConfirmSubmit}
        formData={transferData}
        locations={locations}
        loading={isSubmitting}
      />
    </Container>
  );
};

export default TransferPage; 