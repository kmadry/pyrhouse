import React, { useState } from 'react';
import { Box, Button, Select, MenuItem, TextField, CircularProgress, InputLabel, FormControl } from '@mui/material';
import { ErrorMessage } from './ErrorMessage'; // Import ErrorMessage component
import { getApiUrl } from '../config/api';

const ORIGIN_OPTIONS = ['druga-era', 'probis', 'targowe', 'personal', 'other'];

export const AddStockForm: React.FC<{ categories: any[]; loading: boolean }> = ({ categories }) => {
  const [stockCategoryID, setStockCategoryID] = useState('');
  const [quantity, setQuantity] = useState<number | string>('');
  const [origin, setOrigin] = useState('probis'); // Default value for origin
  const [customOrigin, setCustomOrigin] = useState(''); // For personal/other origin
  const [error, setError] = useState('');
  const [errorDetails, setErrorDetails] = useState(''); // Additional error details
  const [submitting, setSubmitting] = useState(false);
  const stockCategories = categories.filter((category) => category.type === 'stock');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setErrorDetails('');
    setSubmitting(true);

    // Validate custom origin if required
    if ((origin === 'personal' || origin === 'other') && !customOrigin.trim()) {
      setError('Wymagane dodatkowe informacje dla personal/other');
      setSubmitting(false);
      return;
    }

    // Construct final origin
    let finalOrigin = origin;
    if (origin === 'personal') finalOrigin = `personal-${customOrigin}`;
    else if (origin === 'other') finalOrigin = `other-${customOrigin}`;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getApiUrl('/stocks'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          category_id: stockCategoryID,
          quantity: Number(quantity),
          origin: finalOrigin,
        }),
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        setError(`HTTP ${response.status}: Nie udało się dodać stanu magazynowego`);
        setErrorDetails(`Details: ${errorResponse.error || 'Brak szczegółów'}`);
        return;
      }

      const responseData = await response.json();
      console.log('Stock added:', responseData);

      // Reset form
      setStockCategoryID('');
      setQuantity('');
      setOrigin('probis'); // Reset to default origin
      setCustomOrigin(''); // Clear custom origin
    } catch (err: any) {
      setError('Wystąpił nieoczekiwany błąd');
      setErrorDetails(err.message || 'Brak szczegółów');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      {/* Display error message */}
      {error && <ErrorMessage message={error} details={errorDetails} />}

      {/* Category Select */}
      <FormControl fullWidth required sx={{ mb: 2 }}>
        <InputLabel>Kategoria</InputLabel>
        <Select
          value={stockCategoryID}
          onChange={(e) => setStockCategoryID(e.target.value)}
          displayEmpty
          label="Kategoria"
        >
          <MenuItem value="" disabled>
            Wybierz kategorię
          </MenuItem>
          {stockCategories.map((category) => (
            <MenuItem key={category.id} value={category.id}>
              {category.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Quantity Input */}
      <TextField
        label="Ilość"
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
        fullWidth
        required
        type="number"
        sx={{ mb: 2 }}
      />

      {/* Origin Select */}
      <FormControl fullWidth required sx={{ mb: 2 }}>
        <InputLabel>Pochodzenie</InputLabel>
        <Select
          value={origin}
          onChange={(e) => setOrigin(e.target.value)}
          label="Pochodzenie"
        >
          <MenuItem value="" disabled>
            Wybierz pochodzenie
          </MenuItem>
          {ORIGIN_OPTIONS.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Custom Origin Input */}
      {(origin === 'personal' || origin === 'other') && (
        <TextField
          label={origin === 'personal' ? 'Do kogo należy?' : 'Inne? Jakie?'}
          value={customOrigin}
          onChange={(e) => setCustomOrigin(e.target.value)}
          fullWidth
          required
          sx={{ mb: 2 }}
        />
      )}

      {/* Submit Button */}
      <Button variant="contained" color="primary" type="submit" disabled={submitting}>
        {submitting ? <CircularProgress size={24} /> : 'Dodaj stan magazynowy'}
      </Button>
    </Box>
  );
};
