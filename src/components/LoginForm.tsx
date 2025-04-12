import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, TextField, Typography, Container, useTheme, Alert } from '@mui/material';

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
  const navigate = useNavigate();
  const theme = useTheme(); // Access the current theme

  // Funkcja do tłumaczenia komunikatów błędów
  const translateError = (errorMessage: string): string => {
    return errorMessages[errorMessage] || errorMessage;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    try {
      const response = await fetch('https://pyrhouse-backend-f26ml.ondigitalocean.app/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data: { token: string } = await response.json();
        localStorage.setItem('token', data.token); // Save token for authentication
        navigate('/home'); // Redirect to the home page
      } else {
        // Obsługa błędu 401 (nieprawidłowe dane logowania)
        if (response.status === 401) {
          const errorData = await response.json();
          const errorMessage = errorData.error || 'Invalid username or password';
          setError(translateError(errorMessage));
        } else {
          // Obsługa innych błędów
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

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: theme.palette.background.default,
      }}
    >
      <Container
        maxWidth="sm"
        sx={{
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          p: 4,
          borderRadius: 2,
          boxShadow: theme.shadows[3],
        }}
      >
        <form onSubmit={handleSubmit}>
          <Typography variant="h4" gutterBottom align="center">
            Login
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <TextField
            label="Username"
            variant="outlined"
            fullWidth
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            sx={{ mb: 2 }}
            disabled={isLoading}
          />
          <TextField
            label="Password"
            type="password"
            variant="outlined"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            sx={{ mb: 2 }}
            disabled={isLoading}
          />
          <Button 
            variant="contained" 
            color="primary" 
            type="submit" 
            fullWidth
            disabled={isLoading}
          >
            {isLoading ? 'Logowanie...' : 'Login'}
          </Button>
        </form>
      </Container>
    </Box>
  );
};

export default LoginForm;
