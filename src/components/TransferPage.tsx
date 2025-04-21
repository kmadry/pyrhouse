import React, { useState, useEffect, useRef } from 'react';
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
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import AddIcon from '@mui/icons-material/Add';
import { useLocations } from '../hooks/useLocations';
import { useStocks } from '../hooks/useStocks';
import { validatePyrCodeAPI, createTransferAPI, searchPyrCodesAPI } from '../services/transferService';
import { getUsersAPI } from '../services/userService';
import { ErrorMessage } from './ErrorMessage';
import { useLocation, useNavigate } from 'react-router-dom';
import { LocationOn, Event, Person, Inventory, Close, Check } from '@mui/icons-material';

interface User {
  id: number;
  username: string;
  fullname: string;
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

interface Stock {
  id: number;
  category: {
    id: number;
    label: string;
    type: string;
  };
  origin: string;
  quantity: number;
  location: {
    id: number;
    name: string;
  };
}

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
  users: User[];
}

interface QuestData {
  recipient: string;
  deliveryDate: string;
  location: string;
  pavilion: string;
  items: Array<{
    item_name: string;
    quantity: number;
    notes?: string;
  }>;
}

const TransferPage: React.FC = () => {
  const { control, handleSubmit, setValue, watch, reset } = useForm<FormData>({
    defaultValues: {
      fromLocation: 1,
      toLocation: '',
      items: [{ type: 'pyr_code', id: '', pyrcode: '', quantity: 0, status: '' }],
      users: [],
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
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const formDataRef = useRef<FormData | null>(null);

  const fromLocation = watch('fromLocation');
  const items = watch('items');

  const { locations, error: locationError, refetch: refetchLocations } = useLocations();
  const { stocks, error: stockError, fetchStocks } = useStocks();

  const navigate = useNavigate();
  const location = useLocation();
  const questData = location.state?.questData as QuestData;

  useEffect(() => {
    refetchLocations();
  }, [refetchLocations]);

  useEffect(() => {
    const fetchUsers = async () => {
      setUsersLoading(true);
      try {
        const data = await getUsersAPI();
        setUsers(data);
      } catch (error: any) {
        setUsersError(error.message);
      } finally {
        setUsersLoading(false);
      }
    };

    fetchUsers();
  }, []);

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

  const handleFormSubmit = (formData: FormData) => {
    formDataRef.current = formData;
    setShowConfirmation(true);
  };

  const handleConfirmSubmit = async () => {
    if (!formDataRef.current) return;

    if (!formDataRef.current.toLocation) {
      setErrorMessage('Wybierz lokalizację docelową');
      return;
    }

    if (Number(formDataRef.current.fromLocation) === Number(formDataRef.current.toLocation)) {
      setErrorMessage('Lokalizacja źródłowa i docelowa nie mogą być takie same');
      return;
    }

    // Sprawdzanie dostępności ilości dla każdego przedmiotu magazynowego
    const stockValidationErrors = formDataRef.current.items
      .filter((item) => item.type === 'stock' && item.id)
      .map((item) => {
        const selectedStock = stocks.find((stock) => stock.id === Number(item.id));
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

    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const assets = formDataRef.current.items
        .filter((item) => item.type === 'pyr_code' && item.status === 'success')
        .map((item) => ({ id: Number(item.id) }));

      const stocks = formDataRef.current.items
        .filter((item) => item.type === 'stock')
        .map((item) => ({ id: Number(item.id), quantity: Number(item.quantity) }));

      const users = formDataRef.current.users.map((user) => ({ id: user.id }));

      const payload: {
        from_location_id: number;
        location_id: number;
        assets?: typeof assets;
        stocks?: typeof stocks;
        users?: typeof users;
      } = {
        from_location_id: Number(formDataRef.current.fromLocation),
        location_id: Number(formDataRef.current.toLocation),
      };

      if (assets.length > 0) payload.assets = assets;
      if (stocks.length > 0) payload.stocks = stocks;
      if (users.length > 0) payload.users = users;

      if (!assets.length && !stocks.length) {
        setErrorMessage('Dodaj co najmniej jeden zasób lub pozycję magazynową');
        return;
      }

      const response = await createTransferAPI(payload);
      setSuccessMessage('Transfer został utworzony pomyślnie!');
      setTimeout(() => {
        navigate(`/transfers/${response.id}`);
      }, 500);
      reset();
    } catch (error: any) {
      setErrorMessage(getErrorMessage(error.message));
    } finally {
      setLoading(false);
      setShowConfirmation(false);
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
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 2 }}>
      {questData && (
        <Paper 
          elevation={3} 
          sx={{ 
            p: 2, 
            mb: 2,
            backgroundColor: '#FFF8E7',
            border: '1px solid #E6CB99',
            '& .MuiPaper-root': {
              transition: 'none',
            },
            '&:hover': {
              backgroundColor: '#FFF8E7',
            }
          }}
        >
          <Typography 
            variant="h6" 
            sx={{ 
              mb: 1,
              color: '#54291E',
              fontFamily: '"Cinzel", serif'
            }}
          >
            Aktywny Quest
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            <Chip
              size="small"
              icon={<Person />}
              label={`Odbiorca: ${questData.recipient}`}
              sx={{ backgroundColor: '#E6CB99' }}
            />
            <Chip
              size="small"
              icon={<Event />}
              label={`Termin: ${new Date(questData.deliveryDate).toLocaleDateString()}`}
              sx={{ backgroundColor: '#E6CB99' }}
            />
            <Chip
              size="small"
              icon={<LocationOn />}
              label={`${questData.location} - ${questData.pavilion}`}
              sx={{ backgroundColor: '#E6CB99' }}
            />
          </Box>

          <Box sx={{ mt: 1 }}>
            <Typography variant="body2" sx={{ color: '#54291E', mb: 0.5 }}>
              Wymagane przedmioty:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {questData.items.map((item, index) => (
                <Chip
                  size="small"
                  key={index}
                  label={`${item.quantity}x ${item.item_name}${item.notes ? ` (${item.notes})` : ''}`}
                  sx={{ 
                    backgroundColor: '#E6CB99',
                    '& .MuiChip-label': {
                      color: '#54291E'
                    }
                  }}
                />
              ))}
            </Box>
          </Box>
        </Paper>
      )}

      <Typography variant="h5" gutterBottom>
        Nowy transfer
      </Typography>

      {/* Display Errors */}
      {locationError && <ErrorMessage message="Błąd podczas ładowania lokalizacji" details={locationError} />}
      {stockError && <ErrorMessage message="Błąd podczas ładowania zasobów" details={stockError} />}
      {usersError && <ErrorMessage message="Błąd podczas ładowania użytkowników" details={usersError} />}
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

      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' }, 
          gap: 1, 
          mt: 1 
        }}>
          <Controller
            name="fromLocation"
            control={control}
            defaultValue={1}
            render={({ field }) => (
              <Select
                {...field}
                size="small"
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
            defaultValue=""
            render={({ field }) => (
              <Select
                {...field}
                size="small"
                displayEmpty
                fullWidth
                value={field.value}
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
            )}
          />
        </Box>

        <Box sx={{ mt: 2 }}>
          <Controller
            name="users"
            control={control}
            render={({ field: { onChange, value } }) => (
              <Autocomplete
                multiple
                size="small"
                options={users}
                loading={usersLoading}
                value={value}
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
        </Box>

        <TableContainer 
          component={Paper} 
          sx={{ 
            mt: 2,
            overflow: 'auto',
            '&.MuiPaper-root': {
              boxShadow: 'none',
              transition: 'none',
              transform: 'none',
              '&:hover': {
                boxShadow: 'none',
                transform: 'none'
              }
            },
            '& .MuiTableRow-root': {
              '&:hover': {
                backgroundColor: 'transparent !important',
                cursor: 'default'
              },
              '&.Mui-selected, &.Mui-selected:hover': {
                backgroundColor: 'transparent !important'
              }
            },
            '& .MuiTableRow-head': {
              backgroundColor: (theme) => theme.palette.background.paper
            },
            '& .MuiTableCell-root': {
              padding: { xs: 1, sm: 2 },
              '&:first-of-type': {
                paddingLeft: { xs: 1, sm: 2 }
              },
              '&:last-of-type': {
                paddingRight: { xs: 1, sm: 2 }
              }
            },
            '& .MuiSelect-select': {
              minHeight: '32px !important',
              paddingTop: '4px !important',
              paddingBottom: '4px !important'
            }
          }}
        >
          <Table size="small" sx={{ minWidth: { xs: '650px', sm: 'auto' } }}>
            <TableHead>
              <TableRow>
                <TableCell width="20%">Typ</TableCell>
                <TableCell width="40%">ID / Kategoria</TableCell>
                <TableCell width="20%">Ilość/Typ</TableCell>
                <TableCell width="10%">Status</TableCell>
                <TableCell width="10%">Akcje</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {fields.map((item, index) => (
                <TableRow 
                  key={item.id}
                  hover={false}
                >
                  <TableCell>
                    <Controller
                      name={`items.${index}.type`}
                      control={control}
                      render={({ field }) => (
                        <Select 
                          {...field} 
                          size="small"
                          disabled={lockedRows.has(index)}
                          sx={{ width: '100%' }}
                        >
                          <MenuItem value="pyr_code" sx={{ width: '100%' }}>Pyr Code</MenuItem>
                          <MenuItem value="stock" sx={{ width: '100%' }}>Zasoby (Ilościowe)</MenuItem>
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
                            size="small"
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
                                size="small"
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
                                sx={{ width: '100%' }}
                              />
                            )}
                            value={field.value}
                            filterOptions={(options) => options.filter(option => {
                              if (typeof option === 'string') return false;
                              return !isPyrCodeSelected(option.pyrcode);
                            })}
                            freeSolo
                            sx={{ width: '100%' }}
                          />
                        )}
                      />
                    )}
                    {items[index].type === 'stock' && (
                      <Controller
                        name={`items.${index}.id`}
                        control={control}
                        render={({ field }) => (
                          <Select {...field} size="small" fullWidth sx={{ width: '100%' }}>
                            <MenuItem value="" disabled>
                              Wybierz zasób
                            </MenuItem>
                            {stocks.map((stock: Stock) => (
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
                              size="small"
                              type="text"
                              label="Ilość"
                              fullWidth
                              error={Number(field.value) > maxQuantity}
                              helperText={Number(field.value) > maxQuantity ? `Maksymalna dostępna ilość: ${maxQuantity}` : ''}
                              inputProps={{ 
                                max: maxQuantity,
                                inputMode: 'numeric',
                                pattern: '[0-9]*'
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

        <Box sx={{ 
          mt: 2,
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 1
        }}>
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<AddIcon />}
            onClick={() =>
              append({ type: 'pyr_code', id: '', pyrcode: '', quantity: 0, status: '' as ValidationStatus })
            }
            fullWidth={false}
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            Dodaj Wiersz
          </Button>

          <Button
            variant="contained"
            color="primary"
            type="submit"
            disabled={!fromLocation || items.length === 0 || loading}
            fullWidth={false}
            sx={{ 
              width: { xs: '100%', sm: 'auto' },
              ml: { xs: 0, sm: 2 }
            }}
          >
            {loading ? <CircularProgress size={20} /> : 'Rozpocznij quest'}
          </Button>
        </Box>
      </form>

      <Dialog 
        open={showConfirmation} 
        onClose={() => setShowConfirmation(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 1,
            p: 0.5
          }
        }}
      >
        <DialogTitle sx={{ 
          borderBottom: '1px solid',
          borderColor: 'divider',
          py: 1
        }}>
          <Typography variant="h6">
            Potwierdź szczegóły questa
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ mt: 1 }}>
          {formDataRef.current && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {/* Lokalizacje */}
              <Box sx={{ 
                p: 1.5, 
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                bgcolor: 'background.paper',
                '&:hover': {
                  bgcolor: 'background.paper'
                }
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LocationOn sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="subtitle1">Lokalizacje</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Box flex={1}>
                    <Typography variant="body2" color="text.secondary">Z lokalizacji</Typography>
                    <Typography>{locations.find(l => l.id === formDataRef.current?.fromLocation)?.name}</Typography>
                  </Box>
                  <Box flex={1}>
                    <Typography variant="body2" color="text.secondary">Do lokalizacji</Typography>
                    <Typography>{locations.find(l => l.id === parseInt(formDataRef.current?.toLocation?.toString() || ''))?.name}</Typography>
                  </Box>
                </Box>
              </Box>

              {/* Uczestnicy */}
              {formDataRef.current.users && formDataRef.current.users.length > 0 && (
                <Box sx={{ 
                  p: 1.5,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  bgcolor: 'background.paper',
                  '&:hover': {
                    bgcolor: 'background.paper'
                  }
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Person sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="subtitle1">Uczestnicy questa</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {formDataRef.current.users.map((user) => (
                      <Chip
                        key={user.id}
                        label={user.username}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Box>
              )}

              {/* Elementy */}
              <Box sx={{ 
                p: 1.5,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                bgcolor: 'background.paper',
                '&:hover': {
                  bgcolor: 'background.paper'
                }
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Inventory sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="subtitle1">Elementy do transferu</Typography>
                </Box>
                <List disablePadding>
                  {formDataRef.current.items
                    .filter(item => item.type === 'pyr_code' ? item.status === 'success' : Boolean(item.id))
                    .map((item, index) => (
                      <ListItem 
                        key={index}
                        sx={{
                          py: 0.5,
                          borderBottom: index !== formDataRef.current!.items.length - 1 ? '1px solid' : 'none',
                          borderColor: 'divider'
                        }}
                      >
                        <ListItemText
                          primary={item.type === 'pyr_code' 
                            ? item.pyrcode
                            : stocks.find(s => s.id === parseInt(item.id))?.category.label}
                          secondary={
                            <Box sx={{ mt: 0.5, display: 'flex', gap: 0.5 }}>
                              <Chip
                                size="small"
                                label={item.type === 'pyr_code' ? 'Sprzęt' : `${item.quantity} szt.`}
                                color={item.type === 'pyr_code' ? 'primary' : 'default'}
                                variant="outlined"
                              />
                              {item.category?.label && (
                                <Chip
                                  size="small"
                                  label={item.category.label}
                                  variant="outlined"
                                />
                              )}
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}
                </List>
              </Box>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ 
          borderTop: '1px solid',
          borderColor: 'divider',
          p: 1,
          gap: 1 
        }}>
          <Button 
            onClick={() => setShowConfirmation(false)}
            variant="outlined"
            startIcon={<Close />}
          >
            Anuluj
          </Button>
          <Button 
            onClick={handleConfirmSubmit} 
            variant="contained"
            color="primary"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <Check />}
          >
            {loading ? 'Tworzenie...' : 'Rozpocznij quest'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TransferPage;
