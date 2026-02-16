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
        <span className={`${isRTL ? 'mr-3' : 'ml-3'} text-gray-600`}>{isRTL ? 'جاري التحميل...' : 'Loading...'}</span>
      </div>
    );
  }

  if (!user) {
    const returnTo = location.pathname + location.search;
    return <Navigate to={`/member/login?redirect=${encodeURIComponent(returnTo)}`} replace />;
  }

  // Enforce: a user must have an active paid membership to access member routes.
  // If they are not a paid member (or they still need onboarding), send them to the
  // membership selection/payment flow first.
  if (!isPaidMember || needsOnboarding) {
    try {
      sessionStorage.setItem('post_membership_redirect', location.pathname + location.search);
    } catch {
      // ignore
    }
    return <Navigate to="/membership?notice=membership_required" replace />;
  }

  if (isPaidMember && isExpired && !allowExpired && !location.pathname.includes('/member/renew')) {
    return <Navigate to="/member/renew" replace />;
  }

  return <>{children}</>;
}
