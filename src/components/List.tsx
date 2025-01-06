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
  Autocomplete,
  Select,
  MenuItem,
  Chip,
} from '@mui/material';
import { CheckCircle, ErrorOutline, LocalShipping, ArrowDropUp, ArrowDropDown } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useLocations } from '../hooks/useLocations';
import { useCategories } from '../hooks/useCategories';
import { ErrorMessage } from './ErrorMessage';

interface Equipment {
  id: number;
  category: string;
  quantity?: number;
  location: { id: number; name: string };
  state: string;
  pyr_code?: string;
  origin: string;
  type: 'asset' | 'stock'; // Include type from response
}

interface QuickFilter {
  id: number;
  name: string;
}

const EquipmentList: React.FC = () => {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [filter, setFilter] = useState<string>('');
  const [selectedLocations, setSelectedLocations] = useState<{ id: number; name: string }[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<{ id: number; label: string } | null>(null);
  const [categoryType, setCategoryType] = useState<'asset' | 'stock' | ''>('');
  const [sortField, setSortField] = useState<string>('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  const { locations, loading: locationsLoading } = useLocations();
  const { categories, loading: categoriesLoading } = useCategories();

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (selectedLocations.length > 0) {
        selectedLocations.forEach((location) => {
          params.append('location_ids', String(location.id));
        });
      }
      if (selectedCategory) {
        params.append('category_id', String(selectedCategory.id));
      }
      if (categoryType) {
        params.append('category_type', categoryType);
      }

      const response = await fetch(
        `https://pyrhouse-backend-f26ml.ondigitalocean.app/api/items?${params.toString()}`
      );

      if (response.status === 400 || response.status === 404) {
        setEquipment([]);
        setError('');
        return;
      }

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
        type: item.category?.type || 'asset', // Get type from category
      }));

      setEquipment(transformedData);
      setError('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipment();
  }, [selectedLocations, selectedCategory, categoryType]);

  const handleSort = (field: string) => {
    setSortField(field);
    setSortOrder((prevOrder) => (prevOrder === 'asc' ? 'desc' : 'asc'));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'in_stock':
      case 'delivered':
        return <CheckCircle sx={{ color: 'green' }} />;
      case 'in_transit':
        return <LocalShipping sx={{ color: 'orange' }} />;
      default:
        return <ErrorOutline sx={{ color: 'red' }} />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'in_stock':
        return 'Na Stanie';
      case 'in_transit':
        return 'W trasie';
      case 'delivered':
        return 'Dostarczone';
      default:
        return '';
    }
  };

  const quickFilters: QuickFilter[] = [{ id: 1, name: 'Magazyn Techniczny' }];

  const applyQuickFilter = (filter: QuickFilter) => {
    const location = locations.find((loc) => loc.id === filter.id);
    if (location && !selectedLocations.some((loc) => loc.id === location.id)) {
      setSelectedLocations((prev) => [...prev, location]);
    }
  };

  const removeQuickFilter = (filter: QuickFilter) => {
    setSelectedLocations((prev) => prev.filter((loc) => loc.id !== filter.id));
  };

  return (
    <Box sx={{ margin: '0 auto', padding: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
        <Typography variant="h4" gutterBottom>
          Stan magazynowy
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, marginBottom: 2 }}>
        {quickFilters.map((filter) => (
          <Chip
            key={filter.id}
            label={filter.name}
            color={selectedLocations.some((loc) => loc.id === filter.id) ? 'primary' : 'default'}
            onClick={() =>
              selectedLocations.some((loc) => loc.id === filter.id)
                ? removeQuickFilter(filter)
                : applyQuickFilter(filter)
            }
            sx={{ cursor: 'pointer' }}
          />
        ))}
      </Box>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, marginBottom: 2 }}>
        <TextField
          label="Filter by Name/Status"
          variant="outlined"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          sx={{ flex: 1 }}
        />
        <Autocomplete
          multiple
          options={locations}
          getOptionLabel={(option) => option.name}
          value={selectedLocations}
          loading={locationsLoading}
          onChange={(_, value) => setSelectedLocations(value)}
          renderInput={(params) => (
            <TextField {...params} label="Filter by Locations" variant="outlined" />
          )}
          sx={{ flex: 1 }}
        />
        <Autocomplete
          options={categories}
          getOptionLabel={(option) => option.label}
          value={selectedCategory}
          loading={categoriesLoading}
          onChange={(_, value) => setSelectedCategory(value)}
          renderInput={(params) => (
            <TextField {...params} label="Filter by Category" variant="outlined" />
          )}
          sx={{ flex: 1 }}
        />
        <Select
          value={categoryType}
          onChange={(e) => setCategoryType(e.target.value as 'asset' | 'stock')}
          displayEmpty
          sx={{ flex: 0.5 }}
        >
          <MenuItem value="">All Types</MenuItem>
          <MenuItem value="asset">Asset</MenuItem>
          <MenuItem value="stock">Stock</MenuItem>
        </Select>
      </Box>

      {error && <ErrorMessage message={error} />}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {['ID', 'Typ', 'Ilość', 'Lokalizacja', 'Status', 'PYR_CODE', 'Pochodzenie'].map((field) => (
                <TableCell key={field} onClick={() => handleSort(field)} style={{ cursor: 'pointer' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <strong>{field.toUpperCase()}</strong>
                    {sortField === field && (sortOrder === 'asc' ? <ArrowDropUp /> : <ArrowDropDown />)}
                  </Box>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {!loading && equipment.length === 0 && (
              <TableRow>
                <TableCell colSpan={7}>
                  <Typography sx={{ textAlign: 'center', mt: 2 }}>
                    No equipment found for the selected filters.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
            {equipment.map((item) => (
              <TableRow
                key={item.id}
                sx={{
                  bgcolor: item.state === 'in_stock' ? 'rgba(200, 255, 200, 0.2)' : 'inherit',
                  '&:hover': { bgcolor: 'action.hover', cursor: 'pointer' },
                }}
                onClick={() => navigate(`/details/${item.id}?type=${item.type}`)} // Pass type to details
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
                    {getStatusLabel(item.state)}
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
