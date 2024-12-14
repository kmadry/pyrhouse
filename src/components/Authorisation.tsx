import React from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode }  from 'jwt-decode';

interface JwtPayload {
  role: string;
  exp: number;
  userID: number;
}

interface PrivateRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

const rolesHierarchy: { [key: string]: number } = {
  user: 1,
  moderator: 2,
  admin: 3,
};

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, requiredRole }) => {
  let token = null;
  if (typeof localStorage !== 'undefined') {
    token = localStorage.getItem('token');
  } else {
    console.error('Token not found in localStorage.');
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    const decodedToken = jwtDecode<JwtPayload>(token);

    if (
      requiredRole &&
      rolesHierarchy[decodedToken.role] < rolesHierarchy[requiredRole]
    ) {
      console.warn(`Access denied. Role "${decodedToken.role}" lacks permission.`);
      return <Navigate to="/login" replace />;
    }
  } catch (error) {
    console.error('Invalid token:', error);
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default PrivateRoute;
