import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, ChevronRight, Globe, UserCircle, LogIn, UserPlus, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { useSiteSettings } from '../contexts/SiteSettingsContext';
import { useMemberAuth } from '../contexts/MemberAuthContext';

interface DropdownItem {
  label: string;
  path: string;
  children?: DropdownItem[];
}

interface NavDropdown {
  key: string;
  label: string;
  items: DropdownItem[];
}

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
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
const location = useLocation();
const isHomePage = location.pathname === '/';
const [isAtTop, setIsAtTop] = useState(true);

  const toggleDropdown = (menu: string) => {
    setOpenDropdown(openDropdown === menu ? null : menu);
  };

  const handleMouseEnter = (menu: string) => {
    setActiveDesktopMenu(menu);
  };

  const handleMouseLeave = () => {
    setActiveDesktopMenu(null);
    setActiveSubmenu(null);
  };

  useEffect(() => {
    const controlHeader = () => {
  const currentScrollY = window.scrollY;
  setIsAtTop(currentScrollY < 10);

  if (isOpen) {
    setIsVisible(true);
    setLastScrollY(currentScrollY);
    return;
  }

  // بقية منطق إظهار/إخفاء الهيدر...
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

  const servicesDropdown: NavDropdown = {
    key: 'services',
    label: t('nav.services'),
    items: [
      { label: t('nav.services.advisory'), path: '/book?service=advisory' },
      {
        label: t('nav.services.legal'),
        path: '/services/legal',
        children: [
          { label: t('nav.services.legal.wakala'), path: '/book?service=wakala' },
          { label: t('nav.services.legal.translation'), path: '/book?service=translation' },
          { label: t('nav.services.legal.other'), path: '/book?service=other' },
        ],
      },
    ],
  };

  const communityDropdown: NavDropdown = {
    key: 'community',
    label: t('nav.communityActivities'),
    items: [
      { label: t('nav.communityActivities.news'), path: '/news' },
      { label: t('nav.communityActivities.events'), path: '/events' },
      { label: t('nav.communityActivities.resources'), path: '/resources' },
      {
        label: t('nav.communityActivities.programmes'),
        path: '/programmes',
        children: [
          { label: t('nav.programmes.journeyWithin'), path: '/programmes/journey-within' },
          { label: t('nav.programmes.women'), path: '/programmes/women' },
          { label: t('nav.programmes.elderly'), path: '/programmes/elderly' },
          { label: t('nav.programmes.youth'), path: '/programmes/youth' },
          { label: t('nav.programmes.children'), path: '/programmes/children' },
          { label: t('nav.programmes.men'), path: '/programmes/men' },
        ],
      },
    ],
  };

  const involvedDropdown: NavDropdown = {
    key: 'involved',
    label: t('nav.getInvolved'),
    items: [
      { label: t('nav.getInvolved.membership'), path: '/membership' },
      { label: t('nav.getInvolved.volunteer'), path: '/get-involved/volunteer' },
      { label: t('nav.getInvolved.jobs'), path: '/get-involved/jobs' },
      { label: t('nav.getInvolved.partnerships'), path: '/get-involved/partnerships' },
      { label: t('nav.getInvolved.businessSupport'), path: '/get-involved/business-support' },
    ],
  };

  const aboutDropdown: NavDropdown = {
    key: 'about',
    label: t('nav.about'),
    items: [
      { label: t('nav.about.mission'), path: '/about/mission' },
      { label: t('nav.about.history'), path: '/about/history' },
      { label: t('nav.about.team'), path: '/about/team' },
      { label: t('nav.about.partners'), path: '/about/partners' },
      { label: t('nav.about.reports'), path: '/about/reports' },
    ],
  };

  const contactDropdown: NavDropdown = {
    key: 'contact',
    label: t('nav.contact'),
    items: [
      { label: t('nav.contact.details'), path: '/contact' },
      { label: t('nav.contact.location'), path: '/contact#map' },
      { label: t('nav.contact.complaints'), path: '/contact/complaints' },
      { label: t('nav.contact.feedback'), path: '/contact/feedback' },
    ],
  };

  const allDropdowns = [servicesDropdown, communityDropdown, involvedDropdown, aboutDropdown, contactDropdown];

  const renderDesktopDropdown = (dropdown: NavDropdown) => (
    <div
      key={dropdown.key}
      className="relative"
      onMouseEnter={() => handleMouseEnter(dropdown.key)}
      onMouseLeave={handleMouseLeave}
    >
      <button className="flex items-center gap-1 text-sm uppercase tracking-wider whitespace-nowrap hover:text-accent transition-colors">
        {dropdown.label}{' '}
        <ChevronDown
          size={14}
          className={`transition-transform duration-300 ${activeDesktopMenu === dropdown.key ? 'rotate-180' : ''}`}
        />
      </button>
      <AnimatePresence>
        {activeDesktopMenu === dropdown.key && (
          <motion.div
            className={`absolute top-full ${isRTL ? 'right-0' : 'left-0'} mt-2 w-72 bg-white text-primary shadow-xl rounded-lg overflow-visible z-50`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {dropdown.items.map((item) => (
              <div
                key={item.path}
                className="relative"
                onMouseEnter={() => item.children && setActiveSubmenu(item.path)}
                onMouseLeave={() => setActiveSubmenu(null)}
              >
                {item.children ? (
                  <>
                    <Link
                      to={item.path}
                      className="flex items-center justify-between px-5 py-3 hover:bg-sand transition-colors text-sm"
                    >
                      <span>{item.label}</span>
                      <ChevronRight size={14} className={isRTL ? 'rotate-180' : ''} />
                    </Link>
                    <AnimatePresence>
                      {activeSubmenu === item.path && (
                        <motion.div
                          className={`absolute top-0 ${isRTL ? 'right-full mr-1' : 'left-full ml-1'} w-64 bg-white text-primary shadow-xl rounded-lg overflow-hidden z-50`}
                          initial={{ opacity: 0, x: isRTL ? 10 : -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: isRTL ? 10 : -10 }}
                          transition={{ duration: 0.15 }}
                        >
                          {item.children.map((child) => (
                            <Link
                              key={child.path}
                              to={child.path}
                              className="block px-5 py-3 hover:bg-sand transition-colors text-sm"
                            >
                              {child.label}
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                ) : (
                  <Link
                    to={item.path}
                    className="block px-5 py-3 hover:bg-sand transition-colors text-sm"
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  const renderMobileDropdown = (dropdown: NavDropdown, delay: number) => (
    <motion.div
      key={dropdown.key}
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay }}
    >
      <button
        onClick={() => toggleDropdown(dropdown.key)}
        className="flex items-center justify-between w-full py-2 hover:text-accent transition-colors"
      >
        {dropdown.label}
        <ChevronDown
          size={16}
          className={`transition-transform duration-300 ${openDropdown === dropdown.key ? 'rotate-180' : ''}`}
        />
      </button>
      <AnimatePresence>
        {openDropdown === dropdown.key && (
          <motion.div
            className={`${isRTL ? 'pr-4' : 'pl-4'} space-y-1 mt-1`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {dropdown.items.map((item) => (
              <div key={item.path}>
                <Link
                  to={item.path}
                  onClick={() => !item.children && setIsOpen(false)}
                  className="block py-1.5 text-sm hover:text-accent transition-colors"
                >
                  {item.label}
                </Link>
                {item.children && (
                  <div className={`${isRTL ? 'pr-4' : 'pl-4'} space-y-1`}>
                    {item.children.map((child) => (
                      <Link
                        key={child.path}
                        to={child.path}
                        onClick={() => setIsOpen(false)}
                        className="block py-1 text-xs text-gray-300 hover:text-accent transition-colors"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 bg-white/85 backdrop-blur-md text-primary shadow-sm border-b border-black/5"
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
              className="text-primary border border-black/20 px-2 py-1 rounded text-xs font-semibold"
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
              className="text-primary"
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

          <nav className="hidden xl:flex items-center justify-center flex-1 gap-3 2xl:gap-4">
            <Link to="/" className="text-sm uppercase tracking-wider whitespace-nowrap hover:text-accent transition-colors">
              {t('nav.home')}
            </Link>
            {allDropdowns.map((dropdown) => renderDesktopDropdown(dropdown))}
          </nav>

          <div className="hidden xl:flex items-center gap-3 flex-shrink-0">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/book"
                className="bg-accent text-primary px-5 py-2.5 hover:bg-hover transition-colors font-semibold text-sm uppercase tracking-wider whitespace-nowrap"
              >
                {t('button.book')}
              </Link>
            </motion.div>

            {user ? (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/member/dashboard?tab=profile"
                  className="hover:text-accent transition-colors p-2.5 block"
                  title={language === 'ar' ? 'حسابي' : 'My Account'}
                >
                  <UserCircle size={20} />
                </Link>
              </motion.div>
            ) : (
              <div
                className="relative"
                onMouseEnter={() => handleMouseEnter('account')}
                onMouseLeave={handleMouseLeave}
              >
                <motion.button
                  className="hover:text-accent transition-colors p-2.5 flex items-center gap-1 text-sm"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title={language === 'ar' ? 'تسجيل الدخول' : 'Member Login'}
                >
                  <LogIn size={18} />
                  <span className="hidden 2xl:inline text-xs uppercase tracking-wider">
                    {language === 'ar' ? 'الدخول' : 'Login'}
                  </span>
                </motion.button>
                <AnimatePresence>
                  {activeDesktopMenu === 'account' && (
                    <motion.div
                      className={`absolute top-full ${isRTL ? 'left-0' : 'right-0'} mt-2 w-56 bg-white text-primary shadow-xl rounded-lg overflow-hidden z-50`}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Link
                        to="/member/login"
                        className="flex items-center gap-3 px-6 py-3 hover:bg-sand transition-colors text-sm"
                      >
                        <LogIn size={18} />
                        <span>{language === 'ar' ? 'تسجيل الدخول' : 'Member Login'}</span>
                      </Link>
                      <Link
                        to="/membership"
                        className="flex items-center gap-3 px-6 py-3 hover:bg-sand transition-colors text-sm"
                      >
                        <UserPlus size={18} />
                        <span>{language === 'ar' ? 'تسجيل عضوية جديدة' : 'Register New Membership'}</span>
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/get-involved/donate"
                className="hover:text-accent transition-colors p-2.5 block text-red-300 hover:text-red-200"
                title={language === 'ar' ? 'تبرع' : 'Donate'}
              >
                <Heart size={20} />
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
          </div>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.nav
              className="xl:hidden pb-6 space-y-2 bg-[#0b1424] rounded-b-2xl px-4 pt-4 max-h-[calc(100vh-80px)] overflow-y-auto overscroll-contain"
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

              {allDropdowns.map((dropdown, index) =>
                renderMobileDropdown(dropdown, 0.15 + index * 0.05)
              )}

              <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.45 }}>
                <div className="pt-4 space-y-3">
                  <Link
                    to="/book"
                    onClick={() => setIsOpen(false)}
                    className="block bg-accent text-primary px-6 py-3 rounded-lg hover:bg-hover transition-colors font-semibold text-center whitespace-nowrap"
                  >
                    {t('button.book')}
                  </Link>

                  <Link
                    to="/get-involved/donate"
                    onClick={() => setIsOpen(false)}
                    className="block bg-red-600/80 text-white px-6 py-3 rounded-lg hover:bg-red-700/80 transition-colors font-semibold text-center whitespace-nowrap"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <Heart size={18} />
                      {language === 'ar' ? 'تبرع' : 'Donate'}
                    </span>
                  </Link>

                  {user ? (
                    <Link
                      to="/member/dashboard?tab=profile"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-center gap-2 w-full border border-white/30 text-white px-6 py-3 rounded-lg hover:bg-white/10 transition-colors font-semibold"
                    >
                      <UserCircle size={18} />
                      {language === 'ar' ? 'حسابي' : 'My Account'}
                    </Link>
                  ) : (
                    <>
                      <button
                        onClick={() => toggleDropdown('account')}
                        className="flex items-center justify-between w-full border border-white/30 text-white px-6 py-3 rounded-lg hover:bg-white/10 transition-colors font-semibold"
                      >
                        <div className="flex items-center gap-2">
                          <LogIn size={18} />
                          {language === 'ar' ? 'تسجيل الدخول' : 'Member Login'}
                        </div>
                        <ChevronDown size={16} className={`transition-transform duration-300 ${openDropdown === 'account' ? 'rotate-180' : ''}`} />
                      </button>
                      <AnimatePresence>
                        {openDropdown === 'account' && (
                          <motion.div
                            className={`${isRTL ? 'pr-4' : 'pl-4'} space-y-2 mt-2`}
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Link
                              to="/member/login"
                              onClick={() => setIsOpen(false)}
                              className="flex items-center gap-2 py-2 text-sm hover:text-accent transition-colors"
                            >
                              <LogIn size={16} />
                              {language === 'ar' ? 'تسجيل الدخول' : 'Login'}
                            </Link>
                            <Link
                              to="/membership"
                              onClick={() => setIsOpen(false)}
                              className="flex items-center gap-2 py-2 text-sm hover:text-accent transition-colors"
                            >
                              <UserPlus size={16} />
                              {language === 'ar' ? 'تسجيل عضوية جديدة' : 'Register New Membership'}
                            </Link>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  )}
                </div>
              </motion.div>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}
