import { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Lock, Mail, AlertCircle, Loader2 } from 'lucide-react';
import { useMemberAuth } from '../../contexts/MemberAuthContext';
import { useLanguage } from '../../contexts/LanguageContext';

export default function MemberLogin() {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useMemberAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();

  const redirectPath = searchParams.get('redirect');
  const serviceType = searchParams.get('service');

  const isRTL = language === 'ar';

  const translations = {
    en: {
      title: 'Member Login',
      subtitle: 'Access your account',
      email: 'Email Address',
      password: 'Password',
      signIn: 'Sign In',
      signingIn: 'Signing in...',
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
      noAccount: 'ليس لديك حساب؟',
      register: 'سجل الآن',
      forgotPassword: 'نسيت كلمة المرور؟',
      backToWebsite: 'العودة للموقع',
      errorMessage: 'البريد الإلكتروني أو كلمة المرور غير صحيحة. يرجى المحاولة مرة أخرى.',
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

      if (redirectPath === '/apply' && serviceType) {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center p-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center items-center gap-3 mb-6">
              <img
                src="/logo.png"
                alt="YCA Birmingham Logo"
                className="h-16 w-auto"
              />
              <img
                src="/logo_text.png"
                alt="Yemeni Community Association"
                className="h-10 w-auto"
              />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{t.title}</h1>
            <p className="text-gray-600">{t.subtitle}</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                {t.email}
              </label>
              <div className="relative">
                <Mail className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400`} />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-shadow`}
                  placeholder="member@example.com"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                {t.password}
              </label>
              <div className="relative">
                <Lock className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400`} />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-shadow`}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Link
                to="/member/forgot-password"
                className="text-sm text-emerald-600 hover:text-emerald-700 transition-colors"
              >
                {t.forgotPassword}
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
            <p className="text-sm text-gray-600">
              {t.noAccount}{' '}
              <Link to="/get-involved/membership" className="text-emerald-600 hover:text-emerald-700 font-medium transition-colors">
                {t.register}
              </Link>
            </p>
            <Link to="/" className="block text-sm text-emerald-600 hover:text-emerald-700 transition-colors">
              {isRTL ? '→' : '←'} {t.backToWebsite}
            </Link>
          </div>
        </div>

        <p className="text-center text-sm text-gray-600 mt-6">
          © {new Date().getFullYear()} YCA Birmingham. All rights reserved.
        </p>
      </div>
    </div>
  );
}
