import { useState } from 'react';
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
  Newspaper,
  UserCheck,
  Briefcase,
  HandHeart,
  MessageSquare,
  Image,
  Layers,
  BookOpen,
  FolderOpen,
  Building,
  Award,
} from 'lucide-react';
import { useAdminAuth } from '../../contexts/AdminAuthContext';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { adminData, signOut } = useAdminAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/admin/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const menuSections = [
    {
      title: 'Main',
      items: [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
      ]
    },
    {
      title: 'Content Management',
      items: [
        { icon: Type, label: 'Page Content', path: '/admin/content' },
        { icon: Image, label: 'Hero Section', path: '/admin/hero' },
        { icon: Users, label: 'Team Members', path: '/admin/team' },
        { icon: Layers, label: 'Services', path: '/admin/services' },
        { icon: BookOpen, label: 'Programmes', path: '/admin/programmes' },
        { icon: FolderOpen, label: 'Resources', path: '/admin/resources' },
        { icon: Newspaper, label: 'News', path: '/admin/news' },
        { icon: Calendar, label: 'Events', path: '/admin/events' },
        { icon: Award, label: 'Event Galleries', path: '/admin/event-galleries' },
      ]
    },
    {
      title: 'User Submissions',
      items: [
        { icon: Users, label: 'Event Registrations', path: '/admin/registrations' },
        { icon: UserCheck, label: 'Membership Applications', path: '/admin/memberships' },
        { icon: FileText, label: 'Wakala Applications', path: '/admin/wakala' },
        { icon: HandHeart, label: 'Volunteer Applications', path: '/admin/volunteers' },
        { icon: Briefcase, label: 'Partnership Requests', path: '/admin/partnerships' },
        { icon: MessageSquare, label: 'Contact Messages', path: '/admin/contacts' },
        { icon: Heart, label: 'Donations', path: '/admin/donations' },
        { icon: Mail, label: 'Newsletter Subscribers', path: '/admin/subscribers' },
      ]
    },
    {
      title: 'System',
      items: [
        { icon: Calendar, label: 'Availability Management', path: '/admin/availability' },
        { icon: Settings, label: 'Settings', path: '/admin/settings' },
      ]
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-30">
        <div className="flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors lg:block hidden"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors lg:hidden"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-gray-600" />
              ) : (
                <Menu className="w-5 h-5 text-gray-600" />
              )}
            </button>
            <div className="flex items-center gap-2">
              <img
                src="/logo.png"
                alt="YCA Birmingham"
                className="h-10 w-auto"
              />
              <div className="border-l border-gray-300 h-8 mx-2"></div>
              <h1 className="text-lg font-bold text-gray-900">Admin Panel</h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{adminData?.full_name || 'Admin'}</p>
                <p className="text-xs text-gray-500">{adminData?.role || 'Administrator'}</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar - Desktop */}
      <aside
        className={`fixed top-16 left-0 bottom-0 bg-white border-r border-gray-200 transition-all duration-300 z-20 hidden lg:block ${
          sidebarOpen ? 'w-64' : 'w-0'
        }`}
      >
        <nav className="p-4 space-y-4 overflow-y-auto h-full">
          {menuSections.map((section, sectionIdx) => (
            <div key={sectionIdx}>
              <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                {section.title}
              </h3>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-emerald-50 text-emerald-700 font-medium'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <span className="whitespace-nowrap">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      {/* Sidebar - Mobile */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="absolute top-16 left-0 bottom-0 w-64 bg-white border-r border-gray-200">
            <nav className="p-4 space-y-4 overflow-y-auto h-full">
              {menuSections.map((section, sectionIdx) => (
                <div key={sectionIdx}>
                  <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    {section.title}
                  </h3>
                  <div className="space-y-1">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = location.pathname === item.path;
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                            isActive
                              ? 'bg-emerald-50 text-emerald-700 font-medium'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <Icon className="w-5 h-5 flex-shrink-0" />
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main
        className={`pt-16 transition-all duration-300 ${
          sidebarOpen ? 'lg:pl-64' : 'lg:pl-0'
        }`}
      >
        <div className="p-4 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
