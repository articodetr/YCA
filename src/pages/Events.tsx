import { Calendar, MapPin, Clock, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageHeader from '../components/PageHeader';
import EventRegistrationModal from '../components/EventRegistrationModal';
import PaidEventRegistrationModal from '../components/PaidEventRegistrationModal';
import AddToCalendar from '../components/AddToCalendar';
import { fadeInUp, staggerContainer, staggerItem, scaleIn } from '../lib/animations';
import { supabase } from '../lib/supabase';
import { useContent } from '../contexts/ContentContext';

interface Event {
  id: string;
  title: string;
  title_ar?: string;
  description: string;
  description_ar?: string;
  date: string;
  time: string;
  location: string;
  location_ar?: string;
  category: string;
  image_url: string | null;
  is_featured: boolean;
  is_paid_event?: boolean;
  ticket_price_adult?: number;
  ticket_price_child?: number | null;
  ticket_price_member?: number | null;
  max_capacity?: number | null;
  current_registrations?: number;
}

export default function Events() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [pastEvents, setPastEvents] = useState<Event[]>([]);
  const [featuredEvent, setFeaturedEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPaidModalOpen, setIsPaidModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<{ id: string; title: string } | null>(null);
  const [selectedPaidEvent, setSelectedPaidEvent] = useState<Event | null>(null);

  const { getContent } = useContent();
  const c = (key: string, fallback: string) => getContent('events', key, fallback);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true });

      if (error) throw error;

      const upcoming = data?.filter((event: Event) => event.date >= today) || [];
      const past = data?.filter((event: Event) => event.date < today) || [];
      const featured = data?.find((event: Event) => event.is_featured && event.date >= today) || null;

      setUpcomingEvents(upcoming);
      setPastEvents(past.slice(0, 3));
      setFeaturedEvent(featured);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to load events. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Calendar helper functions
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1).getDay();
  };

  const getEventDates = () => {
    return upcomingEvents
      .filter(event => {
        const eventDate = new Date(event.date);
        return eventDate.getMonth() === currentDate.getMonth() &&
               eventDate.getFullYear() === currentDate.getFullYear();
      })
      .map(event => new Date(event.date).getDate());
  };

  const changeMonth = (direction: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
  };

  const openRegistrationModal = (event: Event) => {
    if (event.is_paid_event && event.ticket_price_adult) {
      setSelectedPaidEvent(event);
      setIsPaidModalOpen(true);
    } else {
      setSelectedEvent({ id: event.id, title: event.title });
      setIsModalOpen(true);
    }
  };

  const closeRegistrationModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  const closePaidModal = () => {
    setIsPaidModalOpen(false);
    setSelectedPaidEvent(null);
    fetchEvents();
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const eventDates = getEventDates();
    const days = [];
    const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    // Add empty cells for days before the first day of month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="text-center py-2"></div>);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const hasEvent = eventDates.includes(day);
      days.push(
        <div
          key={day}
          className={`text-center py-2 rounded-lg transition-colors ${
            hasEvent
              ? 'bg-primary text-white font-bold'
              : 'text-gray-700 hover:bg-sand'
          }`}
        >
          {day}
        </div>
      );
    }

    return { days, monthName };
  };

  const calendar = renderCalendar();

  return (
    <div>
      <PageHeader
        title="Events"
        description=""
        breadcrumbs={[{ label: 'Events' }]}
        pageKey="events"
      />

      <div className="pt-20">
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-12"
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-primary mb-4">{c('upcoming_title', 'Upcoming Events')}</h2>
            <motion.div
              className="w-24 h-1 bg-accent mx-auto mb-6"
              variants={scaleIn}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            ></motion.div>
            <p className="text-lg text-muted max-w-3xl mx-auto">
              {c('upcoming_desc', 'Stay informed and get involved in our next gathering')}
            </p>
          </motion.div>

          {loading ? (
            <motion.div
              className="flex flex-col items-center justify-center py-20"
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
            >
              <Loader2 size={48} className="text-primary animate-spin mb-4" />
              <p className="text-lg text-muted">Loading events...</p>
            </motion.div>
          ) : error ? (
            <motion.div
              className="text-center py-20 max-w-2xl mx-auto"
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
            >
              <div className="inline-flex items-center justify-center w-24 h-24 bg-red-50 rounded-full mb-6">
                <Calendar size={48} className="text-red-500" />
              </div>
              <h3 className="text-2xl font-bold text-primary mb-4">Error Loading Events</h3>
              <p className="text-lg text-muted mb-8">{error}</p>
              <motion.button
                onClick={fetchEvents}
                className="bg-primary text-white px-8 py-3 rounded-lg hover:bg-secondary transition-colors font-semibold"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Try Again
              </motion.button>
            </motion.div>
          ) : upcomingEvents.length === 0 ? (
            <motion.div
              className="text-center py-20 max-w-2xl mx-auto"
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
            >
              <div className="inline-flex items-center justify-center w-24 h-24 bg-sand rounded-full mb-6">
                <Calendar size={48} className="text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-primary mb-4">{c('no_events_title', 'No Upcoming Events')}</h3>
              <p className="text-lg text-muted mb-8">
                {c('no_events_desc', 'There are currently no upcoming events scheduled. Please check back later or contact us for more information.')}
              </p>
            </motion.div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left Column - Events List */}
              <motion.div
                className="lg:col-span-2 space-y-6"
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                {upcomingEvents.map((event, index) => {
                  const colors = [
                    { bg: 'bg-emerald-600', border: 'border-emerald-500', badge: 'bg-emerald-100 text-emerald-700' },
                    { bg: 'bg-blue-600', border: 'border-blue-500', badge: 'bg-blue-100 text-blue-700' },
                    { bg: 'bg-amber-600', border: 'border-amber-500', badge: 'bg-amber-100 text-amber-700' },
                    { bg: 'bg-rose-600', border: 'border-rose-500', badge: 'bg-rose-100 text-rose-700' },
                    { bg: 'bg-teal-600', border: 'border-teal-500', badge: 'bg-teal-100 text-teal-700' },
                  ];
                  const color = colors[index % colors.length];

                  return (
                    <motion.div
                      key={event.id}
                      className={`bg-white border-2 ${color.border} p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all`}
                      variants={staggerItem}
                      whileHover={{ y: -4 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="flex flex-col gap-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className={`flex-shrink-0 ${color.bg} text-white text-center p-4 rounded-2xl shadow-md`}>
                            <div className="text-3xl font-bold">{new Date(event.date).getDate()}</div>
                            <div className="text-sm uppercase">{new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}</div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <span className={`inline-block ${color.badge} px-3 py-1 rounded-full text-xs font-semibold`}>
                                {event.category}
                              </span>
                              {event.is_paid_event && event.ticket_price_adult && (
                                <span className={`inline-block ${color.bg} text-white px-3 py-1 rounded-full text-xs font-semibold`}>
                                  From £{Number(event.ticket_price_adult).toFixed(0)}
                                </span>
                              )}
                            </div>
                            <h3 className="text-xl font-bold text-primary mb-2">{event.title}</h3>
                            <p className="text-muted text-sm mb-3 leading-relaxed">{event.description}</p>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-sm text-muted">
                                <Clock size={16} className={color.bg.replace('bg-', 'text-')} />
                                <span>{event.time}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted">
                                <MapPin size={16} className={color.bg.replace('bg-', 'text-')} />
                                <span>{event.location}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      <div className="flex gap-2">
                        <motion.button
                          onClick={() => openRegistrationModal(event)}
                          className="flex-1 bg-primary text-white px-4 py-2 rounded-lg hover:bg-secondary transition-colors font-semibold text-sm"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          Register Now
                        </motion.button>
                        <AddToCalendar
                          event={{
                            title: event.title,
                            description: event.description,
                            location: event.location,
                            date: event.date,
                            time: event.time
                          }}
                        />
                      </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>

              {/* Right Column - Calendar and Featured Event */}
              <div className="space-y-6">
                {/* Calendar */}
                <motion.div
                  className="bg-white rounded-2xl shadow-lg p-6 border-2 border-transparent hover:border-primary transition-all"
                  variants={fadeInUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-primary">{calendar.monthName}</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => changeMonth(-1)}
                        className="p-1 hover:bg-sand rounded transition-colors"
                      >
                        <ChevronLeft size={20} className="text-primary" />
                      </button>
                      <button
                        onClick={() => changeMonth(1)}
                        className="p-1 hover:bg-sand rounded transition-colors"
                      >
                        <ChevronRight size={20} className="text-primary" />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-7 gap-2 mb-2">
                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                      <div key={day} className="text-center text-xs font-semibold text-muted">
                        {day}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-2">
                    {calendar.days}
                  </div>
                </motion.div>

                {/* Featured Event */}
                {featuredEvent && (
                  <motion.div
                    className="bg-white rounded-lg shadow-lg overflow-hidden"
                    variants={fadeInUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                  >
                    <div className="border-b-2 border-primary px-6 py-3">
                      <h3 className="text-lg font-bold text-primary">Featured Event</h3>
                    </div>
                    <div className="relative overflow-hidden">
                      <img
                        src={featuredEvent.image_url || 'https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?auto=compress&cs=tinysrgb&w=800'}
                        alt={featuredEvent.title}
                        className="w-full h-48 object-cover"
                      />
                    </div>
                    <div className="p-6">
                      <h4 className="text-xl font-bold text-primary mb-2">{featuredEvent.title}</h4>
                      <div className="flex items-center gap-2 text-primary mb-3">
                        <Calendar size={16} />
                        <span className="text-sm font-semibold">{new Date(featuredEvent.date).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                      </div>
                      <p className="text-muted text-sm mb-4 leading-relaxed">
                        {featuredEvent.description}
                      </p>
                      <motion.button
                        onClick={() => openRegistrationModal(featuredEvent)}
                        className="w-full bg-primary text-white px-6 py-3 rounded-lg hover:bg-secondary transition-colors font-semibold"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Register Now
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {!loading && pastEvents.length > 0 && (
        <section className="py-20 bg-sand">
          <div className="container mx-auto px-4">
            <motion.div
              className="text-center mb-12"
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-primary mb-4">{c('past_events_title', 'Past Events & Photo Galleries')}</h2>
              <motion.div
                className="w-24 h-1 bg-accent mx-auto mb-6"
                variants={scaleIn}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              ></motion.div>
              <p className="text-lg text-muted max-w-3xl mx-auto">
                {c('past_events_desc', 'Relive our favorite moments and see the impact of our community work')}
              </p>
            </motion.div>

            <motion.div
              className="grid md:grid-cols-3 gap-8"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {pastEvents.map((event) => (
                <motion.div
                  key={event.id}
                  className="bg-white rounded-lg overflow-hidden hover:shadow-xl transition-shadow group"
                  variants={staggerItem}
                  whileHover={{ y: -8 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={event.image_url || 'https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?auto=compress&cs=tinysrgb&w=800'}
                      alt={event.title}
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent transition-opacity duration-700 ease-in-out"></div>
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <p className="text-sm mb-1">{new Date(event.date).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-primary mb-3">{event.title}</h3>
                    <Link to={`/event-gallery/${event.id}`} className="text-primary font-semibold hover:text-accent transition-colors">
                      View Gallery →
                    </Link>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      <section className="py-16 bg-primary text-white">
        <motion.div
          className="container mx-auto px-4 text-center"
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold mb-4">{c('cta_title', 'Never Miss an Event')}</h2>
          <p className="text-xl text-gray-300 mb-6 max-w-2xl mx-auto">
            {c('cta_desc', 'Stay connected with us on your favorite platforms for real-time news and event updates')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.a
              href="#"
              className="bg-accent text-primary px-8 py-4 rounded-lg hover:bg-hover transition-colors font-semibold"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {c('follow_instagram', 'Follow on Instagram')}
            </motion.a>
            <motion.a
              href="#"
              className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg hover:bg-white hover:text-primary transition-colors font-semibold"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {c('join_facebook', 'Join Facebook Group')}
            </motion.a>
          </div>
        </motion.div>
      </section>
      </div>

      {selectedEvent && (
        <EventRegistrationModal
          isOpen={isModalOpen}
          onClose={closeRegistrationModal}
          eventId={selectedEvent.id}
          eventTitle={selectedEvent.title}
        />
      )}

      {selectedPaidEvent && (
        <PaidEventRegistrationModal
          isOpen={isPaidModalOpen}
          onClose={closePaidModal}
          event={{
            id: selectedPaidEvent.id,
            title: selectedPaidEvent.title,
            title_ar: selectedPaidEvent.title_ar,
            date: selectedPaidEvent.date,
            time: selectedPaidEvent.time,
            location: selectedPaidEvent.location,
            location_ar: selectedPaidEvent.location_ar,
            ticket_price_adult: selectedPaidEvent.ticket_price_adult || 0,
            ticket_price_child: selectedPaidEvent.ticket_price_child ?? null,
            ticket_price_member: selectedPaidEvent.ticket_price_member ?? null,
            max_capacity: selectedPaidEvent.max_capacity ?? null,
            current_registrations: selectedPaidEvent.current_registrations || 0,
          }}
        />
      )}
    </div>
  );
}
