import React, { lazy, Suspense } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  CircularProgress,
  Button,
  Stack,
  useTheme,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTransfers } from '../../hooks/useTransfers';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';

// Lazy loaded icons
const LocalShippingIcon = lazy(() => import('@mui/icons-material/LocalShipping'));
const ArrowForward = lazy(() => import('@mui/icons-material/ArrowForward'));

const OngoingTransfersPage: React.FC = () => {
  const { transfers, loading } = useTransfers();
  const navigate = useNavigate();
  const theme = useTheme();

  // Filtrujemy tylko transfery w trakcie
  const ongoingTransfers = transfers.filter(transfer => transfer.status === 'in_transit');

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        minHeight: '400px',
        flexDirection: 'column',
        gap: 2
      }}>
        <CircularProgress size={40} />
        <Typography variant="body1" color="text.secondary">
          Ładowanie aktywnych transferów...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      margin: '0 auto', 
      padding: { xs: 2, sm: 3, md: 4 },
      maxWidth: '1400px',
    }}>
      <Box sx={{ 
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 4,
        borderBottom: '1px solid',
        borderColor: 'divider',
        pb: 2
      }}>
        <Typography 
          variant="h4" 
          component="h1" 
          sx={{ 
            fontWeight: 600,
            color: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          <Suspense fallback={null}>
            <LocalShippingIcon />
          </Suspense>
          Aktywne transfery
        </Typography>
      </Box>

      {ongoingTransfers.length === 0 ? (
        <Box sx={{ 
          textAlign: 'center',
          p: 5,
          backgroundColor: 'background.default',
          borderRadius: 2,
          border: '1px dashed',
          borderColor: 'divider'
        }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Brak aktywnych transferów
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Wszystkie transfery zostały zakończone
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {ongoingTransfers.map((transfer) => (
            <Grid item xs={12} sm={6} md={4} key={transfer.id}>
              <Card 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 2,
                  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[4],
                    cursor: 'pointer'
                  }
                }}
                onClick={() => navigate(`/transfers/${transfer.id}`)}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
                        Transfer #{transfer.id}
                      </Typography>
                      <Chip 
                        icon={<Suspense fallback={null}><LocalShippingIcon /></Suspense>}
                        label="W trakcie"
                        color="warning"
                        size="small"
                      />
                    </Box>

                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      gap: 1,
                      color: 'text.secondary'
                    }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {transfer.from_location.name}
                      </Typography>
                      <Suspense fallback={null}>
                        <ArrowForward sx={{ fontSize: 16 }} />
                      </Suspense>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {transfer.to_location.name}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                        Data rozpoczęcia:
                      </Typography>
                      <Typography variant="body2">
                        {format(new Date(transfer.transfer_date), 'dd MMMM yyyy, HH:mm', { locale: pl })}
                      </Typography>
                    </Box>

                    <Button
                      variant="outlined"
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/transfers/${transfer.id}`);
                      }}
                      sx={{ 
                        mt: 'auto',
                        alignSelf: 'flex-start'
                      }}
                    >
                      Szczegóły
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default OngoingTransfersPage; 