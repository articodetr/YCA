import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, FileText, CreditCard, Plus, ArrowRight, MessageSquare } from 'lucide-react';
import { staggerContainer, staggerItem } from '../../../lib/animations';

interface Props {
  memberRecord: any;
  membershipApp: any;
  wakalaApps: any[];
  paymentHistory: any[];
  onNewWakala: () => void;
  onNewAdvisory?: () => void;
  t: Record<string, string>;
}

function StatusBadge({ status, t }: { status: string; t: Record<string, string> }) {
  const config: Record<string, { bg: string; text: string; label: string }> = {
    approved: { bg: 'bg-emerald-50', text: 'text-emerald-700', label: t.approved },
    paid: { bg: 'bg-emerald-50', text: 'text-emerald-700', label: t.paid },
    submitted: { bg: 'bg-blue-50', text: 'text-blue-700', label: t.submitted || 'Submitted' },
    pending: { bg: 'bg-amber-50', text: 'text-amber-700', label: t.pending },
    pending_payment: { bg: 'bg-amber-50', text: 'text-amber-700', label: t.pending_payment || t.pending },
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

function isAdvisory(serviceType: string) {
  return serviceType?.startsWith('advisory_');
}

export default function OverviewTab({ memberRecord, membershipApp, wakalaApps, paymentHistory, onNewWakala, onNewAdvisory, t }: Props) {
  const language = (t.approved === 'موافق عليه' || t.cancelled === 'ملغي') ? 'ar' : 'en';

  const totalPaid = paymentHistory
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const advisoryCount = wakalaApps.filter(a => isAdvisory(a.service_type)).length;
  const wakalaCount = wakalaApps.filter(a => !isAdvisory(a.service_type)).length;

  const recentItems = [
    ...wakalaApps.slice(0, 3).map(app => ({
      type: isAdvisory(app.service_type) ? 'advisory' as const : 'application' as const,
      title: isAdvisory(app.service_type)
        ? (language === 'ar' ? 'موعد استشاري' : 'Advisory Appointment')
        : (language === 'ar' ? 'طلب وكالة' : 'Wakala Application'),
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

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
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
            <span className="text-sm text-muted">{language === 'ar' ? 'استشارات' : 'Advisory'}</span>
          </div>
          <p className="text-2xl font-bold text-primary">{advisoryCount}</p>
        </div>

        <div className="bg-white rounded-xl border border-divider p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-sand flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <span className="text-sm text-muted">{language === 'ar' ? 'وكالات' : 'Wakala'}</span>
          </div>
          <p className="text-2xl font-bold text-primary">{wakalaCount}</p>
        </div>

        <div className="bg-white rounded-xl border border-divider p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-sand flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-primary" />
            </div>
            <span className="text-sm text-muted">{t.totalPaid}</span>
          </div>
          <p className="text-2xl font-bold text-primary">{totalPaid}</p>
        </div>
      </motion.div>

      <motion.div variants={staggerItem} className="flex flex-wrap gap-3">
        <Link
          to="/book"
          className="flex items-center gap-2 bg-primary hover:bg-secondary text-white font-medium py-2.5 px-5 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          {language === 'ar' ? 'حجز موعد جديد' : 'Book an Appointment'}
        </Link>
        {!membershipApp && (
          <Link
            to="/get-involved/membership"
            className="flex items-center gap-2 border border-primary text-primary hover:bg-sand font-medium py-2.5 px-5 rounded-lg transition-colors"
          >
            {t.applyMembership}
            <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </motion.div>

      <motion.div variants={staggerItem} className="bg-white rounded-xl border border-divider p-5">
        <h3 className="text-base font-bold text-primary mb-4">{t.recentActivity}</h3>
        {recentItems.length > 0 ? (
          <div className="space-y-1">
            {recentItems.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 py-3 border-b border-divider last:border-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  item.type === 'advisory' ? 'bg-blue-50' : item.type === 'payment' ? 'bg-emerald-50' : 'bg-amber-50'
                }`}>
                  {item.type === 'advisory'
                    ? <MessageSquare className="w-4 h-4 text-blue-600" />
                    : item.type === 'payment'
                      ? <CreditCard className="w-4 h-4 text-emerald-600" />
                      : <FileText className="w-4 h-4 text-amber-600" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-primary truncate">{item.title}</p>
                  <p className="text-xs text-muted">{new Date(item.date).toLocaleDateString()}</p>
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
