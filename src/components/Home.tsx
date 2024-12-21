import React, { useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Card,
  CardContent,
  CardActions,
  Button,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Grid,
  Paper,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTransfers } from '../hooks/useTransfers';
import { ErrorMessage } from './ErrorMessage';

const HomePage: React.FC = () => {
  const { transfers, loading, error, fetchTransfers } = useTransfers();
  const navigate = useNavigate();

  // Fetch transfers on mount
  useEffect(() => {
    fetchTransfers();
  }, [fetchTransfers]);

  const steps = ['Created', 'In Transit', 'Delivered'];

  // Filter transfers to show only those "in transit"
  const inTransitTransfers = transfers.filter(
    (transfer) => transfer.status === 'in_transit'
  );

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Welcome to the Transfer Management App
      </Typography>

      {error && <ErrorMessage message={error} />}
      {loading && <CircularProgress />}

      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Transfers In Transit
        </Typography>

        {inTransitTransfers.length === 0 && !loading && (
          <Typography>No transfers are currently in transit.</Typography>
        )}

        {inTransitTransfers.length > 0 && (
          <Grid container spacing={2}>
            {inTransitTransfers.map((transfer) => (
              <Grid item xs={12} md={6} lg={4} key={transfer.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Transfer #{transfer.id}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      From: {transfer.from_location.name}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      To: {transfer.to_location.name}
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <Stepper activeStep={1}>
                        {steps.map((label, index) => (
                          <Step key={index}>
                            <StepLabel>{label}</StepLabel>
                          </Step>
                        ))}
                      </Stepper>
                    </Box>
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      color="primary"
                      onClick={() => navigate(`/transfers/${transfer.id}`)}
                    >
                      View Details
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

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
              <Typography variant="h6">Create Transfer</Typography>
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
              <Typography variant="h6">Manage Stocks</Typography>
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
              <Typography variant="h6">View All Transfers</Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default HomePage;
