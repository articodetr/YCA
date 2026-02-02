import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Header() {
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
  }, [lastScrollY]);

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
                src="/logo.png"
                alt="YCA Birmingham Logo"
                className="h-10 sm:h-12 md:h-14 lg:h-16 w-auto transition-transform group-hover:scale-105 duration-300"
              />
              <img
                src="/logo_text.png"
                alt="Yemeni Community Association"
                className="h-8 sm:h-10 md:h-12 w-auto transition-opacity group-hover:opacity-80 duration-300 hidden md:block"
              />
            </div>
          </Link>
          {/* Mobile Center Text Logo */}
<div className="absolute left-1/2 -translate-x-1/2 xl:hidden flex items-center justify-center pointer-events-none">
  <img
    src="/logo_text.png"
    alt="الجالية اليمنية"
    className="h-7 sm:h-8 w-auto opacity-95"
  />
</div>


          {/* Mobile Controls (Join Now + Hamburger) */}
          <div className="flex items-center gap-3 xl:hidden flex-shrink-0">
            <Link
              to="/get-involved/membership"
              className="hidden sm:inline-flex bg-accent text-primary px-5 py-2 hover:bg-hover transition-colors font-semibold text-xs uppercase tracking-wider whitespace-nowrap"
            >
              Join Now
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
              Home
            </Link>
            <Link to="/services" className="text-sm uppercase tracking-wider whitespace-nowrap hover:text-accent transition-colors">
              Services
            </Link>
            <Link to="/programmes" className="text-sm uppercase tracking-wider whitespace-nowrap hover:text-accent transition-colors">
              Programmes
            </Link>
            <Link to="/events" className="text-sm uppercase tracking-wider whitespace-nowrap hover:text-accent transition-colors">
              Events
            </Link>
            <Link to="/news" className="text-sm uppercase tracking-wider whitespace-nowrap hover:text-accent transition-colors">
              News
            </Link>

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
                    <Link to="/get-involved/membership" className="block px-6 py-3 hover:bg-sand transition-colors">
                      Become a Member
                    </Link>
                    <Link to="/get-involved/volunteer" className="block px-6 py-3 hover:bg-sand transition-colors">
                      Volunteering
                    </Link>
                    <Link to="/get-involved/donate" className="block px-6 py-3 hover:bg-sand transition-colors">
                      Donate
                    </Link>
                    <Link to="/get-involved/jobs" className="block px-6 py-3 hover:bg-sand transition-colors">
                      Jobs & Opportunities
                    </Link>
                    <Link to="/get-involved/partnerships" className="block px-6 py-3 hover:bg-sand transition-colors">
                      Partnerships
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link to="/resources" className="text-sm uppercase tracking-wider whitespace-nowrap hover:text-accent transition-colors">
              Resources
            </Link>

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
                    <Link to="/about/mission" className="block px-6 py-3 hover:bg-sand transition-colors">
                      Mission & Vision
                    </Link>
                    <Link to="/about/history" className="block px-6 py-3 hover:bg-sand transition-colors">
                      Our History
                    </Link>
                    <Link to="/about/team" className="block px-6 py-3 hover:bg-sand transition-colors">
                      Our Team
                    </Link>
                    <Link to="/about/partners" className="block px-6 py-3 hover:bg-sand transition-colors">
                      Partners & Funders
                    </Link>
                    <Link to="/about/reports" className="block px-6 py-3 hover:bg-sand transition-colors">
                      Annual Reports
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link to="/contact" className="text-sm uppercase tracking-wider whitespace-nowrap hover:text-accent transition-colors">
              Contact
            </Link>

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
  className="xl:hidden pb-6 space-y-2 bg-[#0b1424]/90 backdrop-blur-md rounded-b-2xl px-4 pt-4"
  initial={{ height: 0, opacity: 0 }}
  animate={{ height: 'auto', opacity: 1 }}
  exit={{ height: 0, opacity: 0 }}
  transition={{ duration: 0.3 }}
>

              <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
                <Link to="/" onClick={() => setIsOpen(false)} className="block py-2 hover:text-accent transition-colors">
                  Home
                </Link>
              </motion.div>

              <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.15 }}>
                <Link to="/services" onClick={() => setIsOpen(false)} className="block py-2 hover:text-accent transition-colors">
                  Services
                </Link>
              </motion.div>

              <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
                <Link to="/programmes" onClick={() => setIsOpen(false)} className="block py-2 hover:text-accent transition-colors">
                  Programmes
                </Link>
              </motion.div>

              <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.25 }}>
                <Link to="/events" onClick={() => setIsOpen(false)} className="block py-2 hover:text-accent transition-colors">
                  Events
                </Link>
              </motion.div>

              <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
                <Link to="/news" onClick={() => setIsOpen(false)} className="block py-2 hover:text-accent transition-colors">
                  News
                </Link>
              </motion.div>

              <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.35 }}>
                <button
                  onClick={() => toggleDropdown('involved')}
                  className="flex items-center justify-between w-full py-2 hover:text-accent transition-colors"
                >
                  Get Involved <ChevronDown size={16} />
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
                      <Link to="/get-involved/membership" onClick={() => setIsOpen(false)} className="block py-1 text-sm">
                        Become a Member
                      </Link>
                      <Link to="/get-involved/volunteer" onClick={() => setIsOpen(false)} className="block py-1 text-sm">
                        Volunteering
                      </Link>
                      <Link to="/get-involved/donate" onClick={() => setIsOpen(false)} className="block py-1 text-sm">
                        Donate
                      </Link>
                      <Link to="/get-involved/jobs" onClick={() => setIsOpen(false)} className="block py-1 text-sm">
                        Jobs & Opportunities
                      </Link>
                      <Link to="/get-involved/partnerships" onClick={() => setIsOpen(false)} className="block py-1 text-sm">
                        Partnerships
                      </Link>

                      {/* Mobile Join Now inside dropdown (optional but useful) */}
                      <Link
                        to="/get-involved/membership"
                        onClick={() => setIsOpen(false)}
                        className="inline-flex mt-2 bg-accent text-primary px-4 py-2 rounded-md hover:bg-hover transition-colors font-semibold text-xs uppercase tracking-wider whitespace-nowrap"
                      >
                        Join Now
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
                <Link to="/resources" onClick={() => setIsOpen(false)} className="block py-2 hover:text-accent transition-colors">
                  Resources
                </Link>
              </motion.div>

              <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.45 }}>
                <button
                  onClick={() => toggleDropdown('about')}
                  className="flex items-center justify-between w-full py-2 hover:text-accent transition-colors"
                >
                  About Us <ChevronDown size={16} />
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
                      <Link to="/about/mission" onClick={() => setIsOpen(false)} className="block py-1 text-sm">
                        Mission & Vision
                      </Link>
                      <Link to="/about/history" onClick={() => setIsOpen(false)} className="block py-1 text-sm">
                        Our History
                      </Link>
                      <Link to="/about/team" onClick={() => setIsOpen(false)} className="block py-1 text-sm">
                        Our Team
                      </Link>
                      <Link to="/about/partners" onClick={() => setIsOpen(false)} className="block py-1 text-sm">
                        Partners & Funders
                      </Link>
                      <Link to="/about/reports" onClick={() => setIsOpen(false)} className="block py-1 text-sm">
                        Annual Reports
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
                  Contact Us
                </Link>

                {/* Mobile Join Now button (always visible in menu) */}
                <Link
                  to="/get-involved/membership"
                  onClick={() => setIsOpen(false)}
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
