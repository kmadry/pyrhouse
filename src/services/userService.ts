import { getApiUrl } from '../config/api';

export const getUsersAPI = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch(getApiUrl('/users'), {
    headers: { Authorization: `Bearer ${token}` },
  });
  
  if (!response.ok) {
    throw new Error('Nie udało się pobrać listy użytkowników');
  }
  
  return response.json();
}; 