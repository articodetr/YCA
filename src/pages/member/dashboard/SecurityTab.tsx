import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Monitor, Smartphone, Clock, Loader2 } from 'lucide-react';
import { staggerContainer, staggerItem } from '../../../lib/animations';
import { supabase } from '../../../lib/supabase';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useMemberAuth } from '../../../contexts/MemberAuthContext';

interface Props {
  t: Record<string, string>;
}

function parseUserAgent(ua: string) {
  if (/iPhone|iPad|iPod/i.test(ua)) return { device: 'iOS', icon: Smartphone };
  if (/Android/i.test(ua)) return { device: 'Android', icon: Smartphone };
  if (/Windows/i.test(ua)) return { device: 'Windows', icon: Monitor };
  if (/Mac/i.test(ua)) return { device: 'macOS', icon: Monitor };
  if (/Linux/i.test(ua)) return { device: 'Linux', icon: Monitor };
  return { device: 'Unknown', icon: Monitor };
}

function getBrowserName(ua: string) {
  if (/Chrome/i.test(ua) && !/Edg/i.test(ua)) return 'Chrome';
  if (/Firefox/i.test(ua)) return 'Firefox';
  if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) return 'Safari';
  if (/Edg/i.test(ua)) return 'Edge';
  return 'Browser';
}

export default function SecurityTab({ t }: Props) {
  const { language } = useLanguage();
  const { user } = useMemberAuth();
  const isRTL = language === 'ar';
  const [loginHistory, setLoginHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLoginHistory();
  }, [user]);

  const fetchLoginHistory = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data } = await supabase
        .from('login_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);
      setLoginHistory(data || []);
    } catch (err) {
      console.error('Error fetching login history:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={staggerItem} className="bg-white rounded-xl border border-divider p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
            <Shield className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-base font-bold text-primary">
              {language === 'ar' ? 'حالة الأمان' : 'Security Status'}
            </h3>
            <p className="text-xs text-muted">
              {language === 'ar' ? 'حسابك محمي' : 'Your account is protected'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-muted mb-1">
              {language === 'ar' ? 'طريقة تسجيل الدخول' : 'Login Method'}
            </p>
            <p className="text-sm font-semibold text-primary">
              {user?.app_metadata?.provider === 'google' ? 'Google OAuth' : (language === 'ar' ? 'البريد الإلكتروني وكلمة المرور' : 'Email & Password')}
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-muted mb-1">
              {language === 'ar' ? 'آخر تسجيل دخول' : 'Last Login'}
            </p>
            <p className="text-sm font-semibold text-primary">
              {loginHistory[0]
                ? new Date(loginHistory[0].created_at).toLocaleString(isRTL ? 'ar-GB' : 'en-GB')
                : (language === 'ar' ? 'غير متاح' : 'N/A')}
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div variants={staggerItem} className="bg-white rounded-xl border border-divider p-6">
        <h3 className="text-base font-bold text-primary mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4" />
          {language === 'ar' ? 'سجل تسجيل الدخول' : 'Login History'}
        </h3>

        {loginHistory.length === 0 ? (
          <p className="text-sm text-muted text-center py-8">
            {language === 'ar' ? 'لا يوجد سجل تسجيل دخول' : 'No login history available'}
          </p>
        ) : (
          <div className="space-y-1">
            {loginHistory.map((entry) => {
              const { device, icon: DeviceIcon } = parseUserAgent(entry.user_agent || '');
              const browser = getBrowserName(entry.user_agent || '');
              const isFirst = loginHistory[0].id === entry.id;

              return (
                <div
                  key={entry.id}
                  className={`flex items-center gap-4 py-3 border-b border-divider last:border-0 ${
                    isFirst ? 'bg-emerald-50/50 -mx-2 px-2 rounded-lg' : ''
                  }`}
                >
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                    entry.status === 'success' ? 'bg-emerald-50' : 'bg-red-50'
                  }`}>
                    <DeviceIcon className={`w-4 h-4 ${
                      entry.status === 'success' ? 'text-emerald-600' : 'text-red-600'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-primary">
                        {browser} - {device}
                      </p>
                      {isFirst && (
                        <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">
                          {language === 'ar' ? 'الحالي' : 'Current'}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted">
                      {entry.login_method === 'google' ? 'Google' : 'Email'}
                      {' · '}
                      {new Date(entry.created_at).toLocaleString(isRTL ? 'ar-GB' : 'en-GB', {
                        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    entry.status === 'success'
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-red-50 text-red-700'
                  }`}>
                    {entry.status === 'success'
                      ? (language === 'ar' ? 'نجح' : 'Success')
                      : (language === 'ar' ? 'فشل' : 'Failed')}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
