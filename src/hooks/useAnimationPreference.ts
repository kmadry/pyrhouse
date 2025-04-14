import { useState, useEffect } from 'react';
import { useStorage } from './useStorage';

export const useAnimationPreference = () => {
  const { getItem, setItem } = useStorage();
  
  // Sprawdź preferencje systemowe
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  const [prefersAnimations, setPrefersAnimations] = useState<boolean>(() => {
    // Jeśli użytkownik ma włączoną redukcję ruchu w systemie, domyślnie wyłącz animacje
    if (prefersReducedMotion) {
      return false;
    }
    
    // W przeciwnym razie sprawdź zapisane preferencje
    const stored = getItem('prefersAnimations');
    return stored ? JSON.parse(stored) : true; // Domyślnie włączone
  });

  // Nasłuchuj zmian preferencji systemowych
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        setPrefersAnimations(false);
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  useEffect(() => {
    setItem('prefersAnimations', JSON.stringify(prefersAnimations));
  }, [prefersAnimations, setItem]);

  const toggleAnimations = () => {
    setPrefersAnimations(prev => !prev);
  };

  return {
    prefersAnimations,
    toggleAnimations,
    isSystemReducedMotion: prefersReducedMotion
  };
}; 