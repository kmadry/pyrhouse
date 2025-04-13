import { Location } from '../models/Location';
import { getApiUrl } from '../config/api';

interface LocationDetailsResponse {
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
    throw new Error('Nie udało się usunąć lokalizacji');
  }
};

export const updateLocation = async (id: number, data: Partial<Location>): Promise<Location> => {
  const token = localStorage.getItem('token');
  const response = await fetch(getApiUrl(`/locations/${id}`), {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
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