import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Container, 
  useTheme, 
  Alert, 
  Paper, 
  InputAdornment, 
  IconButton, 
  CircularProgress,
  Fade,
  Divider
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff, 
  Person, 
  Lock, 
  Login as LoginIcon 
} from '@mui/icons-material';
import { getApiUrl } from '../config/api';
import { useStorage } from '../hooks/useStorage';
import pyrkonLogo from '../assets/images/p-logo.png';

// Mapowanie komunikatów błędów na polskie tłumaczenia
const errorMessages: Record<string, string> = {
  'Invalid username or password': 'Niepoprawny login lub hasło',
  'User not found': 'Użytkownik nie znaleziony',
  'Invalid credentials': 'Niepoprawne dane logowania',
  'Authentication failed': 'Uwierzytelnianie nie powiodło się',
  'Server error': 'Błąd serwera',
  'Network error': 'Błąd sieci',
  'Unknown error': 'Nieznany błąd'
};

const LoginForm: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [capsLockOn, setCapsLockOn] = useState<boolean>(false);
  const navigate = useNavigate();
  const theme = useTheme();
  const { setToken } = useStorage();

  // Automatyczne skupienie na polu username
  useEffect(() => {
    const usernameField = document.getElementById('username-field');
    if (usernameField) {
      usernameField.focus();
    }
  }, []);

  // Wykrywanie Caps Lock
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.getModifierState('CapsLock')) {
        setCapsLockOn(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!e.getModifierState('CapsLock')) {
        setCapsLockOn(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Funkcja do tłumaczenia komunikatów błędów
  const translateError = (errorMessage: string): string => {
    return errorMessages[errorMessage] || errorMessage;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    try {
      const response = await fetch(getApiUrl('/auth'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data: { token: string } = await response.json();
        setToken(data.token);
        navigate('/home');
      } else {
        if (response.status === 401) {
          const errorData = await response.json();
          const errorMessage = errorData.error || 'Invalid username or password';
          setError(translateError(errorMessage));
        } else {
          const errorData = await response.json();
          const errorMessage = errorData.error || 'Unknown error';
          setError(translateError(errorMessage));
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setError(translateError('Network error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: theme.palette.background.default,
        backgroundImage: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.background.default} 100%)`,
      }}
    >
      <Fade in={true} timeout={800}>
        <Container maxWidth="sm">
          <Paper
            elevation={6}
            sx={{
              p: 4,
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
              },
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              }
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
              <Box 
                component="img" 
                src={pyrkonLogo} 
                alt="Pyrkon Logo" 
                sx={{ 
                  height: '60px', 
                  width: 'auto', 
                  mb: 2,
                  transition: 'transform 0.3s ease',
                  filter: theme.palette.mode === 'light' 
                    ? 'drop-shadow(0 0 2px rgba(0,0,0,0.3)) drop-shadow(0 0 4px rgba(0,0,0,0.2))'
                    : 'none',
                  '&:hover': {
                    transform: 'scale(1.05)',
                  }
                }} 
              />
              <Typography 
                variant="h4" 
                component="h1" 
                gutterBottom 
                sx={{ 
                  fontWeight: 700,
                  background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textAlign: 'center',
                }}
              >
                PyrHouse
              </Typography>
              <Typography variant="body1" color="text.secondary" align="center">
                Zaloguj się, aby kontynuować
              </Typography>
            </Box>

            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 3, 
                  borderRadius: 2,
                  '& .MuiAlert-icon': {
                    fontSize: '1.2rem',
                  }
                }}
              >
                {error}
              </Alert>
            )}

            {capsLockOn && (
              <Alert 
                severity="warning" 
                sx={{ 
                  mb: 3, 
                  borderRadius: 2,
                  '& .MuiAlert-icon': {
                    fontSize: '1.2rem',
                  }
                }}
              >
                Caps Lock jest włączony
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <TextField
                id="username-field"
                label="Nazwa użytkownika"
                variant="outlined"
                fullWidth
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                sx={{ 
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: theme.palette.primary.main,
                      }
                    },
                    '&.Mui-focused': {
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderWidth: 2,
                      }
                    }
                  }
                }}
                disabled={isLoading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person color="action" />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                label="Hasło"
                type={showPassword ? 'text' : 'password'}
                variant="outlined"
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                sx={{ 
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: theme.palette.primary.main,
                      }
                    },
                    '&.Mui-focused': {
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderWidth: 2,
                      }
                    }
                  }
                }}
                disabled={isLoading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleTogglePasswordVisibility}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Button 
                variant="contained" 
                color="primary" 
                type="submit" 
                fullWidth
                disabled={isLoading}
                sx={{ 
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 600,
                  fontSize: '1rem',
                  textTransform: 'none',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)',
                    transform: 'translateY(-2px)',
                  },
                  '&:active': {
                    transform: 'translateY(0)',
                  }
                }}
                startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <LoginIcon />}
              >
                {isLoading ? 'Logowanie...' : 'Zaloguj się'}
              </Button>
            </form>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                © {new Date().getFullYear()} PyrHouse - System zarządzania sprzętem
              </Typography>
            </Box>
          </Paper>
        </Container>
      </Fade>
    </Box>
  );
};

export default LoginForm;
