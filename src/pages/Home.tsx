import { Link } from 'react-router-dom';
import { Trophy, Users, Building, GraduationCap, Heart, Calendar, FileText, HandHeart, ArrowRight, Newspaper, User, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { fadeInUp, fadeInLeft, fadeInRight, staggerContainer, staggerItem, scaleIn } from '../lib/animations';
import CounterStat from '../components/CounterStat';
import { supabase } from '../lib/supabase';
import { useContent } from '../contexts/ContentContext';
import { useSiteSettings } from '../contexts/SiteSettingsContext';
import { useLanguage } from '../contexts/LanguageContext';
import MembershipApplicationModal from '../components/modals/MembershipApplicationModal';
import VolunteerApplicationModal from '../components/modals/VolunteerApplicationModal';
import DonationModal from '../components/modals/DonationModal';
import PartnershipModal from '../components/modals/PartnershipModal';
import BeltDivider from '../components/BeltDivider';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: string;
  image_url: string | null;
}

interface NewsArticle {
  id: string;
  title: string;
  title_ar: string | null;
  excerpt: string;
  description_ar: string | null;
  category: string;
  author: string;
  published_at: string;
  image_url: string | null;
}

export default function Home() {
  const { getContent } = useContent();
  const { getSetting, getPageImage } = useSiteSettings();
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  const [stats, setStats] = useState({
    members: 850,
    events: 0,
    news: 0
  });

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const [heroSlides, setHeroSlides] = useState<Array<{
    image: string;
    title: string;
    subtitle: string;
  }>>([
    {
      image: 'https://hilarious-white-ucpcnwuigy.edgeone.app/121.jpg',
      title: 'Empowering the Yemeni Community',
      subtitle: 'in Birmingham'
    }
  ]);

  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [latestNews, setLatestNews] = useState<NewsArticle[]>([]);
  const [showMembershipModal, setShowMembershipModal] = useState(false);
  const [showVolunteerModal, setShowVolunteerModal] = useState(false);
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [showPartnershipModal, setShowPartnershipModal] = useState(false);

  useEffect(() => {
    fetchStats();
    fetchHeroSlides();
    fetchUpcomingEvents();
    fetchLatestNews();
  }, [language]);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);

    return () => clearInterval(timer);
  }, [isAutoPlaying, heroSlides.length]);

  const fetchStats = async () => {
    try {
      const [membersRes, eventsRes, newsRes] = await Promise.all([
        supabase.from('membership_applications').select('id', { count: 'exact', head: true }),
        supabase.from('events').select('id', { count: 'exact', head: true }),
        supabase.from('news').select('id', { count: 'exact', head: true })
      ]);

      setStats({
        members: membersRes.count || 850,
        events: eventsRes.count || 0,
        news: newsRes.count || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchHeroSlides = async () => {
    try {
      const { data, error } = await supabase
        .from('hero_slides')
        .select('title, subtitle, title_ar, description_ar, image_url')
        .eq('is_active', true)
        .order('order_number', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        setHeroSlides(
          data
            .filter((s) => !!s.image_url)
            .map(slide => ({
              image: slide.image_url as string,
              title: language === 'ar' && slide.title_ar ? slide.title_ar : slide.title,
              subtitle: language === 'ar' && slide.description_ar ? slide.description_ar : (slide.subtitle || '')
            }))
        );
      }
    } catch (error) {
      console.error('Error fetching hero slides:', error);
    }
  };

  const fetchUpcomingEvents = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .gte('date', today)
        .order('date', { ascending: true })
        .limit(4);

      if (error) throw error;
      setUpcomingEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const fetchLatestNews = async () => {
    try {
      const { data, error } = await supabase
        .from('news')
        .select('id, title, title_ar, excerpt, description_ar, category, author, published_at, image_url')
        .order('published_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      setLatestNews(data || []);
    } catch (error) {
      console.error('Error fetching latest news:', error);
    }
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const heroImage = heroSlides?.[currentSlide]?.image || 'https://hilarious-white-ucpcnwuigy.edgeone.app/121.jpg';

  // ✅ نص واحد + زر واحد
  const heroTitle =
    getContent('home', 'hero_single_title', '') ||
    (isRTL ? 'الجالية اليمنية في برمنجهام' : 'Yemeni Community Association Birmingham');

  const heroButtonText =
    getContent('home', 'hero_single_button', '') ||
    (isRTL ? 'انضم إلينا' : 'Join Us');

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'}>
      {/* ✅ Hero Section (مثل الصورة) */}
      <section className="relative pt-20 md:pt-24 bg-white overflow-hidden">
        <div className="relative h-[420px] sm:h-[480px] md:h-[560px] lg:h-[620px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
            >
              {/* ✅ صورة كاملة على الجوال: object-contain
                  ✅ على الديسكتوب: object-cover */}
              <img
                src={heroImage}
                alt="Hero"
                className="w-full h-full object-contain md:object-cover"
              />

              {/* طبقة خفيفة جدًا فقط (بدون تغميق قوي) */}
              <div className="absolute inset-0 bg-white/10"></div>
            </motion.div>
          </AnimatePresence>

          {/* ✅ نص واحد + زر واحد */}
          <div className="absolute inset-0 flex items-center">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
                className={`max-w-xl ${isRTL ? 'ml-auto text-right' : 'mr-auto text-left'}`}
              >
                <motion.div
                  variants={fadeInUp}
                  className="bg-white/75 backdrop-blur-sm rounded-3xl px-6 py-6 md:px-8 md:py-8 shadow-xl border border-white/60"
                >
                  <h1 className="text-2xl sm:text-3xl md:text-5xl font-extrabold text-primary leading-tight mb-5">
                    {heroTitle}
                  </h1>

                  <div className="flex flex-wrap gap-3">
                    <Link
                      to="/membership"
                      className="inline-flex items-center gap-2 bg-accent text-primary px-7 py-3 rounded-full hover:bg-hover transition-all font-semibold text-sm md:text-base uppercase tracking-wider shadow-md"
                    >
                      {heroButtonText}
                      <ArrowRight size={18} className={isRTL ? 'rotate-180' : ''} />
                    </Link>
                  </div>
                </motion.div>

                {/* ✅ لو تحب نقاط السلايدر تظل موجودة بشكل خفيف (اختياري) */}
                {heroSlides.length > 1 && (
                  <div className={`mt-4 flex items-center gap-2 ${isRTL ? 'justify-end' : 'justify-start'}`}>
                    {heroSlides.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`h-2.5 w-2.5 rounded-full transition-all ${
                          currentSlide === index ? 'bg-primary' : 'bg-primary/30 hover:bg-primary/50'
                        }`}
                        aria-label={`Slide ${index + 1}`}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            </div>
          </div>

          {/* ✅ الشكل الأبيض السفلي (قريب من الصورة) */}
          <div className="absolute bottom-0 left-0 right-0">
            <div className="h-20 sm:h-24 md:h-28 bg-white rounded-t-[60px] shadow-[0_-10px_30px_rgba(0,0,0,0.08)]">
              {/* Pattern بسيط (لو عندك pattern جاهز استبدله) */}
              <div className="h-full w-full opacity-[0.08]"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 20% 20%, #000 1px, transparent 1px), radial-gradient(circle at 80% 20%, #000 1px, transparent 1px), radial-gradient(circle at 20% 80%, #000 1px, transparent 1px), radial-gradient(circle at 80% 80%, #000 1px, transparent 1px)",
                  backgroundSize: "60px 60px",
                  backgroundPosition: "0 0, 30px 0, 0 30px, 30px 30px"
                }}
              />
            </div>
          </div>
        </div>
      </section>

      <BeltDivider />

      {/* Welcome Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[700px] h-[700px] pointer-events-none opacity-[0.04]">
          <img
            src="/logo_white.png"
            alt=""
            className="w-full h-full object-contain"
          />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            className="text-center mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.h2 className="text-4xl sm:text-5xl font-bold text-primary mb-6" variants={fadeInUp}>
              {getContent('home', 'welcome_title', 'Welcome to YCA Birmingham')}
            </motion.h2>
            <motion.div className="w-32 h-1 bg-gradient-to-r from-transparent via-accent to-transparent mx-auto mb-6" variants={scaleIn}></motion.div>
            <motion.p className="text-lg text-muted max-w-3xl mx-auto leading-relaxed" variants={fadeInUp}>
              {getContent('home', 'welcome_description', 'We are dedicated to raising the profile of the Yemeni community as a vibrant, cohesive community contributing positively to the social, economic, and cultural life of Birmingham.')}
            </motion.p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInLeft}
            >
              <motion.img
                src={getPageImage('home', 'welcome_section', 'https://hilarious-white-ucpcnwuigy.edgeone.app/121.jpg')}
                alt="Community gathering"
                className="rounded-2xl shadow-2xl"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              />
            </motion.div>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInRight}
            >
              <h3 className="text-3xl font-bold text-primary mb-6">{getContent('home', 'mission_title', 'Our Mission & Vision')}</h3>
              <p className="text-lg text-muted mb-4 leading-relaxed">
                {getContent('home', 'mission_paragraph1', "In all our activities and services, YCA Birmingham is focused on the community, brings the community together, preserves the identity of the Yemeni Community, and encourages mutual respect.")}
              </p>
              <p className="text-lg text-muted mb-6 leading-relaxed">
                {getContent('home', 'mission_paragraph2', "We provide community services such as advice, information, advocacy, and related services for the local community, with a special focus on individuals who don't speak English and need Arabic-speaking advisors.")}
              </p>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/about/mission"
                  className="inline-flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-xl hover:bg-secondary transition-colors font-semibold shadow-lg"
                >
                  {getContent('home', 'mission_button', 'Learn More About Us')}
                  <ArrowRight size={18} className={isRTL ? 'rotate-180' : ''} />
                </Link>
              </motion.div>
            </motion.div>
          </div>

          {/* Stats */}
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <CounterStat
              icon={<Users size={32} className="text-primary" />}
              value={parseInt(getSetting('stat_members', '850')) || 850}
              suffix="+"
              label={getContent('home', 'stats_members_label', 'Active Members')}
              delay={0.1}
            />
            <CounterStat
              icon={<GraduationCap size={32} className="text-primary" />}
              value={parseInt(getSetting('stat_programmes', '5')) || 5}
              label={getContent('home', 'stats_programmes_label', 'Core Programmes')}
              delay={0.2}
            />
            <CounterStat
              icon={<Trophy size={32} className="text-primary" />}
              value={parseInt(getSetting('stat_years', '30')) || 30}
              suffix="+"
              label={getContent('home', 'stats_years_label', 'Years of Service')}
              delay={0.3}
            />
            <CounterStat
              icon={<Heart size={32} className="text-primary" />}
              value={parseInt(getSetting('stat_impact', '1000')) || 1000}
              suffix="+"
              label={getContent('home', 'stats_impact_label', 'Lives Impacted')}
              delay={0.4}
            />
          </motion.div>
        </div>
      </section>

      {latestNews.length > 0 && (
        <>
          <BeltDivider />

          <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                className="text-center mb-16"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={staggerContainer}
              >
                <motion.h2 className="text-4xl sm:text-5xl font-bold text-primary mb-6" variants={fadeInUp}>
                  {isRTL ? 'آخر الأخبار' : 'Latest News'}
                </motion.h2>
                <motion.div className="w-32 h-1 bg-gradient-to-r from-transparent via-[#8B4513] to-transparent mx-auto mb-6" variants={scaleIn}></motion.div>
                <motion.p className="text-lg text-muted max-w-3xl mx-auto" variants={fadeInUp}>
                  {isRTL ? 'تابع آخر أخبار وأنشطة الجمعية' : 'Stay updated with the latest from our community'}
                </motion.p>
              </motion.div>

              <motion.div
                className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto"
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                {latestNews.map((article, idx) => {
                  const publishDate = new Date(article.published_at);
                  const formattedDate = publishDate.toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  });

                  const defaultNewsImages = [
                    'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=600',
                    'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=600',
                    'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=600'
                  ];

                  const title = isRTL && article.title_ar ? article.title_ar : article.title;
                  const excerpt = isRTL && article.description_ar ? article.description_ar : article.excerpt;

                  return (
                    <motion.div
                      key={article.id}
                      className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all group border border-gray-100"
                      variants={staggerItem}
                      whileHover={{ y: -8 }}
                    >
                      <div className="relative h-52 overflow-hidden">
                        <img
                          src={article.image_url || defaultNewsImages[idx % 3]}
                          alt={title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute top-4 left-4">
                          <span className="inline-flex items-center gap-1.5 bg-white/90 backdrop-blur-sm text-[#8B4513] text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm">
                            <Tag size={12} />
                            {article.category}
                          </span>
                        </div>
                      </div>

                      <div className="p-6">
                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                          <span className="inline-flex items-center gap-1.5">
                            <Calendar size={14} />
                            {formattedDate}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <User size={14} />
                            {article.author}
                          </span>
                        </div>

                        <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 min-h-[3.5rem] group-hover:text-[#8B4513] transition-colors">
                          <Link to={`/news/${article.id}`}>{title}</Link>
                        </h3>

                        <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
                          {excerpt}
                        </p>

                        <Link
                          to={`/news/${article.id}`}
                          className="inline-flex items-center gap-2 text-[#8B4513] font-semibold text-sm hover:gap-3 transition-all group/link"
                        >
                          {isRTL ? 'اقرأ المزيد' : 'Read More'}
                          <ArrowRight size={16} className={`group-hover/link:translate-x-1 transition-transform ${isRTL ? 'rotate-180' : ''}`} />
                        </Link>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>

              <motion.div
                className="text-center mt-12"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
              >
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/news"
                    className="inline-flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-xl hover:bg-secondary transition-colors font-semibold shadow-lg"
                  >
                    <Newspaper size={18} />
                    {isRTL ? 'عرض جميع الأخبار' : 'View All News'}
                    <ArrowRight size={18} className={isRTL ? 'rotate-180' : ''} />
                  </Link>
                </motion.div>
              </motion.div>
            </div>
          </section>
        </>
      )}

      <BeltDivider />

      {/* Services Section */}
      <section className="py-20 bg-white">
        {/* باقي الصفحة بدون تغيير */}
        {/* ... نفس كودك الحالي من هنا إلى النهاية ... */}
      </section>

      {/* Modals */}
      <MembershipApplicationModal isOpen={showMembershipModal} onClose={() => setShowMembershipModal(false)} />
      <VolunteerApplicationModal isOpen={showVolunteerModal} onClose={() => setShowVolunteerModal(false)} />
      <DonationModal isOpen={showDonationModal} onClose={() => setShowDonationModal(false)} />
      <PartnershipModal isOpen={showPartnershipModal} onClose={() => setShowPartnershipModal(false)} />
    </div>
  );
}
