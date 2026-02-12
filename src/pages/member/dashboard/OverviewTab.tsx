import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Shield, CreditCard, Plus, MessageSquare,
  Bell, Calendar, Handshake, BookOpen, AlertTriangle, ArrowRight,
} from 'lucide-react';
import { staggerContainer, staggerItem } from '../../../lib/animations';
import { useLanguage } from '../../../contexts/LanguageContext';
import MembershipCard from '../../../components/member/MembershipCard';

interface Props {
  memberRecord: any;
  membershipApp: any;
  bookings: any[];
  paymentHistory: any[];
  notifications: any[];
  t: Record<string, string>;
}

function StatusBadge({ status, t }: { status: string; t: Record<string, string> }) {
  const config: Record<string, { bg: string; text: string; label: string }> = {
    approved: { bg: 'bg-emerald-50', text: 'text-emerald-700', label: t.approved },
    paid: { bg: 'bg-emerald-50', text: 'text-emerald-700', label: t.paid },
    submitted: { bg: 'bg-blue-50', text: 'text-blue-700', label: t.submitted || 'Submitted' },
    pending: { bg: 'bg-amber-50', text: 'text-amber-700', label: t.pending },
    in_progress: { bg: 'bg-sky-50', text: 'text-sky-700', label: t.in_progress || 'In Progress' },
    completed: { bg: 'bg-emerald-50', text: 'text-emerald-700', label: t.completed || t.approved },
    rejected: { bg: 'bg-red-50', text: 'text-red-700', label: t.rejected },
    cancelled: { bg: 'bg-red-50', text: 'text-red-700', label: t.cancelled },
  };
  const c = config[status] || { bg: 'bg-gray-100', text: 'text-gray-600', label: status };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${c.bg} ${c.text}`}>
      {c.label}
    </span>
  );
}

export default function OverviewTab({ memberRecord, membershipApp, bookings, paymentHistory, notifications, t }: Props) {
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  const totalPaid = paymentHistory
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const bookingCount = bookings.length;
  const unreadNotifs = notifications.filter(n => !n.is_read).length;

  const upcomingAppointments = bookings
    .filter(a => a.booking_date && new Date(a.booking_date) >= new Date() && a.status !== 'cancelled')
    .sort((a, b) => new Date(a.booking_date).getTime() - new Date(b.booking_date).getTime())
    .slice(0, 3);

  const recentItems = [
    ...bookings.slice(0, 3).map(app => ({
      type: 'advisory' as const,
      title: language === 'ar' ? 'موعد استشاري' : 'Advisory Appointment',
      date: app.created_at,
      status: app.status,
    })),
    ...paymentHistory.slice(0, 3).map(p => ({
      type: 'payment' as const,
      title: `\u00A3${p.amount}`,
      date: p.created_at,
      status: p.status,
    })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const daysUntilExpiry = memberRecord?.expiry_date
    ? Math.ceil((new Date(memberRecord.expiry_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  const showRenewalBanner = memberRecord && daysUntilExpiry !== null && daysUntilExpiry <= 30;

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      {memberRecord && (
        <motion.div variants={staggerItem}>
          <MembershipCard />
        </motion.div>
      )}

      {showRenewalBanner && (
        <motion.div variants={staggerItem}>
          <div className={`rounded-xl p-5 border ${
            daysUntilExpiry <= 0
              ? 'bg-red-50 border-red-200'
              : 'bg-amber-50 border-amber-200'
          }`}>
            <div className="flex items-start gap-3">
              <AlertTriangle className={`w-6 h-6 flex-shrink-0 mt-0.5 ${
                daysUntilExpiry <= 0 ? 'text-red-600' : 'text-amber-600'
              }`} />
              <div className="flex-1">
                <h3 className={`font-bold ${daysUntilExpiry <= 0 ? 'text-red-800' : 'text-amber-800'}`}>
                  {daysUntilExpiry <= 0
                    ? (language === 'ar' ? 'انتهت عضويتك!' : 'Your membership has expired!')
                    : (language === 'ar'
                        ? `عضويتك ستنتهي خلال ${daysUntilExpiry} يوم`
                        : `Your membership expires in ${daysUntilExpiry} days`)
                  }
                </h3>
                <p className={`text-sm mt-1 ${daysUntilExpiry <= 0 ? 'text-red-700' : 'text-amber-700'}`}>
                  {language === 'ar'
                    ? 'جدد عضويتك الآن للاستمرار في الاستفادة من المزايا.'
                    : 'Renew now to keep enjoying your member benefits.'
                  }
                </p>
                <Link
                  to="/member/renew"
                  className={`inline-flex items-center gap-2 mt-3 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors ${
                    daysUntilExpiry <= 0
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-amber-600 hover:bg-amber-700'
                  }`}
                >
                  {language === 'ar' ? 'جدد الآن' : 'Renew Now'}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <motion.div variants={staggerItem} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-divider p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-sand flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <span className="text-sm text-muted">{t.membershipStatus}</span>
          </div>
          <p className="text-2xl font-bold text-primary">
            {memberRecord ? (memberRecord.status === 'active' ? t.active : t.expired) : '--'}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-divider p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm text-muted">{language === 'ar' ? 'الحجوزات' : 'Bookings'}</span>
          </div>
          <p className="text-2xl font-bold text-primary">{bookingCount}</p>
        </div>

        <div className="bg-white rounded-xl border border-divider p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-sand flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-primary" />
            </div>
            <span className="text-sm text-muted">{t.totalPaid}</span>
          </div>
          <p className="text-2xl font-bold text-primary">{`\u00A3${totalPaid}`}</p>
        </div>
      </motion.div>

      <motion.div variants={staggerItem}>
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">
          {t.quickActions || (language === 'ar' ? 'إجراءات سريعة' : 'Quick Actions')}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link
            to="/book"
            className="flex flex-col items-center gap-2 bg-white rounded-xl border border-divider p-4 hover:border-primary hover:shadow-md transition-all group"
          >
            <div className="w-10 h-10 rounded-lg bg-primary/5 group-hover:bg-primary/10 flex items-center justify-center transition-colors">
              <Plus className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xs font-medium text-primary text-center">
              {language === 'ar' ? 'حجز موعد' : 'Book Appointment'}
            </span>
          </Link>

          <Link
            to="/services"
            className="flex flex-col items-center gap-2 bg-white rounded-xl border border-divider p-4 hover:border-primary hover:shadow-md transition-all group"
          >
            <div className="w-10 h-10 rounded-lg bg-primary/5 group-hover:bg-primary/10 flex items-center justify-center transition-colors">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xs font-medium text-primary text-center">
              {language === 'ar' ? 'الخدمات' : 'Services'}
            </span>
          </Link>

          <Link
            to="/events"
            className="flex flex-col items-center gap-2 bg-white rounded-xl border border-divider p-4 hover:border-primary hover:shadow-md transition-all group"
          >
            <div className="w-10 h-10 rounded-lg bg-primary/5 group-hover:bg-primary/10 flex items-center justify-center transition-colors">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xs font-medium text-primary text-center">
              {language === 'ar' ? 'الفعاليات' : 'Events'}
            </span>
          </Link>

          {!membershipApp ? (
            <Link
              to="/membership"
              className="flex flex-col items-center gap-2 bg-white rounded-xl border border-divider p-4 hover:border-primary hover:shadow-md transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/5 group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                <Handshake className="w-5 h-5 text-primary" />
              </div>
              <span className="text-xs font-medium text-primary text-center">
                {t.applyMembership}
              </span>
            </Link>
          ) : (
            <Link
              to="/get-involved/donate"
              className="flex flex-col items-center gap-2 bg-white rounded-xl border border-divider p-4 hover:border-primary hover:shadow-md transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/5 group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                <CreditCard className="w-5 h-5 text-primary" />
              </div>
              <span className="text-xs font-medium text-primary text-center">
                {language === 'ar' ? 'تبرع' : 'Donate'}
              </span>
            </Link>
          )}
        </div>
      </motion.div>

      {upcomingAppointments.length > 0 && (
        <motion.div variants={staggerItem} className="bg-white rounded-xl border border-divider p-5">
          <h3 className="text-base font-bold text-primary mb-4">
            {language === 'ar' ? 'المواعيد القادمة' : 'Upcoming Appointments'}
          </h3>
          <div className="space-y-3">
            {upcomingAppointments.map(app => (
              <div key={app.id} className="flex items-center gap-3 p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-primary">
                    {language === 'ar' ? 'موعد استشاري' : 'Advisory Appointment'}
                  </p>
                  <p className="text-xs text-muted">
                    {new Date(app.booking_date).toLocaleDateString(isRTL ? 'ar-GB' : 'en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
                    {app.start_time && ` - ${app.start_time.slice(0, 5)}`}
                  </p>
                </div>
                <StatusBadge status={app.status} t={t} />
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {unreadNotifs > 0 && (
        <motion.div variants={staggerItem} className="bg-white rounded-xl border border-divider p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-primary flex items-center gap-2">
              <Bell className="w-4 h-4" />
              {language === 'ar' ? 'إشعارات جديدة' : 'New Notifications'}
              <span className="ml-1 min-w-[20px] h-[20px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                {unreadNotifs}
              </span>
            </h3>
          </div>
          <div className="space-y-2">
            {notifications.filter(n => !n.is_read).slice(0, 3).map(n => (
              <div key={n.id} className="flex items-start gap-3 p-3 bg-blue-50/30 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bell className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-primary">
                    {language === 'ar' ? (n.title_ar || n.title) : n.title}
                  </p>
                  <p className="text-xs text-muted mt-0.5 line-clamp-1">
                    {language === 'ar' ? (n.message_ar || n.message) : n.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <motion.div variants={staggerItem} className="bg-white rounded-xl border border-divider p-5">
        <h3 className="text-base font-bold text-primary mb-4">{t.recentActivity}</h3>
        {recentItems.length > 0 ? (
          <div className="space-y-1">
            {recentItems.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 py-3 border-b border-divider last:border-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  item.type === 'advisory' ? 'bg-blue-50' : 'bg-emerald-50'
                }`}>
                  {item.type === 'advisory'
                    ? <MessageSquare className="w-4 h-4 text-blue-600" />
                    : <CreditCard className="w-4 h-4 text-emerald-600" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-primary truncate">{item.title}</p>
                  <p className="text-xs text-muted">{new Date(item.date).toLocaleDateString(isRTL ? 'ar-GB' : 'en-GB')}</p>
                </div>
                <StatusBadge status={item.status} t={t} />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted text-center py-8">{t.noRecentActivity}</p>
        )}
      </motion.div>
    </motion.div>
  );
}
