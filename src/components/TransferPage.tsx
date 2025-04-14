import React, { useState, useEffect } from 'react';
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
import AddIcon from '@mui/icons-material/Add';
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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [pyrCodeSuggestions, setPyrCodeSuggestions] = useState<PyrCodeSuggestion[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [lockedRows, setLockedRows] = useState<Set<number>>(new Set());
  const [isValidationInProgress, setIsValidationInProgress] = useState<boolean>(false);
  // @ts-ignore - activeRowIndex jest używane w komponencie
  const [activeRowIndex, setActiveRowIndex] = useState<number>(0);

  const fromLocation = watch('fromLocation');
  const items = watch('items');

  const { locations, error: locationError, refetch: refetchLocations } = useLocations();
  const { stocks, error: stockError, fetchStocks } = useStocks();

  const navigate = useNavigate();

  useEffect(() => {
    refetchLocations();
  }, [refetchLocations]);

  const isPyrCodeSelected = (pyrcode: string): boolean => {
    return items.some(item => 
      item.type === 'pyr_code' && 
      item.pyrcode === pyrcode
    );
  };

  useEffect(() => {
    if (fromLocation) {
      fetchStocks(fromLocation.toString());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromLocation]);

  const handleValidatePyrCode = async (index: number, pyrcode: string) => {
    if (isValidationInProgress) {
      return;
    }

    // Sprawdź czy kod PYR jest już wybrany
    if (isPyrCodeSelected(pyrcode)) {
      setValue(`items.${index}.status`, 'failure' as ValidationStatus);
      return;
    }
    
    try {
      setIsValidationInProgress(true);
      setValue(`items.${index}.pyrcode`, pyrcode);
      const response = await validatePyrCodeAPI(pyrcode);
      
      if (index >= items.length) {
        return;
      }

      setValue(`items.${index}.id`, response.id);
      setValue(`items.${index}.status`, 'success' as ValidationStatus);
      setValue(`items.${index}.category`, response.category);
      
      setLockedRows(prev => new Set([...prev, index]));
      
      if (index === items.length - 1) {
        append({ type: 'pyr_code', id: '', pyrcode: '', quantity: 0, status: '' });
        setActiveRowIndex(items.length);
      }
    } catch (err: any) {
      setValue(`items.${index}.status`, 'failure' as ValidationStatus);
    } finally {
      setIsValidationInProgress(false);
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
      
      // Filtruj już wybrane kody PYR
      const filteredSuggestions = suggestions.filter(
        (suggestion: PyrCodeSuggestion) => !isPyrCodeSelected(suggestion.pyrcode)
      );
      
      setPyrCodeSuggestions(filteredSuggestions);
    } catch (error) {
      console.error('Błąd podczas wyszukiwania:', error);
      setPyrCodeSuggestions([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const getErrorMessage = (error: string): string => {
    const errorMessages: { [key: string]: string } = {
      'Invalid transfer data': 'Nieprawidłowe dane transferu',
      'Unauthorized access': 'Brak autoryzacji',
      'Access forbidden': 'Dostęp zabroniony',
      'Resource not found': 'Nie znaleziono zasobu',
      'Server error occurred': 'Wystąpił błąd serwera',
      'Request timeout': 'Przekroczono limit czasu żądania',
      'An unexpected error occurred': 'Wystąpił nieoczekiwany błąd',
      'Transfer from and to location cannot be the same': 'Lokalizacja źródłowa i docelowa nie mogą być takie same',
    };

    return errorMessages[error] || 'Wystąpił błąd podczas przetwarzania transferu';
  };

  const onSubmit = async (formData: any) => {
    if (!formData.toLocation) {
      setErrorMessage('Wybierz lokalizację docelową');
      return;
    }

    if (Number(formData.fromLocation) === Number(formData.toLocation)) {
      setErrorMessage('Lokalizacja źródłowa i docelowa nie mogą być takie same');
      return;
    }

    // Sprawdzanie dostępności ilości dla każdego przedmiotu magazynowego
    const stockValidationErrors = formData.items
      .filter((item: any) => item.type === 'stock' && item.id)
      .map((item: any) => {
        const selectedStock = stocks.find((stock: any) => stock.id === item.id);
        if (!selectedStock) {
          return 'Nie znaleziono wybranego przedmiotu magazynowego';
        }
        if (Number(item.quantity) > selectedStock.quantity) {
          return `Dla przedmiotu "${selectedStock.category.label}" maksymalna dostępna ilość to: ${selectedStock.quantity}`;
        }
        if (Number(item.quantity) <= 0) {
          return `Dla przedmiotu "${selectedStock.category.label}" ilość musi być większa niż 0`;
        }
        return null;
      })
      .filter(Boolean);

    if (stockValidationErrors.length > 0) {
      setErrorMessage(stockValidationErrors[0]);
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);

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

      if (!payload.assets?.length && !payload.stocks?.length) {
        setErrorMessage('Dodaj co najmniej jeden zasób lub pozycję magazynową');
        return;
      }

      const response = await createTransferAPI(payload);

      setSuccessMessage('Quest został utworzony pomyślnie!');
      setTimeout(() => {
        navigate(`/transfers/${response.id}`);
      }, 500);

      reset();
    } catch (err: any) {
      console.error('Błąd podczas tworzenia transferu:', err.message);
      setErrorMessage(getErrorMessage(err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveRow = (index: number) => {
    // Najpierw usuwamy wiersz
    remove(index);
    
    // Resetujemy stan zablokowanych wierszy
    setLockedRows(prev => {
      const newLockedRows = new Set<number>();
      prev.forEach(lockedIndex => {
        if (lockedIndex < index) {
          newLockedRows.add(lockedIndex);
        } else if (lockedIndex > index) {
          newLockedRows.add(lockedIndex - 1);
        }
      });
      return newLockedRows;
    });

    // Sprawdzamy, czy wszystkie wiersze są puste lub czy nie ma wierszy
    const hasEmptyRow = fields.some((_, idx) =>
      !items[idx]?.id && !items[idx]?.pyrcode && !items[idx]?.quantity
    );

    // Jeśli nie ma pustego wiersza, dodajemy nowy
    if (!hasEmptyRow) {
      append({ type: 'pyr_code', id: '', pyrcode: '', quantity: 0, status: '' });
      setActiveRowIndex(fields.length);
    } else {
      // Znajdź indeks pierwszego pustego wiersza
      const emptyRowIndex = fields.findIndex((_, idx) =>
        !items[idx]?.id && !items[idx]?.pyrcode && !items[idx]?.quantity
      );
      setActiveRowIndex(emptyRowIndex);
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Nowy transfer
      </Typography>

      {/* Display Errors */}
      {locationError && <ErrorMessage message="Error loading locations" details={locationError} />}
      {stockError && <ErrorMessage message="Error loading stocks" details={stockError} />}
      {errorMessage && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMessage}
        </Alert>
      )}
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
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
            rules={{ required: 'Wybierz lokalizację docelową' }}
            render={({ field, fieldState: { error } }) => (
              <Box>
                <Select
                  {...field}
                  displayEmpty
                  fullWidth
                  error={!!error}
                >
                  <MenuItem value="" disabled>
                    Wybierz lokalizację docelową
                  </MenuItem>
                  {locations.map((location: any) => (
                    <MenuItem key={location.id} value={location.id}>
                      {location.name}
                    </MenuItem>
                  ))}
                </Select>
                {error && (
                  <Typography color="error" variant="caption" sx={{ mt: 1 }}>
                    {error.message}
                  </Typography>
                )}
              </Box>
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
                          <MenuItem value="stock">Zasoby (Ilościowe)</MenuItem>
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
                            key={index}
                            data-testid={`pyr-code-input-${index}`}
                            options={pyrCodeSuggestions}
                            loading={searchLoading}
                            disabled={lockedRows.has(index)}
                            getOptionLabel={(option: PyrCodeSuggestion | string) =>
                              typeof option === 'string'
                                ? option
                                : `${option.pyrcode} - ${option.category.label}`
                            }
                            onChange={(_, newValue) => {
                              if (newValue && typeof newValue !== 'string') {
                                handleValidatePyrCode(index, newValue.pyrcode);
                                field.onChange(newValue.pyrcode);
                              } else if (typeof newValue === 'string') {
                                field.onChange(newValue);
                              } else {
                                field.onChange('');
                              }
                            }}
                            onInputChange={(_, value) => {
                              handlePyrCodeSearch(value);
                            }}
                            onKeyDown={(event) => {
                              if (event.key === 'Enter') {
                                event.preventDefault();
                                const inputValue = (event.target as HTMLInputElement).value;
                                if (inputValue && inputValue.length >= 2) {
                                  handleValidatePyrCode(index, inputValue);
                                }
                              }
                            }}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                placeholder="Wpisz kod PYR"
                                variant="outlined"
                                fullWidth
                                InputProps={{
                                  ...params.InputProps,
                                  endAdornment: (
                                    <React.Fragment>
                                      {searchLoading ? <CircularProgress color="inherit" size={20} /> : null}
                                      {params.InputProps.endAdornment}
                                    </React.Fragment>
                                  ),
                                }}
                              />
                            )}
                            value={field.value}
                            filterOptions={(options) => options.filter(option => {
                              if (typeof option === 'string') return false;
                              return !isPyrCodeSelected(option.pyrcode);
                            })}
                            freeSolo
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
                        render={({ field }) => {
                          const selectedStock = stocks.find((stock: any) => stock.id === items[index].id);
                          const maxQuantity = selectedStock?.quantity || 0;
                          
                          return (
                            <TextField
                              {...field}
                              type="number"
                              label="Ilość"
                              fullWidth
                              error={Number(field.value) > maxQuantity}
                              helperText={Number(field.value) > maxQuantity ? `Maksymalna dostępna ilość: ${maxQuantity}` : ''}
                              inputProps={{ 
                                min: 0,
                                max: maxQuantity,
                                step: 1
                              }}
                              onChange={(e) => {
                                const value = Math.min(Number(e.target.value), maxQuantity);
                                field.onChange(value);
                              }}
                            />
                          );
                        }}
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
                    <IconButton onClick={() => handleRemoveRow(index)}>
                      <DeleteIcon data-testid="DeleteIcon" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Button
          variant="outlined"
          color="secondary"
          startIcon={<AddIcon />}
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
          {loading ? <CircularProgress size={20} /> : 'Rozpocznij quest'}
        </Button>
      </form>
    </Container>
  );
};

export default TransferPage;
