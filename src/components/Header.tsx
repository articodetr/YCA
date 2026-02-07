import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ChevronDown, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { useSiteSettings } from '../contexts/SiteSettingsContext';

export default function Header() {
  const { language, setLanguage, t } = useLanguage();
  const isRTL = language === 'ar';
  const { getSetting } = useSiteSettings();
  const logoMain = getSetting('site_logo', '/logo.png');
  const logoText = getSetting('site_logo_text', '/logo_text.png');
  const orgName = getSetting('org_name_en', 'Yemeni Community Association');
  const [isOpen, setIsOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [activeDesktopMenu, setActiveDesktopMenu] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const toggleDropdown = (menu: string) => {
    setOpenDropdown(openDropdown === menu ? null : menu);
  };

  const handleMouseEnter = (menu: string) => {
    setActiveDesktopMenu(menu);
  };

  const handleMouseLeave = () => {
    setActiveDesktopMenu(null);
  };

  useEffect(() => {
    const controlHeader = () => {
      // Important: keep header visible while mobile menu is open
      if (isOpen) {
        setIsVisible(true);
        return;
      }

      const currentScrollY = window.scrollY;

      if (currentScrollY < 10) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY) {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', controlHeader);
    return () => window.removeEventListener('scroll', controlHeader);
  }, [lastScrollY, isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 bg-[#1b2b45]/40 backdrop-blur-none text-white shadow-none"
      initial={{ y: -100, opacity: 0 }}
      animate={{
        y: isVisible ? 0 : -100,
        opacity: isVisible ? 1 : 0
      }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <div className="container mx-auto px-4">
        <div className="relative flex items-center justify-between h-20 md:h-24">
          <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
            <div className="flex items-center gap-3">
              <img
                src={logoMain}
                alt={orgName}
                className="h-10 sm:h-12 md:h-14 lg:h-16 w-auto transition-transform group-hover:scale-105 duration-300"
              />

              <img
                src={logoText}
                alt={orgName}
                className="h-8 sm:h-10 md:h-12 w-auto transition-opacity group-hover:opacity-80 duration-300 hidden xl:block"
              />
            </div>
          </Link>

          {/* Mobile Center Text Logo (يظهر فقط تحت XL) */}
<div className="absolute left-1/2 -translate-x-1/2 xl:hidden flex items-center justify-center pointer-events-none">
  <img
    src={logoText}
    alt={getSetting('org_name_ar', 'الجالية اليمنية')}
    className="h-7 sm:h-8 md:h-12 w-auto opacity-95"
  />
</div>

          <div className="flex items-center gap-2 xl:hidden flex-shrink-0">
            <motion.button
              onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
              className="text-white border border-white/30 px-2 py-1 rounded text-xs font-semibold"
              whileTap={{ scale: 0.9 }}
              aria-label="Toggle language"
            >
              {language === 'en' ? 'AR' : 'EN'}
            </motion.button>

            <Link
              to="/book"
              className="hidden sm:inline-flex bg-accent text-primary px-5 py-2 hover:bg-hover transition-colors font-semibold text-xs uppercase tracking-wider whitespace-nowrap"
            >
              {t('button.book')}
            </Link>

            <motion.button
              className="text-white"
              onClick={() => setIsOpen(!isOpen)}
              whileTap={{ scale: 0.9 }}
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isOpen}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={isOpen ? 'close' : 'open'}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {isOpen ? <X size={28} /> : <Menu size={28} />}
                </motion.div>
              </AnimatePresence>
            </motion.button>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden xl:flex items-center gap-5 2xl:gap-8">
            <Link to="/" className="text-sm uppercase tracking-wider whitespace-nowrap hover:text-accent transition-colors">
              {t('nav.home')}
            </Link>
            <Link to="/services" className="text-sm uppercase tracking-wider whitespace-nowrap hover:text-accent transition-colors">
              {t('nav.services')}
            </Link>
            <Link to="/programmes" className="text-sm uppercase tracking-wider whitespace-nowrap hover:text-accent transition-colors">
              {t('nav.programmes')}
            </Link>
            <Link to="/events" className="text-sm uppercase tracking-wider whitespace-nowrap hover:text-accent transition-colors">
              {t('nav.events')}
            </Link>
            <Link to="/news" className="text-sm uppercase tracking-wider whitespace-nowrap hover:text-accent transition-colors">
              {t('nav.news')}
            </Link>

            <div
              className="relative"
              onMouseEnter={() => handleMouseEnter('involved')}
              onMouseLeave={handleMouseLeave}
            >
              <button className="flex items-center gap-1 text-sm uppercase tracking-wider whitespace-nowrap hover:text-accent transition-colors">
                {t('nav.getInvolved')}{' '}
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-300 ${activeDesktopMenu === 'involved' ? 'rotate-180' : ''}`}
                />
              </button>
              <AnimatePresence>
                {activeDesktopMenu === 'involved' && (
                  <motion.div
                    className={`absolute top-full ${isRTL ? 'right-0' : 'left-0'} mt-2 w-64 bg-white text-primary shadow-xl rounded-lg overflow-hidden`}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Link to="/get-involved/membership" className="block px-6 py-3 hover:bg-sand transition-colors">
                      {t('nav.getInvolved.membership')}
                    </Link>
                    <Link to="/get-involved/volunteer" className="block px-6 py-3 hover:bg-sand transition-colors">
                      {t('nav.getInvolved.volunteer')}
                    </Link>
                    <Link to="/get-involved/donate" className="block px-6 py-3 hover:bg-sand transition-colors">
                      {t('nav.getInvolved.donate')}
                    </Link>
                    <Link to="/get-involved/jobs" className="block px-6 py-3 hover:bg-sand transition-colors">
                      {t('nav.getInvolved.jobs')}
                    </Link>
                    <Link to="/get-involved/partnerships" className="block px-6 py-3 hover:bg-sand transition-colors">
                      {t('nav.getInvolved.partnerships')}
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link to="/resources" className="text-sm uppercase tracking-wider whitespace-nowrap hover:text-accent transition-colors">
              {t('nav.resources')}
            </Link>

            <div
              className="relative"
              onMouseEnter={() => handleMouseEnter('about')}
              onMouseLeave={handleMouseLeave}
            >
              <button className="flex items-center gap-1 text-sm uppercase tracking-wider whitespace-nowrap hover:text-accent transition-colors">
                {t('nav.about')}{' '}
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-300 ${activeDesktopMenu === 'about' ? 'rotate-180' : ''}`}
                />
              </button>
              <AnimatePresence>
                {activeDesktopMenu === 'about' && (
                  <motion.div
                    className={`absolute top-full ${isRTL ? 'right-0' : 'left-0'} mt-2 w-56 bg-white text-primary shadow-xl rounded-lg overflow-hidden`}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Link to="/about/mission" className="block px-6 py-3 hover:bg-sand transition-colors">
                      {t('nav.about.mission')}
                    </Link>
                    <Link to="/about/history" className="block px-6 py-3 hover:bg-sand transition-colors">
                      {t('nav.about.history')}
                    </Link>
                    <Link to="/about/team" className="block px-6 py-3 hover:bg-sand transition-colors">
                      {t('nav.about.team')}
                    </Link>
                    <Link to="/about/partners" className="block px-6 py-3 hover:bg-sand transition-colors">
                      {t('nav.about.partners')}
                    </Link>
                    <Link to="/about/reports" className="block px-6 py-3 hover:bg-sand transition-colors">
                      {t('nav.about.reports')}
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link to="/contact" className="text-sm uppercase tracking-wider whitespace-nowrap hover:text-accent transition-colors">
              {t('nav.contact')}
            </Link>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/book"
                className="bg-accent text-primary px-8 py-2.5 hover:bg-hover transition-colors font-semibold text-sm uppercase tracking-wider whitespace-nowrap"
              >
                {t('button.book')}
              </Link>
            </motion.div>

            <motion.button
              onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
              className="flex items-center gap-2 text-sm uppercase tracking-wider hover:text-accent transition-colors px-3 py-2 border border-white/30 rounded-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Toggle language"
            >
              <Globe size={16} />
              <span>{language === 'en' ? 'AR' : 'EN'}</span>
            </motion.button>
          </nav>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.nav
              className="xl:hidden pb-6 space-y-2 bg-[#0b1424]/90 backdrop-blur-md rounded-b-2xl px-4 pt-4 max-h-[calc(100vh-80px)] overflow-y-auto overscroll-contain"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
                <Link to="/" onClick={() => setIsOpen(false)} className="block py-2 hover:text-accent transition-colors">
                  {t('nav.home')}
                </Link>
              </motion.div>

              <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.15 }}>
                <Link to="/services" onClick={() => setIsOpen(false)} className="block py-2 hover:text-accent transition-colors">
                  {t('nav.services')}
                </Link>
              </motion.div>

              <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
                <Link to="/programmes" onClick={() => setIsOpen(false)} className="block py-2 hover:text-accent transition-colors">
                  {t('nav.programmes')}
                </Link>
              </motion.div>

              <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.25 }}>
                <Link to="/events" onClick={() => setIsOpen(false)} className="block py-2 hover:text-accent transition-colors">
                  {t('nav.events')}
                </Link>
              </motion.div>

              <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
                <Link to="/news" onClick={() => setIsOpen(false)} className="block py-2 hover:text-accent transition-colors">
                  {t('nav.news')}
                </Link>
              </motion.div>

              <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.35 }}>
                <button
                  onClick={() => toggleDropdown('involved')}
                  className="flex items-center justify-between w-full py-2 hover:text-accent transition-colors"
                >
                  {t('nav.getInvolved')} <ChevronDown size={16} />
                </button>

                <AnimatePresence>
                  {openDropdown === 'involved' && (
                    <motion.div
                      className={`${isRTL ? 'pr-4' : 'pl-4'} space-y-2 mt-2`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Link to="/get-involved/membership" onClick={() => setIsOpen(false)} className="block py-1 text-sm">
                        {t('nav.getInvolved.membership')}
                      </Link>
                      <Link to="/get-involved/volunteer" onClick={() => setIsOpen(false)} className="block py-1 text-sm">
                        {t('nav.getInvolved.volunteer')}
                      </Link>
                      <Link to="/get-involved/donate" onClick={() => setIsOpen(false)} className="block py-1 text-sm">
                        {t('nav.getInvolved.donate')}
                      </Link>
                      <Link to="/get-involved/jobs" onClick={() => setIsOpen(false)} className="block py-1 text-sm">
                        {t('nav.getInvolved.jobs')}
                      </Link>
                      <Link to="/get-involved/partnerships" onClick={() => setIsOpen(false)} className="block py-1 text-sm">
                        {t('nav.getInvolved.partnerships')}
                      </Link>

                      <Link
                        to="/book"
                        onClick={() => setIsOpen(false)}
                        className="inline-flex mt-2 bg-accent text-primary px-4 py-2 rounded-md hover:bg-hover transition-colors font-semibold text-xs uppercase tracking-wider whitespace-nowrap"
                      >
                        {t('button.book')}
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
                <Link to="/resources" onClick={() => setIsOpen(false)} className="block py-2 hover:text-accent transition-colors">
                  {t('nav.resources')}
                </Link>
              </motion.div>

              <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.45 }}>
                <button
                  onClick={() => toggleDropdown('about')}
                  className="flex items-center justify-between w-full py-2 hover:text-accent transition-colors"
                >
                  {t('nav.about')} <ChevronDown size={16} />
                </button>

                <AnimatePresence>
                  {openDropdown === 'about' && (
                    <motion.div
                      className={`${isRTL ? 'pr-4' : 'pl-4'} space-y-2 mt-2`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Link to="/about/mission" onClick={() => setIsOpen(false)} className="block py-1 text-sm">
                        {t('nav.about.mission')}
                      </Link>
                      <Link to="/about/history" onClick={() => setIsOpen(false)} className="block py-1 text-sm">
                        {t('nav.about.history')}
                      </Link>
                      <Link to="/about/team" onClick={() => setIsOpen(false)} className="block py-1 text-sm">
                        {t('nav.about.team')}
                      </Link>
                      <Link to="/about/partners" onClick={() => setIsOpen(false)} className="block py-1 text-sm">
                        {t('nav.about.partners')}
                      </Link>
                      <Link to="/about/reports" onClick={() => setIsOpen(false)} className="block py-1 text-sm">
                        {t('nav.about.reports')}
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.5 }}>
                <Link
                  to="/contact"
                  onClick={() => setIsOpen(false)}
                  className="block mt-4 bg-accent text-primary px-6 py-3 rounded-lg hover:bg-hover transition-colors font-semibold text-center whitespace-nowrap"
                >
                  {t('nav.contact')}
                </Link>

                <Link
                  to="/book"
                  onClick={() => setIsOpen(false)}
                  className="block mt-3 bg-white/10 text-white px-6 py-3 rounded-lg hover:bg-white/15 transition-colors font-semibold text-center whitespace-nowrap"
                >
                  {t('button.book')}
                </Link>
              </motion.div>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}
