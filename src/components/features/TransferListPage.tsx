import React, { Suspense, useEffect, useState, useCallback, lazy } from 'react';
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
import { useNavigate } from 'react-router-dom';
import { useTransfers } from '../../hooks/useTransfers';
import { ErrorMessage } from '../ui/ErrorMessage';
import debounce from 'lodash/debounce';

const LocalShippingIcon = lazy(() => import('@mui/icons-material/LocalShipping'));
const CheckCircleIcon = lazy(() => import('@mui/icons-material/CheckCircle'));
const HourglassEmptyIcon = lazy(() => import('@mui/icons-material/HourglassEmpty'));
const CancelIcon = lazy(() => import('@mui/icons-material/Cancel'));
const AddIcon = lazy(() => import('@mui/icons-material/Add'));

const TransfersListPage: React.FC = () => {
  const { transfers, loading, error, refreshTransfers } = useTransfers();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Pobierz dane tylko raz przy montowaniu komponentu
  useEffect(() => {
    refreshTransfers();
  }, []); // Usunięto zależność od refreshTransfers

  // Zoptymalizowane wyszukiwanie z debounce
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      setSearchQuery(query);
    }, 300),
    []
  );

  // Sort transfers by date (newest first) and then by status
  const sortedTransfers = React.useMemo(() => {
    return [...transfers]
      .sort((a, b) => {
        // First sort by date (newest first)
        const dateComparison = new Date(b.transfer_date).getTime() - new Date(a.transfer_date).getTime();
        if (dateComparison !== 0) return dateComparison;
        
        // If dates are equal, sort by status
        if (a.status === 'in_transit' && b.status !== 'in_transit') return -1;
        if (a.status !== 'in_transit' && b.status === 'in_transit') return 1;
        return 0;
      })
      .filter(transfer => 
        transfer.id.toString().includes(searchQuery.toLowerCase()) ||
        transfer.from_location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transfer.to_location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transfer.status.toLowerCase().includes(searchQuery.toLowerCase())
      );
  }, [transfers, searchQuery]);

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'in_transit':
        return <Chip icon={<Suspense fallback={null}><LocalShippingIcon /></Suspense>} label="W trasie" color="warning" />;
      case 'completed':
        return <Chip icon={<Suspense fallback={null}><CheckCircleIcon /></Suspense>} label="Dostarczony" color="success" />;
      case 'created':
        return <Chip icon={<Suspense fallback={null}><HourglassEmptyIcon /></Suspense>} label="Utworzony" color="default" />;
      case 'cancelled':
        return <Chip icon={<Suspense fallback={null}><CancelIcon /></Suspense>} label="Anulowany" color="error" />;
      default:
        return <Chip label="Unknown" />;
    }
  };

  const renderTable = () => (
    <TableContainer 
      component={Paper} 
      sx={{ 
        borderRadius: 2,
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        overflow: 'hidden'
      }}
    >
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: 'primary.light' }}>
            <TableCell sx={{ color: 'primary.contrastText', fontWeight: 600 }}><strong>ID</strong></TableCell>
            <TableCell sx={{ color: 'primary.contrastText', fontWeight: 600 }}><strong>Z lokalizacji</strong></TableCell>
            <TableCell sx={{ color: 'primary.contrastText', fontWeight: 600 }}><strong>Do lokalizacji</strong></TableCell>
            <TableCell sx={{ color: 'primary.contrastText', fontWeight: 600 }}><strong>Data transferu</strong></TableCell>
            <TableCell sx={{ color: 'primary.contrastText', fontWeight: 600 }}><strong>Status</strong></TableCell>
            <TableCell sx={{ color: 'primary.contrastText', fontWeight: 600 }} align="center"><strong>Akcje</strong></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedTransfers.map((transfer) => (
            <TableRow
              key={transfer.id}
              sx={{
                cursor: 'pointer',
                bgcolor: transfer.status === 'in_transit' ? 'rgba(237, 108, 2, 0.1)' : 'inherit',
                '&:hover': {
                  bgcolor: 'action.hover',
                },
                transition: 'background-color 0.2s ease'
              }}
              onClick={() => navigate(`/transfers/${transfer.id}`)}
            >
              <TableCell>
                <Typography component="div" sx={{ fontWeight: 500 }}>
                  {transfer.id}
                </Typography>
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>{transfer.from_location.name}</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>{transfer.to_location.name}</TableCell>
              <TableCell>
                {new Date(transfer.transfer_date).toLocaleString('pl-PL')}
              </TableCell>
              <TableCell>{getStatusChip(transfer.status)}</TableCell>
              <TableCell align="center">
                <Button
                  variant="text"
                  color="primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/transfers/${transfer.id}`);
                  }}
                >
                  Szczegóły
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderMobileCards = () => (
    <Grid container spacing={2}>
      {sortedTransfers.map((transfer) => (
        <Grid item xs={12} key={transfer.id}>
          <Card 
            sx={{ 
              borderRadius: 2,
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              bgcolor: transfer.status === 'in_transit' ? 'rgba(237, 108, 2, 0.1)' : 'inherit',
              '&:hover': {
                bgcolor: 'action.hover',
                cursor: 'pointer',
              },
              transition: 'background-color 0.2s ease'
            }}
            onClick={() => navigate(`/transfers/${transfer.id}`)}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="h6" component="div" sx={{ fontWeight: 500 }}>
                  Transfer #{transfer.id}
                </Typography>
                {getStatusChip(transfer.status)}
              </Box>
              
              <Divider sx={{ my: 1 }} />
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Z lokalizacji:</Typography>
                  <Typography variant="body2" fontWeight="bold">{transfer.from_location.name}</Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Do lokalizacji:</Typography>
                  <Typography variant="body2" fontWeight="bold">{transfer.to_location.name}</Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Data:</Typography>
                  <Typography variant="body2">
                    {new Date(transfer.transfer_date).toLocaleString('pl-PL')}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  return (
    <Box sx={{ 
      margin: '0 auto', 
      padding: { xs: 2, sm: 3, md: 4 },
      maxWidth: '1400px',
      backgroundColor: 'background.paper',
      borderRadius: 2,
      boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
    }}>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between', 
        alignItems: { xs: 'flex-start', sm: 'center' }, 
        marginBottom: 3,
        gap: 2,
        borderBottom: '1px solid',
        borderColor: 'divider',
        pb: 2
      }}>
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom
          sx={{ 
            fontWeight: 600,
            color: 'primary.main',
            mb: { xs: 1, sm: 0 }
          }}
        >
          Questy transportowe
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Suspense fallback={null}><AddIcon /></Suspense>}
          onClick={() => navigate('/transfers/create')}
          sx={{
            borderRadius: 1,
            px: 3
          }}
        >
          Utwórz Nowy Quest
        </Button>
      </Box>

      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', md: 'row' }, 
        gap: 2, 
        marginBottom: 3,
        backgroundColor: 'background.default',
        p: 2,
        borderRadius: 1
      }}>
        <TextField
          label="Szukaj transferów..."
          variant="outlined"
          onChange={(e) => debouncedSearch(e.target.value)}
          fullWidth
          placeholder="Wyszukaj po ID, lokalizacji lub statusie..."
          sx={{ flex: 1 }}
          InputProps={{
            sx: { borderRadius: 1 }
          }}
        />
      </Box>

      {loading ? (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          p: 5,
          flexDirection: 'column',
          gap: 2
        }}>
          <CircularProgress size={40} />
          <Typography variant="body1" color="text.secondary">
            Ładowanie questów...
          </Typography>
        </Box>
      ) : error ? (
        <Box sx={{ mb: 3 }}>
          <ErrorMessage message="Nie udało się załadować transferów" details={error} />
        </Box>
      ) : sortedTransfers.length === 0 ? (
        <Box sx={{ 
          textAlign: 'center', 
          p: 5,
          backgroundColor: 'background.default',
          borderRadius: 2,
          border: '1px dashed',
          borderColor: 'divider'
        }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Brak questów
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {searchQuery ? 'Spróbuj zmienić kryteria wyszukiwania' : 'Utwórz nowy transfer, aby rozpocząć'}
          </Typography>
          {searchQuery && (
            <Button 
              variant="outlined" 
              onClick={() => setSearchQuery('')}
              sx={{ 
                borderRadius: 1,
                px: 3
              }}
            >
              Wyczyść wyszukiwanie
            </Button>
          )}
        </Box>
      ) : (
        isMobile ? renderMobileCards() : renderTable()
      )}
    </Box>
  );
};

export default TransfersListPage;
