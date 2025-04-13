import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Button,
  Chip,
  TextField,
  Card,
  CardContent,
  Grid,
  useMediaQuery,
  useTheme,
  Divider,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { getApiUrl } from '../config/api';
import { ErrorMessage } from './ErrorMessage';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CancelIcon from '@mui/icons-material/Cancel';

const LocationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [location, setLocation] = useState<any>(null);
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const fetchLocationData = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const [locationResponse, assetsResponse] = await Promise.all([
          fetch(getApiUrl(`/locations/${id}`), {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(getApiUrl(`/locations/${id}/assets`), {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!locationResponse.ok || !assetsResponse.ok) {
          throw new Error('Failed to fetch location data');
        }

        const [locationData, assetsData] = await Promise.all([
          locationResponse.json(),
          assetsResponse.json(),
        ]);

        setLocation(locationData);
        setAssets(assetsData);
      } catch (err: any) {
        setError(err.message || 'An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchLocationData();
    }
  }, [id]);

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'in_transit':
        return <Chip icon={<LocalShippingIcon />} label="W trasie" color="warning" />;
      case 'completed':
        return <Chip icon={<CheckCircleIcon />} label="Zakończony" color="success" />;
      case 'created':
        return <Chip icon={<HourglassEmptyIcon />} label="Utworzony" color="default" />;
      case 'cancelled':
        return <Chip icon={<CancelIcon />} label="Anulowany" color="error" />;
      default:
        return <Chip label="Unknown" />;
    }
  };

  const filteredAssets = assets.filter(asset =>
    asset.id.toString().includes(searchQuery) ||
    asset.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    asset.location?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    asset.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderTable = () => (
    <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell><strong>ID</strong></TableCell>
            <TableCell><strong>Typ</strong></TableCell>
            <TableCell><strong>Ilość</strong></TableCell>
            <TableCell><strong>Lokalizacja</strong></TableCell>
            <TableCell><strong>Status</strong></TableCell>
            <TableCell><strong>PYR_CODE</strong></TableCell>
            <TableCell><strong>Origin</strong></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredAssets.map((asset) => (
            <TableRow
              key={asset.id}
              onClick={() => navigate(`/assets/${asset.id}`)}
              sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
            >
              <TableCell>{asset.id}</TableCell>
              <TableCell>{asset.type}</TableCell>
              <TableCell>{asset.quantity}</TableCell>
              <TableCell>{asset.location?.name}</TableCell>
              <TableCell>{getStatusChip(asset.status)}</TableCell>
              <TableCell>{asset.pyr_code}</TableCell>
              <TableCell>{asset.origin}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderMobileCards = () => (
    <Grid container spacing={2}>
      {filteredAssets.map((asset) => (
        <Grid item xs={12} key={asset.id}>
          <Card
            onClick={() => navigate(`/assets/${asset.id}`)}
            sx={{
              cursor: 'pointer',
              '&:hover': { bgcolor: 'action.hover' },
              transition: 'background-color 0.2s ease',
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="h6" component="div">
                  ID: {asset.id}
                </Typography>
                {getStatusChip(asset.status)}
              </Box>
              <Divider sx={{ my: 1 }} />
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Typ:</Typography>
                  <Typography variant="body1">{asset.type}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Ilość:</Typography>
                  <Typography variant="body1">{asset.quantity}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">Lokalizacja:</Typography>
                  <Typography variant="body1">{asset.location?.name}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">PYR_CODE:</Typography>
                  <Typography variant="body1">{asset.pyr_code}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Origin:</Typography>
                  <Typography variant="body1">{asset.origin}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <ErrorMessage message="Wystąpił błąd" details={error} />
      </Box>
    );
  }

  if (!location) {
    return (
      <Box sx={{ p: 2 }}>
        <ErrorMessage message="Nie znaleziono lokalizacji" />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          {location.name}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate(`/locations/${id}/edit`)}
        >
          Edytuj Lokalizację
        </Button>
      </Box>

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          label="Szukaj assetów"
          variant="outlined"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ mb: 2 }}
        />
      </Box>

      {filteredAssets.length === 0 ? (
        <Box sx={{ textAlign: 'center', p: 3 }}>
          <Typography variant="h6" color="text.secondary">
            Brak assetów w tej lokalizacji
          </Typography>
        </Box>
      ) : (
        isMobile ? renderMobileCards() : renderTable()
      )}
    </Box>
  );
};

export default LocationPage; 