import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  MapPin,
  HelpCircle,
  ChevronRight,
  User,
  UserPlus,
  Building2,
  Clock,
  CheckCircle
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useMemberAuth } from '../contexts/MemberAuthContext';
import { useSiteSettings } from '../contexts/SiteSettingsContext';
import Layout from '../components/Layout';

type ServiceType = 'in_person' | null;

export default function BookingLanding() {
  const [selectedService, setSelectedService] = useState<ServiceType>(null);
  const { language } = useLanguage();
  const { member } = useMemberAuth();
  const { getSetting } = useSiteSettings();
  const navigate = useNavigate();
  const isRTL = language === 'ar';

  const translations = {
    en: {
      title: 'Book an Appointment',
      subtitle: 'Choose a service and schedule your visit',
      selectService: 'Select a Service',
      inPersonTitle: 'Visit Our Centre',
      inPersonDesc: 'Book an in-person appointment at our premises for advisory services, support, and consultations.',
      inPersonFeatures: ['Face-to-face consultation', 'Immediate assistance', 'Document support'],
      otherTitle: 'Other Services',
      otherDesc: 'Explore our programmes, events, and community resources.',
      otherFeatures: ['Community programmes', 'Events & workshops', 'Resources & support'],
      continueWith: 'Continue with',
      existingAccount: 'Existing Account',
      existingAccountDesc: 'Sign in to your member account to proceed with booking',
      newAccount: 'New Registration',
      newAccountDesc: 'Create a new member account to access our services',
      signIn: 'Sign In',
      register: 'Register Now',
      alreadyLoggedIn: 'You are logged in',
      proceedToBooking: 'Proceed to Booking',
      viewProgrammes: 'View Programmes',
      viewEvents: 'View Events',
      backToServices: 'Back to Services',
      welcomeBack: 'Welcome back',
    },
    ar: {
      title: 'حجز موعد',
      subtitle: 'اختر الخدمة وحدد موعد زيارتك',
      selectService: 'اختر الخدمة',
      inPersonTitle: 'زيارة مركزنا',
      inPersonDesc: 'احجز موعداً شخصياً في مقرنا للحصول على الاستشارات والدعم والمساعدة.',
      inPersonFeatures: ['استشارة وجهاً لوجه', 'مساعدة فورية', 'دعم الوثائق'],
      otherTitle: 'خدمات أخرى',
      otherDesc: 'استكشف برامجنا وفعالياتنا وموارد المجتمع.',
      otherFeatures: ['برامج مجتمعية', 'فعاليات وورش عمل', 'موارد ودعم'],
      continueWith: 'المتابعة عبر',
      existingAccount: 'حساب موجود',
      existingAccountDesc: 'سجل دخولك لحسابك للمتابعة في الحجز',
      newAccount: 'تسجيل جديد',
      newAccountDesc: 'أنشئ حساب عضوية جديد للوصول إلى خدماتنا',
      signIn: 'تسجيل الدخول',
      register: 'سجل الآن',
      alreadyLoggedIn: 'أنت مسجل الدخول',
      proceedToBooking: 'المتابعة للحجز',
      viewProgrammes: 'عرض البرامج',
      viewEvents: 'عرض الفعاليات',
      backToServices: 'العودة للخدمات',
      welcomeBack: 'مرحباً بعودتك',
    },
  };

  const t = translations[language];
  const orgName = getSetting('org_name_' + language, language === 'ar' ? 'جمعية المجتمع اليمني' : 'Yemeni Community Association');

  const handleProceed = (service: ServiceType) => {
    if (service === 'in_person') {
      navigate('/member/dashboard?openAdvisory=true');
    }
  };

  const services = [
    {
      id: 'in_person' as ServiceType,
      icon: Building2,
      title: t.inPersonTitle,
      description: t.inPersonDesc,
      features: t.inPersonFeatures,
      color: 'emerald',
    },
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="relative bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-600 py-16 sm:py-20">
          <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/7176026/pexels-photo-7176026.jpeg?auto=compress&cs=tinysrgb&w=1920')] bg-cover bg-center opacity-10" />
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <Clock className="w-4 h-4 text-emerald-200" />
              <span className="text-sm text-emerald-100">{orgName}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              {t.title}
            </h1>
            <p className="text-lg text-emerald-100 max-w-2xl mx-auto">
              {t.subtitle}
            </p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
          {!selectedService ? (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {services.map((service) => (
                  <button
                    key={service.id}
                    onClick={() => setSelectedService(service.id)}
                    className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 sm:p-8 text-left border-2 border-transparent hover:border-emerald-500"
                  >
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-5 ${
                      service.color === 'emerald'
                        ? 'bg-emerald-100 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white'
                        : 'bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white'
                    } transition-colors`}>
                      <service.icon className="w-7 h-7" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-emerald-600 transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-gray-600 mb-5 leading-relaxed">
                      {service.description}
                    </p>
                    <ul className="space-y-2 mb-6">
                      {service.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm text-gray-500">
                          <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <div className={`inline-flex items-center gap-2 font-semibold ${
                      service.color === 'emerald' ? 'text-emerald-600' : 'text-blue-600'
                    }`}>
                      {t.selectService}
                      <ChevronRight className={`w-5 h-5 transition-transform group-hover:translate-x-1 ${isRTL ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
                    </div>
                  </button>
                ))}
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
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
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="p-6 sm:p-8 border-b border-gray-100">
                <button
                  onClick={() => setSelectedService(null)}
                  className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors mb-4"
                >
                  <ChevronRight className={`w-4 h-4 ${isRTL ? '' : 'rotate-180'}`} />
                  {t.backToServices}
                </button>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-emerald-100 text-emerald-600">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {t.inPersonTitle}
                    </h2>
                    <p className="text-gray-500 text-sm">{t.continueWith}</p>
                  </div>
                </div>
              </div>

              {member ? (
                <div className="p-6 sm:p-8">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <User className="w-8 h-8 text-emerald-600" />
                    </div>
                    <p className="text-emerald-800 font-medium mb-1">{t.welcomeBack},</p>
                    <p className="text-emerald-900 font-bold text-lg mb-4">
                      {member.user_metadata?.full_name || member.email}
                    </p>
                    <button
                      onClick={() => handleProceed(selectedService)}
                      className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
                    >
                      {t.proceedToBooking}
                      <ChevronRight className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100">
                  <div className="p-6 sm:p-8">
                    <div className="text-center">
                      <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <User className="w-7 h-7 text-emerald-600" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{t.existingAccount}</h3>
                      <p className="text-gray-500 text-sm mb-6">{t.existingAccountDesc}</p>
                      <Link
                        to={`/member/login?redirect=/apply&service=${selectedService}`}
                        className="inline-flex items-center justify-center gap-2 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
                      >
                        {t.signIn}
                        <ChevronRight className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
                      </Link>
                    </div>
                  </div>

                  <div className="p-6 sm:p-8">
                    <div className="text-center">
                      <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <UserPlus className="w-7 h-7 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{t.newAccount}</h3>
                      <p className="text-gray-500 text-sm mb-6">{t.newAccountDesc}</p>
                      <Link
                        to="/membership"
                        className="inline-flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
                      >
                        {t.register}
                        <ChevronRight className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="py-12" />
        </div>
      </div>
    </Layout>
  );
}
