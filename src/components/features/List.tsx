import React, { useState, useEffect, Suspense, lazy } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
  Paper,
  TextField,
  Autocomplete,
  Select,
  MenuItem,
  Chip,
  Button,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  useMediaQuery,
  useTheme,
  Divider,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useLocations } from '../../hooks/useLocations';
import { useCategories } from '../../hooks/useCategories';
import { ErrorMessage } from '../ui/ErrorMessage';
import { getApiUrl } from '../../config/api';

interface Location {
  id: number;
  name: string;
}

interface Category {
  id: number;
  label: string;
}

interface Equipment {
  id: number;
  category: string | { label: string };
  quantity?: number;
  location: Location;
  state: string;
  pyr_code?: string;
  origin: string;
  type: 'asset' | 'stock';
}

interface QuickFilter {
  id: number;
  name: string;
  icon: string;
}

const CheckCircle = lazy(() => import('@mui/icons-material/CheckCircle'));
const ErrorOutline = lazy(() => import('@mui/icons-material/ErrorOutline'));
const LocalShipping = lazy(() => import('@mui/icons-material/LocalShipping'));
const Home = lazy(() => import('@mui/icons-material/Home'));
const Inventory2 = lazy(() => import('@mui/icons-material/Inventory2'));
const ClearAll = lazy(() => import('@mui/icons-material/ClearAll'));
const Warehouse = lazy(() => import('@mui/icons-material/Warehouse'));
const Search = lazy(() => import('@mui/icons-material/Search'));
const LocationOn = lazy(() => import('@mui/icons-material/LocationOn'));
const Category = lazy(() => import('@mui/icons-material/Category'));

