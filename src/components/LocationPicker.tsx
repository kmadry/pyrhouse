import React, { useCallback, useEffect, useState } from 'react';
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import { GoogleMap, useJsApiLoader, Libraries } from '@react-google-maps/api';
import { MapPosition, locationService } from '../services/locationService';
import { MyLocation, Save } from '@mui/icons-material';

interface LocationPickerProps {
  onLocationSelect: (location: MapPosition) => void;
  initialLocation?: MapPosition;
  onSave?: () => void;
}

const defaultCenter = {
  lat: 52.0,  // Bardziej ogólne centrum Polski
  lng: 19.0
};

const mapContainerStyle = {
  width: '100%',
  height: '400px'
};

const libraries: Libraries = ['places'];

const LocationPicker: React.FC<LocationPickerProps> = ({ onLocationSelect, initialLocation, onSave }) => {
  const [selectedLocation, setSelectedLocation] = useState<MapPosition | null>(initialLocation || null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [mapLoadError, setMapLoadError] = useState<boolean>(false);
  const [isInitialLocationLoaded, setIsInitialLocationLoaded] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: locationService.getGoogleMapsApiKey(),
    libraries,
    version: 'weekly',
    language: 'pl',
    region: 'PL',
    mapIds: [],
    authReferrerPolicy: 'origin'
  });

  useEffect(() => {
    if (loadError) {
      console.error('Błąd ładowania Google Maps:', loadError);
      setMapLoadError(true);
    }
  }, [loadError]);

  // Automatycznie pobierz lokalizację użytkownika po załadowaniu mapy
  useEffect(() => {
    if (isLoaded && map && !isInitialLocationLoaded && !initialLocation) {
      handleGetCurrentLocation();
    }
  }, [isLoaded, map, isInitialLocationLoaded, initialLocation]);

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  useEffect(() => {
    if (map && selectedLocation) {
      // Usuń wszystkie markery z mapy
      map.data.forEach((feature) => {
        map.data.remove(feature);
      });

      // Dodaj nowy marker
      map.data.add({
        geometry: new google.maps.Data.Point(
          new google.maps.LatLng(selectedLocation.lat, selectedLocation.lng)
        )
      });

      // Ustaw styl markera
      map.data.setStyle({
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#1976d2',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        }
      });
    }
  }, [map, selectedLocation]);

  const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const newLocation = {
        lat: e.latLng.lat(),
        lng: e.latLng.lng()
      };
      setSelectedLocation(newLocation);
      onLocationSelect(newLocation);
    }
  }, [onLocationSelect]);

  const handleGetCurrentLocation = async () => {
    try {
      setIsLoadingLocation(true);
      setError(null);
      setLocationError(null);
      const position = await locationService.getCurrentPosition();
      setSelectedLocation(position);
      setIsInitialLocationLoaded(true);
      
      // Wycentruj mapę na nowej lokalizacji
      if (map) {
        map.panTo(position);
        map.setZoom(15);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Wystąpił błąd podczas pobierania lokalizacji';
      setError(errorMessage);
      setLocationError(errorMessage);
      console.error('Błąd podczas pobierania lokalizacji:', err);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const handleSaveLocation = () => {
    if (selectedLocation) {
      onLocationSelect(selectedLocation);
      if (onSave) {
        onSave();
      }
    }
  };

  if (!isLoaded || mapLoadError) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 4, gap: 2 }}>
        <CircularProgress />
        <Typography variant="body1" color="text.secondary">
          {mapLoadError ? 'Nie udało się załadować mapy. Użyj przycisku poniżej, aby pobrać lokalizację.' : 'Ładowanie mapy...'}
        </Typography>
        <Button
          variant="outlined"
          color="primary"
          onClick={handleGetCurrentLocation}
          disabled={isLoadingLocation}
          startIcon={isLoadingLocation ? <CircularProgress size={20} /> : <MyLocation />}
        >
          Użyj mojej lokalizacji bez mapy
        </Button>
        {error && (
          <Box sx={{ color: 'error.main', mt: 1 }}>
            {error}
          </Box>
        )}
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ position: 'relative', mb: 2 }}>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={selectedLocation || defaultCenter}
          zoom={13}
          onClick={handleMapClick}
          onLoad={onLoad}
          onUnmount={onUnmount}
          options={{
            mapId: 'pyrhouse-map',
            disableDefaultUI: false,
            zoomControl: true,
            streetViewControl: false
          }}
        />
        {isLoadingLocation && (
          <Box 
            sx={{ 
              position: 'absolute', 
              top: '50%', 
              left: '50%', 
              transform: 'translate(-50%, -50%)',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              padding: '10px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <CircularProgress size={20} />
            <Typography variant="body2">Pobieranie lokalizacji...</Typography>
          </Box>
        )}
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Button
          variant="outlined"
          color="primary"
          onClick={handleGetCurrentLocation}
          disabled={isLoadingLocation}
          startIcon={isLoadingLocation ? <CircularProgress size={20} /> : <MyLocation />}
        >
          Użyj mojej lokalizacji
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSaveLocation}
          disabled={!selectedLocation || isLoadingLocation}
          startIcon={<Save />}
        >
          Zapisz lokalizację
        </Button>
      </Box>
      {error && (
        <Box sx={{ color: 'error.main', mt: 1 }}>
          {error}
        </Box>
      )}
      {locationError && (
        <Box sx={{ color: 'error.main', mt: 1 }}>
          {locationError}
        </Box>
      )}
    </Box>
  );
};

export default LocationPicker; 