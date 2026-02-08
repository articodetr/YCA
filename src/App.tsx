import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import Services from './pages/Services';
import Programmes from './pages/Programmes';
import WomenProgramme from './pages/programmes/WomenProgramme';
import ElderlyProgramme from './pages/programmes/ElderlyProgramme';
import YouthProgramme from './pages/programmes/YouthProgramme';
import ChildrenProgramme from './pages/programmes/ChildrenProgramme';
import MenProgramme from './pages/programmes/MenProgramme';
import JourneyWithinProgramme from './pages/programmes/JourneyWithinProgramme';
import Events from './pages/Events';
import EventGallery from './pages/EventGallery';
import News from './pages/News';
import NewsDetail from './pages/NewsDetail';
import Contact from './pages/Contact';
import Mission from './pages/about/Mission';
import History from './pages/about/History';
import Team from './pages/about/Team';
import Partners from './pages/about/Partners';
import Reports from './pages/about/Reports';
import Volunteer from './pages/get-involved/Volunteer';
import Donate from './pages/get-involved/Donate';
import Jobs from './pages/get-involved/Jobs';
import Partnerships from './pages/get-involved/Partnerships';
import Resources from './pages/Resources';
import BookPage from './pages/book/BookPage';
import BookingTracker from './pages/book/BookingTracker';
import PaymentResult from './pages/PaymentResult';
import UnifiedMembership from './pages/UnifiedMembership';

import { AdminAuthProvider } from './contexts/AdminAuthContext';
import { MemberAuthProvider } from './contexts/MemberAuthContext';
import { ContentProvider } from './contexts/ContentContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { SiteSettingsProvider } from './contexts/SiteSettingsContext';
import AdminLogin from './pages/admin/AdminLogin';
import ProtectedRoute from './components/admin/ProtectedRoute';
import ProtectedMemberRoute from './components/member/ProtectedMemberRoute';
import MemberLogin from './pages/member/MemberLogin';
import MemberSignup from './pages/member/MemberSignup';
import AuthCallback from './pages/member/AuthCallback';
import MemberDashboard from './pages/member/MemberDashboard';
import WakalaApplication from './pages/member/WakalaApplication';
import MemberPayment from './pages/member/MemberPayment';
import AdminLayout from './components/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import NewsManagement from './pages/admin/NewsManagement';
import EventsManagement from './pages/admin/EventsManagement';
import RegistrationsManagement from './pages/admin/RegistrationsManagement';
import MembershipsManagement from './pages/admin/MembershipsManagement';
import VolunteersManagement from './pages/admin/VolunteersManagement';
import PartnershipsManagement from './pages/admin/PartnershipsManagement';
import ContactsManagement from './pages/admin/ContactsManagement';
import DonationsManagement from './pages/admin/DonationsManagement';
import SubscribersManagement from './pages/admin/SubscribersManagement';
import WakalaManagement from './pages/admin/WakalaManagement';
import Settings from './pages/admin/Settings';
import HeroManagement from './pages/admin/HeroManagement';
import TeamManagement from './pages/admin/TeamManagement';
import ServicesManagement from './pages/admin/ServicesManagement';
import ProgrammesManagement from './pages/admin/ProgrammesManagement';
import ResourcesManagement from './pages/admin/ResourcesManagement';
import EventGalleriesManagement from './pages/admin/EventGalleriesManagement';
import ContentManagement from './pages/admin/ContentManagement';
import AvailabilityManagement from './pages/admin/AvailabilityManagement';
import PageImagesManagement from './pages/admin/PageImagesManagement';
import AdminManagement from './pages/admin/AdminManagement';
import MembershipExpiryMonitoring from './pages/admin/MembershipExpiryMonitoring';

