import { Navigate, useLocation } from 'react-router-dom';
import { useMemberAuth } from '../../contexts/MemberAuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Loader2 } from 'lucide-react';

interface ProtectedMemberRouteProps {
  children: React.ReactNode;
  allowExpired?: boolean;
}

function hasOAuthParams() {
  const params = new URLSearchParams(window.location.search);
  const hash = window.location.hash;
  return params.has('code') || hash.includes('access_token');
}

export default function ProtectedMemberRoute({ children, allowExpired }: ProtectedMemberRouteProps) {
  const { user, loading, isExpired, isPaidMember, needsOnboarding } = useMemberAuth();
  const { language } = useLanguage();
  const location = useLocation();
  const isRTL = language === 'ar';

  const isProcessingOAuth = !user && hasOAuthParams();

  if (loading || isProcessingOAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir={isRTL ? 'rtl' : 'ltr'}>
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        <span className={`${isRTL ? 'mr-3' : 'ml-3'} text-gray-600`}>
          {isRTL ? 'جاري التحميل...' : 'Loading...'}
        </span>
      </div>
    );
  }

  // غير مسجل دخول -> حوله لصفحة الدخول
  if (!user) {
    const returnTo = location.pathname + location.search;
    return <Navigate to={`/member/login?redirect=${encodeURIComponent(returnTo)}`} replace />;
  }

  // ✅ غير عضو مدفوع (أو يحتاج onboarding) -> حوله لصفحة الباقات
  if (!isPaidMember || needsOnboarding) {
    try {
      sessionStorage.setItem('post_membership_redirect', location.pathname + location.search);
    } catch {}
    return <Navigate to="/membership" replace />;
  }

  // عضو مدفوع لكنه منتهي -> صفحة التجديد (إلا إذا allowExpired)
  if (isExpired && !allowExpired && !location.pathname.includes('/member/renew')) {
    return <Navigate to="/member/renew" replace />;
  }

  return <>{children}</>;
}
