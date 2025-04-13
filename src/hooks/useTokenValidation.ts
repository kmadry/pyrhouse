import { useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  role: string;
  exp: number;
  userID: number;
}

export const useTokenValidation = () => {
  const [isTokenValid, setIsTokenValid] = useState<boolean>(true);
  const [tokenExpiryTime, setTokenExpiryTime] = useState<number | null>(null);

  const validateToken = useCallback(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsTokenValid(false);
      setTokenExpiryTime(null);
      return false;
    }

    try {
      const decodedToken = jwtDecode<JwtPayload>(token);
      const currentTime = Date.now() / 1000;
      const isValid = decodedToken.exp > currentTime;
      
      setIsTokenValid(isValid);
      setTokenExpiryTime(decodedToken.exp);
      
      return isValid;
    } catch (error) {
      console.error('Błąd walidacji tokenu:', error);
      setIsTokenValid(false);
      setTokenExpiryTime(null);
      return false;
    }
  }, []);

  useEffect(() => {
    validateToken();
    const interval = setInterval(validateToken, 30000); // Sprawdzaj co 30 sekund
    return () => clearInterval(interval);
  }, [validateToken]);

  return {
    isTokenValid,
    tokenExpiryTime,
    validateToken
  };
}; 