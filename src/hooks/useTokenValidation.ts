import { useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useStorage } from './useStorage';

interface JwtPayload {
  role: string;
  exp: number;
  userID: number;
}

// Stała określająca margines bezpieczeństwa w sekundach (5 minut)
const SAFETY_MARGIN = 5 * 60;

export const useTokenValidation = () => {
  const [isTokenValid, setIsTokenValid] = useState<boolean>(true);
  const [tokenExpiryTime, setTokenExpiryTime] = useState<number | null>(null);
  const { getToken } = useStorage();

  const validateToken = useCallback(() => {
    const token = getToken();
    if (!token) {
      setIsTokenValid(false);
      setTokenExpiryTime(null);
      return false;
    }

    try {
      const decodedToken = jwtDecode<JwtPayload>(token);
      const currentTime = Date.now() / 1000;
      // Dodajemy margines bezpieczeństwa - token jest uznawany za nieważny 5 minut przed faktycznym wygaśnięciem
      const isValid = decodedToken.exp > currentTime + SAFETY_MARGIN;
      
      setIsTokenValid(isValid);
      setTokenExpiryTime(decodedToken.exp);
      
      return isValid;
    } catch (error) {
      console.error('Błąd walidacji tokenu:', error);
      setIsTokenValid(false);
      setTokenExpiryTime(null);
      return false;
    }
  }, [getToken]);

  useEffect(() => {
    validateToken();
    // Ujednolicamy interwał sprawdzania na 60 sekund (tak jak w useAuth)
    const interval = setInterval(validateToken, 60000);
    return () => clearInterval(interval);
  }, [validateToken]);

  return {
    isTokenValid,
    tokenExpiryTime,
    validateToken
  };
}; 