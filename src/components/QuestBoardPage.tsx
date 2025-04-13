import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Grid,
  Paper,
  Menu,
  MenuItem,
} from '@mui/material';
import { AccessTime, LocationOn } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  role: string;
  exp: number;
  userID: number;
}

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
    background: 'url("/parchment-texture.png")', // Możesz dodać teksturę pergaminu
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
  const [quests, setQuests] = useState<Quest[]>([]);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [difficultyMenuAnchor, setDifficultyMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedQuestId, setSelectedQuestId] = useState<number | null>(null);

  // Funkcja do sprawdzania roli użytkownika
  const checkUserRole = () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = jwtDecode<JwtPayload>(token);
        setIsAdmin(decodedToken.role === 'admin');
      } catch (error) {
        console.error('Błąd dekodowania tokenu:', error);
        setIsAdmin(false);
      }
    } else {
      setIsAdmin(false);
    }
  };

  // Funkcja określająca poziom trudności na podstawie liczby przedmiotów
  const determineDifficulty = (items: Quest['items']): Quest['difficulty'] => {
    if (items.length === 0) return 'easy';
    if (items.length <= 2) return 'easy';
    if (items.length <= 5) return 'medium';
    return 'hard';
  };

  // Funkcja formatująca datę
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Obsługa menu trudności
  const handleDifficultyClick = (event: React.MouseEvent<HTMLElement>, questId: number) => {
    setDifficultyMenuAnchor(event.currentTarget);
    setSelectedQuestId(questId);
  };

  const handleDifficultyClose = () => {
    setDifficultyMenuAnchor(null);
    setSelectedQuestId(null);
  };

  const handleDifficultyChange = (newDifficulty: Quest['difficulty']) => {
    if (selectedQuestId !== null) {
      setQuests(prevQuests => 
        prevQuests.map(quest => {
          if (quest.id === selectedQuestId) {
            // Automatyczne dostosowanie nagrody w zależności od trudności
            let newReward = '';
            switch (newDifficulty) {
              case 'easy':
                newReward = `${Math.floor(Math.random() * 201) + 100} złotych monet`;
                break;
              case 'medium':
                newReward = `${Math.floor(Math.random() * 300) + 301} złotych monet`;
                break;
              case 'hard':
                newReward = `${Math.floor(Math.random() * 401) + 600} złotych monet`;
                break;
            }
            return { ...quest, difficulty: newDifficulty, reward: newReward };
          }
          return quest;
        })
      );
    }
    handleDifficultyClose();
  };

  // Funkcja sprawdzająca, czy zadanie jest pilne (mniej niż godzina)
  const isUrgent = (deadline: string): boolean => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const difference = deadlineDate.getTime() - now.getTime();
    const hoursLeft = difference / (1000 * 60 * 60);
    return hoursLeft < 1 && hoursLeft > 0;
  };

  useEffect(() => {
    // Sprawdź rolę użytkownika
    checkUserRole();
    
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
        location: 'Sala Konferencyjna - Poziom 3'
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
        location: 'Sala Tronowa - Poziom 1'
      },
      {
        id: 3,
        // 30 minut od teraz (pilne!)
        deadline: new Date(now.getTime() + 30 * 60 * 1000).toISOString(),
        description: 'Pilne! Przeprowadź inwentaryzację sprzętu w magazynie głównym. Sprawdź numery seryjne i stan techniczny wszystkich urządzeń.',
        items: [],
        reward: '200 złotych monet',
        location: 'Magazyn Główny - Poziom -1'
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
        location: 'Arena Główna - Poziom 2'
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
        location: 'Plac Targowy - Miasto'
      }
    ];

    // Dodajemy poziom trudności do każdego questu
    const questsWithDifficulty = mockQuests.map(quest => ({
      ...quest,
      difficulty: determineDifficulty(quest.items)
    }));

    setQuests(questsWithDifficulty);
  }, []);

  // Sortowanie zadań po deadline (od najstarszych do najnowszych)
  const sortedQuests = [...quests].sort((a, b) => 
    new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
  );

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
          📜 Quest Board 📜
        </Typography>

        <Grid container spacing={4}>
          {sortedQuests.map((quest) => {
            const urgent = isUrgent(quest.deadline);
            const CardComponent = urgent ? UrgentQuestCard : QuestCard;
            
            return (
              <Grid item xs={12} md={6} key={quest.id}>
                <CardComponent elevation={3}>
                  <DifficultyBadge 
                    difficulty={quest.difficulty || 'medium'}
                    onClick={isAdmin ? (e) => handleDifficultyClick(e, quest.id) : undefined}
                    sx={isAdmin ? { cursor: 'pointer' } : {}}
                  >
                    {quest.difficulty?.toUpperCase() || 'MEDIUM'}
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
                    Quest #{quest.id}
                  </Typography>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <CountdownTimer deadline={quest.deadline} />
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#54291E',
                        fontStyle: 'italic',
                        fontSize: '0.9rem'
                      }}
                    >
                      Data wykonania: {formatDate(quest.deadline)}
                    </Typography>
                  </Box>

                  {/* Wyświetlanie lokalizacji */}
                  {quest.location && (
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
                        Lokalizacja: {quest.location}
                      </Typography>
                    </Box>
                  )}

                  <Typography
                    variant="body1"
                    sx={{
                      color: '#54291E',
                      mt: 2,
                      fontStyle: 'italic',
                      fontSize: '1.1rem'
                    }}
                  >
                    {quest.description}
                  </Typography>

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
                      {quest.items.map((item, index) => (
                        <Box
                          component="li"
                          key={index}
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
                            {item.quantity}x {item.name}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>

                  {quest.reward && (
                    <Box sx={{ 
                      mt: 3, 
                      pt: 2, 
                      borderTop: '2px solid #54291E',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      gap: 1
                    }}>
                      <Typography
                        variant="h6"
                        sx={{
                          color: '#000000',
                          fontFamily: '"Cinzel", serif',
                          textShadow: '0px 0px 1px rgba(230, 203, 153, 0.8)',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          border: '1px solid #E6CB99',
                          backgroundColor: 'rgba(230, 203, 153, 0.2)',
                          fontWeight: 'bold'
                        }}
                      >
                        Nagroda: {quest.reward}
                      </Typography>
                    </Box>
                  )}
                </CardComponent>
              </Grid>
            );
          })}
        </Grid>
      </Container>

      {/* Menu do zmiany trudności */}
      <Menu
        anchorEl={difficultyMenuAnchor}
        open={Boolean(difficultyMenuAnchor)}
        onClose={handleDifficultyClose}
      >
        <MenuItem onClick={() => handleDifficultyChange('easy')}>Łatwy</MenuItem>
        <MenuItem onClick={() => handleDifficultyChange('medium')}>Średni</MenuItem>
        <MenuItem onClick={() => handleDifficultyChange('hard')}>Trudny</MenuItem>
      </Menu>
    </Box>
  );
};

export default QuestBoardPage;
