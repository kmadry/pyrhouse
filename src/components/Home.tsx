import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Grid,
  Paper,
  Divider,
  Stack,
  TextField,
} from '@mui/material';
import { ArrowForwardIos, LocalShipping, Search } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTransfers } from '../hooks/useTransfers';
import { ErrorMessage } from './ErrorMessage';

const HomePage: React.FC = () => {
  const { transfers, loading, fetchTransfers } = useTransfers();
  const navigate = useNavigate();

  const [pyrcode, setPyrcode] = useState<string>('');
  const [searchError, setSearchError] = useState<string | null>(null);

  // Fetch transfers on mount
  useEffect(() => {
    fetchTransfers();
  }, [fetchTransfers]);

  // Filter transfers to show only those "in transit"
  const inTransitTransfers = transfers.filter(
    (transfer) => transfer.status === 'in_transit'
  );

  const handleSearch = async () => {
    if (!pyrcode.trim()) {
      setSearchError('Please enter a valid Pyrcode.');
      return;
    }

    try {
      setSearchError(null); // Clear any previous errors
      const token = localStorage.getItem('token');
      const response = await fetch(
        `https://pyrhouse-backend-f26ml.ondigitalocean.app/api/assets/pyrcode/${pyrcode.trim()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 404) {
        setSearchError('No asset found with the given Pyrcode.');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch asset details.');
      }

      const data = await response.json();
      navigate(`/details/${data.id}?type=${data.category.type || 'asset'}`);
    } catch (err: any) {
      setSearchError(err.message || 'An unexpected error occurred.');
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Witaj w Pyrhouse-app
      </Typography>

      {/* Pyrcode Search */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, gap: 2 }}>
        <TextField
          label="Search by Pyrcode"
          variant="outlined"
          value={pyrcode}
          onChange={(e) => setPyrcode(e.target.value)}
          sx={{ flex: 1 }}
        />
        <Button
          variant="contained"
          color="primary"
          startIcon={<Search />}
          onClick={handleSearch}
          disabled={loading}
        >
          {loading ? <CircularProgress size={20} /> : 'Search'}
        </Button>
      </Box>
      {searchError && <ErrorMessage message={searchError} />}

      {/* Transfers Section */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Transfers In Transit
        </Typography>

        {inTransitTransfers.length === 0 && !loading && (
          <Typography>No transfers are currently in transit.</Typography>
        )}

        {inTransitTransfers.length > 0 && (
          <Grid container spacing={3}>
            {inTransitTransfers.map((transfer) => (
              <Grid item xs={12} sm={6} lg={4} key={transfer.id}>
                <Card
                  sx={{
                    borderLeft: '5px solid orange',
                    boxShadow: '0 3px 6px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  <CardContent>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <LocalShipping />
                      <Typography variant="h6">Transfer #{transfer.id}</Typography>
                    </Stack>

                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mt: 2,
                      }}
                    >
                      <Typography variant="body1" sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                        {transfer.from_location.name}
                      </Typography>
                      <ArrowForwardIos sx={{ mx: 2, color: 'orange' }} />
                      <Typography variant="body1" sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                        {transfer.to_location.name}
                      </Typography>
                    </Box>

                    <Divider sx={{ my: 2 }} />
                    <Button
                      size="small"
                      color="primary"
                      onClick={() => navigate(`/transfers/${transfer.id}`)}
                    >
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Quick Actions */}
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
