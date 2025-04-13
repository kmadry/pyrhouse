import React, { useState, useRef, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import {
  Box,
  Button,
  IconButton,
  TextField,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
  Autocomplete,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { validatePyrCodeAPI, searchPyrCodesAPI } from '../../../services/transferService';
import './TransferForm.css';

interface TransferFormProps {
  onSubmit: (data: any) => void;
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

interface FormItem {
  type: 'pyr_code' | 'stock';
  id: string;
  pyrcode: string;
  quantity: number;
  status: ValidationStatus;
  category?: {
    label: string;
  };
}

interface FormData {
  fromLocation: number;
  toLocation: string;
  items: FormItem[];
}

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
  } = useForm<FormData>({
    defaultValues: {
      fromLocation: locations.length > 0 ? locations[0].id : '',
      toLocation: '',
      items: [{ type: 'pyr_code', id: '', pyrcode: '', quantity: 0, status: '' }],
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

  const [pyrCodeSuggestions, setPyrCodeSuggestions] = useState<PyrCodeSuggestion[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [lockedRows, setLockedRows] = useState<Set<number>>(new Set());
  const [isValidationInProgress, setIsValidationInProgress] = useState<boolean>(false);
  const [isValidationCompleted, setIsValidationCompleted] = useState<boolean>(false);
  const nextInputRef = useRef<HTMLInputElement>(null);
  const rowAddedRef = useRef<boolean>(false);

  const fromLocation = watch('fromLocation');
  const items = watch('items');

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
      setLockedRows(prev => new Set([...prev, index]));
      
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

    setSearchLoading(true);
    try {
      const suggestions = await searchPyrCodesAPI(value, fromLocation);
      setPyrCodeSuggestions(suggestions);
      rowAddedRef.current = false;
    } catch (error) {
      console.error('Błąd podczas wyszukiwania:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="transfer-form">
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <div className="form-section">
        <Typography variant="h6" className="form-section-title">
          Lokalizacje
        </Typography>
        <div className="form-row">
          <div className="form-group">
            <FormControl fullWidth>
              <InputLabel>Z lokalizacji</InputLabel>
              <Select
                {...control.register('fromLocation')}
                label="Z lokalizacji"
                className="form-input"
              >
                {locations.map((location) => (
                  <MenuItem key={location.id} value={location.id}>
                    {location.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>

          <div className="form-group">
            <FormControl fullWidth>
              <InputLabel>Do lokalizacji</InputLabel>
              <Select
                {...control.register('toLocation')}
                label="Do lokalizacji"
                className="form-input"
              >
                {locations.map((location) => (
                  <MenuItem key={location.id} value={location.id}>
                    {location.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
        </div>
      </div>

      <div className="form-section">
        <Typography variant="h6" className="form-section-title">
          Przedmioty
        </Typography>
        <div className="items-list">
          {fields.map((field, index) => (
            <div key={field.id} className="item-card">
              <div className="item-header">
                <Typography className="item-title">
                  Przedmiot {index + 1}
                </Typography>
                <IconButton
                  onClick={() => remove(index)}
                  className="remove-item"
                  size="small"
                >
                  <DeleteIcon />
                </IconButton>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <FormControl fullWidth>
                    <InputLabel>Typ</InputLabel>
                    <Select
                      {...control.register(`items.${index}.type`)}
                      label="Typ"
                      className="form-input"
                      disabled={lockedRows.has(index)}
                    >
                      <MenuItem value="pyr_code">Pyr Code</MenuItem>
                      <MenuItem value="stock">Stock</MenuItem>
                    </Select>
                  </FormControl>
                </div>

                <div className="form-group">
                  {items[index].type === 'pyr_code' && (
                    <Autocomplete
                      options={pyrCodeSuggestions}
                      getOptionLabel={(option) => option.pyrcode || ''}
                      loading={searchLoading}
                      disabled={lockedRows.has(index)}
                      value={items[index].pyrcode ? { pyrcode: items[index].pyrcode } as PyrCodeSuggestion : null}
                      inputValue={items[index].pyrcode || ''}
                      autoSelect={false}
                      onInputChange={(_event, value) => {
                        setValue(`items.${index}.pyrcode`, value);
                        handlePyrCodeSearch(value);
                        setIsValidationCompleted(false);
                      }}
                      onChange={(_event, value) => {
                        if (value?.pyrcode && !lockedRows.has(index)) {
                          setValue(`items.${index}.pyrcode`, value.pyrcode);
                          setIsValidationCompleted(false);
                          handleValidatePyrCode(index, value.pyrcode);
                        }
                      }}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' && !lockedRows.has(index)) {
                          event.preventDefault();
                          event.stopPropagation();
                          const currentValue = items[index].pyrcode;
                          const matchingOption = pyrCodeSuggestions.find(option => option.pyrcode === currentValue);
                          if (matchingOption) {
                            handleValidatePyrCode(index, currentValue);
                          }
                        }
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Pyr Code"
                          fullWidth
                          error={items[index].status === 'failure'}
                          helperText={items[index].status === 'failure' ? 'Nieprawidłowy kod PYR' : ''}
                          inputRef={index === fields.length - 1 ? nextInputRef : undefined}
                        />
                      )}
                      renderOption={(props, option) => {
                        const { key, ...otherProps } = props;
                        return (
                          <li 
                            key={key}
                            {...otherProps} 
                            onClick={() => {
                              if (!lockedRows.has(index)) {
                                setValue(`items.${index}.pyrcode`, option.pyrcode);
                                handleValidatePyrCode(index, option.pyrcode);
                              }
                            }}
                          >
                            {option.pyrcode} - {option.category?.label || 'Brak kategorii'}
                          </li>
                        );
                      }}
                      isOptionEqualToValue={(option, value) => {
                        return option.pyrcode === value.pyrcode;
                      }}
                      selectOnFocus
                      clearOnBlur={false}
                    />
                  )}
                  {items[index].type === 'stock' && (
                    <FormControl fullWidth>
                      <InputLabel>Stock</InputLabel>
                      <Select
                        {...control.register(`items.${index}.id`)}
                        label="Stock"
                        className="form-input"
                      >
                        {stocks.map((stock) => (
                          <MenuItem key={stock.id} value={stock.id}>
                            {stock.category.label} ({stock.origin}) [Dostępne: {stock.quantity}]
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                </div>

                <div className="form-group">
                  {items[index].type === 'stock' && (
                    <TextField
                      {...control.register(`items.${index}.quantity`)}
                      label="Ilość"
                      type="number"
                      fullWidth
                      className="form-input"
                      error={!!errors.items?.[index]?.quantity}
                      helperText={errors.items?.[index]?.quantity?.message}
                    />
                  )}
                  {items[index].type === 'pyr_code' && items[index].status === 'success' && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircleIcon color="success" />
                      <Typography variant="body2" color="success.main">
                        {items[index].category?.label || 'Brak kategorii'}
                      </Typography>
                    </Box>
                  )}
                  {items[index].type === 'pyr_code' && items[index].status === 'failure' && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ErrorIcon color="error" />
                      <Typography variant="body2" color="error">
                        Nie znaleziono
                      </Typography>
                    </Box>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={() =>
            append({ type: 'pyr_code', id: '', pyrcode: '', quantity: 0, status: '' as ValidationStatus })
          }
          className="add-item-button"
        >
          Dodaj przedmiot
        </Button>
      </div>

      <div className="form-actions">
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={loading}
          className="submit-button"
        >
          {loading ? <CircularProgress size={24} /> : 'Utwórz transfer'}
        </Button>
      </div>
    </form>
  );
}; 