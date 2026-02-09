import { Link } from 'react-router-dom';
import { Facebook, Instagram, Mail, Phone, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '../lib/animations';
import { useContent } from '../contexts/ContentContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useSiteSettings } from '../contexts/SiteSettingsContext';

export default function Footer() {
  const { getContent } = useContent();
  const { t, language, isRTL } = useLanguage();
  const { getSetting } = useSiteSettings();

  const logoText = getSetting('site_logo_text', '/logo_text.png');
  const orgName = language === 'ar'
    ? getSetting('org_name_ar', 'جمعية الجالية اليمنية')
    : getSetting('org_name_en', 'Yemeni Community Association');
  const charityNumber = getSetting('charity_number', '1057470');

  const facebookUrl = getSetting('social_facebook', '#');
  const instagramUrl = getSetting('social_instagram', '#');
  const tiktokUrl = getSetting('social_tiktok', '#');

  return (
    <footer className="bg-primary text-white">
      <div className="container mx-auto px-4 py-16">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.div variants={staggerItem}>
            <div className="mb-5">
              <img src={logoText} alt={orgName} className="h-9 w-auto max-w-fit" />
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              {getContent('footer', 'description', 'Empowering the Yemeni community in Birmingham through support, guidance, and cultural celebration.')}
            </p>
            <div className="flex gap-3">
              <a href={facebookUrl} target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center hover:bg-accent transition-colors" aria-label="Facebook">
                <Facebook size={16} />
              </a>
              <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center hover:bg-accent transition-colors" aria-label="Instagram">
                <Instagram size={16} />
              </a>
              <a href={tiktokUrl} target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center hover:bg-accent transition-colors" aria-label="TikTok">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86 4.46V13.2a8.16 8.16 0 005.58 2.17V11.9a4.85 4.85 0 01-3.77-1.45V6.69h3.77z"/></svg>
              </a>
            </div>
          </motion.div>

          <motion.div variants={staggerItem}>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-5">{t('footer.quickLinks')}</h3>
            <ul className="space-y-3">
              <li><Link to="/about/mission" className="text-sm text-gray-300 hover:text-white transition-colors">{t('nav.about.mission')}</Link></li>
              <li><Link to="/services" className="text-sm text-gray-300 hover:text-white transition-colors">{t('nav.services')}</Link></li>
              <li><Link to="/events" className="text-sm text-gray-300 hover:text-white transition-colors">{t('nav.events')}</Link></li>
              <li><Link to="/news" className="text-sm text-gray-300 hover:text-white transition-colors">{t('nav.news')}</Link></li>
              <li><Link to="/book" className="text-sm text-gray-300 hover:text-white transition-colors">{t('button.book')}</Link></li>
              <li><Link to="/book/track" className="text-sm text-gray-300 hover:text-white transition-colors">{language === 'ar' ? 'تتبع حجزك' : 'Track Your Booking'}</Link></li>
              <li><Link to="/get-involved/volunteer" className="text-sm text-gray-300 hover:text-white transition-colors">{t('nav.getInvolved.volunteer')}</Link></li>
              <li><Link to="/contact" className="text-sm text-gray-300 hover:text-white transition-colors">{t('nav.contact')}</Link></li>
            </ul>
          </motion.div>

          <motion.div variants={staggerItem}>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-5">{t('nav.programmes')}</h3>
            <ul className="space-y-3">
              <li><Link to="/programmes/women" className="text-sm text-gray-300 hover:text-white transition-colors">{t('nav.programmes.women')}</Link></li>
              <li><Link to="/programmes/elderly" className="text-sm text-gray-300 hover:text-white transition-colors">{t('nav.programmes.elderly')}</Link></li>
              <li><Link to="/programmes/youth" className="text-sm text-gray-300 hover:text-white transition-colors">{t('nav.programmes.youth')}</Link></li>
              <li><Link to="/programmes/children" className="text-sm text-gray-300 hover:text-white transition-colors">{t('nav.programmes.children')}</Link></li>
              <li><Link to="/programmes/men" className="text-sm text-gray-300 hover:text-white transition-colors">{t('nav.programmes.men')}</Link></li>
            </ul>
          </motion.div>

          <motion.div variants={staggerItem}>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-5">{getContent('footer', 'contact_info_title', 'Contact Info')}</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin size={16} className="text-accent flex-shrink-0 mt-1" />
                <span className="text-sm text-gray-300 leading-relaxed">
                  {getContent('footer', 'address_line1', 'YCA GreenCoat House')}<br />
                  {getContent('footer', 'address_line2', '261-271 Stratford Road')}<br />
                  {getContent('footer', 'address_line3', 'Birmingham, B11 1QS')}
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={16} className="text-accent flex-shrink-0" />
                <a href={`tel:${getContent('footer', 'phone', '01214395280').replace(/\s/g, '')}`} className="text-sm text-gray-300 hover:text-white transition-colors">
                  {getContent('footer', 'phone', '0121 439 5280')}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={16} className="text-accent flex-shrink-0" />
                <a href={`mailto:${getContent('footer', 'email', 'info@yca-birmingham.org.uk')}`} className="text-sm text-gray-300 hover:text-white transition-colors">
                  {getContent('footer', 'email', 'info@yca-birmingham.org.uk')}
                </a>
              </li>
            </ul>
          </motion.div>
        </motion.div>

        <div className="border-t border-white/10 mt-12 pt-8 text-center">
          <p className="text-sm text-gray-500">&copy; {new Date().getFullYear()} {getContent('footer', 'copyright', `${orgName} Birmingham. Charity Number: ${charityNumber}. All rights reserved.`)}</p>
        </div>
      </div>
    </footer>
  );
}
