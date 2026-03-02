import { Link } from 'react-router-dom';
import { Facebook, Instagram, Mail, Phone, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer, staggerItem } from '../lib/animations';
import { useContent } from '../contexts/ContentContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useSiteSettings } from '../contexts/SiteSettingsContext';
import BeltDivider from './BeltDivider';

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
  const youtubeUrl = getSetting('social_youtube', '#');

  return (
    <>
    <BeltDivider />
    <footer className="bg-primary text-white relative overflow-hidden">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.div variants={staggerItem}>
            <div className="mb-4">
              <img
                src="/logo_white.png"
                alt={orgName}
                className="h-10 w-auto max-w-fit"
              />
            </div>
            <p className="text-accent font-semibold text-lg mb-2">
              {getContent('footer', 'welcome_message', language === 'ar' ? 'جمعية الجالية اليمنية ترحب بكم جميعاً' : 'YCA Welcomes You All')}
            </p>
            <p className="text-gray-300 mb-4">
              {getContent('footer', 'description', 'Empowering the Yemeni community in Birmingham through support, guidance, and cultural celebration.')}
            </p>
            <p className="text-gray-400 text-sm mb-3">
              {getContent('footer', 'social_cta', language === 'ar' ? 'تابعونا على وسائل التواصل الاجتماعي للبقاء على اطلاع' : 'Follow us on social media to stay updated')}
            </p>
            <div className="flex gap-4">
              <motion.a
                href={facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center hover:bg-accent hover:text-primary transition-colors"
                whileHover={{ scale: 1.2, rotate: 360 }}
                transition={{ duration: 0.4 }}
                aria-label="Facebook"
              >
                <Facebook size={20} />
              </motion.a>
              <motion.a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center hover:bg-accent hover:text-primary transition-colors"
                whileHover={{ scale: 1.2, rotate: 360 }}
                transition={{ duration: 0.4 }}
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </motion.a>
              <motion.a
                href={tiktokUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center hover:bg-accent hover:text-primary transition-colors"
                whileHover={{ scale: 1.2, rotate: 360 }}
                transition={{ duration: 0.4 }}
                aria-label="TikTok"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86 4.46V13.2a8.16 8.16 0 005.58 2.17V11.9a4.85 4.85 0 01-3.77-1.45V6.69h3.77z"/></svg>
              </motion.a>
              <motion.a
                href={youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center hover:bg-accent hover:text-primary transition-colors"
                whileHover={{ scale: 1.2, rotate: 360 }}
                transition={{ duration: 0.4 }}
                aria-label="YouTube"
              >
                {/* Inline SVG to avoid icon pack/version differences */}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M23.498 6.186a2.985 2.985 0 0 0-2.099-2.112C19.553 3.5 12 3.5 12 3.5s-7.553 0-9.399.574A2.985 2.985 0 0 0 .502 6.186C0 8.055 0 12 0 12s0 3.945.502 5.814a2.985 2.985 0 0 0 2.099 2.112C4.447 20.5 12 20.5 12 20.5s7.553 0 9.399-.574a2.985 2.985 0 0 0 2.099-2.112C24 15.945 24 12 24 12s0-3.945-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </motion.a>
            </div>
          </motion.div>

          <motion.div variants={staggerItem}>
            <h3 className="text-xl font-bold mb-4 text-accent">{t('footer.quickLinks')}</h3>
            <ul className="space-y-2">
              <motion.li whileHover={{ x: isRTL ? -5 : 5 }}><Link to="/about/mission" className="text-gray-300 hover:text-accent transition-colors">{t('nav.about.mission')}</Link></motion.li>
              <motion.li whileHover={{ x: isRTL ? -5 : 5 }}><Link to="/services" className="text-gray-300 hover:text-accent transition-colors">{t('nav.services')}</Link></motion.li>
              <motion.li whileHover={{ x: isRTL ? -5 : 5 }}><Link to="/events" className="text-gray-300 hover:text-accent transition-colors">{t('nav.events')}</Link></motion.li>
              <motion.li whileHover={{ x: isRTL ? -5 : 5 }}><Link to="/news" className="text-gray-300 hover:text-accent transition-colors">{t('nav.news')}</Link></motion.li>
              <motion.li whileHover={{ x: isRTL ? -5 : 5 }}><Link to="/book" className="text-gray-300 hover:text-accent transition-colors">{t('button.book')}</Link></motion.li>
              <motion.li whileHover={{ x: isRTL ? -5 : 5 }}><Link to="/book/track" className="text-gray-300 hover:text-accent transition-colors">{language === 'ar' ? 'تتبع حجزك' : 'Track Your Booking'}</Link></motion.li>
              <motion.li whileHover={{ x: isRTL ? -5 : 5 }}><Link to="/get-involved/volunteer" className="text-gray-300 hover:text-accent transition-colors">{t('nav.getInvolved.volunteer')}</Link></motion.li>
              <motion.li whileHover={{ x: isRTL ? -5 : 5 }}><Link to="/contact" className="text-gray-300 hover:text-accent transition-colors">{t('nav.contact')}</Link></motion.li>
            </ul>
          </motion.div>

          <motion.div variants={staggerItem}>
            <h3 className="text-xl font-bold mb-4 text-accent">{t('nav.programmes')}</h3>
            <ul className="space-y-2">
              {[
                
                { en: "Women and Children’s Programme", ar: 'برنامج النساء والأطفال' },
                { en: "Elderly's Programme", ar: 'برنامج كبار السن' },
                { en: 'Youth Programme', ar: 'برنامج الشباب' },
                { en: "Children's Programme", ar: 'برنامج الأطفال' },
                { en: 'Education Programme', ar: 'برنامج التعليم' },
                { en: "Men's Programme", ar: 'برنامج الرجال' },
                { en: 'Activities and Sports Programme', ar: 'برنامج الأنشطة والرياضة' },
                { en: 'The Journey Within', ar: 'رحلة الذات' },
              ].map((p) => (
                <motion.li key={p.en} whileHover={{ x: isRTL ? -5 : 5 }}>
                  <Link to="/programmes" className="text-gray-300 hover:text-accent transition-colors">
                    {language === 'ar' ? p.ar : p.en}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          <motion.div variants={staggerItem}>
            <h3 className="text-xl font-bold mb-4 text-accent">{getContent('footer', 'contact_info_title', 'Contact Info')}</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin size={20} className="text-accent flex-shrink-0 mt-1" />
                <span className="text-gray-300">
                  {getContent('footer', 'address_line1', 'YCA GreenCoat House')}<br />
                  {getContent('footer', 'address_line2', '261-271 Stratford Road')}<br />
                  {getContent('footer', 'address_line3', 'Birmingham, B11 1QS')}
                </span>
              </li>
              <motion.li className="flex items-center gap-3" whileHover={{ x: isRTL ? -5 : 5 }}>
                <Phone size={20} className="text-accent flex-shrink-0" />
                <a href={`tel:${getContent('footer', 'phone', '01214395280').replace(/\s/g, '')}`} className="text-gray-300 hover:text-accent transition-colors">
                  {getContent('footer', 'phone', '0121 439 5280')}
                </a>
              </motion.li>
              <motion.li className="flex items-center gap-3" whileHover={{ x: isRTL ? -5 : 5 }}>
                <Mail size={20} className="text-accent flex-shrink-0" />
                <a href={`mailto:${getContent('footer', 'email', 'info@yca-birmingham.org.uk')}`} className="text-gray-300 hover:text-accent transition-colors">
                  {getContent('footer', 'email', 'info@yca-birmingham.org.uk')}
                </a>
              </motion.li>
            </ul>
          </motion.div>
        </motion.div>

        <motion.div
          className="border-t border-secondary mt-8 pt-8 text-center text-gray-400"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <p>&copy; {new Date().getFullYear()} {getContent('footer', 'copyright', `${orgName} Birmingham. Charity Number: ${charityNumber}. All rights reserved.`)}</p>
        </motion.div>
      </div>
    </footer>
    </>
  );
}
