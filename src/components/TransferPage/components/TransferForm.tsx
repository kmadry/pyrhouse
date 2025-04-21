import React, { useState, useRef, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import {
  Box,
  Button,
  IconButton,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Autocomplete,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { validatePyrCodeAPI, searchPyrCodesAPI } from '../../../services/transferService';
import './TransferForm.css';
import { TransferFormData } from '../../../types/transfer.types';

interface TransferFormProps {
  onSubmit: (data: TransferFormData) => void;
  locations: any[];
  stocks: any[];
  loading: boolean;
  error?: string;
}

interface PyrCodeSuggestion {
  id: number;
  pyrcode: string;
  serial: string;
  location: {
    id: number;
    name: string;
  };
  category: {
    id: number;
    label: string;
  };
  status: 'in_stock' | 'available' | 'unavailable';
}

type ValidationStatus = 'success' | 'failure' | '';

export const TransferForm: React.FC<TransferFormProps> = ({
  onSubmit,
  locations,
  stocks,
  loading,
  error,
}) => {
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TransferFormData>({
    defaultValues: {
      fromLocation: locations.length > 0 ? locations[0].id : 0,
      toLocation: '',
      items: [{ type: 'pyr_code', id: '', pyrcode: '', quantity: 1, status: '' }],
    },
  });

  useEffect(() => {
    if (locations.length > 0 && !watch('fromLocation')) {
      setValue('fromLocation', locations[0].id);
    }
  }, [locations, setValue, watch]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const [isValidationInProgress, setIsValidationInProgress] = useState<boolean>(false);
  const [isValidationCompleted, setIsValidationCompleted] = useState<boolean>(false);
  const nextInputRef = useRef<HTMLInputElement>(null);
  const rowAddedRef = useRef<boolean>(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const formDataRef = useRef<TransferFormData | null>(null);
  const [pyrCodeSuggestions, setPyrCodeSuggestions] = useState<PyrCodeSuggestion[]>([]);

  const fromLocation = watch('fromLocation');

  const handleValidatePyrCode = async (index: number, pyrcode: string) => {
    if (isValidationInProgress || isValidationCompleted) {
      return;
    }
    
    try {
      setIsValidationInProgress(true);
      const response = await validatePyrCodeAPI(pyrcode);
      setValue(`items.${index}.id`, response.id);
      setValue(`items.${index}.status`, 'success' as ValidationStatus);
      setValue(`items.${index}.category`, response.category);
      
      if (!rowAddedRef.current) {
        append({ type: 'pyr_code', id: '', pyrcode: '', quantity: 0, status: '' as ValidationStatus });
        rowAddedRef.current = true;
        setTimeout(() => {
          nextInputRef.current?.focus();
        }, 0);
      }
    } catch (err: any) {
      setValue(`items.${index}.status`, 'failure' as ValidationStatus);
    } finally {
      setIsValidationInProgress(false);
      setIsValidationCompleted(true);
    }
  };

  const handlePyrCodeSearch = async (value: string) => {
    if (!/^[a-zA-Z0-9-]*$/.test(value)) {
      return;
    }

    if (value.length < 2) {
      setPyrCodeSuggestions([]);
      return;
    }

    try {
      const suggestions = await searchPyrCodesAPI(value, fromLocation);
      setPyrCodeSuggestions(suggestions);
      rowAddedRef.current = false;
    } catch (error) {
      console.error('Błąd podczas wyszukiwania:', error);
      setPyrCodeSuggestions([]);
    }
  };

  const handleAddItem = () => {
    const availableStock = stocks.length > 0;
    append({ 
      type: availableStock ? 'stock' : 'pyr_code', 
      id: '', 
      pyrcode: '', 
      quantity: 1, 
      status: '' as ValidationStatus 
    });
  };

  const handleFormSubmit = (data: TransferFormData) => {
    formDataRef.current = data;
    setShowConfirmation(true);
  };

  const handleConfirmSubmit = () => {
    if (formDataRef.current) {
      onSubmit(formDataRef.current);
      setShowConfirmation(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="transfer-form">
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="From Location"
              {...control.register('fromLocation', { required: true })}
              error={!!errors.fromLocation}
              helperText={errors.fromLocation && 'From location is required'}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="To Location"
              {...control.register('toLocation', { required: true })}
              error={!!errors.toLocation}
              helperText={errors.toLocation && 'To location is required'}
            />
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="h6">Items ({stocks.length} available stocks)</Typography>
            {fields.map((field, index) => (
              <Grid container spacing={2} key={field.id} sx={{ mt: 1 }}>
                <Grid item xs={4}>
                  <Autocomplete
                    freeSolo
                    options={pyrCodeSuggestions}
                    getOptionLabel={(option: PyrCodeSuggestion | string) => 
                      typeof option === 'string' ? option : option.pyrcode
                    }
                    onInputChange={(_, value) => handlePyrCodeSearch(value)}
                    onChange={(_, value) => {
                      if (value && typeof value !== 'string') {
                        handleValidatePyrCode(index, value.pyrcode);
                      }
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        label="PYR Code"
                        {...control.register(`items.${index}.pyrcode` as const, { required: true })}
                        error={!!errors.items?.[index]?.pyrcode}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Quantity"
                    {...control.register(`items.${index}.quantity` as const, { 
                      required: true,
                      min: 1
                    })}
                    error={!!errors.items?.[index]?.quantity}
                  />
                </Grid>
                <Grid item xs={1}>
                  <IconButton 
                    onClick={() => remove(index)}
                    disabled={fields.length === 1}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Grid>
              </Grid>
            ))}
            <Button 
              onClick={handleAddItem}
              variant="outlined"
              sx={{ mt: 2 }}
            >
              Add Item
            </Button>
          </Grid>

          <Grid item xs={12}>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Rozpocznij quest'}
            </Button>
          </Grid>
        </Grid>
      </form>

      <Dialog 
        open={showConfirmation} 
        onClose={() => setShowConfirmation(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Potwierdź quest</DialogTitle>
        <DialogContent>
          {formDataRef.current && (
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Z lokalizacji: {locations.find(l => l.id === formDataRef.current?.fromLocation)?.name}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                Do lokalizacji: {formDataRef.current.toLocation}
              </Typography>
              
              <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                Elementy do transferu:
              </Typography>
              <List>
                {formDataRef.current.items.map((item, index) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={`${item.pyrcode} (${item.quantity} szt.)`}
                      secondary={item.category?.label}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowConfirmation(false)}>
            Anuluj
          </Button>
          <Button 
            onClick={handleConfirmSubmit} 
            variant="contained" 
            color="primary"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Potwierdź quest'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}; 