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

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="text-center py-1.5"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const hasEvent = eventDates.includes(day);
      days.push(
        <div
          key={day}
          className={`text-center py-1.5 text-sm rounded-lg transition-colors ${
            hasEvent
              ? 'bg-accent text-white font-semibold'
              : 'text-muted hover:bg-sand'
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

      <section className="py-16 bg-sand">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-14"
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-primary mb-3">{c('upcoming_title', 'Upcoming Events')}</h2>
            <motion.div
              className="w-16 h-0.5 bg-accent mx-auto mb-5"
              variants={scaleIn}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            ></motion.div>
            <p className="text-muted max-w-2xl mx-auto">
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
              <Loader2 size={40} className="text-accent animate-spin mb-4" />
              <p className="text-muted">Loading events...</p>
            </motion.div>
          ) : error ? (
            <motion.div
              className="text-center py-20 max-w-md mx-auto"
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 bg-red-50 rounded-full mb-6">
                <Calendar size={36} className="text-red-400" />
              </div>
              <h3 className="text-xl font-semibold text-primary mb-3">Error Loading Events</h3>
              <p className="text-muted mb-6">{error}</p>
              <button
                onClick={fetchEvents}
                className="bg-accent text-white px-6 py-2.5 rounded-lg hover:shadow-md transition-shadow font-medium"
              >
                Try Again
              </button>
            </motion.div>
          ) : upcomingEvents.length === 0 ? (
            <motion.div
              className="text-center py-20 max-w-md mx-auto"
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white border border-gray-100 rounded-full mb-6">
                <Calendar size={36} className="text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-primary mb-3">{c('no_events_title', 'No Upcoming Events')}</h3>
              <p className="text-muted">
                {c('no_events_desc', 'There are currently no upcoming events scheduled. Please check back later or contact us for more information.')}
              </p>
            </motion.div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              <motion.div
                className="lg:col-span-2 space-y-5"
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                {upcomingEvents.map((event) => (
                  <motion.div
                    key={event.id}
                    className="bg-white border border-gray-100 rounded-xl p-6 hover:shadow-md transition-shadow"
                    variants={staggerItem}
                  >
                    <div className="flex flex-col sm:flex-row gap-5">
                      <div className="flex-shrink-0 bg-accent text-white text-center w-16 h-16 sm:w-18 sm:h-18 flex flex-col items-center justify-center rounded-xl">
                        <div className="text-2xl font-bold leading-none">{new Date(event.date).getDate()}</div>
                        <div className="text-xs uppercase mt-0.5 font-medium opacity-90">{new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}</div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="inline-block bg-accent/10 text-accent px-2.5 py-0.5 rounded-md text-xs font-medium">
                            {event.category}
                          </span>
                          {event.is_paid_event && event.ticket_price_adult && (
                            <span className="inline-block bg-primary/5 text-primary px-2.5 py-0.5 rounded-md text-xs font-medium">
                              From £{Number(event.ticket_price_adult).toFixed(0)}
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-semibold text-primary mb-1.5">{event.title}</h3>
                        <p className="text-muted text-sm mb-3 leading-relaxed line-clamp-2">{event.description}</p>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted mb-4">
                          <div className="flex items-center gap-1.5">
                            <Clock size={14} className="text-accent" />
                            <span>{event.time}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <MapPin size={14} className="text-accent" />
                            <span>{event.location}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => openRegistrationModal(event)}
                            className="bg-accent text-white px-5 py-2 rounded-lg hover:shadow-md transition-shadow font-medium text-sm"
                          >
                            Register Now
                          </button>
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
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              <div className="space-y-5">
                <motion.div
                  className="bg-white border border-gray-100 rounded-xl p-5"
                  variants={fadeInUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-primary">{calendar.monthName}</h3>
                    <div className="flex gap-1">
                      <button
                        onClick={() => changeMonth(-1)}
                        className="p-1.5 hover:bg-sand rounded-lg transition-colors"
                      >
                        <ChevronLeft size={16} className="text-muted" />
                      </button>
                      <button
                        onClick={() => changeMonth(1)}
                        className="p-1.5 hover:bg-sand rounded-lg transition-colors"
                      >
                        <ChevronRight size={16} className="text-muted" />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-7 gap-1 mb-1">
                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                      <div key={day} className="text-center text-xs font-medium text-muted/60 py-1">
                        {day}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {calendar.days}
                  </div>
                </motion.div>

                {featuredEvent && (
                  <motion.div
                    className="bg-white border border-gray-100 rounded-xl overflow-hidden"
                    variants={fadeInUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                  >
                    <div className="relative">
                      <img
                        src={featuredEvent.image_url || 'https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?auto=compress&cs=tinysrgb&w=800'}
                        alt={featuredEvent.title}
                        className="w-full h-40 object-cover"
                      />
                      <span className="absolute top-3 left-3 bg-accent text-white text-xs font-medium px-2.5 py-1 rounded-md">
                        Featured
                      </span>
                    </div>
                    <div className="p-5">
                      <h4 className="text-base font-semibold text-primary mb-2">{featuredEvent.title}</h4>
                      <div className="flex items-center gap-1.5 text-muted mb-3">
                        <Calendar size={14} className="text-accent" />
                        <span className="text-sm">{new Date(featuredEvent.date).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                      </div>
                      <p className="text-muted text-sm mb-4 leading-relaxed line-clamp-3">
                        {featuredEvent.description}
                      </p>
                      <button
                        onClick={() => openRegistrationModal(featuredEvent)}
                        className="w-full bg-accent text-white px-5 py-2.5 rounded-lg hover:shadow-md transition-shadow font-medium text-sm"
                      >
                        Register Now
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {!loading && pastEvents.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <motion.div
              className="text-center mb-14"
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold text-primary mb-3">{c('past_events_title', 'Past Events & Photo Galleries')}</h2>
              <motion.div
                className="w-16 h-0.5 bg-accent mx-auto mb-5"
                variants={scaleIn}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              ></motion.div>
              <p className="text-muted max-w-2xl mx-auto">
                {c('past_events_desc', 'Relive our favorite moments and see the impact of our community work')}
              </p>
            </motion.div>

            <motion.div
              className="grid md:grid-cols-3 gap-6"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {pastEvents.map((event) => (
                <motion.div
                  key={event.id}
                  className="bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition-shadow group"
                  variants={staggerItem}
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={event.image_url || 'https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?auto=compress&cs=tinysrgb&w=800'}
                      alt={event.title}
                      className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
                    />
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-primary text-xs font-medium px-2.5 py-1 rounded-md">
                      {new Date(event.date).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-base font-semibold text-primary mb-3">{event.title}</h3>
                    <Link to={`/event-gallery/${event.id}`} className="text-accent text-sm font-medium hover:underline transition-colors">
                      View Gallery →
                    </Link>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

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
