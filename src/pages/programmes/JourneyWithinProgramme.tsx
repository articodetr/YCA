import { Heart, BookOpen, Users, Compass, Mail, Star, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageHeader from '../../components/PageHeader';
import { fadeInUp, fadeInLeft, fadeInRight, staggerContainer, staggerItem, scaleIn } from '../../lib/animations';
import { useLanguage } from '../../contexts/LanguageContext';

export default function JourneyWithinProgramme() {
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  const t = {
    en: {
      title: 'The Journey Within',
      intro: 'The Journey Within is a transformative personal development programme offered by YCA Birmingham that focuses on self-discovery, spiritual well-being, and building resilience. Designed for all community members, this programme provides tools and techniques to navigate life\'s challenges with inner strength and clarity.',
      purposeTitle: 'Purpose & Vision',
      purposeDesc: 'In a fast-paced world, many people struggle with stress, identity, and a sense of purpose. The Journey Within offers a structured path for individuals to reconnect with themselves, explore their values, and develop a deeper understanding of their place in the world. Drawing from Islamic spirituality, counselling techniques, and mindfulness practices, the programme creates a safe space for honest self-reflection.',
      whatWeOfferTitle: 'What We Offer',
      activities: [
        { title: 'Self-Discovery Workshops', desc: 'Guided sessions helping participants explore their strengths, values, and personal goals through interactive exercises.', icon: 'compass' },
        { title: 'Mindfulness & Meditation', desc: 'Learn practical techniques for stress reduction, emotional regulation, and developing inner calm in everyday life.', icon: 'sparkles' },
        { title: 'Group Discussion Circles', desc: 'Safe, confidential spaces to share experiences, learn from others, and build supportive connections within the community.', icon: 'users' },
        { title: 'Spiritual Reflection', desc: 'Sessions exploring Islamic teachings on self-improvement, patience, gratitude, and finding meaning in challenges.', icon: 'book' },
        { title: 'Mentorship Programme', desc: 'One-to-one guidance from experienced mentors who provide personalised support on your development journey.', icon: 'star' },
        { title: 'Wellbeing Resources', desc: 'Access to books, materials, and online resources that support continued growth between sessions.', icon: 'heart' },
      ],
      whoCanJoin: 'Who Can Join?',
      whoCanJoinDesc: 'The Journey Within is open to all community members aged 18 and above, regardless of background. Whether you are going through a difficult period, seeking personal growth, or simply looking for a supportive community, this programme welcomes you.',
      scheduleTitle: 'Programme Schedule',
      scheduleDesc: 'Sessions run weekly during term time. Please contact us for the current schedule and to register your interest.',
      ctaTitle: 'Begin Your Journey',
      ctaDesc: 'Take the first step towards a deeper understanding of yourself and your potential. Join The Journey Within and discover the strength that comes from self-knowledge.',
      contactUs: 'Contact Us to Register',
      learnMore: 'Learn More About Our Programmes',
    },
    ar: {
      title: 'الرحلة الداخلية',
      intro: 'الرحلة الداخلية هو برنامج تنمية شخصية تحويلي تقدمه جمعية الجالية اليمنية في برمنغهام يركز على اكتشاف الذات والرفاه الروحي وبناء المرونة. مصمم لجميع أفراد المجتمع، يوفر هذا البرنامج أدوات وتقنيات للتعامل مع تحديات الحياة بقوة داخلية ووضوح.',
      purposeTitle: 'الهدف والرؤية',
      purposeDesc: 'في عالم سريع الخطى، يعاني كثيرون من التوتر والهوية والشعور بالهدف. تقدم الرحلة الداخلية مسارًا منظمًا للأفراد لإعادة التواصل مع أنفسهم واستكشاف قيمهم وتطوير فهم أعمق لمكانتهم في العالم. بالاستفادة من الروحانية الإسلامية وتقنيات الإرشاد وممارسات اليقظة، يخلق البرنامج مساحة آمنة للتأمل الذاتي الصادق.',
      whatWeOfferTitle: 'ما نقدمه',
      activities: [
        { title: 'ورش عمل اكتشاف الذات', desc: 'جلسات موجهة تساعد المشاركين على استكشاف نقاط قوتهم وقيمهم وأهدافهم الشخصية من خلال تمارين تفاعلية.', icon: 'compass' },
        { title: 'اليقظة والتأمل', desc: 'تعلم تقنيات عملية للحد من التوتر وتنظيم المشاعر وتطوير الهدوء الداخلي في الحياة اليومية.', icon: 'sparkles' },
        { title: 'حلقات النقاش الجماعي', desc: 'مساحات آمنة وسرية لمشاركة التجارب والتعلم من الآخرين وبناء روابط داعمة داخل المجتمع.', icon: 'users' },
        { title: 'التأمل الروحي', desc: 'جلسات تستكشف التعاليم الإسلامية حول تحسين الذات والصبر والامتنان وإيجاد المعنى في التحديات.', icon: 'book' },
        { title: 'برنامج الإرشاد', desc: 'توجيه فردي من مرشدين ذوي خبرة يقدمون دعمًا شخصيًا في رحلة تطورك.', icon: 'star' },
        { title: 'موارد الرفاهية', desc: 'الوصول إلى الكتب والمواد والموارد عبر الإنترنت التي تدعم النمو المستمر بين الجلسات.', icon: 'heart' },
      ],
      whoCanJoin: 'من يمكنه الانضمام؟',
      whoCanJoinDesc: 'الرحلة الداخلية مفتوحة لجميع أفراد المجتمع من عمر 18 سنة فما فوق، بغض النظر عن الخلفية. سواء كنت تمر بفترة صعبة أو تسعى للنمو الشخصي أو تبحث ببساطة عن مجتمع داعم، هذا البرنامج يرحب بك.',
      scheduleTitle: 'جدول البرنامج',
      scheduleDesc: 'تقام الجلسات أسبوعيًا خلال الفصل الدراسي. يرجى التواصل معنا للحصول على الجدول الحالي وتسجيل اهتمامك.',
      ctaTitle: 'ابدأ رحلتك',
      ctaDesc: 'اتخذ الخطوة الأولى نحو فهم أعمق لنفسك وإمكاناتك. انضم إلى الرحلة الداخلية واكتشف القوة التي تأتي من معرفة الذات.',
      contactUs: 'تواصل معنا للتسجيل',
      learnMore: 'تعرف على المزيد عن برامجنا',
    },
  };

  const content = t[language];

  const iconMap: Record<string, React.ReactNode> = {
    compass: <Compass size={28} className="text-primary" />,
    sparkles: <Sparkles size={28} className="text-primary" />,
    users: <Users size={28} className="text-primary" />,
    book: <BookOpen size={28} className="text-primary" />,
    star: <Star size={28} className="text-primary" />,
    heart: <Heart size={28} className="text-primary" />,
  };

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'}>
      <PageHeader
        title={content.title}
        description=""
        breadcrumbs={[{ label: language === 'ar' ? 'البرامج' : 'Programmes', path: '/programmes/journey-within' }, { label: content.title }]}
        pageKey="programmes_journey"
      />

      <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <motion.div
                className="bg-sand p-8 rounded-lg mb-12"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
              >
                <p className="text-lg text-muted leading-relaxed">{content.intro}</p>
              </motion.div>

              <motion.div
                className="mb-12"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
              >
                <h2 className="text-3xl font-bold text-primary mb-6">{content.purposeTitle}</h2>
                <p className="text-lg text-muted leading-relaxed">{content.purposeDesc}</p>
              </motion.div>

              <div className="mb-12">
                <motion.h2
                  className="text-3xl font-bold text-primary mb-8"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeInUp}
                >
                  {content.whatWeOfferTitle}
                </motion.h2>

                <motion.div
                  className="grid md:grid-cols-2 gap-6"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={staggerContainer}
                >
                  {content.activities.map((activity, index) => (
                    <motion.div
                      key={index}
                      className="bg-sand p-6 rounded-lg"
                      variants={staggerItem}
                      whileHover={{ y: -4, transition: { duration: 0.2 } }}
                    >
                      <motion.div
                        className="w-14 h-14 bg-accent rounded-full flex items-center justify-center mb-4"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                      >
                        {iconMap[activity.icon]}
                      </motion.div>
                      <h3 className="text-xl font-bold text-primary mb-3">{activity.title}</h3>
                      <p className="text-muted">{activity.desc}</p>
                    </motion.div>
                  ))}
                </motion.div>
              </div>

              <motion.div
                className="bg-primary text-white p-10 rounded-lg mb-12"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={scaleIn}
              >
                <h2 className="text-3xl font-bold mb-6 text-center">{content.whoCanJoin}</h2>
                <p className="text-xl leading-relaxed text-center max-w-2xl mx-auto">
                  {content.whoCanJoinDesc}
                </p>
              </motion.div>

              <motion.div
                className="grid md:grid-cols-2 gap-8 mb-12"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={staggerContainer}
              >
                <motion.div
                  className="bg-sand p-8 rounded-lg"
                  variants={fadeInLeft}
                >
                  <h3 className="text-2xl font-bold text-primary mb-4">{content.scheduleTitle}</h3>
                  <p className="text-muted">{content.scheduleDesc}</p>
                </motion.div>

                <motion.div
                  className="bg-accent p-8 rounded-lg"
                  variants={fadeInRight}
                >
                  <h3 className="text-2xl font-bold text-primary mb-4">{content.ctaTitle}</h3>
                  <p className="text-muted mb-6">{content.ctaDesc}</p>
                  <div className="flex flex-col gap-3">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Link
                        to="/contact"
                        className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-secondary transition-colors font-semibold"
                      >
                        <Mail size={20} />
                        {content.contactUs}
                      </Link>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Link
                        to="/programmes"
                        className="inline-flex items-center gap-2 bg-white text-primary px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors font-semibold border-2 border-primary"
                      >
                        {content.learnMore}
                      </Link>
                    </motion.div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
      </section>
    </div>
  );
}
