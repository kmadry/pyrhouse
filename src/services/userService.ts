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

export const addUserPointsAPI = async (userId: number, points: number) => {
  const token = localStorage.getItem('token');
  const response = await fetch(getApiUrl(`/users/${userId}/points`), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ points }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Nie udało się zaktualizować punktów użytkownika');
  }

  return response.json();
}; 