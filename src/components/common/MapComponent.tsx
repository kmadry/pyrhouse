import React from 'react';
import { Box, IconButton, Tooltip, Alert } from '@mui/material';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import { APIProvider, Map, AdvancedMarker, Pin } from "@vis.gl/react-google-maps";
import { locationService } from '../../services/locationService';

interface MapComponentProps {
  transfer: any;
  userLocation: { lat: number; lng: number } | null;
  onLocationUpdate?: (location: { lat: number; lng: number }) => void;
  locationError?: string | null;
  showLocationAlert?: boolean;
  onGetUserLocation?: () => void;
}

const MapComponent: React.FC<MapComponentProps> = ({
  transfer,
  userLocation,
  locationError,
  showLocationAlert,
  onGetUserLocation
}) => {
  if (!transfer?.delivery_location?.lat || !transfer?.delivery_location?.lng) {
    console.warn('Brak danych o lokalizacji:', transfer?.delivery_location);
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        Brak danych o lokalizacji
      </Alert>
    );
  }

  const mapLocation = {
    lat: transfer.delivery_location.lat,
    lng: transfer.delivery_location.lng
  };

  return (
    <Box 
      sx={{ 
        height: '300px', 
        width: '100%', 
        borderRadius: 2,
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'divider',
        position: 'relative'
      }}
      id="map-container"
    >
      <Box
        sx={{
          position: 'absolute',
          top: 10,
          right: 10,
          zIndex: 1,
          display: 'flex',
          gap: 1
        }}
      >
        <Tooltip title="Pokaż moją lokalizację">
          <IconButton
            onClick={onGetUserLocation}
            sx={{
              backgroundColor: 'white',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
              }
            }}
          >
            <GpsFixedIcon />
          </IconButton>
        </Tooltip>
      </Box>
      <APIProvider apiKey={locationService.getGoogleMapsApiKey()}>
        <Map
          defaultCenter={mapLocation}
          defaultZoom={17}
          mapId="pyrhouse-map"
          gestureHandling={'greedy'}
          disableDefaultUI={false}
        >
          <AdvancedMarker position={mapLocation}>
            <Pin
              background={'#1976d2'}
              borderColor={'#1565c0'}
              glyphColor={'#ffffff'}
            />
          </AdvancedMarker>
          {userLocation && (
            <AdvancedMarker position={userLocation}>
              <Pin
                background={'#4caf50'}
                borderColor={'#388e3c'}
                glyphColor={'#ffffff'}
              />
            </AdvancedMarker>
          )}
        </Map>
      </APIProvider>
      {locationError && (
        <Alert 
          severity="error" 
          sx={{ 
            position: 'absolute',
            bottom: 10,
            left: 10,
            right: 10,
            zIndex: 1
          }}
        >
          {locationError}
        </Alert>
      )}
      {userLocation && showLocationAlert && (
        <Alert 
          severity="success" 
          sx={{ 
            position: 'absolute',
            bottom: locationError ? 60 : 10,
            left: 10,
            right: 10,
            zIndex: 1
          }}
        >
          Twoja lokalizacja została oznaczona na mapie (zielony marker)
        </Alert>
      )}
    </Box>
  );
};

export default MapComponent; 