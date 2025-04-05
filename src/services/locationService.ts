import { Location } from '../models/Location';

const API_URL = import.meta.env.VITE_API_URL;

interface LocationDetailsResponse {
  assets: any[];
  stock_items: any[];
}

export const getLocationDetails = async (locationId: number): Promise<LocationDetailsResponse> => {
  const token = localStorage.getItem('token');
  const response = await fetch(
    `${API_URL}/locations/${locationId}/assets`,
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
  const response = await fetch(`${API_URL}/locations/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error('Nie udało się usunąć lokalizacji');
  }
};

export const updateLocation = async (id: number, data: Partial<Location>): Promise<Location> => {
  const response = await fetch(`${API_URL}/locations/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error('Nie udało się zaktualizować lokalizacji');
  }
  
  return response.json();
};

export const createLocation = async (data: Omit<Location, 'id'>): Promise<Location> => {
  const response = await fetch(`${API_URL}/locations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error('Nie udało się utworzyć lokalizacji');
  }
  
  return response.json();
}; 