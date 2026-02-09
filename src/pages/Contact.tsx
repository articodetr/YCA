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

      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 max-w-6xl mx-auto">
            <motion.div
              variants={fadeInLeft}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold text-[#0f1c2e] mb-4">{c('heading', 'Get In Touch With Us')}</h2>
              <p className="text-lg text-[#64748b] mb-10 leading-relaxed">
                {c('intro', 'If you have got a question or general query, you can contact us and we will get in touch with you as soon as possible.')}
              </p>

              <motion.div
                className="space-y-8 mb-10"
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <motion.div className="flex items-start gap-4" variants={staggerItem}>
                  <div className="w-12 h-12 bg-[#0d9488]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-[#0d9488]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base text-[#0f1c2e] mb-1">{c('address_label', 'Address')}</h3>
                    <p className="text-[#64748b] text-sm leading-relaxed">
                      {c('address_line1', 'YCA GreenCoat House')}<br />
                      {c('address_line2', '261-271 Stratford Road')}<br />
                      {c('address_line3', 'Birmingham, B11 1QS')}
                    </p>
                  </div>
                </motion.div>

                <motion.div className="flex items-start gap-4" variants={staggerItem}>
                  <div className="w-12 h-12 bg-[#0d9488]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-[#0d9488]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base text-[#0f1c2e] mb-1">{c('phone_label', 'Phone')}</h3>
                    <a href="tel:01214395280" className="text-[#64748b] hover:text-[#0d9488] transition-colors text-sm">
                      {c('phone_number', '0121 439 5280')}
                    </a>
                  </div>
                </motion.div>

                <motion.div className="flex items-start gap-4" variants={staggerItem}>
                  <div className="w-12 h-12 bg-[#0d9488]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-[#0d9488]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base text-[#0f1c2e] mb-1">{c('email_label', 'Email')}</h3>
                    <a href="mailto:info@yca-birmingham.org.uk" className="text-[#64748b] hover:text-[#0d9488] transition-colors text-sm break-all">
                      {c('email_address', 'info@yca-birmingham.org.uk')}
                    </a>
                  </div>
                </motion.div>

                <motion.div className="flex items-start gap-4" variants={staggerItem}>
                  <div className="w-12 h-12 bg-[#0d9488]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-[#0d9488]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base text-[#0f1c2e] mb-1">{c('hours_label', 'Opening Times')}</h3>
                    <p className="text-[#64748b] whitespace-pre-line text-sm leading-relaxed">
                      {c('hours_text', 'Monday - Thursday: 10:00 AM - 3:30 PM\nFriday: 9:00 AM - 1:00 PM')}
                    </p>
                  </div>
                </motion.div>
              </motion.div>

              <motion.div
                className="bg-gray-50 p-6 rounded-xl"
                variants={scaleIn}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <h3 className="font-bold text-lg text-[#0f1c2e] mb-2">{c('advice_title', 'Need Advice or Support?')}</h3>
                <p className="text-[#64748b] text-sm leading-relaxed mb-3">
                  {c('advice_desc', 'Our bilingual team provides confidential advice and guidance on welfare benefits, housing, immigration, and more.')}
                </p>
                <p className="text-[#0d9488] font-semibold text-sm">
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
              <div className="bg-white border border-gray-200 p-8 rounded-xl">
                <h2 className="text-2xl font-bold text-[#0f1c2e] mb-6">{c('form_title', 'Send Us a Message')}</h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label htmlFor="name" className="block text-[#0f1c2e] text-sm font-medium mb-1.5">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0d9488]/20 focus:border-[#0d9488] transition-colors text-sm"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-[#0f1c2e] text-sm font-medium mb-1.5">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0d9488]/20 focus:border-[#0d9488] transition-colors text-sm"
                      placeholder="your.email@example.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-[#0f1c2e] text-sm font-medium mb-1.5">
                      Phone
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0d9488]/20 focus:border-[#0d9488] transition-colors text-sm"
                      placeholder="Your phone number"
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-[#0f1c2e] text-sm font-medium mb-1.5">
                      Subject *
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0d9488]/20 focus:border-[#0d9488] transition-colors text-sm"
                      placeholder="What is your message about?"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-[#0f1c2e] text-sm font-medium mb-1.5">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={5}
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0d9488]/20 focus:border-[#0d9488] transition-colors resize-none text-sm"
                      placeholder="Write your message here..."
                    ></textarea>
                  </div>

                  {submitMessage && (
                    <div className={`p-4 rounded-xl text-sm ${submitMessage.includes('error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                      {submitMessage}
                    </div>
                  )}

                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#0d9488] text-white px-8 py-3.5 rounded-xl hover:bg-[#0d9488]/90 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Send size={18} />
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </motion.button>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="pb-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            className="max-w-6xl mx-auto overflow-hidden rounded-xl"
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2433.5!2d-1.8777!3d52.4633!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4870bdb6f2e8e4b1%3A0x5e8b2e0c8e9f4a0b!2s261-271+Stratford+Rd%2C+Birmingham+B11+1QS!5e0!3m2!1sen!2suk!4v1700000000000"
              width="100%"
              height="400"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="YCA Birmingham Location"
            ></iframe>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
