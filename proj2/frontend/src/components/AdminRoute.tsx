import { Navigate } from 'react-router';
import { useEffect, useState } from 'react';
import { getAuthToken, getCurrentUser, isAdmin as checkIsAdmin } from '@/lib/api';

interface AdminRouteProps {
  children: React.ReactNode;
}

/**
 * Protected route component that only allows admin users
 * Verifies both client-side role and validates with backend
 */
export default function AdminRoute({ children }: AdminRouteProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        // First check if user is logged in
        const token = getAuthToken();
        if (!token) {
          setIsAuthorized(false);
          setIsLoading(false);
          return;
        }

        // Quick client-side check
        if (!checkIsAdmin()) {
          setIsAuthorized(false);
          setIsLoading(false);
          return;
        }

        // Verify with backend to ensure role hasn't changed
        const user = await getCurrentUser();
        setIsAuthorized(user.role === 'admin');
      } catch (error) {
        console.error('Admin access check failed:', error);
        setIsAuthorized(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminAccess();
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block size-12 animate-spin rounded-full border-4 border-solid border-gray-300 border-t-blue-600"></div>
          <p className="text-gray-600">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
