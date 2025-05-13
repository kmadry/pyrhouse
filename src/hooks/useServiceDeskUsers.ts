import { useState, useEffect } from 'react';
import { getUsersAPI } from '../services/userService';

export const useServiceDeskUsers = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const data = await getUsersAPI();
        setUsers(data);
      } catch (e: any) {
        setError(e.message || 'Błąd pobierania użytkowników');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  return { users, loading, error };
}; 