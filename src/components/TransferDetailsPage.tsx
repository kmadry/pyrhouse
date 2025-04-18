import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  Container,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Paper,
  List,
  ListItem,
  ListItemText,
  Chip,
  ListItemAvatar,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Divider,
} from '@mui/material';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import UTurnLeftIcon from '@mui/icons-material/UTurnLeft';
import ErrorIcon from '@mui/icons-material/Error';
import RestoreIcon from '@mui/icons-material/Restore';
import CancelIcon from '@mui/icons-material/Cancel';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { getTransferDetailsAPI, confirmTransferAPI, restoreAssetToLocationAPI, restoreStockToLocationAPI, cancelTransferAPI } from '../services/transferService';
import { ErrorMessage } from './ErrorMessage';
import { useLocations } from '../hooks/useLocations';
import { MapPosition, locationService } from '../services/locationService';
import LocationPicker from './LocationPicker';
import { useAuth } from '../hooks/useAuth';

const statusTranslations: { [key: string]: string } = {
  'created': 'Utworzony',
  'in_transit': 'W drodze',
  'delivered': 'Dostarczony',
  'cancelled': 'Anulowany',
  'completed': 'Dostarczony'
};

interface RestoreDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (locationId: number, quantity?: number) => void;
  locations: any[];
  itemType: 'asset' | 'stock';
  currentQuantity?: number;
}

