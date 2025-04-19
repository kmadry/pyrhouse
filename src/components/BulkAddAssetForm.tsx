import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Typography,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  Grid,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { bulkAddAssetsAPI } from '../services/assetService';
import { BarcodeGenerator } from './BarcodeGenerator';

interface AssetEntry {
  id: string;
  serial: string;
}

interface CreatedAsset {
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
}

interface BulkAddAssetFormProps {
  categories: any[];
}

const ORIGIN_OPTIONS = [
  { value: 'druga-era', label: 'Druga Era' },
  { value: 'probis', label: 'Probis' },
  { value: 'targowe', label: 'Targowe' },
  { value: 'personal', label: 'Personal' },
  { value: 'other', label: 'Inne' },
];

export const BulkAddAssetForm: React.FC<BulkAddAssetFormProps> = ({ categories }) => {
  // Filtrowanie kategorii tylko dla typu "asset"
  const assetCategories = categories.filter((category) => category.type === 'asset');
  
  const [assets, setAssets] = useState<AssetEntry[]>([
    { id: Date.now().toString(), serial: '' },
  ]);
  const [categoryId, setCategoryId] = useState<number>(0);
  const [origin, setOrigin] = useState<string>('');
  const [customOrigin, setCustomOrigin] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [createdAssets, setCreatedAssets] = useState<CreatedAsset[]>([]);
  const [showBarcodes, setShowBarcodes] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, assets.length);
  }, [assets]);

  // Efekt czyszczący stan przy odmontowaniu komponentu
  useEffect(() => {
    return () => {
      resetForm();
    };
  }, []);

  const handleSerialChange = (index: number, value: string) => {
    const newAssets = [...assets];
    newAssets[index].serial = value;
    setAssets(newAssets);
  };

  const handleDeleteRow = (index: number) => {
    const newAssets = assets.filter((_, i) => i !== index);
    setAssets(newAssets);
  };

  const handleAddRow = () => {
    setAssets([...assets, { id: Date.now().toString(), serial: '' }]);
  };

  const resetForm = () => {
    setAssets([{ id: Date.now().toString(), serial: '' }]);
    setCategoryId(0);
    setOrigin('');
    setCustomOrigin('');
    setError('');
    setSuccessMessage('');
    setCreatedAssets([]);
    setShowBarcodes(false);
    setIsSubmitting(false);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsSubmitting(true);

    // Validate inputs
    if (!categoryId) {
      setError('Wybierz kategorię');
      setIsSubmitting(false);
      return;
    }

    if (!origin) {
      setError('Wybierz pochodzenie');
      setIsSubmitting(false);
      return;
    }

    if (origin === 'other' && !customOrigin) {
      setError('Podaj pochodzenie');
      setIsSubmitting(false);
      return;
    }

    // Filter out empty serial numbers
    const validAssets = assets.filter(asset => asset.serial.trim() !== '');
    if (validAssets.length === 0) {
      setError('Dodaj co najmniej jeden numer seryjny');
      setIsSubmitting(false);
      return;
    }

    try {
      // Construct final origin
      let finalOrigin = origin;
      if (origin === 'personal') finalOrigin = `personal-${customOrigin}`;
      else if (origin === 'other') finalOrigin = `other-${customOrigin}`;

      const assetsToSubmit = validAssets.map(asset => ({
        serial: asset.serial,
        category_id: categoryId,
        origin: finalOrigin,
      }));

      const response = await bulkAddAssetsAPI(assetsToSubmit);

      if (response && Array.isArray(response.created)) {
        // Resetuj formularz od razu po sukcesie
        setAssets([{ id: Date.now().toString(), serial: '' }]);
        setCategoryId(0);
        setOrigin('');
        setCustomOrigin('');
        
        // Zachowaj tylko komunikat sukcesu i otwórz modal z kodami
        setSuccessMessage('Zasoby zostały dodane pomyślnie');
        setCreatedAssets(response.created);
        setShowBarcodes(true);
      } else {
        setError('Niepoprawna odpowiedź z API');
      }
    } catch (err: any) {
      setError(err.message || 'Wystąpił błąd podczas dodawania zasobów');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement | HTMLDivElement>, index: number) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      
      if (index === assets.length - 1) {
        handleAddRow();
        
        setTimeout(() => {
          if (inputRefs.current[assets.length]) {
            inputRefs.current[assets.length]?.focus();
          }
        }, 0);
      } else {
        if (inputRefs.current[index + 1]) {
          inputRefs.current[index + 1]?.focus();
        }
      }
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMessage}
        </Alert>
      )}

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Kategoria</InputLabel>
            <Select
              value={categoryId}
              onChange={(e) => setCategoryId(Number(e.target.value))}
              label="Kategoria"
            >
              {assetCategories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Pochodzenie</InputLabel>
            <Select
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              label="Pochodzenie"
            >
              {ORIGIN_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {origin === 'other' && (
            <TextField
              fullWidth
              value={customOrigin}
              onChange={(e) => setCustomOrigin(e.target.value)}
              placeholder="Podaj pochodzenie"
              size="small"
              sx={{ mt: 1 }}
            />
          )}
        </Grid>
      </Grid>

      <Box sx={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ padding: '8px', textAlign: 'left' }}>Numer seryjny</th>
              <th style={{ padding: '8px', textAlign: 'left' }}>Akcje</th>
            </tr>
          </thead>
          <tbody>
            {assets.map((asset, index) => (
              <tr key={asset.id}>
                <td style={{ padding: '8px' }}>
                  <TextField
                    fullWidth
                    value={asset.serial}
                    onChange={(e) => handleSerialChange(index, e.target.value)}
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => handleKeyDown(e, index)}
                    placeholder="Wprowadź numer seryjny"
                    size="small"
                    inputRef={(el) => (inputRefs.current[index] = el)}
                  />
                </td>
                <td style={{ padding: '8px' }}>
                  <IconButton
                    onClick={() => handleDeleteRow(index)}
                    disabled={assets.length === 1}
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Box>

      <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={handleAddRow}
        >
          Dodaj wiersz
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Dodawanie...' : 'Dodaj zasoby'}
        </Button>
      </Box>

      <Dialog
        open={showBarcodes}
        onClose={() => {
          setShowBarcodes(false);
          // Wyczyść tylko dane związane z kodami kreskowymi przy zamykaniu modalu
          setCreatedAssets([]);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Wygenerowane kody kreskowe</DialogTitle>
        <DialogContent>
          {createdAssets.length > 0 ? (
            <BarcodeGenerator
              assets={createdAssets}
              onClose={() => {
                setShowBarcodes(false);
                // Wyczyść tylko dane związane z kodami kreskowymi przy zamykaniu modalu
                setCreatedAssets([]);
              }}
            />
          ) : (
            <Typography color="error">
              Brak danych do wygenerowania kodów kreskowych
            </Typography>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}; 