import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Lock, Mail, AlertCircle, Loader2, ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { useMemberAuth } from '../../contexts/MemberAuthContext';
import { useLanguage } from '../../contexts/LanguageContext';

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
        <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
        <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
        <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
        <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
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
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetError, setResetError] = useState('');
  const { user, loading: authLoading, isPaidMember, needsOnboarding, pendingApplication, signIn, signInWithGoogle, resetPassword } = useMemberAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();

  const redirectPath = searchParams.get('redirect');
  const serviceType = searchParams.get('service');

  const isRTL = language === 'ar';

  useEffect(() => {
    if (authLoading || !user) return;

    if (isPaidMember) {
      navigate('/member/dashboard', { replace: true });
    } else if (pendingApplication?.payment_status === 'paid') {
      navigate('/member/dashboard', { replace: true });
    } else if (needsOnboarding) {
      navigate('/membership', { replace: true });
    } else {
      navigate('/member/dashboard', { replace: true });
    }
  }, [user, authLoading, isPaidMember, needsOnboarding, pendingApplication, navigate]);

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
      resetTitle: 'Reset Password',
      resetSubtitle: 'Enter your email and we will send you a reset link',
      sendResetLink: 'Send Reset Link',
      sendingResetLink: 'Sending...',
      resetSuccessMessage: 'Password reset link sent! Check your email inbox.',
      resetErrorMessage: 'Failed to send reset link. Please try again.',
      backToLogin: 'Back to Login',
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
      resetTitle: 'إعادة تعيين كلمة المرور',
      resetSubtitle: 'أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة التعيين',
      sendResetLink: 'إرسال رابط إعادة التعيين',
      sendingResetLink: 'جاري الإرسال...',
      resetSuccessMessage: 'تم إرسال رابط إعادة التعيين! تحقق من بريدك الإلكتروني.',
      resetErrorMessage: 'فشل إرسال رابط إعادة التعيين. يرجى المحاولة مرة أخرى.',
      backToLogin: 'العودة لتسجيل الدخول',
    },
  };

  const t = translations[language];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error } = await signIn(email, password);
      if (error) throw error;

      if (redirectPath === '/book' && serviceType) {
        navigate(`/book?service=${serviceType}`);
      } else if (redirectPath === '/apply' && serviceType) {
        if (serviceType === 'wakala') {
          navigate('/member/dashboard?openWakala=true');
        } else if (serviceType === 'in_person') {
          navigate('/member/dashboard?openAdvisory=true');
        } else {
          navigate('/member/dashboard');
        }
      } else {
        navigate('/member/dashboard');
      }
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

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');
    setResetLoading(true);

    try {
      const { error } = await resetPassword(resetEmail);
      if (error) throw error;
      setResetSuccess(true);
    } catch (err: any) {
      console.error('Reset password error:', err);
      setResetError(t.resetErrorMessage);
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-md w-full mx-auto">
        <div className="bg-white border border-gray-100 rounded-2xl p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <img
                src="/logo.png"
                alt="Logo"
                className="h-16 w-auto"
              />
            </div>
            <h1 className="text-2xl font-bold text-[#0f1c2e] mb-1">
              {showResetPassword ? t.resetTitle : t.title}
            </h1>
            <p className="text-[#64748b] text-sm">
              {showResetPassword ? t.resetSubtitle : t.subtitle}
            </p>
          </div>

          {showResetPassword ? (
            <>
              {resetSuccess ? (
                <div className="text-center py-4">
                  <div className="flex justify-center mb-4">
                    <CheckCircle className="w-12 h-12 text-[#0d9488]" />
                  </div>
                  <p className="text-sm text-[#0f1c2e] mb-6">{t.resetSuccessMessage}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setShowResetPassword(false);
                      setResetSuccess(false);
                      setResetEmail('');
                    }}
                    className="text-sm font-medium text-[#0d9488] hover:text-[#0f766e] transition-colors"
                  >
                    {t.backToLogin}
                  </button>
                </div>
              ) : (
                <>
                  {resetError && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-800">{resetError}</p>
                    </div>
                  )}

                  <form onSubmit={handleResetPassword} className="space-y-5">
                    <div>
                      <label htmlFor="resetEmail" className="block text-sm font-medium text-[#0f1c2e] mb-2">
                        {t.email}
                      </label>
                      <div className="relative">
                        <Mail className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748b]`} />
                        <input
                          id="resetEmail"
                          type="email"
                          value={resetEmail}
                          onChange={(e) => setResetEmail(e.target.value)}
                          className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 border border-gray-200 rounded-xl focus:border-[#0d9488] focus:ring-1 focus:ring-[#0d9488] outline-none transition-all`}
                          placeholder="member@example.com"
                          required
                          disabled={resetLoading}
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={resetLoading}
                      className="w-full bg-[#0d9488] hover:bg-[#0f766e] text-white font-medium py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {resetLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          {t.sendingResetLink}
                        </>
                      ) : (
                        t.sendResetLink
                      )}
                    </button>
                  </form>

                  <div className="mt-6 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setShowResetPassword(false);
                        setResetError('');
                        setResetEmail('');
                      }}
                      className="text-sm font-medium text-[#0d9488] hover:text-[#0f766e] transition-colors"
                    >
                      {t.backToLogin}
                    </button>
                  </div>
                </>
              )}
            </>
          ) : (
            <>
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={googleLoading || loading}
                className="w-full bg-white hover:bg-gray-50 text-[#0f1c2e] font-medium py-3 px-6 rounded-xl border border-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 mb-6"
              >
                {googleLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {language === 'ar' ? 'جاري التسجيل...' : 'Signing in...'}
                  </>
                ) : (
                  <>
                    <GoogleIcon />
                    {t.signInWithGoogle}
                  </>
                )}
              </button>

              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-[#64748b]">{t.or}</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-[#0f1c2e] mb-2">
                    {t.email}
                  </label>
                  <div className="relative">
                    <Mail className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748b]`} />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 border border-gray-200 rounded-xl focus:border-[#0d9488] focus:ring-1 focus:ring-[#0d9488] outline-none transition-all`}
                      placeholder="member@example.com"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-[#0f1c2e] mb-2">
                    {t.password}
                  </label>
                  <div className="relative">
                    <Lock className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748b]`} />
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 border border-gray-200 rounded-xl focus:border-[#0d9488] focus:ring-1 focus:ring-[#0d9488] outline-none transition-all`}
                      placeholder="••••••••"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setShowResetPassword(true);
                      setError('');
                      setResetEmail(email);
                    }}
                    className="text-sm text-[#0d9488] hover:text-[#0f766e] font-medium transition-colors"
                  >
                    {t.forgotPassword}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#0d9488] hover:bg-[#0f766e] text-white font-medium py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {t.signingIn}
                    </>
                  ) : (
                    t.signIn
                  )}
                </button>
              </form>

              <div className="mt-6 text-center space-y-3">
                <p className="text-sm text-[#64748b]">
                  {t.noAccount}{' '}
                  <Link to="/member/signup" className="text-[#0d9488] hover:text-[#0f766e] font-medium transition-colors">
                    {t.register}
                  </Link>
                </p>
                <Link to="/" className="inline-flex items-center gap-1 text-sm text-[#64748b] hover:text-[#0f1c2e] transition-colors">
                  {isRTL ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
                  {t.backToWebsite}
                </Link>
              </div>
            </>
          )}
        </div>

        <p className="text-center text-xs text-[#64748b] mt-6">
          &copy; {new Date().getFullYear()} {isRTL ? 'جمعية الجالية اليمنية برمنغهام. جميع الحقوق محفوظة.' : 'YCA Birmingham. All rights reserved.'}
        </p>
      </div>
    </div>
  );
}
