import React, { useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Button,
  Chip,
  TextField,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTransfers } from '../hooks/useTransfers';
import { ErrorMessage } from './ErrorMessage';
import { Transfer } from '../models/transfer';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';

const TransfersListPage: React.FC = () => {
  const { transfers, loading, error, fetchTransfers } = useTransfers();
  const navigate = useNavigate();

  useEffect(() => {
    fetchTransfers();
  }, [fetchTransfers]);

  // Sort transfers with "in_transit" on top
  const sortedTransfers: Transfer[] = [...transfers].sort((a, b) => {
    if (a.status === 'in_transit' && b.status !== 'in_transit') return -1;
    if (a.status !== 'in_transit' && b.status === 'in_transit') return 1;
    return new Date(b.transfer_date).getTime() - new Date(a.transfer_date).getTime();
  });

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'in_transit':
        return <Chip icon={<LocalShippingIcon />} label="In Transit" color="warning" />;
      case 'completed':
        return <Chip icon={<CheckCircleIcon />} label="Completed" color="success" />;
      case 'created':
        return <Chip icon={<HourglassEmptyIcon />} label="Created" color="default" />;
      default:
        return <Chip label="Unknown" />;
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      {/* Header with Search and Create Button */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Lista Transferów</Typography>
        <TextField
          placeholder="Search transfers..."
          variant="outlined"
          size="small"
          sx={{ mr: 2, flexGrow: 1 }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/transfers/create')}
        >
          Utwórz Nowy Transfer
        </Button>
      </Box>

      {/* Loading and Error States */}
      {loading && <CircularProgress />}
      {error && <ErrorMessage message="Nie udało się załadować transferów" details={error} />}

      {/* Transfer Table */}
      {!loading && !error && (
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>ID</strong></TableCell>
                <TableCell><strong>Z lokalizacji</strong></TableCell>
                <TableCell><strong>Do lokalizacji</strong></TableCell>
                <TableCell><strong>Data transferu</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell align="center"><strong>Akcje</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedTransfers.map((transfer) => (
                <TableRow
                  key={transfer.id}
                  sx={{
                    cursor: 'pointer',
                  }}
                >
                  <TableCell>{transfer.id}</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>{transfer.from_location.name}</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>{transfer.to_location.name}</TableCell>
                  <TableCell>
                    {new Date(transfer.transfer_date).toLocaleString('pl-PL')}
                  </TableCell>
                  <TableCell>{getStatusChip(transfer.status)}</TableCell>
                  <TableCell align="center">
                    <Button
                      variant="text"
                      color="primary"
                      onClick={() => navigate(`/transfers/${transfer.id}`)}
                    >
                      Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default TransfersListPage;
