import { getApiUrl } from '../config/api';
import { API_BASE_URL } from '../config/api';

const API_TIMEOUT = Number(import.meta.env.VITE_API_TIMEOUT) || 30000;

export const validatePyrCodeAPI = async (pyrCode: string) => {
    const token = localStorage.getItem('token');
    const response = await fetch(getApiUrl(`/assets/pyrcode/${pyrCode}`), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  
    if (!response.ok) {
      throw new Error('Failed to validate Pyr Code');
    }
  
    return response.json(); // Return the parsed JSON response
  };
  
  export const createTransferAPI = async (payload: any): Promise<any> => {
    const token = localStorage.getItem('token');
    const response = await fetch(
      getApiUrl('/transfers'),
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      }
    );
  
    if (!response.ok) {
      const errorResponse = await response.json();
      throw new Error(errorResponse.error || 'Failed to create transfer');
    }
  
    return response.json();
  };
  
  export const getTransferDetailsAPI = async (transferId: number) => {
    const token = localStorage.getItem('token');
    const response = await fetch(
      getApiUrl(`/transfers/${transferId}`),
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    if (!response.ok) throw new Error('Failed to fetch transfer details');
    return response.json();
  };
  
  export const confirmTransferAPI = async (id: number, payload: { status: string }) => {
    const token = localStorage.getItem('token');
    const response = await fetch(
      getApiUrl(`/transfers/${id}/confirm`),
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      }
    );
  
    if (!response.ok) {
      const errorResponse = await response.json();
      throw new Error(errorResponse.message || 'Failed to confirm transfer');
    }
  
    return response.json();
  };
  
  export const searchPyrCodesAPI = async (query: string, locationId: number) => {
    const token = localStorage.getItem('token');
    const response = await fetch(
      getApiUrl(`/locations/${locationId}/search?q=${encodeURIComponent(query)}`),
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  
    if (!response.ok) {
      throw new Error('Nie udało się wyszukać kodów PYR');
    }
  
    return response.json();
  };
  
  export const restoreAssetToLocationAPI = async (transferId: number, assetId: number, locationId: number = 1) => {
    const token = localStorage.getItem('token');
    const response = await fetch(
      getApiUrl(`/transfers/${transferId}/assets/${assetId}/restore-to-location`),
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ location_id: locationId }),
      }
    );
    if (!response.ok) throw new Error('Nie udało się przywrócić zasobu do lokalizacji');
    return response.json();
  };
  
  export const restoreStockToLocationAPI = async (transferId: number, categoryId: number, locationId: number = 1, quantity?: number) => {
    const token = localStorage.getItem('token');
    const response = await fetch(
      getApiUrl(`/transfers/${transferId}/categories/${categoryId}/restore-to-location`),
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          location_id: locationId,
          ...(quantity !== undefined && { quantity })
        }),
      }
    );
    if (!response.ok) throw new Error('Nie udało się przywrócić pozycji magazynowej do lokalizacji');
    return response.json();
  };
  
  export const cancelTransferAPI = async (transferId: string): Promise<void> => {
    try {
      const token = localStorage.getItem('token');
      const controller = new AbortController();
      const fetchOptions: RequestInit = {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        signal: controller.signal,
      };

      if (API_TIMEOUT > 0) {
        setTimeout(() => controller.abort(), API_TIMEOUT);
      }

      const response = await fetch(`${API_BASE_URL}/transfers/${transferId}/cancel`, fetchOptions);

      if (!response.ok) {
        throw new Error('Failed to cancel transfer');
      }
    } catch (error) {
      console.error('Error canceling transfer:', error);
      throw error;
    }
  };
  