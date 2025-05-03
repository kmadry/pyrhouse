import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Container,
  Button,
  CircularProgress,
  Paper,
  TextField,
  List,
  Autocomplete,
  Grid,
  Chip,
  Alert,
  styled,
  alpha
} from '@mui/material';
import { 
  LocalShipping, 
  Search, 
  RocketLaunch,
  LocationOn,
  AccessTime,
  Inventory,
  ListAlt,
  AddTask,
  QrCodeScanner
} from '@mui/icons-material';
import { useTransfers } from '../../hooks/useTransfers';
import { getApiUrl } from '../../config/api';
import { jwtDecode } from 'jwt-decode';
import { AppSnackbar } from '../ui/AppSnackbar';
import { useSnackbarMessage } from '../../hooks/useSnackbarMessage';

interface PyrCodeSuggestion {
  id: number;
  pyrcode: string;
  serial: string;
  location: {
    id: number;
    name: string;
  };
  category: {
    id: number;
    label: string;
  };
  status: 'in_stock' | 'available' | 'unavailable';
}

// Dodaj nowy styled component dla quest item
const QuestItem = styled(Paper)(({ theme }) => ({
  position: 'relative',
  padding: theme.spacing(4),
  marginBottom: theme.spacing(2),
  background: theme.palette.mode === 'dark' 
    ? `linear-gradient(135deg, ${alpha('#462f1d', 0.98)}, ${alpha('#2d1810', 0.95)})`
    : `linear-gradient(135deg, #f8e7cb, #ebd5b3)`,
  borderRadius: '8px',
  cursor: 'pointer',
  boxShadow: theme.palette.mode === 'dark'
    ? '0 4px 12px rgba(0,0,0,0.5), inset 0 0 30px rgba(0,0,0,0.4)'
    : '0 4px 12px rgba(139, 109, 76, 0.15), inset 0 0 30px rgba(139, 109, 76, 0.1)',
  transition: 'all 0.3s ease',
  border: theme.palette.mode === 'dark'
    ? '2px solid #8b6d4c'
    : '2px solid #c4a980',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.palette.mode === 'dark'
      ? '0 6px 16px rgba(0,0,0,0.7), inset 0 0 30px rgba(0,0,0,0.4)'
      : '0 6px 16px rgba(139, 109, 76, 0.25), inset 0 0 30px rgba(139, 109, 76, 0.1)',
    '&::before': {
      opacity: 0.5,
    },
    '&::after': {
      boxShadow: theme.palette.mode === 'dark'
        ? 'inset 0 0 100px 100px rgba(255, 255, 255, 0.05)'
        : 'inset 0 0 100px 100px rgba(255, 255, 255, 0.07)',
    }
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    background: theme.palette.mode === 'dark'
      ? 'linear-gradient(45deg, #ffd700, #b8860b, #8b6d4c)'
      : 'linear-gradient(45deg, #daa520, #cd853f, #b8860b)',
    borderRadius: '10px',
    opacity: 0.3,
    transition: 'opacity 0.3s ease',
    zIndex: -1,
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: theme.palette.mode === 'dark'
      ? `url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.15' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.1'/%3E%3C/svg%3E")`
      : `url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.15' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E")`,
    borderRadius: '6px',
    opacity: 0.5,
    pointerEvents: 'none',
    transition: 'box-shadow 0.3s ease',
  }
}));

const QuestTitle = styled(Typography)(({ theme }) => ({
  fontFamily: '"Cinzel", serif',
  fontWeight: 700,
  fontSize: '1.4rem',
  color: theme.palette.mode === 'dark' ? '#ffd700' : '#8b4513',
  marginBottom: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  textShadow: theme.palette.mode === 'dark' 
    ? '2px 2px 2px rgba(0,0,0,0.8), 0 0 5px rgba(255, 215, 0, 0.3)'
    : '1px 1px 2px rgba(139, 69, 19, 0.3)',
  '& .MuiSvgIcon-root': {
    color: theme.palette.mode === 'dark' ? '#ffd700' : '#8b4513',
    filter: theme.palette.mode === 'dark' 
      ? 'drop-shadow(2px 2px 2px rgba(0,0,0,0.8))'
      : 'drop-shadow(1px 1px 1px rgba(139, 69, 19, 0.3))',
  }
}));

