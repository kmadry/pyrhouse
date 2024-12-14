import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  MenuItem,
  Select,
  TextField,
  Typography,
  CircularProgress,
} from '@mui/material';
import Barcode from 'react-barcode';

const AddAssetForm: React.FC = () => {
  const [serial, setSerial] = useState('');
  const [categoryID, setCategoryID] = useState('');
  const [origin, setOrigin] = useState('druga-era');
  const [customOrigin, setCustomOrigin] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [barcode, setBarcode] = useState('');

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://pyrhouse-backend-f26ml.ondigitalocean.app/api/assets/categories', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }

      const data = await response.json();
      setCategories(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load categories');
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    setBarcode('');

    let finalOrigin = origin;
    if (origin === 'personal') {
      finalOrigin = `personal-${customOrigin}`;
    } else if (origin === 'other') {
      finalOrigin = `other-${customOrigin}`;
    }

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
      console.log('Asset added:', responseData);

      setBarcode(responseData.pyrcode);

      // Reset form
      setSerial('');
      setCategoryID('');
      setOrigin('druga-era');
      setCustomOrigin('');
    } catch (err: any) {
      console.error(err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <Container maxWidth="md">
      <Box className="add-asset-container">
        {/* Form Section */}
        <Box component="form" className="add-asset-form" onSubmit={handleSubmit}>
          <Typography variant="h4" gutterBottom>
            Add New Asset
          </Typography>

          {error && (
            <Box sx={{ mt: 2, p: 2, bgcolor: '#fce4ec', borderRadius: 2 }}>
              <Typography variant="h6" color="error" gutterBottom>
                Wystąpił błąd
              </Typography>
              <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: '#d32f2f' }}>
                {error}
              </pre>
            </Box>
          )}

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
              Select a Category
            </MenuItem>
            {categories.map((category: any) => (
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
              label={origin === 'personal' ? 'Do kogo należy?' : 'inne? jakie'}
              value={customOrigin}
              onChange={(e) => setCustomOrigin(e.target.value)}
              fullWidth
              required
            />
          )}

          <Button variant="contained" color="primary" type="submit" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Dodaj sprzęt'}
          </Button>
        </Box>

        {/* Barcode Section */}
        <Box className="barcode-container">
          {barcode ? (
            <>
              <Typography variant="h5" gutterBottom>
                Generated Barcode:
              </Typography>
              <Barcode value={barcode} />
            </>
          ) : (
            <Typography color="text.secondary">Submit the form to generate a barcode.</Typography>
          )}
        </Box>
      </Box>
    </Container>
  );
};

export default AddAssetForm;
