import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Clock, ArrowLeft, X } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { fadeInUp, staggerContainer, staggerItem } from '../lib/animations';
import { supabase } from '../lib/supabase';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: string;
  image_url: string | null;
}

interface GalleryImage {
  id: string;
  image_url: string;
  caption: string;
  description: string;
}

export default function EventGallery() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);

  useEffect(() => {
    if (id) {
      fetchEvent();
      fetchGalleryImages();
    }
  }, [id]);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      setEvent(data);
    } catch (err) {
      console.error('Error fetching event:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchGalleryImages = async () => {
    try {
      const { data, error } = await supabase
        .from('event_gallery')
        .select('*')
        .eq('event_id', id)
        .order('order_number', { ascending: true });

      if (error) throw error;
      setGalleryImages(data || []);
    } catch (err) {
      console.error('Error fetching gallery images:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted">Loading gallery...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-primary mb-4">Event Not Found</h2>
          <Link to="/events" className="text-accent hover:underline">
            Return to Events
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={event.title}
        description=""
        breadcrumbs={[
          { label: 'Events', path: '/events' },
          { label: event.title }
        ]}
        image={event.image_url || 'https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?auto=compress&cs=tinysrgb&w=1920'}
      />

      <div className="pt-20">
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <Link
                to="/events"
                className="inline-flex items-center gap-2 text-primary hover:text-accent transition-colors mb-8 font-semibold"
              >
                <ArrowLeft size={20} />
                Back to Events
              </Link>
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-8 mb-12">
              <motion.div
                className="lg:col-span-2"
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <h1 className="text-4xl font-bold text-primary mb-4">{event.title}</h1>
                <p className="text-lg text-muted mb-6 leading-relaxed">
                  {event.description}
                </p>
              </motion.div>

              <motion.div
                className="bg-sand p-6 rounded-lg h-fit"
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <h3 className="text-xl font-bold text-primary mb-4">Event Details</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Calendar size={20} className="text-primary mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-muted font-semibold">Date</p>
                      <p className="text-primary">
                        {new Date(event.date).toLocaleDateString('en-GB', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock size={20} className="text-primary mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-muted font-semibold">Time</p>
                      <p className="text-primary">{event.time}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin size={20} className="text-primary mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-muted font-semibold">Location</p>
                      <p className="text-primary">{event.location}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            <motion.div
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="mb-8"
            >
              <h2 className="text-3xl font-bold text-primary mb-2">Photo Gallery</h2>
              <p className="text-muted">
                {galleryImages.length > 0
                  ? 'Click on any photo to view in full size'
                  : 'No gallery images available for this event'}
              </p>
            </motion.div>

            {galleryImages.length > 0 ? (
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                {galleryImages.map((image, index) => (
                  <motion.div
                    key={image.id}
                    className="relative overflow-hidden rounded-lg cursor-pointer group aspect-square"
                    variants={staggerItem}
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                    onClick={() => setSelectedImage(index)}
                  >
                    <img
                      src={image.image_url}
                      alt={image.caption || `${event.title} photo ${index + 1}`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {image.caption && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                        <p className="text-white font-semibold">{image.caption}</p>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/30 transition-colors duration-300"></div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <div className="text-center py-12 bg-sand rounded-lg">
                <p className="text-muted">Gallery images will be added soon.</p>
              </div>
            )}
          </div>
        </section>
      </div>

      {selectedImage !== null && galleryImages[selectedImage] && (
        <motion.div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 text-white hover:text-accent transition-colors"
          >
            <X size={32} />
          </button>
          <div className="max-w-5xl w-full">
            <motion.img
              src={galleryImages[selectedImage].image_url}
              alt={galleryImages[selectedImage].caption || `${event?.title} photo ${selectedImage + 1}`}
              className="w-full max-h-[80vh] object-contain"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
            />
            {(galleryImages[selectedImage].caption || galleryImages[selectedImage].description) && (
              <motion.div
                className="bg-white/10 backdrop-blur-sm p-4 mt-4 rounded-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {galleryImages[selectedImage].caption && (
                  <h3 className="text-white font-semibold text-lg mb-1">
                    {galleryImages[selectedImage].caption}
                  </h3>
                )}
                {galleryImages[selectedImage].description && (
                  <p className="text-white/80">{galleryImages[selectedImage].description}</p>
                )}
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
