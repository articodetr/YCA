import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  User,
  FileText,
  Calendar,
  CreditCard,
  LogOut,
  Loader2,
  CheckCircle,
  Clock,
  XCircle,
  Mail,
  Phone,
  MapPin,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../../contexts/LanguageContext';
import { useMemberAuth } from '../../contexts/MemberAuthContext';
import Layout from '../../components/Layout';
import PageHeader from '../../components/PageHeader';
import WakalaBookingModal from '../../components/modals/WakalaBookingModal';
import { cancelBooking, formatTimeRange } from '../../lib/booking-utils';

export default function MemberDashboard() {
  const { user, signOut } = useMemberAuth();
  const { language } = useLanguage();
  const location = useLocation();
  const isRTL = language === 'ar';

  const [loading, setLoading] = useState(true);
  const [membershipApp, setMembershipApp] = useState<any>(null);
  const [wakalaApps, setWakalaApps] = useState<any[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [showWakalaModal, setShowWakalaModal] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  const translations = {
    en: {
      title: 'Member Dashboard',
      subtitle: 'Manage your account',
      profile: 'Profile',
      membership: 'Membership',
      wakalaApplications: 'Wakala Applications',
      paymentHistory: 'Payment History',
      newWakalaApp: 'New Wakala Application',
      logout: 'Logout',
      status: 'Status',
      type: 'Type',
      date: 'Date',
      amount: 'Amount',
      actions: 'Actions',
      view: 'View',
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
      appointmentTime: 'Appointment Time',
      duration: 'Duration',
      minutes: 'minutes',
    },
    ar: {
      title: 'لوحة تحكم الأعضاء',
      subtitle: 'إدارة حسابك',
      profile: 'الملف الشخصي',
      membership: 'العضوية',
      wakalaApplications: 'طلبات الوكالة',
      paymentHistory: 'سجل المدفوعات',
      newWakalaApp: 'طلب وكالة جديد',
      logout: 'تسجيل الخروج',
      status: 'الحالة',
      type: 'النوع',
      date: 'التاريخ',
      amount: 'المبلغ',
      actions: 'الإجراءات',
      view: 'عرض',
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
      appointmentTime: 'وقت الموعد',
      duration: 'المدة',
      minutes: 'دقيقة',
    },
  };

  const t = translations[language];

  useEffect(() => {
    fetchData();
  }, [user]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('openWakala') === 'true') {
      setShowWakalaModal(true);
    }
  }, [location]);

  const fetchData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data: membership } = await supabase
        .from('membership_applications')
        .select('*')
        .eq('email', user.email)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      setMembershipApp(membership);

      const { data: memberData } = await supabase
        .from('members')
        .select('*')
        .eq('email', user.email)
        .maybeSingle();

      setUserData(memberData || membership);

      const { data: wakala } = await supabase
        .from('wakala_applications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      setWakalaApps(wakala || []);

      const { data: payments } = await supabase
        .from('donations')
        .select('*')
        .eq('email', user.email)
        .order('created_at', { ascending: false });

      setPaymentHistory(payments || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const handleCancelAppointment = async (app: any) => {
    if (!confirm(t.confirmCancel)) return;

    if (!app.slot_id || !app.duration_minutes || !app.booking_date || !app.start_time) {
      alert(t.cancelError);
      return;
    }

    try {
      const result = await cancelBooking(
        app.id,
        app.slot_id,
        app.duration_minutes,
        app.booking_date,
        app.start_time
      );

      if (result.success) {
        alert(t.cancelSuccess);
        fetchData();
      } else {
        alert(result.error || t.cancelError);
      }
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      alert(t.cancelError);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
      case 'paid':
        return <CheckCircle className="w-5 h-5 text-emerald-600" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-amber-600" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return t.approved;
      case 'pending':
        return t.pending;
      case 'rejected':
        return t.rejected;
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          <span className="ml-3 text-gray-600">{t.loading}</span>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <PageHeader title={t.title} subtitle={t.subtitle} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
              <div className="text-center">
                <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-12 h-12 text-emerald-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  {user?.user_metadata?.full_name || user?.email}
                </h2>
                <p className="text-sm text-gray-600 mt-1">{user?.email}</p>
              </div>

              <div className="space-y-3 pt-6 border-t border-gray-200">
                {user?.user_metadata?.phone && (
                  <div className="flex items-center gap-3 text-gray-600">
                    <Phone className="w-5 h-5" />
                    <span className="text-sm">{user.user_metadata.phone}</span>
                  </div>
                )}
                {membershipApp?.address && (
                  <div className="flex items-center gap-3 text-gray-600">
                    <MapPin className="w-5 h-5" />
                    <span className="text-sm">
                      {membershipApp.address}, {membershipApp.city} {membershipApp.postcode}
                    </span>
                  </div>
                )}
              </div>

              <div className="pt-6 border-t border-gray-200 space-y-3">
                <button
                  onClick={() => setShowWakalaModal(true)}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <FileText className="w-5 h-5" />
                  {t.newWakalaApp}
                </button>

                <button
                  onClick={handleSignOut}
                  className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <LogOut className="w-5 h-5" />
                  {t.logout}
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-6 h-6" />
                {t.membership}
              </h3>
              {membershipApp ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{membershipApp.membership_type}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(membershipApp.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(membershipApp.status)}
                      <span className="text-sm font-medium">{getStatusText(membershipApp.status)}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">{t.noMembership}</p>
                  <Link
                    to="/get-involved/membership"
                    className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
                  >
                    {t.applyMembership}
                  </Link>
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-6 h-6" />
                {t.wakalaApplications}
              </h3>
              {wakalaApps.length > 0 ? (
                <div className="space-y-4">
                  {wakalaApps.map((app) => {
                    const isCancelled = app.status === 'cancelled' || app.cancelled_at;
                    const isPastAppointment = app.booking_date && new Date(app.booking_date) < new Date();
                    const canCancel = app.booking_date && !isCancelled && !isPastAppointment;

                    return (
                      <div key={app.id} className={`p-4 rounded-lg border-2 ${
                        isCancelled ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'
                      }`}>
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <p className="font-bold text-gray-900 mb-1">{app.service_type}</p>
                            {app.booking_date && app.start_time && app.end_time && (
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 text-sm text-gray-700">
                                  <Calendar className="w-4 h-4" />
                                  <span>{new Date(app.booking_date).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-700">
                                  <Clock className="w-4 h-4" />
                                  <span>{formatTimeRange(app.start_time, app.end_time)}</span>
                                  {app.duration_minutes && (
                                    <span className="text-xs text-blue-600 font-medium">
                                      ({app.duration_minutes} {t.minutes})
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                            {isCancelled && app.cancelled_at && (
                              <p className="text-xs text-red-600 mt-2">
                                {t.cancelled} - {new Date(app.cancelled_at).toLocaleString()}
                              </p>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(app.status)}
                              <span className="text-sm font-medium">{getStatusText(app.status)}</span>
                            </div>
                            {canCancel && (
                              <button
                                onClick={() => handleCancelAppointment(app)}
                                className="text-xs px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors font-medium"
                              >
                                {t.cancelAppointment}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-center text-gray-600 py-8">{t.noWakala}</p>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard className="w-6 h-6" />
                {t.paymentHistory}
              </h3>
              {paymentHistory.length > 0 ? (
                <div className="space-y-4">
                  {paymentHistory.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">£{payment.amount}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(payment.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(payment.status)}
                        <span className="text-sm font-medium">{getStatusText(payment.status)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-600 py-8">{t.noPayments}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <WakalaBookingModal
        isOpen={showWakalaModal}
        onClose={() => setShowWakalaModal(false)}
        userData={userData}
        onSuccess={() => {
          setShowWakalaModal(false);
          fetchData();
        }}
      />
    </Layout>
  );
}
