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

  const location = useLocation();
  const isHomePage = location.pathname === '/';

  const [isOpen, setIsOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [activeDesktopMenu, setActiveDesktopMenu] = useState<string | null>(null);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
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

      // Keep header visible while mobile menu is open
      if (isOpen) {
        setIsVisible(true);
        setLastScrollY(currentScrollY);
        return;
      }

      if (currentScrollY < 10) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY) {
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    // Run once on mount to set initial states correctly
    controlHeader();

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
            <div className="py-2">
              {dropdown.items.map((item) => (
                <div
                  key={item.path}
                  className="relative"
                  onMouseEnter={() => item.children && setActiveSubmenu(item.path)}
                  onMouseLeave={() => item.children && setActiveSubmenu(null)}
                >
                  <Link
                    to={item.path}
                    className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 transition-colors"
                    onClick={() => {
                      setActiveDesktopMenu(null);
                      setActiveSubmenu(null);
                    }}
                  >
                    <span className="text-sm">{item.label}</span>
                    {item.children && <ChevronRight size={14} className={isRTL ? 'rotate-180' : ''} />}
                  </Link>

                  <AnimatePresence>
                    {item.children && activeSubmenu === item.path && (
                      <motion.div
                        className={`absolute top-0 ${isRTL ? 'right-full mr-1' : 'left-full ml-1'} w-64 bg-white text-primary shadow-xl rounded-lg overflow-hidden z-50`}
                        initial={{ opacity: 0, x: isRTL ? 10 : -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: isRTL ? 10 : -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="py-2">
                          {item.children.map((child) => (
                            <Link
                              key={child.path}
                              to={child.path}
                              className="block px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors"
                              onClick={() => {
                                setActiveDesktopMenu(null);
                                setActiveSubmenu(null);
                              }}
                            >
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  const isTransparent = isHomePage && isAtTop && !isOpen;

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 transition-colors ${
        isTransparent
          ? 'bg-transparent text-white shadow-none border-b border-transparent'
          : 'bg-white/85 backdrop-blur-md text-primary shadow-sm border-b border-black/5'
      }`}
      initial={{ y: -100, opacity: 0 }}
      animate={{
        y: isVisible ? 0 : -100,
        opacity: isVisible ? 1 : 0,
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
                className="hidden sm:block h-7 sm:h-8 md:h-10 w-auto transition-opacity group-hover:opacity-90 duration-300"
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            <Link
              to="/"
              className="text-sm uppercase tracking-wider whitespace-nowrap hover:text-accent transition-colors"
            >
              {t('nav.home')}
            </Link>

            {allDropdowns.map(renderDesktopDropdown)}

            <Link
              to="/contact"
              className="text-sm uppercase tracking-wider whitespace-nowrap hover:text-accent transition-colors"
            >
              {t('nav.contact')}
            </Link>
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            <motion.button
              onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
              className={`${isTransparent ? 'text-white border-white/40' : 'text-primary border-black/20'} border px-2 py-1 rounded text-xs font-semibold`}
              whileTap={{ scale: 0.9 }}
              aria-label="Toggle language"
            >
              {language === 'en' ? 'AR' : 'EN'}
            </motion.button>

            <Link
              to="/donate"
              className="hidden md:inline-flex items-center gap-2 text-sm uppercase tracking-wider whitespace-nowrap hover:text-accent transition-colors"
            >
              <Heart size={16} />
              {t('nav.donate')}
            </Link>

            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <div className="relative" onMouseEnter={() => setActiveDesktopMenu('member')} onMouseLeave={handleMouseLeave}>
                  <button className="flex items-center gap-2 text-sm uppercase tracking-wider whitespace-nowrap hover:text-accent transition-colors">
                    <UserCircle size={18} />
                    {t('nav.member')}
                    <ChevronDown
                      size={14}
                      className={`transition-transform duration-300 ${activeDesktopMenu === 'member' ? 'rotate-180' : ''}`}
                    />
                  </button>

                  <AnimatePresence>
                    {activeDesktopMenu === 'member' && (
                      <motion.div
                        className={`absolute top-full ${isRTL ? 'left-0' : 'right-0'} mt-2 w-56 bg-white text-primary shadow-xl rounded-lg overflow-hidden z-50`}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="py-2">
                          <Link
                            to="/member/dashboard"
                            className="block px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors"
                          >
                            {language === 'ar' ? 'لوحة العضو' : 'Member Dashboard'}
                          </Link>
                          <Link
                            to="/member/profile"
                            className="block px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors"
                          >
                            {language === 'ar' ? 'الملف الشخصي' : 'Profile'}
                          </Link>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  to="/member/login"
                  className="flex items-center gap-2 text-sm uppercase tracking-wider whitespace-nowrap hover:text-accent transition-colors"
                >
                  <LogIn size={18} />
                  {t('nav.memberLogin')}
                </Link>
              )}
            </div>

            <Link
              to="/book"
              className="hidden sm:inline-flex bg-accent text-primary px-5 py-2 hover:bg-hover transition-colors font-semibold text-xs uppercase tracking-wider whitespace-nowrap"
            >
              {t('button.book')}
            </Link>

            <motion.button
              className={isTransparent ? 'text-white' : 'text-primary'}
              onClick={() => setIsOpen(!isOpen)}
              whileTap={{ scale: 0.9 }}
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isOpen}
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.nav
              className="lg:hidden fixed inset-0 top-20 md:top-24 bg-white z-40 overflow-y-auto"
              initial={{ opacity: 0, x: isRTL ? 100 : -100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isRTL ? 100 : -100 }}
              transition={{ duration: 0.25 }}
            >
              <motion.div className="container mx-auto px-4 py-6">
                <div className="flex flex-col gap-2">
                  <Link
                    to="/"
                    onClick={() => setIsOpen(false)}
                    className="py-2 text-sm uppercase tracking-wider hover:text-accent transition-colors"
                  >
                    {t('nav.home')}
                  </Link>

                  {allDropdowns.map((dropdown) => (
                    <div key={dropdown.key}>
                      <button
                        onClick={() => toggleDropdown(dropdown.key)}
                        className="flex w-full items-center justify-between py-2 text-sm uppercase tracking-wider hover:text-accent transition-colors"
                      >
                        {dropdown.label}
                        <ChevronDown
                          size={16}
                          className={`transition-transform ${openDropdown === dropdown.key ? 'rotate-180' : ''}`}
                        />
                      </button>

                      <AnimatePresence>
                        {openDropdown === dropdown.key && (
                          <motion.div
                            className="pl-4 space-y-1"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            {dropdown.items.map((item) => (
                              <div key={item.path}>
                                <Link
                                  to={item.path}
                                  onClick={() => setIsOpen(false)}
                                  className="block py-2 text-sm hover:text-accent transition-colors"
                                >
                                  {item.label}
                                </Link>

                                {item.children && (
                                  <div className="pl-4 space-y-1">
                                    {item.children.map((child) => (
                                      <Link
                                        key={child.path}
                                        to={child.path}
                                        onClick={() => setIsOpen(false)}
                                        className="block py-2 text-sm hover:text-accent transition-colors"
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
                    </div>
                  ))}

                  <div className="pt-4 border-t border-black/10 mt-4 space-y-3">
                    <Link
                      to="/donate"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-2 py-2 text-sm hover:text-accent transition-colors"
                    >
                      <Heart size={16} />
                      {t('nav.donate')}
                    </Link>

                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Link
                        to="/book"
                        className="bg-accent text-primary px-5 py-2.5 hover:bg-hover transition-colors font-semibold text-sm uppercase tracking-wider whitespace-nowrap"
                        onClick={() => setIsOpen(false)}
                      >
                        {t('button.book')}
                      </Link>
                    </motion.div>

                    {user ? (
                      <>
                        <Link
                          to="/member/dashboard"
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-2 py-2 text-sm hover:text-accent transition-colors"
                        >
                          <UserCircle size={16} />
                          {language === 'ar' ? 'لوحة العضو' : 'Member Dashboard'}
                        </Link>
                        <Link
                          to="/member/profile"
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-2 py-2 text-sm hover:text-accent transition-colors"
                        >
                          <UserCircle size={16} />
                          {language === 'ar' ? 'الملف الشخصي' : 'Profile'}
                        </Link>
                      </>
                    ) : (
                      <>
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
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}
