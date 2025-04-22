import React, { useState, useMemo } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Button,
  useTheme,
  Card,
  CardContent,
  Grid,
  Stack,
  Chip
} from '@mui/material';
import {
  Search,
  AddTask,
  Inventory,
  ListAlt,
  RocketLaunch,
  ArrowForward,
  ArrowBack,
  Close,
  Check,
  LocationOn,
  MyLocation,
  Map,
  AccountCircle,
  Home,
  Navigation,
  History,
  Update,
  Info,
  GpsFixed
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// Przenosimy dane kroków poza komponent, aby nie były odtwarzane przy każdym renderowaniu
const TUTORIAL_STEPS = [
  {
    label: 'Wyszukiwanie sprzętu',
    description: 'Użyj pola wyszukiwania na stronie głównej, aby znaleźć sprzęt po kodzie PYR. Wpisz kod lub jego fragment, a system podpowie Ci dostępne opcje.',
    icon: <Search />,
    action: '/home',
  },
  {
    label: 'Tworzenie questów-dostaw',
    description: 'Utwórz nową dostawę, aby zorganizować transport sprzętu między lokalizacjami. Możesz dodać wiele przedmiotów i określić kto bierze udział w dostawie. Pamiętaj o wybraniu lokalizacji docelowej i uczestników questa.',
    icon: <RocketLaunch />,
    action: '/transfers/create',
  },
  {
    label: 'Zarządzanie dostawą',
    description: (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Jako uczestnik questa masz dostęp do wielu funkcji ułatwiających zarządzanie dostawą:
        </Typography>
        
        <Stack spacing={2}>
          {/* Sekcja Aktualizacji Lokalizacji */}
          <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default' }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <MyLocation color="primary" />
              <Typography variant="subtitle2" fontWeight="600">
                Aktualizacja Lokalizacji
              </Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              W szczegółach transferu użyj przycisku "Aktualizuj lokalizację" aby zaznaczyć aktualną pozycję sprzętu na mapie.
            </Typography>
            <Paper 
              elevation={0} 
              sx={{ 
                mt: 1.5, 
                mb: 1.5, 
                p: 1.5, 
                bgcolor: 'info.lighter',
                border: '1px solid',
                borderColor: 'info.light',
                borderRadius: 1
              }}
            >
              <Stack direction="row" spacing={1} alignItems="flex-start">
                <Info color="info" sx={{ mt: 0.3 }} />
                <Typography variant="body2">
                  System może poprosić o dostęp do Twojej lokalizacji - pomoże to w dokładniejszym określeniu pozycji sprzętu. Nie martw się, nie zbieramy ani nie przechowujemy tych danych.
                </Typography>
              </Stack>
            </Paper>
            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
              <Chip 
                icon={<Map fontSize="small" />} 
                label="Mapa" 
                size="small" 
                variant="outlined" 
              />
              <Chip 
                icon={<Navigation fontSize="small" />} 
                label="GPS" 
                size="small" 
                variant="outlined" 
              />
              <Chip 
                icon={<GpsFixed fontSize="small" />} 
                label="Lokalizacja" 
                size="small" 
                variant="outlined" 
              />
            </Stack>
          </Paper>

          {/* Sekcja Śledzenia Dostaw */}
          <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default' }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <History color="primary" />
              <Typography variant="subtitle2" fontWeight="600">
                Śledzenie Dostaw
              </Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              Monitoruj swoje aktywne questy w dwóch wygodnych miejscach:
            </Typography>
            <Stack spacing={1} sx={{ mt: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Home fontSize="small" color="action" />
                <Typography variant="body2">
                  Strona główna - szybki podgląd bieżących questów
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AccountCircle fontSize="small" color="action" />
                <Typography variant="body2">
                  "Mój profil" w górnym pasku - pełna lista Twoich questów
                </Typography>
              </Box>
            </Stack>
          </Paper>

          {/* Sekcja Historii */}
          <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default' }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <Update color="primary" />
              <Typography variant="subtitle2" fontWeight="600">
                Historia i Status
              </Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              Śledź historię lokalizacji i postęp dostawy w czasie rzeczywistym. System automatycznie zapisuje wszystkie aktualizacje i zmiany statusu.
            </Typography>
          </Paper>
        </Stack>
      </Box>
    ),
    icon: <LocationOn />,
    action: '/transfers',
  },
  {
    label: 'Dodawanie nowego sprzętu',
    description: 'Dodaj nowy sprzęt do systemu skanując jego numer seryjny oraz określając jego kategorię oraz pochodzenie. System automatycznie generuje PYRcode. Możesz dodać wiele przedmiotów naraz.',
    icon: <AddTask />,
    action: '/add-item',
  },
  {
    label: 'Zarządzanie magazynem',
    description: 'Przeglądaj stan magazynowy, sprawdzaj dostępność sprzętu i zarządzaj jego lokalizacjami. Możesz filtrować sprzęt po kategorii i lokalizacji.',
    icon: <Inventory />,
    action: '/list',
  },
  {
    label: 'Przeglądanie questów',
    description: 'Sprawdź wszystkie aktywne i zakończone dostawy, ich status i szczegóły. W szczegółach questa zobaczysz historię lokalizacji sprzętu, co pomoże Ci śledzić przebieg dostawy.',
    icon: <ListAlt />,
    action: '/transfers',
  },
];

// Wydzielamy komponenty, aby zmniejszyć złożoność głównego komponentu
interface StepNavigationProps {
  activeStep: number;
  totalSteps: number;
  onBack: () => void;
  onNext: () => void;
}

const StepNavigation: React.FC<StepNavigationProps> = ({ activeStep, totalSteps, onBack, onNext }) => (
  <Box sx={{ display: 'flex', gap: 2 }}>
    <Button
      disabled={activeStep === 0}
      onClick={onBack}
      startIcon={<ArrowBack />}
    >
      Wstecz
    </Button>
    <Button
      variant="contained"
      onClick={onNext}
      disabled={activeStep === totalSteps - 1}
      endIcon={activeStep === totalSteps - 1 ? <Check /> : <ArrowForward />}
    >
      {activeStep === totalSteps - 1 ? 'Zakończ' : 'Dalej'}
    </Button>
  </Box>
);

const TutorialPage: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const theme = useTheme();
  const navigate = useNavigate();

  const currentStep = useMemo(() => TUTORIAL_STEPS[activeStep], [activeStep]);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSkip = () => {
    navigate('/home');
  };

  const handleStepClick = (index: number) => {
    setActiveStep(index);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 4 },
          borderRadius: 2,
          background: theme.palette.background.paper,
        }}
      >
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
            Przewodnik po systemie
          </Typography>
          <Button
            variant="outlined"
            color="primary"
            onClick={handleSkip}
            startIcon={<Close />}
          >
            Zamknij przewodnik
          </Button>
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Card
              elevation={0}
              sx={{
                height: '100%',
                background: theme.palette.background.default,
                borderRadius: 2,
              }}
            >
              <CardContent>
                <Stepper activeStep={activeStep} orientation="vertical">
                  {TUTORIAL_STEPS.map((step, index) => (
                    <Step key={step.label}>
                      <StepLabel
                        StepIconProps={{
                          icon: step.icon,
                        }}
                        onClick={() => handleStepClick(index)}
                        sx={{
                          cursor: 'pointer',
                          '& .MuiStepLabel-label': {
                            typography: 'body1',
                            fontWeight: activeStep === index ? 600 : 400,
                          },
                        }}
                      >
                        {step.label}
                      </StepLabel>
                      <StepContent>
                        <Box sx={{ mt: 2 }}>
                          <Button
                            variant="contained"
                            onClick={() => navigate(step.action)}
                            endIcon={<ArrowForward />}
                            fullWidth
                            sx={{ 
                              py: 1,
                              borderRadius: 1.5,
                              boxShadow: 'none',
                              '&:hover': {
                                boxShadow: 1
                              }
                            }}
                          >
                            Wypróbuj
                          </Button>
                        </Box>
                      </StepContent>
                    </Step>
                  ))}
                </Stepper>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={8}>
            <Box
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                p: 4,
                background: theme.palette.background.default,
                borderRadius: 2,
              }}
            >
              <Box sx={{ mb: 4 }}>
                <Typography variant="h5" gutterBottom sx={{ 
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  {currentStep.icon}
                  {currentStep.label}
                </Typography>
                <Box sx={{ mt: 3 }}>
                  {currentStep.description}
                </Box>
              </Box>

              <Box sx={{ mt: 'auto', pt: 4, borderTop: '1px solid', borderColor: 'divider' }}>
                <StepNavigation 
                  activeStep={activeStep} 
                  totalSteps={TUTORIAL_STEPS.length} 
                  onBack={handleBack} 
                  onNext={handleNext} 
                />
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default TutorialPage; 