import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, FileText, Languages, MessageSquare, Scale } from 'lucide-react';
import { staggerContainer, staggerItem } from '../../../lib/animations';
import { useLanguage } from '../../../contexts/LanguageContext';
import ApplicationDetailsModal from '../../../components/member/ApplicationDetailsModal';
import ServiceRequestDetailsModal from '../../../components/member/ServiceRequestDetailsModal';

interface Props {
  advisoryBookings: any[];
  wakalaApplications: any[];
  translationRequests: any[];
  otherLegalRequests: any[];
  onRefresh?: () => void;
  t: Record<string, string>;
}

function getAdvisoryReasonLabel(serviceType: string, language: string) {
  const reason = (serviceType || '').replace('advisory_', '');
  const labels: Record<string, Record<string, string>> = {
    en: {
      benefits_financial_support: 'Benefits & Financial Support',
      housing_council_services: 'Housing & Council Services',
      education_schools: 'Education & Schools',
      health_services: 'Health Services',
      immigration_home_office: 'Immigration & Home Office',
      identification_licences: 'Identification & Licences',
      utilities_household_bills: 'Utilities & Household Bills',
      transport_travel: 'Transport & Travel',
      family_children_support: 'Family & Children Support',
      forms_applications: 'Forms & Applications',
      advice_general_support: 'Advice & General Support',
      other: 'Other (Please specify)',

      // Legacy keys (kept for backward compatibility)
      welfare_benefits: 'Benefits & Financial Support',
      housing: 'Housing & Council Services',
      immigration: 'Immigration & Home Office',
      employment: 'Advice & General Support',
      education: 'Education & Schools',
      health: 'Health Services',
      legal: 'Forms & Applications',
    },
    ar: {
      benefits_financial_support: 'الإعانات والدعم المالي',
      housing_council_services: 'السكن وخدمات الكانسل',
      education_schools: 'التعليم والمدارس',
      health_services: 'الخدمات الصحية',
      immigration_home_office: 'الهجرة ووزارة الداخلية',
      identification_licences: 'الهويات والرخص',
      utilities_household_bills: 'الخدمات والفواتير المنزلية',
      transport_travel: 'النقل والسفر',
      family_children_support: 'دعم الأسرة والأطفال',
      forms_applications: 'الاستمارات والطلبات',
      advice_general_support: 'الاستشارات والدعم العام',
      other: 'أخرى (يرجى التوضيح)',

      // مفاتيح قديمة (للتوافق مع الحجوزات السابقة)
      welfare_benefits: 'الإعانات والدعم المالي',
      housing: 'السكن وخدمات الكانسل',
      immigration: 'الهجرة ووزارة الداخلية',
      employment: 'الاستشارات والدعم العام',
      education: 'التعليم والمدارس',
      health: 'الخدمات الصحية',
      legal: 'الاستمارات والطلبات',
    },
  };
  return labels[language]?.[reason] || reason || (language === 'ar' ? 'استشارة' : 'Consultation');
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
  return labels[language]?.[wakalaType] || wakalaType || (language === 'ar' ? 'طلب وكالة' : 'Wakala Request');
}

function formatDate(dateStr: string, language: string) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatTime(time: string) {
  if (!time) return '';
  return time.substring(0, 5);
}

function CardHeader({
  icon: Icon,
  title,
  count,
  language,
}: {
  icon: any;
  title: string;
  count: number;
  language: string;
}) {
  return (
    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
      <Icon className="w-4 h-4" />
      {title}
      <span className="ml-auto text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full font-semibold">
        {count}
      </span>
    </h3>
  );
}

