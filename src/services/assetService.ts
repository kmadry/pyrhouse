const API_BASE = 'https://pyrhouse-backend-f26ml.ondigitalocean.app/api';

export const fetchAssetByPyrCode = async (pyrCode: string) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE}/assets/pyrcode/${pyrCode}`, {
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
    
    const response = await fetch('https://pyrhouse-backend-f26ml.ondigitalocean.app/api/assets/bulk', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Wystąpił błąd podczas dodawania zasobów');
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};