const RestoreDialog: React.FC<RestoreDialogProps> = ({ open, onClose, onConfirm, locations, itemType, currentQuantity }) => {
  const [selectedLocation, setSelectedLocation] = useState<number>(1);
  const [quantity, setQuantity] = useState<string>('');

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d+$/.test(value)) {
      setQuantity(value);
    }
  };

  const handleConfirm = () => {
    const numericQuantity = quantity === '' ? 0 : parseInt(quantity);
    if (itemType === 'stock' && (numericQuantity <= 0 || numericQuantity > (currentQuantity || 1))) {
      return;
    }
    onConfirm(selectedLocation, itemType === 'stock' ? numericQuantity : undefined);
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Przywróć do magazynu</DialogTitle>
      <DialogContent>
        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel>Wybierz magazyn</InputLabel>
          <Select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(Number(e.target.value))}
            label="Wybierz magazyn"
          >
            {locations.map((location) => (
              <MenuItem key={location.id} value={location.id}>
                {location.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {itemType === 'stock' && (
          <TextField
            fullWidth
            label="Ilość do zwrócenia"
            value={quantity}
            onChange={handleQuantityChange}
            inputProps={{ 
              inputMode: 'numeric',
              pattern: '[0-9]*',
              min: 1,
              max: currentQuantity
            }}
            helperText={`Maksymalna dostępna ilość: ${currentQuantity}`}
            sx={{ mt: 2 }}
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Anuluj</Button>
        <Button 
          onClick={handleConfirm} 
          variant="contained" 
          color="primary"
          disabled={itemType === 'stock' && (quantity === '' || parseInt(quantity) <= 0 || parseInt(quantity) > (currentQuantity || 1))}
        >
          Potwierdź
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const TransferDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { userRole } = useAuth();
  const [transfer, setTransfer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{ id: number; type: 'asset' | 'stock'; originalId?: number } | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [locationDialogOpen, setLocationDialogOpen] = useState(false);
  const { locations, refetch: fetchLocations } = useLocations();

  const numericId = Number(id);

  const hasAdminAccess = () => {
    return userRole === 'admin' || userRole === 'moderator';
  };

  const fetchTransferDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getTransferDetailsAPI(numericId);
      setTransfer(data);

      switch (data.status) {
        case 'in_transit':
          setCurrentStep(1);
          break;
        case 'completed':
          setCurrentStep(2);
          break;
        case 'cancelled':
          setCurrentStep(2);
          break;
        default:
          setCurrentStep(0);
      }
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

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  const handleConfirmTransfer = async () => {
    setLoading(true);
    setError('');
    try {
      await confirmTransferAPI(numericId, { status: 'completed' });
      
      // Pobierz zaktualizowane dane transferu
      const updatedTransfer = await getTransferDetailsAPI(numericId);
      
      // Zaktualizuj stan komponentu
      setTransfer(updatedTransfer);
      
      // Zaktualizuj krok na podstawie nowego statusu
      if (updatedTransfer.status === 'completed') {
        setCurrentStep(2);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to confirm transfer.');
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreClick = (id: number, type: 'asset' | 'stock', categoryId?: number) => {
    setSelectedItem({ 
      id: type === 'stock' ? categoryId! : id, 
      type,
      originalId: type === 'stock' ? id : undefined
    });
    setRestoreDialogOpen(true);
  };

  const handleRestoreConfirm = async (locationId: number, quantity?: number) => {
    if (!selectedItem) return;

    setLoading(true);
    setError('');
    try {
      if (selectedItem.type === 'asset') {
        await restoreAssetToLocationAPI(numericId, selectedItem.id, locationId);
      } else {
        await restoreStockToLocationAPI(numericId, selectedItem.id, locationId, quantity);
      }
      await fetchTransferDetails();
    } catch (err: any) {
      setError(err.message || 'Nie udało się przywrócić przedmiotu.');
    } finally {
      setLoading(false);
      setRestoreDialogOpen(false);
      setSelectedItem(null);
    }
  };

  const handleCancelTransfer = async () => {
    setLoading(true);
    setError('');
    try {
      await cancelTransferAPI(String(numericId));
      setTransfer((prev: any) => ({ ...prev, status: 'cancelled' }));
      setCancelDialogOpen(false);
    } catch (err: any) {
      setError(err.message || 'Nie udało się anulować transferu');
    } finally {
      setLoading(false);
    }
  };

  const handleLocationUpdate = async (location: MapPosition) => {
    setLoading(true);
    setError('');
    try {
      await locationService.updateTransferLocation(numericId, location);
      await fetchTransferDetails();
    } catch (err: any) {
      setError(err.message || 'Nie udało się zaktualizować lokalizacji');
    } finally {
      setLoading(false);
      setLocationDialogOpen(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'in_transit':
        return <LocalShippingIcon sx={{ color: 'orange', ml: 2 }} />;
      case 'delivered':
      case 'available':
      case 'located':
        return <CheckCircleIcon sx={{ color: 'green', ml: 2 }} />;
      case 'returned':
        return <UTurnLeftIcon sx={{ color: 'orange', ml: 2 }} />;
      default:
        return <ErrorIcon sx={{ color: 'red', ml: 2 }} />;
    }
  };

  const getSteps = () => {
    if (transfer?.status === 'cancelled') {
      return ['Utworzony', 'W drodze', 'Anulowany'];
    }
    return ['Utworzony', 'W drodze', 'Dostarczony'];
  };

  const getCurrentStep = () => {
    if (!transfer) return 0;
    switch (transfer.status) {
      case 'created':
        return 0;
      case 'in_transit':
        return 1;
      case 'delivered':
      case 'completed':
        return 2;
      case 'cancelled':
        return 2;
      default:
        return 0;
    }
  };

  useEffect(() => {
    if (transfer) {
      setCurrentStep(getCurrentStep());
    }
  }, [transfer]);

  if (loading) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <ErrorMessage message={error} />
      </Container>
    );
  }

  if (!transfer) {
    return null;
  }

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Status Quest'a
      </Typography>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box>
          <Stepper activeStep={currentStep}>
            {getSteps().map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>
        {transfer.status === 'in_transit' && hasAdminAccess() && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Akcje transferu
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1.5, justifyContent: 'center' }}>
              <Button
                variant="contained"
                color="success"
                onClick={handleConfirmTransfer}
                disabled={loading}
                startIcon={<CheckCircleIcon />}
                sx={{ 
                  py: 1, 
                  px: 2,
                  borderRadius: 1.5,
                  fontSize: '0.875rem',
                  boxShadow: 1,
                  '&:hover': {
                    boxShadow: 2,
                    backgroundColor: 'success.dark',
                  }
                }}
              >
                Potwierdź dostawę
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={() => setCancelDialogOpen(true)}
                disabled={loading}
                startIcon={<CancelIcon />}
                sx={{ 
                  py: 1, 
                  px: 2,
                  borderRadius: 1.5,
                  fontSize: '0.875rem',
                  borderWidth: 1.5,
                  '&:hover': {
                    borderWidth: 1.5,
                    backgroundColor: 'error.lighter',
                  }
                }}
              >
                Anuluj quest
              </Button>
            </Box>
          </Box>
        )}
      </Paper>

      <Paper sx={{ mt: 4, p: 3, borderRadius: 2, boxShadow: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocalShippingIcon color="primary" />
            Informacje
          </Typography>
          {transfer.status === 'in_transit' && (
            <Button
              variant="outlined"
              color="primary"
              onClick={() => setLocationDialogOpen(true)}
              disabled={loading}
              startIcon={<MyLocationIcon />}
              sx={{ 
                py: 0.75,
                px: 1.5,
                borderRadius: 1.5,
                fontSize: '0.875rem',
                borderWidth: 1.5,
                '&:hover': {
                  borderWidth: 1.5,
                  backgroundColor: 'primary.lighter',
                }
              }}
            >
              Aktualizuj lokalizację
            </Button>
          )}
        </Box>
        <Divider sx={{ mb: 3 }} />
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Lokalizacja źródłowa
            </Typography>
            <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocationOnIcon fontSize="small" color="action" />
              {transfer.from_location?.name}
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Lokalizacja docelowa
            </Typography>
            <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocationOnIcon fontSize="small" color="action" />
              {transfer.to_location?.name}
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Status
            </Typography>
            <Chip 
              label={statusTranslations[transfer.status] || transfer.status} 
              color={
                transfer.status === 'completed' ? 'success' : 
                transfer.status === 'in_transit' ? 'warning' : 
                transfer.status === 'cancelled' ? 'error' : 'default'
              }
              size="small"
            />
          </Box>
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Data transferu
            </Typography>
            <Typography variant="body1">
              {new Date(transfer.transfer_date).toLocaleString()}
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Paper sx={{ mt: 4, p: 3 }}>
        <Typography variant="h6">Sprzęt</Typography>
        {transfer.assets && transfer.assets.length > 0 ? (
          <List>
            {transfer.assets.map((asset: any) => (
              <ListItem
                key={asset.id}
                sx={{ display: 'flex', alignItems: 'center' }}
                secondaryAction={
                  transfer.status === 'in_transit' && (
                    <Tooltip title="Przywróć do magazynu">
                      <IconButton
                        edge="end"
                        aria-label="restore"
                        onClick={() => handleRestoreClick(asset.id, 'asset')}
                      >
                        <RestoreIcon />
                      </IconButton>
                    </Tooltip>
                  )
                }
              >
                <ListItemAvatar>
                  <Chip
                    icon={getStatusIcon(asset.status)}
                    color="success"
                    sx={{ mr: 2 }}
                  />
                </ListItemAvatar>
                <ListItemText
                  primary={`${asset.category?.label || 'N/A'} ${asset.pyrcode}`}
                  secondary={`Pochodzenie: ${asset.origin || 'N/A'}`}
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography>Brak sprzętu w tej dostawie.</Typography>
        )}
      </Paper>

      <Paper sx={{ mt: 4, p: 3 }}>
        <Typography variant="h6">Zasoby</Typography>
        {transfer.stock_items && transfer.stock_items.length > 0 ? (
          <List>
            {transfer.stock_items.map((stock: any) => (
              <ListItem
                key={stock.id}
                sx={{ display: 'flex', alignItems: 'center' }}
                secondaryAction={
                  transfer.status === 'in_transit' && (
                    <Tooltip title="Przywróć do magazynu">
                      <IconButton
                        edge="end"
                        aria-label="restore"
                        onClick={() => handleRestoreClick(stock.id, 'stock', stock.category.id)}
                      >
                        <RestoreIcon />
                      </IconButton>
                    </Tooltip>
                  )
                }
              >
                <ListItemAvatar>
                  <Chip
                    label={`${stock.quantity}`}
                    color="primary"
                    sx={{ mr: 2 }}
                  />
                </ListItemAvatar>
                <ListItemText
                  primary={`${stock.category?.label || 'N/A'}`}
                  secondary={`Pochodzenie: ${stock.origin || 'N/A'}`}
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography>Brak zasobów w tej dostawie.</Typography>
        )}
      </Paper>

      {restoreDialogOpen && selectedItem && (
        <RestoreDialog
          open={restoreDialogOpen}
          onClose={() => setRestoreDialogOpen(false)}
          onConfirm={handleRestoreConfirm}
          locations={locations || []}
          itemType={selectedItem.type}
          currentQuantity={
            selectedItem.type === 'stock' 
              ? transfer?.stock_items.find((item: any) => item.id === selectedItem.originalId)?.quantity 
              : undefined
          }
        />
      )}

      <Dialog
        open={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
      >
        <DialogTitle>Potwierdź anulowanie transferu</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Czy na pewno chcesz anulować ten transfer?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 2, py: 1.5 }}>
          <Button 
            onClick={() => setCancelDialogOpen(false)}
            sx={{ 
              fontSize: '0.875rem',
              py: 0.75,
              px: 1.5,
            }}
          >
            Anuluj
          </Button>
          <Button 
            onClick={handleCancelTransfer} 
            color="error" 
            variant="contained"
            sx={{ 
              fontSize: '0.875rem',
              py: 0.75,
              px: 1.5,
              borderRadius: 1.5,
            }}
          >
            Potwierdź anulowanie
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={locationDialogOpen}
        onClose={() => setLocationDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <MyLocationIcon color="primary" />
            <Typography variant="h6">Aktualizuj lokalizację transferu</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <LocationPicker
            onLocationSelect={handleLocationUpdate}
            onSave={() => setLocationDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default TransferDetailsPage;
