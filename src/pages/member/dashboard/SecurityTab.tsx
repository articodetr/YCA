import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Monitor, Smartphone, Clock, Loader2, Trash2, AlertTriangle } from 'lucide-react';
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
  const { user, signOut } = useMemberAuth();
  const navigate = useNavigate();
  const isRTL = language === 'ar';
  const [loginHistory, setLoginHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') return;
    setDeleting(true);
    setDeleteError('');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setDeleteError(isRTL ? 'الرجاء تسجيل الدخول مرة أخرى' : 'Please log in again');
        setDeleting(false);
        return;
      }

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-member-account`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
        }
      );

      const result = await res.json();

      if (!res.ok || result.error) {
        setDeleteError(result.error || (isRTL ? 'فشل حذف الحساب' : 'Failed to delete account'));
        setDeleting(false);
        return;
      }

      await signOut();
      navigate('/', { replace: true });
    } catch {
      setDeleteError(isRTL ? 'حدث خطأ غير متوقع' : 'An unexpected error occurred');
      setDeleting(false);
    }
  };

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

      <motion.div variants={staggerItem} className="bg-white rounded-xl border border-red-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
            <Trash2 className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="text-base font-bold text-red-700">
              {isRTL ? 'حذف الحساب' : 'Delete Account'}
            </h3>
            <p className="text-xs text-red-500">
              {isRTL ? 'هذا الإجراء لا يمكن التراجع عنه' : 'This action cannot be undone'}
            </p>
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          {isRTL
            ? 'عند حذف حسابك، سيتم حذف جميع بياناتك بشكل نهائي بما في ذلك طلبات العضوية والحجوزات وسجل المدفوعات. لا يمكن استعادة هذه البيانات بعد الحذف.'
            : 'When you delete your account, all your data will be permanently removed including membership applications, bookings, and payment history. This data cannot be recovered after deletion.'}
        </p>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          {isRTL ? 'حذف حسابي' : 'Delete My Account'}
        </button>
      </motion.div>

      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => !deleting && setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
              dir={isRTL ? 'rtl' : 'ltr'}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {isRTL ? 'تأكيد حذف الحساب' : 'Confirm Account Deletion'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {isRTL ? 'هذا الإجراء نهائي ولا رجعة فيه' : 'This action is permanent and irreversible'}
                  </p>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-5">
                <p className="text-sm text-red-800">
                  {isRTL
                    ? 'سيتم حذف جميع بياناتك نهائياً: العضوية، الحجوزات، المدفوعات، والإشعارات.'
                    : 'All your data will be permanently deleted: membership, bookings, payments, and notifications.'}
                </p>
              </div>

              <label className="block text-sm font-medium text-gray-700 mb-2">
                {isRTL
                  ? 'اكتب DELETE للتأكيد'
                  : 'Type DELETE to confirm'}
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
                disabled={deleting}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none disabled:opacity-50"
                dir="ltr"
              />

              {deleteError && (
                <p className="mt-2 text-sm text-red-600 font-medium">{deleteError}</p>
              )}

              <div className="flex gap-3 mt-5">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteConfirmText('');
                    setDeleteError('');
                  }}
                  disabled={deleting}
                  className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
                >
                  {isRTL ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmText !== 'DELETE' || deleting}
                  className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {deleting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {isRTL ? 'جاري الحذف...' : 'Deleting...'}
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      {isRTL ? 'حذف نهائي' : 'Delete Permanently'}
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
