import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Grid,
  Paper,
  Divider,
  Stack,
  TextField,
  Chip,
} from '@mui/material';
import { 
  LocalShipping, 
  Search, 
  ArrowForwardIos,
  LocationOn,
  AccessTime,
  Inventory,
  ListAlt
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTransfers } from '../hooks/useTransfers';
import { ErrorMessage } from './ErrorMessage';
import { styled } from '@mui/material/styles';
import { getApiUrl } from '../config/api';

// Stylizowany komponent dla pilnych zadań
const UrgentQuestCard = styled(Card)(() => ({
  background: `linear-gradient(145deg, #E6A446, #A4462D)`,
  border: '2px solid #A4462D',
  boxShadow: '0 4px 12px rgba(164, 70, 45, 0.5)',
  animation: 'pulse 2s infinite',
  '@keyframes pulse': {
    '0%': {
      boxShadow: '0 4px 12px rgba(164, 70, 45, 0.5)',
    },
    '50%': {
      boxShadow: '0 4px 20px rgba(164, 70, 45, 0.8)',
    },
    '100%': {
      boxShadow: '0 4px 12px rgba(164, 70, 45, 0.5)',
    },
  }
}));

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

// Komponent licznika czasu
const CountdownTimer: React.FC<{ deadline: string }> = ({ deadline }) => {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    totalHours: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, totalHours: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const deadlineDate = new Date(deadline);
      const difference = deadlineDate.getTime() - now.getTime();
      
      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        const totalHours = days * 24 + hours + minutes / 60;

        setTimeLeft({
          days,
          hours,
          minutes,
          seconds,
          totalHours
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, totalHours: 0 });
      }
    };

    // Oblicz czas od razu
    calculateTimeLeft();

    // Aktualizuj co sekundę
    const timer = setInterval(calculateTimeLeft, 1000);

    // Wyczyść interval przy odmontowaniu komponentu
    return () => clearInterval(timer);
  }, [deadline]);

  return (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: 1,
      color: '#A4462D',
      fontFamily: '"Cinzel", serif'
    }}>
      <AccessTime sx={{ fontSize: '1.2rem' }} />
      <Typography variant="h6" sx={{ fontFamily: 'inherit' }}>
        {timeLeft.days > 0 && `${timeLeft.days}d `}
        {timeLeft.hours.toString().padStart(2, '0')}:
        {timeLeft.minutes.toString().padStart(2, '0')}:
        {timeLeft.seconds.toString().padStart(2, '0')}
      </Typography>
    </Box>
  );
};

const HomePage: React.FC = () => {
  const { transfers, loading, refreshTransfers } = useTransfers();
  const navigate = useNavigate();

  const [pyrcode, setPyrcode] = useState<string>('');
  const [searchError, setSearchError] = useState<string | null>(null);
  const [urgentQuests, setUrgentQuests] = useState<Quest[]>([]);

  // Fetch transfers on mount
  useEffect(() => {
    refreshTransfers();
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
    setUrgentQuests(sortedUrgentQuests.slice(0, 3));
  }, []);

  // Filter transfers to show only those "in transit"
  const inTransitTransfers = transfers.filter(
    (transfer) => transfer.status === 'in_transit'
  );

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
                Przeglądaj dostawy
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
            Palące Questy
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

        {urgentQuests.length === 0 ? (
          <Paper 
            elevation={1} 
            sx={{ 
              p: 3, 
              textAlign: 'center',
              borderRadius: 2,
              backgroundColor: 'background.default'
            }}
          >
            <Typography color="text.secondary">
              Brak pilnych zadań do wykonania.
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {urgentQuests.map((quest) => (
              <Grid item xs={12} sm={6} md={4} key={quest.id}>
                <UrgentQuestCard>
                  <CardContent>
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      mb: 2 
                    }}>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          color: '#fff',
                          fontWeight: 600
                        }}
                      >
                        Zadanie #{quest.id}
                      </Typography>
                      <Chip 
                        label={quest.difficulty?.toUpperCase() || 'MEDIUM'} 
                        color={
                          quest.difficulty === 'easy' ? 'success' : 
                          quest.difficulty === 'medium' ? 'warning' : 'error'
                        }
                        size="small"
                        sx={{ 
                          fontWeight: 600,
                          minWidth: 80
                        }}
                      />
                    </Box>
                    
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        mb: 2, 
                        color: '#fff',
                        minHeight: '3em'
                      }}
                    >
                      {quest.description}
                    </Typography>
                    
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      mb: 1,
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      p: 1,
                      borderRadius: 1
                    }}>
                      <LocationOn sx={{ mr: 1, color: '#fff' }} />
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: '#fff',
                          fontWeight: 500
                        }}
                      >
                        {quest.location}
                      </Typography>
                    </Box>
                    
                    <CountdownTimer deadline={quest.deadline} />
                    
                    <Divider sx={{ 
                      my: 2, 
                      borderColor: 'rgba(255,255,255,0.3)',
                      opacity: 0.5
                    }} />
                    
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center' 
                    }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: '#fff',
                          fontWeight: 500
                        }}
                      >
                        Nagroda: {quest.reward}
                      </Typography>
                      <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        onClick={() => navigate('/quests')}
                        sx={{ 
                          textTransform: 'none',
                          fontWeight: 600
                        }}
                      >
                        Szczegóły
                      </Button>
                    </Box>
                  </CardContent>
                </UrgentQuestCard>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Dostawy w trakcie */}
      <Box>
        <Typography 
          variant="h5" 
          gutterBottom 
          sx={{ 
            mb: 3,
            fontWeight: 600,
            color: 'text.primary'
          }}
        >
          Dostawy w trakcie
        </Typography>

        {inTransitTransfers.length === 0 && !loading && (
          <Paper 
            elevation={1} 
            sx={{ 
              p: 3, 
              textAlign: 'center',
              borderRadius: 2,
              backgroundColor: 'background.default'
            }}
          >
            <Typography color="text.secondary">
              Brak dostaw w trakcie realizacji.
            </Typography>
          </Paper>
        )}

        {inTransitTransfers.length > 0 && (
          <Grid container spacing={3}>
            {inTransitTransfers.map((transfer) => (
              <Grid item xs={12} sm={6} lg={4} key={transfer.id}>
                <Card
                  sx={{
                    borderLeft: '5px solid orange',
                    boxShadow: '0 3px 6px rgba(0, 0, 0, 0.1)',
                    borderRadius: 2,
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4
                    }
                  }}
                >
                  <CardContent>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                      <LocalShipping sx={{ color: 'primary.main' }} />
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Dostawa #{transfer.id}
                      </Typography>
                    </Stack>

                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 2,
                        p: 2,
                        backgroundColor: 'background.default',
                        borderRadius: 1
                      }}
                    >
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          fontWeight: 500,
                          textAlign: 'center',
                          color: 'text.primary'
                        }}
                      >
                        {transfer.from_location.name}
                      </Typography>
                      <ArrowForwardIos sx={{ mx: 2, color: 'orange' }} />
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          fontWeight: 500,
                          textAlign: 'center',
                          color: 'text.primary'
                        }}
                      >
                        {transfer.to_location.name}
                      </Typography>
                    </Box>

                    <Button
                      size="small"
                      color="primary"
                      onClick={() => navigate(`/transfers/${transfer.id}`)}
                      sx={{ 
                        textTransform: 'none',
                        fontWeight: 600
                      }}
                    >
                      Zobacz szczegóły
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Container>
  );
};

export default HomePage;
