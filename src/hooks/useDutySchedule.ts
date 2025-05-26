import { useState, useEffect } from 'react';
import { getApiUrl } from '../config/api';

export interface DutyScheduleData {
  headers: string[];
  rows: string[][];
  uniquePeople: string[];
}

export function useDutySchedule() {
  const [data, setData] = useState<DutyScheduleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(getApiUrl('/sheets/duty-schedule'), {
          headers: { Authorization: token ? `Bearer ${token}` : '' }
        });
        
        if (!res.ok) throw new Error('Błąd pobierania grafiku');
        
        const json = await res.json();
        
        // Przetwarzanie danych
        const headers = json[0];
        const rows = json.slice(1);
        
        // Zbieranie unikalnych osób
        const people = new Set<string>();
        rows.forEach((row: string[]) => {
          row.slice(2).forEach((cell: string) => {
            if (cell && cell.trim()) {
              people.add(cell.trim());
            }
          });
        });

        setData({
          headers,
          rows,
          uniquePeople: Array.from(people).sort()
        });
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  return { data, loading, error };
} 