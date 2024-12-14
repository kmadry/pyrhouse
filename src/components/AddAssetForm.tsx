import React, { useState } from 'react';
import {
  Box,
  Button,
  Select,
  MenuItem,
  TextField,
  CircularProgress,
} from '@mui/material';
import Barcode from 'react-barcode';

export const AddAssetForm: React.FC<{ categories: any[]; loading: boolean }> = ({ categories }) => {
  const [serial, setSerial] = useState('');
  const [origin, setOrigin] = useState('probis');
  const [customOrigin, setCustomOrigin] = useState('');
  const [categoryID, setCategoryID] = useState('');
  const [barcode, setBarcode] = useState('');
  const [, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    let finalOrigin = origin;
    if (origin === 'personal') finalOrigin = `personal-${customOrigin}`;
    else if (origin === 'other') finalOrigin = `other-${customOrigin}`;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://pyrhouse-backend-f26ml.ondigitalocean.app/api/assets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          serial,
          category_id: categoryID,
          origin: finalOrigin,
        }),
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(
          `Nie udało się dodać sprzętu\n\nAPI Response:\n${JSON.stringify(errorResponse, null, 2)}`
        );
      }

      const responseData = await response.json();
      setBarcode(responseData.pyrcode);

      // Reset form
      setSerial('');
      setCategoryID('');
      setOrigin('probis');
      setCustomOrigin('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <TextField
        label="Numer Seryjny"
        value={serial}
        onChange={(e) => setSerial(e.target.value)}
        fullWidth
        required
      />

      <Select
        value={categoryID}
        onChange={(e) => setCategoryID(e.target.value)}
        displayEmpty
        fullWidth
        required
      >
        <MenuItem value="" disabled>
          Wybierz kategorię
        </MenuItem>
        {categories.map((category) => (
          <MenuItem key={category.id} value={category.id}>
            {category.label}
          </MenuItem>
        ))}
      </Select>

      <Select
        value={origin}
        onChange={(e) => setOrigin(e.target.value)}
        displayEmpty
        fullWidth
      >
        {['druga-era', 'probis', 'targowe', 'personal', 'other'].map((option) => (
          <MenuItem key={option} value={option}>
            {option}
          </MenuItem>
        ))}
      </Select>

      {(origin === 'personal' || origin === 'other') && (
        <TextField
          label={origin === 'personal' ? 'Do kogo należy?' : 'Inne? Jakie?'}
          value={customOrigin}
          onChange={(e) => setCustomOrigin(e.target.value)}
          fullWidth
          required
        />
      )}

      <Button variant="contained" color="primary" type="submit" disabled={submitting} sx={{ mt: 2 }}>
        {submitting ? <CircularProgress size={24} /> : 'Dodaj sprzęt'}
      </Button>

      {barcode && (
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Barcode value={barcode} />
        </Box>
      )}
    </Box>
  );
};
