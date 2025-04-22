import React, { useState, useRef, useEffect, useCallback, lazy, Suspense } from 'react';
import { useForm, useFieldArray, useFormContext } from 'react-hook-form';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Autocomplete from '@mui/material/Autocomplete';
import Chip from '@mui/material/Chip';
import DeleteIcon from '@mui/icons-material/Delete';
import { searchPyrCodesAPI } from '../../../services/transferService';
import './TransferForm.css';
import { TransferFormData } from '../../../types/transfer.types';
import { Controller } from 'react-hook-form';

// Dynamiczne importy dla dużych komponentów
const LocationPicker = lazy(() => import('../../../components/LocationPicker'));

interface User {
  id: number;
  username: string;
  fullname: string;
}

interface TransferFormProps {
  onSubmit: (data: TransferFormData) => void;
  locations: any[];
  stocks: any[];
  loading: boolean;
  error?: string;
  users: User[];
  usersLoading: boolean;
}

export const TransferForm: React.FC<TransferFormProps> = ({
  onSubmit,
  locations,
  stocks,
  loading,
  error,
  users,
  usersLoading,
}) => {
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
  } = useForm<TransferFormData>({
    defaultValues: {
      fromLocation: locations.length > 0 ? locations[0].id : 0,
      toLocation: '',
      items: [{ type: 'pyr_code', id: '', pyrcode: '', quantity: 1, status: '' }],
      users: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: useFormContext().control,
    name: 'items',
  });

  const [showConfirmation, setShowConfirmation] = useState(false);
  const formDataRef = useRef<TransferFormData | null>(null);

  const fromLocation = watch('fromLocation');

  const [rowAddedRef] = useState({ current: false });

  const handlePyrCodeSearch = async (value: string) => {
    if (!/^[a-zA-Z0-9-]*$/.test(value)) {
      return;
    }

    if (value.length < 2) {
      return;
    }

    try {
      await searchPyrCodesAPI(value, fromLocation);
    } catch (error) {
      console.error('Błąd podczas wyszukiwania kodów PYR:', error);
    }
  };

  const handleAddItem = useCallback(() => {
    append({ type: 'pyr_code', id: '', pyrcode: '', quantity: 0, status: '' });
    rowAddedRef.current = true;
  }, [append]);

  useEffect(() => {
    if (rowAddedRef.current && fields.length > 0) {
      const timer = setTimeout(() => {
        const inputs = document.querySelectorAll('input[data-pyr-input]');
        const lastInput = inputs[inputs.length - 1] as HTMLInputElement;
        if (lastInput) {
          lastInput.focus();
          lastInput.select();
        }
        rowAddedRef.current = false;
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [fields.length]);

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
            <Suspense fallback={<CircularProgress />}>
              <LocationPicker
                onLocationSelect={(location) => {
                  const locationId = locations.find(l => 
                    l.latitude === location.lat && 
                    l.longitude === location.lng
                  )?.id;
                  if (locationId) {
                    setValue('fromLocation', locationId);
                  }
                }}
                initialLocation={locations.find(l => l.id === fromLocation) ? {
                  lat: locations.find(l => l.id === fromLocation)?.latitude || 0,
                  lng: locations.find(l => l.id === fromLocation)?.longitude || 0
                } : undefined}
              />
            </Suspense>
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
              <Box key={field.id} sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Controller
                  name={`items.${index}.pyrcode`}
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <TextField
                      data-pyr-input
                      label="Wpisz kod PYR"
                      value={value}
                      onChange={(e) => {
                        onChange(e);
                        handlePyrCodeSearch(e.target.value);
                      }}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddItem();
                        }
                      }}
                      error={!!errors.items?.[index]?.pyrcode}
                      helperText={errors.items?.[index]?.pyrcode?.message}
                    />
                  )}
                />
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
              </Box>
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
            <Controller
              name="users"
              control={control}
              render={({ field: { onChange, value } }) => (
                <Autocomplete<User, true, false, false>
                  multiple
                  size="small"
                  options={users}
                  loading={usersLoading}
                  value={value || []}
                  onChange={(_, newValue) => onChange(newValue)}
                  getOptionLabel={(option) => `${option.username}`}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      size="small"
                      label="Uczestnicy transferu"
                      fullWidth
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {usersLoading ? <CircularProgress color="inherit" size={20} /> : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        size="small"
                        label={`${option.username}`}
                        {...getTagProps({ index })}
                        sx={{ maxWidth: { xs: '150px', sm: 'none' } }}
                      />
                    ))
                  }
                />
              )}
            />
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