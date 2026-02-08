import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../../contexts/LanguageContext';
import { Loader2, AlertCircle } from 'lucide-react';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        if (session) {
          navigate('/member/dashboard', { replace: true });
          return;
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          if (event === 'SIGNED_IN' && session) {
            subscription.unsubscribe();
            navigate('/member/dashboard', { replace: true });
          }
        });

        setTimeout(() => {
          subscription.unsubscribe();
          setError(
            isRTL
              ? 'انتهت مهلة تسجيل الدخول. يرجى المحاولة مرة أخرى.'
              : 'Login timed out. Please try again.'
          );
        }, 10000);
      } catch {
        setError(
          isRTL
            ? 'حدث خطأ أثناء تسجيل الدخول. يرجى المحاولة مرة أخرى.'
            : 'An error occurred during sign in. Please try again.'
        );
      }
    };

    handleCallback();
  }, [navigate, isRTL]);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center p-4" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="flex justify-center mb-4">
            <AlertCircle className="w-12 h-12 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {isRTL ? 'فشل تسجيل الدخول' : 'Sign In Failed'}
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/member/login', { replace: true })}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
          >
            {isRTL ? 'العودة لتسجيل الدخول' : 'Back to Login'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center p-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="text-center">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-600 mx-auto mb-4" />
        <p className="text-gray-700 font-medium text-lg">
          {isRTL ? 'جاري تسجيل الدخول...' : 'Completing sign in...'}
        </p>
        <p className="text-gray-500 text-sm mt-2">
          {isRTL ? 'يرجى الانتظار' : 'Please wait'}
        </p>
      </div>
    </div>
  );
}
