import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { useStorage } from './useStorage';

interface JwtPayload {
  role: string;
  exp: number;
  userID: number;
}

// Stała określająca margines bezpieczeństwa w sekundach (5 minut)
const SAFETY_MARGIN = 5 * 60;

export const useAuth = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const { getToken, removeToken } = useStorage();

  const handleLogout = useCallback(() => {
    removeToken();
    setIsAuthenticated(false);
    setUserRole(null);
    setUserId(null);
    navigate('/login');
  }, [navigate, removeToken]);

  const checkToken = useCallback(() => {
    const token = getToken();
    if (!token) {
      handleLogout();
      return false;
    }

    try {
      const decodedToken = jwtDecode<JwtPayload>(token);
      const currentTime = Date.now() / 1000;

      // Dodajemy margines bezpieczeństwa - token jest uznawany za nieważny 5 minut przed faktycznym wygaśnięciem
      if (decodedToken.exp < currentTime + SAFETY_MARGIN) {
        handleLogout();
        return false;
      }

      setIsAuthenticated(true);
      setUserRole(decodedToken.role);
      setUserId(decodedToken.userID);
      return true;
    } catch (error) {
      console.error('Błąd dekodowania tokenu:', error);
      handleLogout();
      return false;
    }
  }, [handleLogout, getToken]);

  useEffect(() => {
    checkToken();
    const interval = setInterval(checkToken, 60000);
    return () => clearInterval(interval);
  }, [checkToken]);

  return {
    isAuthenticated,
    userRole,
    userId,
    checkToken,
    handleLogout
  };
}; 