export const validatePyrCodeAPI = async (pyrCode: string) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`https://pyrhouse-backend-f26ml.ondigitalocean.app/api/assets/pyrcode/${pyrCode}`, {
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
      'https://pyrhouse-backend-f26ml.ondigitalocean.app/api/transfers',
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
      `https://pyrhouse-backend-f26ml.ondigitalocean.app/api/transfers/${transferId}`,
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
      `https://pyrhouse-backend-f26ml.ondigitalocean.app/api/transfers/${id}/confirm`,
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
      `https://pyrhouse-backend-f26ml.ondigitalocean.app/api/locations/${locationId}/search?q=${encodeURIComponent(query)}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  
    if (!response.ok) {
      throw new Error('Nie udało się wyszukać kodów PYR');
    }
  
    return response.json();
  };  
  