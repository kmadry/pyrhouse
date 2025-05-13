import { useState, useCallback } from 'react';
import { getApiUrl } from '../config/api';

export interface ServiceDeskComment {
  id: number;
  content: string;
  user_id: number;
  created_at: string;
  user?: { id: number; username: string };
}

export const useServiceDeskComments = (requestId: string | number | undefined) => {
  const [comments, setComments] = useState<ServiceDeskComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  const fetchComments = useCallback(async () => {
    if (!requestId) return;
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(getApiUrl(`/service-desk/requests/${requestId}/comments`), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Błąd pobierania komentarzy');
      const data = await res.json();
      setComments(Array.isArray(data) ? data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) : []);
    } catch (e: any) {
      setError(e.message || 'Błąd pobierania komentarzy');
    } finally {
      setLoading(false);
    }
  }, [requestId]);

  const addComment = useCallback(async (content: string) => {
    if (!requestId) return;
    setAdding(true);
    setAddError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(getApiUrl(`/service-desk/requests/${requestId}/comments`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error('Błąd dodawania komentarza');
      // Optymistycznie: fetchujemy całą listę po dodaniu
      await fetchComments();
    } catch (e: any) {
      setAddError(e.message || 'Błąd dodawania komentarza');
    } finally {
      setAdding(false);
    }
  }, [requestId, fetchComments]);

  return {
    comments,
    loading,
    error,
    addComment,
    adding,
    addError,
    refreshComments: fetchComments,
  };
}; 