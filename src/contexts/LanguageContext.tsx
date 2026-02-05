import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Header
    'nav.home': 'Home',
    'nav.about': 'About',
    'nav.services': 'Services',
    'nav.wakalaBooking': 'Book Wakala Appointment',
    'nav.programmes': 'Programmes',
    'nav.events': 'Events',
    'nav.news': 'News',
    'nav.resources': 'Resources',
    'nav.getInvolved': 'Get Involved',
    'nav.contact': 'Contact',
    'nav.admin': 'Admin',

    // About submenu
    'nav.about.mission': 'Mission & Vision',
    'nav.about.history': 'History',
    'nav.about.team': 'Team',
    'nav.about.partners': 'Partners',
    'nav.about.reports': 'Reports',

    // Get Involved submenu
    'nav.getInvolved.membership': 'Membership',
    'nav.getInvolved.volunteer': 'Volunteer',
    'nav.getInvolved.donate': 'Donate',
    'nav.getInvolved.partnerships': 'Partnerships',
    'nav.getInvolved.jobs': 'Jobs',

    // Programmes submenu
    'nav.programmes.women': "Women's Programme",
    'nav.programmes.elderly': "Elderly's Programme",
    'nav.programmes.youth': 'Youth Programme',
    'nav.programmes.children': "Children's Programme",
    'nav.programmes.men': "Men's Programme",

    // Footer
    'footer.tagline': 'Supporting Our Community Since 1988',
    'footer.about': 'About Us',
    'footer.quickLinks': 'Quick Links',
    'footer.getInvolved': 'Get Involved',
    'footer.newsletter': 'Newsletter',
    'footer.newsletterText': 'Stay updated with our latest news and events',
    'footer.emailPlaceholder': 'Your email address',
    'footer.subscribe': 'Subscribe',
    'footer.copyright': '© 2024 Yemeni Community Association. All rights reserved.',
    'footer.charity': 'Registered Charity',

    // Common buttons
    'button.learnMore': 'Learn More',
    'button.readMore': 'Read More',
    'button.viewAll': 'View All',
    'button.register': 'Register',
    'button.submit': 'Submit',
    'button.send': 'Send',
    'button.cancel': 'Cancel',
    'button.save': 'Save',
    'button.delete': 'Delete',
    'button.edit': 'Edit',
    'button.close': 'Close',
    'button.back': 'Back',
    'button.apply': 'Apply',
    'button.download': 'Download',

    // Home page
    'home.welcomeToYCA': 'Welcome to YCA Birmingham',
    'home.servingCommunity': 'Serving Our Community Since 1988',
    'home.ourServices': 'Our Services',
    'home.upcomingEvents': 'Upcoming Events',
    'home.latestNews': 'Latest News',
    'home.getInvolved': 'Get Involved',
    'home.makeADifference': 'Make a Difference',

    // Contact page
    'contact.title': 'Contact Us',
    'contact.getInTouch': 'Get In Touch With Us',
    'contact.description': 'If you have got a question or general query, you can contact us and we will get in touch with you as soon as possible.',
    'contact.address': 'Address',
    'contact.phone': 'Phone',
    'contact.email': 'Email',
    'contact.openingTimes': 'Opening Times',
    'contact.sendMessage': 'Send Us a Message',
    'contact.yourName': 'Your Name',
    'contact.subject': 'Subject',
    'contact.message': 'Message',
    'contact.sendingMessage': 'Sending...',
    'contact.messageSent': 'Thank you for your message! We will get back to you soon.',
    'contact.messageError': 'There was an error sending your message. Please try again or contact us directly.',
    'contact.needAdvice': 'Need Advice or Support?',
    'contact.adviceText': 'Our bilingual team provides confidential advice and guidance on welfare benefits, housing, immigration, and more.',
    'contact.callToday': 'Call us today to book your one-to-one appointment',

    // Services page
    'services.title': 'Our Services',
    'services.description': 'Comprehensive Support for Our Community',

    // Events page
    'events.title': 'Events',
    'events.upcoming': 'Upcoming Events',
    'events.past': 'Past Events',
    'events.all': 'All Events',
    'events.register': 'Register for Event',
    'events.viewGallery': 'View Gallery',
    'events.date': 'Date',
    'events.time': 'Time',
    'events.location': 'Location',
    'events.category': 'Category',

    // News page
    'news.title': 'News & Insights',
    'news.latestNews': 'Latest News',
    'news.archives': 'Archives',

    // Programmes page
    'programmes.title': 'Our Programmes',
    'programmes.all': 'All',
    'programmes.women': "Women's",
    'programmes.elderly': "Elderly's",
    'programmes.youth': 'Youth',
    'programmes.children': "Children's",
    'programmes.men': "Men's",
    'programmes.joinOur': 'Join Our Programmes',
    'programmes.joinDescription': 'Whether you\'re looking to participate, volunteer, or support our initiatives, there\'s a place for you in our community programmes.',
    'programmes.becomeMember': 'Become a Member',
    'programmes.contactUs': 'Contact Us',
    'programmes.makeADifference': 'Make a Difference',
    'programmes.supportText': 'Your support helps us continue providing vital services to our community members',
    'programmes.supportOurWork': 'Support Our Work',
    'programmes.volunteerWithUs': 'Volunteer With Us',

    // Resources page
    'resources.title': 'Resources & Downloads',

    // Forms
    'form.required': 'Required',
    'form.optional': 'Optional',
    'form.firstName': 'First Name',
    'form.lastName': 'Last Name',
    'form.fullName': 'Full Name',
    'form.email': 'Email',
    'form.phone': 'Phone',
    'form.address': 'Address',
    'form.dateOfBirth': 'Date of Birth',
    'form.message': 'Message',
    'form.submit': 'Submit',
    'form.submitting': 'Submitting...',
    'form.success': 'Success!',
    'form.error': 'Error',

    // Membership
    'membership.title': 'Become a Member',
    'membership.benefits': 'Membership Benefits',
    'membership.applyNow': 'Apply Now',
    'membership.membershipType': 'Membership Type',
    'membership.individual': 'Individual',
    'membership.family': 'Family',
    'membership.emergencyContact': 'Emergency Contact',
    'membership.interests': 'Interests',
    'membership.termsAccepted': 'I accept the terms and conditions',

    // Volunteer
    'volunteer.title': 'Volunteering Opportunities',
    'volunteer.whyVolunteer': 'Why Volunteer?',
    'volunteer.opportunities': 'Volunteer Opportunities',
    'volunteer.applyNow': 'Apply Now',
    'volunteer.skills': 'Skills',
    'volunteer.availability': 'Availability',

    // Donate
    'donate.title': 'Donate / Support Us',
    'donate.makeADonation': 'Make a Donation',
    'donate.amount': 'Amount',
    'donate.oneTime': 'One-time',
    'donate.monthly': 'Monthly',
    'donate.custom': 'Custom Amount',
    'donate.donateName': 'Name',
    'donate.donateEmail': 'Email',
    'donate.processing': 'Processing...',

    // Admin
    'admin.dashboard': 'Dashboard',
    'admin.content': 'Content',
    'admin.hero': 'Hero Slides',
    'admin.services': 'Services',
    'admin.programmes': 'Programmes',
    'admin.events': 'Events',
    'admin.news': 'News',
    'admin.resources': 'Resources',
    'admin.team': 'Team',
    'admin.registrations': 'Registrations',
    'admin.memberships': 'Memberships',
    'admin.volunteers': 'Volunteers',
    'admin.donations': 'Donations',
    'admin.contacts': 'Contacts',
    'admin.subscribers': 'Subscribers',
    'admin.partnerships': 'Partnerships',
    'admin.settings': 'Settings',
    'admin.logout': 'Logout',

    // Days of week
    'days.monday': 'Monday',
    'days.tuesday': 'Tuesday',
    'days.wednesday': 'Wednesday',
    'days.thursday': 'Thursday',
    'days.friday': 'Friday',
    'days.saturday': 'Saturday',
    'days.sunday': 'Sunday',

    // Months
    'months.january': 'January',
    'months.february': 'February',
    'months.march': 'March',
    'months.april': 'April',
    'months.may': 'May',
    'months.june': 'June',
    'months.july': 'July',
    'months.august': 'August',
    'months.september': 'September',
    'months.october': 'October',
    'months.november': 'November',
    'months.december': 'December',
  },
  ar: {
    // Header
    'nav.home': 'الرئيسية',
    'nav.about': 'عن الجمعية',
    'nav.services': 'الخدمات',
    'nav.programmes': 'البرامج',
    'nav.events': 'الفعاليات',
    'nav.news': 'الأخبار',
    'nav.resources': 'الموارد',
    'nav.getInvolved': 'شارك معنا',
    'nav.contact': 'اتصل بنا',
    'nav.admin': 'لوحة التحكم',

    // About submenu
    'nav.about.mission': 'الرسالة والرؤية',
    'nav.about.history': 'تاريخنا',
    'nav.about.team': 'فريقنا',
    'nav.about.partners': 'الشركاء',
    'nav.about.reports': 'التقارير',

    // Get Involved submenu
    'nav.getInvolved.membership': 'العضوية',
    'nav.getInvolved.volunteer': 'التطوع',
    'nav.getInvolved.donate': 'تبرع',
    'nav.getInvolved.partnerships': 'الشراكات',
    'nav.getInvolved.jobs': 'الوظائف',

    // Programmes submenu
    'nav.programmes.women': 'برنامج النساء',
    'nav.programmes.elderly': 'برنامج كبار السن',
    'nav.programmes.youth': 'برنامج الشباب',
    'nav.programmes.children': 'برنامج الأطفال',
    'nav.programmes.men': 'برنامج الرجال',

    // Footer
    'footer.tagline': 'نخدم مجتمعنا منذ عام 1988',
    'footer.about': 'عن الجمعية',
    'footer.quickLinks': 'روابط سريعة',
    'footer.getInvolved': 'شارك معنا',
    'footer.newsletter': 'النشرة الإخبارية',
    'footer.newsletterText': 'ابق على اطلاع بأحدث الأخبار والفعاليات',
    'footer.emailPlaceholder': 'عنوان بريدك الإلكتروني',
    'footer.subscribe': 'اشترك',
    'footer.copyright': '© 2024 جمعية الجالية اليمنية. جميع الحقوق محفوظة.',
    'footer.charity': 'جمعية خيرية مسجلة',

    // Common buttons
    'button.learnMore': 'اعرف المزيد',
    'button.readMore': 'اقرأ المزيد',
    'button.viewAll': 'عرض الكل',
    'button.register': 'سجل',
    'button.submit': 'إرسال',
    'button.send': 'إرسال',
    'button.cancel': 'إلغاء',
    'button.save': 'حفظ',
    'button.delete': 'حذف',
    'button.edit': 'تعديل',
    'button.close': 'إغلاق',
    'button.back': 'رجوع',
    'button.apply': 'تقديم',
    'button.download': 'تحميل',

    // Home page
    'home.welcomeToYCA': 'مرحباً بكم في جمعية الجالية اليمنية',
    'home.servingCommunity': 'نخدم مجتمعنا منذ عام 1988',
    'home.ourServices': 'خدماتنا',
    'home.upcomingEvents': 'الفعاليات القادمة',
    'home.latestNews': 'آخر الأخبار',
    'home.getInvolved': 'شارك معنا',
    'home.makeADifference': 'اصنع الفرق',

    // Contact page
    'contact.title': 'اتصل بنا',
    'contact.getInTouch': 'تواصل معنا',
    'contact.description': 'إذا كان لديك سؤال أو استفسار عام، يمكنك التواصل معنا وسنتواصل معك في أقرب وقت ممكن.',
    'contact.address': 'العنوان',
    'contact.phone': 'الهاتف',
    'contact.email': 'البريد الإلكتروني',
    'contact.openingTimes': 'أوقات العمل',
    'contact.sendMessage': 'أرسل لنا رسالة',
    'contact.yourName': 'اسمك',
    'contact.subject': 'الموضوع',
    'contact.message': 'الرسالة',
    'contact.sendingMessage': 'جاري الإرسال...',
    'contact.messageSent': 'شكراً لرسالتك! سنتواصل معك قريباً.',
    'contact.messageError': 'حدث خطأ في إرسال رسالتك. يرجى المحاولة مرة أخرى أو التواصل معنا مباشرة.',
    'contact.needAdvice': 'تحتاج مشورة أو دعم؟',
    'contact.adviceText': 'يقدم فريقنا ثنائي اللغة مشورة سرية وتوجيهاً بشأن المزايا الاجتماعية والإسكان والهجرة والمزيد.',
    'contact.callToday': 'اتصل بنا اليوم لحجز موعدك الفردي',

    // Services page
    'services.title': 'خدماتنا',
    'services.description': 'دعم شامل لمجتمعنا',

    // Events page
    'events.title': 'الفعاليات',
    'events.upcoming': 'الفعاليات القادمة',
    'events.past': 'الفعاليات السابقة',
    'events.all': 'كل الفعاليات',
    'events.register': 'سجل للفعالية',
    'events.viewGallery': 'عرض المعرض',
    'events.date': 'التاريخ',
    'events.time': 'الوقت',
    'events.location': 'الموقع',
    'events.category': 'الفئة',

    // News page
    'news.title': 'الأخبار والرؤى',
    'news.latestNews': 'آخر الأخبار',
    'news.archives': 'الأرشيف',

    // Programmes page
    'programmes.title': 'برامجنا',
    'programmes.all': 'الكل',
    'programmes.women': 'النساء',
    'programmes.elderly': 'كبار السن',
    'programmes.youth': 'الشباب',
    'programmes.children': 'الأطفال',
    'programmes.men': 'الرجال',
    'programmes.joinOur': 'انضم إلى برامجنا',
    'programmes.joinDescription': 'سواء كنت تبحث عن المشاركة أو التطوع أو دعم مبادراتنا، هناك مكان لك في برامج مجتمعنا.',
    'programmes.becomeMember': 'كن عضواً',
    'programmes.contactUs': 'اتصل بنا',
    'programmes.makeADifference': 'اصنع الفرق',
    'programmes.supportText': 'دعمك يساعدنا على مواصلة تقديم الخدمات الحيوية لأفراد مجتمعنا',
    'programmes.supportOurWork': 'ادعم عملنا',
    'programmes.volunteerWithUs': 'تطوع معنا',

    // Resources page
    'resources.title': 'الموارد والتنزيلات',

    // Forms
    'form.required': 'مطلوب',
    'form.optional': 'اختياري',
    'form.firstName': 'الاسم الأول',
    'form.lastName': 'اسم العائلة',
    'form.fullName': 'الاسم الكامل',
    'form.email': 'البريد الإلكتروني',
    'form.phone': 'الهاتف',
    'form.address': 'العنوان',
    'form.dateOfBirth': 'تاريخ الميلاد',
    'form.message': 'الرسالة',
    'form.submit': 'إرسال',
    'form.submitting': 'جاري الإرسال...',
    'form.success': 'نجح!',
    'form.error': 'خطأ',

    // Membership
    'membership.title': 'كن عضواً',
    'membership.benefits': 'مزايا العضوية',
    'membership.applyNow': 'قدم الآن',
    'membership.membershipType': 'نوع العضوية',
    'membership.individual': 'فردي',
    'membership.family': 'عائلي',
    'membership.emergencyContact': 'جهة اتصال طوارئ',
    'membership.interests': 'الاهتمامات',
    'membership.termsAccepted': 'أوافق على الشروط والأحكام',

    // Volunteer
    'volunteer.title': 'فرص التطوع',
    'volunteer.whyVolunteer': 'لماذا التطوع؟',
    'volunteer.opportunities': 'فرص التطوع',
    'volunteer.applyNow': 'قدم الآن',
    'volunteer.skills': 'المهارات',
    'volunteer.availability': 'التوفر',

    // Donate
    'donate.title': 'تبرع / ادعمنا',
    'donate.makeADonation': 'تبرع',
    'donate.amount': 'المبلغ',
    'donate.oneTime': 'مرة واحدة',
    'donate.monthly': 'شهري',
    'donate.custom': 'مبلغ مخصص',
    'donate.donateName': 'الاسم',
    'donate.donateEmail': 'البريد الإلكتروني',
    'donate.processing': 'جاري المعالجة...',

    // Admin
    'admin.dashboard': 'لوحة التحكم',
    'admin.content': 'المحتوى',
    'admin.hero': 'شرائح البطل',
    'admin.services': 'الخدمات',
    'admin.programmes': 'البرامج',
    'admin.events': 'الفعاليات',
    'admin.news': 'الأخبار',
    'admin.resources': 'الموارد',
    'admin.team': 'الفريق',
    'admin.registrations': 'التسجيلات',
    'admin.memberships': 'العضويات',
    'admin.volunteers': 'المتطوعين',
    'admin.donations': 'التبرعات',
    'admin.contacts': 'الاتصالات',
    'admin.subscribers': 'المشتركين',
    'admin.partnerships': 'الشراكات',
    'admin.settings': 'الإعدادات',
    'admin.logout': 'تسجيل الخروج',

    // Days of week
    'days.monday': 'الإثنين',
    'days.tuesday': 'الثلاثاء',
    'days.wednesday': 'الأربعاء',
    'days.thursday': 'الخميس',
    'days.friday': 'الجمعة',
    'days.saturday': 'السبت',
    'days.sunday': 'الأحد',

    // Months
    'months.january': 'يناير',
    'months.february': 'فبراير',
    'months.march': 'مارس',
    'months.april': 'أبريل',
    'months.may': 'مايو',
    'months.june': 'يونيو',
    'months.july': 'يوليو',
    'months.august': 'أغسطس',
    'months.september': 'سبتمبر',
    'months.october': 'أكتوبر',
    'months.november': 'نوفمبر',
    'months.december': 'ديسمبر',
  },
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const stored = localStorage.getItem('language');
    return (stored === 'ar' || stored === 'en') ? stored : 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || translations.en[key] || key;
  };

  const value: LanguageContextType = {
    language,
    setLanguage,
    t,
    isRTL: language === 'ar',
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
