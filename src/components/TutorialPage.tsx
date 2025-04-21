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
  Grid
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
    description: 'Utwórz nową dostawę, aby zorganizować transport sprzętu między lokalizacjami. Możesz dodać wiele przedmiotów i określić kto bierze udział w dostawie.',
    icon: <RocketLaunch />,
    action: '/transfers/create',
  },
  {
    label: 'Dodawanie nowego sprzętu',
    description: 'Dodaj nowy sprzęt do systemu skanując jego numer seryjny oraz określając jego kategorię oraz pochodzenie. System automatycznie generuje PYRcode. Możesz dodać wiele przedmiotów naraz.',
    icon: <AddTask />,
    action: '/add-item',
  },
  {
    label: 'Zarządzanie magazynem',
    description: 'Przeglądaj stan magazynowy, sprawdzaj dostępność sprzętu i zarządzaj jego lokalizacjami.',
    icon: <Inventory />,
    action: '/list',
  },
  {
    label: 'Przeglądanie questów',
    description: 'Sprawdź wszystkie aktywne i zakończone dostawy, ich status i szczegóły.',
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

  // Używamy useMemo, aby uniknąć niepotrzebnych przeliczeń
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
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {step.description}
                        </Typography>
                        <Box sx={{ mb: 2 }}>
                          <Button
                            variant="contained"
                            onClick={() => navigate(step.action)}
                            endIcon={<ArrowForward />}
                            sx={{ mr: 1 }}
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
                justifyContent: 'center',
                alignItems: 'center',
                p: 4,
                background: theme.palette.background.default,
                borderRadius: 2,
              }}
            >
              <Box sx={{ mb: 4, textAlign: 'center' }}>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                  {currentStep.label}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {currentStep.description}
                </Typography>
              </Box>

              <StepNavigation 
                activeStep={activeStep} 
                totalSteps={TUTORIAL_STEPS.length} 
                onBack={handleBack} 
                onNext={handleNext} 
              />
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default TutorialPage; 