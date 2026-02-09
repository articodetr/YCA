import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, AlertCircle, Loader2, User, ArrowLeft, ArrowRight } from 'lucide-react';
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

export default function MemberSignup() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { user, loading: authLoading, isPaidMember, needsOnboarding, signUp, signInWithGoogle } = useMemberAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();

  const isRTL = language === 'ar';

  useEffect(() => {
    if (authLoading || !user) return;

    if (isPaidMember) {
      navigate('/member/dashboard', { replace: true });
    } else if (needsOnboarding) {
      navigate('/membership', { replace: true });
    } else {
      navigate('/member/dashboard', { replace: true });
    }
  }, [user, authLoading, isPaidMember, needsOnboarding, navigate]);

  const translations = {
    en: {
      title: 'Create Account',
      subtitle: 'Join our community',
      fullName: 'Full Name',
      email: 'Email Address',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      signUp: 'Create Account',
      signingUp: 'Creating account...',
      signInWithGoogle: 'Sign up with Google',
      or: 'OR',
      haveAccount: 'Already have an account?',
      signIn: 'Sign In',
      backToWebsite: 'Back to Website',
      passwordMismatch: 'Passwords do not match',
      passwordMinLength: 'Password must be at least 6 characters',
      errorMessage: 'Failed to create account. Please try again.',
      userExists: 'An account with this email already exists. Please sign in instead.',
      rateLimited: 'Too many signup attempts. Please wait a few minutes and try again.',
      signupsDisabled: 'Registration is currently unavailable. Please try again later.',
      weakPassword: 'Password is too weak. Please use a stronger password.',
    },
    ar: {
      title: 'إنشاء حساب',
      subtitle: 'انضم إلى مجتمعنا',
      fullName: 'الاسم الكامل',
      email: 'البريد الإلكتروني',
      password: 'كلمة المرور',
      confirmPassword: 'تأكيد كلمة المرور',
      signUp: 'إنشاء حساب',
      signingUp: 'جاري إنشاء الحساب...',
      signInWithGoogle: 'التسجيل عبر جوجل',
      or: 'أو',
      haveAccount: 'لديك حساب بالفعل؟',
      signIn: 'تسجيل الدخول',
      backToWebsite: 'العودة للموقع',
      passwordMismatch: 'كلمات المرور غير متطابقة',
      passwordMinLength: 'يجب أن تكون كلمة المرور 6 أحرف على الأقل',
      errorMessage: 'فشل إنشاء الحساب. يرجى المحاولة مرة أخرى.',
      userExists: 'يوجد حساب بهذا البريد الإلكتروني بالفعل. يرجى تسجيل الدخول بدلاً من ذلك.',
      rateLimited: 'محاولات تسجيل كثيرة جداً. يرجى الانتظار بضع دقائق والمحاولة مرة أخرى.',
      signupsDisabled: 'التسجيل غير متاح حالياً. يرجى المحاولة لاحقاً.',
      weakPassword: 'كلمة المرور ضعيفة جداً. يرجى استخدام كلمة مرور أقوى.',
    },
  };

  const t = translations[language];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError(t.passwordMismatch);
      return;
    }

    if (password.length < 6) {
      setError(t.passwordMinLength);
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await signUp(email, password, {
        full_name: fullName,
      });

      if (error) {
        const msg = error.message.toLowerCase();
        if (msg.includes('already registered') || msg.includes('already been registered') || msg.includes('user already exists')) {
          setError(t.userExists);
        } else if (msg.includes('rate limit') || msg.includes('too many requests') || msg.includes('429')) {
          setError(t.rateLimited);
        } else if (msg.includes('signup') && msg.includes('disabled') || msg.includes('signups not allowed')) {
          setError(t.signupsDisabled);
        } else if (msg.includes('weak') || msg.includes('password')) {
          setError(t.weakPassword);
        } else {
          setError(t.errorMessage);
        }
        return;
      }

      if (data?.user && (!data.user.identities || data.user.identities.length === 0)) {
        setError(t.userExists);
        return;
      }

      navigate('/membership');
    } catch (err: any) {
      console.error('Signup error:', err);
      setError(t.errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError('');
    setGoogleLoading(true);

    try {
      const { error } = await signInWithGoogle();
      if (error) throw error;
    } catch (err: any) {
      console.error('Google signup error:', err);
      setError(language === 'ar' ? 'فشل التسجيل عبر جوجل. يرجى المحاولة مرة أخرى.' : 'Google sign up failed. Please try again.');
      setGoogleLoading(false);
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
            <h1 className="text-2xl font-bold text-[#0f1c2e] mb-1">{t.title}</h1>
            <p className="text-[#64748b] text-sm">{t.subtitle}</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <button
            type="button"
            onClick={handleGoogleSignUp}
            disabled={googleLoading || loading}
            className="w-full bg-white hover:bg-gray-50 text-[#0f1c2e] font-medium py-3 px-6 rounded-xl border border-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 mb-6"
          >
            {googleLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {language === 'ar' ? 'جاري التسجيل...' : 'Signing up...'}
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
              <label htmlFor="fullName" className="block text-sm font-medium text-[#0f1c2e] mb-2">
                {t.fullName}
              </label>
              <div className="relative">
                <User className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748b]`} />
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 border border-gray-200 rounded-xl focus:border-[#0d9488] focus:ring-1 focus:ring-[#0d9488] outline-none transition-all`}
                  placeholder={language === 'ar' ? 'أحمد محمد' : 'John Doe'}
                  required
                  disabled={loading}
                />
              </div>
            </div>

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
                  minLength={6}
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#0f1c2e] mb-2">
                {t.confirmPassword}
              </label>
              <div className="relative">
                <Lock className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748b]`} />
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 border border-gray-200 rounded-xl focus:border-[#0d9488] focus:ring-1 focus:ring-[#0d9488] outline-none transition-all`}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0d9488] hover:bg-[#0f766e] text-white font-medium py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {t.signingUp}
                </>
              ) : (
                t.signUp
              )}
            </button>
          </form>

          <div className="mt-6 text-center space-y-3">
            <p className="text-sm text-[#64748b]">
              {t.haveAccount}{' '}
              <Link to="/member/login" className="text-[#0d9488] hover:text-[#0f766e] font-medium transition-colors">
                {t.signIn}
              </Link>
            </p>
            <Link to="/" className="inline-flex items-center gap-1 text-sm text-[#64748b] hover:text-[#0f1c2e] transition-colors">
              {isRTL ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
              {t.backToWebsite}
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-[#64748b] mt-6">
          &copy; {new Date().getFullYear()} {isRTL ? 'جمعية الجالية اليمنية برمنغهام. جميع الحقوق محفوظة.' : 'YCA Birmingham. All rights reserved.'}
        </p>
      </div>
    </div>
  );
}
