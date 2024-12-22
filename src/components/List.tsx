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
  Button,
  Autocomplete,
} from '@mui/material';
import { CheckCircle, ErrorOutline, LocalShipping } from '@mui/icons-material';
import { ArrowDropUp, ArrowDropDown } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useLocations } from '../hooks/useLocations';

interface Equipment {
  id: number;
  category: string;
  quantity?: number;
  location: { id: number; name: string };
  state: string;
  pyr_code?: string;
  origin: string;
}

const EquipmentList: React.FC = () => {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [filter, setFilter] = useState<string>('');
  const [selectedLocations, setSelectedLocations] = useState<any[]>([]);
  const [sortField, setSortField] = useState<string>('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  const { locations, loading: locationsLoading } = useLocations();

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
    const matchesFilter =
      item.category.toLowerCase().includes(filter.toLowerCase()) ||
      item.state.toLowerCase().includes(filter.toLowerCase()) ||
      item?.pyr_code?.toLowerCase().includes(filter.toLowerCase());

    const matchesSelectedLocations =
      selectedLocations.length === 0 || selectedLocations.some((loc) => loc.id === item.location.id);

    return matchesFilter && matchesSelectedLocations;
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'in_stock':
        return <CheckCircle sx={{ color: 'green' }} />;
      case 'in_transit':
        return <LocalShipping sx={{ color: 'orange' }} />;
      case 'delivered':
        return <CheckCircle sx={{ color: 'orange' }} />;
      default:
        return <ErrorOutline sx={{ color: 'red' }} />;
    }
  };

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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
        <Typography variant="h4" gutterBottom>
          Stan magazynowy
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/add-item')}
        >
          Dodaj Nowy Sprzęt
        </Button>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, marginBottom: 2 }}>
        <TextField
          label="Filter by Name/Status"
          variant="outlined"
          value={filter}
          onChange={handleFilterChange}
          fullWidth
        />
        <Autocomplete
          multiple
          options={locations}
          getOptionLabel={(option) => option.name}
          value={selectedLocations}
          loading={locationsLoading}
          onChange={(_, value) => setSelectedLocations(value)}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Filter by Locations"
              variant="outlined"
              fullWidth
            />
          )}
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
              <TableRow
                key={item.id}
                sx={{
                  bgcolor: item.state === 'in_stock' ? 'rgba(200, 255, 200, 0.2)' : 'inherit',
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                <TableCell>{item.id}</TableCell>
                <TableCell>{item.category}</TableCell>
                <TableCell>
                  <Typography fontWeight="bold">{item.quantity ?? '-'}</Typography>
                </TableCell>
                <TableCell>{item.location.name}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {getStatusIcon(item.state)}
                    {item.state}
                  </Box>
                </TableCell>
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