const QuestLocation = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  color: theme.palette.mode === 'dark' ? '#ffd700' : '#8b4513',
  marginBottom: theme.spacing(1),
  fontSize: '1rem',
  fontWeight: 500,
  textShadow: theme.palette.mode === 'dark' 
    ? '1px 1px 2px rgba(0,0,0,0.8)'
    : '1px 1px 1px rgba(139, 69, 19, 0.2)',
  '& .MuiSvgIcon-root': {
    color: theme.palette.mode === 'dark' ? '#ffd700' : '#8b4513',
    filter: theme.palette.mode === 'dark' 
      ? 'drop-shadow(1px 1px 1px rgba(0,0,0,0.8))'
      : 'drop-shadow(1px 1px 1px rgba(139, 69, 19, 0.2))',
  }
}));

const QuestDate = styled(Typography)(({ theme }) => ({
  color: theme.palette.mode === 'dark' ? '#d4af37' : '#8b4513',
  fontSize: '0.9rem',
  fontStyle: 'italic',
  fontWeight: 500,
  textShadow: theme.palette.mode === 'dark' 
    ? '1px 1px 1px rgba(0,0,0,0.8)'
    : '1px 1px 1px rgba(139, 69, 19, 0.2)',
}));

const QuestStatus = styled(Chip)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(2),
  right: theme.spacing(2),
  backgroundColor: theme.palette.mode === 'dark' ? '#4a3f2c' : '#daa520',
  color: theme.palette.mode === 'dark' ? '#ffd700' : '#ffffff',
  border: `1px solid ${theme.palette.mode === 'dark' ? '#ffd700' : '#b8860b'}`,
  fontWeight: 600,
  '& .MuiChip-label': {
    textShadow: theme.palette.mode === 'dark' 
      ? '1px 1px 1px rgba(0,0,0,0.8)'
      : '1px 1px 1px rgba(139, 69, 19, 0.3)',
  },
}));

const BarcodeScanner = lazy(() => import('../common/BarcodeScanner'));

