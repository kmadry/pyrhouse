import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
  Paper,
  TextField,
  CircularProgress,
} from '@mui/material';
import { ArrowDropUp, ArrowDropDown } from '@mui/icons-material';

interface Location {
  id: number;
  name: string;
}

interface Equipment {
  id: number;
  category: string;
  quantity?: number;
  location: Location;
  state: string;
  pyr_code?: string;
  origin: string;
}

const EquipmentList: React.FC = () => {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [filter, setFilter] = useState<string>('');
  const [sortField, setSortField] = useState<string>('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://pyrhouse-backend-f26ml.ondigitalocean.app/api/items');
        if (!response.ok) {
          throw new Error('Failed to fetch equipment data');
        }
        const data = await response.json();

        const transformedData = data.map((item: any) => ({
          id: item.id,
          category: item.category?.label || 'Unknown',
          quantity: item.quantity,
          location: item.location,
          state: item.status,
          pyr_code: item.pyrcode || undefined,
          origin: item.origin,
        }));
        setEquipment(transformedData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEquipment();
  }, []);

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(event.target.value);
  };

  const handleSort = (field: string) => {
    setSortField(field);
    setSortOrder((prevOrder) => (prevOrder === 'asc' ? 'desc' : 'asc'));
  };

  const filteredEquipment = equipment.filter((item) => {
    return (
      item.category.toLowerCase().includes(filter.toLowerCase()) ||
      item.state.toLowerCase().includes(filter.toLowerCase()) ||
      item?.pyr_code?.toLowerCase().includes(filter.toLowerCase())
    );
  });

  const sortedEquipment = [...filteredEquipment].sort((a, b) => {
    const valueA = a[sortField as keyof Equipment] || '';
    const valueB = b[sortField as keyof Equipment] || '';

    if (sortOrder === 'asc') {
      return valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
    } else {
      return valueA < valueB ? 1 : valueA > valueB ? -1 : 0;
    }
  });

  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <CircularProgress />
        <Typography>Loading Equipment...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography color="error">Error: {error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ margin: '0 auto', padding: 2 }}>
      <Typography variant="h4" gutterBottom>
        Equipment List
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, marginBottom: 2 }}>
        <TextField
          label="Filter"
          variant="outlined"
          value={filter}
          onChange={handleFilterChange}
        />
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {['ID', 'Typ', 'Ilość', 'Lokalizacja', 'Status', 'PYR_CODE', 'Pochodzenie'].map((field) => (
                <TableCell key={field} onClick={() => handleSort(field)} style={{ cursor: 'pointer' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <strong>{field.toUpperCase()}</strong>
                    {sortField === field && (
                      sortOrder === 'asc' ? <ArrowDropUp /> : <ArrowDropDown />
                    )}
                  </Box>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedEquipment.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.id}</TableCell>
                <TableCell>{item.category}</TableCell>
                <TableCell>{item.quantity ?? '-'}</TableCell>
                <TableCell>{item.location.name}</TableCell>
                <TableCell>{item.state}</TableCell>
                <TableCell>{item.pyr_code ?? '-'}</TableCell>
                <TableCell>{item.origin}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default EquipmentList;
