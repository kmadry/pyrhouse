import { getApiUrl } from '../config/api';
import { API_BASE_URL } from '../config/api';
import { MapPosition } from './locationService';

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
    try {
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
        const errorCode = response.status;
        let errorMessage = errorResponse.error || 'Failed to create transfer';
  
        if (errorResponse.code === 'same_location') {
          errorMessage = 'Transfer from and to location cannot be the same';
        } else {
          switch (errorCode) {
            case 400:
              errorMessage = errorResponse.error || 'Invalid transfer data';
              break;
            case 401:
              errorMessage = 'Unauthorized access';
              break;
            case 403:
              errorMessage = 'Access forbidden';
              break;
            case 404:
              errorMessage = 'Resource not found';
              break;
            case 422:
              errorMessage = errorResponse.error || 'Invalid transfer data';
              break;
            case 500:
              errorMessage = 'Server error occurred';
              break;
            default:
              errorMessage = 'An unexpected error occurred';
          }
        }
  
        throw new Error(errorMessage);
      }
  
      return response.json();
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
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
  
  export const updateTransferLocationAPI = async (transferId: number, location: MapPosition) => {
    // Mock odpowiedzi z API
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: transferId,
          delivery_location: {
            ...location,
            timestamp: new Date().toISOString()
          },
          status: 'success',
          message: 'Lokalizacja dostawy została zaktualizowana'
        });
      }, 500); // Symulacja opóźnienia sieci
    });
  };
  