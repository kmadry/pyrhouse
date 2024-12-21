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
