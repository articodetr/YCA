import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer, staggerItem } from '../lib/animations';
import { useContent } from '../contexts/ContentContext';
import { useLanguage } from '../contexts/LanguageContext';

export default function Footer() {
  const { getContent } = useContent();
  const { t } = useLanguage();
  return (
    <footer className="bg-primary text-white">
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
                src="/logo_text.png"
                alt="Yemeni Community Association"
                className="h-10 w-auto max-w-fit"
              />
            </div>
            <p className="text-gray-300 mb-4">
              {getContent('footer', 'description', 'Empowering the Yemeni community in Birmingham through support, guidance, and cultural celebration.')}
            </p>
            <div className="flex gap-4">
              <motion.a
                href="#"
                className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center hover:bg-accent hover:text-primary transition-colors"
                whileHover={{ scale: 1.2, rotate: 360 }}
                transition={{ duration: 0.4 }}
              >
                <Facebook size={20} />
              </motion.a>
              <motion.a
                href="#"
                className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center hover:bg-accent hover:text-primary transition-colors"
                whileHover={{ scale: 1.2, rotate: 360 }}
                transition={{ duration: 0.4 }}
              >
                <Instagram size={20} />
              </motion.a>
              <motion.a
                href="#"
                className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center hover:bg-accent hover:text-primary transition-colors"
                whileHover={{ scale: 1.2, rotate: 360 }}
                transition={{ duration: 0.4 }}
              >
                <Twitter size={20} />
              </motion.a>
            </div>
          </motion.div>

          <motion.div variants={staggerItem}>
            <h3 className="text-xl font-bold mb-4 text-accent">{t('footer.quickLinks')}</h3>
            <ul className="space-y-2">
              <motion.li whileHover={{ x: 5 }}><Link to="/about/mission" className="text-gray-300 hover:text-accent transition-colors">{t('nav.about.mission')}</Link></motion.li>
              <motion.li whileHover={{ x: 5 }}><Link to="/services" className="text-gray-300 hover:text-accent transition-colors">{t('nav.services')}</Link></motion.li>
              <motion.li whileHover={{ x: 5 }}><Link to="/events" className="text-gray-300 hover:text-accent transition-colors">{t('nav.events')}</Link></motion.li>
              <motion.li whileHover={{ x: 5 }}><Link to="/news" className="text-gray-300 hover:text-accent transition-colors">{t('nav.news')}</Link></motion.li>
              <motion.li whileHover={{ x: 5 }}><Link to="/get-involved/volunteer" className="text-gray-300 hover:text-accent transition-colors">{t('nav.getInvolved.volunteer')}</Link></motion.li>
              <motion.li whileHover={{ x: 5 }}><Link to="/contact" className="text-gray-300 hover:text-accent transition-colors">{t('nav.contact')}</Link></motion.li>
            </ul>
          </motion.div>

          <motion.div variants={staggerItem}>
            <h3 className="text-xl font-bold mb-4 text-accent">{t('nav.programmes')}</h3>
            <ul className="space-y-2">
              <motion.li whileHover={{ x: 5 }}><Link to="/programmes/women" className="text-gray-300 hover:text-accent transition-colors">{t('nav.programmes.women')}</Link></motion.li>
              <motion.li whileHover={{ x: 5 }}><Link to="/programmes/elderly" className="text-gray-300 hover:text-accent transition-colors">{t('nav.programmes.elderly')}</Link></motion.li>
              <motion.li whileHover={{ x: 5 }}><Link to="/programmes/youth" className="text-gray-300 hover:text-accent transition-colors">{t('nav.programmes.youth')}</Link></motion.li>
              <motion.li whileHover={{ x: 5 }}><Link to="/programmes/children" className="text-gray-300 hover:text-accent transition-colors">{t('nav.programmes.children')}</Link></motion.li>
              <motion.li whileHover={{ x: 5 }}><Link to="/programmes/men" className="text-gray-300 hover:text-accent transition-colors">{t('nav.programmes.men')}</Link></motion.li>
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
              <motion.li className="flex items-center gap-3" whileHover={{ x: 5 }}>
                <Phone size={20} className="text-accent flex-shrink-0" />
                <a href={`tel:${getContent('footer', 'phone', '01214395280').replace(/\s/g, '')}`} className="text-gray-300 hover:text-accent transition-colors">
                  {getContent('footer', 'phone', '0121 439 5280')}
                </a>
              </motion.li>
              <motion.li className="flex items-center gap-3" whileHover={{ x: 5 }}>
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
          <p>&copy; {new Date().getFullYear()} {getContent('footer', 'copyright', 'Yemeni Community Association Birmingham. Charity Number: 1057470. All rights reserved.')}</p>
        </motion.div>
      </div>
    </footer>
  );
}
