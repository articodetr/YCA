import { useState } from 'react';
import { FileText, Users, Phone, Mail, Clock, CheckCircle, CalendarCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageHeader from '../components/PageHeader';
import { fadeInUp, staggerContainer, staggerItem, scaleIn } from '../lib/animations';
import { useLanguage } from '../contexts/LanguageContext';
import { useContent } from '../contexts/ContentContext';
import AdvisoryBookingModal from '../components/modals/AdvisoryBookingModal';

export default function Services() {
  const { language } = useLanguage();
  const { getContent } = useContent();
  const isRTL = language === 'ar';
  const [showAdvisoryModal, setShowAdvisoryModal] = useState(false);

  const c = (key: string, fallback: string) => getContent('services', key, fallback);

  const supportItems = [
    c('support_1', language === 'ar' ? 'توجيه العملاء إلى الجهات ذات الصلة' : 'Signpost clients to relevant third-party agencies'),
    c('support_2', language === 'ar' ? 'المساعدة في ملء نماذج الطلبات' : 'Assist in filling out application forms'),
    c('support_3', language === 'ar' ? 'قراءة وشرح وترجمة الرسائل المعقدة' : 'Read, explain, and translate complex letters'),
    c('support_4', language === 'ar' ? 'الترجمة الفورية نيابة عن العميل خلال الاجتماعات والمكالمات' : "Interpret on the client's behalf during meetings and calls"),
    c('support_5', language === 'ar' ? 'ترتيب جلسات استشارية مع المحامين عند الحاجة للمشورة القانونية' : 'Arrange for solicitor surgeries when legal advice is required'),
    c('support_6', language === 'ar' ? 'دعم طلبات الإسكان عبر الإنترنت باستخدام أجهزة الكمبيوتر المخصصة لدينا' : 'Support online housing applications using our dedicated computers'),
  ];

  const categories = [
    {
      category: c('cat_1_title', language === 'ar' ? 'الرعاية الاجتماعية والمزايا' : 'Welfare & Benefits'),
      items: language === 'ar'
        ? ['بدل الرعاية', 'الائتمان الشامل', 'PIP و DLA', 'إعانة السكن', 'إعانة الطفل', 'الائتمان الضريبي']
        : ['Carer Allowance', 'Universal Credit', 'PIP & DLA', 'Housing Benefits', 'Child Benefit', 'Tax Credit'],
    },
    {
      category: c('cat_2_title', language === 'ar' ? 'الطلبات والإدارة' : 'Applications & Admin'),
      items: language === 'ar'
        ? ['طلبات الهجرة', 'طلبات الإسكان', 'طلبات جواز السفر', 'ضريبة المجلس', 'ترجمة الرسائل', 'الفواتير']
        : ['Immigration Applications', 'Housing Applications', 'Passport Applications', 'Council Tax', 'Letters Translation', 'Bills'],
    },
    {
      category: c('cat_3_title', language === 'ar' ? 'القانونية والعملية' : 'Legal & Practical'),
      items: language === 'ar'
        ? ['ترتيب جلسات المحامين', 'الديون', 'التوظيف', 'العنف الأسري', 'المساعدة في السكن', 'التوكيل الرسمي']
        : ['Arranging Solicitor Surgeries', 'Debt', 'Employment', 'Domestic Violence', 'Housing Assistance', 'Power of Attorney'],
    },
  ];

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'}>
      <PageHeader
        title={c('page_title', language === 'ar' ? 'خدماتنا' : 'Our Services')}
        description=""
        breadcrumbs={[{ label: c('page_title', language === 'ar' ? 'خدماتنا' : 'Our Services') }]}
        pageKey="services"
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
                <h2 className="text-3xl font-bold text-primary mb-6">
                  {c('intro_title', language === 'ar' ? 'تقديم خدمات استشارية وإرشادية شاملة ومستدامة' : 'Sustaining and Developing Comprehensive Advice and Guidance Services')}
                </h2>
                <p className="text-lg text-muted leading-relaxed mb-4">
                  {c('intro_p1', language === 'ar' ? 'تقدم جمعية الجالية اليمنية في برمنغهام خدمات استشارية وإرشادية شاملة في مجالات الصحة والتعليم والرعاية الاجتماعية لخدمة المجتمع بأكمله.' : 'The Yemeni Community Association in Birmingham provides comprehensive advice and guidance services in health, education, and social welfare to serve the whole community.')}
                </p>
                <p className="text-lg text-muted leading-relaxed">
                  {c('intro_p2', language === 'ar' ? 'نعمل بجد لتمكين مجتمعنا، وخاصة أولئك الذين يحتاجون إلى مساعدتنا أكثر من غيرهم.' : "We are working hard to empower our community, especially those who need our help the most: individuals who don't speak English and do not know the system in the UK. We also provide dedicated support to refugees and those in need.")}
                </p>
              </motion.div>

              <motion.div
                className="grid md:grid-cols-2 gap-8 mb-12"
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <motion.div
                  className="bg-white border-2 border-transparent hover:border-emerald-500 p-8 rounded-2xl shadow-lg"
                  variants={staggerItem}
                  whileHover={{ scale: 1.03 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6">
                    <Users size={32} className="text-emerald-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-emerald-700 mb-4">
                    {c('mission_title', language === 'ar' ? 'مهمتنا ومن نساعد' : 'Our Mission and Who We Help')}
                  </h3>
                  <p className="text-muted leading-relaxed">
                    {c('mission_desc', language === 'ar' ? 'نمكّن الأفراد الذين لا يتحدثون الإنجليزية ولا يعرفون النظام البريطاني.' : "We empower individuals who don't speak English and do not know the UK system. All our staff working with these individuals are fluent in both English and Arabic, ensuring clear communication and understanding.")}
                  </p>
                </motion.div>

                <motion.div
                  className="bg-white border-2 border-transparent hover:border-blue-500 p-8 rounded-2xl shadow-lg"
                  variants={staggerItem}
                  whileHover={{ scale: 1.03 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
                    <FileText size={32} className="text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-blue-700 mb-4">
                    {c('how_we_help_title', language === 'ar' ? 'كيف نساعد' : 'How We Help')}
                  </h3>
                  <p className="text-muted leading-relaxed">
                    {c('how_we_help_desc', language === 'ar' ? 'نعمل مع العملاء على أساس سري وفردي.' : 'We work with clients on a confidential, one-to-one basis, providing direct advice and practical support on essential life issues such as welfare benefits, debt, employment, immigration, divorce, domestic violence, and housing.')}
                  </p>
                </motion.div>
              </motion.div>

              <motion.div
                className="bg-primary text-white p-8 rounded-lg mb-12"
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <h3 className="text-2xl font-bold mb-6">
                  {c('support_title', language === 'ar' ? 'سيقوم موظفو الدعم لدينا بـ:' : 'Our Support Workers Will:')}
                </h3>
                <motion.div
                  className="space-y-4"
                  variants={staggerContainer}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                >
                  {supportItems.map((item, idx) => (
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
              <h2 className="text-4xl font-bold text-primary mb-4">
                {c('services_title', language === 'ar' ? 'الخدمات التي نقدمها' : 'Services We Provide')}
              </h2>
              <motion.div
                className="w-24 h-1 bg-accent mx-auto mb-6"
                variants={scaleIn}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              />
              <p className="text-lg text-muted max-w-3xl mx-auto">
                {c('services_subtitle', language === 'ar' ? 'نقدم الإرشاد والمساعدة العملية في مجموعة واسعة من طلبات الإدارة والمزايا' : 'We provide guidance and practical help with a wide range of administrative and benefit applications')}
              </p>
            </motion.div>

            <motion.div
              className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {categories.map((service, index) => {
                const colors = [
                  { border: 'border-emerald-500', text: 'text-emerald-700', icon: 'text-emerald-600' },
                  { border: 'border-blue-500', text: 'text-blue-700', icon: 'text-blue-600' },
                  { border: 'border-amber-500', text: 'text-amber-700', icon: 'text-amber-600' },
                ];
                const color = colors[index % colors.length];

                return (
                  <motion.div
                    key={index}
                    className={`bg-white p-8 rounded-2xl shadow-lg border-2 border-transparent hover:${color.border}`}
                    variants={staggerItem}
                    whileHover={{ y: -8, boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.15)' }}
                    transition={{ duration: 0.3 }}
                  >
                    <h3 className={`text-2xl font-bold ${color.text} mb-6 pb-4 border-b-2 ${color.border}`}>
                      {service.category}
                    </h3>
                    <ul className="space-y-3">
                      {service.items.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <CheckCircle size={20} className={`${color.icon} flex-shrink-0 mt-1`} />
                          <span className="text-muted">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                );
              })}
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
                <h2 className="text-3xl font-bold text-primary mb-6">
                  {c('hours_title', language === 'ar' ? 'متى يمكنكم زيارتنا' : 'When You Can Find Us')}
                </h2>
                <div className="space-y-4 text-lg text-secondary">
                  <p><strong>{c('hours_mon_thu', language === 'ar' ? 'الاثنين - الخميس:' : 'Monday - Thursday:')}</strong> {c('hours_mon_thu_time', language === 'ar' ? '10:00 صباحاً - 3:30 مساءً' : '10:00 AM - 3:30 PM')}</p>
                  <p><strong>{c('hours_fri', language === 'ar' ? 'الجمعة:' : 'Friday:')}</strong> {c('hours_fri_time', language === 'ar' ? '9:00 صباحاً - 1:00 مساءً' : '9:00 AM - 1:00 PM')}</p>
                </div>
                <div className="mt-8 pt-8 border-t-2 border-hover">
                  <p className="text-xl text-primary mb-6 font-semibold">
                    {c('contact_cta', language === 'ar' ? 'تواصل معنا اليوم لحجز موعدك الفردي' : 'Contact us today to book your one-to-one appointment')}
                  </p>
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
                        {c('send_message', language === 'ar' ? 'أرسل رسالة' : 'Send a Message')}
                      </Link>
                    </motion.div>
                    <motion.button
                      onClick={() => setShowAdvisoryModal(true)}
                      className="inline-flex items-center justify-center gap-2 bg-secondary text-white px-8 py-4 rounded-lg hover:bg-primary transition-colors font-semibold"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <CalendarCheck size={20} />
                      {c('book_advisory', language === 'ar' ? 'احجز موعد استشاري' : 'Book an Advisory Appointment')}
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
            <h2 className="text-3xl font-bold mb-4">
              {c('feedback_title', language === 'ar' ? 'نقدّر ملاحظاتكم' : 'We Value Your Feedback')}
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              {c('feedback_desc', language === 'ar' ? 'نطلب من عملائنا تقديم ملاحظاتهم في كل مرة يستخدمون فيها الخدمة، ونستخدم ذلك لتطوير مشروعنا باستمرار.' : 'We ask our clients for feedback every time they use the service, using this to inform the continuous development of our project.')}
            </p>
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
