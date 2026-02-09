import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import {
  Building2,
  FileText,
  CheckCircle,
  ChevronRight,
  HelpCircle,
  Clock,
  Search,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { useMemberAuth } from '../../contexts/MemberAuthContext';
import { useSiteSettings } from '../../contexts/SiteSettingsContext';
import Layout from '../../components/Layout';
import AdvisoryBookingForm from './AdvisoryBookingForm';
import WakalaBookingForm from './WakalaBookingForm';
import BookingConfirmation from './BookingConfirmation';
import BookingGateModal from './BookingGateModal';

export type ServiceType = 'advisory' | 'wakala' | null;

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

const translations = {
  en: {
    title: 'Book an Appointment',
    subtitle: 'Choose a service and schedule your visit',
    selectService: 'Select a Service',
    advisoryTitle: 'Advisory Bureau',
    advisoryDesc: 'Book an in-person consultation at our centre for advice on benefits, housing, immigration, employment, and more.',
    advisoryFeatures: ['Face-to-face consultation', 'Immediate assistance', 'Free service'],
    wakalaTitle: 'Wakala Service',
    wakalaDesc: 'Let us handle official procedures and paperwork on your behalf through our authorised representation service.',
    wakalaFeatures: ['Official representation', 'Document handling', 'Professional service'],
    otherTitle: 'Other Services',
    otherDesc: 'Explore our programmes, events, and community resources.',
    viewProgrammes: 'View Programmes',
    viewEvents: 'View Events',
    backToServices: 'Back to Services',
    trackBooking: 'Track Your Booking',
    trackDesc: 'Already have a booking? Enter your reference number to check the status.',
    trackButton: 'Track Booking',
    step1: 'Choose Service',
    step2: 'Fill Details',
    step3: 'Confirmation',
  },
  ar: {
    title: 'حجز موعد',
    subtitle: 'اختر الخدمة وحدد موعد زيارتك',
    selectService: 'اختر الخدمة',
    advisoryTitle: 'المكتب الاستشاري',
    advisoryDesc: 'احجز موعداً شخصياً في مركزنا للحصول على استشارات حول الإعانات والسكن والهجرة والتوظيف والمزيد.',
    advisoryFeatures: ['استشارة وجهاً لوجه', 'مساعدة فورية', 'خدمة مجانية'],
    wakalaTitle: 'خدمة الوكالة',
    wakalaDesc: 'دعنا نتولى الإجراءات الرسمية والأوراق نيابة عنك من خلال خدمة التمثيل المعتمدة لدينا.',
    wakalaFeatures: ['تمثيل رسمي', 'التعامل مع الوثائق', 'خدمة احترافية'],
    otherTitle: 'خدمات أخرى',
    otherDesc: 'استكشف برامجنا وفعالياتنا وموارد المجتمع.',
    viewProgrammes: 'عرض البرامج',
    viewEvents: 'عرض الفعاليات',
    backToServices: 'العودة للخدمات',
    trackBooking: 'تتبع حجزك',
    trackDesc: 'لديك حجز بالفعل؟ أدخل الرقم المرجعي للتحقق من الحالة.',
    trackButton: 'تتبع الحجز',
    step1: 'اختر الخدمة',
    step2: 'أدخل البيانات',
    step3: 'التأكيد',
  },
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

  useEffect(() => {
    const serviceParam = searchParams.get('service') as ServiceType;
    if (serviceParam && (serviceParam === 'advisory' || serviceParam === 'wakala')) {
      setSelectedService(serviceParam);
    }
  }, [searchParams]);

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

  const currentStep = !selectedService ? 0 : 1;

  const steps = [
    { label: t.step1 },
    { label: t.step2 },
    { label: t.step3 },
  ];

  const services = [
    {
      id: 'advisory' as ServiceType,
      icon: Building2,
      title: t.advisoryTitle,
      description: t.advisoryDesc,
      features: t.advisoryFeatures,
    },
    {
      id: 'wakala' as ServiceType,
      icon: FileText,
      title: t.wakalaTitle,
      description: t.wakalaDesc,
      features: t.wakalaFeatures,
    },
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-white" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="bg-gray-50 border-b border-gray-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 text-center">
            <div className="inline-flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-full mb-6">
              <Clock className="w-4 h-4 text-[#0d9488]" />
              <span className="text-sm text-[#64748b]">{orgName}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#0f1c2e] mb-3">
              {t.title}
            </h1>
            <p className="text-base text-[#64748b] max-w-xl mx-auto">
              {t.subtitle}
            </p>

            <div className="flex items-center justify-center gap-0 mt-8 max-w-md mx-auto">
              {steps.map((step, idx) => (
                <div key={idx} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                        idx < currentStep
                          ? 'bg-[#0d9488] text-white'
                          : idx === currentStep
                            ? 'bg-[#0d9488] text-white'
                            : 'bg-gray-200 text-[#64748b]'
                      }`}
                    >
                      {idx < currentStep ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        idx + 1
                      )}
                    </div>
                    <span
                      className={`text-xs mt-1.5 whitespace-nowrap ${
                        idx <= currentStep ? 'text-[#0f1c2e] font-medium' : 'text-[#64748b]'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                  {idx < steps.length - 1 && (
                    <div
                      className={`h-0.5 flex-1 mx-2 mt-[-1rem] ${
                        idx < currentStep ? 'bg-[#0d9488]' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          {!selectedService ? (
            <div className="space-y-5">
              <div className="grid md:grid-cols-2 gap-5">
                {services.map((service, idx) => (
                  <motion.button
                    key={service.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.08, duration: 0.35 }}
                    onClick={() => handleServiceSelect(service.id)}
                    className={`group bg-white rounded-2xl border border-gray-100 hover:shadow-md transition-all duration-200 p-6 sm:p-8 ${isRTL ? 'text-right' : 'text-left'}`}
                  >
                    <div className="w-12 h-12 rounded-xl bg-[#0d9488]/10 text-[#0d9488] flex items-center justify-center mb-5 transition-colors group-hover:bg-[#0d9488] group-hover:text-white">
                      <service.icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-[#0f1c2e] mb-2">
                      {service.title}
                    </h3>
                    <p className="text-[#64748b] text-sm mb-5 leading-relaxed">
                      {service.description}
                    </p>
                    <ul className="space-y-2 mb-6">
                      {service.features.map((feature, fidx) => (
                        <li key={fidx} className="flex items-center gap-2 text-sm text-[#64748b]">
                          <CheckCircle className="w-4 h-4 text-[#0d9488] flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <div className="inline-flex items-center gap-2 text-sm font-semibold text-[#0d9488]">
                      {t.selectService}
                      <ChevronRight className={`w-4 h-4 transition-transform group-hover:translate-x-0.5 ${isRTL ? 'rotate-180 group-hover:-translate-x-0.5' : ''}`} />
                    </div>
                  </motion.button>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.16, duration: 0.35 }}
                className="bg-white rounded-2xl border border-gray-100 hover:shadow-md transition-shadow duration-200 p-6 sm:p-8"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#0d9488]/10 text-[#0d9488] flex items-center justify-center flex-shrink-0">
                    <Search className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-[#0f1c2e] mb-1">{t.trackBooking}</h3>
                    <p className="text-sm text-[#64748b] mb-4">{t.trackDesc}</p>
                    <Link
                      to="/book/track"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0d9488] hover:bg-[#0b7f74] text-white rounded-lg transition-colors text-sm font-medium"
                    >
                      {t.trackButton}
                      <ChevronRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
                    </Link>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.24, duration: 0.35 }}
                className="bg-white rounded-2xl border border-gray-100 hover:shadow-md transition-shadow duration-200 p-6 sm:p-8"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 text-[#64748b] flex items-center justify-center flex-shrink-0">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-[#0f1c2e] mb-1">{t.otherTitle}</h3>
                    <p className="text-sm text-[#64748b] mb-4">{t.otherDesc}</p>
                    <div className="flex flex-wrap gap-3">
                      <Link
                        to="/programmes"
                        className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 hover:border-[#0d9488] hover:text-[#0d9488] text-[#0f1c2e] rounded-lg transition-colors text-sm font-medium"
                      >
                        {t.viewProgrammes}
                      </Link>
                      <Link
                        to="/events"
                        className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 hover:border-[#0d9488] hover:text-[#0d9488] text-[#0f1c2e] rounded-lg transition-colors text-sm font-medium"
                      >
                        {t.viewEvents}
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <button
                onClick={() => setSelectedService(null)}
                className="inline-flex items-center gap-2 text-[#64748b] hover:text-[#0f1c2e] transition-colors mb-6 text-sm font-medium"
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
