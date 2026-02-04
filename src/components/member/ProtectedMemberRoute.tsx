import { Navigate } from 'react-router-dom';
import { useMemberAuth } from '../../contexts/MemberAuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedMemberRouteProps {
  children: React.ReactNode;
}

export default function ProtectedMemberRoute({ children }: ProtectedMemberRouteProps) {
  const { user, loading } = useMemberAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/member/login" replace />;
  }

  return <>{children}</>;
}
