import { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import PageHeader from '../components/PageHeader';
import { fadeInUp, fadeInLeft, fadeInRight, staggerContainer, staggerItem, scaleIn } from '../lib/animations';
import { useContent } from '../contexts/ContentContext';

export default function Contact() {
  const { getContent } = useContent();
  const c = (key: string, fallback: string) => getContent('contact', key, fallback);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      const { error } = await supabase
        .from('contact_submissions')
        .insert([formData]);

      if (error) throw error;

      setSubmitMessage('Thank you for your message! We will get back to you soon.');
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitMessage('There was an error sending your message. Please try again or contact us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div>
      <PageHeader
        title="Contact Us"
        description=""
        breadcrumbs={[{ label: 'Contact' }]}
        pageKey="contact"
      />

      <div className="pt-20">
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            <motion.div
              variants={fadeInLeft}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold text-primary mb-6">{c('heading', 'Get In Touch With Us')}</h2>
              <p className="text-lg text-muted mb-8 leading-relaxed">
                {c('intro', 'If you have got a question or general query, you can contact us and we will get in touch with you as soon as possible.')}
              </p>

              <motion.div
                className="space-y-6 mb-8"
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <motion.div className="flex items-start gap-2 sm:gap-3 md:gap-4" variants={staggerItem}>
                  <motion.div
                    className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-accent rounded-lg flex items-center justify-center flex-shrink-0"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                  </motion.div>
                  <div>
                    <h3 className="font-bold text-base sm:text-lg text-primary mb-2">{c('address_label', 'Address')}</h3>
                    <p className="text-muted text-sm sm:text-base">
                      {c('address_line1', 'YCA GreenCoat House')}<br />
                      {c('address_line2', '261-271 Stratford Road')}<br />
                      {c('address_line3', 'Birmingham, B11 1QS')}
                    </p>
                  </div>
                </motion.div>

                <motion.div className="flex items-start gap-2 sm:gap-3 md:gap-4" variants={staggerItem}>
                  <motion.div
                    className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-accent rounded-lg flex items-center justify-center flex-shrink-0"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                  </motion.div>
                  <div>
                    <h3 className="font-bold text-base sm:text-lg text-primary mb-2">{c('phone_label', 'Phone')}</h3>
                    <a href="tel:01214395280" className="text-muted hover:text-accent transition-colors text-sm sm:text-base">
                      {c('phone_number', '0121 439 5280')}
                    </a>
                  </div>
                </motion.div>

                <motion.div className="flex items-start gap-2 sm:gap-3 md:gap-4" variants={staggerItem}>
                  <motion.div
                    className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-accent rounded-lg flex items-center justify-center flex-shrink-0"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                  </motion.div>
                  <div>
                    <h3 className="font-bold text-base sm:text-lg text-primary mb-2">{c('email_label', 'Email')}</h3>
                    <a href="mailto:info@yca-birmingham.org.uk" className="text-muted hover:text-accent transition-colors text-sm sm:text-base break-all">
                      {c('email_address', 'info@yca-birmingham.org.uk')}
                    </a>
                  </div>
                </motion.div>

                <motion.div className="flex items-start gap-2 sm:gap-3 md:gap-4" variants={staggerItem}>
                  <motion.div
                    className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-accent rounded-lg flex items-center justify-center flex-shrink-0"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                  </motion.div>
                  <div>
                    <h3 className="font-bold text-base sm:text-lg text-primary mb-2">{c('hours_label', 'Opening Times')}</h3>
                    <p className="text-muted whitespace-pre-line text-sm sm:text-base">
                      {c('hours_text', 'Monday - Thursday: 10:00 AM - 3:30 PM\nFriday: 9:00 AM - 1:00 PM')}
                    </p>
                  </div>
                </motion.div>
              </motion.div>

              <motion.div
                className="bg-sand p-6 rounded-lg"
                variants={scaleIn}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <h3 className="font-bold text-xl text-primary mb-3">{c('advice_title', 'Need Advice or Support?')}</h3>
                <p className="text-muted mb-4">
                  {c('advice_desc', 'Our bilingual team provides confidential advice and guidance on welfare benefits, housing, immigration, and more.')}
                </p>
                <p className="text-primary font-semibold">
                  {c('advice_cta', 'Call us today to book your one-to-one appointment')}
                </p>
              </motion.div>
            </motion.div>

            <motion.div
              variants={fadeInRight}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <div className="bg-sand p-8 rounded-lg">
                <h2 className="text-3xl font-bold text-primary mb-6">{c('form_title', 'Send Us a Message')}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-primary font-semibold mb-2">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-border rounded-lg focus:outline-none focus:border-accent transition-colors"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-primary font-semibold mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-border rounded-lg focus:outline-none focus:border-accent transition-colors"
                      placeholder="your.email@example.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-primary font-semibold mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-border rounded-lg focus:outline-none focus:border-accent transition-colors"
                      placeholder="Your phone number"
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-primary font-semibold mb-2">
                      Subject *
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-border rounded-lg focus:outline-none focus:border-accent transition-colors"
                      placeholder="What is your message about?"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-primary font-semibold mb-2">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={6}
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-border rounded-lg focus:outline-none focus:border-accent transition-colors resize-none"
                      placeholder="Write your message here..."
                    ></textarea>
                  </div>

                  {submitMessage && (
                    <div className={`p-4 rounded-lg ${submitMessage.includes('error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {submitMessage}
                    </div>
                  )}

                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-primary text-white px-8 py-4 rounded-lg hover:bg-secondary transition-colors font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Send size={20} />
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </motion.button>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-0 bg-white">
        <div className="w-full h-96">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2433.5!2d-1.8777!3d52.4633!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4870bdb6f2e8e4b1%3A0x5e8b2e0c8e9f4a0b!2s261-271+Stratford+Rd%2C+Birmingham+B11+1QS!5e0!3m2!1sen!2suk!4v1700000000000"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="YCA Birmingham Location"
          ></iframe>
        </div>
      </section>
      </div>
    </div>
  );
}
