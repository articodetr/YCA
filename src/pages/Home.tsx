import { Link } from 'react-router-dom';
import { Trophy, Users, Building, GraduationCap, Heart, Calendar, FileText, HandHeart, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { fadeInUp, fadeInLeft, fadeInRight, staggerContainer, staggerItem, scaleIn } from '../lib/animations';
import { useScrollReveal } from '../hooks/useScrollReveal';
import CounterStat from '../components/CounterStat';
import { supabase } from '../lib/supabase';
import { useContent } from '../contexts/ContentContext';

export default function Home() {
  const { getContent } = useContent();
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

  useEffect(() => {
    fetchStats();
    fetchHeroSlides();
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

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  return (
    <div>
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

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <CounterStat
              icon={<Users size={32} className="text-primary" />}
              value={850}
              suffix="+"
              label={getContent('home', 'stats_members_label', 'Active Members')}
              delay={0.1}
            />
            <CounterStat
              icon={<GraduationCap size={32} className="text-primary" />}
              value={5}
              label={getContent('home', 'stats_programmes_label', 'Core Programmes')}
              delay={0.2}
            />
            <CounterStat
              icon={<Trophy size={32} className="text-primary" />}
              value={30}
              suffix="+"
              label={getContent('home', 'stats_years_label', 'Years of Service')}
              delay={0.3}
            />
            <CounterStat
              icon={<Heart size={32} className="text-primary" />}
              value={1000}
              suffix="+"
              label={getContent('home', 'stats_impact_label', 'Lives Impacted')}
              delay={0.4}
            />
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-sand">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.h2 className="text-4xl font-bold text-primary mb-4" variants={fadeInUp}>
              {getContent('home', 'welcome_title', 'Welcome to YCA Birmingham')}
            </motion.h2>
            <motion.div className="w-24 h-1 bg-accent mx-auto mb-6" variants={scaleIn}></motion.div>
            <motion.p className="text-lg text-muted max-w-3xl mx-auto" variants={fadeInUp}>
              {getContent('home', 'welcome_description', 'We are dedicated to raising the profile of the Yemeni community as a vibrant, cohesive community contributing positively to the social, economic, and cultural life of Birmingham.')}
            </motion.p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInLeft}
            >
              <motion.img
                src="https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Community gathering"
                className="rounded-lg shadow-xl"
                whileHover={{ scale: 1.05 }}
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
                  className="inline-block bg-primary text-white px-6 py-3 rounded-lg hover:bg-secondary transition-colors font-semibold"
                >
                  {getContent('home', 'mission_button', 'Learn More About Us')}
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.h2 className="text-4xl font-bold text-primary mb-4" variants={fadeInUp}>
              {getContent('home', 'services_section_title', 'Our Services')}
            </motion.h2>
            <motion.div className="w-24 h-1 bg-accent mx-auto mb-6" variants={scaleIn}></motion.div>
            <motion.p className="text-lg text-muted max-w-3xl mx-auto" variants={fadeInUp}>
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
              className="bg-sand p-8 rounded-lg hover:shadow-xl transition-all group"
              variants={staggerItem}
              whileHover={{ y: -10 }}
            >
              <motion.div
                className="w-16 h-16 bg-accent rounded-lg flex items-center justify-center mb-6"
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.5 }}
              >
                <FileText size={32} className="text-primary" />
              </motion.div>
              <h3 className="text-2xl font-bold text-primary mb-4">{getContent('home', 'service_advice_title', 'Advice & Guidance')}</h3>
              <p className="text-muted mb-6 leading-relaxed">
                {getContent('home', 'service_advice_description', 'One-to-one confidential support with welfare benefits, housing, immigration, and essential life services in both English and Arabic.')}
              </p>
              <Link to="/services" className="text-primary font-semibold hover:text-accent transition-colors">
                Learn More →
              </Link>
            </motion.div>

            <motion.div
              className="bg-sand p-8 rounded-lg hover:shadow-xl transition-all group"
              variants={staggerItem}
              whileHover={{ y: -10 }}
            >
              <motion.div
                className="w-16 h-16 bg-accent rounded-lg flex items-center justify-center mb-6"
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.5 }}
              >
                <Users size={32} className="text-primary" />
              </motion.div>
              <h3 className="text-2xl font-bold text-primary mb-4">{getContent('home', 'service_programmes_title', 'Community Programmes')}</h3>
              <p className="text-muted mb-6 leading-relaxed">
                {getContent('home', 'service_programmes_description', 'Dedicated programmes for women, elderly, youth, children, and men focusing on social bonds, wellbeing, and cultural heritage.')}
              </p>
              <Link to="/programmes/women" className="text-primary font-semibold hover:text-accent transition-colors">
                Explore Programmes →
              </Link>
            </motion.div>

            <motion.div
              className="bg-sand p-8 rounded-lg hover:shadow-xl transition-all group"
              variants={staggerItem}
              whileHover={{ y: -10 }}
            >
              <motion.div
                className="w-16 h-16 bg-accent rounded-lg flex items-center justify-center mb-6"
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.5 }}
              >
                <Building size={32} className="text-primary" />
              </motion.div>
              <h3 className="text-2xl font-bold text-primary mb-4">{getContent('home', 'service_hub_title', 'Community Hub')}</h3>
              <p className="text-muted mb-6 leading-relaxed">
                {getContent('home', 'service_hub_description', 'A welcoming space for social gatherings, cultural celebrations, and community events that bring our community together.')}
              </p>
              <Link to="/events" className="text-primary font-semibold hover:text-accent transition-colors">
                View Events →
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-primary text-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInLeft}
            >
              <h2 className="text-4xl font-bold mb-6">{getContent('home', 'events_title', 'Upcoming Events')}</h2>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                {getContent('home', 'events_description', "Join us for cultural celebrations, community gatherings, and special programmes throughout the year. From National Day celebrations to youth sports activities, there's something for everyone.")}
              </p>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/events"
                  className="inline-flex items-center gap-2 bg-accent text-primary px-8 py-4 rounded-lg hover:bg-hover transition-colors font-semibold text-lg"
                >
                  <Calendar size={24} />
                  {getContent('home', 'events_button', 'View All Events')}
                </Link>
              </motion.div>
            </motion.div>
            <motion.div
              className="grid grid-cols-2 gap-4"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
            >
              <motion.img
                src="https://images.pexels.com/photos/3184430/pexels-photo-3184430.jpeg?auto=compress&cs=tinysrgb&w=400"
                alt="Community event"
                className="rounded-lg shadow-lg"
                variants={staggerItem}
                whileHover={{ scale: 1.05, rotate: 2 }}
              />
              <motion.img
                src="https://images.pexels.com/photos/3184632/pexels-photo-3184632.jpeg?auto=compress&cs=tinysrgb&w=400"
                alt="Community gathering"
                className="rounded-lg shadow-lg mt-8"
                variants={staggerItem}
                whileHover={{ scale: 1.05, rotate: -2 }}
              />
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-sand">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.h2 className="text-4xl font-bold text-primary mb-4" variants={fadeInUp}>
              {getContent('home', 'get_involved_title', 'Get Involved')}
            </motion.h2>
            <motion.div className="w-24 h-1 bg-accent mx-auto mb-6" variants={scaleIn}></motion.div>
            <motion.p className="text-lg text-muted max-w-3xl mx-auto" variants={fadeInUp}>
              {getContent('home', 'get_involved_description', 'There are many ways you can support and contribute to our community')}
            </motion.p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-4 gap-6"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div variants={staggerItem} whileHover={{ y: -10, scale: 1.03 }}>
              <Link to="/get-involved/membership" className="bg-white p-6 rounded-lg hover:shadow-xl transition-all text-center group block">
                <motion.div
                  className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <Users size={28} className="text-primary" />
                </motion.div>
                <h3 className="text-xl font-bold text-primary mb-2">{getContent('home', 'get_involved_membership_title', 'Become a Member')}</h3>
                <p className="text-muted text-sm">{getContent('home', 'get_involved_membership_desc', 'Join our growing community')}</p>
              </Link>
            </motion.div>

            <motion.div variants={staggerItem} whileHover={{ y: -10, scale: 1.03 }}>
              <Link to="/get-involved/volunteer" className="bg-white p-6 rounded-lg hover:shadow-xl transition-all text-center group block">
                <motion.div
                  className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <HandHeart size={28} className="text-primary" />
                </motion.div>
                <h3 className="text-xl font-bold text-primary mb-2">{getContent('home', 'get_involved_volunteer_title', 'Volunteer')}</h3>
                <p className="text-muted text-sm">{getContent('home', 'get_involved_volunteer_desc', 'Make a difference')}</p>
              </Link>
            </motion.div>

            <motion.div variants={staggerItem} whileHover={{ y: -10, scale: 1.03 }}>
              <Link to="/get-involved/donate" className="bg-white p-6 rounded-lg hover:shadow-xl transition-all text-center group block">
                <motion.div
                  className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <Heart size={28} className="text-primary" />
                </motion.div>
                <h3 className="text-xl font-bold text-primary mb-2">{getContent('home', 'get_involved_donate_title', 'Donate')}</h3>
                <p className="text-muted text-sm">{getContent('home', 'get_involved_donate_desc', 'Support our work')}</p>
              </Link>
            </motion.div>

            <motion.div variants={staggerItem} whileHover={{ y: -10, scale: 1.03 }}>
              <Link to="/get-involved/partnerships" className="bg-white p-6 rounded-lg hover:shadow-xl transition-all text-center group block">
                <motion.div
                  className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <Building size={28} className="text-primary" />
                </motion.div>
                <h3 className="text-xl font-bold text-primary mb-2">{getContent('home', 'get_involved_partner_title', 'Partner With Us')}</h3>
                <p className="text-muted text-sm">{getContent('home', 'get_involved_partner_desc', 'Collaborate for impact')}</p>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="py-16 bg-accent">
        <motion.div
          className="container mx-auto px-4 text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-primary mb-6"
            variants={fadeInUp}
          >
            {getContent('home', 'cta_title', 'Need Help or Have Questions?')}
          </motion.h2>
          <motion.p
            className="text-lg text-secondary mb-8 max-w-2xl mx-auto"
            variants={fadeInUp}
          >
            {getContent('home', 'cta_description', 'Our bilingual team is here to assist you. Contact us today for confidential advice and support.')}
          </motion.p>
          <motion.div
            variants={scaleIn}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              to="/contact"
              className="inline-block bg-primary text-white px-8 py-4 rounded-lg hover:bg-secondary transition-colors font-semibold text-lg"
            >
              {getContent('home', 'cta_button', 'Contact Us Today')}
            </Link>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
}
