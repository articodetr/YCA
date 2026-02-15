import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../../contexts/LanguageContext';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [error, setError] = useState<string | null>(null);

  const isRTL = language === 'ar';

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();
        if (sessionErr) throw sessionErr;

        const session = sessionData.session;
        const user = session?.user;

        if (!user) {
          navigate('/member/login', { replace: true });
          return;
        }

        const authToken = session?.access_token;

        const savedRedirect = sessionStorage.getItem('auth_redirect_path');
        const savedService = sessionStorage.getItem('auth_redirect_service');

        const hasPendingPlanSelection = !!sessionStorage.getItem('pendingMembershipSelection');

        const goToMemberDestination = (destination?: string) => {
          const fallback = sessionStorage.getItem('post_membership_redirect') || destination || '/member/dashboard';

          if (savedRedirect === '/book' && savedService) {
            sessionStorage.removeItem('auth_redirect_path');
            sessionStorage.removeItem('auth_redirect_service');
            navigate(`/book?service=${savedService}`, { replace: true });
            return;
          }

          if (savedRedirect === '/apply' && savedService) {
            sessionStorage.removeItem('auth_redirect_path');
            sessionStorage.removeItem('auth_redirect_service');
            if (savedService === 'in_person') {
              navigate('/member/dashboard?openAdvisory=true', { replace: true });
            } else {
              navigate('/member/dashboard', { replace: true });
            }
            return;
          }

          sessionStorage.removeItem('auth_redirect_path');
          sessionStorage.removeItem('auth_redirect_service');
          navigate(fallback, { replace: true });
        };

        const findMember = async () => {
          const byId = await supabase
            .from('members')
            .select('id, member_number, expiry_date')
            .eq('id', user.id)
            .maybeSingle();

          if (byId.data) return byId.data;

          if (user.email) {
            const byEmail = await supabase
              .from('members')
              .select('id, member_number, expiry_date')
              .eq('email', user.email)
              .maybeSingle();
            if (byEmail.data) return byEmail.data;
          }

          return null;
        };

        let member = await findMember();

        if (!member) {
          const appQuery = supabase
            .from('membership_applications')
            .select('id, payment_status')
            .order('created_at', { ascending: false })
            .limit(1);

          const { data: appByUser } = await appQuery.eq('user_id', user.id).maybeSingle();
          let app = appByUser;

          if (!app && user.email) {
            const { data: appByEmail } = await supabase
              .from('membership_applications')
              .select('id, payment_status')
              .eq('email', user.email)
              .order('created_at', { ascending: false })
              .limit(1)
              .maybeSingle();
            app = appByEmail;
          }

          const paid = app?.payment_status === 'paid' || app?.payment_status === 'completed';

          if (paid && app?.id && authToken) {
            try {
              await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/activate-membership`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${authToken}`,
                  'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
                },
                body: JSON.stringify({
                  application_id: app.id,
                  user_id: user.id,
                }),
              });
            } catch (e) {}

            member = await findMember();
          }
        }

        if (member) {
          const isExpired = member.expiry_date ? new Date(member.expiry_date) < new Date() : false;
          if (isExpired) {
            navigate('/member/renew', { replace: true });
            return;
          }
          goToMemberDestination('/member/dashboard');
          return;
        }

        if (hasPendingPlanSelection) {
          navigate('/membership', { replace: true });
          return;
        }

        navigate('/membership?notice=membership_required', { replace: true });
      } catch (e: any) {
        console.error('Auth callback error:', e);
        if (cancelled) return;
        setError(language === 'ar' ? 'حدث خطأ أثناء تسجيل الدخول. حاول مرة أخرى.' : 'Something went wrong while signing in. Please try again.');
        setTimeout(() => {
          if (!cancelled) navigate('/member/login', { replace: true });
        }, 1200);
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [navigate, language]);

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
            {error ? error : (language === 'ar' ? 'يرجى الانتظار لحظة' : 'Please wait a moment')}
          </p>
        </div>
      </div>
    </div>
  );
}
