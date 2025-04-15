import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Grid,
  Paper,
  CircularProgress,
} from '@mui/material';
import { AccessTime, LocationOn } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useStorage } from '../hooks/useStorage';
import { getApiUrl } from '../config/api';
import { ErrorMessage } from './ErrorMessage';

interface Quest {
  recipient: string;
  delivery_date: string;
  location: string;
  pavilion: string;
  items: Array<{
    item_name: string;
    quantity: number;
    notes: string;
  }>;
}

const QuestCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  background: `linear-gradient(145deg, #E6CB99, #CFA865)`,
  border: '2px solid #54291E',
  borderRadius: '8px',
  boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'url("/parchment-texture.png")',
    opacity: 0.1,
    pointerEvents: 'none',
  },
  '&:hover': {
    transform: 'translateY(-4px)',
    transition: 'transform 0.2s ease-in-out',
  }
}));

// Nowy komponent dla pilnych zadań
const UrgentQuestCard = styled(QuestCard)(() => ({
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

// Komponent dla znacznika pilności
const UrgencyBadge = styled(Box)(() => ({
  position: 'absolute',
  top: -10,
  right: 60, // Zmienione z -10 na 60, aby wyświetlać obok poziomu trudności
  padding: '4px 12px',
  borderRadius: '12px',
  fontSize: '0.8rem',
  fontWeight: 'bold',
  color: '#fff',
  backgroundColor: '#A4462D',
  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  '&::before': {
    content: '"!"',
    marginRight: '2px',
  }
}));

const DifficultyBadge = styled(Box)<{ difficulty: string }>(({ difficulty }) => ({
  position: 'absolute',
  top: -10,
  right: -10,
  padding: '4px 12px',
  borderRadius: '12px',
  fontSize: '0.8rem',
  fontWeight: 'bold',
  color: '#fff',
  backgroundColor: 
    difficulty === 'easy' ? '#4CAF50' :
    difficulty === 'medium' ? '#FF9800' :
    '#f44336',
  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
}));

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

  // Określ kolor na podstawie pozostałego czasu
  const getTimerColor = () => {
    if (timeLeft.totalHours < 1) return '#A4462D'; // Czerwony dla mniej niż godziny
    if (timeLeft.days < 1) return '#E6A446'; // Pomarańczowy dla mniej niż dnia
    return '#54291E'; // Standardowy kolor
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: 1,
      color: getTimerColor(),
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

const QuestBoardPage: React.FC = () => {
  const { getToken } = useStorage();
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchQuests();
  }, []);

  const fetchQuests = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const response = await fetch(getApiUrl('/sheets/quests'), {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Nie udało się pobrać questów');
      }

      const data = await response.json();
      setQuests(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Wystąpił błąd podczas pobierania questów');
    } finally {
      setLoading(false);
    }
  };

  // Funkcja określająca poziom trudności na podstawie liczby przedmiotów
  const determineDifficulty = (items: Quest['items']): 'easy' | 'medium' | 'hard' => {
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    if (totalItems <= 2) return 'easy';
    if (totalItems <= 5) return 'medium';
    return 'hard';
  };

  // Funkcja formatująca datę
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Funkcja sprawdzająca, czy zadanie jest pilne (mniej niż 3 dni)
  const isUrgent = (deadline: string): boolean => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const difference = deadlineDate.getTime() - now.getTime();
    const daysLeft = difference / (1000 * 60 * 60 * 24);
    return daysLeft < 3 && daysLeft > 0;
  };

  // Sortowanie zadań po dacie dostawy
  const sortedQuests = [...quests].sort((a, b) => 
    new Date(a.delivery_date).getTime() - new Date(b.delivery_date).getTime()
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <Box sx={{ 
      p: 4, 
      minHeight: '100vh',
      background: '#171713',
      backgroundImage: 'url("/wooden-texture.png")',
      backgroundBlend: 'multiply'
    }}>
      <Container maxWidth="lg">
        <Typography
          variant="h2"
          gutterBottom
          sx={{
            textAlign: 'center',
            fontFamily: '"Cinzel", serif',
            color: '#E6CB99',
            textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
            mb: 6
          }}
        >
          📜 Tablica Zadań 📜
        </Typography>

        <Grid container spacing={4}>
          {sortedQuests.map((quest, index) => {
            const urgent = isUrgent(quest.delivery_date);
            const difficulty = determineDifficulty(quest.items);
            const CardComponent = urgent ? UrgentQuestCard : QuestCard;
            
            return (
              <Grid item xs={12} md={6} key={index}>
                <CardComponent elevation={3}>
                  <DifficultyBadge difficulty={difficulty}>
                    {difficulty.toUpperCase()}
                  </DifficultyBadge>
                  
                  {urgent && (
                    <UrgencyBadge>
                      PILNE
                    </UrgencyBadge>
                  )}
                  
                  <Typography
                    variant="h5"
                    sx={{
                      fontFamily: '"Cinzel", serif',
                      color: '#54291E',
                      borderBottom: '2px solid #54291E',
                      pb: 1,
                      mb: 2
                    }}
                  >
                    Zlecenie dla: {quest.recipient}
                  </Typography>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <CountdownTimer deadline={quest.delivery_date} />
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#54291E',
                        fontStyle: 'italic',
                        fontSize: '0.9rem'
                      }}
                    >
                      Termin dostawy: {formatDate(quest.delivery_date)}
                    </Typography>
                  </Box>

                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1, 
                    mt: 2,
                    color: '#54291E',
                    backgroundColor: 'rgba(230, 203, 153, 0.3)',
                    p: 1,
                    borderRadius: '4px',
                    border: '1px dashed #A4462D'
                  }}>
                    <LocationOn sx={{ color: '#A4462D' }} />
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {quest.location} - {quest.pavilion}
                    </Typography>
                  </Box>

                  <Box sx={{ mt: 3 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        color: '#54291E',
                        fontFamily: '"Cinzel", serif',
                        mb: 1
                      }}
                    >
                      Wymagane przedmioty:
                    </Typography>
                    <Box component="ul" sx={{ 
                      m: 0, 
                      pl: 2,
                      listStyle: 'none'
                    }}>
                      {quest.items.map((item, idx) => (
                        <Box
                          component="li"
                          key={idx}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            mb: 1,
                            color: '#54291E',
                            '&::before': {
                              content: '"•"',
                              color: '#A4462D',
                              fontWeight: 'bold',
                              fontSize: '1.2rem'
                            }
                          }}
                        >
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {item.quantity}x {item.item_name}
                            {item.notes && (
                              <Typography
                                component="span"
                                sx={{
                                  ml: 1,
                                  fontSize: '0.9rem',
                                  fontStyle: 'italic',
                                  color: '#A4462D'
                                }}
                              >
                                ({item.notes})
                              </Typography>
                            )}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </CardComponent>
              </Grid>
            );
          })}
        </Grid>
      </Container>
    </Box>
  );
};

export default QuestBoardPage;
