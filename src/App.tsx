import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSiteSettings } from './contexts/SiteSettingsContext';
import Layout from './components/Layout';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import Services from './pages/Services';
import Programmes from './pages/Programmes';
import ProgrammeDetail from './pages/ProgrammeDetail';
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
import Jobs from './pages/get-involved/Jobs';
import Partnerships from './pages/get-involved/Partnerships';
import BusinessSupport from './pages/get-involved/BusinessSupport';
import Donate from './pages/get-involved/Donate';
import Resources from './pages/Resources';
import ComplaintsSuggestions from './pages/contact/ComplaintsSuggestions';
import ServiceFeedback from './pages/contact/ServiceFeedback';
import BookPage from './pages/book/BookPage';
import BookingTracker from './pages/book/BookingTracker';
import PaymentResult from './pages/PaymentResult';
import UnifiedMembership from './pages/UnifiedMembership';

import { AdminAuthProvider, useAdminAuth } from './contexts/AdminAuthContext';
import { MemberAuthProvider } from './contexts/MemberAuthContext';
import { ContentProvider } from './contexts/ContentContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { SiteSettingsProvider } from './contexts/SiteSettingsContext';
import AdminLogin from './pages/admin/AdminLogin';
import AccessDenied from './pages/admin/AccessDenied';
import ProtectedRoute from './components/admin/ProtectedRoute';
import RequireAdminPermission from './components/admin/RequireAdminPermission';
import ProtectedMemberRoute from './components/member/ProtectedMemberRoute';
import MemberLogin from './pages/member/MemberLogin';
import MemberSignup from './pages/member/MemberSignup';
import AuthCallback from './pages/member/AuthCallback';
import MemberDashboard from './pages/member/MemberDashboard';
import MemberRenewal from './pages/member/MemberRenewal';
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
import ComplaintsManagement from './pages/admin/ComplaintsManagement';
import FeedbackManagement from './pages/admin/FeedbackManagement';
import TranslationsManagement from './pages/admin/TranslationsManagement';
import LegalRequestsManagement from './pages/admin/LegalRequestsManagement';
import BusinessSupportersManagement from './pages/admin/BusinessSupportersManagement';
import FormQuestionsManagement from './pages/admin/FormQuestionsManagement';
import JobPostingsManagement from './pages/admin/JobPostingsManagement';
import WakalaApplicationsManagement from './pages/admin/WakalaApplicationsManagement';

function TranslationRedirect() {
  const { getSetting } = useSiteSettings();
  const enabled = getSetting('translation_enabled', 'false') === 'true';
  return <Navigate to={enabled ? '/book?service=translation' : '/book'} replace />;
}

