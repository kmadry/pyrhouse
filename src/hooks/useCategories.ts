import { useState, useEffect } from 'react';
import { getApiUrl } from '../config/api';

// Define types for category and add category payload
interface Category {
  id: number;
  name?: string;
  label: string;
  type: 'asset' | 'stock';
  pyr_id?: string;
}

interface AddCategoryPayload {
  label: string;
  type: 'asset' | 'stock';
  name?: string;
  pyr_id?: string;
}

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getApiUrl('/assets/categories'), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async (category: Omit<Category, 'id'>) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getApiUrl('/assets/categories'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(category),
      });
      if (!response.ok) throw new Error('Failed to create category');
      const data = await response.json();
      setCategories(prev => [...prev, data]);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  };

  const updateCategory = async (id: number, category: Partial<Category>) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getApiUrl(`/assets/categories/${id}`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(category),
      });
      if (!response.ok) throw new Error('Failed to update category');
      const data = await response.json();
      setCategories(prev => prev.map(cat => cat.id === id ? data : cat));
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const addCategory = async (payload: AddCategoryPayload) => {
    setLoading(true);
    setError(null); // Clear previous errors
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        getApiUrl('/assets/categories'),
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
        throw new Error(errorResponse.error || 'Failed to add category');
      }

      const newCategory: Category = await response.json();
      setCategories((prev) => [...prev, newCategory]);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (id: number) => {
    setLoading(true);
    setError(null); // Clear previous errors
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        getApiUrl(`/assets/categories/${id}`),
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete category');
      }

      setCategories((prev) => prev.filter((category) => category.id !== id));
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return { categories, loading, error, addCategory, deleteCategory, createCategory, updateCategory, refreshCategories: fetchCategories };
};
