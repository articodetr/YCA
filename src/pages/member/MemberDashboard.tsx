import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, FileText, CreditCard, LogOut, Loader2,
  LayoutDashboard, CheckCircle, XCircle, Bell, ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../../contexts/LanguageContext';
import { useMemberAuth } from '../../contexts/MemberAuthContext';
import Layout from '../../components/Layout';
import PageHeader from '../../components/PageHeader';
import { cancelBooking } from '../../lib/booking-utils';
import OverviewTab from './dashboard/OverviewTab';
import ApplicationsTab from './dashboard/ApplicationsTab';
import PaymentsTab from './dashboard/PaymentsTab';
import ProfileTab from './dashboard/ProfileTab';
import NotificationsTab from './dashboard/NotificationsTab';
import SecurityTab from './dashboard/SecurityTab';
import WelcomeModal from '../../components/member/WelcomeModal';

type TabId = 'overview' | 'applications' | 'payments' | 'profile' | 'notifications' | 'security';

const translations = {
  en: {
    title: 'Member Dashboard',
    subtitle: 'Manage your account',
    overview: 'Overview',
    profile: 'My Profile',
    membership: 'Membership',
    wakalaApplications: 'Applications',
    paymentHistory: 'Payments',
    notifications: 'Notifications',
    newWakalaApp: 'New Wakala Application',
    logout: 'Logout',
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
    paid: 'Paid',
    unpaid: 'Unpaid',
    noMembership: 'No membership application found',
    noWakala: 'No Wakala applications yet',
    noPayments: 'No payment history',
    applyMembership: 'Apply for Membership',
    email: 'Email',
    phone: 'Phone',
    address: 'Address',
    loading: 'Loading...',
    cancelAppointment: 'Cancel Appointment',
    confirmCancel: 'Are you sure you want to cancel this appointment?',
    cancelSuccess: 'Appointment cancelled successfully',
    cancelError: 'Failed to cancel appointment',
    cancelled: 'Cancelled',
    minutes: 'minutes',
    membershipNumber: 'Membership Number',
    expiryDate: 'Expiry Date',
    startDate: 'Start Date',
    membershipStatus: 'Membership Status',
    active: 'Active',
    expired: 'Expired',
    editProfile: 'Edit',
    saveProfile: 'Save Changes',
    saving: 'Saving...',
    profileUpdated: 'Profile updated successfully',
    profileError: 'Failed to update profile',
    fullName: 'Full Name',
    noExpiry: 'N/A',
    recentActivity: 'Recent Activity',
    totalApplications: 'Applications',
    totalPaid: 'Total Paid',
    noRecentActivity: 'No recent activity',
    personalInfo: 'Personal Information',
    membershipDetails: 'Membership Details',
    cancel: 'Cancel',
    city: 'City',
    postcode: 'Postcode',
    submitted: 'Submitted',
    pending_payment: 'Pending Payment',
    in_progress: 'In Progress',
    completed: 'Completed',
    quickActions: 'Quick Actions',
    bookAppointment: 'Book Appointment',
    viewServices: 'View Services',
    noNotifications: 'No notifications yet',
    markAllRead: 'Mark all read',
    security: 'Security',
  },
  ar: {
    title: 'لوحة تحكم الأعضاء',
    subtitle: 'إدارة حسابك',
    overview: 'نظرة عامة',
    profile: 'ملفي الشخصي',
    membership: 'العضوية',
    wakalaApplications: 'الطلبات',
    paymentHistory: 'المدفوعات',
    notifications: 'الإشعارات',
    newWakalaApp: 'طلب وكالة جديد',
    logout: 'تسجيل الخروج',
    pending: 'قيد الانتظار',
    approved: 'موافق عليه',
    rejected: 'مرفوض',
    paid: 'مدفوع',
    unpaid: 'غير مدفوع',
    noMembership: 'لم يتم العثور على طلب عضوية',
    noWakala: 'لا توجد طلبات وكالة بعد',
    noPayments: 'لا يوجد سجل للمدفوعات',
    applyMembership: 'التقدم للعضوية',
    email: 'البريد الإلكتروني',
    phone: 'الهاتف',
    address: 'العنوان',
    loading: 'جاري التحميل...',
    cancelAppointment: 'إلغاء الموعد',
    confirmCancel: 'هل أنت متأكد من إلغاء هذا الموعد؟',
    cancelSuccess: 'تم إلغاء الموعد بنجاح',
    cancelError: 'فشل إلغاء الموعد',
    cancelled: 'ملغي',
    minutes: 'دقيقة',
    membershipNumber: 'رقم العضوية',
    expiryDate: 'تاريخ الانتهاء',
    startDate: 'تاريخ البدء',
    membershipStatus: 'حالة العضوية',
    active: 'نشط',
    expired: 'منتهي',
    editProfile: 'تعديل',
    saveProfile: 'حفظ التغييرات',
    saving: 'جاري الحفظ...',
    profileUpdated: 'تم تحديث الملف الشخصي بنجاح',
    profileError: 'فشل تحديث الملف الشخصي',
    fullName: 'الاسم الكامل',
    noExpiry: 'غير محدد',
    recentActivity: 'النشاط الأخير',
    totalApplications: 'الطلبات',
    totalPaid: 'المبلغ المدفوع',
    noRecentActivity: 'لا يوجد نشاط حديث',
    personalInfo: 'المعلومات الشخصية',
    membershipDetails: 'تفاصيل العضوية',
    cancel: 'إلغاء',
    city: 'المدينة',
    postcode: 'الرمز البريدي',
    submitted: 'مُقدّم',
    pending_payment: 'بانتظار الدفع',
    in_progress: 'قيد المعالجة',
    completed: 'مكتمل',
    quickActions: 'إجراءات سريعة',
    bookAppointment: 'حجز موعد',
    viewServices: 'عرض الخدمات',
    noNotifications: 'لا توجد إشعارات بعد',
    markAllRead: 'تحديد الكل كمقروء',
    security: 'الأمان',
  },
};

