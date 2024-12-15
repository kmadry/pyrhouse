import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  Select,
  MenuItem,
  TextField,
  Typography,
  CircularProgress,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Autocomplete from '@mui/material/Autocomplete'; // Make sure this is included
import { useCategories } from '../hooks/useCategories'; // Import the useCategories hook
import { useLocations } from '../hooks/useLocations'; // Custom hook for locations

const TransferPage: React.FC = () => {
  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');
  const [items, setItems] = useState<any[]>([{ id: '', type: 'pyr_code', quantity: '', status: '' }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { categories, loading: categoryLoading } = useCategories();
  const { locations } = useLocations();

  const handleItemChange = (index: number, field: string, value: string | number) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  const handleAddItem = async (index: number) => {
    const currentItem = items[index];
  
    if (!currentItem.id && currentItem.type === 'pyr_code') {
      setError('Pyr Code is required');
      return;
    }
  
    if (!currentItem.quantity && currentItem.type === 'kategoria') {
      setError('Quantity is required for category-based items');
      return;
    }
  
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      let response: Response | null = null; 
      let data: any;
  
      if (currentItem.type === 'pyr_code') {
        response = await fetch(
          `https://pyrhouse-backend-f26ml.ondigitalocean.app/api/assets/pyrcode/${currentItem.id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } else if (currentItem.type === 'kategoria') {
        response = {
          ok: true,
          status: 200,
          json: async () => ({ id: currentItem.id, quantity: currentItem.quantity }),
        } as unknown as Response;
      }
  
      if (!response) throw new Error('Unexpected error: No response received.');
  
      data = await response.json();
  
      if (!response.ok || response.status !== 200) {
        throw new Error(JSON.stringify(data, null, 2));
      }
  
      setItems((prev) => {
        const updated = [...prev];
        updated[index].status = 'success';
        return [...updated, { id: '', type: 'pyr_code', quantity: '', status: '' }];
      });
    } catch (err: any) {
      console.error('Error adding item:', err.message || err);
  
      setItems((prev) => {
        const updated = [...prev];
        updated[index].status = 'failure';
        return updated;
      });
  
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!fromLocation || !toLocation || items.length === 0) {
      setError('Please fill in all fields and add at least one item.');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('https://pyrhouse-backend-f26ml.ondigitalocean.app/api/transfers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          from_location_id: Number(fromLocation),
          location_id: Number(toLocation),
          items,
        }),
      });

      if (!response.ok) throw new Error('Failed to create transfer');
      const responseData = await response.json();
      console.log('Transfer created:', responseData);

      // Reset form
      setFromLocation('');
      setToLocation('');
      setItems([{ id: '', type: 'pyr_code', quantity: '', status: '' }]);
    } catch (err) {
      console.error(err);
      setError('Failed to create transfer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Utwórz Transfer
      </Typography>

      {error && (
        <Box sx={{ mt: 2, p: 2, bgcolor: '#fce4ec', borderRadius: 2 }}>
          <Typography variant="h6" color="error" gutterBottom>
            Błąd
          </Typography>
          <Typography>{error}</Typography>
        </Box>
      )}

      <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
        <Select
          value={fromLocation}
          onChange={(e) => setFromLocation(e.target.value)}
          displayEmpty
          fullWidth
        >
          <MenuItem value="" disabled>
            Wybierz lokalizację źródłową
          </MenuItem>
          {locations.map((location: any) => (
            <MenuItem key={location.id} value={location.id}>
              {location.name}
            </MenuItem>
          ))}
        </Select>

        <Select
          value={toLocation}
          onChange={(e) => setToLocation(e.target.value)}
          displayEmpty
          fullWidth
        >
          <MenuItem value="" disabled>
            Wybierz lokalizację docelową
          </MenuItem>
          {locations.map((location: any) => (
            <MenuItem key={location.id} value={location.id}>
              {location.name}
            </MenuItem>
          ))}
        </Select>
      </Box>

      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Typ</TableCell>
              <TableCell>ID / Kategoria</TableCell>
              <TableCell>Ilość</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Akcje</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item, index) => (
              <TableRow
                key={index}
                sx={{
                  bgcolor: item.status === 'success' ? 'rgba(76, 175, 80, 0.1)' : undefined,
                }}
              >
                <TableCell>
                  <Select
                    value={item.type}
                    onChange={(e) => handleItemChange(index, 'type', e.target.value)}
                    fullWidth
                    disabled={item.status === 'success'}
                  >
                    <MenuItem value="pyr_code">Pyr Code</MenuItem>
                    <MenuItem value="kategoria">Kategoria</MenuItem>
                  </Select>
                </TableCell>
                <TableCell>
                  {item.type === 'pyr_code' && (
                    <TextField
                      value={item.id}
                      onChange={(e) => handleItemChange(index, 'id', e.target.value)}
                      fullWidth
                      disabled={item.status === 'success'}
                    />
                  )}
                  {item.type === 'kategoria' && (
                    <Autocomplete
                    options={categories}
                    getOptionLabel={(option: any) => option.label || ''}
                    loading={categoryLoading}
                    onChange={(_, value) => handleItemChange(index, 'id', value?.id || '')}
                    renderInput={(params) => (
                    <TextField
                        {...params}
                        label="Kategoria"
                        fullWidth
                        InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                            <>
                            {categoryLoading ? <CircularProgress size={20} /> : null}
                            {params.InputProps.endAdornment}
                            </>
                        ),
                        }}
                        disabled={item.status === 'success'}
                    />
                    )}
                    />                  
                  )}
                </TableCell>
                <TableCell>
                  {item.type === 'kategoria' && (
                    <TextField
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                      fullWidth
                      disabled={item.status === 'success'}
                    />
                  )}
                </TableCell>
                <TableCell>
                  {item.status === 'success' && <CheckCircleIcon color="success" />}
                </TableCell>
                <TableCell>
                  {item.status !== 'success' && (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleAddItem(index)}
                      disabled={loading}
                    >
                      {loading ? <CircularProgress size={24} /> : 'Dodaj'}
                    </Button>
                  )}
                  <IconButton onClick={() => handleRemoveItem(index)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Button
        variant="contained"
        color="primary"
        onClick={handleSubmit}
        disabled={loading}
        sx={{ mt: 2 }}
        fullWidth
      >
        {loading ? <CircularProgress size={24} /> : 'Utwórz Transfer'}
      </Button>
    </Container>
  );
};

export default TransferPage;
