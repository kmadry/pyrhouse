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
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTransfers } from '../hooks/useTransfers';
import { ErrorMessage } from './ErrorMessage';
import { Transfer } from '../models/transfer';

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

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Lista Transferów</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/transfer/create')}
        >
          Utwórz Nowy Transfer
        </Button>
      </Box>

      {loading && <CircularProgress />}
      {error && <ErrorMessage message="Nie udało się załadować transferów" details={error} />}

      {!loading && !error && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Z lokalizacji</TableCell>
                <TableCell>Do lokalizacji</TableCell>
                <TableCell>Data transferu</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedTransfers.map((transfer) => (
                <TableRow
                  key={transfer.id}
                  sx={{
                    cursor: 'pointer',
                    bgcolor:
                      transfer.status === 'in_transit'
                        ? 'rgba(255, 245, 157, 0.5)'
                        : 'inherit',
                  }}
                  onClick={() => navigate(`/transfers/${transfer.id}`)}
                >
                  <TableCell>{transfer.id}</TableCell>
                  <TableCell>{transfer.from_location.name}</TableCell>
                  <TableCell>{transfer.to_location.name}</TableCell>
                  <TableCell>
                    {new Date(transfer.transfer_date).toLocaleString('pl-PL')}
                  </TableCell>
                  <TableCell>{transfer.status}</TableCell>
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