function AdminIndexRedirect() {
  const { getDefaultRoute } = useAdminAuth();
  return <Navigate to={getDefaultRoute()} replace />;
}

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
                    <Route index element={<AdminIndexRedirect />} />
                    <Route path="access-denied" element={<AccessDenied />} />

                    <Route
                      path="dashboard"
                      element={
                        <RequireAdminPermission permission="dashboard.view">
                          <Dashboard />
                        </RequireAdminPermission>
                      }
                    />

                    <Route
                      path="news"
                      element={
                        <RequireAdminPermission permission="news_events.manage">
                          <NewsManagement />
                        </RequireAdminPermission>
                      }
                    />
                    <Route
                      path="events"
                      element={
                        <RequireAdminPermission permission="news_events.manage">
                          <EventsManagement />
                        </RequireAdminPermission>
                      }
                    />
                    <Route
                      path="event-galleries"
                      element={
                        <RequireAdminPermission permission="news_events.manage">
                          <EventGalleriesManagement />
                        </RequireAdminPermission>
                      }
                    />

                    <Route
                      path="registrations"
                      element={
                        <RequireAdminPermission permission="submissions.view">
                          <RegistrationsManagement />
                        </RequireAdminPermission>
                      }
                    />
                    <Route
                      path="memberships"
                      element={
                        <RequireAdminPermission permission="submissions.view">
                          <MembershipsManagement />
                        </RequireAdminPermission>
                      }
                    />
                    <Route
                      path="membership-expiry"
                      element={
                        <RequireAdminPermission permission="submissions.view">
                          <MembershipExpiryMonitoring />
                        </RequireAdminPermission>
                      }
                    />
                    <Route
                      path="volunteers"
                      element={
                        <RequireAdminPermission permission="submissions.view">
                          <VolunteersManagement />
                        </RequireAdminPermission>
                      }
                    />
                    <Route
                      path="partnerships"
                      element={
                        <RequireAdminPermission permission="submissions.view">
                          <PartnershipsManagement />
                        </RequireAdminPermission>
                      }
                    />
                    <Route
                      path="contacts"
                      element={
                        <RequireAdminPermission permission="submissions.view">
                          <ContactsManagement />
                        </RequireAdminPermission>
                      }
                    />
                    <Route
                      path="donations"
                      element={
                        <RequireAdminPermission permission="submissions.view">
                          <DonationsManagement />
                        </RequireAdminPermission>
                      }
                    />
                    <Route
                      path="subscribers"
                      element={
                        <RequireAdminPermission permission="submissions.view">
                          <SubscribersManagement />
                        </RequireAdminPermission>
                      }
                    />
                    <Route
                      path="complaints"
                      element={
                        <RequireAdminPermission permission="submissions.view">
                          <ComplaintsManagement />
                        </RequireAdminPermission>
                      }
                    />
                    <Route
                      path="feedback"
                      element={
                        <RequireAdminPermission permission="submissions.view">
                          <FeedbackManagement />
                        </RequireAdminPermission>
                      }
                    />
                    <Route
                      path="business-supporters"
                      element={
                        <RequireAdminPermission permission="submissions.view">
                          <BusinessSupportersManagement />
                        </RequireAdminPermission>
                      }
                    />

                    <Route
                      path="hero"
                      element={
                        <RequireAdminPermission permission="content.manage">
                          <HeroManagement />
                        </RequireAdminPermission>
                      }
                    />
                    <Route
                      path="team"
                      element={
                        <RequireAdminPermission permission="content.manage">
                          <TeamManagement />
                        </RequireAdminPermission>
                      }
                    />
                    <Route
                      path="services"
                      element={
                        <RequireAdminPermission permission="content.manage">
                          <ServicesManagement />
                        </RequireAdminPermission>
                      }
                    />
                    <Route
                      path="programmes"
                      element={
                        <RequireAdminPermission permission="content.manage">
                          <ProgrammesManagement />
                        </RequireAdminPermission>
                      }
                    />
                    <Route
                      path="resources"
                      element={
                        <RequireAdminPermission permission="content.manage">
                          <ResourcesManagement />
                        </RequireAdminPermission>
                      }
                    />
                    <Route
                      path="content"
                      element={
                        <RequireAdminPermission permission="content.manage">
                          <ContentManagement />
                        </RequireAdminPermission>
                      }
                    />
                    <Route
                      path="page-images"
                      element={
                        <RequireAdminPermission permission="content.manage">
                          <PageImagesManagement />
                        </RequireAdminPermission>
                      }
                    />

                    <Route
                      path="availability"
                      element={
                        <RequireAdminPermission permission="availability.manage">
                          <AvailabilityManagement />
                        </RequireAdminPermission>
                      }
                    />
                    <Route
                      path="wakala-applications"
                      element={
                        <RequireAdminPermission permission="wakala.manage">
                          <WakalaApplicationsManagement />
                        </RequireAdminPermission>
                      }
                    />
                    <Route
                      path="translations"
                      element={
                        <RequireAdminPermission permission="legal.manage">
                          <TranslationsManagement />
                        </RequireAdminPermission>
                      }
                    />
                    <Route
                      path="legal-requests"
                      element={
                        <RequireAdminPermission permission="legal.manage">
                          <LegalRequestsManagement />
                        </RequireAdminPermission>
                      }
                    />

                    <Route
                      path="admins"
                      element={
                        <RequireAdminPermission permission="admin.manage">
                          <AdminManagement />
                        </RequireAdminPermission>
                      }
                    />

                    <Route
                      path="form-questions"
                      element={
                        <RequireAdminPermission permission="settings.manage">
                          <FormQuestionsManagement />
                        </RequireAdminPermission>
                      }
                    />
                    <Route
                      path="job-postings"
                      element={
                        <RequireAdminPermission permission="content.manage">
                          <JobPostingsManagement />
                        </RequireAdminPermission>
                      }
                    />
                    <Route
                      path="settings"
                      element={
                        <RequireAdminPermission permission="settings.manage">
                          <Settings />
                        </RequireAdminPermission>
                      }
                    />
                  </Routes>
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route path="/member/membership/apply" element={<Navigate to="/membership" replace />} />
          <Route path="/member/choose-membership" element={<Navigate to="/membership" replace />} />

          <Route
            path="/member/renew"
            element={
              <ProtectedMemberRoute allowExpired>
                <MemberRenewal />
              </ProtectedMemberRoute>
            }
          />

          <Route
            path="/member/*"
            element={
              <ProtectedMemberRoute>
                <Routes>
                  <Route path="dashboard" element={<MemberDashboard />} />
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
                <Route path="/programmes/:id" element={<ProgrammeDetail />} />


                <Route path="/events" element={<Events />} />
                <Route path="/event-gallery/:id" element={<EventGallery />} />
                <Route path="/news" element={<News />} />
                <Route path="/news/:id" element={<NewsDetail />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/contact/complaints" element={<ComplaintsSuggestions />} />
                <Route path="/contact/feedback" element={<ServiceFeedback />} />

                <Route path="/about/mission" element={<Mission />} />
                <Route path="/about/history" element={<History />} />
                <Route path="/about/team" element={<Team />} />
                <Route path="/about/partners" element={<Partners />} />
                <Route path="/about/reports" element={<Reports />} />

                <Route path="/get-involved/membership" element={<Navigate to="/membership" replace />} />
                <Route path="/get-involved/volunteer" element={<Volunteer />} />
                <Route path="/get-involved/jobs" element={<Jobs />} />
                <Route path="/get-involved/partnerships" element={<Partnerships />} />
                <Route path="/get-involved/business-support" element={<BusinessSupport />} />
                <Route path="/get-involved/donate" element={<Donate />} />

                <Route path="/services/legal" element={<Navigate to="/book" replace />} />
                <Route path="/services/legal/translation" element={<TranslationRedirect />} />
                <Route path="/services/legal/other" element={<Navigate to="/book?service=other" replace />} />

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
