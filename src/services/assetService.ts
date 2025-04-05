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
    const response = await fetch(`${API_BASE}/assets/bulk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ assets }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Wystąpił błąd podczas dodawania zasobów');
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};
