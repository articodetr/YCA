import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, FileText, MessageSquare } from 'lucide-react';
import { staggerContainer, staggerItem } from '../../../lib/animations';
import { useLanguage } from '../../../contexts/LanguageContext';
import ApplicationDetailsModal from '../../../components/member/ApplicationDetailsModal';

interface Props {
  wakalaApps: any[];
  onRefresh?: () => void;
  t: Record<string, string>;
}

const statusConfig: Record<string, { bg: string; text: string; icon: any }> = {
  submitted: { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700', icon: Clock },
  in_progress: { bg: 'bg-sky-50 border-sky-200', text: 'text-sky-700', icon: Clock },
  completed: { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', icon: Clock },
  approved: { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', icon: Clock },
  rejected: { bg: 'bg-red-50 border-red-200', text: 'text-red-700', icon: Clock },
  cancelled: { bg: 'bg-red-50 border-red-200', text: 'text-red-700', icon: Clock },
  pending: { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', icon: Clock },
};

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

function CompactApplicationCard({ app, onClick, language }: { app: any; onClick: () => void; language: string }) {
  const isCancelled = app.status === 'cancelled' || app.cancelled_at;
  const isAdvisoryApp = isAdvisory(app.service_type);
  const statusConf = statusConfig[app.status] || { bg: 'bg-gray-50 border-gray-200', text: 'text-gray-600', icon: Clock };
  const StatusIcon = statusConf.icon;

  return (
    <motion.div
      variants={staggerItem}
      onClick={onClick}
      className={`group relative bg-white rounded-xl border p-4 cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 ${
        isCancelled ? 'border-red-200 bg-red-50/30' : 'border-divider hover:border-primary/30'
      }`}
    >
      <div className="absolute top-3 right-3">
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border ${statusConf.bg} ${statusConf.text}`}>
          <StatusIcon className="w-3 h-3" />
        </span>
      </div>

      <div className="flex items-start gap-3 mb-3">
        {isAdvisoryApp ? (
          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-200 transition-colors">
            <MessageSquare className="w-6 h-6 text-blue-600" />
          </div>
        ) : (
          <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-200 transition-colors">
            <FileText className="w-6 h-6 text-emerald-600" />
          </div>
        )}
        <div className="flex-1 min-w-0 pt-1">
          <h3 className="font-bold text-gray-900 text-sm mb-1 truncate">
            {isAdvisoryApp
              ? getAdvisoryReasonLabel(app.service_type, language)
              : (app.wakala_type ? getWakalaTypeLabel(app.wakala_type, language) : (language === 'ar' ? 'طلب وكالة' : 'Wakala'))}
          </h3>
          <p className="text-xs text-gray-500">
            {app.booking_reference || app.full_name || (language === 'ar' ? 'طلب' : 'Application')}
          </p>
        </div>
      </div>

      {app.booking_date && (
        <div className="flex items-center gap-2 text-xs text-gray-600 mt-3 pt-3 border-t border-gray-200">
          <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate">
            {new Date(app.booking_date).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-GB', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
          {app.start_time && (
            <>
              <Clock className="w-3.5 h-3.5 flex-shrink-0 ml-1" />
              <span>{app.start_time.substring(0, 5)}</span>
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

export default function ApplicationsTab({ wakalaApps, onRefresh, t }: Props) {
  const { language } = useLanguage();
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCardClick = (app: any) => {
    setSelectedApp(app);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedApp(null), 300);
  };

  const handleUpdate = () => {
    if (onRefresh) onRefresh();
  };

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

  return (
    <>
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
        {advisoryApps.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              {language === 'ar' ? 'المواعيد الاستشارية' : 'Advisory Appointments'}
              <span className="ml-auto text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full font-semibold">
                {advisoryApps.length}
              </span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {advisoryApps.map(app => (
                <CompactApplicationCard
                  key={app.id}
                  app={app}
                  onClick={() => handleCardClick(app)}
                  language={language}
                />
              ))}
            </div>
          </div>
        )}

        {wakalaOnlyApps.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4" />
              {language === 'ar' ? 'طلبات الوكالة' : 'Wakala Applications'}
              <span className="ml-auto text-xs bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full font-semibold">
                {wakalaOnlyApps.length}
              </span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {wakalaOnlyApps.map(app => (
                <CompactApplicationCard
                  key={app.id}
                  app={app}
                  onClick={() => handleCardClick(app)}
                  language={language}
                />
              ))}
            </div>
          </div>
        )}
      </motion.div>

      <ApplicationDetailsModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        application={selectedApp}
        onUpdate={handleUpdate}
      />
    </>
  );
}
