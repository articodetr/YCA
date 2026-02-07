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
  },
};

export default function BookPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [selectedService, setSelectedService] = useState<ServiceType>(null);
  const [bookingResult, setBookingResult] = useState<BookingResult | null>(null);
  const [showGateModal, setShowGateModal] = useState(false);
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

  useEffect(() => {
    if (!authLoading && !user && !selectedService) {
      setShowGateModal(true);
    }
  }, [authLoading, user]);

  const handleServiceSelect = (serviceId: ServiceType) => {
    setSelectedService(serviceId);
  };

  const handleMemberLogin = () => {
    setShowGateModal(false);
    const service = selectedService || '';
    navigate(`/member/login?redirect=/book${service ? `&service=${service}` : ''}`);
  };

  const handleContinueAsGuest = () => {
    setShowGateModal(false);
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
              <div className="grid md:grid-cols-2 gap-6">
                {services.map((service, idx) => (
                  <motion.button
                    key={service.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1, duration: 0.4 }}
                    onClick={() => handleServiceSelect(service.id)}
                    className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 sm:p-8 text-left border-2 border-transparent hover:border-emerald-500"
                  >
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-5 ${
                      service.accent === 'emerald'
                        ? 'bg-emerald-100 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white'
                        : 'bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white'
                    } transition-colors`}>
                      <service.icon className="w-7 h-7" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-emerald-700 transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-gray-600 mb-5 leading-relaxed">
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
                    <div className={`inline-flex items-center gap-2 font-semibold ${
                      service.accent === 'emerald' ? 'text-emerald-600' : 'text-blue-600'
                    }`}>
                      {t.selectService}
                      <ChevronRight className={`w-5 h-5 transition-transform group-hover:translate-x-1 ${isRTL ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
                    </div>
                  </motion.button>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="bg-white rounded-2xl shadow-lg p-6 sm:p-8"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0">
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

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="bg-white rounded-2xl shadow-lg p-6 sm:p-8"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gray-100 text-gray-600 flex items-center justify-center flex-shrink-0">
                    <HelpCircle className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{t.otherTitle}</h3>
                    <p className="text-gray-600 mb-4">{t.otherDesc}</p>
                    <div className="flex flex-wrap gap-3">
                      <Link
                        to="/programmes"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm font-medium"
                      >
                        {t.viewProgrammes}
                      </Link>
                      <Link
                        to="/events"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm font-medium"
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
            </motion.div>
          )}
        </div>
      </div>

      <BookingGateModal
        isOpen={showGateModal}
        onClose={handleContinueAsGuest}
        onMemberLogin={handleMemberLogin}
        onContinueAsGuest={handleContinueAsGuest}
      />
    </Layout>
  );
}
