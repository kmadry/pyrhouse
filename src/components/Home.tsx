import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Container,
  Button,
  CircularProgress,
  Grid,
  Paper,
  TextField,
  Chip,
  Alert,
  List,
} from '@mui/material';
import { 
  LocalShipping, 
  Search, 
  LocationOn,
  AccessTime,
  Inventory,
  ListAlt
} from '@mui/icons-material';
import { useTransfers } from '../hooks/useTransfers';
import { ErrorMessage } from './ErrorMessage';
import { styled } from '@mui/material/styles';
import { getApiUrl } from '../config/api';
import { jwtDecode } from 'jwt-decode';
import { alpha } from '@mui/material/styles';

// Interfejs dla zadania
interface Quest {
  id: number;
  deadline: string;
  items: Array<{
    quantity: number;
    name: string;
  }>;
  description?: string;
  reward?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  location?: string;
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

const HomePage: React.FC = () => {
  const { loading } = useTransfers();
  const navigate = useNavigate();

  const [pyrcode, setPyrcode] = useState<string>('');
  const [searchError, setSearchError] = useState<string | null>(null);
  const [userTransfers, setUserTransfers] = useState<any[]>([]);
  const [userTransfersLoading, setUserTransfersLoading] = useState(false);
  const [userTransfersError, setUserTransfersError] = useState<string | null>(null);

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
    const now = new Date();
    
    const mockQuests: Quest[] = [
      {
        id: 1,
        // 2 dni od teraz
        deadline: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        items: [
          { quantity: 5, name: 'laptop' },
          { quantity: 30, name: 'przedłużacz' }
        ],
        description: 'Przygotuj sprzęt do sali konferencyjnej na ważne spotkanie gildii.',
        reward: '300 złotych monet',
        location: 'Sala Konferencyjna - Poziom 3',
        difficulty: 'easy'
      },
      {
        id: 2,
        // 5 dni od teraz
        deadline: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        description: 'Przygotować salę konferencyjną na zebranie Rady Królewskiej',
        items: [
          { quantity: 10, name: 'krzesło' },
          { quantity: 2, name: 'projektor' },
          { quantity: 1, name: 'ekran' },
          { quantity: 2, name: 'mikrofon bezprzewodowy' }
        ],
        reward: '500 złotych monet',
        location: 'Sala Tronowa - Poziom 1',
        difficulty: 'medium'
      },
      {
        id: 3,
        // 30 minut od teraz (pilne!)
        deadline: new Date(now.getTime() + 30 * 60 * 1000).toISOString(),
        description: 'Pilne! Przeprowadź inwentaryzację sprzętu w magazynie głównym. Sprawdź numery seryjne i stan techniczny wszystkich urządzeń.',
        items: [],
        reward: '200 złotych monet',
        location: 'Magazyn Główny - Poziom -1',
        difficulty: 'easy'
      },
      {
        id: 4,
        // 25 dni od teraz
        deadline: new Date(now.getTime() + 25 * 24 * 60 * 60 * 1000).toISOString(),
        description: 'Zorganizuj sprzęt na wielki turniej e-sportowy w głównej sali.',
        items: [
          { quantity: 20, name: 'słuchawki gamingowe' },
          { quantity: 20, name: 'komputer gamingowy' },
          { quantity: 4, name: 'router' },
          { quantity: 2, name: 'switch sieciowy' },
          { quantity: 1, name: 'serwer turniejowy' },
          { quantity: 4, name: 'monitor zapasowy' }
        ],
        reward: '1000 złotych monet',
        location: 'Arena Główna - Poziom 2',
        difficulty: 'hard'
      },
      {
        id: 5,
        // 6 dni od teraz
        deadline: new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000).toISOString(),
        description: 'Przygotuj mobilne stanowisko do prezentacji w terenie.',
        items: [
          { quantity: 1, name: 'projektor przenośny' },
          { quantity: 1, name: 'ekran projekcyjny' },
          { quantity: 2, name: 'głośnik bluetooth' },
          { quantity: 1, name: 'laptop prezentacyjny' }
        ],
        reward: '400 złotych monet',
        location: 'Plac Targowy - Miasto',
        difficulty: 'medium'
      }
    ];

    // Filtruj zadania z czasem pozostałym między 0 a 2 godziny
    const urgentQuests = mockQuests.filter(quest => {
      const deadlineDate = new Date(quest.deadline);
      const difference = deadlineDate.getTime() - now.getTime();
      const hoursLeft = difference / (1000 * 60 * 60);
      return hoursLeft <= 2 && hoursLeft > 0;
    });

    // Sortuj po czasie pozostałym (od najpilniejszych)
    const sortedUrgentQuests = urgentQuests.sort((a, b) => {
      const deadlineA = new Date(a.deadline).getTime();
      const deadlineB = new Date(b.deadline).getTime();
      return deadlineA - deadlineB;
    });

    // Weź 2-3 najbardziej pilne zadania
    setUserTransfers(sortedUrgentQuests.slice(0, 3));
  }, []);

  // Przywracam oryginalną funkcję handleSearch
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
      navigate(`/details/${data.id}?type=${data.category.type || 'asset'}`);
    } catch (err: any) {
      setSearchError(err.message || 'Wystąpił nieoczekiwany błąd.');
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Paper 
        elevation={2} 
        sx={{ 
          p: 3, 
          mb: 6,
          borderRadius: 2,
          background: (theme) => theme.palette.mode === 'dark' 
            ? 'linear-gradient(to right, #1a1a1a, #2d2d2d)'
            : 'linear-gradient(to right, #ffffff, #f8f9fa)'
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: 'center', 
          gap: 2 
        }}>
          <TextField
            fullWidth
            label="Wyszukaj po Pyrcode"
            variant="outlined"
            placeholder="Wprowadź kod Pyrcode..."
            value={pyrcode}
            onChange={(e) => setPyrcode(e.target.value)}
            sx={{ 
              flex: 1,
              '& .MuiOutlinedInput-root': {
                backgroundColor: (theme) => theme.palette.mode === 'dark' ? '#2d2d2d' : '#fff',
                '& fieldset': {
                  borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)',
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
                '& .MuiInputLabel-root': {
                  color: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'inherit',
                },
              }
            }}
          />
          <Button
            variant="contained"
            color="primary"
            startIcon={<Search />}
            onClick={handleSearch}
            disabled={loading}
            sx={{ 
              minWidth: { xs: '100%', sm: 'auto' },
              height: { xs: '48px', sm: '56px' }
            }}
          >
            {loading ? <CircularProgress size={24} /> : 'Szukaj'}
          </Button>
        </Box>
        {searchError && <ErrorMessage message={searchError} />}
      </Paper>

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
          <Grid item xs={12} sm={6} md={4}>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': { 
                  transform: 'translateY(-4px)',
                  boxShadow: 4
                },
                borderRadius: 2
              }}
              onClick={() => navigate('/transfers/create')}
            >
              <LocalShipping sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" align="center" sx={{ fontWeight: 500 }}>
                Utwórz quest-dostawę
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': { 
                  transform: 'translateY(-4px)',
                  boxShadow: 4
                },
                borderRadius: 2
              }}
              onClick={() => navigate('/list')}
            >
              <Inventory sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" align="center" sx={{ fontWeight: 500 }}>
                Zarządzaj magazynem
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': { 
                  transform: 'translateY(-4px)',
                  boxShadow: 4
                },
                borderRadius: 2
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
              borderRadius: 2,
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
  );
};

export default HomePage;
