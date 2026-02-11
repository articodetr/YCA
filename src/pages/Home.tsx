import { Link } from 'react-router-dom';
import { Trophy, Users, Building, GraduationCap, Heart, Calendar, FileText, HandHeart, ArrowRight, MapPin, Clock, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { fadeInUp, fadeInLeft, fadeInRight, staggerContainer, staggerItem, scaleIn } from '../lib/animations';
import CounterStat from '../components/CounterStat';
import { supabase } from '../lib/supabase';
import { useContent } from '../contexts/ContentContext';
import { useSiteSettings } from '../contexts/SiteSettingsContext';
import { useLanguage } from '../contexts/LanguageContext';

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

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

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
      image: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1920',
      title: 'Empowering the Yemeni Community',
      subtitle: 'in Birmingham'
    }
  ]);

  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>('All Months');
  const [selectedCategory, setSelectedCategory] = useState<string>('All Categories');
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  useEffect(() => {
    fetchStats();
    fetchHeroSlides();
    fetchUpcomingEvents();
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

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const categories = Array.from(new Set(upcomingEvents.map(e => e.category)));

  const filteredEvents = upcomingEvents.filter(event => {
    const eventMonth = MONTHS[new Date(event.date).getMonth()];
    const monthMatch = selectedMonth === 'All Months' || eventMonth === selectedMonth;
    const categoryMatch = selectedCategory === 'All Categories' || event.category === selectedCategory;
    return monthMatch && categoryMatch;
  });

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Community': 'bg-emerald-500',
      'Education': 'bg-blue-500',
      'Health': 'bg-rose-500',
      'Youth': 'bg-amber-500',
      'Cultural': 'bg-teal-500',
      'Sports': 'bg-green-600',
      'Academic': 'bg-blue-600',
    };
    return colors[category] || 'bg-gray-500';
  };

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Hero Section */}
      <section className="relative h-screen text-white overflow-hidden bg-[#0a1628]">
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
              <div className="absolute inset-0 bg-gradient-to-br from-[#0a1628]/90 via-[#0a1628]/70 to-transparent"></div>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="container mx-auto px-4 h-full flex items-center justify-center relative z-10">
          <motion.div
            className="max-w-3xl mx-auto text-center pt-20"
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

      {/* Welcome Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
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
                src={getPageImage('home', 'welcome_section', 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800')}
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

      {/* Upcoming Events Section - New Design */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.h2 className="text-4xl sm:text-5xl font-bold text-primary mb-4" variants={fadeInUp}>
              Events
            </motion.h2>
            <motion.div
              className="w-32 h-1 bg-gradient-to-r from-transparent via-[#8B4513] to-transparent mx-auto mb-6"
              variants={scaleIn}
            ></motion.div>
            <motion.p className="text-lg text-gray-600 max-w-3xl mx-auto" variants={fadeInUp}>
              Necessitatibus eius consequatur ex aliquid fuga eum quidem sint consectetur velit
            </motion.p>
          </motion.div>

          {/* Filters */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12 max-w-2xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            {/* Month Dropdown */}
            <div className="relative flex-1">
              <button
                onClick={() => {
                  setShowMonthDropdown(!showMonthDropdown);
                  setShowCategoryDropdown(false);
                }}
                className="w-full px-6 py-4 bg-white border-2 border-[#8B4513] rounded-xl text-left flex items-center justify-between hover:border-[#6B3410] transition-colors shadow-sm"
              >
                <span className="text-gray-700 font-medium">{selectedMonth}</span>
                <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${showMonthDropdown ? 'rotate-180' : ''}`} />
              </button>
              {showMonthDropdown && (
                <div className="absolute z-10 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-xl max-h-64 overflow-y-auto">
                  <button
                    onClick={() => {
                      setSelectedMonth('All Months');
                      setShowMonthDropdown(false);
                    }}
                    className="w-full px-6 py-3 text-left hover:bg-gray-100 transition-colors"
                  >
                    All Months
                  </button>
                  {MONTHS.map((month) => (
                    <button
                      key={month}
                      onClick={() => {
                        setSelectedMonth(month);
                        setShowMonthDropdown(false);
                      }}
                      className="w-full px-6 py-3 text-left hover:bg-gray-100 transition-colors"
                    >
                      {month}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Category Dropdown */}
            <div className="relative flex-1">
              <button
                onClick={() => {
                  setShowCategoryDropdown(!showCategoryDropdown);
                  setShowMonthDropdown(false);
                }}
                className="w-full px-6 py-4 bg-white border-2 border-gray-300 rounded-xl text-left flex items-center justify-between hover:border-gray-400 transition-colors shadow-sm"
              >
                <span className="text-gray-700 font-medium">{selectedCategory}</span>
                <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${showCategoryDropdown ? 'rotate-180' : ''}`} />
              </button>
              {showCategoryDropdown && (
                <div className="absolute z-10 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-xl max-h-64 overflow-y-auto">
                  <button
                    onClick={() => {
                      setSelectedCategory('All Categories');
                      setShowCategoryDropdown(false);
                    }}
                    className="w-full px-6 py-3 text-left hover:bg-gray-100 transition-colors"
                  >
                    All Categories
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => {
                        setSelectedCategory(category);
                        setShowCategoryDropdown(false);
                      }}
                      className="w-full px-6 py-3 text-left hover:bg-gray-100 transition-colors"
                    >
                      {category}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* Events Grid */}
          <motion.div
            className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {filteredEvents.map((event, idx) => {
              const eventDate = new Date(event.date);
              const month = MONTHS[eventDate.getMonth()].substring(0, 3).toUpperCase();
              const day = eventDate.getDate();
              const year = eventDate.getFullYear();

              return (
                <motion.div
                  key={event.id}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all overflow-hidden border-2 border-transparent hover:border-[#8B4513]"
                  variants={staggerItem}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1, duration: 0.4 }}
                  whileHover={{ y: -4, scale: 1.01 }}
                >
                  <div className="flex flex-col sm:flex-row gap-6 p-6">
                    {/* Date Box */}
                    <div className="flex-shrink-0">
                      <div className="w-28 h-28 bg-[#8B4513] text-white rounded-2xl flex flex-col items-center justify-center shadow-lg">
                        <div className="text-sm font-bold tracking-wider">{month}</div>
                        <div className="text-4xl font-bold">{day}</div>
                        <div className="text-sm">{year}</div>
                      </div>
                    </div>

                    {/* Event Details */}
                    <div className="flex-1">
                      {/* Category Badge */}
                      <span className={`inline-block ${getCategoryColor(event.category).replace('bg-', 'bg-').replace('500', '100').replace('600', '100')} px-4 py-1 rounded-full text-xs font-bold uppercase mb-3`}
                        style={{ color: event.category === 'Academic' ? '#2563eb' : event.category === 'Sports' ? '#16a34a' : '#059669' }}
                      >
                        {event.category}
                      </span>

                      {/* Title */}
                      <h3 className="text-xl font-bold text-primary mb-3 hover:text-[#8B4513] transition-colors">
                        {event.title}
                      </h3>

                      {/* Description */}
                      <p className="text-gray-600 text-sm mb-4 leading-relaxed line-clamp-2">
                        {event.description}
                      </p>

                      {/* Time and Location */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock size={16} className="text-[#8B4513]" />
                          <span>{event.time}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin size={16} className="text-[#8B4513]" />
                          <span className="line-clamp-1">{event.location}</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3">
                        <Link
                          to="/events"
                          className="flex-1 text-center bg-[#8B4513] text-white px-4 py-2 rounded-xl hover:bg-[#6B3410] transition-colors font-semibold text-sm shadow-md"
                        >
                          View Details
                        </Link>
                        <button className="px-4 py-2 border-2 border-gray-300 rounded-xl hover:border-[#8B4513] transition-colors text-gray-700 font-semibold text-sm">
                          Buy Ticket
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* View All Events Button */}
          <motion.div
            className="text-center mt-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <Link
              to="/events"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#8B4513] to-[#6B3410] text-white px-10 py-4 rounded-xl hover:from-[#6B3410] hover:to-[#5B2810] transition-all font-semibold text-lg shadow-lg"
            >
              <Calendar size={24} />
              View All Events
              <ArrowRight size={20} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Get Involved Section */}
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
              <Link to="/membership" className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all text-center group block border-2 border-transparent hover:border-emerald-500 h-full">
                <motion.div
                  className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <Users size={28} className="text-emerald-600" />
                </motion.div>
                <h3 className="text-xl font-bold text-primary mb-3">{getContent('home', 'get_involved_membership_title', 'Become a Member')}</h3>
                <p className="text-muted text-sm">{getContent('home', 'get_involved_membership_desc', 'Join our growing community')}</p>
              </Link>
            </motion.div>

            <motion.div variants={staggerItem} whileHover={{ y: -10, scale: 1.03 }}>
              <Link to="/get-involved/volunteer" className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all text-center group block border-2 border-transparent hover:border-rose-500 h-full">
                <motion.div
                  className="w-16 h-16 bg-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-6"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <HandHeart size={28} className="text-rose-600" />
                </motion.div>
                <h3 className="text-xl font-bold text-primary mb-3">{getContent('home', 'get_involved_volunteer_title', 'Volunteer')}</h3>
                <p className="text-muted text-sm">{getContent('home', 'get_involved_volunteer_desc', 'Make a difference')}</p>
              </Link>
            </motion.div>

            <motion.div variants={staggerItem} whileHover={{ y: -10, scale: 1.03 }}>
              <Link to="/get-involved/donate" className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all text-center group block border-2 border-transparent hover:border-amber-500 h-full">
                <motion.div
                  className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-6"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <Heart size={28} className="text-amber-600" />
                </motion.div>
                <h3 className="text-xl font-bold text-primary mb-3">{getContent('home', 'get_involved_donate_title', 'Donate')}</h3>
                <p className="text-muted text-sm">{getContent('home', 'get_involved_donate_desc', 'Support our work')}</p>
              </Link>
            </motion.div>

            <motion.div variants={staggerItem} whileHover={{ y: -10, scale: 1.03 }}>
              <Link to="/get-involved/partnerships" className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all text-center group block border-2 border-transparent hover:border-blue-500 h-full">
                <motion.div
                  className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <Building size={28} className="text-blue-600" />
                </motion.div>
                <h3 className="text-xl font-bold text-primary mb-3">{getContent('home', 'get_involved_partner_title', 'Partner With Us')}</h3>
                <p className="text-muted text-sm">{getContent('home', 'get_involved_partner_desc', 'Collaborate for impact')}</p>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

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
    </div>
  );
}