function App() {
  return (
    <LanguageProvider>
      <AdminAuthProvider>
        <MemberAuthProvider>
          <SiteSettingsProvider>
          <ContentProvider>
            <Router>
            <ScrollToTop />
            <Routes>
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/member/login" element={<MemberLogin />} />
            <Route path="/member/signup" element={<MemberSignup />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/membership" element={<UnifiedMembership />} />
            <Route path="/book" element={<BookPage />} />
            <Route path="/book/track" element={<BookingTracker />} />
            <Route path="/payment/result" element={<PaymentResult />} />
            <Route path="/apply" element={<BookPage />} />

          <Route
            path="/admin/*"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <Routes>
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="news" element={<NewsManagement />} />
                    <Route path="events" element={<EventsManagement />} />
                    <Route path="event-galleries" element={<EventGalleriesManagement />} />
                    <Route path="registrations" element={<RegistrationsManagement />} />
                    <Route path="memberships" element={<MembershipsManagement />} />
                    <Route path="membership-expiry" element={<MembershipExpiryMonitoring />} />
                    <Route path="wakala" element={<WakalaManagement />} />
                    <Route path="volunteers" element={<VolunteersManagement />} />
                    <Route path="partnerships" element={<PartnershipsManagement />} />
                    <Route path="contacts" element={<ContactsManagement />} />
                    <Route path="donations" element={<DonationsManagement />} />
                    <Route path="subscribers" element={<SubscribersManagement />} />
                    <Route path="hero" element={<HeroManagement />} />
                    <Route path="team" element={<TeamManagement />} />
                    <Route path="services" element={<ServicesManagement />} />
                    <Route path="programmes" element={<ProgrammesManagement />} />
                    <Route path="resources" element={<ResourcesManagement />} />
                    <Route path="content" element={<ContentManagement />} />
                    <Route path="page-images" element={<PageImagesManagement />} />
                    <Route path="availability" element={<AvailabilityManagement />} />
                    <Route path="admins" element={<AdminManagement />} />
                    <Route path="settings" element={<Settings />} />
                  </Routes>
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route path="/member/membership/apply" element={<Navigate to="/membership" replace />} />
          <Route path="/member/choose-membership" element={<Navigate to="/membership" replace />} />

          <Route
            path="/member/*"
            element={
              <ProtectedMemberRoute>
                <Routes>
                  <Route path="dashboard" element={<MemberDashboard />} />
                  <Route path="wakala/apply" element={<WakalaApplication />} />
                  <Route path="payment" element={<MemberPayment />} />
                </Routes>
              </ProtectedMemberRoute>
            }
          />

          <Route path="*" element={
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/services" element={<Services />} />

                <Route path="/programmes" element={<Programmes />} />
                <Route path="/programmes/women" element={<WomenProgramme />} />
                <Route path="/programmes/elderly" element={<ElderlyProgramme />} />
                <Route path="/programmes/youth" element={<YouthProgramme />} />
                <Route path="/programmes/children" element={<ChildrenProgramme />} />
                <Route path="/programmes/men" element={<MenProgramme />} />
                <Route path="/programmes/journey-within" element={<JourneyWithinProgramme />} />

                <Route path="/events" element={<Events />} />
                <Route path="/event-gallery/:id" element={<EventGallery />} />
                <Route path="/news" element={<News />} />
                <Route path="/news/:id" element={<NewsDetail />} />
                <Route path="/contact" element={<Contact />} />

                <Route path="/about/mission" element={<Mission />} />
                <Route path="/about/history" element={<History />} />
                <Route path="/about/team" element={<Team />} />
                <Route path="/about/partners" element={<Partners />} />
                <Route path="/about/reports" element={<Reports />} />

                <Route path="/get-involved/membership" element={<Navigate to="/membership" replace />} />
                <Route path="/get-involved/volunteer" element={<Volunteer />} />
                <Route path="/get-involved/donate" element={<Donate />} />
                <Route path="/get-involved/jobs" element={<Jobs />} />
                <Route path="/get-involved/partnerships" element={<Partnerships />} />

                <Route path="/resources" element={<Resources />} />
              </Routes>
            </Layout>
          } />
          </Routes>
          </Router>
          </ContentProvider>
          </SiteSettingsProvider>
        </MemberAuthProvider>
      </AdminAuthProvider>
    </LanguageProvider>
  );
}

export default App;