const EquipmentList: React.FC = () => {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [filteredEquipment, setFilteredEquipment] = useState<Equipment[]>([]); // For local filtering
  const [filter, setFilter] = useState<string>('');
  const [selectedLocations, setSelectedLocations] = useState<Location[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [categoryType, setCategoryType] = useState<'asset' | 'stock' | ''>('');
  // const [setSortField] = useState<string>('id');
  // const [setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  const { locations, loading: locationsLoading, refetch: fetchLocations } = useLocations();
  const { categories, loading: categoriesLoading } = useCategories();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      setEquipment([]); // Clear the state before fetching new data

      const response = await fetch(getApiUrl('/items'));

      if (response.status === 400 || response.status === 404) {
        setEquipment([]);
        setFilteredEquipment([]);
        setError('');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch equipment data');
      }

      const data = await response.json();

      const transformedData = data.map((item: any) => ({
        id: item.id,
        category: item.category?.label || 'Unknown',
        quantity: item.quantity,
        location: item.location,
        state: item.status,
        pyr_code: item.pyrcode || undefined,
        origin: item.origin,
        type: item.category?.type || 'asset',
      }));

      setEquipment(transformedData);
      setFilteredEquipment(transformedData); // Initially show all data
      setError('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!equipment.length) return;

    let filtered = [...equipment];

    // Filtrowanie po lokalizacjach
    if (selectedLocations.length > 0) {
      filtered = filtered.filter(item => 
        selectedLocations.some(loc => loc.id === item.location.id)
      );
    }

    // Filtrowanie po kategorii
    if (selectedCategory) {
      filtered = filtered.filter(item => 
        (typeof item.category === 'string' ? item.category : item.category.label) === selectedCategory.label
      );
    }

    // Filtrowanie po typie kategorii
    if (categoryType) {
      filtered = filtered.filter(item => item.type === categoryType);
    }

    // Filtrowanie po PYR_CODE
    if (filter.trim()) {
      const lowercasedFilter = filter.toLowerCase();
      filtered = filtered.filter(item =>
        item.pyr_code?.toLowerCase().includes(lowercasedFilter)
      );
    }

    setFilteredEquipment(filtered);
  }, [equipment, selectedLocations, selectedCategory, categoryType, filter]);

  useEffect(() => {
    fetchEquipment();
  }, []); // Pobieramy dane tylko raz przy montowaniu komponentu

  // Domyślne sortowanie po ID
  useEffect(() => {
    if (filteredEquipment.length > 0) {
      const sortedEquipment = [...filteredEquipment].sort((a, b) => b.id - a.id);
      setFilteredEquipment(sortedEquipment);
    }
  }, [equipment]);

  // const handleSort = (field: string) =>
      // setSortField(field
      // setSortOrder((prevOrder) => (prevOrder === 'asc' ? 'desc' : 'asc')
    // };

  const getStatusIcon = (status: string, type: string, color?: 'primary' | 'inherit') => {
    if (type === 'stock') return null;
    switch (status) {
      case 'in_stock':
      case 'available':
        return <Suspense fallback={null}><Home color={color} /></Suspense>;
      case 'delivered':
      case 'located':
        return <Suspense fallback={null}><CheckCircle color={'success'} /></Suspense>;
      case 'in_transit':
        return <Suspense fallback={null}><LocalShipping color={color || 'primary'} /></Suspense>;
      default:
        return <Suspense fallback={null}><ErrorOutline color={'error'} /></Suspense>;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'in_stock':
      case 'available':
        return 'Na Stanie';
      case 'in_transit':
        return 'W trasie';
      case 'located':
        return 'W lokacji';
      default:
        return '';
    }
  };

  const renderStatusOrQuantity = (item: Equipment) => {
    if (item.type === 'stock') {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography 
            component="div" 
            fontWeight="bold"
            sx={{ 
              color: item.state === 'in_transit' ? 'primary.main' : (item.quantity && item.quantity > 0 ? 'success.main' : 'text.secondary'),
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <Suspense fallback={null}><Inventory2 sx={{ color: item.state === 'in_transit' ? 'primary.main' : undefined }} /></Suspense>
            {item.quantity ?? '-'}
          </Typography>
        </Box>
      );
    }
    
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {getStatusIcon(item.state, item.type, item.state === 'in_transit' ? 'primary' : 'inherit')}
        <Typography component="div" sx={{ color: item.state === 'in_transit' ? 'primary.main' : 'inherit' }}>
          {getStatusLabel(item.state)}
        </Typography>
      </Box>
    );
  };

  const quickFilters: QuickFilter[] = [
    { id: 1, name: 'Magazyn Techniczny', icon: 'warehouse' },
    { id: 3, name: 'Brak lokalizacji', icon: 'location_off' }
  ];

  const applyQuickFilter = (filter: QuickFilter) => {
    switch (filter.id) {
      case 1: { // Magazyn Techniczny
        const techLocation = locations.find((loc) => loc.id === filter.id);
        if (techLocation && !selectedLocations.some((selectedLoc) => selectedLoc.id === techLocation.id)) {
          setSelectedLocations((prev) => [...prev, techLocation]);
        }
        break;
      }
      case 3: // Brak lokalizacji
        setSelectedLocations([]);
        break;
    }
  };

  const removeQuickFilter = (filter: QuickFilter) => {
    switch (filter.id) {
      case 1: { // Magazyn Techniczny
        setSelectedLocations((prev) => prev.filter((loc) => loc.id !== filter.id));
        break;
      }
      case 3: // Brak lokalizacji
        setSelectedLocations(locations);
        break;
    }
  };

  // Renderowanie tabeli dla desktop
  const renderTable = () => (
    <TableContainer 
      component={Paper} 
      sx={{ 
        borderRadius: 2,
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        overflow: 'hidden'
      }}
    >
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: 'primary.light' }}>
            {['ID', 'Typ', 'Lokalizacja', 'Status', 'Ilość/PYR_CODE', 'Pochodzenie'].map((field) => (
              <TableCell 
                key={field} 
                sx={{ 
                  cursor: 'pointer',
                  fontWeight: 600,
                  color: 'primary.contrastText',
                  py: 2
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {field.toUpperCase()}
                </Box>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredEquipment.map((item) => (
            <TableRow
              key={`${item.id}-${item.type}`}
              sx={{
                bgcolor: item.state === 'in_transit' ? 'rgba(222, 198, 49, 0.1)' : 'inherit',
                '&:hover': {
                  bgcolor: 'action.hover',
                  cursor: 'pointer',
                },
                transition: 'background-color 0.2s ease'
              }}
              onClick={() => navigate(`/equipment/${item.id}?type=${item.type}`)}
              aria-label={`Szczegóły dla elementu ${item.id}`}
            >
              <TableCell>
                <Typography component="div" sx={{ fontWeight: 500 }}>
                  {String(item.id)}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography component="div">
                  {typeof item.category === 'string' ? item.category : (item.category as any).label}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography component="div">
                  {item.location.name}
                </Typography>
              </TableCell>
              <TableCell>
                {item.type === 'asset' ? renderStatusOrQuantity(item) : '-'}
              </TableCell>
              <TableCell>
                {item.type === 'stock' ? renderStatusOrQuantity(item) : (
                  <Typography component="div">
                    {item.pyr_code || '-'}
                  </Typography>
                )}
              </TableCell>
              <TableCell>
                <Typography component="div">
                  {item.origin}
                </Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  // Renderowanie kart dla urządzeń mobilnych
  const renderMobileCards = () => (
    <Grid container spacing={2}>
      {filteredEquipment.map((item) => (
        <Grid item xs={12} key={`${item.id}-${item.type}`}>
          <Card 
            sx={{ 
              borderRadius: 2,
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              bgcolor: item.state === 'in_transit' ? 'rgba(222, 198, 49, 0.1)' : 'inherit',
              '&:hover': {
                bgcolor: 'action.hover',
                cursor: 'pointer',
              },
              transition: 'background-color 0.2s ease'
            }}
            onClick={() => navigate(`/equipment/${item.id}?type=${item.type}`)}
            aria-label={`Szczegóły dla elementu ${item.id}`}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="h6" component="div" sx={{ fontWeight: 500 }}>
                  ID: {String(item.id)}
                </Typography>
                <Chip 
                  label={item.type === 'asset' ? 'Sprzęt' : 'Materiały'} 
                  size="small" 
                  color={item.type === 'asset' ? 'primary' : 'secondary'}
                />
              </Box>
              
              <Divider sx={{ my: 1 }} />
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Typ:</Typography>
                  <Typography variant="body2">
                    {typeof item.category === 'string' ? item.category : (item.category as any).label}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Lokalizacja:</Typography>
                  <Typography variant="body2">{item.location.name}</Typography>
                </Box>
                
                {item.type === 'asset' && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Status:</Typography>
                    {renderStatusOrQuantity(item)}
                  </Box>
                )}
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    {item.type === 'stock' ? 'Ilość:' : 'PYR_CODE:'}
                  </Typography>
                  {item.type === 'stock' ? renderStatusOrQuantity(item) : (
                    <Typography variant="body2">{item.pyr_code || '-'}</Typography>
                  )}
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Pochodzenie:</Typography>
                  <Typography variant="body2">{item.origin}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  return (
    <Box sx={{ 
      margin: '0 auto', 
      padding: { xs: 2, sm: 3, md: 4 },
      maxWidth: '1400px',
      backgroundColor: 'background.paper',
      borderRadius: 2,
      boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
    }}>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between', 
        alignItems: { xs: 'flex-start', sm: 'center' }, 
        marginBottom: 3,
        gap: 2,
        borderBottom: '1px solid',
        borderColor: 'divider',
        pb: 2
      }}>
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom
          sx={{ 
            fontWeight: 600,
            color: 'primary.main',
            mb: { xs: 1, sm: 0 }
          }}
        >
          Stan magazynowy
        </Typography>
        
        <Button
          variant="outlined"
          size="small"
          startIcon={<Suspense fallback={null}><ClearAll /></Suspense>}
          onClick={() => {
            setFilter('');
            setSelectedLocations([]);
            setSelectedCategory(null);
            setCategoryType('');
          }}
          sx={{ 
            borderRadius: 1,
            px: 2
          }}
        >
          Wyczyść filtry
        </Button>
      </Box>

      {/* Sekcja filtrów */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        gap: 2,
        marginBottom: 3,
        backgroundColor: 'background.default',
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        overflow: 'hidden'
      }}>
        {/* Nagłówek sekcji filtrów */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          p: 1.5,
          borderBottom: '1px solid',
          borderColor: 'divider',
          backgroundColor: 'background.paper'
        }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
            Filtry
          </Typography>
        </Box>
        
        {/* Szybkie filtry */}
        <Box sx={{ p: 1.5 }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
            Szybkie filtry
          </Typography>
          <Box sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: 1,
            '& > *': { 
              flex: { xs: '1 1 100%', sm: '1 1 auto' },
              transition: 'all 0.2s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
              }
            }
          }}>
            {quickFilters.map((filter) => (
              <Chip
                key={filter.id}
                label={filter.name}
                icon={<Suspense fallback={null}><Warehouse /></Suspense>}
                color={selectedLocations.some((loc) => loc.id === filter.id) ? 'primary' : 'default'}
                onClick={() =>
                  selectedLocations.some((loc) => loc.id === filter.id)
                    ? removeQuickFilter(filter)
                    : applyQuickFilter(filter)
                }
                size="small"
                sx={{ 
                  cursor: 'pointer',
                  fontWeight: selectedLocations.some((loc) => loc.id === filter.id) ? 600 : 400,
                  '& .MuiChip-icon': {
                    color: selectedLocations.some((loc) => loc.id === filter.id) ? 'inherit' : 'action.active'
                  }
                }}
                aria-label={`Filtr: ${filter.name}`}
              />
            ))}
          </Box>
        </Box>
        
        {/* Zaawansowane filtry */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' }, 
          gap: 2, 
          p: 1.5,
          borderTop: '1px solid',
          borderColor: 'divider',
          backgroundColor: 'background.paper'
        }}>
          <TextField
            label="Filtruj po PYR_CODE"
            variant="outlined"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            size="small"
            sx={{ flex: 1 }}
            aria-label="Filtruj po kodzie PYR"
            InputProps={{
              sx: { 
                borderRadius: 1,
                height: '36px',
                '& input': {
                  height: '36px',
                  padding: '0 12px',
                }
              },
              startAdornment: (
                <Suspense fallback={null}><Search /></Suspense>
              )
            }}
          />
          <Autocomplete<Location, true, false, false>
            multiple
            options={locations}
            getOptionLabel={(option: Location) => option.name}
            value={selectedLocations}
            loading={locationsLoading}
            onChange={(_, value) => setSelectedLocations(value)}
            size="small"
            limitTags={isMobile ? 1 : 2}
            renderInput={(params) => (
              <TextField 
                {...params} 
                label={selectedLocations.length > 0 ? `Wybrano ${selectedLocations.length} lokalizacji` : "Filtruj po lokalizacjach"}
                variant="outlined"
                InputProps={{
                  ...params.InputProps,
                  sx: { 
                    borderRadius: 1,
                    minHeight: '36px',
                    height: 'auto',
                    padding: '4px',
                    '& .MuiAutocomplete-input': {
                      height: '28px',
                      padding: '0 8px',
                    },
                    '& .MuiInputAdornment-root': {
                      height: '36px',
                    }
                  },
                  startAdornment: (
                    <>
                      <Suspense fallback={null}><LocationOn /></Suspense>
                    </>
                  ),
                  endAdornment: (
                    <>
                      {locationsLoading ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
            renderOption={(props, option: Location) => (
              <li {...props} key={option.id}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Suspense fallback={null}><LocationOn /></Suspense>
                  <Typography component="span">{option.name}</Typography>
                </Box>
              </li>
            )}
            renderTags={(tagValue, getTagProps) =>
              tagValue.map((option, index) => {
                const { key, ...rest } = getTagProps({ index });
                return (
                  <Chip
                    label={option.name}
                    {...rest}
                    key={key}
                    size="small"
                    sx={{
                      m: 0.25,
                      height: '24px',
                      maxWidth: { xs: '120px', sm: '150px' },
                      '& .MuiChip-label': {
                        px: 1,
                        fontSize: '0.75rem',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      },
                      '& .MuiChip-deleteIcon': {
                        fontSize: '16px',
                        margin: '0 2px',
                        color: 'inherit',
                        '&:hover': {
                          color: 'error.main',
                        },
                      },
                    }}
                  />
                );
              })
            }
            isOptionEqualToValue={(option: Location, value: Location) => option.id === value.id}
            sx={{ 
              flex: 1,
              '& .MuiAutocomplete-tag': {
                margin: '2px',
              },
              '& .MuiInputBase-root': {
                flexWrap: 'wrap',
                gap: 0.5,
                padding: '2px 4px',
                minHeight: '36px',
                height: 'auto',
              },
            }}
            aria-label="Wybierz lokalizacje"
          />
          <Autocomplete<Category, false, false, false>
            options={categories}
            getOptionLabel={(option: Category) => option.label}
            value={selectedCategory}
            loading={categoriesLoading}
            onChange={(_, value) => setSelectedCategory(value)}
            size="small"
            renderInput={(params) => (
              <TextField 
                {...params} 
                label="Filtruj po kategorii" 
                variant="outlined"
                InputProps={{
                  ...params.InputProps,
                  sx: { borderRadius: 1 },
                  startAdornment: (
                    <Suspense fallback={null}><Category /></Suspense>
                  ),
                  endAdornment: (
                    <>
                      {categoriesLoading ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
            renderOption={(props, option: Category) => (
              <li {...props}>
                <Typography component="span">{option.label}</Typography>
              </li>
            )}
            isOptionEqualToValue={(option: Category | null, value: Category | null) => option?.id === value?.id}
            sx={{ flex: 1 }}
            aria-label="Wybierz kategorię"
          />
          <Select
            value={categoryType}
            onChange={(e) => setCategoryType(e.target.value as 'asset' | 'stock')}
            displayEmpty
            size="small"
            sx={{ 
              flex: { xs: 1, md: 0.5 },
              borderRadius: 0
            }}
            aria-label="Wybierz typ kategorii"
          >
            <MenuItem value="">Wszystkie typy</MenuItem>
            <MenuItem value="asset">Sprzęt (z pyr_code)</MenuItem>
            <MenuItem value="stock">Zasoby (ilościowe)</MenuItem>
          </Select>
        </Box>
      </Box>

      {error && (
        <Box sx={{ mb: 3 }}>
          <ErrorMessage message={error} />
        </Box>
      )}

      {loading ? (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          p: 5,
          flexDirection: 'column',
          gap: 2
        }}>
          <CircularProgress size={40} />
          <Typography variant="body1" color="text.secondary">
            Ładowanie danych...
          </Typography>
        </Box>
      ) : filteredEquipment.length === 0 ? (
        <Box sx={{ 
          textAlign: 'center', 
          p: 5,
          backgroundColor: 'background.default',
          borderRadius: 2,
          border: '1px dashed',
          borderColor: 'divider'
        }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Brak sprzętu dla wybranych filtrów
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Spróbuj zmienić kryteria wyszukiwania lub wyczyść filtry
          </Typography>
          <Button 
            variant="outlined" 
            onClick={() => {
              setFilter('');
              setSelectedLocations([]);
              setSelectedCategory(null);
              setCategoryType('');
            }}
            sx={{ 
              borderRadius: 1,
              px: 3
            }}
          >
            Wyczyść filtry
          </Button>
        </Box>
      ) : (
        isMobile ? renderMobileCards() : renderTable()
      )}
    </Box>
  );
};

export default EquipmentList;

