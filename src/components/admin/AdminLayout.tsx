import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Calendar,
  Users,
  Type,
  Heart,
  Mail,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Newspaper,
  UserCheck,
  Briefcase,
  HandHeart,
  MessageSquare,
  Image,
  Layers,
  BookOpen,
  FolderOpen,
  Award,
  PanelLeftClose,
  PanelLeftOpen,
  ExternalLink,
  ChevronLeft,
  Shield,
} from 'lucide-react';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { useSiteSettings } from '../../contexts/SiteSettingsContext';

interface AdminLayoutProps {
  children: React.ReactNode;
}

interface MenuSection {
  title: string;
  icon: typeof LayoutDashboard;
  items: { icon: typeof LayoutDashboard; label: string; path: string }[];
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { adminData, signOut, hasPermission } = useAdminAuth();
  const { getSetting } = useSiteSettings();

  useEffect(() => {
    menuSections.forEach((section) => {
      const hasActiveItem = section.items.some((item) => location.pathname === item.path);
      if (hasActiveItem) {
        setExpandedSections((prev) => ({ ...prev, [section.title]: true }));
      }
    });
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/admin/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const toggleSection = (title: string) => {
    setExpandedSections((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const operationsItems = [
    ...(hasPermission('availability.manage') ? [{ icon: Calendar, label: 'Availability', path: '/admin/availability' }] : []),
    ...(hasPermission('wakala.manage') ? [{ icon: FileText, label: 'Wakala Applications', path: '/admin/wakala' }] : []),
    ...(hasPermission('admin.manage') ? [{ icon: Shield, label: 'Admin Management', path: '/admin/admins' }] : []),
    ...(hasPermission('settings.manage') ? [{ icon: Settings, label: 'Settings', path: '/admin/settings' }] : []),
  ];

  const menuSections: MenuSection[] = [
    ...(hasPermission('content.manage') ? [{
      title: 'Content',
      icon: Type,
      items: [
        { icon: Type, label: 'Page Content', path: '/admin/content' },
        { icon: Image, label: 'Hero Section', path: '/admin/hero' },
        { icon: Image, label: 'Page Images', path: '/admin/page-images' },
        { icon: Users, label: 'Team Members', path: '/admin/team' },
        { icon: Layers, label: 'Services', path: '/admin/services' },
        { icon: BookOpen, label: 'Programmes', path: '/admin/programmes' },
        { icon: FolderOpen, label: 'Resources', path: '/admin/resources' },
      ],
    }] : []),
    ...(hasPermission('news_events.manage') ? [{
      title: 'News & Events',
      icon: Calendar,
      items: [
        { icon: Newspaper, label: 'News', path: '/admin/news' },
        { icon: Calendar, label: 'Events', path: '/admin/events' },
        { icon: Award, label: 'Event Galleries', path: '/admin/event-galleries' },
      ],
    }] : []),
    ...(hasPermission('submissions.view') ? [{
      title: 'Submissions',
      icon: Users,
      items: [
        { icon: Users, label: 'Event Registrations', path: '/admin/registrations' },
        { icon: UserCheck, label: 'Memberships', path: '/admin/memberships' },
        { icon: HandHeart, label: 'Volunteers', path: '/admin/volunteers' },
        { icon: Briefcase, label: 'Partnerships', path: '/admin/partnerships' },
        { icon: MessageSquare, label: 'Messages', path: '/admin/contacts' },
        { icon: Heart, label: 'Donations', path: '/admin/donations' },
        { icon: Mail, label: 'Subscribers', path: '/admin/subscribers' },
      ],
    }] : []),
    ...(operationsItems.length > 0 ? [{
      title: 'Operations',
      icon: Settings,
      items: operationsItems,
    }] : []),
  ];

  const getPageTitle = () => {
    for (const section of menuSections) {
      for (const item of section.items) {
        if (location.pathname === item.path) return item.label;
      }
    }
    if (location.pathname === '/admin/dashboard') return 'Dashboard';
    return 'Admin';
  };

  const getPageSection = () => {
    for (const section of menuSections) {
      for (const item of section.items) {
        if (location.pathname === item.path) return section.title;
      }
    }
    return null;
  };

  const getPageIcon = () => {
    for (const section of menuSections) {
      for (const item of section.items) {
        if (location.pathname === item.path) return item.icon;
      }
    }
    if (location.pathname === '/admin/dashboard') return LayoutDashboard;
    return LayoutDashboard;
  };

  const initials = adminData?.full_name
    ? adminData.full_name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'AD';

  const sidebarWidth = sidebarCollapsed ? 'w-[72px]' : 'w-64';

  const renderSidebarContent = (isMobile = false) => (
    <nav className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
        <Link
          to="/admin/dashboard"
          onClick={() => isMobile && setMobileMenuOpen(false)}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
            location.pathname === '/admin/dashboard'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <LayoutDashboard className="w-5 h-5 flex-shrink-0" />
          {(!sidebarCollapsed || isMobile) && (
            <span className="text-sm font-medium">Dashboard</span>
          )}
        </Link>

        <div className="pt-2">
          {menuSections.map((section) => {
            const isExpanded = expandedSections[section.title] ?? false;
            const SectionIcon = section.icon;
            const hasActiveItem = section.items.some(
              (item) => location.pathname === item.path
            );

            if (sidebarCollapsed && !isMobile) {
              return (
                <div key={section.title} className="space-y-1 mb-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        title={item.label}
                        className={`flex items-center justify-center p-2.5 rounded-lg transition-all duration-200 ${
                          isActive
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </Link>
                    );
                  })}
                </div>
              );
            }

            return (
              <div key={section.title} className="mb-1">
                <button
                  onClick={() => toggleSection(section.title)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-200 ${
                    hasActiveItem
                      ? 'text-emerald-700 bg-emerald-50/60'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <SectionIcon className="w-4 h-4" />
                    <span className="text-xs font-semibold uppercase tracking-wider">
                      {section.title}
                    </span>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5" />
                  )}
                </button>

                <div
                  className={`overflow-hidden transition-all duration-200 ease-in-out ${
                    isExpanded ? 'max-h-[500px] opacity-100 mt-1' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="space-y-0.5 pl-2">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = location.pathname === item.path;
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={() => isMobile && setMobileMenuOpen(false)}
                          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                            isActive
                              ? 'bg-emerald-600 text-white shadow-sm'
                              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                          }`}
                        >
                          <Icon className="w-4 h-4 flex-shrink-0" />
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="border-t border-slate-200 p-3 space-y-1">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-all duration-200"
        >
          <ExternalLink className="w-4 h-4 flex-shrink-0" />
          {(!sidebarCollapsed || isMobile) && <span>View Site</span>}
        </a>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 hover:text-red-700 transition-all duration-200"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {(!sidebarCollapsed || isMobile) && <span>Sign Out</span>}
        </button>
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200/80 fixed top-0 left-0 right-0 z-30 h-14">
        <div className="flex items-center justify-between h-full px-3 lg:px-5">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors lg:hidden"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-slate-600" />
              ) : (
                <Menu className="w-5 h-5 text-slate-600" />
              )}
            </button>

            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden lg:flex p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600"
              title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {sidebarCollapsed ? (
                <PanelLeftOpen className="w-[18px] h-[18px]" />
              ) : (
                <PanelLeftClose className="w-[18px] h-[18px]" />
              )}
            </button>

            <div className="hidden lg:block w-px h-5 bg-slate-200 mx-1" />

            <div className="flex items-center gap-2">
              <img
                src={getSetting('site_logo', '/logo.png')}
                alt="Logo"
                className="h-7 w-auto"
              />
              <div className="hidden sm:flex items-center gap-1.5 text-sm">
                <span className="font-semibold text-slate-800">
                  {getSetting('org_name_en', 'YCA Birmingham')}
                </span>
                {getPageSection() && (
                  <>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                    <span className="text-slate-400">{getPageSection()}</span>
                  </>
                )}
                <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                <span className="text-slate-600 font-medium">{getPageTitle()}</span>
              </div>
              <span className="sm:hidden text-sm font-semibold text-slate-800">{getPageTitle()}</span>
            </div>
          </div>

          <div className="flex items-center gap-2" ref={userMenuRef}>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              View Site
            </a>

            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2.5 p-1.5 pr-3 rounded-lg hover:bg-slate-50 transition-all"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-[11px] font-bold shadow-sm">
                  {initials}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-[13px] font-semibold text-slate-700 leading-tight">
                    {adminData?.full_name || 'Admin'}
                  </p>
                  <p className="text-[10px] text-slate-400 leading-tight capitalize">
                    {adminData?.role || 'Administrator'}
                  </p>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 hidden md:block transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-56 bg-white rounded-xl border border-slate-200 shadow-lg shadow-slate-200/50 py-1.5 z-50">
                  <div className="px-3.5 py-2.5 border-b border-slate-100">
                    <p className="text-sm font-semibold text-slate-800">{adminData?.full_name || 'Admin'}</p>
                    <p className="text-xs text-slate-400 capitalize">{adminData?.role || 'Administrator'}</p>
                  </div>
                  <div className="py-1">
                    <Link
                      to="/admin/settings"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3.5 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                      <Settings className="w-4 h-4 text-slate-400" />
                      Settings
                    </Link>
                    <a
                      href="/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2.5 px-3.5 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors md:hidden"
                    >
                      <ExternalLink className="w-4 h-4 text-slate-400" />
                      View Site
                    </a>
                  </div>
                  <div className="border-t border-slate-100 pt-1">
                    <button
                      onClick={() => { setUserMenuOpen(false); handleSignOut(); }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <aside
        className={`fixed top-14 left-0 bottom-0 ${sidebarWidth} bg-white border-r border-slate-200/80 transition-all duration-300 ease-in-out z-20 hidden lg:flex flex-col`}
      >
        {renderSidebarContent()}
      </aside>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="absolute top-14 left-0 bottom-0 w-72 bg-white border-r border-slate-200 shadow-xl flex flex-col">
            {renderSidebarContent(true)}
          </aside>
        </div>
      )}

      <main
        className={`pt-14 transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? 'lg:pl-[72px]' : 'lg:pl-64'
        }`}
      >
        <div className="p-4 lg:p-6 max-w-[1600px]">{children}</div>
      </main>
    </div>
  );
}
