import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import { createTransferAPI } from '../../../services/transferService';

interface TransferModalProps {
  open: boolean;
  onClose: () => void;
  fromLocationId: number;
  selectedAssets: number[];
  selectedStocks: number[];
  locations: any[];
  onSuccess: () => void;
}

export const TransferModal: React.FC<TransferModalProps> = ({
  open,
  onClose,
  fromLocationId,
  selectedAssets,
  selectedStocks,
  locations,
  onSuccess,
}) => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [toLocationId, setToLocationId] = React.useState<string>('');

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      const payload = {
        from_location_id: fromLocationId,
        location_id: Number(toLocationId),
        assets: selectedAssets.map(id => ({ id })),
        stocks: selectedStocks.map(id => ({ id, quantity: 1 })),
      };

      await createTransferAPI(payload);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Wystąpił błąd podczas tworzenia transferu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Utwórz Transfer</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Zaznaczone elementy:
          </Typography>
          {selectedAssets.length > 0 && (
            <Typography variant="body2">
              Sprzęt: {selectedAssets.length} sztuk
            </Typography>
          )}
          {selectedStocks.length > 0 && (
            <Typography variant="body2">
              Zasoby: {selectedStocks.length} pozycji
            </Typography>
          )}
        </Box>

        <FormControl fullWidth>
          <InputLabel>Do lokalizacji</InputLabel>
          <Select
            value={toLocationId}
            onChange={(e) => setToLocationId(e.target.value)}
            label="Do lokalizacji"
          >
            {locations
              .filter(loc => loc.id !== fromLocationId)
              .map((location) => (
                <MenuItem key={location.id} value={location.id}>
                  {location.name}
                </MenuItem>
              ))}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Anuluj</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={loading || !toLocationId}
        >
          {loading ? <CircularProgress size={24} /> : 'Utwórz transfer'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 