import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import type { UserRole } from '~/data/types';
import { useAuthContext } from '~/contexts/auth-context';

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** If provided, only users with these roles can access the route. */
  allowedRoles?: UserRole[];
}

/**
 * Redirects to /login if not authenticated.
 * Redirects to / if the user's role is not in allowedRoles.
 */
export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, currentUser } = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
      return;
    }
    if (allowedRoles && currentUser && !allowedRoles.includes(currentUser.role)) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, currentUser, allowedRoles, navigate]);

  if (!isAuthenticated) return null;
  if (allowedRoles && currentUser && !allowedRoles.includes(currentUser.role)) return null;

  return <>{children}</>;
}
