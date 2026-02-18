import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import {
  Building2,
  CheckCircle,
  ChevronRight,
  Clock,
  Search,
  Languages,
  Scale,
  FileText,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { useMemberAuth } from '../../contexts/MemberAuthContext';
import { useSiteSettings } from '../../contexts/SiteSettingsContext';
import Layout from '../../components/Layout';
import AdvisoryBookingForm from './AdvisoryBookingForm';
import WakalaBookingForm from './WakalaBookingForm';
import TranslationBookingForm from './TranslationBookingForm';
import OtherLegalBookingForm from './OtherLegalBookingForm';
import BookingConfirmation from './BookingConfirmation';
import BookingGateModal from './BookingGateModal';

export type ServiceType = 'advisory' | 'wakala' | 'translation' | 'other' | null;

export interface BookingResult {
  bookingReference: string;
  serviceType: string;
  date: string;
  startTime: string;
  endTime: string;
  fullName: string;
  email: string;
  fee: number;
}

const ALL_SERVICES: ServiceType[] = ['advisory', 'wakala', 'translation', 'other'];

const translations = {
  en: {
    title: 'Book a Service',
    subtitle: 'Choose a service to get started',
    selectService: 'Select',
    advisoryTitle: 'Advisory office',
    advisoryDesc: 'Book an in-person consultation at our centre for advice on benefits, housing, immigration, employment, and more.',
    advisoryFeatures: ['Face-to-face consultation', 'Immediate assistance', 'Free service'],
    wakalaTitle: 'Wakala Service',
    wakalaDesc: 'Let us handle official procedures and paperwork on your behalf through our authorised representation service.',
    wakalaFeatures: ['Official representation', 'Document handling', 'Professional service'],
    translationTitle: 'Translation Service',
    translationDesc: 'Professional translation of official documents including birth certificates, legal papers, and more.',
    translationFeatures: ['Certified translation', 'Multiple document types', 'Fast turnaround'],
    otherTitle: 'Other Legal / Documentation',
    otherDesc: 'Legal consultations, document notarization, immigration assistance, housing support, and other services.',
    otherFeatures: ['Legal consultation', 'Document notarization', 'Wide range of services'],
    backToServices: 'Back to Services',
    trackBooking: 'Track Your Booking',
    trackDesc: 'Already have a booking? Enter your reference number to check the status.',
    trackButton: 'Track Booking',
  },
  ar: {
    title: 'احجز خدمة',
    subtitle: 'اختر الخدمة للبدء',
    selectService: 'اختر',
    advisoryTitle: 'المكتب الاستشاري',
    advisoryDesc: 'احجز موعداً شخصياً في مركزنا للحصول على استشارات حول الإعانات والسكن والهجرة والتوظيف والمزيد.',
    advisoryFeatures: ['استشارة وجهاً لوجه', 'مساعدة فورية', 'خدمة مجانية'],
    wakalaTitle: 'خدمة الوكالة',
    wakalaDesc: 'دعنا نتولى الإجراءات الرسمية والأوراق نيابة عنك من خلال خدمة التمثيل المعتمدة لدينا.',
    wakalaFeatures: ['تمثيل رسمي', 'التعامل مع الوثائق', 'خدمة احترافية'],
    translationTitle: 'خدمة الترجمة',
    translationDesc: 'ترجمة احترافية للمستندات الرسمية بما في ذلك شهادات الميلاد والأوراق القانونية والمزيد.',
    translationFeatures: ['ترجمة معتمدة', 'أنواع مستندات متعددة', 'إنجاز سريع'],
    otherTitle: 'خدمات قانونية / توثيق أخرى',
    otherDesc: 'استشارات قانونية، توثيق المستندات، مساعدة في الهجرة، دعم الإسكان، وخدمات أخرى.',
    otherFeatures: ['استشارة قانونية', 'توثيق المستندات', 'مجموعة واسعة من الخدمات'],
    backToServices: 'العودة للخدمات',
    trackBooking: 'تتبع حجزك',
    trackDesc: 'لديك حجز بالفعل؟ أدخل الرقم المرجعي للتحقق من الحالة.',
    trackButton: 'تتبع الحجز',
  },
};

const accentMap: Record<string, { bg: string; bgHover: string; text: string; border: string }> = {
  emerald: { bg: 'bg-emerald-100', bgHover: 'group-hover:bg-emerald-600', text: 'text-emerald-600', border: 'hover:border-emerald-500' },
  blue: { bg: 'bg-blue-100', bgHover: 'group-hover:bg-blue-600', text: 'text-blue-600', border: 'hover:border-blue-500' },
  teal: { bg: 'bg-teal-100', bgHover: 'group-hover:bg-teal-600', text: 'text-teal-600', border: 'hover:border-teal-500' },
  amber: { bg: 'bg-amber-100', bgHover: 'group-hover:bg-amber-600', text: 'text-amber-600', border: 'hover:border-amber-500' },
};

export default function BookPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [selectedService, setSelectedService] = useState<ServiceType>(null);
  const [bookingResult, setBookingResult] = useState<BookingResult | null>(null);
  const [showGateModal, setShowGateModal] = useState(false);
  const [pendingService, setPendingService] = useState<ServiceType>(null);
  const { language } = useLanguage();
  const { user, loading: authLoading } = useMemberAuth();
  const { getSetting } = useSiteSettings();
  const isRTL = language === 'ar';
  const t = translations[language];
  const orgName = getSetting(
    'org_name_' + language,
    language === 'ar' ? 'جمعية المجتمع اليمني' : 'Yemeni Community Association'
  );
  const translationEnabled = getSetting('translation_enabled', 'false') === 'true';
  const VALID_SERVICES = ALL_SERVICES.filter(s => s !== 'translation' || translationEnabled);
  const [translationUnavailable, setTranslationUnavailable] = useState(false);

  useEffect(() => {
    const serviceParam = searchParams.get('service') as ServiceType;
    if (serviceParam === 'translation' && !translationEnabled) {
      setTranslationUnavailable(true);
      navigate('/book', { replace: true });
      return;
    }
    setTranslationUnavailable(false);
    if (serviceParam && VALID_SERVICES.includes(serviceParam)) {
      setSelectedService(serviceParam);
    }
  }, [searchParams, translationEnabled]);

  const handleServiceSelect = (serviceId: ServiceType) => {
    if (!user && !authLoading) {
      setPendingService(serviceId);
      setShowGateModal(true);
      return;
    }
    setSelectedService(serviceId);
  };

  const handleMemberLogin = () => {
    setShowGateModal(false);
    const service = pendingService || '';
    navigate(`/member/login?redirect=/book${service ? `&service=${service}` : ''}`);
    setPendingService(null);
  };

  const handleMemberRegister = () => {
    setShowGateModal(false);
    setPendingService(null);
    navigate('/membership');
  };

  const handleContinueAsGuest = () => {
    setShowGateModal(false);
    if (pendingService) {
      setSelectedService(pendingService);
      setPendingService(null);
    }
  };

  const handleBookingComplete = (result: BookingResult) => {
    setBookingResult(result);
  };

  const handleNewBooking = () => {
    setBookingResult(null);
    setSelectedService(null);
  };

  if (bookingResult) {
    return (
      <Layout>
        <BookingConfirmation result={bookingResult} onNewBooking={handleNewBooking} />
      </Layout>
    );
  }

  const services = [
    {
      id: 'advisory' as ServiceType,
      icon: Building2,
      title: t.advisoryTitle,
      description: t.advisoryDesc,
      features: t.advisoryFeatures,
      accent: 'emerald',
    },
    {
      id: 'wakala' as ServiceType,
      icon: FileText,
      title: t.wakalaTitle,
      description: t.wakalaDesc,
      features: t.wakalaFeatures,
      accent: 'blue',
    },
    ...(translationEnabled ? [{
      id: 'translation' as ServiceType,
      icon: Languages,
      title: t.translationTitle,
      description: t.translationDesc,
      features: t.translationFeatures,
      accent: 'teal',
    }] : []),
    {
      id: 'other' as ServiceType,
      icon: Scale,
      title: t.otherTitle,
      description: t.otherDesc,
      features: t.otherFeatures,
      accent: 'amber',
    },
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="relative bg-gradient-to-br from-[#1b2b45] via-[#1e3a5c] to-[#0f2439] py-16 sm:py-20">
          <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/7176026/pexels-photo-7176026.jpeg?auto=compress&cs=tinysrgb&w=1920')] bg-cover bg-center opacity-10" />
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <Clock className="w-4 h-4 text-amber-300" />
              <span className="text-sm text-gray-200">{orgName}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              {t.title}
            </h1>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              {t.subtitle}
            </p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10 pb-16">
          {!selectedService ? (
            <div className="space-y-6">
              {translationUnavailable && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 text-sm text-amber-800 font-medium">
                  {language === 'ar' ? 'خدمة الترجمة غير متاحة حالياً.' : 'The Translation Service is not currently available.'}
                </div>
              )}
              <div className="grid md:grid-cols-2 gap-6">
                {services.map((service, idx) => {
                  const colors = accentMap[service.accent] || accentMap.emerald;
                  return (
                    <motion.button
                      key={service.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1, duration: 0.4 }}
                      onClick={() => handleServiceSelect(service.id)}
                      className={`group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 sm:p-8 text-left border-2 border-transparent ${colors.border}`}
                    >
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-5 ${colors.bg} ${colors.text} ${colors.bgHover} group-hover:text-white transition-colors`}>
                        <service.icon className="w-7 h-7" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-gray-800 transition-colors">
                        {service.title}
                      </h3>
                      <p className="text-gray-600 mb-5 leading-relaxed text-sm">
                        {service.description}
                      </p>
                      <ul className="space-y-2 mb-6">
                        {service.features.map((feature, fidx) => (
                          <li key={fidx} className="flex items-center gap-2 text-sm text-gray-500">
                            <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                      <div className={`inline-flex items-center gap-2 font-semibold ${colors.text}`}>
                        {t.selectService}
                        <ChevronRight className={`w-5 h-5 transition-transform group-hover:translate-x-1 ${isRTL ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.4 }}
                className="bg-white rounded-2xl shadow-lg p-6 sm:p-8"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gray-100 text-gray-600 flex items-center justify-center flex-shrink-0">
                    <Search className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{t.trackBooking}</h3>
                    <p className="text-gray-600 mb-4">{t.trackDesc}</p>
                    <Link
                      to="/book/track"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1b2b45] hover:bg-[#253d5e] text-white rounded-lg transition-colors text-sm font-medium"
                    >
                      {t.trackButton}
                      <ChevronRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
                    </Link>
                  </div>
                </div>
              </motion.div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <button
                onClick={() => setSelectedService(null)}
                className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors mb-6 bg-white rounded-lg px-4 py-2 shadow-sm"
              >
                <ChevronRight className={`w-4 h-4 ${isRTL ? '' : 'rotate-180'}`} />
                {t.backToServices}
              </button>

              {selectedService === 'advisory' && (
                <AdvisoryBookingForm onComplete={handleBookingComplete} />
              )}

              {selectedService === 'wakala' && (
                <WakalaBookingForm onComplete={handleBookingComplete} />
              )}

              {selectedService === 'translation' && (
                <TranslationBookingForm onComplete={handleBookingComplete} />
              )}

              {selectedService === 'other' && (
                <OtherLegalBookingForm onComplete={handleBookingComplete} />
              )}
            </motion.div>
          )}
        </div>
      </div>

      <BookingGateModal
        isOpen={showGateModal}
        onClose={handleContinueAsGuest}
        onMemberLogin={handleMemberLogin}
        onMemberRegister={handleMemberRegister}
        onContinueAsGuest={handleContinueAsGuest}
      />
    </Layout>
  );
}
