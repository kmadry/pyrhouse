export interface Location {
  id: number;
  name: string;
  lat: number;
  lng: number;
  pavilion: string | null;
  details?: string | null;
} 