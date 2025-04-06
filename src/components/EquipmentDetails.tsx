import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Divider,
  Grid,
  Chip,
  Card,
  CardContent,
  List,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  CheckCircle,
  LocationOn,
  Schedule,
  History,
  Info,
  Delete as DeleteIcon,
  LocalShipping,
  RemoveCircle,
  CheckCircleOutline,
  Warehouse,
} from '@mui/icons-material';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { ErrorMessage } from './ErrorMessage';
import { deleteAsset } from '../services/assetService';
import { BarcodeGenerator } from './BarcodeGenerator';
import { useLocations } from '../hooks/useLocations';

interface AssetLog {
  id: number;
  resource_id: number;
  resource_type: string;
  action: string;
  data: {
    location_id?: number;
    pyrcode?: string;
    msg: string;
    quantity?: number;
    from_location_id?: number;
    to_location_id?: number;
  };
  created_at: string;
}

const EquipmentDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type') || 'asset';
  const navigate = useNavigate();
  const { locations } = useLocations();

  const [details, setDetails] = useState<any | null>(null);
  const [logs, setLogs] = useState<AssetLog[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showBarcode, setShowBarcode] = useState(false);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://pyrhouse-backend-f26ml.ondigitalocean.app/api/items/${type}/${id}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch equipment details');
      }

      const data = await response.json();
      setDetails(data[type]); // 'asset' or 'stock' key
      setLogs(data.assetLogs || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id, type]);

  // Sortowanie logów według daty utworzenia (od najnowszych do najstarszych)
  const sortedLogs = [...logs].sort((a, b) => {
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const handleDelete = async () => {
    if (!id) return;
    
    try {
      setIsDeleting(true);
      const success = await deleteAsset(Number(id));
      if (success) {
        navigate('/list'); // Przekieruj do listy sprzętu tylko po pomyślnym usunięciu
      } else {
        setError('Nie udało się usunąć zasobu. Spróbuj ponownie później.');
        // Automatycznie ukryj błąd po 5 sekundach
        setTimeout(() => {
          setError('');
        }, 5000);
      }
    } catch (err: any) {
      // Wyświetl błąd z API, jeśli jest dostępny
      if (err.message && typeof err.message === 'object') {
        if (err.message.details) {
          setError(err.message.details);
        } else if (err.message.message) {
          setError(err.message.message);
        } else {
          setError(JSON.stringify(err.message));
        }
      } else {
        setError(err.message || 'Wystąpił błąd podczas usuwania zasobu');
      }
      // Automatycznie ukryj błąd po 5 sekundach
      setTimeout(() => {
        setError('');
      }, 5000);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirmation(false);
    }
  };

  const getLocationName = (locationId: number) => {
    const location = locations.find(loc => loc.id === locationId);
    return location ? location.name : `Lokalizacja ${locationId}`;
  };

  const formatLogMessage = (log: AssetLog) => {
    return log.data.msg;
  };

  const getLocationInfo = (log: AssetLog) => {
    if (log.action === 'in_transfer' || log.action === 'delivered') {
      const fromLocation = log.data.from_location_id ? getLocationName(log.data.from_location_id) : 'Nieznana';
      const toLocation = log.data.to_location_id ? getLocationName(log.data.to_location_id) : 'Nieznana';
      
      // Sprawdź, czy to_location_id to 1 (magazyn)
      const isReturnedToWarehouse = log.data.to_location_id === 1;
      
      return { 
        fromLocation, 
        toLocation,
        isReturnedToWarehouse
      };
    }
    return null;
  };

  const getActionLabel = (action: string, log: AssetLog) => {
    // Sprawdź, czy to zwrot do magazynu (to_location_id = 1)
    const isReturnedToWarehouse = log.action.toUpperCase() === 'DELIVERED' && log.data.to_location_id === 1;
    
    if (isReturnedToWarehouse) {
      return 'Zwrócono do magazynu';
    }
    
    switch (action.toUpperCase()) {
      case 'DELIVERED':
        return 'Dostarczone';
      case 'IN_TRANSFER':
        return 'W dostawie';
      case 'REMOVE':
        return 'Usunięte';
      default:
        return action.toUpperCase();
    }
  };

  const getActionIcon = (action: string, log: AssetLog) => {
    // Sprawdź, czy to zwrot do magazynu (to_location_id = 1)
    const isReturnedToWarehouse = log.action.toUpperCase() === 'DELIVERED' && log.data.to_location_id === 1;
    
    if (isReturnedToWarehouse) {
      return <Warehouse sx={{ mr: 1, color: 'success.main' }} />;
    }
    
    switch (action.toUpperCase()) {
      case 'DELIVERED':
        return <CheckCircleOutline sx={{ mr: 1, color: 'success.main' }} />;
      case 'IN_TRANSFER':
        return <LocalShipping sx={{ mr: 1, color: 'info.main' }} />;
      case 'REMOVE':
        return <RemoveCircle sx={{ mr: 1, color: 'error.main' }} />;
      default:
        return <Info sx={{ mr: 1 }} />;
    }
  };

  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <CircularProgress />
        <Typography>Loading details...</Typography>
      </Box>
    );
  }

  if (!details) {
    return (
      <Typography variant="h6" sx={{ textAlign: 'center', mt: 4 }}>
        Nie znaleziono szczegółów sprzętu.
      </Typography>
    );
  }

  return (
    <Box sx={{ margin: '0 auto', padding: 4, maxWidth: '960px' }}>
      {error && <ErrorMessage message={error} />}
      
      <Typography variant="h4" gutterBottom>
        Szczegóły sprzętu
      </Typography>

      {/* Quick Stats Section */}
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 4 }}>
        <Chip
          icon={<CheckCircle />}
          label={`Type: ${type.charAt(0).toUpperCase() + type.slice(1)}`}
          color="success"
          sx={{ fontSize: '0.875rem' }}
        />
        <Chip
          icon={<LocationOn />}
          label={`Location: ${details.location?.name || 'Unknown'}`}
          color="primary"
          sx={{ fontSize: '0.875rem' }}
        />
        {type === 'stock' && (
          <Chip
            icon={<Schedule />}
            label={`Quantity: ${details.quantity || 'N/A'}`}
            color="secondary"
            sx={{ fontSize: '0.875rem' }}
          />
        )}
      </Box>

      {/* Basic Information Section */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ padding: 3 }}>
            <Typography variant="h6" gutterBottom>
              <Info sx={{ verticalAlign: 'bottom', marginRight: 1 }} />
              Basic Information
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Box>
              <Typography>
                <strong>ID:</strong> {details.id}
              </Typography>
              <Typography>
                <strong>Category:</strong> {details.category?.label || 'N/A'}
              </Typography>
              <Typography>
                <strong>Location:</strong> {details.location?.name || 'N/A'}
              </Typography>
              <Typography>
                <strong>Origin:</strong> {details.origin || 'N/A'}
              </Typography>
              {type === 'asset' && (
                <Typography>
                  <strong>PyrCode:</strong> {details.pyrcode || 'N/A'}
                </Typography>
              )}
              {type === 'stock' && (
                <Typography>
                  <strong>Quantity:</strong> {details.quantity || 'N/A'}
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Barcode Section */}
        {type === 'asset' && details.pyrcode && (
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ padding: 3 }}>
              <Typography variant="h6" gutterBottom>
                Barcode
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setShowBarcode(true)}
                >
                  Wyświetl kod kreskowy
                </Button>
              </Box>
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* History Logs Section */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          <History sx={{ verticalAlign: 'bottom', marginRight: 1 }} />
          Historia
        </Typography>
        <Divider sx={{ my: 2 }} />
        {logs.length > 0 ? (
          <List>
            {sortedLogs.map((log) => {
              const locationInfo = getLocationInfo(log);
              return (
                <Card 
                  key={log.id} 
                  elevation={2} 
                  sx={{ 
                    marginBottom: 2,
                    borderRadius: 2,
                    overflow: 'hidden',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 3
                    }
                  }}
                >
                  <Box 
                    sx={{ 
                      p: 1, 
                      display: 'flex', 
                      alignItems: 'center',
                      bgcolor: log.action === 'DELIVERED' ? 'success.dark' : 
                               log.action === 'IN_TRANSFER' ? 'info.dark' : 
                               log.action === 'REMOVE' ? 'error.dark' : 'grey.800',
                      color: log.action === 'DELIVERED' ? 'success.light' : 
                             log.action === 'IN_TRANSFER' ? 'info.light' : 
                             log.action === 'REMOVE' ? 'error.light' : 'common.white'
                    }}
                  >
                    {getActionIcon(log.action, log)}
                    <Typography variant="subtitle1" fontWeight="bold">
                      {getActionLabel(log.action, log)}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      sx={{ ml: 'auto', color: 'inherit', opacity: 0.9 }}
                    >
                      {new Date(log.created_at).toLocaleString()}
                    </Typography>
                  </Box>
                  <CardContent sx={{ p: 2 }}>
                    {locationInfo && (
                      <Box 
                        sx={{ 
                          mb: 2, 
                          p: 1.5, 
                          borderRadius: 1, 
                          bgcolor: 'background.paper',
                          border: '1px solid',
                          borderColor: 'divider'
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <LocationOn sx={{ color: 'primary.main', mr: 1 }} />
                          <Typography variant="subtitle2" color="primary">
                            Informacje o lokalizacji
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'column', pl: 3 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                            <Typography variant="body2" sx={{ minWidth: '40px', fontWeight: 'bold' }}>
                              Z:
                            </Typography>
                            <Typography variant="body2">
                              {locationInfo.fromLocation}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="body2" sx={{ minWidth: '40px', fontWeight: 'bold' }}>
                              Do:
                            </Typography>
                            <Typography variant="body2">
                              {locationInfo.toLocation}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    )}
                    
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="body2" color="textSecondary">
                        {formatLogMessage(log)}
                      </Typography>
                    </Box>
                    
                    {log.data.quantity && (
                      <Box 
                        sx={{ 
                          display: 'inline-flex', 
                          alignItems: 'center',
                          mt: 1,
                          p: 0.5,
                          borderRadius: 1,
                          bgcolor: 'primary.dark',
                          color: 'primary.light'
                        }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          Ilość: {log.data.quantity}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </List>
        ) : (
          <Typography>Brak historii dla tego elementu.</Typography>
        )}
      </Box>

      {/* Delete Button Section - tylko dla zasobów typu 'asset' */}
      {type === 'asset' && (
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => setShowDeleteConfirmation(true)}
            disabled={isDeleting}
          >
            {isDeleting ? 'Usuwanie...' : 'Usuń zasób'}
          </Button>
        </Box>
      )}

      {/* Delete Confirmation Modal */}
      <Dialog
        open={showDeleteConfirmation}
        onClose={() => setShowDeleteConfirmation(false)}
      >
        <DialogTitle>Potwierdź usunięcie</DialogTitle>
        <DialogContent>
          <Typography>
            Czy na pewno chcesz usunąć ten zasób? Tej operacji nie można cofnąć.
          </Typography>
          {error && <ErrorMessage message={error} />}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setShowDeleteConfirmation(false)}
            disabled={isDeleting}
          >
            Anuluj
          </Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            disabled={isDeleting}
          >
            {isDeleting ? 'Usuwanie...' : 'Usuń'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Barcode Dialog */}
      <Dialog
        open={showBarcode}
        onClose={() => setShowBarcode(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Kod kreskowy</DialogTitle>
        <DialogContent>
          <BarcodeGenerator
            assets={[{
              id: details.id,
              serial: details.serial || '',
              location: details.location,
              category: details.category,
              status: details.status,
              pyrcode: details.pyrcode,
              origin: details.origin
            }]}
            onClose={() => setShowBarcode(false)}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default EquipmentDetails;