const HomePage: React.FC = () => {
  useTransfers();
  const navigate = useNavigate();
  const { snackbar, showSnackbar, closeSnackbar } = useSnackbarMessage();
  const [showScanner, setShowScanner] = useState(false);

  const [pyrcode, setPyrcode] = useState<string>('');
  const [searchError, setSearchError] = useState<string | null>(null);
  const [userTransfers, setUserTransfers] = useState<any[]>([]);
  const [userTransfersLoading, setUserTransfersLoading] = useState(false);
  const [userTransfersError, setUserTransfersError] = useState<string | null>(null);
  const [pyrCodeSuggestions, setPyrCodeSuggestions] = useState<PyrCodeSuggestion[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // Fetch user transfers
  useEffect(() => {
    const fetchUserTransfers = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const decoded = jwtDecode(token) as any;
        const userId = decoded.userID;

        setUserTransfersLoading(true);
        setUserTransfersError(null);

        const response = await fetch(
          getApiUrl(`/transfers/users/${userId}?status=in_transit`),
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          throw new Error('Nie udało się pobrać transferów użytkownika');
        }

        const data = await response.json();
        setUserTransfers(data);
      } catch (err) {
        setUserTransfersError(err instanceof Error ? err.message : 'Wystąpił nieznany błąd');
        setUserTransfers([]);
      } finally {
        setUserTransfersLoading(false);
      }
    };

    fetchUserTransfers();
  }, []);

  useEffect(() => {
    if (searchError) {
      showSnackbar('error', searchError);
    }
  }, [searchError]);

  const handlePyrCodeSearch = async (value: string) => {
    if (!/^[a-zA-Z0-9-]*$/.test(value)) {
      return;
    }

    if (value.length < 2) {
      setPyrCodeSuggestions([]);
      return;
    }

    setSearchLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        getApiUrl(`/locations/1/search?q=${encodeURIComponent(value)}`),
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        throw new Error('Nie udało się wyszukać kodów PYR');
      }

      const suggestions = await response.json();
      setPyrCodeSuggestions(suggestions);
    } catch (error) {
      console.error('Błąd podczas wyszukiwania:', error);
      setPyrCodeSuggestions([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSearch = async () => {
    if (!pyrcode.trim()) {
      setSearchError('Proszę podać kod Pyrcode.');
      return;
    }

    try {
      setSearchError(null);
      const token = localStorage.getItem('token');
      const response = await fetch(
        getApiUrl(`/assets/pyrcode/${pyrcode.trim()}`),
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 404) {
        setSearchError('Nie znaleziono sprzętu o podanym kodzie Pyrcode.');
        return;
      }

      if (!response.ok) {
        throw new Error('Nie udało się pobrać szczegółów sprzętu.');
      }

      const data = await response.json();
      navigate(`/equipment/${data.id}?type=${data.category.type || 'asset'}`);
    } catch (err: any) {
      setSearchError(err.message || 'Wystąpił nieoczekiwany błąd.');
    }
  };

  const handleOptionSelected = (_event: any, value: PyrCodeSuggestion | string | null) => {
    if (!value || typeof value === 'string') {
      return;
    }

    // Przekieruj bezpośrednio do szczegółów sprzętu
    navigate(`/equipment/${value.id}?type=asset`);
  };

  const handleBarcodeScan = (scannedCode: string) => {
    if (scannedCode.includes('pyr')) {
      setPyrcode(scannedCode);
      handlePyrCodeSearch(scannedCode);
      setShowScanner(false);
    }
  };

  return (
    <Box>
      <AppSnackbar
        open={snackbar.open}
        type={snackbar.type}
        message={snackbar.message}
        details={snackbar.details}
        onClose={closeSnackbar}
        autoHideDuration={snackbar.autoHideDuration}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      />
      <Container maxWidth="xl" sx={{ 
        py: { xs: 4, sm: 4 },
        mt: { xs: 2, sm: 0 }
      }}>
        <Box sx={{ 
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          position: 'relative',
          mb: 4,
          mt: -3
        }}>
          <Autocomplete
            fullWidth
            freeSolo
            options={pyrCodeSuggestions}
            getOptionLabel={(option) => 
              typeof option === 'string' ? option : option.pyrcode
            }
            onChange={handleOptionSelected}
            renderOption={(props, option) => {
              const { key, ...otherProps } = props;
              return (
                <Box key={key} component="li" {...otherProps}>
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="body1">{option.pyrcode}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {option.category.label} - {option.location.name}
                    </Typography>
                  </Box>
                </Box>
              );
            }}
            loading={searchLoading}
            onInputChange={(_, newValue) => {
              setPyrcode(newValue);
              handlePyrCodeSearch(newValue);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                fullWidth
                variant="outlined"
                placeholder="Wprowadź Pyrcode..."
                onKeyDown={handleKeyDown}
                InputProps={{
                  ...params.InputProps,
                  sx: {
                    height: '48px',
                    pr: '96px',
                    backgroundColor: (theme) => theme.palette.mode === 'dark' ? '#2d2d2d' : '#ffffff',
                    borderRadius: 3,
                    '& input': {
                      height: '48px',
                      padding: '0 14px',
                    }
                  },
                  startAdornment: (
                    <Search sx={{ 
                      color: 'text.secondary', 
                      ml: 1, 
                      mr: 0.5 
                    }} />
                  ),
                  endAdornment: (
                    <Box sx={{ 
                      position: 'absolute',
                      right: 8,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5
                    }}>
                      {searchLoading && (
                        <CircularProgress 
                          color="inherit" 
                          size={20} 
                          sx={{ mr: 1 }}
                        />
                      )}
                      <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={handleSearch}
                          sx={{ 
                            borderRadius: 2,
                            height: '36px',
                            minWidth: '100px'
                          }}
                        >
                          Szukaj
                        </Button>
                      </Box>
                      <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => setShowScanner(true)}
                          startIcon={<QrCodeScanner />}
                          sx={{
                            borderRadius: 2,
                            height: '36px',
                            minWidth: '100px'
                          }}
                        >
                          Skanuj
                        </Button>
                        {showScanner && (
                          <Suspense fallback={null}>
                            <BarcodeScanner onScan={handleBarcodeScan} onClose={() => setShowScanner(false)} />
                          </Suspense>
                        )}
                      </Box>
                    </Box>
                  ),
                }}
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    '& fieldset': {
                      borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)',
                      borderRadius: 3
                    },
                    '&:hover fieldset': {
                      borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'primary.main',
                    },
                    '& input': {
                      color: (theme) => theme.palette.mode === 'dark' ? '#fff' : 'inherit',
                    },
                  }
                }}
              />
            )}
          />
        </Box>

        {/* Szybkie akcje */}
        <Box sx={{ mb: 6 }}>
          <Typography 
            variant="h5" 
            gutterBottom 
            sx={{ 
              mb: 3,
              fontWeight: 600,
              color: 'text.primary'
            }}
          >
            Szybkie akcje
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} sm={4} md={3}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  background: (theme) => theme.palette.mode === 'dark' 
                    ? '#2d2d2d'
                    : '#ffffff',
                  borderRadius: 2,
                  border: (theme) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                  '&:hover': { 
                    transform: 'translateY(-4px)',
                    boxShadow: (theme) => theme.palette.mode === 'dark' 
                      ? '0 8px 24px rgba(0,0,0,0.4)'
                      : '0 8px 24px rgba(0,0,0,0.08)',
                  }
                }}
                onClick={() => navigate('/transfers/create')}
              >
                <RocketLaunch sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" align="center" sx={{ fontWeight: 500 }}>
                  Utwórz quest-dostawę
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={4} md={3}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  background: (theme) => theme.palette.mode === 'dark' 
                    ? '#2d2d2d'
                    : '#ffffff',
                  borderRadius: 2,
                  border: (theme) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                  '&:hover': { 
                    transform: 'translateY(-4px)',
                    boxShadow: (theme) => theme.palette.mode === 'dark' 
                      ? '0 8px 24px rgba(0,0,0,0.4)'
                      : '0 8px 24px rgba(0,0,0,0.08)',
                  }
                }}
                onClick={() => navigate('/add-item')}
              >
                <AddTask sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" align="center" sx={{ fontWeight: 500 }}>
                  Dodaj sprzęt
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={4} md={3}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  background: (theme) => theme.palette.mode === 'dark' 
                    ? '#2d2d2d'
                    : '#ffffff',
                  borderRadius: 2,
                  border: (theme) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                  '&:hover': { 
                    transform: 'translateY(-4px)',
                    boxShadow: (theme) => theme.palette.mode === 'dark' 
                      ? '0 8px 24px rgba(0,0,0,0.4)'
                      : '0 8px 24px rgba(0,0,0,0.08)',
                  }
                }}
                onClick={() => navigate('/list')}
              >
                <Inventory sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" align="center" sx={{ fontWeight: 500 }}>
                  Zarządzaj magazynem
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={4} md={3}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  background: (theme) => theme.palette.mode === 'dark' 
                    ? '#2d2d2d'
                    : '#ffffff',
                  borderRadius: 2,
                  border: (theme) => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                  '&:hover': { 
                    transform: 'translateY(-4px)',
                    boxShadow: (theme) => theme.palette.mode === 'dark' 
                      ? '0 8px 24px rgba(0,0,0,0.4)'
                      : '0 8px 24px rgba(0,0,0,0.08)',
                  }
                }}
                onClick={() => navigate('/transfers')}
              >
                <ListAlt sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" align="center" sx={{ fontWeight: 500 }}>
                  Przeglądaj questy-dostawy
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>

        {/* Pilne zadania */}
        <Box sx={{ mb: 6 }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 3 
          }}>
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 600,
                color: 'text.primary'
              }}
            >
              Moje Questy
            </Typography>
            <Button 
              variant="outlined" 
              color="primary" 
              onClick={() => navigate('/quests')}
              startIcon={<AccessTime />}
              sx={{ 
                borderRadius: 1,
                textTransform: 'none'
              }}
            >
              Zobacz wszystkie zadania
            </Button>
          </Box>

          {userTransfersLoading ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : userTransfersError ? (
            <Alert severity="error">{userTransfersError}</Alert>
          ) : userTransfers.length === 0 ? (
            <Alert severity="info">
              Brak aktywnych questów
            </Alert>
          ) : (
            <List sx={{ mt: 2 }}>
              {userTransfers.map((transfer) => (
                <QuestItem
                  key={transfer.ID}
                  onClick={() => navigate(`/transfers/${transfer.ID}`)}
                  sx={{ cursor: 'pointer' }}
                >
                  <QuestStatus label="W trakcie" />
                  <QuestTitle variant="h6">
                    <LocalShipping sx={{ color: 'inherit', fontSize: '1.2rem' }} />
                    Quest #{transfer.ID}
                  </QuestTitle>
                  
                  <QuestLocation>
                    <LocationOn sx={{ fontSize: '1.1rem' }} />
                    Z: {transfer.FromLocationName}
                  </QuestLocation>
                  
                  <QuestLocation>
                    <LocationOn sx={{ fontSize: '1.1rem' }} />
                    Do: {transfer.ToLocationName}
                  </QuestLocation>
                  
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <QuestDate>
                      Rozpoczęto: {new Date(transfer.TransferDate).toLocaleString('pl-PL')}
                    </QuestDate>
                  </Box>
                </QuestItem>
              ))}
            </List>
          )}
        </Box>


      </Container>
    </Box>
  );
};

export default HomePage;
