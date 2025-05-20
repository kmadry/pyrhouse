import { getApiUrl } from '../config/api';

export const fetchAssetByPyrCode = async (pyrCode: string) => {
  const token = localStorage.getItem('token');
  const response = await fetch(getApiUrl(`/assets/pyrcode/${pyrCode}`), {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const errorResponse = await response.json();
    throw new Error(errorResponse.error || 'Asset validation failed.');
  }

  return response.json();
};

interface BulkAddAssetRequest {
  serial: string;
  category_id: number;
  origin: string;
}

export const bulkAddAssetsAPI = async (assets: BulkAddAssetRequest[]): Promise<any> => {
  try {
    const token = localStorage.getItem('token');
    
    // Przygotowanie danych w prawidłowym formacie
    const payload = {
      serials: assets.map(asset => asset.serial),
      category_id: assets[0].category_id,
      origin: assets[0].origin
    };
    
    const response = await fetch(getApiUrl('/assets/bulk'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      if (error.errors) {
        throw error;
      }
      throw new Error(error.message || 'Wystąpił błąd podczas dodawania zasobów');
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const deleteAsset = async (assetId: number): Promise<boolean> => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(getApiUrl(`/assets/${assetId}`), {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Wystąpił błąd podczas usuwania zasobu');
    }

    return response.status === 200;
  } catch (error) {
    throw error;
  }
};

export const getAssetsAPI = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch(getApiUrl('/assets'), {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Failed to fetch assets');
  return response.json();
};

export const createAssetAPI = async (payload: any) => {
  const token = localStorage.getItem('token');
  const response = await fetch(getApiUrl('/assets'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error('Failed to create asset');
  return response.json();
};

export const createBulkAssetsAPI = async (payload: any) => {
  const token = localStorage.getItem('token');
  const response = await fetch(getApiUrl('/assets/bulk'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error('Failed to create bulk assets');
  return response.json();
};

export const addAssetsWithoutSerialAPI = async (payload: {
  quantity: number;
  category_id: number;
  origin: string;
}) => {
  const token = localStorage.getItem('token');
  const response = await fetch(getApiUrl('/assets/without-serial'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Nie udało się dodać sprzętu bez numeru seryjnego');
  }
  return response.json();
};
