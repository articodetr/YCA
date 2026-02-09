import { Link } from 'react-router-dom';
import { Trophy, Users, Building, GraduationCap, Heart, Calendar, FileText, HandHeart, ArrowRight, MapPin, Clock, Newspaper } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { fadeInUp, staggerContainer, staggerItem, scaleIn, fadeIn } from '../lib/animations';
import CounterStat from '../components/CounterStat';
import { supabase } from '../lib/supabase';
import { useContent } from '../contexts/ContentContext';
import { useSiteSettings } from '../contexts/SiteSettingsContext';
import { useLanguage } from '../contexts/LanguageContext';

interface EventItem {
  id: string;
  title: string;
  title_ar?: string;
  description: string;
  description_ar?: string;
  date: string;
  time: string;
  location: string;
  location_ar?: string;
  category: string;
  image_url: string | null;
}

interface NewsItem {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  published_at: string;
  image_url: string | null;
}

export default function Home() {
  const { getContent } = useContent();
  const { getSetting, getPageImage } = useSiteSettings();
  const { t, language } = useLanguage();
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
      image: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1920',
      title: 'Empowering the Yemeni Community',
      subtitle: 'in Birmingham'
    }
  ]);

  const [upcomingEvents, setUpcomingEvents] = useState<EventItem[]>([]);
  const [latestNews, setLatestNews] = useState<NewsItem[]>([]);

  useEffect(() => {
    fetchStats();
    fetchHeroSlides();
    fetchUpcomingEvents();
    fetchLatestNews();
  }, []);

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
        .select('title, subtitle, image_url')
        .eq('is_active', true)
        .order('order_number', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        setHeroSlides(data.map(slide => ({
          image: slide.image_url,
          title: slide.title,
          subtitle: slide.subtitle || ''
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
        .select('*')
        .order('published_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      setLatestNews(data || []);
    } catch (error) {
      console.error('Error fetching news:', error);
    }
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div>
      <section className="relative h-screen text-white overflow-hidden bg-[#0f1c2e]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
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
              <div className="absolute inset-0 bg-gradient-to-b from-[#0f1c2e]/80 via-[#0f1c2e]/60 to-[#0f1c2e]/90"></div>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="container mx-auto px-4 h-full flex items-center relative z-10">
          <div className="max-w-3xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ y: 24, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -24, opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <motion.h1
                  className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight mb-4"
                >
                  {heroSlides[currentSlide].title}
                </motion.h1>
                {heroSlides[currentSlide].subtitle && (
                  <h2 className="text-2xl md:text-3xl lg:text-4xl font-light text-teal-400 mb-6">
                    {heroSlides[currentSlide].subtitle}
                  </h2>
                )}
              </motion.div>
            </AnimatePresence>

            <motion.p
              className="text-base md:text-lg text-gray-300 leading-relaxed max-w-xl mb-10"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              {getContent('home', 'hero_subtitle', '')}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Link
                to="/services"
                className="inline-flex items-center gap-2 bg-teal-600 text-white px-8 py-4 rounded-xl hover:bg-teal-700 transition-colors font-semibold text-base"
              >
                {getContent('home', 'hero_button_services', 'Discover Our Services')}
                <ArrowRight size={18} />
              </Link>
            </motion.div>
          </div>
        </div>

        {heroSlides.length > 1 && (
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex items-center gap-3">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className="group relative"
              >
                <div className={`w-10 h-1 rounded-full transition-all duration-300 ${
                  currentSlide === index ? 'bg-teal-400' : 'bg-white/30'
                }`}>
                  {currentSlide === index && (
                    <motion.div
                      className="h-full bg-teal-400 rounded-full"
                      initial={{ width: '0%' }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 5, ease: 'linear' }}
                      key={`progress-${currentSlide}-${index}`}
                    />
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="py-16 bg-white border-b border-gray-100">
        <div className="container mx-auto px-4">
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <CounterStat
              icon={<Users size={28} className="text-teal-600" />}
              value={parseInt(getSetting('stat_members', '850')) || 850}
              suffix="+"
              label={getContent('home', 'stats_members_label', 'Active Members')}
              delay={0.1}
            />
            <CounterStat
              icon={<GraduationCap size={28} className="text-teal-600" />}
              value={parseInt(getSetting('stat_programmes', '5')) || 5}
              label={getContent('home', 'stats_programmes_label', 'Core Programmes')}
              delay={0.2}
            />
            <CounterStat
              icon={<Trophy size={28} className="text-teal-600" />}
              value={parseInt(getSetting('stat_years', '30')) || 30}
              suffix="+"
              label={getContent('home', 'stats_years_label', 'Years of Service')}
              delay={0.3}
            />
            <CounterStat
              icon={<Heart size={28} className="text-teal-600" />}
              value={parseInt(getSetting('stat_impact', '1000')) || 1000}
              suffix="+"
              label={getContent('home', 'stats_impact_label', 'Lives Impacted')}
              delay={0.4}
            />
          </motion.div>
        </div>
      </section>

      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.p className="text-sm font-semibold uppercase tracking-widest text-teal-600 mb-3" variants={fadeInUp}>
              {t('home.welcomeToYCA')}
            </motion.p>
            <motion.h2 className="text-3xl md:text-4xl font-bold text-[#0f1c2e] mb-4" variants={fadeInUp}>
              {getContent('home', 'welcome_title', 'Welcome to YCA Birmingham')}
            </motion.h2>
            <motion.p className="text-base text-[#64748b] max-w-2xl mx-auto leading-relaxed" variants={fadeInUp}>
              {getContent('home', 'welcome_description', 'We are dedicated to raising the profile of the Yemeni community as a vibrant, cohesive community contributing positively to the social, economic, and cultural life of Birmingham.')}
            </motion.p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
            >
              <img
                src={getPageImage('home', 'welcome_section', 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800')}
                alt="Community gathering"
                className="rounded-xl shadow-sm w-full h-[400px] object-cover"
              />
            </motion.div>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
            >
              <h3 className="text-2xl md:text-3xl font-bold text-[#0f1c2e] mb-6">
                {getContent('home', 'mission_title', 'Our Mission & Vision')}
              </h3>
              <p className="text-[#64748b] mb-4 leading-relaxed">
                {getContent('home', 'mission_paragraph1', "In all our activities and services, YCA Birmingham is focused on the community, brings the community together, preserves the identity of the Yemeni Community, and encourages mutual respect.")}
              </p>
              <p className="text-[#64748b] mb-8 leading-relaxed">
                {getContent('home', 'mission_paragraph2', "We provide community services such as advice, information, advocacy, and related services for the local community, with a special focus on individuals who don't speak English and need Arabic-speaking advisors.")}
              </p>
              <Link
                to="/about/mission"
                className="inline-flex items-center gap-2 bg-[#0f1c2e] text-white px-6 py-3 rounded-xl hover:bg-[#1a2d47] transition-colors font-medium text-sm"
              >
                {getContent('home', 'mission_button', 'Learn More About Us')}
                <ArrowRight size={16} />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.p className="text-sm font-semibold uppercase tracking-widest text-teal-600 mb-3" variants={fadeInUp}>
              {t('home.ourServices')}
            </motion.p>
            <motion.h2 className="text-3xl md:text-4xl font-bold text-[#0f1c2e] mb-4" variants={fadeInUp}>
              {getContent('home', 'services_section_title', 'Our Services')}
            </motion.h2>
            <motion.p className="text-base text-[#64748b] max-w-2xl mx-auto leading-relaxed" variants={fadeInUp}>
              {getContent('home', 'services_section_description', 'Comprehensive support and guidance for the Yemeni community in Birmingham')}
            </motion.p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div
              className="bg-gray-50 p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow"
              variants={staggerItem}
            >
              <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center mb-6">
                <FileText size={24} className="text-teal-600" />
              </div>
              <h3 className="text-xl font-bold text-[#0f1c2e] mb-3">
                {getContent('home', 'service_advice_title', 'Advice & Guidance')}
              </h3>
              <p className="text-[#64748b] text-sm leading-relaxed mb-6">
                {getContent('home', 'service_advice_description', 'One-to-one confidential support with welfare benefits, housing, immigration, and essential life services in both English and Arabic.')}
              </p>
              <Link to="/services" className="inline-flex items-center gap-1 text-teal-600 font-medium text-sm hover:gap-2 transition-all">
                {t('button.learnMore')} <ArrowRight size={14} />
              </Link>
            </motion.div>

            <motion.div
              className="bg-gray-50 p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow"
              variants={staggerItem}
            >
              <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center mb-6">
                <Users size={24} className="text-teal-600" />
              </div>
              <h3 className="text-xl font-bold text-[#0f1c2e] mb-3">
                {getContent('home', 'service_programmes_title', 'Community Programmes')}
              </h3>
              <p className="text-[#64748b] text-sm leading-relaxed mb-6">
                {getContent('home', 'service_programmes_description', 'Dedicated programmes for women, elderly, youth, children, and men focusing on social bonds, wellbeing, and cultural heritage.')}
              </p>
              <Link to="/programmes/women" className="inline-flex items-center gap-1 text-teal-600 font-medium text-sm hover:gap-2 transition-all">
                {t('button.learnMore')} <ArrowRight size={14} />
              </Link>
            </motion.div>

            <motion.div
              className="bg-gray-50 p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow"
              variants={staggerItem}
            >
              <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center mb-6">
                <Building size={24} className="text-teal-600" />
              </div>
              <h3 className="text-xl font-bold text-[#0f1c2e] mb-3">
                {getContent('home', 'service_hub_title', 'Community Hub')}
              </h3>
              <p className="text-[#64748b] text-sm leading-relaxed mb-6">
                {getContent('home', 'service_hub_description', 'A welcoming space for social gatherings, cultural celebrations, and community events that bring our community together.')}
              </p>
              <Link to="/events" className="inline-flex items-center gap-1 text-teal-600 font-medium text-sm hover:gap-2 transition-all">
                {t('button.learnMore')} <ArrowRight size={14} />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            className="flex flex-col md:flex-row md:items-end md:justify-between mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <div>
              <motion.p className="text-sm font-semibold uppercase tracking-widest text-teal-600 mb-3" variants={fadeInUp}>
                {t('home.upcomingEvents')}
              </motion.p>
              <motion.h2 className="text-3xl md:text-4xl font-bold text-[#0f1c2e] mb-2" variants={fadeInUp}>
                {getContent('home', 'events_title', 'Upcoming Events')}
              </motion.h2>
              <motion.p className="text-[#64748b] max-w-lg" variants={fadeInUp}>
                {getContent('home', 'events_description', "Join us for cultural celebrations, community gatherings, and special programmes throughout the year.")}
              </motion.p>
            </div>
            <motion.div variants={fadeInUp} className="mt-6 md:mt-0">
              <Link
                to="/events"
                className="inline-flex items-center gap-2 text-teal-600 font-medium hover:gap-3 transition-all"
              >
                {getContent('home', 'events_button', 'View All Events')} <ArrowRight size={16} />
              </Link>
            </motion.div>
          </motion.div>

          <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory md:grid md:grid-cols-4 md:overflow-visible md:pb-0">
            {upcomingEvents.length > 0 ? upcomingEvents.map((event, index) => (
              <motion.div
                key={event.id}
                className="min-w-[280px] md:min-w-0 snap-start bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
                transition={{ delay: index * 0.1 }}
              >
                <div className="h-44 bg-gray-100 relative overflow-hidden">
                  {event.image_url ? (
                    <img
                      src={event.image_url}
                      alt={language === 'ar' && event.title_ar ? event.title_ar : event.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-teal-50 to-gray-100">
                      <Calendar size={32} className="text-teal-300" />
                    </div>
                  )}
                  <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-[#0f1c2e] text-xs font-medium px-3 py-1 rounded-full">
                    {event.category}
                  </span>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="text-base font-semibold text-[#0f1c2e] mb-3 line-clamp-2">
                    {language === 'ar' && event.title_ar ? event.title_ar : event.title}
                  </h3>
                  <div className="mt-auto space-y-2 text-xs text-[#64748b]">
                    <div className="flex items-center gap-2">
                      <Calendar size={13} className="text-teal-500 flex-shrink-0" />
                      <span>{formatDate(event.date)}</span>
                    </div>
                    {event.time && (
                      <div className="flex items-center gap-2">
                        <Clock size={13} className="text-teal-500 flex-shrink-0" />
                        <span>{event.time}</span>
                      </div>
                    )}
                    {event.location && (
                      <div className="flex items-center gap-2">
                        <MapPin size={13} className="text-teal-500 flex-shrink-0" />
                        <span className="truncate">{language === 'ar' && event.location_ar ? event.location_ar : event.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )) : (
              <motion.div
                className="col-span-4 text-center py-16"
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <Calendar size={40} className="mx-auto text-gray-300 mb-4" />
                <p className="text-[#64748b]">
                  {getContent('home', 'events_empty', 'New events coming soon. Stay tuned!')}
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            className="flex flex-col md:flex-row md:items-end md:justify-between mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <div>
              <motion.p className="text-sm font-semibold uppercase tracking-widest text-teal-600 mb-3" variants={fadeInUp}>
                {t('home.latestNews')}
              </motion.p>
              <motion.h2 className="text-3xl md:text-4xl font-bold text-[#0f1c2e] mb-2" variants={fadeInUp}>
                {getContent('home', 'news_title', 'Latest News')}
              </motion.h2>
              <motion.p className="text-[#64748b] max-w-lg" variants={fadeInUp}>
                {getContent('home', 'news_description', 'Stay updated with the latest from our community.')}
              </motion.p>
            </div>
            <motion.div variants={fadeInUp} className="mt-6 md:mt-0">
              <Link
                to="/news"
                className="inline-flex items-center gap-2 text-teal-600 font-medium hover:gap-3 transition-all"
              >
                {t('button.viewAll')} <ArrowRight size={16} />
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {latestNews.length > 0 ? latestNews.map((article) => (
              <motion.div
                key={article.id}
                className="bg-gray-50 rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden group"
                variants={staggerItem}
              >
                <div className="h-48 bg-gray-100 overflow-hidden">
                  {article.image_url ? (
                    <img
                      src={article.image_url}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-teal-50 to-gray-100">
                      <Newspaper size={32} className="text-teal-300" />
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xs font-medium text-teal-600 bg-teal-50 px-2 py-1 rounded-md">
                      {article.category}
                    </span>
                    <span className="text-xs text-[#64748b]">{formatDate(article.published_at)}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-[#0f1c2e] mb-2 line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-sm text-[#64748b] line-clamp-2 mb-4">
                    {article.excerpt}
                  </p>
                  <Link
                    to={`/news/${article.id}`}
                    className="inline-flex items-center gap-1 text-teal-600 font-medium text-sm hover:gap-2 transition-all"
                  >
                    {t('button.readMore')} <ArrowRight size={14} />
                  </Link>
                </div>
              </motion.div>
            )) : (
              <motion.div
                className="col-span-3 text-center py-16"
                variants={fadeInUp}
              >
                <Newspaper size={40} className="mx-auto text-gray-300 mb-4" />
                <p className="text-[#64748b]">
                  {getContent('home', 'news_empty', 'Check back soon for the latest updates.')}
                </p>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.p className="text-sm font-semibold uppercase tracking-widest text-teal-600 mb-3" variants={fadeInUp}>
              {t('home.getInvolved')}
            </motion.p>
            <motion.h2 className="text-3xl md:text-4xl font-bold text-[#0f1c2e] mb-4" variants={fadeInUp}>
              {getContent('home', 'get_involved_title', 'Get Involved')}
            </motion.h2>
            <motion.p className="text-base text-[#64748b] max-w-2xl mx-auto" variants={fadeInUp}>
              {getContent('home', 'get_involved_description', 'There are many ways you can support and contribute to our community')}
            </motion.p>
          </motion.div>

          <motion.div
            className="grid sm:grid-cols-2 md:grid-cols-4 gap-6"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div variants={staggerItem}>
              <Link to="/membership" className="block bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow text-center">
                <div className="w-14 h-14 bg-teal-50 rounded-xl flex items-center justify-center mx-auto mb-5">
                  <Users size={24} className="text-teal-600" />
                </div>
                <h3 className="text-lg font-semibold text-[#0f1c2e] mb-2">
                  {getContent('home', 'get_involved_membership_title', 'Become a Member')}
                </h3>
                <p className="text-sm text-[#64748b]">
                  {getContent('home', 'get_involved_membership_desc', 'Join our growing community')}
                </p>
              </Link>
            </motion.div>

            <motion.div variants={staggerItem}>
              <Link to="/get-involved/volunteer" className="block bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow text-center">
                <div className="w-14 h-14 bg-teal-50 rounded-xl flex items-center justify-center mx-auto mb-5">
                  <HandHeart size={24} className="text-teal-600" />
                </div>
                <h3 className="text-lg font-semibold text-[#0f1c2e] mb-2">
                  {getContent('home', 'get_involved_volunteer_title', 'Volunteer')}
                </h3>
                <p className="text-sm text-[#64748b]">
                  {getContent('home', 'get_involved_volunteer_desc', 'Make a difference')}
                </p>
              </Link>
            </motion.div>

            <motion.div variants={staggerItem}>
              <Link to="/get-involved/donate" className="block bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow text-center">
                <div className="w-14 h-14 bg-teal-50 rounded-xl flex items-center justify-center mx-auto mb-5">
                  <Heart size={24} className="text-teal-600" />
                </div>
                <h3 className="text-lg font-semibold text-[#0f1c2e] mb-2">
                  {getContent('home', 'get_involved_donate_title', 'Donate')}
                </h3>
                <p className="text-sm text-[#64748b]">
                  {getContent('home', 'get_involved_donate_desc', 'Support our work')}
                </p>
              </Link>
            </motion.div>

            <motion.div variants={staggerItem}>
              <Link to="/get-involved/partnerships" className="block bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow text-center">
                <div className="w-14 h-14 bg-teal-50 rounded-xl flex items-center justify-center mx-auto mb-5">
                  <Building size={24} className="text-teal-600" />
                </div>
                <h3 className="text-lg font-semibold text-[#0f1c2e] mb-2">
                  {getContent('home', 'get_involved_partner_title', 'Partner With Us')}
                </h3>
                <p className="text-sm text-[#64748b]">
                  {getContent('home', 'get_involved_partner_desc', 'Collaborate for impact')}
                </p>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="py-24 bg-[#0f1c2e]">
        <motion.div
          className="container mx-auto px-4 text-center max-w-2xl"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-white mb-6"
            variants={fadeInUp}
          >
            {getContent('home', 'cta_title', 'Need Help or Have Questions?')}
          </motion.h2>
          <motion.p
            className="text-gray-400 mb-10 leading-relaxed"
            variants={fadeInUp}
          >
            {getContent('home', 'cta_description', 'Our bilingual team is here to assist you. Contact us today for confidential advice and support.')}
          </motion.p>
          <motion.div variants={fadeInUp}>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 bg-teal-600 text-white px-8 py-4 rounded-xl hover:bg-teal-700 transition-colors font-semibold text-base"
            >
              {getContent('home', 'cta_button', 'Contact Us Today')}
              <ArrowRight size={18} />
            </Link>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
}
