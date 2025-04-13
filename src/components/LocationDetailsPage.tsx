import React, { useEffect, useState } from 'react';
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
  CircularProgress,
  Chip,
  Checkbox,
  Button,
  Card,
  CardContent,
} from '@mui/material';
import { useParams } from 'react-router-dom';
import { ErrorMessage } from './ErrorMessage';
import { useLocations } from '../hooks/useLocations';
import { TransferModal } from './TransferPage/components/TransferModal';
import { getLocationDetails } from '../services/locationService';
import { useTheme, useMediaQuery } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

interface Asset {
  id: number;
  serial: string;
  location: Record<string, any>;
  category: {
    id: number;
    name: string;
    label: string;
    pyr_id: string;
    type: string;
  };
  status: 'in_stock' | 'in_transit';
  pyrcode: string;
  accessories: null | any[];
}

interface StockItem {
  id: number;
  category: {
    id: number;
    name: string;
    label: string;
    pyr_id: string;
    type: string;
  };
  location: Record<string, any>;
  quantity: number;
}

interface LocationDetails {
  assets: Asset[] | null;
  stock_items: StockItem[] | null;
}

interface SelectedItems {
  assetIds: number[];
  stockIds: number[];
}

const LocationDetailsPage: React.FC = () => {
  const { locationId } = useParams<{ locationId: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locationDetails, setLocationDetails] = useState<LocationDetails | null>(null);
  const { locations } = useLocations();
  const [selectedItems, setSelectedItems] = useState<SelectedItems>({
    assetIds: [],
    stockIds: [],
  });
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [locationName, setLocationName] = useState<string>('Szczegóły lokalizacji');
  const [locationDetailsText, setLocationDetailsText] = useState<string>('Brak szczegółów');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const fetchLocationDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Rozpoczynam pobieranie szczegółów lokalizacji dla ID:', locationId);
      const data = await getLocationDetails(Number(locationId));
      console.log('Pobrano dane lokalizacji:', data);
      setLocationDetails({
        assets: data.assets,
        stock_items: data.stock_items,
      });
      setLocationName(data.name);
      setLocationDetailsText(data.details || 'Brak szczegółów');
    } catch (err: any) {
      console.error('Błąd podczas pobierania szczegółów lokalizacji:', err);
      setError(err.message || 'Wystąpił nieoczekiwany błąd podczas pobierania danych lokalizacji');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (locationId) {
      fetchLocationDetails();
    }
  }, [locationId]);

  const handleSelectAllAssets = () => {
    if (locationDetails?.assets) {
      const allAssetIds = locationDetails.assets.map(asset => asset.id);
      setSelectedItems(prev => ({
        ...prev,
        assetIds: prev.assetIds.length === allAssetIds.length ? [] : allAssetIds,
      }));
    }
  };

  const handleSelectAllStocks = () => {
    if (locationDetails?.stock_items) {
      const allStockIds = locationDetails.stock_items.map(item => item.id);
      setSelectedItems(prev => ({
        ...prev,
        stockIds: prev.stockIds.length === allStockIds.length ? [] : allStockIds,
      }));
    }
  };

  const handleSelectAsset = (assetId: number) => {
    setSelectedItems(prev => ({
      ...prev,
      assetIds: prev.assetIds.includes(assetId)
        ? prev.assetIds.filter(id => id !== assetId)
        : [...prev.assetIds, assetId],
    }));
  };

  const handleSelectStock = (stockId: number) => {
    setSelectedItems(prev => ({
      ...prev,
      stockIds: prev.stockIds.includes(stockId)
        ? prev.stockIds.filter(id => id !== stockId)
        : [...prev.stockIds, stockId],
    }));
  };

  const handleTransferSuccess = () => {
    setSelectedItems({ assetIds: [], stockIds: [] });
    // Odśwież dane lokalizacji
    if (locationId) {
      fetchLocationDetails();
    }
  };

  // Renderowanie karty dla urządzeń mobilnych
  const renderMobileCard = (item: Asset | StockItem, type: 'asset' | 'stock') => {
    const isAsset = type === 'asset';
    const isSelected = isAsset 
      ? selectedItems.assetIds.includes((item as Asset).id)
      : selectedItems.stockIds.includes((item as StockItem).id);

    return (
      <Card 
        key={item.id} 
        sx={{ 
          mb: 2, 
          position: 'relative',
          '&:hover': {
            boxShadow: 3,
            transform: 'translateY(-2px)',
            transition: 'all 0.2s'
          }
        }}
      >
        <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
          <Checkbox
            checked={isSelected}
            onChange={() => {
              if (isAsset) {
                handleSelectAsset((item as Asset).id);
              } else {
                handleSelectStock((item as StockItem).id);
              }
            }}
          />
        </Box>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            ID: {item.id}
          </Typography>
          {isAsset ? (
            <>
              <Typography variant="body1">
                <strong>Typ:</strong> {(item as Asset).category.type}
              </Typography>
              <Typography variant="body1">
                <strong>Status:</strong> {(item as Asset).status}
              </Typography>
              <Typography variant="body1">
                <strong>PYR Code:</strong> {(item as Asset).pyrcode}
              </Typography>
            </>
          ) : (
            <>
              <Typography variant="body1">
                <strong>Kategoria:</strong> {(item as StockItem).category.type}
              </Typography>
              <Typography variant="body1">
                <strong>Ilość:</strong> {(item as StockItem).quantity}
              </Typography>
            </>
          )}
        </CardContent>
      </Card>
    );
  };

  // Renderowanie tabeli dla desktopów
  const renderDesktopTable = (items: Asset[] | StockItem[], type: 'asset' | 'stock') => {
    const isAsset = type === 'asset';
    const selectedIds = isAsset ? selectedItems.assetIds : selectedItems.stockIds;
    const handleSelectAll = isAsset ? handleSelectAllAssets : handleSelectAllStocks;
    const handleSelect = isAsset ? handleSelectAsset : handleSelectStock;

    return (
      <TableContainer 
        component={Paper} 
        sx={{ 
          borderRadius: 2,
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          overflow: 'hidden',
          mb: 4
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'primary.light' }}>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={items.length > 0 && selectedIds.length === items.length}
                  indeterminate={selectedIds.length > 0 && selectedIds.length < items.length}
                  onChange={handleSelectAll}
                />
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'primary.contrastText', py: 2 }}>
                <Typography component="div" sx={{ fontWeight: 600 }}>ID</Typography>
              </TableCell>
              {isAsset ? (
                <>
                  <TableCell sx={{ fontWeight: 600, color: 'primary.contrastText', py: 2 }}>
                    <Typography component="div" sx={{ fontWeight: 600 }}>Typ</Typography>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: 'primary.contrastText', py: 2 }}>
                    <Typography component="div" sx={{ fontWeight: 600 }}>Status</Typography>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: 'primary.contrastText', py: 2 }}>
                    <Typography component="div" sx={{ fontWeight: 600 }}>PYR Code</Typography>
                  </TableCell>
                </>
              ) : (
                <>
                  <TableCell sx={{ fontWeight: 600, color: 'primary.contrastText', py: 2 }}>
                    <Typography component="div" sx={{ fontWeight: 600 }}>Kategoria</Typography>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: 'primary.contrastText', py: 2 }}>
                    <Typography component="div" sx={{ fontWeight: 600 }}>Ilość</Typography>
                  </TableCell>
                </>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item) => (
              <TableRow
                key={item.id}
                sx={{
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                  transition: 'background-color 0.2s ease'
                }}
              >
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedIds.includes(item.id)}
                    onChange={() => handleSelect(item.id)}
                  />
                </TableCell>
                <TableCell>
                  <Typography component="div" sx={{ fontWeight: 500 }}>
                    {item.id}
                  </Typography>
                </TableCell>
                {isAsset ? (
                  <>
                    <TableCell>
                      <Typography component="div">
                        {(item as Asset).category.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography component="div">
                        {(item as Asset).status}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography component="div">
                        {(item as Asset).pyrcode || '-'}
                      </Typography>
                    </TableCell>
                  </>
                ) : (
                  <>
                    <TableCell>
                      <Typography component="div">
                        {(item as StockItem).category.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography component="div">
                        {(item as StockItem).quantity}
                      </Typography>
                    </TableCell>
                  </>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  if (loading) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">
            Błąd podczas ładowania danych
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => fetchLocationDetails()}
          >
            Spróbuj ponownie
          </Button>
        </Box>
        <ErrorMessage message="Błąd podczas ładowania danych" details={error} />
      </Container>
    );
  }

  return (
    <Container>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          {locationName}
        </Typography>
      </Box>

      {/* Informacje o lokalizacji */}
      <Box sx={{ mb: 4, p: 2, bgcolor: 'background.paper', borderRadius: 1, boxShadow: 1 }}>
        <Typography variant="h6" gutterBottom>
          Informacje o lokalizacji
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography variant="body1">
            <strong>ID:</strong> {locationId}
          </Typography>
          <Typography variant="body1">
            <strong>Nazwa:</strong> {locationName}
          </Typography>
          {locationDetailsText && (
            <Typography variant="body1">
              <strong>Szczegóły:</strong> {locationDetailsText}
            </Typography>
          )}
        </Box>
      </Box>

      {/* Zaznaczone elementy */}
      {(selectedItems.assetIds.length > 0 || selectedItems.stockIds.length > 0) && (
        <Box 
          sx={{ 
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            bgcolor: 'background.paper',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            p: 2,
            zIndex: 1000,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Typography variant="subtitle1">
              Zaznaczone elementy:
            </Typography>
            {selectedItems.assetIds.length > 0 && (
              <Chip 
                label={`Sprzęt: ${selectedItems.assetIds.length}`}
                color="primary"
                variant="outlined"
              />
            )}
            {selectedItems.stockIds.length > 0 && (
              <Chip 
                label={`Zasoby: ${selectedItems.stockIds.length}`}
                color="primary"
                variant="outlined"
              />
            )}
          </Box>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setTransferModalOpen(true)}
            startIcon={<AddIcon />}
            sx={{ 
              minWidth: 200,
              borderRadius: 2
            }}
          >
            Utwórz transfer
          </Button>
        </Box>
      )}

      {/* Dodajemy padding na dole strony, aby przycisk nie zasłaniał treści */}
      {(selectedItems.assetIds.length > 0 || selectedItems.stockIds.length > 0) && (
        <Box sx={{ height: 80 }} />
      )}

      {/* Sprzęt */}
      {locationDetails?.assets && locationDetails.assets.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            Sprzęt
          </Typography>
          {isMobile ? (
            locationDetails.assets.map(asset => renderMobileCard(asset, 'asset'))
          ) : (
            renderDesktopTable(locationDetails.assets, 'asset')
          )}
        </Box>
      )}

      {/* Zasoby */}
      {locationDetails?.stock_items && locationDetails.stock_items.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            Zasoby
          </Typography>
          {isMobile ? (
            locationDetails.stock_items.map(item => renderMobileCard(item, 'stock'))
          ) : (
            renderDesktopTable(locationDetails.stock_items, 'stock')
          )}
        </Box>
      )}

      {/* Modal transferu */}
      <TransferModal
        open={transferModalOpen}
        onClose={() => setTransferModalOpen(false)}
        onSuccess={handleTransferSuccess}
        selectedAssets={selectedItems.assetIds}
        selectedStocks={selectedItems.stockIds}
        fromLocationId={Number(locationId)}
        locations={locations}
        stockItems={locationDetails?.stock_items || []}
      />
    </Container>
  );
};

export default LocationDetailsPage; 