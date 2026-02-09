import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, FileText, CheckCircle, XCircle, CreditCard, ExternalLink, MessageSquare, Edit2, Trash2 } from 'lucide-react';
import { staggerContainer, staggerItem } from '../../../lib/animations';
import { formatTimeRange } from '../../../lib/booking-utils';
import { useLanguage } from '../../../contexts/LanguageContext';
import EditWakalaModal from '../../../components/modals/EditWakalaModal';

interface Props {
  wakalaApps: any[];
  onCancelAppointment: (app: any) => void;
  onRefresh: () => void;
  t: Record<string, string>;
}

const statusConfig: Record<string, { bg: string; text: string; icon: typeof CheckCircle }> = {
  submitted: { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700', icon: CheckCircle },
  in_progress: { bg: 'bg-sky-50 border-sky-200', text: 'text-sky-700', icon: Clock },
  completed: { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', icon: CheckCircle },
  approved: { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', icon: CheckCircle },
  rejected: { bg: 'bg-red-50 border-red-200', text: 'text-red-700', icon: XCircle },
  cancelled: { bg: 'bg-red-50 border-red-200', text: 'text-red-700', icon: XCircle },
  pending: { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', icon: Clock },
};

function StatusBadge({ status, t }: { status: string; t: Record<string, string> }) {
  const c = statusConfig[status] || { bg: 'bg-gray-50 border-gray-200', text: 'text-gray-600', icon: Clock };
  const Icon = c.icon;
  const label = t[status] || status.replace(/_/g, ' ');
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${c.bg} ${c.text}`}>
      <Icon className="w-3.5 h-3.5" /> {label}
    </span>
  );
}

function isAdvisory(serviceType: string) {
  return serviceType?.startsWith('advisory_');
}

function getAdvisoryReasonLabel(serviceType: string, language: string) {
  const reason = serviceType.replace('advisory_', '');
  const labels: Record<string, Record<string, string>> = {
    en: {
      welfare_benefits: 'Welfare Benefits',
      housing: 'Housing',
      immigration: 'Immigration',
      employment: 'Employment',
      education: 'Education',
      health: 'Health',
      legal: 'Legal',
      other: 'Other',
    },
    ar: {
      welfare_benefits: 'المزايا الاجتماعية',
      housing: 'الإسكان',
      immigration: 'الهجرة',
      employment: 'التوظيف',
      education: 'التعليم',
      health: 'الصحة',
      legal: 'قانوني',
      other: 'أخرى',
    },
  };
  return labels[language]?.[reason] || reason;
}

function getWakalaTypeLabel(wakalaType: string, language: string) {
  const labels: Record<string, Record<string, string>> = {
    en: {
      general: 'General Power of Attorney',
      specific: 'Specific Power of Attorney',
      property: 'Property Power of Attorney',
      legal: 'Legal Representation',
      financial: 'Financial Power of Attorney',
    },
    ar: {
      general: 'توكيل عام',
      specific: 'توكيل خاص',
      property: 'توكيل عقاري',
      legal: 'توكيل قضائي',
      financial: 'توكيل مالي',
    },
  };
  return labels[language]?.[wakalaType] || wakalaType;
}

function AdvisoryCard({ app, onCancel, t, language }: { app: any; onCancel: (a: any) => void; t: Record<string, string>; language: string }) {
  const isCancelled = app.status === 'cancelled' || app.cancelled_at;
  const isPast = app.booking_date && new Date(app.booking_date) < new Date();
  const canCancel = app.booking_date && !isCancelled && !isPast;

  return (
    <motion.div
      variants={staggerItem}
      className={`bg-white rounded-xl border p-5 transition-shadow hover:shadow-md ${isCancelled ? 'border-red-200 bg-red-50/30' : 'border-divider'}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full">
              <MessageSquare className="w-3.5 h-3.5" />
              {language === 'ar' ? 'موعد استشاري' : 'Advisory Appointment'}
            </span>
            <StatusBadge status={isCancelled ? 'cancelled' : app.status} t={t} />
          </div>

          <div className="mb-2">
            <span className="text-sm text-gray-600">
              {language === 'ar' ? 'السبب: ' : 'Reason: '}
            </span>
            <span className="text-sm font-semibold text-gray-900">
              {getAdvisoryReasonLabel(app.service_type, language)}
            </span>
          </div>

          {app.booking_date && app.start_time && app.end_time && (
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {new Date(app.booking_date).toLocaleDateString()}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {formatTimeRange(app.start_time, app.end_time)}
                {app.duration_minutes && (
                  <span className="text-xs font-medium text-primary/60">
                    ({app.duration_minutes} {t.minutes})
                  </span>
                )}
              </span>
            </div>
          )}

          {isCancelled && app.cancelled_at && (
            <p className="text-xs text-red-500 mt-2">
              {t.cancelled} - {new Date(app.cancelled_at).toLocaleString()}
            </p>
          )}
        </div>
        {canCancel && (
          <button onClick={() => onCancel(app)}
            className="text-xs px-3 py-1.5 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium flex-shrink-0">
            {t.cancelAppointment}
          </button>
        )}
      </div>
    </motion.div>
  );
}

function WakalaCard({ app, t, language, onEdit, onDelete }: { app: any; t: Record<string, string>; language: string; onEdit: (app: any) => void; onDelete: (app: any) => void }) {
  const isCancelled = app.status === 'cancelled';
  const canEdit = ['pending', 'submitted', 'pending_payment'].includes(app.status);

  return (
    <motion.div
      variants={staggerItem}
      className={`bg-white rounded-xl border p-5 transition-shadow hover:shadow-md ${isCancelled ? 'border-red-200 bg-red-50/30' : 'border-divider'}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
              <FileText className="w-3.5 h-3.5" />
              {language === 'ar' ? 'طلب وكالة' : 'Wakala Application'}
            </span>
            <StatusBadge status={isCancelled ? 'cancelled' : app.status} t={t} />
          </div>

          {app.wakala_type && (
            <div className="mb-2">
              <span className="text-sm text-gray-600">
                {language === 'ar' ? 'نوع الوكالة: ' : 'Wakala Type: '}
              </span>
              <span className="text-sm font-semibold text-gray-900">
                {getWakalaTypeLabel(app.wakala_type, language)}
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 text-sm">
            {app.applicant_name && (
              <div>
                <span className="text-gray-500">{language === 'ar' ? 'الموكّل: ' : 'Applicant: '}</span>
                <span className="text-gray-900 font-medium">{app.applicant_name}</span>
              </div>
            )}
            {app.agent_name && (
              <div>
                <span className="text-gray-500">{language === 'ar' ? 'الوكيل: ' : 'Agent: '}</span>
                <span className="text-gray-900 font-medium">{app.agent_name}</span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-4 mt-3 text-sm">
            {app.fee_amount !== null && app.fee_amount !== undefined && (
              <span className="inline-flex items-center gap-1.5 text-gray-600">
                <CreditCard className="w-4 h-4" />
                {app.fee_amount === 0
                  ? (language === 'ar' ? 'مجاناً' : 'Free')
                  : `\u00A3${app.fee_amount}`}
                {app.payment_status === 'paid' && (
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                )}
              </span>
            )}
            <span className="text-xs text-gray-400">
              {new Date(app.created_at).toLocaleDateString()}
            </span>
          </div>

          {(app.applicant_passport_url || app.attorney_passport_url) && (
            <div className="mt-3 flex flex-wrap gap-2">
              {app.applicant_passport_url && (
                <a href={app.applicant_passport_url} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium">
                  <ExternalLink className="w-3 h-3" />
                  {language === 'ar' ? 'جواز الموكل' : 'Applicant Passport'}
                </a>
              )}
              {app.attorney_passport_url && (
                <a href={app.attorney_passport_url} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium">
                  <ExternalLink className="w-3 h-3" />
                  {language === 'ar' ? 'جواز الوكيل' : 'Attorney Passport'}
                </a>
              )}
            </div>
          )}

          {canEdit && (
            <div className="mt-4 pt-4 border-t border-gray-200 flex gap-2">
              <button
                onClick={() => onEdit(app)}
                className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-lg hover:bg-emerald-100 transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
                {language === 'ar' ? 'تعديل' : 'Edit'}
              </button>
              <button
                onClick={() => onDelete(app)}
                className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-medium text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded-lg hover:bg-red-100 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {language === 'ar' ? 'حذف' : 'Delete'}
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function ApplicationsTab({ wakalaApps, onCancelAppointment, onRefresh, t }: Props) {
  const { language } = useLanguage();
  const [editingApp, setEditingApp] = useState<any | null>(null);
  const [deletingApp, setDeletingApp] = useState<any | null>(null);

  if (wakalaApps.length === 0) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-xl border border-divider p-12 text-center">
        <div className="w-16 h-16 rounded-full bg-sand flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-muted" />
        </div>
        <p className="text-muted font-medium">{t.noWakala}</p>
      </motion.div>
    );
  }

  const advisoryApps = wakalaApps.filter(a => isAdvisory(a.service_type));
  const wakalaOnlyApps = wakalaApps.filter(a => !isAdvisory(a.service_type));

  const handleEditSuccess = () => {
    setEditingApp(null);
    onRefresh();
  };

  const handleDelete = (app: any) => {
    setDeletingApp(app);
  };

  const confirmDelete = async () => {
    if (!deletingApp) return;

    try {
      const { supabase } = await import('../../../lib/supabase');
      const { error } = await supabase
        .from('wakala_applications')
        .delete()
        .eq('id', deletingApp.id);

      if (error) throw error;

      setDeletingApp(null);
      onRefresh();
    } catch (err) {
      console.error('Error deleting application:', err);
      alert(language === 'ar' ? 'فشل حذف الطلب' : 'Failed to delete application');
    }
  };

  return (
    <>
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
        {advisoryApps.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">
              {language === 'ar' ? 'المواعيد الاستشارية' : 'Advisory Appointments'}
            </h3>
            {advisoryApps.map(app => (
              <AdvisoryCard key={app.id} app={app} onCancel={onCancelAppointment} t={t} language={language} />
            ))}
          </div>
        )}

        {wakalaOnlyApps.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">
              {language === 'ar' ? 'طلبات الوكالة' : 'Wakala Applications'}
            </h3>
            {wakalaOnlyApps.map(app => (
              <WakalaCard
                key={app.id}
                app={app}
                t={t}
                language={language}
                onEdit={setEditingApp}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </motion.div>

      {editingApp && (
        <EditWakalaModal
          application={editingApp}
          onClose={() => setEditingApp(null)}
          onSuccess={handleEditSuccess}
        />
      )}

      {deletingApp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setDeletingApp(null)}>
          <div
            className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
            dir={language === 'ar' ? 'rtl' : 'ltr'}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  {language === 'ar' ? 'تأكيد الحذف' : 'Confirm Delete'}
                </h3>
                <p className="text-sm text-gray-600">
                  {language === 'ar'
                    ? 'هل أنت متأكد من حذف هذا الطلب؟ هذا الإجراء لا يمكن التراجع عنه.'
                    : 'Are you sure you want to delete this application? This action cannot be undone.'}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDeletingApp(null)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2.5 px-4 rounded-lg transition-colors"
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors"
              >
                {language === 'ar' ? 'حذف' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
