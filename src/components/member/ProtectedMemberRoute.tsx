import { Navigate } from 'react-router-dom';
import { useMemberAuth } from '../../contexts/MemberAuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Loader2 } from 'lucide-react';

interface ProtectedMemberRouteProps {
  children: React.ReactNode;
}

export default function ProtectedMemberRoute({ children }: ProtectedMemberRouteProps) {
  const { user, loading } = useMemberAuth();
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir={isRTL ? 'rtl' : 'ltr'}>
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        <span className="ml-3 text-gray-600">{isRTL ? 'جاري التحميل...' : 'Loading...'}</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/member/login" replace />;
  }

  return <>{children}</>;
}
