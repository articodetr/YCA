import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ChevronDown } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

type MenuKey = 'involved' | 'about' | null;

const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Services', to: '/services' },
  { label: 'Programmes', to: '/programmes' },
  { label: 'Events', to: '/events' },
  { label: 'News', to: '/news' },
  { label: 'Resources', to: '/resources' },
  { label: 'Contact', to: '/contact' }
];

const INVOLVED_LINKS = [
  { label: 'Become a Member', to: '/get-involved/membership' },
  { label: 'Volunteering', to: '/get-involved/volunteer' },
  { label: 'Donate', to: '/get-involved/donate' },
  { label: 'Jobs & Opportunities', to: '/get-involved/jobs' },
  { label: 'Partnerships', to: '/get-involved/partnerships' }
];

const ABOUT_LINKS = [
  { label: 'Mission & Vision', to: '/about/mission' },
  { label: 'Our History', to: '/about/history' },
  { label: 'Our Team', to: '/about/team' },
  { label: 'Partners & Funders', to: '/about/partners' },
  { label: 'Annual Reports', to: '/about/reports' }
];

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<MenuKey>(null);
  const [activeDesktopMenu, setActiveDesktopMenu] = useState<MenuKey>(null);

  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const closeMobileMenu = () => {
    setIsOpen(false);
    setOpenDropdown(null);
  };

  const toggleMobileDropdown = (key: Exclude<MenuKey, null>) => {
    setOpenDropdown((prev) => (prev === key ? null : key));
  };

  const handleMouseEnter = (key: Exclude<MenuKey, null>) => {
    setActiveDesktopMenu(key);
  };

  const handleMouseLeave = () => {
    setActiveDesktopMenu(null);
  };

  // Hide/show header on scroll (but keep it visible when mobile menu is open)
  useEffect(() => {
    const controlHeader = () => {
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

    window.addEventListener('scroll', controlHeader, { passive: true });
    return () => window.removeEventListener('scroll', controlHeader);
  }, [lastScrollY, isOpen]);

  // Lock body scroll when mobile menu is open (helps iPhone menu scroll issue)
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [isOpen]);

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 bg-[#1b2b45]/40 backdrop-blur-none text-white shadow-none"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: isVisible ? 0 : -100, opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <div className="container mx-auto px-4">
        {/* Top Row */}
        <div className="relative flex items-center h-20 md:h-24">
          {/* Center Logo (ONLY ONE - all sizes) */}
          <Link
            to="/"
            className="absolute left-1/2 -translate-x-1/2 flex items-center gap-3 z-10"
            aria-label="Home"
            onClick={closeMobileMenu}
          >
            <img
              src="/logo.png"
              alt="YCA Birmingham Logo"
              className="h-10 sm:h-12 md:h-14 w-auto"
            />
            <img
  src="/logo_text.png"
  alt="Yemeni Community Association"
  className="h-8 sm:h-10 md:h-12 w-auto transition-opacity group-hover:opacity-80 duration-300 hidden xl:block"
/>

          </Link>

          {/* Mobile Controls (Right) */}
          <div className="ml-auto flex items-center gap-3 xl:hidden">
            <Link
              to="/get-involved/membership"
              className="hidden sm:inline-flex bg-accent text-primary px-5 py-2 hover:bg-hover transition-colors font-semibold text-xs uppercase tracking-wider whitespace-nowrap"
              onClick={closeMobileMenu}
            >
              Join Now
            </Link>

            <motion.button
              className="text-white"
              onClick={() => setIsOpen((v) => !v)}
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

          {/* Desktop Nav (Right) */}
          <nav className="ml-auto hidden xl:flex items-center gap-5 2xl:gap-8">
            {NAV_LINKS.slice(0, 5).map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="text-sm uppercase tracking-wider whitespace-nowrap hover:text-accent transition-colors"
              >
                {item.label}
              </Link>
            ))}

            {/* Get Involved Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => handleMouseEnter('involved')}
              onMouseLeave={handleMouseLeave}
            >
              <button className="flex items-center gap-1 text-sm uppercase tracking-wider whitespace-nowrap hover:text-accent transition-colors">
                Get Involved{' '}
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-300 ${activeDesktopMenu === 'involved' ? 'rotate-180' : ''}`}
                />
              </button>

              <AnimatePresence>
                {activeDesktopMenu === 'involved' && (
                  <motion.div
                    className="absolute top-full left-0 mt-2 w-64 bg-white text-primary shadow-xl rounded-lg overflow-hidden"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {INVOLVED_LINKS.map((l) => (
                      <Link
                        key={l.to}
                        to={l.to}
                        className="block px-6 py-3 hover:bg-sand transition-colors"
                      >
                        {l.label}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Resources */}
            <Link
              to="/resources"
              className="text-sm uppercase tracking-wider whitespace-nowrap hover:text-accent transition-colors"
            >
              Resources
            </Link>

            {/* About Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => handleMouseEnter('about')}
              onMouseLeave={handleMouseLeave}
            >
              <button className="flex items-center gap-1 text-sm uppercase tracking-wider whitespace-nowrap hover:text-accent transition-colors">
                About{' '}
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-300 ${activeDesktopMenu === 'about' ? 'rotate-180' : ''}`}
                />
              </button>

              <AnimatePresence>
                {activeDesktopMenu === 'about' && (
                  <motion.div
                    className="absolute top-full left-0 mt-2 w-56 bg-white text-primary shadow-xl rounded-lg overflow-hidden"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {ABOUT_LINKS.map((l) => (
                      <Link
                        key={l.to}
                        to={l.to}
                        className="block px-6 py-3 hover:bg-sand transition-colors"
                      >
                        {l.label}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Contact */}
            <Link
              to="/contact"
              className="text-sm uppercase tracking-wider whitespace-nowrap hover:text-accent transition-colors"
            >
              Contact
            </Link>

            {/* Desktop Join */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/get-involved/membership"
                className="bg-accent text-primary px-8 py-2.5 hover:bg-hover transition-colors font-semibold text-sm uppercase tracking-wider whitespace-nowrap"
              >
                Join Now
              </Link>
            </motion.div>
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
              {NAV_LINKS.slice(0, 5).map((item, idx) => (
                <motion.div
                  key={item.to}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 + idx * 0.05 }}
                >
                  <Link
                    to={item.to}
                    onClick={closeMobileMenu}
                    className="block py-2 hover:text-accent transition-colors"
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}

              {/* Get Involved */}
              <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.35 }}>
                <button
                  onClick={() => toggleMobileDropdown('involved')}
                  className="flex items-center justify-between w-full py-2 hover:text-accent transition-colors"
                >
                  Get Involved <ChevronDown size={16} className={`${openDropdown === 'involved' ? 'rotate-180' : ''} transition-transform`} />
                </button>

                <AnimatePresence>
                  {openDropdown === 'involved' && (
                    <motion.div
                      className="pl-4 space-y-2 mt-2"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {INVOLVED_LINKS.map((l) => (
                        <Link key={l.to} to={l.to} onClick={closeMobileMenu} className="block py-1 text-sm">
                          {l.label}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Resources */}
              <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
                <Link to="/resources" onClick={closeMobileMenu} className="block py-2 hover:text-accent transition-colors">
                  Resources
                </Link>
              </motion.div>

              {/* About */}
              <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.45 }}>
                <button
                  onClick={() => toggleMobileDropdown('about')}
                  className="flex items-center justify-between w-full py-2 hover:text-accent transition-colors"
                >
                  About Us <ChevronDown size={16} className={`${openDropdown === 'about' ? 'rotate-180' : ''} transition-transform`} />
                </button>

                <AnimatePresence>
                  {openDropdown === 'about' && (
                    <motion.div
                      className="pl-4 space-y-2 mt-2"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {ABOUT_LINKS.map((l) => (
                        <Link key={l.to} to={l.to} onClick={closeMobileMenu} className="block py-1 text-sm">
                          {l.label}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Contact + Join */}
              <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.5 }}>
                <Link
                  to="/contact"
                  onClick={closeMobileMenu}
                  className="block mt-4 bg-accent text-primary px-6 py-3 rounded-lg hover:bg-hover transition-colors font-semibold text-center whitespace-nowrap"
                >
                  Contact Us
                </Link>

                <Link
                  to="/get-involved/membership"
                  onClick={closeMobileMenu}
                  className="block mt-3 bg-white/10 text-white px-6 py-3 rounded-lg hover:bg-white/15 transition-colors font-semibold text-center whitespace-nowrap"
                >
                  Join Now
                </Link>
              </motion.div>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}
