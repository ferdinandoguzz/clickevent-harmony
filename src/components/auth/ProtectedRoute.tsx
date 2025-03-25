
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { Loader } from 'lucide-react';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
  children?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  allowedRoles = ['superadmin', 'admin', 'staff'],
  children
}) => {
  const { isAuthenticated, isLoading, role } = useAuth();
  const location = useLocation();

  console.log("Protected Route - Current role:", role, "Allowed roles:", allowedRoles);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader className="w-10 h-10 text-primary animate-spin" />
          <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Check role permissions
  if (role && allowedRoles.includes(role)) {
    console.log("Access granted for role:", role);
    return children ? <>{children}</> : <Outlet />;
  }

  // Redirect to unauthorized page if role is not allowed
  console.log("Access denied for role:", role);
  return <Navigate to="/unauthorized" replace />;
};

export default ProtectedRoute;
