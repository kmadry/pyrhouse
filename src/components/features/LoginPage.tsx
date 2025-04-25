import React from 'react';
import { Box, Container, Paper, Typography } from '@mui/material';
import LoginForm from './LoginForm';
import { useTheme } from '@mui/material/styles';

const LoginPage: React.FC = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
        padding: 2
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={3}
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: theme.palette.background.paper,
            borderRadius: 2
          }}
        >
          <Typography
            component="h1"
            variant="h4"
            sx={{
              mb: 3,
              color: theme.palette.primary.main,
              fontWeight: 'bold'
            }}
          >
            PyrHouse
          </Typography>
          <LoginForm />
        </Paper>
      </Container>
    </Box>
  );
};

export default LoginPage; 