import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '../../contexts/AdminAuthContext';

interface RequireAdminPermissionProps {
  permission: string;
  children: React.ReactNode;
}

export default function RequireAdminPermission({ permission, children }: RequireAdminPermissionProps) {
  const { hasPermission, getDefaultRoute } = useAdminAuth();

  if (!hasPermission(permission)) {
    return <Navigate to={getDefaultRoute()} replace />;
  }

  return <>{children}</>;
}
