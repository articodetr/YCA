import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Lock, Mail, AlertCircle, Loader2 } from 'lucide-react';
import { useMemberAuth } from '../../contexts/MemberAuthContext';
import { useLanguage } from '../../contexts/LanguageContext';

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
        <path
          fill="#4285F4"
          d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"
        />
        <path
          fill="#34A853"
          d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"
        />
        <path
          fill="#FBBC05"
          d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -25.464 48.949 C -26.284 50.569 -26.754 52.389 -26.754 54.329 C -26.754 56.269 -26.284 58.089 -25.464 59.709 L -21.484 56.619 Z"
        />
        <path
          fill="#EA4335"
          d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"
        />
      </g>
    </svg>
  );
}

export default function MemberLogin() {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const {
    user,
    loading: authLoading,
    isPaidMember,
    isExpired,
    needsOnboarding,
    pendingApplication,
    signIn,
    signInWithGoogle,
  } = useMemberAuth();

  const { language } = useLanguage();
  const navigate = useNavigate();

  const redirectPath = searchParams.get('redirect');
  const serviceType = searchParams.get('service');

  const isRTL = language === 'ar';

  useEffect(() => {
    if (authLoading || !user) return;

    // ✅ Non-paid members must choose a package first
    if (!isPaidMember || needsOnboarding) {
      try {
        if (redirectPath) sessionStorage.setItem('post_membership_redirect', redirectPath);
        if (serviceType) sessionStorage.setItem('post_membership_service', serviceType);
      } catch {}
      navigate('/membership', { replace: true });
      return;
    }

    // ✅ Paid but expired -> renew
    if (isExpired) {
      navigate('/member/renew', { replace: true });
      return;
    }

    // ✅ Paid & active -> honor redirects
    if (redirectPath === '/book' && serviceType) {
      navigate(`/book?service=${serviceType}`, { replace: true });
      return;
    }

    if (redirectPath === '/apply' && serviceType) {
      if (serviceType === 'in_person') {
        navigate('/member/dashboard?openAdvisory=true', { replace: true });
      } else {
        navigate('/member/dashboard', { replace: true });
      }
      return;
    }

    navigate(redirectPath || '/member/dashboard', { replace: true });
  }, [
    user,
    authLoading,
    isPaidMember,
    isExpired,
    needsOnboarding,
    pendingApplication,
    navigate,
    redirectPath,
    serviceType,
  ]);

  const translations = {
    en: {
      title: 'Member Login',
      subtitle: 'Access your account',
      email: 'Email Address',
      password: 'Password',
      signIn: 'Sign In',
      signingIn: 'Signing in...',
      signInWithGoogle: 'Continue with Google',
      or: 'OR',
      noAccount: "Don't have an account?",
      register: 'Register',
      forgotPassword: 'Forgot Password?',
      backToWebsite: 'Back to Website',
      errorMessage: 'Invalid email or password. Please try again.',
    },
    ar: {
      title: 'تسجيل الدخول للأعضاء',
      subtitle: 'الوصول إلى حسابك',
      email: 'البريد الإلكتروني',
      password: 'كلمة المرور',
      signIn: 'تسجيل الدخول',
      signingIn: 'جاري تسجيل الدخول...',
      signInWithGoogle: 'التسجيل عبر جوجل',
      or: 'أو',
      noAccount: 'ليس لديك حساب؟',
      register: 'سجل الآن',
      forgotPassword: 'نسيت كلمة المرور؟',
      backToWebsite: 'العودة للموقع',
      errorMessage: 'البريد الإلكتروني أو كلمة المرور غير صحيحة. يرجى المحاولة مرة أخرى.',
    },
  };

  const t = translations[language as 'en' | 'ar'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error } = await signIn(email, password);
      if (error) throw error;

      // Navigation is handled by the useEffect above based on membership status
    } catch (err: any) {
      console.error('Login error:', err);
      setError(t.errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setGoogleLoading(true);

    if (redirectPath) sessionStorage.setItem('auth_redirect_path', redirectPath);
    if (serviceType) sessionStorage.setItem('auth_redirect_service', serviceType);

    try {
      const { error } = await signInWithGoogle();
      if (error) throw error;
    } catch (err: any) {
      console.error('Google login error:', err);
      setError(language === 'ar' ? 'فشل تسجيل الدخول عبر جوجل. يرجى المحاولة مرة أخرى.' : 'Google sign in failed. Please try again.');
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center p-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center items-center gap-3 mb-4">
            <img src="/logo.png" alt="YCA Birmingham Logo" className="h-16 w-auto" />
            <img src="/logo_text.png" alt="Yemeni Community Association" className="h-10 w-auto" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{t.title}</h1>
          <p className="text-gray-600">{t.subtitle}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t.email}</label>
              <div className="relative">
                <Mail className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 ${isRTL ? 'right-4' : 'left-4'}`} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full py-3 px-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all ${
                    isRTL ? 'pr-12' : 'pl-12'
                  }`}
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t.password}</label>
              <div className="relative">
                <Lock className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 ${isRTL ? 'right-4' : 'left-4'}`} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full py-3 px-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all ${
                    isRTL ? 'pr-12' : 'pl-12'
                  }`}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  {t.signingIn}
                </>
              ) : (
                t.signIn
              )}
            </button>
          </form>

          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-gray-200" />
            <span className="px-4 text-sm text-gray-500">{t.or}</span>
            <div className="flex-1 border-t border-gray-200" />
          </div>

          <button
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            className="w-full border border-gray-200 hover:bg-gray-50 text-gray-700 py-3 rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {googleLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <GoogleIcon />}
            {t.signInWithGoogle}
          </button>

          <div className="mt-6 text-center text-sm text-gray-600">
            {t.noAccount}{' '}
            <Link to="/member/signup" className="text-emerald-600 hover:text-emerald-700 font-semibold">
              {t.register}
            </Link>
          </div>

          <div className="mt-4 text-center">
            <Link to="/member/forgot-password" className="text-sm text-gray-600 hover:text-gray-900">
              {t.forgotPassword}
            </Link>
          </div>

          <div className="mt-6 text-center">
            <Link to="/" className="text-sm text-gray-600 hover:text-gray-900">
              {t.backToWebsite}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
