import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  role: string;
  exp: number;
  userID: number;
}

export const useAuth = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUserRole(null);
    setUserId(null);
    navigate('/login');
  }, [navigate]);

  const checkToken = useCallback(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      handleLogout();
      return false;
    }

    try {
      const decodedToken = jwtDecode<JwtPayload>(token);
      const currentTime = Date.now() / 1000;

      if (decodedToken.exp < currentTime) {
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
  }, [handleLogout]);

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