function CompactCard({
  title,
  subtitle,
  status,
  bookingDate,
  startTime,
  onClick,
  iconBg,
  Icon,
}: {
  title: string;
  subtitle: string;
  status: string;
  bookingDate?: string | null;
  startTime?: string | null;
  onClick: () => void;
  iconBg: string;
  Icon: any;
}) {
  const isCancelled = status === 'cancelled';

  const statusPill = (() => {
    const base = 'inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold border';
    switch (status) {
      case 'completed':
      case 'approved':
        return `${base} bg-emerald-50 border-emerald-200 text-emerald-700`;
      case 'in_progress':
        return `${base} bg-sky-50 border-sky-200 text-sky-700`;
      case 'submitted':
        return `${base} bg-blue-50 border-blue-200 text-blue-700`;
      case 'pending_payment':
      case 'pending':
        return `${base} bg-amber-50 border-amber-200 text-amber-700`;
      case 'cancelled':
      case 'rejected':
        return `${base} bg-red-50 border-red-200 text-red-700`;
      default:
        return `${base} bg-gray-50 border-gray-200 text-gray-600`;
    }
  })();

  return (
    <motion.div
      variants={staggerItem}
      onClick={onClick}
      className={`group relative bg-white rounded-xl border p-4 cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 ${
        isCancelled ? 'border-red-200 bg-red-50/30' : 'border-divider hover:border-primary/30'
      }`}
    >
      <div className="absolute top-3 right-3">
        <span className={statusPill}>{status.replace(/_/g, ' ')}</span>
      </div>

      <div className="flex items-start gap-3 mb-3">
        <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0 group-hover:opacity-90 transition-opacity`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1 min-w-0 pt-1">
          <h3 className="font-bold text-gray-900 text-sm mb-1 truncate">{title}</h3>
          <p className="text-xs text-gray-500 truncate">{subtitle}</p>
        </div>
      </div>

      {bookingDate && (
        <div className="flex items-center gap-2 text-xs text-gray-600 mt-3 pt-3 border-t border-gray-200">
          <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate">{bookingDate}</span>
          {startTime && (
            <>
              <Clock className="w-3.5 h-3.5 flex-shrink-0 ml-1" />
              <span>{startTime}</span>
            </>
          )}
        </div>
      )}

      <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
          <svg className="w-3 h-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </motion.div>
  );
}

export default function ApplicationsTab({
  advisoryBookings,
  wakalaApplications,
  translationRequests,
  otherLegalRequests,
  onRefresh,
}: Props) {
  const { language } = useLanguage();

  const labels = useMemo(() => ({
    advisory: language === 'ar' ? 'المكتب الاستشاري' : 'Advisory office',
    wakala: language === 'ar' ? 'خدمة الوكالة' : 'Wakala Service',
    translation: language === 'ar' ? 'الترجمة / التوثيق' : 'Translation / Documentation',
    other: language === 'ar' ? 'خدمات قانونية أخرى' : 'Other Legal Services',
    empty: language === 'ar' ? 'لا توجد طلبات بعد' : 'No requests yet',
  }), [language]);

  const [selectedWakala, setSelectedWakala] = useState<any | null>(null);
  const [wakalaOpen, setWakalaOpen] = useState(false);

  const [selectedServiceReq, setSelectedServiceReq] = useState<{ kind: 'translation' | 'other'; data: any } | null>(null);
  const [serviceOpen, setServiceOpen] = useState(false);

  const closeWakala = () => {
    setWakalaOpen(false);
    setTimeout(() => setSelectedWakala(null), 200);
  };

  const closeService = () => {
    setServiceOpen(false);
    setTimeout(() => setSelectedServiceReq(null), 200);
  };

  const handleUpdate = () => {
    if (onRefresh) onRefresh();
  };

  const isAllEmpty = advisoryBookings.length === 0 && wakalaApplications.length === 0 && translationRequests.length === 0 && otherLegalRequests.length === 0;

  if (isAllEmpty) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-xl border border-divider p-12 text-center">
        <div className="w-16 h-16 rounded-full bg-sand flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-muted" />
        </div>
        <p className="text-muted font-medium">{labels.empty}</p>
      </motion.div>
    );
  }

  return (
    <>
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-8">
        {advisoryBookings.length > 0 && (
          <div className="space-y-4">
            <CardHeader icon={MessageSquare} title={labels.advisory} count={advisoryBookings.length} language={language} />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {advisoryBookings.map((app: any) => (
                <CompactCard
                  key={app.id}
                  title={getAdvisoryReasonLabel(app.service_type, language)}
                  subtitle={app.booking_reference || app.full_name || ''}
                  status={app.status}
                  bookingDate={app.booking_date ? formatDate(app.booking_date, language) : null}
                  startTime={app.start_time ? formatTime(app.start_time) : null}
                  onClick={() => { setSelectedWakala(app); setWakalaOpen(true); }}
                  iconBg="bg-emerald-600"
                  Icon={MessageSquare}
                />
              ))}
            </div>
          </div>
        )}

        {wakalaApplications.length > 0 && (
          <div className="space-y-4">
            <CardHeader icon={FileText} title={labels.wakala} count={wakalaApplications.length} language={language} />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {wakalaApplications.map((app: any) => (
                <CompactCard
                  key={app.id}
                  title={getWakalaTypeLabel(app.wakala_type, language)}
                  subtitle={app.booking_reference || app.full_name || ''}
                  status={app.status}
                  bookingDate={app.booking_date ? formatDate(app.booking_date, language) : null}
                  startTime={app.start_time ? formatTime(app.start_time) : null}
                  onClick={() => { setSelectedWakala(app); setWakalaOpen(true); }}
                  iconBg="bg-blue-600"
                  Icon={FileText}
                />
              ))}
            </div>
          </div>
        )}

        {translationRequests.length > 0 && (
          <div className="space-y-4">
            <CardHeader icon={Languages} title={labels.translation} count={translationRequests.length} language={language} />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {translationRequests.map((r: any) => (
                <CompactCard
                  key={r.id}
                  title={language === 'ar' ? 'طلب ترجمة' : 'Translation Request'}
                  subtitle={r.booking_reference || r.full_name || ''}
                  status={r.status}
                  bookingDate={r.created_at ? new Date(r.created_at).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-GB') : null}
                  onClick={() => { setSelectedServiceReq({ kind: 'translation', data: r }); setServiceOpen(true); }}
                  iconBg="bg-teal-600"
                  Icon={Languages}
                />
              ))}
            </div>
          </div>
        )}

        {otherLegalRequests.length > 0 && (
          <div className="space-y-4">
            <CardHeader icon={Scale} title={labels.other} count={otherLegalRequests.length} language={language} />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {otherLegalRequests.map((r: any) => (
                <CompactCard
                  key={r.id}
                  title={language === 'ar' ? 'طلب قانوني / توثيق' : 'Legal / Documentation Request'}
                  subtitle={r.booking_reference || r.full_name || ''}
                  status={r.status}
                  bookingDate={r.created_at ? new Date(r.created_at).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-GB') : null}
                  onClick={() => { setSelectedServiceReq({ kind: 'other', data: r }); setServiceOpen(true); }}
                  iconBg="bg-amber-600"
                  Icon={Scale}
                />
              ))}
            </div>
          </div>
        )}
      </motion.div>

      <ApplicationDetailsModal
        isOpen={wakalaOpen}
        onClose={closeWakala}
        application={selectedWakala}
        onUpdate={handleUpdate}
      />

      <ServiceRequestDetailsModal
        isOpen={serviceOpen}
        onClose={closeService}
        request={selectedServiceReq}
        onUpdate={handleUpdate}
      />
    </>
  );
}
