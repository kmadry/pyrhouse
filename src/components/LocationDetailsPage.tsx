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
  Alert,
  Chip,
  Checkbox,
  Button,
  Divider,
} from '@mui/material';
import { useParams } from 'react-router-dom';
import { ErrorMessage } from './ErrorMessage';
import { useLocations } from '../hooks/useLocations';

interface Asset {
  id: number;
  serial: string;
  location: Record<string, any>;
  category: {
    id: number;
    type: string;
    label: string;
    pyr_id: string;
  };
  status: 'in_stock' | 'in_transit';
  pyrcode: string;
  accessories: null | any[];
}

interface StockItem {
  id: number;
  category: {
    id: number;
    type: string;
    label: string;
    pyr_id: string;
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

  useEffect(() => {
    const fetchLocationDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${import.meta.env.VITE_API_URL}/locations/${locationId}/assets`);
        if (!response.ok) {
          throw new Error('Nie udało się pobrać danych lokalizacji');
        }
        const data = await response.json();
        setLocationDetails(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (locationId) {
      fetchLocationDetails();
    }
  }, [locationId]);

  const location = locations.find(loc => loc.id === Number(locationId));

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
        <ErrorMessage message="Błąd podczas ładowania danych" details={error} />
      </Container>
    );
  }

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        {location?.name || 'Szczegóły lokalizacji'}
      </Typography>

      {(selectedItems.assetIds.length > 0 || selectedItems.stockIds.length > 0) && (
        <Box sx={{ mb: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
          <Typography variant="subtitle1" gutterBottom>
            Zaznaczone elementy:
          </Typography>
          {selectedItems.assetIds.length > 0 && (
            <Typography variant="body2">
              Sprzęt: {selectedItems.assetIds.join(', ')}
            </Typography>
          )}
          {selectedItems.stockIds.length > 0 && (
            <Typography variant="body2">
              Zasoby: {selectedItems.stockIds.join(', ')}
            </Typography>
          )}
        </Box>
      )}

      {locationDetails?.assets && locationDetails.assets.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            Sprzęt
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={locationDetails.assets.length > 0 && selectedItems.assetIds.length === locationDetails.assets.length}
                      indeterminate={selectedItems.assetIds.length > 0 && selectedItems.assetIds.length < locationDetails.assets.length}
                      onChange={handleSelectAllAssets}
                    />
                  </TableCell>
                  <TableCell>ID</TableCell>
                  <TableCell>Numer seryjny</TableCell>
                  <TableCell>Kategoria</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Kod PYR</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {locationDetails.assets.map((asset) => (
                  <TableRow key={asset.id}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedItems.assetIds.includes(asset.id)}
                        onChange={() => handleSelectAsset(asset.id)}
                      />
                    </TableCell>
                    <TableCell>{asset.id}</TableCell>
                    <TableCell>{asset.serial}</TableCell>
                    <TableCell>{asset.category.label}</TableCell>
                    <TableCell>
                      <Chip
                        label={asset.status === 'in_stock' ? 'Dostępny' : 'W transporcie'}
                        color={asset.status === 'in_stock' ? 'success' : 'warning'}
                      />
                    </TableCell>
                    <TableCell>{asset.pyrcode || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {locationDetails?.stock_items && locationDetails.stock_items.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            Zasoby
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={locationDetails.stock_items.length > 0 && selectedItems.stockIds.length === locationDetails.stock_items.length}
                      indeterminate={selectedItems.stockIds.length > 0 && selectedItems.stockIds.length < locationDetails.stock_items.length}
                      onChange={handleSelectAllStocks}
                    />
                  </TableCell>
                  <TableCell>ID</TableCell>
                  <TableCell>Kategoria</TableCell>
                  <TableCell>Ilość</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {locationDetails.stock_items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedItems.stockIds.includes(item.id)}
                        onChange={() => handleSelectStock(item.id)}
                      />
                    </TableCell>
                    <TableCell>{item.id}</TableCell>
                    <TableCell>{item.category.label}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {(!locationDetails?.assets || locationDetails.assets.length === 0) &&
        (!locationDetails?.stock_items || locationDetails.stock_items.length === 0) && (
          <Alert severity="info" sx={{ mt: 2 }}>
            Brak przedmiotów w tej lokalizacji
          </Alert>
        )}
    </Container>
  );
};

export default LocationDetailsPage; 