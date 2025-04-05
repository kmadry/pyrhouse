import React, { useState } from 'react';
import {
  Box,
  Button,
  Select,
  MenuItem,
  TextField,
  CircularProgress,
  Dialog,
} from '@mui/material';
import { ErrorMessage } from './ErrorMessage';
import { BarcodeGenerator } from './BarcodeGenerator';

// Origin options array
const ORIGIN_OPTIONS = ['druga-era', 'probis', 'targowe', 'personal', 'other'];

interface Asset {
  id: number;
  serial: string;
  location: {
    id: number;
    name: string;
    details: string | null;
  };
  category: {
    id: number;
    name: string;
    label: string;
    pyr_id: string;
    type: string;
  };
  status: string;
  pyrcode: string;
  origin?: string;
}

export const AddAssetForm: React.FC<{ categories: any[]; loading: boolean }> = ({ categories }) => {
  const [serial, setSerial] = useState('');
  const [origin, setOrigin] = useState('probis');
  const [customOrigin, setCustomOrigin] = useState('');
  const [categoryID, setCategoryID] = useState('');
  const [error, setError] = useState('');
  const [errorDetails, setErrorDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [createdAsset, setCreatedAsset] = useState<Asset | null>(null);
  const [showBarcode, setShowBarcode] = useState(false);

  // Filter categories to only include type "asset"
  const assetCategories = categories.filter((category) => category.type === 'asset');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setErrorDetails('');
    setSubmitting(true);
    setCreatedAsset(null);
    setShowBarcode(false);

    // Validate custom origin
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
        setError(`HTTP ${response.status}: Nie udało się dodać sprzętu`);
        setErrorDetails(`Details: ${errorResponse.error || 'Brak szczegółów'}`);
        return;
      }

      const responseData = await response.json();
      setCreatedAsset(responseData);
      setShowBarcode(true);

      // Reset form
      setSerial('');
      setCategoryID('');
      setOrigin('probis');
      setCustomOrigin('');
    } catch (err: any) {
      setError('Wystąpił nieoczekiwany błąd');
      setErrorDetails(err.message || 'Brak szczegółów');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      {/* Display Error Message */}
      {error && <ErrorMessage message={error} details={errorDetails} />}

      {/* Serial Input */}
      <TextField
        label="Numer Seryjny"
        value={serial}
        onChange={(e) => setSerial(e.target.value)}
        fullWidth
        required
        sx={{ mb: 2 }}
      />

      {/* Category Select */}
      <Select
        value={categoryID}
        onChange={(e) => setCategoryID(e.target.value)}
        displayEmpty
        fullWidth
        required
        sx={{ mb: 2 }}
      >
        <MenuItem value="" disabled>
          Wybierz kategorię
        </MenuItem>
        {assetCategories.map((category) => (
          <MenuItem key={category.id} value={category.id}>
            {category.label}
          </MenuItem>
        ))}
      </Select>

      {/* Origin Select */}
      <Select
        value={origin}
        onChange={(e) => setOrigin(e.target.value)}
        displayEmpty
        fullWidth
        required
        sx={{ mb: 2 }}
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
        {submitting ? <CircularProgress size={24} /> : 'Dodaj sprzęt'}
      </Button>

      {/* Barcode Dialog */}
      <Dialog
        open={showBarcode}
        onClose={() => setShowBarcode(false)}
        maxWidth="md"
        fullWidth
      >
        {createdAsset && (
          <BarcodeGenerator
            assets={[createdAsset]}
            onClose={() => setShowBarcode(false)}
          />
        )}
      </Dialog>
    </Box>
  );
};
