import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTokenValidation } from '../hooks/useTokenValidation';
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  role: string;
  userID: number;
}

interface PrivateRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, requiredRole }) => {
  const navigate = useNavigate();
  const { isTokenValid } = useTokenValidation();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token || !isTokenValid) {
      navigate('/login');
      return;
    }

    const decodedToken = jwtDecode<JwtPayload>(token);
    const userRole = decodedToken.role;

    // Sprawdź, czy użytkownik ma wymagane uprawnienia
    const rolesHierarchy = {
      'admin': 3,
      'moderator': 2,
      'user': 1
    };

    if (rolesHierarchy[userRole as keyof typeof rolesHierarchy] < rolesHierarchy[requiredRole as keyof typeof rolesHierarchy]) {
      navigate('/home');
    }
  }, [token, isTokenValid, navigate, requiredRole]);

  if (!token || !isTokenValid) {
    return null;
  }

  return <>{children}</>;
};

export default PrivateRoute;
