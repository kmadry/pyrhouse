import { Location } from '../models/Location';
import { getApiUrl } from '../config/api';

interface LocationDetailsResponse {
  assets: any[];
  stock_items: any[];
}

export const getLocationDetails = async (locationId: number): Promise<LocationDetailsResponse> => {
  const token = localStorage.getItem('token');
  const response = await fetch(
    getApiUrl(`/locations/${locationId}/assets`),
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!response.ok) {
    throw new Error('Nie udało się pobrać danych lokalizacji');
  }

  return response.json();
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