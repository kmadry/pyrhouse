import { useState, useEffect } from 'react';

export const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('https://pyrhouse-backend-f26ml.ondigitalocean.app/api/assets/categories', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error('Failed to fetch categories');

        const data = await response.json();
        setCategories(data);
      } catch (err) {
        setError('Failed to load categories');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, error, loading };
};
