import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ChevronDown, Globe, UserCircle, LogIn, UserPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { useSiteSettings } from '../contexts/SiteSettingsContext';
import { useMemberAuth } from '../contexts/MemberAuthContext';

export default function Header() {
  const { language, setLanguage, t } = useLanguage();
  const isRTL = language === 'ar';
  const { getSetting } = useSiteSettings();
  const { user } = useMemberAuth();
  const logoMain = getSetting('site_logo', '/logo.png');
  const logoText = getSetting('site_logo_text', '/logo_text.png');
  const orgName = getSetting('org_name_en', 'Yemeni Community Association');
  const [isOpen, setIsOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [activeDesktopMenu, setActiveDesktopMenu] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const toggleDropdown = (menu: string) => {
    setOpenDropdown(openDropdown === menu ? null : menu);
  };

  useEffect(() => {
    const controlHeader = () => {
      if (isOpen) {
        setIsVisible(true);
        return;
      }
      const currentScrollY = window.scrollY;
      setScrolled(currentScrollY > 20);
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
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const navLinkClass = "text-sm font-medium tracking-wide whitespace-nowrap transition-colors duration-200 hover:text-accent";

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm text-primary'
          : 'bg-primary/30 backdrop-blur-sm text-white'
      }`}
      initial={{ y: -100 }}
      animate={{ y: isVisible ? 0 : -100 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <div className="container mx-auto px-4">
        <div className="relative flex items-center justify-between h-16 md:h-[72px]">
          <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
            <img
              src={logoMain}
              alt={orgName}
              className="h-9 md:h-11 w-auto transition-transform group-hover:scale-105 duration-300"
            />
            <img
              src={logoText}
              alt={orgName}
              className={`h-7 md:h-9 w-auto transition-opacity duration-300 hidden xl:block ${
                scrolled ? 'opacity-90' : 'opacity-95'
              }`}
            />
          </Link>

          <div className="absolute left-1/2 -translate-x-1/2 xl:hidden flex items-center justify-center pointer-events-none">
            <img
              src={logoText}
              alt={getSetting('org_name_ar', 'الجالية اليمنية')}
              className={`h-6 sm:h-7 md:h-9 w-auto ${scrolled ? 'brightness-0' : 'brightness-100'} transition-all duration-300`}
            />
          </div>

          <div className="flex items-center gap-2 xl:hidden flex-shrink-0">
            <button
              onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold border transition-colors ${
                scrolled ? 'border-gray-300 text-primary' : 'border-white/30 text-white'
              }`}
            >
              {language === 'en' ? 'AR' : 'EN'}
            </button>

            <button
              className={`p-1.5 rounded-md transition-colors ${scrolled ? 'text-primary' : 'text-white'}`}
              onClick={() => setIsOpen(!isOpen)}
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isOpen}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          <nav className="hidden xl:flex items-center justify-center flex-1 gap-6 2xl:gap-8">
            <Link to="/" className={navLinkClass}>{t('nav.home')}</Link>
            <Link to="/services" className={navLinkClass}>{t('nav.services')}</Link>
            <Link to="/programmes" className={navLinkClass}>{t('nav.programmes')}</Link>
            <Link to="/events" className={navLinkClass}>{t('nav.events')}</Link>
            <Link to="/news" className={navLinkClass}>{t('nav.news')}</Link>

            <div
              className="relative"
              onMouseEnter={() => setActiveDesktopMenu('involved')}
              onMouseLeave={() => setActiveDesktopMenu(null)}
            >
              <button className={`flex items-center gap-1 ${navLinkClass}`}>
                {t('nav.getInvolved')}
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-200 ${activeDesktopMenu === 'involved' ? 'rotate-180' : ''}`}
                />
              </button>
              <AnimatePresence>
                {activeDesktopMenu === 'involved' && (
                  <motion.div
                    className={`absolute top-full ${isRTL ? 'right-0' : 'left-0'} mt-1 w-56 bg-white text-primary shadow-lg rounded-xl border border-gray-100 overflow-hidden`}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Link to="/membership" className="block px-5 py-3 text-sm hover:bg-gray-50 transition-colors">{t('nav.getInvolved.membership')}</Link>
                    <Link to="/get-involved/volunteer" className="block px-5 py-3 text-sm hover:bg-gray-50 transition-colors">{t('nav.getInvolved.volunteer')}</Link>
                    <Link to="/get-involved/jobs" className="block px-5 py-3 text-sm hover:bg-gray-50 transition-colors">{t('nav.getInvolved.jobs')}</Link>
                    <Link to="/get-involved/partnerships" className="block px-5 py-3 text-sm hover:bg-gray-50 transition-colors">{t('nav.getInvolved.partnerships')}</Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link to="/resources" className={navLinkClass}>{t('nav.resources')}</Link>

            <div
              className="relative"
              onMouseEnter={() => setActiveDesktopMenu('about')}
              onMouseLeave={() => setActiveDesktopMenu(null)}
            >
              <button className={`flex items-center gap-1 ${navLinkClass}`}>
                {t('nav.about')}
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-200 ${activeDesktopMenu === 'about' ? 'rotate-180' : ''}`}
                />
              </button>
              <AnimatePresence>
                {activeDesktopMenu === 'about' && (
                  <motion.div
                    className={`absolute top-full ${isRTL ? 'right-0' : 'left-0'} mt-1 w-52 bg-white text-primary shadow-lg rounded-xl border border-gray-100 overflow-hidden`}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Link to="/about/mission" className="block px-5 py-3 text-sm hover:bg-gray-50 transition-colors">{t('nav.about.mission')}</Link>
                    <Link to="/about/history" className="block px-5 py-3 text-sm hover:bg-gray-50 transition-colors">{t('nav.about.history')}</Link>
                    <Link to="/about/team" className="block px-5 py-3 text-sm hover:bg-gray-50 transition-colors">{t('nav.about.team')}</Link>
                    <Link to="/about/partners" className="block px-5 py-3 text-sm hover:bg-gray-50 transition-colors">{t('nav.about.partners')}</Link>
                    <Link to="/about/reports" className="block px-5 py-3 text-sm hover:bg-gray-50 transition-colors">{t('nav.about.reports')}</Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link to="/contact" className={navLinkClass}>{t('nav.contact')}</Link>
          </nav>

          <div className="hidden xl:flex items-center gap-3 flex-shrink-0">
            <Link
              to="/book"
              className="bg-accent text-white px-5 py-2 rounded-lg hover:bg-hover transition-colors font-medium text-sm"
            >
              {t('button.book')}
            </Link>

            {user ? (
              <Link
                to="/member/dashboard"
                className={`p-2 rounded-lg transition-colors ${
                  scrolled ? 'hover:bg-gray-100 text-primary' : 'hover:bg-white/10 text-white'
                }`}
                title={language === 'ar' ? 'حسابي' : 'My Account'}
              >
                <UserCircle size={20} />
              </Link>
            ) : (
              <div
                className="relative"
                onMouseEnter={() => setActiveDesktopMenu('account')}
                onMouseLeave={() => setActiveDesktopMenu(null)}
              >
                <button
                  className={`p-2 rounded-lg transition-colors ${
                    scrolled ? 'hover:bg-gray-100 text-primary' : 'hover:bg-white/10 text-white'
                  }`}
                  title={language === 'ar' ? 'العضوية' : 'Membership'}
                >
                  <LogIn size={20} />
                </button>
                <AnimatePresence>
                  {activeDesktopMenu === 'account' && (
                    <motion.div
                      className={`absolute top-full ${isRTL ? 'left-0' : 'right-0'} mt-1 w-56 bg-white text-primary shadow-lg rounded-xl border border-gray-100 overflow-hidden`}
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.15 }}
                    >
                      <Link to="/member/login" className="flex items-center gap-3 px-5 py-3 text-sm hover:bg-gray-50 transition-colors">
                        <LogIn size={16} className="text-muted" />
                        <span>{language === 'ar' ? 'تسجيل الدخول' : 'Member Login'}</span>
                      </Link>
                      <Link to="/membership" className="flex items-center gap-3 px-5 py-3 text-sm hover:bg-gray-50 transition-colors">
                        <UserPlus size={16} className="text-muted" />
                        <span>{language === 'ar' ? 'تسجيل عضوية جديدة' : 'Register New Membership'}</span>
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            <button
              onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
              className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg border transition-colors ${
                scrolled
                  ? 'border-gray-200 hover:bg-gray-50 text-primary'
                  : 'border-white/25 hover:bg-white/10 text-white'
              }`}
              aria-label="Toggle language"
            >
              <Globe size={14} />
              <span>{language === 'en' ? 'AR' : 'EN'}</span>
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.nav
              className="xl:hidden fixed inset-0 top-16 bg-white z-50 overflow-y-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="container mx-auto px-4 py-6 space-y-1">
                <Link to="/" onClick={() => setIsOpen(false)} className="block py-3 px-4 text-primary font-medium rounded-lg hover:bg-gray-50 transition-colors">{t('nav.home')}</Link>
                <Link to="/services" onClick={() => setIsOpen(false)} className="block py-3 px-4 text-primary font-medium rounded-lg hover:bg-gray-50 transition-colors">{t('nav.services')}</Link>
                <Link to="/programmes" onClick={() => setIsOpen(false)} className="block py-3 px-4 text-primary font-medium rounded-lg hover:bg-gray-50 transition-colors">{t('nav.programmes')}</Link>
                <Link to="/events" onClick={() => setIsOpen(false)} className="block py-3 px-4 text-primary font-medium rounded-lg hover:bg-gray-50 transition-colors">{t('nav.events')}</Link>
                <Link to="/news" onClick={() => setIsOpen(false)} className="block py-3 px-4 text-primary font-medium rounded-lg hover:bg-gray-50 transition-colors">{t('nav.news')}</Link>

                <div>
                  <button
                    onClick={() => toggleDropdown('involved')}
                    className="flex items-center justify-between w-full py-3 px-4 text-primary font-medium rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {t('nav.getInvolved')}
                    <ChevronDown size={16} className={`transition-transform ${openDropdown === 'involved' ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {openDropdown === 'involved' && (
                      <motion.div
                        className={`${isRTL ? 'pr-6' : 'pl-6'} space-y-0.5 mt-1`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Link to="/membership" onClick={() => setIsOpen(false)} className="block py-2.5 px-4 text-sm text-muted rounded-lg hover:bg-gray-50 hover:text-primary transition-colors">{t('nav.getInvolved.membership')}</Link>
                        <Link to="/get-involved/volunteer" onClick={() => setIsOpen(false)} className="block py-2.5 px-4 text-sm text-muted rounded-lg hover:bg-gray-50 hover:text-primary transition-colors">{t('nav.getInvolved.volunteer')}</Link>
                        <Link to="/get-involved/jobs" onClick={() => setIsOpen(false)} className="block py-2.5 px-4 text-sm text-muted rounded-lg hover:bg-gray-50 hover:text-primary transition-colors">{t('nav.getInvolved.jobs')}</Link>
                        <Link to="/get-involved/partnerships" onClick={() => setIsOpen(false)} className="block py-2.5 px-4 text-sm text-muted rounded-lg hover:bg-gray-50 hover:text-primary transition-colors">{t('nav.getInvolved.partnerships')}</Link>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <Link to="/resources" onClick={() => setIsOpen(false)} className="block py-3 px-4 text-primary font-medium rounded-lg hover:bg-gray-50 transition-colors">{t('nav.resources')}</Link>

                <div>
                  <button
                    onClick={() => toggleDropdown('about')}
                    className="flex items-center justify-between w-full py-3 px-4 text-primary font-medium rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {t('nav.about')}
                    <ChevronDown size={16} className={`transition-transform ${openDropdown === 'about' ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {openDropdown === 'about' && (
                      <motion.div
                        className={`${isRTL ? 'pr-6' : 'pl-6'} space-y-0.5 mt-1`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Link to="/about/mission" onClick={() => setIsOpen(false)} className="block py-2.5 px-4 text-sm text-muted rounded-lg hover:bg-gray-50 hover:text-primary transition-colors">{t('nav.about.mission')}</Link>
                        <Link to="/about/history" onClick={() => setIsOpen(false)} className="block py-2.5 px-4 text-sm text-muted rounded-lg hover:bg-gray-50 hover:text-primary transition-colors">{t('nav.about.history')}</Link>
                        <Link to="/about/team" onClick={() => setIsOpen(false)} className="block py-2.5 px-4 text-sm text-muted rounded-lg hover:bg-gray-50 hover:text-primary transition-colors">{t('nav.about.team')}</Link>
                        <Link to="/about/partners" onClick={() => setIsOpen(false)} className="block py-2.5 px-4 text-sm text-muted rounded-lg hover:bg-gray-50 hover:text-primary transition-colors">{t('nav.about.partners')}</Link>
                        <Link to="/about/reports" onClick={() => setIsOpen(false)} className="block py-2.5 px-4 text-sm text-muted rounded-lg hover:bg-gray-50 hover:text-primary transition-colors">{t('nav.about.reports')}</Link>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <Link to="/contact" onClick={() => setIsOpen(false)} className="block py-3 px-4 text-primary font-medium rounded-lg hover:bg-gray-50 transition-colors">{t('nav.contact')}</Link>

                <div className="pt-4 space-y-3 border-t border-gray-100 mt-4">
                  <Link
                    to="/book"
                    onClick={() => setIsOpen(false)}
                    className="block w-full bg-accent text-white px-6 py-3 rounded-xl hover:bg-hover transition-colors font-medium text-center"
                  >
                    {t('button.book')}
                  </Link>

                  {user ? (
                    <Link
                      to="/member/dashboard"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-center gap-2 w-full border border-gray-200 text-primary px-6 py-3 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                    >
                      <UserCircle size={18} />
                      {language === 'ar' ? 'حسابي' : 'My Account'}
                    </Link>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      <Link
                        to="/member/login"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center justify-center gap-2 border border-gray-200 text-primary px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors font-medium text-sm"
                      >
                        <LogIn size={16} />
                        {language === 'ar' ? 'تسجيل دخول' : 'Login'}
                      </Link>
                      <Link
                        to="/membership"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center justify-center gap-2 bg-primary text-white px-4 py-3 rounded-xl hover:bg-secondary transition-colors font-medium text-sm"
                      >
                        <UserPlus size={16} />
                        {language === 'ar' ? 'عضوية جديدة' : 'Register'}
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}
