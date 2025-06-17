import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, User } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles: User['role'][];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Indlæser...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on user role
    const defaultRoute = getDefaultRoute(user.role);
    return <Navigate to={defaultRoute} replace />;
  }

  return <>{children}</>;
}

function getDefaultRoute(role: string) {
  switch (role) {
    case 'admin': return '/admin';
    case 'company_owner': return '/virksomhedsejer';
    case 'employee': return '/medarbejder';
    default: return '/login';
  }
}