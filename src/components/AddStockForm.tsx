import React, { useState } from 'react';
import { Box, Button, Select, MenuItem, TextField, CircularProgress } from '@mui/material';

export const AddStockForm: React.FC<{ categories: any[]; loading: boolean }> = ({ categories }) => {
  const [stockCategoryID, setStockCategoryID] = useState('');
  const [quantity, setQuantity] = useState<number | string>('');
  const [, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://pyrhouse-backend-f26ml.ondigitalocean.app/api/stocks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          category_id: stockCategoryID,
          quantity: Number(quantity),
        }),
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(
          `Nie udało się dodać stanu magazynowego\n\nAPI Response:\n${JSON.stringify(errorResponse, null, 2)}`
        );
      }

      const responseData = await response.json();
      console.log('Stock added:', responseData);

      // Reset form
      setStockCategoryID('');
      setQuantity('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Select
        value={stockCategoryID}
        onChange={(e) => setStockCategoryID(e.target.value)}
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

      <TextField
        label="Ilość"
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
        fullWidth
        required
        type="number"
      />

      <Button variant="contained" color="primary" type="submit" disabled={submitting} sx={{ mt: 2 }}>
        {submitting ? <CircularProgress size={24} /> : 'Dodaj stan magazynowy'}
      </Button>
    </Box>
  );
};
