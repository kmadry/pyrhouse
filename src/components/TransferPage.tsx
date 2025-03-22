import React, { useEffect, useState, useRef } from 'react';
import {
  Container,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  TextField,
  Button,
  IconButton,
  CircularProgress,
  Alert,
  Autocomplete,
} from '@mui/material';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { useLocations } from '../hooks/useLocations';
import { useStocks } from '../hooks/useStocks';
import { validatePyrCodeAPI, createTransferAPI, searchPyrCodesAPI } from '../services/transferService';
import { ErrorMessage } from './ErrorMessage';
import { useNavigate } from 'react-router-dom';

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

const TransferPage: React.FC = () => {
  const { control, handleSubmit, setValue, watch, reset } = useForm<FormData>({
    defaultValues: {
      fromLocation: 1,
      toLocation: '',
      items: [{ type: 'pyr_code', id: '', pyrcode: '', quantity: 0, status: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [pyrCodeSuggestions, setPyrCodeSuggestions] = useState<PyrCodeSuggestion[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [lockedRows, setLockedRows] = useState<Set<number>>(new Set());
  const [isValidationInProgress, setIsValidationInProgress] = useState<boolean>(false);
  const [isValidationCompleted, setIsValidationCompleted] = useState<boolean>(false);
  const nextInputRef = useRef<HTMLInputElement>(null);
  const rowAddedRef = useRef<boolean>(false);

  const fromLocation = watch('fromLocation');
  const items = watch('items');

  const { locations, error: locationError } = useLocations();
  const { stocks, fetchStocks, error: stockError } = useStocks();

  const navigate = useNavigate();

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

  const onSubmit = async (formData: any) => {
    try {
      setLoading(true);

      const payload = {
        from_location_id: Number(formData.fromLocation),
        location_id: Number(formData.toLocation),
        assets: formData.items
          .filter((item: any) => item.type === 'pyr_code' && item.status === 'success')
          .map((item: any) => ({ id: item.id })),
        stocks: formData.items
          .filter((item: any) => item.type === 'stock')
          .map((item: any) => ({ id: item.id, quantity: Number(item.quantity) })),
      };

      if (!payload.assets?.length) delete payload.assets;
      if (!payload.stocks?.length) delete payload.stocks;

      const response = await createTransferAPI(payload);

      setSuccessMessage('Transfer created successfully!');
      setTimeout(() => {
        navigate(`/transfers/${response.id}`);
      }, 1500);

      reset();
    } catch (err: any) {
      console.error('Failed to create transfer:', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Utwórz Transfer
      </Typography>

      {/* Display Errors */}
      {locationError && <ErrorMessage message="Error loading locations" details={locationError} />}
      {stockError && <ErrorMessage message="Error loading stocks" details={stockError} />}
      {successMessage && (
        <Alert severity="success" sx={{ mt: 2 }}>
          <CheckCircleIcon sx={{ verticalAlign: 'bottom', mr: 1 }} />
          {successMessage}
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <Controller
            name="fromLocation"
            control={control}
            defaultValue={1}
            render={({ field }) => (
              <Select 
                {...field} 
                displayEmpty 
                fullWidth
                value={locations.length > 0 ? field.value : ''}
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
            )}
          />
          <Controller
            name="toLocation"
            control={control}
            render={({ field }) => (
              <Select {...field} displayEmpty fullWidth>
                <MenuItem value="" disabled>
                  Wybierz lokalizację docelową
                </MenuItem>
                {locations.map((location: any) => (
                  <MenuItem key={location.id} value={location.id}>
                    {location.name}
                  </MenuItem>
                ))}
              </Select>
            )}
          />
        </Box>

        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Typ</TableCell>
                <TableCell>ID / Kategoria</TableCell>
                <TableCell>Ilość/Typ</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Akcje</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {fields.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Controller
                      name={`items.${index}.type`}
                      control={control}
                      render={({ field }) => (
                        <Select 
                          {...field} 
                          fullWidth 
                          disabled={lockedRows.has(index)}
                        >
                          <MenuItem value="pyr_code">Pyr Code</MenuItem>
                          <MenuItem value="stock">Stock</MenuItem>
                        </Select>
                      )}
                    />
                  </TableCell>
                  <TableCell>
                    {items[index].type === 'pyr_code' && (
                      <Controller
                        name={`items.${index}.pyrcode`}
                        control={control}
                        render={({ field }) => (
                          <Autocomplete
                            {...field}
                            options={pyrCodeSuggestions}
                            getOptionLabel={(option) => option.pyrcode || ''}
                            loading={searchLoading}
                            disabled={lockedRows.has(index)}
                            value={field.value ? { pyrcode: field.value } as PyrCodeSuggestion : null}
                            inputValue={field.value || ''}
                            autoSelect={false}
                            onInputChange={(_event, value) => {
                              field.onChange(value);
                              handlePyrCodeSearch(value);
                              setIsValidationCompleted(false);
                            }}
                            onChange={(_event, value) => {
                              if (value?.pyrcode && !lockedRows.has(index)) {
                                field.onChange(value.pyrcode);
                                setIsValidationCompleted(false);
                                handleValidatePyrCode(index, value.pyrcode);
                              }
                            }}
                            onKeyDown={(event) => {
                              if (event.key === 'Enter' && !lockedRows.has(index)) {
                                event.preventDefault();
                                event.stopPropagation();
                                const currentValue = field.value;
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
                                  onClick={(e) => {
                                    if (!lockedRows.has(index)) {
                                      field.onChange(option.pyrcode);
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
                      />
                    )}
                    {items[index].type === 'stock' && (
                      <Controller
                        name={`items.${index}.id`}
                        control={control}
                        render={({ field }) => (
                          <Select {...field} fullWidth>
                            <MenuItem value="" disabled>
                              Wybierz zasób
                            </MenuItem>
                            {stocks.map((stock: any) => (
                              <MenuItem key={stock.id} value={stock.id}>
                                {stock.category.label} ({stock.origin}) [Dostępne: {stock.quantity}]
                              </MenuItem>
                            ))}
                          </Select>
                        )}
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    {items[index].type === 'stock' && (
                      <Controller
                        name={`items.${index}.quantity`}
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            type="number"
                            label="Ilość"
                            fullWidth
                            inputProps={{ min: 0 }}
                          />
                        )}
                      />
                    )}
                    {items[index].type === 'pyr_code' && items[index].status === 'success' && (
                      <Typography variant="body2">
                        {items[index].category?.label || 'Brak kategorii'}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {items[index].status === 'success' && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckCircleIcon color="success" />
                        <Typography variant="body2" color="success.main">Dostępny</Typography>
                      </Box>
                    )}
                    {items[index].status === 'failure' && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ErrorIcon color="error" />
                        <Typography variant="body2" color="error">Nie znaleziono</Typography>
                      </Box>
                    )}
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => remove(index)}>
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
          color="secondary"
          onClick={() =>
            append({ type: 'pyr_code', id: '', pyrcode: '', quantity: 0, status: '' as ValidationStatus })
          }
          sx={{ mt: 2 }}
        >
          Dodaj Wiersz
        </Button>

        <Button
          variant="contained"
          color="primary"
          type="submit"
          disabled={!fromLocation || items.length === 0 || loading}
          sx={{ mt: 2, ml: 2 }}
        >
          {loading ? <CircularProgress size={20} /> : 'Utwórz Transfer'}
        </Button>
      </form>
    </Container>
  );
};

export default TransferPage;
