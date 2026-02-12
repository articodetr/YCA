import { Link } from 'react-router-dom';
import { Trophy, Users, Building, GraduationCap, Heart, Calendar, FileText, HandHeart, ArrowRight, Newspaper, User, Tag } from 'lucide-react';
import { motion } from 'framer-motion';
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

  const [heroImage, setHeroImage] = useState<string>(
  'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1920'
);


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
    }, 5000);

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
        setHeroSlides(data.map(slide => ({
          image: slide.image_url,
          title: language === 'ar' && slide.title_ar ? slide.title_ar : slide.title,
          subtitle: language === 'ar' && slide.description_ar ? slide.description_ar : (slide.subtitle || '')
        })));
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

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Hero Section */}
      <section className="relative h-screen text-primary overflow-hidden bg-[#0a1628]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          >
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url('${heroSlides[currentSlide].image}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-accent/45 via-accent/18 to-transparent"></div>


            </div>
          </motion.div>
        </AnimatePresence>

        <div className="container mx-auto px-4 h-full flex items-center justify-center relative z-10">
          <motion.div
            className="max-w-3xl mx-auto text-center"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -30, opacity: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h1 className="text-3xl md:text-4xl font-serif font-light mb-4 leading-tight">
                  {heroSlides[currentSlide].title}
                </h1>
                <h2 className="text-2xl md:text-3xl font-serif font-light mb-8 text-accent">
                  {heroSlides[currentSlide].subtitle}
                </h2>
              </motion.div>
            </AnimatePresence>

            <motion.p
              className="text-base md:text-lg mb-12 text-gray-300 leading-relaxed max-w-2xl mx-auto"
              variants={fadeInUp}
            >
              {getContent('home', 'hero_subtitle', '')}
            </motion.p>

            <motion.div
              className="flex flex-wrap gap-3 mb-16 justify-center"
              variants={staggerContainer}
            >
              <motion.div variants={staggerItem}>
                <Link
                  to="/services"
                  className="inline-flex items-center gap-2 bg-accent text-primary px-6 py-3 hover:bg-hover transition-all font-semibold text-base uppercase tracking-wider"
                >
                  {getContent('home', 'hero_button_services', 'Discover Our Services')} <ArrowRight size={18} />
                </Link>
              </motion.div>
              <motion.div variants={staggerItem}>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 bg-transparent border-2 border-white text-white px-6 py-3 hover:bg-white hover:text-primary transition-all font-semibold text-base uppercase tracking-wider"
                >
                  {getContent('home', 'hero_button_contact', 'Get In Touch')}
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>

        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 z-20 flex items-center gap-4 bg-black/30 backdrop-blur-sm px-4 py-2 rounded-full">
          {heroSlides.map((_, index) => (
            <div key={index} className="flex flex-col items-center">
              <button
                onClick={() => goToSlide(index)}
                className={`text-base font-medium transition-all ${
                  currentSlide === index
                    ? 'text-white scale-110'
                    : 'text-gray-400 hover:text-white'
                }`}
                style={{
                  textShadow: currentSlide === index ? '0 2px 8px rgba(228, 212, 181, 0.6)' : 'none'
                }}
              >
                {String(index + 1).padStart(2, '0')}
              </button>
              <div className="w-12 h-0.5 bg-gray-600 mt-2 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-accent"
                  initial={{ width: '0%' }}
                  animate={{ width: currentSlide === index ? '100%' : '0%' }}
                  transition={{
                    duration: currentSlide === index ? 5 : 0,
                    ease: 'linear'
                  }}
                  key={`progress-${currentSlide}-${index}`}
                />
              </div>
            </div>
          ))}
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
                  <ArrowRight size={18} />
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
                          <ArrowRight size={16} className="group-hover/link:translate-x-1 transition-transform" />
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
                    <ArrowRight size={18} />
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
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.h2 className="text-4xl sm:text-5xl font-bold text-primary mb-6" variants={fadeInUp}>
              {getContent('home', 'services_section_title', 'Our Services')}
            </motion.h2>
            <motion.div className="w-32 h-1 bg-gradient-to-r from-transparent via-[#8B4513] to-transparent mx-auto mb-6" variants={scaleIn}></motion.div>
            <motion.p className="text-lg text-muted max-w-3xl mx-auto" variants={fadeInUp}>
              {getContent('home', 'services_section_description', 'Comprehensive support and guidance for the Yemeni community in Birmingham')}
            </motion.p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div
              className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all group border-2 border-transparent hover:border-emerald-500"
              variants={staggerItem}
              whileHover={{ y: -10, scale: 1.02 }}
            >
              <motion.div
                className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6"
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.5 }}
              >
                <FileText size={32} className="text-emerald-600" />
              </motion.div>
              <h3 className="text-2xl font-bold text-primary mb-4">{getContent('home', 'service_advice_title', 'Advice & Guidance')}</h3>
              <p className="text-muted mb-6 leading-relaxed">
                {getContent('home', 'service_advice_description', 'One-to-one confidential support with welfare benefits, housing, immigration, and essential life services in both English and Arabic.')}
              </p>
              <Link to="/services" className="text-emerald-600 font-semibold hover:text-emerald-700 transition-colors inline-flex items-center gap-2">
                Learn More <ArrowRight size={18} />
              </Link>
            </motion.div>

            <motion.div
              className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all group border-2 border-transparent hover:border-blue-500"
              variants={staggerItem}
              whileHover={{ y: -10, scale: 1.02 }}
            >
              <motion.div
                className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6"
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.5 }}
              >
                <Users size={32} className="text-blue-600" />
              </motion.div>
              <h3 className="text-2xl font-bold text-primary mb-4">{getContent('home', 'service_programmes_title', 'Community Programmes')}</h3>
              <p className="text-muted mb-6 leading-relaxed">
                {getContent('home', 'service_programmes_description', 'Dedicated programmes for women, elderly, youth, children, and men focusing on social bonds, wellbeing, and cultural heritage.')}
              </p>
              <Link to="/programmes/women" className="text-blue-600 font-semibold hover:text-blue-700 transition-colors inline-flex items-center gap-2">
                Explore Programmes <ArrowRight size={18} />
              </Link>
            </motion.div>

            <motion.div
              className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all group border-2 border-transparent hover:border-amber-500"
              variants={staggerItem}
              whileHover={{ y: -10, scale: 1.02 }}
            >
              <motion.div
                className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mb-6"
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.5 }}
              >
                <Building size={32} className="text-amber-600" />
              </motion.div>
              <h3 className="text-2xl font-bold text-primary mb-4">{getContent('home', 'service_hub_title', 'Community Hub')}</h3>
              <p className="text-muted mb-6 leading-relaxed">
                {getContent('home', 'service_hub_description', 'A welcoming space for social gatherings, cultural celebrations, and community events that bring our community together.')}
              </p>
              <Link to="/events" className="text-amber-600 font-semibold hover:text-amber-700 transition-colors inline-flex items-center gap-2">
                View Events <ArrowRight size={18} />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <BeltDivider />

      {/* Upcoming Events Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.h2 className="text-4xl sm:text-5xl font-bold text-primary mb-6" variants={fadeInUp}>
              {getContent('home', 'events_title', 'Upcoming Events')}
            </motion.h2>
            <motion.div className="w-32 h-1 bg-gradient-to-r from-transparent via-[#8B4513] to-transparent mx-auto mb-6" variants={scaleIn}></motion.div>
            <motion.p className="text-lg text-muted max-w-3xl mx-auto" variants={fadeInUp}>
              {getContent('home', 'events_description', 'Join us at our upcoming community events and celebrations')}
            </motion.p>
          </motion.div>

          {/* Events Grid */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {upcomingEvents.slice(0, 4).map((event, idx) => {
              const eventDate = new Date(event.date);
              const dayOfWeek = eventDate.toLocaleDateString('en-US', { weekday: 'short' });
              const month = eventDate.toLocaleDateString('en-US', { month: 'long' });
              const day = eventDate.getDate();

              const defaultImages = [
                'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=400',
                'https://images.pexels.com/photos/3184430/pexels-photo-3184430.jpeg?auto=compress&cs=tinysrgb&w=400',
                'https://images.pexels.com/photos/3184632/pexels-photo-3184632.jpeg?auto=compress&cs=tinysrgb&w=400',
                'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=400'
              ];

              return (
                <motion.div
                  key={event.id}
                  className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all group"
                  variants={staggerItem}
                  whileHover={{ y: -8 }}
                >
                  {/* Event Image */}
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={event.image_url || defaultImages[idx % 4]}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>

                  {/* Event Content */}
                  <div className="p-6">
                    {/* Date and Author */}
                    <div className="text-sm text-[#8B4513] mb-3 font-medium">
                      {dayOfWeek}, {month} {day} / YCA Birmingham
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-gray-900 mb-3 hover:text-[#8B4513] transition-colors line-clamp-2 min-h-[3.5rem]">
                      <Link to="/events">{event.title}</Link>
                    </h3>

                    {/* Description */}
                    <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3 min-h-[4rem]">
                      {event.description}
                    </p>

                    {/* Read More Link */}
                    <Link
                      to="/events"
                      className="inline-flex items-center gap-2 text-[#8B4513] font-semibold hover:gap-3 transition-all group/link"
                    >
                      Read More
                      <ArrowRight size={18} className="group-hover/link:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      <BeltDivider />

      {/* Get Involved Section */}
      <section className="py-20 bg-white relative overflow-hidden">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] pointer-events-none opacity-[0.04]">
          <img
            src="/logo_white.png"
            alt=""
            className="w-full h-full object-contain"
          />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.h2 className="text-4xl sm:text-5xl font-bold text-primary mb-6" variants={fadeInUp}>
              {getContent('home', 'get_involved_title', 'Get Involved')}
            </motion.h2>
            <motion.div className="w-32 h-1 bg-gradient-to-r from-transparent via-accent to-transparent mx-auto mb-6" variants={scaleIn}></motion.div>
            <motion.p className="text-lg text-muted max-w-3xl mx-auto" variants={fadeInUp}>
              {getContent('home', 'get_involved_description', 'There are many ways you can support and contribute to our community')}
            </motion.p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div variants={staggerItem} whileHover={{ y: -10, scale: 1.03 }}>
              <button
                onClick={() => setShowMembershipModal(true)}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all text-center group block border-2 border-transparent hover:border-emerald-500 h-full w-full"
              >
                <motion.div
                  className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <Users size={28} className="text-emerald-600" />
                </motion.div>
                <h3 className="text-xl font-bold text-primary mb-3">{getContent('home', 'get_involved_membership_title', 'Become a Member')}</h3>
                <p className="text-muted text-sm">{getContent('home', 'get_involved_membership_desc', 'Join our growing community')}</p>
                <div className="mt-4 inline-flex items-center gap-2 text-emerald-600 font-semibold group-hover:gap-3 transition-all">
                  {language === 'ar' ? 'ابدأ الآن' : 'Apply Now'}
                  <ArrowRight size={16} />
                </div>
              </button>
            </motion.div>

            <motion.div variants={staggerItem} whileHover={{ y: -10, scale: 1.03 }}>
              <button
                onClick={() => setShowVolunteerModal(true)}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all text-center group block border-2 border-transparent hover:border-rose-500 h-full w-full"
              >
                <motion.div
                  className="w-16 h-16 bg-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-6"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <HandHeart size={28} className="text-rose-600" />
                </motion.div>
                <h3 className="text-xl font-bold text-primary mb-3">{getContent('home', 'get_involved_volunteer_title', 'Volunteer')}</h3>
                <p className="text-muted text-sm">{getContent('home', 'get_involved_volunteer_desc', 'Make a difference')}</p>
                <div className="mt-4 inline-flex items-center gap-2 text-rose-600 font-semibold group-hover:gap-3 transition-all">
                  {language === 'ar' ? 'ابدأ الآن' : 'Apply Now'}
                  <ArrowRight size={16} />
                </div>
              </button>
            </motion.div>

            <motion.div variants={staggerItem} whileHover={{ y: -10, scale: 1.03 }}>
              <button
                onClick={() => setShowDonationModal(true)}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all text-center group block border-2 border-transparent hover:border-amber-500 h-full w-full"
              >
                <motion.div
                  className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-6"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <Heart size={28} className="text-amber-600" />
                </motion.div>
                <h3 className="text-xl font-bold text-primary mb-3">{getContent('home', 'get_involved_donate_title', 'Donate')}</h3>
                <p className="text-muted text-sm">{getContent('home', 'get_involved_donate_desc', 'Support our work')}</p>
                <div className="mt-4 inline-flex items-center gap-2 text-amber-600 font-semibold group-hover:gap-3 transition-all">
                  {language === 'ar' ? 'تبرع الآن' : 'Donate Now'}
                  <ArrowRight size={16} />
                </div>
              </button>
            </motion.div>

            <motion.div variants={staggerItem} whileHover={{ y: -10, scale: 1.03 }}>
              <button
                onClick={() => setShowPartnershipModal(true)}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all text-center group block border-2 border-transparent hover:border-blue-500 h-full w-full"
              >
                <motion.div
                  className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <Building size={28} className="text-blue-600" />
                </motion.div>
                <h3 className="text-xl font-bold text-primary mb-3">{getContent('home', 'get_involved_partner_title', 'Partner With Us')}</h3>
                <p className="text-muted text-sm">{getContent('home', 'get_involved_partner_desc', 'Collaborate for impact')}</p>
                <div className="mt-4 inline-flex items-center gap-2 text-blue-600 font-semibold group-hover:gap-3 transition-all">
                  {language === 'ar' ? 'ابدأ الآن' : 'Apply Now'}
                  <ArrowRight size={16} />
                </div>
              </button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <BeltDivider />

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-[#1b2b45] via-[#1e3a5c] to-[#0f2439] text-white">
        <motion.div
          className="container mx-auto px-4 sm:px-6 lg:px-8 text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          <motion.h2
            className="text-3xl md:text-4xl font-bold mb-6"
            variants={fadeInUp}
          >
            {getContent('home', 'cta_title', 'Need Help or Have Questions?')}
          </motion.h2>
          <motion.p
            className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto"
            variants={fadeInUp}
          >
            {getContent('home', 'cta_description', 'Our bilingual team is here to assist you. Contact us today for confidential advice and support.')}
          </motion.p>
          <motion.div
            variants={scaleIn}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-accent to-amber-500 text-primary px-10 py-4 rounded-xl hover:from-amber-500 hover:to-accent transition-all font-semibold text-lg shadow-lg"
            >
              {getContent('home', 'cta_button', 'Contact Us Today')}
              <ArrowRight size={20} />
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Modals */}
      <MembershipApplicationModal isOpen={showMembershipModal} onClose={() => setShowMembershipModal(false)} />
      <VolunteerApplicationModal isOpen={showVolunteerModal} onClose={() => setShowVolunteerModal(false)} />
      <DonationModal isOpen={showDonationModal} onClose={() => setShowDonationModal(false)} />
      <PartnershipModal isOpen={showPartnershipModal} onClose={() => setShowPartnershipModal(false)} />
    </div>
  );
}
