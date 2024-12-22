import React, { useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Grid,
  Chip,
  CircularProgress,
  Snackbar,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTransfers } from '../hooks/useTransfers';
import { ErrorMessage } from './ErrorMessage';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';

const QuestBoard: React.FC = () => {
  const { transfers, loading, error, fetchTransfers } = useTransfers();
  const navigate = useNavigate();

  useEffect(() => {
    fetchTransfers();
  }, [fetchTransfers]);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'in_transit':
        return { bgcolor: 'warning.main', label: 'In Transit' };
      case 'completed':
        return { bgcolor: 'success.main', label: 'Completed' };
      default:
        return { bgcolor: 'info.main', label: 'Pending' };
    }
  };

  return (
    <Box sx={{ p: 4, backgroundColor: '#1b1f3b', minHeight: '100vh', color: 'white' }}>
      <Typography
        variant="h3"
        gutterBottom
        sx={{ textAlign: 'center', fontFamily: '"Cinzel", serif' }}
      >
        🛡️ Quest Board 🛡️
      </Typography>
      <Typography
        variant="subtitle1"
        sx={{ textAlign: 'center', mb: 4, fontStyle: 'italic', color: '#b2b2d8' }}
      >
        Take on quests, complete missions, and earn your place in the hall of fame.
      </Typography>

      {loading && <CircularProgress sx={{ display: 'block', mx: 'auto', color: '#b2b2d8' }} />}
      {error && <ErrorMessage message={error} />}

      <Grid container spacing={3}>
        {transfers.map((transfer) => {
          const statusStyle = getStatusStyle(transfer.status);
          return (
            <Grid item xs={12} sm={6} md={4} key={transfer.id}>
              <Box sx={{ width: 500 }}>
                <Snackbar
                    anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                    open={true}
                    message="Totalnie wygenerowane, nieprzemyślane, to tylko test!"
                />
              </Box>
              <Card
                sx={{
                  background: `linear-gradient(145deg, #2c2f56, #23253f)`,
                  boxShadow: `0px 4px 15px rgba(0, 0, 0, 0.5)`,
                  borderRadius: 2,
                  position: 'relative',
                }}
              >
                <CardContent>
                  <Typography
                    variant="h5"
                    gutterBottom
                    sx={{
                      fontFamily: '"Cinzel", serif',
                      fontWeight: 'bold',
                      textAlign: 'center',
                    }}
                  >
                    {`Quest #${transfer.id}`}
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      mt: 2,
                      background: '#252744',
                      p: 2,
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant="body1" color="white" fontWeight="bold">
                      {transfer.from_location.name}
                    </Typography>
                    <LocalShippingIcon sx={{ color: '#ffc107', fontSize: 30 }} />
                    <Typography variant="body1" color="white" fontWeight="bold">
                      {transfer.to_location.name}
                    </Typography>
                  </Box>
                  <Chip
                    label={statusStyle.label}
                    sx={{
                      mt: 2,
                      width: '100%',
                      bgcolor: statusStyle.bgcolor,
                      color: 'white',
                      fontWeight: 'bold',
                    }}
                  />
                </CardContent>
                <CardActions>
                  <Button
                    fullWidth
                    variant="contained"
                    sx={{
                      bgcolor: '#ffc107',
                      color: 'black',
                      fontWeight: 'bold',
                      '&:hover': { bgcolor: '#e0a800' },
                    }}
                    onClick={() => navigate(`/transfers/${transfer.id}`)}
                  >
                    Accept Quest
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default QuestBoard;