const tabs: { id: TabId; icon: typeof LayoutDashboard; labelKey: string }[] = [
  { id: 'overview', icon: LayoutDashboard, labelKey: 'overview' },
  { id: 'applications', icon: FileText, labelKey: 'wakalaApplications' },
  { id: 'payments', icon: CreditCard, labelKey: 'paymentHistory' },
  { id: 'notifications', icon: Bell, labelKey: 'notifications' },
  { id: 'profile', icon: User, labelKey: 'profile' },
  { id: 'security', icon: ShieldCheck, labelKey: 'security' },
];

export default function MemberDashboard() {
  const { user, signOut, needsOnboarding, isPaidMember, pendingApplication, loading: authLoading } = useMemberAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isRTL = language === 'ar';
  const t = translations[language];

  useEffect(() => {
    if (authLoading || !user) return;

    if (needsOnboarding && !isPaidMember) {
      navigate('/membership', { replace: true });
      return;
    }
  }, [authLoading, user, needsOnboarding, isPaidMember, navigate]);

  const [loading, setLoading] = useState(true);
  const [membershipApp, setMembershipApp] = useState<any>(null);
  const [wakalaApps, setWakalaApps] = useState<any[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [memberRecord, setMemberRecord] = useState<any>(null);
  const [memberProfile, setMemberProfile] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [editingProfile, setEditingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ full_name: '', phone: '', address: '', city: '', postcode: '' });
  const tabParam = searchParams.get('tab') as TabId | null;
  const validTabs: TabId[] = ['overview', 'applications', 'payments', 'profile', 'notifications', 'security'];
  const initialTab = tabParam && validTabs.includes(tabParam) ? tabParam : 'overview';
  const [activeTab, setActiveTab] = useState<TabId>(initialTab);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const [activatingMembership, setActivatingMembership] = useState(false);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  useEffect(() => {
    if (!membershipApp || memberRecord || activatingMembership || loading) return;

    if (membershipApp.payment_status === 'paid' && !memberRecord) {
      activateMembershipAutomatically();
    }
  }, [membershipApp, memberRecord, loading]);

  const activateMembershipAutomatically = async () => {
    if (!user || !membershipApp) return;

    setActivatingMembership(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/activate-membership`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          application_id: membershipApp.id,
          user_id: user.id,
        }),
      });

      const result = await response.json();

      if (result.success) {
        showToast(
          isRTL ? 'تم تفعيل عضويتك بنجاح!' : 'Your membership has been activated successfully!',
          'success'
        );
        await fetchData();
      } else {
        console.error('Auto-activation failed:', result.error);
      }
    } catch (error) {
      console.error('Error auto-activating membership:', error);
    } finally {
      setActivatingMembership(false);
    }
  };

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [membershipRes, memberByIdRes, memberByEmailRes, profileRes, wakalaRes, paymentsRes, notifRes] = await Promise.all([
        supabase
          .from('membership_applications')
          .select('*')
          .eq('email', user.email)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from('members')
          .select('*')
          .eq('id', user.id)
          .maybeSingle(),
        supabase
          .from('members')
          .select('*')
          .eq('email', user.email)
          .maybeSingle(),
        supabase
          .from('member_profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle(),
        supabase
          .from('wakala_applications')
          .select('*, availability_slots(service_id)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('donations')
          .select('*')
          .eq('email', user.email)
          .order('created_at', { ascending: false }),
        supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(50),
      ]);

      const resolvedMember = memberByIdRes.data || memberByEmailRes.data;
      setMembershipApp(membershipRes.data);
      setMemberRecord(resolvedMember);
      setMemberProfile(profileRes.data);
      setWakalaApps(wakalaRes.data || []);
      setPaymentHistory(paymentsRes.data || []);
      setNotifications(notifRes.data || []);
      setUnreadCount((notifRes.data || []).filter((n: any) => !n.is_read).length);

      if (!profileRes.data?.onboarding_completed) {
        setShowWelcome(true);
      }

      const profile = profileRes.data;
      const member = resolvedMember;
      const membership = membershipRes.data;

      const nameSource = profile?.full_name || user.user_metadata?.full_name ||
        (member ? `${member.first_name || ''} ${member.last_name || ''}`.trim() : '') ||
        membership?.full_name || '';

      setProfileForm({
        full_name: nameSource,
        phone: profile?.phone || member?.phone || membership?.phone || '',
        address: profile?.address || member?.address || membership?.address || '',
        city: profile?.city || member?.city || '',
        postcode: profile?.postcode || member?.postcode || '',
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setSavingProfile(true);
    try {
      await supabase
        .from('member_profiles')
        .upsert({
          id: user.id,
          full_name: profileForm.full_name,
          phone: profileForm.phone,
          address: profileForm.address,
          city: profileForm.city,
          postcode: profileForm.postcode,
          updated_at: new Date().toISOString(),
        });

      if (memberRecord) {
        await supabase
          .from('members')
          .update({
            phone: profileForm.phone,
            address: profileForm.address,
            city: profileForm.city,
            postcode: profileForm.postcode,
          })
          .eq('email', user.email);
      }

      await supabase.auth.updateUser({ data: { full_name: profileForm.full_name, phone: profileForm.phone } });
      setEditingProfile(false);
      showToast(t.profileUpdated, 'success');
      fetchData();
    } catch {
      showToast(t.profileError, 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleCancelAppointment = async (app: any) => {
    if (!confirm(t.confirmCancel)) return;
    if (!app.slot_id || !app.duration_minutes || !app.booking_date || !app.start_time) {
      showToast(t.cancelError, 'error');
      return;
    }
    const serviceId = app.availability_slots?.service_id;
    if (!serviceId) {
      showToast(t.cancelError, 'error');
      return;
    }
    try {
      const result = await cancelBooking(app.id, app.slot_id, serviceId, app.duration_minutes, app.booking_date, app.start_time);
      if (result.success) {
        showToast(t.cancelSuccess, 'success');
        fetchData();
      } else {
        showToast(result.error || t.cancelError, 'error');
      }
    } catch {
      showToast(t.cancelError, 'error');
    }
  };

  const avatarUrl = memberProfile?.avatar_url || user?.user_metadata?.avatar_url || '';
  const displayName = profileForm.full_name || user?.user_metadata?.full_name || '';
  const initials = displayName
    ? displayName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : (user?.email?.[0] || '?').toUpperCase();

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span className="text-muted">{t.loading}</span>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <PageHeader title={t.title} description={t.subtitle} />

      {membershipApp && !memberRecord && activatingMembership && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg mb-6" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="flex items-start gap-3">
              <Loader2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5 animate-spin" />
              <div className="flex-1">
                <h3 className="text-sm font-bold text-blue-900 mb-1">
                  {isRTL ? 'جاري تفعيل العضوية' : 'Activating Membership'}
                </h3>
                <p className="text-sm text-blue-800">
                  {isRTL
                    ? 'جاري تفعيل عضويتك وإنشاء رقم العضوية الخاص بك. يرجى الانتظار...'
                    : 'Activating your membership and generating your membership number. Please wait...'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {membershipApp && !memberRecord && !activatingMembership && membershipApp.payment_status !== 'paid' && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-lg mb-6" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-bold text-amber-900 mb-1">
                  {isRTL ? 'يجب إكمال الدفع' : 'Payment Required'}
                </h3>
                <p className="text-sm text-amber-800 mb-3">
                  {isRTL
                    ? 'يرجى إكمال دفع رسوم العضوية للوصول إلى جميع الخدمات. سيتم تفعيل حسابك فوراً بعد الدفع وسيتم منحك رقم عضوية YCA.'
                    : 'Please complete your membership payment to access all services. Your account will be activated immediately after payment and you will receive your YCA membership number.'
                  }
                </p>
                <a
                  href={`/member/payment?amount=${membershipApp.membership_type === 'individual' ? '10' : membershipApp.membership_type === 'family' ? '20' : membershipApp.membership_type === 'student' ? '5' : membershipApp.custom_amount || '50'}&application_id=${membershipApp.id}`}
                  className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors text-sm"
                >
                  <CreditCard className="w-4 h-4" />
                  {isRTL ? 'ادفع الآن' : 'Pay Now'}
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="bg-white rounded-xl border border-divider p-4 sm:p-5 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-sand flex items-center justify-center flex-shrink-0 border border-divider">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-sm font-bold text-primary">{initials}</span>
                )}
              </div>
              <div className="min-w-0">
                <h2 className="text-base font-bold text-primary truncate">
                  {displayName || user?.email}
                </h2>
                <p className="text-xs text-muted truncate">{user?.email}</p>
              </div>
              {memberRecord && (
                <span className={`hidden sm:inline-flex px-3 py-1 rounded-full text-xs font-semibold border ${
                  memberRecord.status === 'active'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-red-50 text-red-700 border-red-200'
                }`}>
                  {memberRecord.status === 'active' ? t.active : t.expired}
                </span>
              )}
            </div>
            <button
              onClick={() => signOut()}
              className="flex items-center gap-2 text-sm text-muted hover:text-primary font-medium transition-colors"
            >
              <LogOut className="w-4 h-4" />
              {t.logout}
            </button>
          </div>
        </div>

        <div className="flex gap-1 mb-8 border-b border-divider overflow-x-auto scrollbar-hide">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  isActive
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted hover:text-primary hover:border-border'
                }`}
              >
                <Icon className="w-4 h-4" />
                {t[tab.labelKey as keyof typeof t]}
                {tab.id === 'notifications' && unreadCount > 0 && (
                  <span className="absolute -top-0.5 end-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'overview' && (
              <OverviewTab
                memberRecord={memberRecord}
                membershipApp={membershipApp}
                wakalaApps={wakalaApps}
                paymentHistory={paymentHistory}
                notifications={notifications}
                onNewWakala={() => {}}
                t={t}
              />
            )}
            {activeTab === 'applications' && (
              <ApplicationsTab
                wakalaApps={wakalaApps}
                onCancelAppointment={handleCancelAppointment}
                t={t}
              />
            )}
            {activeTab === 'payments' && (
              <PaymentsTab paymentHistory={paymentHistory} t={t} />
            )}
            {activeTab === 'notifications' && (
              <NotificationsTab
                notifications={notifications}
                onRefresh={fetchData}
                t={t}
              />
            )}
            {activeTab === 'security' && (
              <SecurityTab t={t} />
            )}
            {activeTab === 'profile' && (
              <ProfileTab
                user={user}
                memberRecord={memberRecord}
                memberProfile={memberProfile}
                profileForm={profileForm}
                setProfileForm={setProfileForm}
                editingProfile={editingProfile}
                setEditingProfile={setEditingProfile}
                savingProfile={savingProfile}
                handleSaveProfile={handleSaveProfile}
                onProfileUpdate={fetchData}
                t={t}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-lg shadow-xl flex items-center gap-2.5 ${
              toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
            }`}
          >
            {toast.type === 'success'
              ? <CheckCircle className="w-5 h-5 flex-shrink-0" />
              : <XCircle className="w-5 h-5 flex-shrink-0" />
            }
            <span className="text-sm font-medium">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <WelcomeModal isOpen={showWelcome} onClose={() => setShowWelcome(false)} />

    </Layout>
  );
}
