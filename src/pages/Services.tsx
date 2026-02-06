import { useState } from 'react';
import { FileText, Users, Phone, Mail, Clock, CheckCircle, CalendarCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageHeader from '../components/PageHeader';
import { fadeInUp, staggerContainer, staggerItem, scaleIn } from '../lib/animations';
import { useLanguage } from '../contexts/LanguageContext';
import AdvisoryBookingModal from '../components/modals/AdvisoryBookingModal';

export default function Services() {
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const [showAdvisoryModal, setShowAdvisoryModal] = useState(false);

  const t = language === 'ar' ? {
    pageTitle: 'خدماتنا',
    introTitle: 'تقديم خدمات استشارية وإرشادية شاملة ومستدامة',
    introP1: 'تقدم جمعية الجالية اليمنية في برمنغهام خدمات استشارية وإرشادية شاملة في مجالات الصحة والتعليم والرعاية الاجتماعية لخدمة المجتمع بأكمله.',
    introP2: 'نعمل بجد لتمكين مجتمعنا، وخاصة أولئك الذين يحتاجون إلى مساعدتنا أكثر من غيرهم: الأفراد الذين لا يتحدثون الإنجليزية ولا يعرفون النظام في المملكة المتحدة. كما نقدم دعمًا مخصصًا للاجئين والمحتاجين.',
    missionTitle: 'مهمتنا ومن نساعد',
    missionDesc: 'نمكّن الأفراد الذين لا يتحدثون الإنجليزية ولا يعرفون النظام البريطاني. جميع موظفينا الذين يعملون مع هؤلاء الأفراد يجيدون اللغتين الإنجليزية والعربية، مما يضمن التواصل الواضح والتفاهم.',
    howWeHelpTitle: 'كيف نساعد',
    howWeHelpDesc: 'نعمل مع العملاء على أساس سري وفردي، نقدم المشورة المباشرة والدعم العملي في القضايا الحياتية الأساسية مثل المزايا الاجتماعية والديون والتوظيف والهجرة والطلاق والعنف الأسري والإسكان.',
    supportTitle: 'سيقوم موظفو الدعم لدينا بـ:',
    supportItems: [
      'توجيه العملاء إلى الجهات ذات الصلة',
      'المساعدة في ملء نماذج الطلبات',
      'قراءة وشرح وترجمة الرسائل المعقدة',
      'الترجمة الفورية نيابة عن العميل خلال الاجتماعات والمكالمات',
      'ترتيب جلسات استشارية مع المحامين عند الحاجة للمشورة القانونية',
      'دعم طلبات الإسكان عبر الإنترنت باستخدام أجهزة الكمبيوتر المخصصة لدينا',
    ],
    servicesTitle: 'الخدمات التي نقدمها',
    servicesSubtitle: 'نقدم الإرشاد والمساعدة العملية في مجموعة واسعة من طلبات الإدارة والمزايا',
    categories: [
      {
        category: 'الرعاية الاجتماعية والمزايا',
        items: ['بدل الرعاية', 'الائتمان الشامل', 'PIP و DLA', 'إعانة السكن', 'إعانة الطفل', 'الائتمان الضريبي'],
      },
      {
        category: 'الطلبات والإدارة',
        items: ['طلبات الهجرة', 'طلبات الإسكان', 'طلبات جواز السفر', 'ضريبة المجلس', 'ترجمة الرسائل', 'الفواتير'],
      },
      {
        category: 'القانونية والعملية',
        items: ['ترتيب جلسات المحامين', 'الديون', 'التوظيف', 'العنف الأسري', 'المساعدة في السكن', 'التوكيل الرسمي'],
      },
    ],
    hoursTitle: 'متى يمكنكم زيارتنا',
    monThu: 'الاثنين - الخميس:',
    monThuTime: '10:00 صباحاً - 3:30 مساءً',
    fri: 'الجمعة:',
    friTime: '9:00 صباحاً - 1:00 مساءً',
    contactCta: 'تواصل معنا اليوم لحجز موعدك الفردي',
    sendMessage: 'أرسل رسالة',
    bookAdvisory: 'احجز موعد استشاري',
    feedbackTitle: 'نقدّر ملاحظاتكم',
    feedbackDesc: 'نطلب من عملائنا تقديم ملاحظاتهم في كل مرة يستخدمون فيها الخدمة، ونستخدم ذلك لتطوير مشروعنا باستمرار.',
  } : {
    pageTitle: 'Our Services',
    introTitle: 'Sustaining and Developing Comprehensive Advice and Guidance Services',
    introP1: 'The Yemeni Community Association in Birmingham provides comprehensive advice and guidance services in health, education, and social welfare to serve the whole community.',
    introP2: 'We are working hard to empower our community, especially those who need our help the most: individuals who don\'t speak English and do not know the system in the UK. We also provide dedicated support to refugees and those in need.',
    missionTitle: 'Our Mission and Who We Help',
    missionDesc: 'We empower individuals who don\'t speak English and do not know the UK system. All our staff working with these individuals are fluent in both English and Arabic, ensuring clear communication and understanding.',
    howWeHelpTitle: 'How We Help',
    howWeHelpDesc: 'We work with clients on a confidential, one-to-one basis, providing direct advice and practical support on essential life issues such as welfare benefits, debt, employment, immigration, divorce, domestic violence, and housing.',
    supportTitle: 'Our Support Workers Will:',
    supportItems: [
      'Signpost clients to relevant third-party agencies',
      'Assist in filling out application forms',
      'Read, explain, and translate complex letters',
      'Interpret on the client\'s behalf during meetings and calls',
      'Arrange for solicitor surgeries when legal advice is required',
      'Support online housing applications using our dedicated computers',
    ],
    servicesTitle: 'Services We Provide',
    servicesSubtitle: 'We provide guidance and practical help with a wide range of administrative and benefit applications',
    categories: [
      {
        category: 'Welfare & Benefits',
        items: ['Carer Allowance', 'Universal Credit', 'PIP & DLA', 'Housing Benefits', 'Child Benefit', 'Tax Credit'],
      },
      {
        category: 'Applications & Admin',
        items: ['Immigration Applications', 'Housing Applications', 'Passport Applications', 'Council Tax', 'Letters Translation', 'Bills'],
      },
      {
        category: 'Legal & Practical',
        items: ['Arranging Solicitor Surgeries', 'Debt', 'Employment', 'Domestic Violence', 'Housing Assistance', 'Power of Attorney'],
      },
    ],
    hoursTitle: 'When You Can Find Us',
    monThu: 'Monday - Thursday:',
    monThuTime: '10:00 AM - 3:30 PM',
    fri: 'Friday:',
    friTime: '9:00 AM - 1:00 PM',
    contactCta: 'Contact us today to book your one-to-one appointment',
    sendMessage: 'Send a Message',
    bookAdvisory: 'Book an Advisory Appointment',
    feedbackTitle: 'We Value Your Feedback',
    feedbackDesc: 'We ask our clients for feedback every time they use the service, using this to inform the continuous development of our project.',
  };

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'}>
      <PageHeader
        title={t.pageTitle}
        description=""
        breadcrumbs={[{ label: t.pageTitle }]}
        image="https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=1920"
      />

      <div className="pt-20">
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <motion.div
                className="bg-sand p-8 rounded-lg mb-12"
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <h2 className="text-3xl font-bold text-primary mb-6">{t.introTitle}</h2>
                <p className="text-lg text-muted leading-relaxed mb-4">{t.introP1}</p>
                <p className="text-lg text-muted leading-relaxed">{t.introP2}</p>
              </motion.div>

              <motion.div
                className="grid md:grid-cols-2 gap-8 mb-12"
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <motion.div
                  className="bg-white border-2 border-accent p-8 rounded-lg"
                  variants={staggerItem}
                  whileHover={{ scale: 1.03 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mb-6">
                    <Users size={32} className="text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold text-primary mb-4">{t.missionTitle}</h3>
                  <p className="text-muted leading-relaxed">{t.missionDesc}</p>
                </motion.div>

                <motion.div
                  className="bg-white border-2 border-accent p-8 rounded-lg"
                  variants={staggerItem}
                  whileHover={{ scale: 1.03 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mb-6">
                    <FileText size={32} className="text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold text-primary mb-4">{t.howWeHelpTitle}</h3>
                  <p className="text-muted leading-relaxed">{t.howWeHelpDesc}</p>
                </motion.div>
              </motion.div>

              <motion.div
                className="bg-primary text-white p-8 rounded-lg mb-12"
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <h3 className="text-2xl font-bold mb-6">{t.supportTitle}</h3>
                <motion.div
                  className="space-y-4"
                  variants={staggerContainer}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                >
                  {t.supportItems.map((item, idx) => (
                    <motion.div key={idx} className="flex items-start gap-4" variants={staggerItem}>
                      <CheckCircle size={24} className="text-accent flex-shrink-0 mt-1" />
                      <p className="text-lg">{item}</p>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-sand">
          <div className="container mx-auto px-4">
            <motion.div
              className="text-center mb-12"
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-primary mb-4">{t.servicesTitle}</h2>
              <motion.div
                className="w-24 h-1 bg-accent mx-auto mb-6"
                variants={scaleIn}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              />
              <p className="text-lg text-muted max-w-3xl mx-auto">{t.servicesSubtitle}</p>
            </motion.div>

            <motion.div
              className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {t.categories.map((service, index) => (
                <motion.div
                  key={index}
                  className="bg-white p-8 rounded-lg shadow-lg"
                  variants={staggerItem}
                  whileHover={{ y: -8, boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                  transition={{ duration: 0.3 }}
                >
                  <h3 className="text-2xl font-bold text-primary mb-6 pb-4 border-b-2 border-accent">
                    {service.category}
                  </h3>
                  <ul className="space-y-3">
                    {service.items.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <CheckCircle size={20} className="text-accent flex-shrink-0 mt-1" />
                        <span className="text-muted">{item}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <motion.div
                className="bg-accent p-12 rounded-lg text-center"
                variants={scaleIn}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <motion.div
                  className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6"
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                >
                  <Clock size={40} className="text-primary" />
                </motion.div>
                <h2 className="text-3xl font-bold text-primary mb-6">{t.hoursTitle}</h2>
                <div className="space-y-4 text-lg text-secondary">
                  <p><strong>{t.monThu}</strong> {t.monThuTime}</p>
                  <p><strong>{t.fri}</strong> {t.friTime}</p>
                </div>
                <div className="mt-8 pt-8 border-t-2 border-hover">
                  <p className="text-xl text-primary mb-6 font-semibold">{t.contactCta}</p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <motion.a
                      href="tel:01214395280"
                      className="inline-flex items-center justify-center gap-2 bg-primary text-white px-8 py-4 rounded-lg hover:bg-secondary transition-colors font-semibold"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Phone size={20} />
                      0121 439 5280
                    </motion.a>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Link
                        to="/contact"
                        className="inline-flex items-center justify-center gap-2 bg-white text-primary px-8 py-4 rounded-lg hover:bg-hover transition-colors font-semibold border-2 border-primary"
                      >
                        <Mail size={20} />
                        {t.sendMessage}
                      </Link>
                    </motion.div>
                    <motion.button
                      onClick={() => setShowAdvisoryModal(true)}
                      className="inline-flex items-center justify-center gap-2 bg-secondary text-white px-8 py-4 rounded-lg hover:bg-primary transition-colors font-semibold"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <CalendarCheck size={20} />
                      {t.bookAdvisory}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-primary text-white">
          <motion.div
            className="container mx-auto px-4 text-center"
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-4">{t.feedbackTitle}</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">{t.feedbackDesc}</p>
          </motion.div>
        </section>
      </div>

      <AdvisoryBookingModal
        isOpen={showAdvisoryModal}
        onClose={() => setShowAdvisoryModal(false)}
        onSuccess={() => setShowAdvisoryModal(false)}
      />
    </div>
  );
}
