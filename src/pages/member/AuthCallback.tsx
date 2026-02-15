import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useMemberAuth } from '../../contexts/MemberAuthContext';
import { useLanguage } from '../../contexts/LanguageContext';

export default function AuthCallback() {
  const { user, loading, isPaidMember, needsOnboarding, pendingApplication } = useMemberAuth();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [timedOut, setTimedOut] = useState(false);

  const isRTL = language === 'ar';

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimedOut(true);
    }, 10000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      if (timedOut) {
        navigate('/member/login', { replace: true });
      }
      return;
    }

    const savedRedirect = sessionStorage.getItem('auth_redirect_path');
    const savedService = sessionStorage.getItem('auth_redirect_service');
    sessionStorage.removeItem('auth_redirect_path');
    sessionStorage.removeItem('auth_redirect_service');

    const hasMembership = isPaidMember || (pendingApplication && ['paid', 'completed'].includes(pendingApplication.payment_status));

    // Enforce: if the user is NOT an active paid member, always send them to the
    // membership selection/payment page first (even if they came from /book or /apply).
    if (!hasMembership || needsOnboarding) {
      try {
        if (savedRedirect) sessionStorage.setItem('post_membership_redirect', savedRedirect);
        if (savedService) sessionStorage.setItem('post_membership_service', savedService);
      } catch {
        // ignore
      }
      navigate('/membership?notice=membership_required', { replace: true });
      return;
    }

    if (savedRedirect === '/book' && savedService) {
      navigate(`/book?service=${savedService}`, { replace: true });
      return;
    }

    if (savedRedirect === '/apply' && savedService) {
      if (savedService === 'in_person') {
        navigate('/member/dashboard?openAdvisory=true', { replace: true });
      } else {
        navigate('/member/dashboard', { replace: true });
      }
      return;
    }

    if (isPaidMember) {
      navigate('/member/dashboard', { replace: true });
    } else {
      navigate('/member/dashboard', { replace: true });
    }
  }, [user, loading, isPaidMember, needsOnboarding, pendingApplication, timedOut, navigate]);

  useEffect(() => {
    if (timedOut && !user) {
      navigate('/member/login', { replace: true });
    }
  }, [timedOut, user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center p-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="text-center">
        <div className="flex justify-center items-center gap-3 mb-8">
          <img src="/logo.png" alt="YCA Birmingham Logo" className="h-16 w-auto" />
          <img src="/logo_text.png" alt="Yemeni Community Association" className="h-10 w-auto" />
        </div>
        <div className="bg-white rounded-2xl shadow-xl p-10 max-w-sm mx-auto">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {language === 'ar' ? 'جاري تسجيل الدخول...' : 'Signing you in...'}
          </h2>
          <p className="text-gray-500 text-sm">
            {language === 'ar' ? 'يرجى الانتظار لحظة' : 'Please wait a moment'}
          </p>
        </div>
      </div>
    </div>
  );
}
