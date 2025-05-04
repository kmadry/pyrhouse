import { Location } from '../models/Location';
import { getApiUrl } from '../config/api';

interface LocationDetailsResponse {
  pavilion: string | null;
  id: number;
  name: string;
  details: string | null;
  assets: any[];
  stock_items: any[];
}

export const getLocationDetails = async (locationId: number): Promise<LocationDetailsResponse> => {
  const token = localStorage.getItem('token');
  
  console.log('Pobieranie szczegółów lokalizacji:', getApiUrl(`/locations/${locationId}`));
  
  // Pobieranie szczegółów lokalizacji
  const locationResponse = await fetch(
    getApiUrl(`/locations/${locationId}`),
    {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    }
  );

  if (!locationResponse.ok) {
    console.error('Błąd podczas pobierania szczegółów lokalizacji:', locationResponse.status);
    throw new Error('Nie udało się pobrać danych lokalizacji');
  }

  const locationData = await locationResponse.json();
  console.log('Otrzymano dane lokalizacji:', locationData);
  
  // Pobieranie assetów lokalizacji
  console.log('Pobieranie assetów lokalizacji:', getApiUrl(`/locations/${locationId}/assets`));
  
  const assetsResponse = await fetch(
    getApiUrl(`/locations/${locationId}/assets`),
    {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    }
  );

  if (!assetsResponse.ok) {
    console.error('Błąd podczas pobierania assetów lokalizacji:', assetsResponse.status);
    throw new Error('Nie udało się pobrać assetów lokalizacji');
  }

  const assetsData = await assetsResponse.json();
  console.log('Otrzymano dane assetów:', assetsData);
  
  return {
    ...locationData,
    assets: assetsData.assets || [],
    stock_items: assetsData.stock_items || []
  };
};

export const deleteLocation = async (id: number): Promise<void> => {
  const token = localStorage.getItem('token');
  const response = await fetch(getApiUrl(`/locations/${id}`), {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    let errorMessage = 'Nie udało się usunąć lokalizacji';
    let errorDetails = '';
    let errorResponse;
    try {
      errorResponse = await response.json();
    } catch (e) {}
    if (response.status === 409) {
      errorMessage = 'Nie można usunąć lokalizacji, ponieważ jest powiązana z zasobami lub innymi danymi.';
      if (errorResponse?.details) {
        errorDetails = errorResponse.details;
      }
    } else if (response.status === 500) {
      errorMessage = 'Wystąpił błąd serwera podczas usuwania lokalizacji.';
    } else if (errorResponse?.error) {
      errorMessage = errorResponse.error;
    }
    throw { message: errorMessage, details: errorDetails };
  }
};

export const updateLocation = async (id: number, data: Partial<Location>): Promise<Location> => {
  const token = localStorage.getItem('token');
  
  // Przygotuj obiekt z tylko tymi polami, które zostały przekazane
  const updateData: Partial<Location> = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.details !== undefined) updateData.details = data.details;
  if (data.pavilion !== undefined) updateData.pavilion = data.pavilion;
  if (data.lat !== undefined) updateData.lat = data.lat;
  if (data.lng !== undefined) updateData.lng = data.lng;

  const response = await fetch(getApiUrl(`/locations/${id}`), {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(updateData),
  });
  
  if (!response.ok) {
    throw new Error('Nie udało się zaktualizować lokalizacji');
  }
  
  return response.json();
};

export const createLocation = async (data: Omit<Location, 'id'>): Promise<Location> => {
  const token = localStorage.getItem('token');
  const response = await fetch(getApiUrl('/locations'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error('Nie udało się utworzyć lokalizacji');
  }
  
  return response.json();
};

export interface DeliveryLocation {
  lat: number;
  lng: number;
  timestamp: string;
}

export interface MapPosition {
  lat: number;
  lng: number;
}

class LocationService {
  private readonly googleMapsApiKey: string;

  constructor() {
    this.googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  }

  async getCurrentPosition(): Promise<MapPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolokalizacja nie jest wspierana przez twoją przeglądarkę'));
        return;
      }

      // Dodajemy timeout, aby uniknąć zawieszenia
      const timeoutId = setTimeout(() => {
        reject(new Error('Przekroczono czas oczekiwania na lokalizację'));
      }, 10000); // 10 sekund timeout

      navigator.geolocation.getCurrentPosition(
        (position) => {
          clearTimeout(timeoutId);
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          clearTimeout(timeoutId);
          let errorMessage = 'Wystąpił błąd podczas pobierania lokalizacji';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Brak uprawnień do pobrania lokalizacji';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Informacja o lokalizacji jest niedostępna';
              break;
            case error.TIMEOUT:
              errorMessage = 'Przekroczono czas oczekiwania na lokalizację';
              break;
          }
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  }

  async updateTransferLocation(transferId: number, location: MapPosition): Promise<void> {
    const token = localStorage.getItem('token');
    const response = await fetch(getApiUrl(`/transfers/${transferId}/delivery-location`), {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        delivery_location: {
          ...location,
          timestamp: new Date().toISOString(),
        },
      }),
    });

    if (!response.ok) {
      throw new Error('Nie udało się zaktualizować lokalizacji transferu');
    }
  }

  getGoogleMapsApiKey(): string {
    return this.googleMapsApiKey;
  }
}

export const locationService = new LocationService(); 