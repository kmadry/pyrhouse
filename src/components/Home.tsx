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
import { ArrowForwardIos, LocalShipping, Search, AccessTime, LocationOn } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTransfers } from '../hooks/useTransfers';
import { ErrorMessage } from './ErrorMessage';
import { styled } from '@mui/material/styles';

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
  const { transfers, loading, fetchTransfers } = useTransfers();
  const navigate = useNavigate();

  const [pyrcode, setPyrcode] = useState<string>('');
  const [searchError, setSearchError] = useState<string | null>(null);
  const [urgentQuests, setUrgentQuests] = useState<Quest[]>([]);

  // Fetch transfers on mount
  useEffect(() => {
    fetchTransfers();
  }, [fetchTransfers]);

  // Pobierz pilne zadania
  useEffect(() => {
    // Pobierz aktualną datę
    const now = new Date();
    
    // Przykładowe dane (później będą pobierane z API)
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

  const handleSearch = async () => {
    if (!pyrcode.trim()) {
      setSearchError('Please enter a valid Pyrcode.');
      return;
    }

    try {
      setSearchError(null); // Clear any previous errors
      const token = localStorage.getItem('token');
      const response = await fetch(
        `https://pyrhouse-backend-f26ml.ondigitalocean.app/api/assets/pyrcode/${pyrcode.trim()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 404) {
        setSearchError('No asset found with the given Pyrcode.');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch asset details.');
      }

      const data = await response.json();
      navigate(`/details/${data.id}?type=${data.category.type || 'asset'}`);
    } catch (err: any) {
      setSearchError(err.message || 'An unexpected error occurred.');
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Witaj w Pyrhouse-app
      </Typography>

      {/* Pyrcode Search */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, gap: 2 }}>
        <TextField
          label="Search by Pyrcode"
          variant="outlined"
          value={pyrcode}
          onChange={(e) => setPyrcode(e.target.value)}
          sx={{ flex: 1 }}
        />
        <Button
          variant="contained"
          color="primary"
          startIcon={<Search />}
          onClick={handleSearch}
          disabled={loading}
        >
          {loading ? <CircularProgress size={20} /> : 'Search'}
        </Button>
      </Box>
      {searchError && <ErrorMessage message={searchError} />}

      {/* Transfers Section */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Transfers In Transit
        </Typography>

        {inTransitTransfers.length === 0 && !loading && (
          <Typography>No transfers are currently in transit.</Typography>
        )}

        {inTransitTransfers.length > 0 && (
          <Grid container spacing={3}>
            {inTransitTransfers.map((transfer) => (
              <Grid item xs={12} sm={6} lg={4} key={transfer.id}>
                <Card
                  sx={{
                    borderLeft: '5px solid orange',
                    boxShadow: '0 3px 6px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  <CardContent>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <LocalShipping />
                      <Typography variant="h6">Transfer #{transfer.id}</Typography>
                    </Stack>

                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mt: 2,
                      }}
                    >
                      <Typography variant="body1" sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                        {transfer.from_location.name}
                      </Typography>
                      <ArrowForwardIos sx={{ mx: 2, color: 'orange' }} />
                      <Typography variant="body1" sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                        {transfer.to_location.name}
                      </Typography>
                    </Box>

                    <Divider sx={{ my: 2 }} />
                    <Button
                      size="small"
                      color="primary"
                      onClick={() => navigate(`/transfers/${transfer.id}`)}
                    >
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Quick Actions */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Quick Actions
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Paper
              sx={{
                p: 3,
                textAlign: 'center',
                cursor: 'pointer',
                '&:hover': { bgcolor: 'action.hover' },
              }}
              onClick={() => navigate('/transfers/create')}
            >
              <Typography variant="h6">Utwórz dostawę</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper
              sx={{
                p: 3,
                textAlign: 'center',
                cursor: 'pointer',
                '&:hover': { bgcolor: 'action.hover' },
              }}
              onClick={() => navigate('/list')}
            >
              <Typography variant="h6">Zarządzaj magazynem</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper
              sx={{
                p: 3,
                textAlign: 'center',
                cursor: 'pointer',
                '&:hover': { bgcolor: 'action.hover' },
              }}
              onClick={() => navigate('/transfers')}
            >
              <Typography variant="h6">Przeglądaj dostawy</Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Pilne zadania */}
      <Box sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Pilne zadania
          </Typography>
          <Button 
            variant="outlined" 
            color="primary" 
            onClick={() => navigate('/quests')}
            startIcon={<AccessTime />}
          >
            Zobacz wszystkie zadania
          </Button>
        </Box>

        {urgentQuests.length === 0 ? (
          <Typography>Brak pilnych zadań do wykonania.</Typography>
        ) : (
          <Grid container spacing={3}>
            {urgentQuests.map((quest) => (
              <Grid item xs={12} sm={6} md={4} key={quest.id}>
                <UrgentQuestCard>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" sx={{ color: '#fff' }}>
                        Zadanie #{quest.id}
                      </Typography>
                      <Chip 
                        label={quest.difficulty?.toUpperCase() || 'MEDIUM'} 
                        color={
                          quest.difficulty === 'easy' ? 'success' : 
                          quest.difficulty === 'medium' ? 'warning' : 'error'
                        }
                        size="small"
                      />
                    </Box>
                    
                    <Typography variant="body1" sx={{ mb: 2, color: '#fff' }}>
                      {quest.description}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <LocationOn sx={{ mr: 1, color: '#fff' }} />
                      <Typography variant="body2" sx={{ color: '#fff' }}>
                        {quest.location}
                      </Typography>
                    </Box>
                    
                    <CountdownTimer deadline={quest.deadline} />
                    
                    <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.3)' }} />
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ color: '#fff' }}>
                        Nagroda: {quest.reward}
                      </Typography>
                      <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        onClick={() => navigate('/quests')}
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
    </Container>
  );
};

export default HomePage;
