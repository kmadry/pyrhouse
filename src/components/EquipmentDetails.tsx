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
} from '@mui/icons-material';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import Barcode from 'react-barcode';
import { ErrorMessage } from './ErrorMessage';
import { deleteAsset } from '../services/assetService';

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
  };
  created_at: string;
}

const EquipmentDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type') || 'asset';
  const navigate = useNavigate();

  const [details, setDetails] = useState<any | null>(null);
  const [logs, setLogs] = useState<AssetLog[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Barcode value={details.pyrcode} />
              </Box>
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* History Logs Section */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          <History sx={{ verticalAlign: 'bottom', marginRight: 1 }} />
          History Logs
        </Typography>
        <Divider sx={{ my: 2 }} />
        {logs.length > 0 ? (
          <List>
            {logs.map((log) => (
              <Card key={log.id} elevation={2} sx={{ marginBottom: 2 }}>
                <CardContent>
                  <Typography variant="body1" fontWeight="bold">
                    {log.action.toUpperCase()}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {new Date(log.created_at).toLocaleString()}
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="body2">
                    <strong>Message:</strong> {log.data.msg}
                  </Typography>
                  {log.data.quantity && (
                    <Typography variant="body2">
                      <strong>Quantity:</strong> {log.data.quantity}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            ))}
          </List>
        ) : (
          <Typography>No logs available for this item.</Typography>
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
    </Box>
  );
};

export default EquipmentDetails;
