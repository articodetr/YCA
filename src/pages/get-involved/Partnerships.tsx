import { Handshake, Building, Users, Award, Mail, CheckCircle, Loader2, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState, FormEvent } from 'react';
import PageHeader from '../../components/PageHeader';
import { fadeInUp, fadeInLeft, fadeInRight, staggerContainer, staggerItem, scaleIn } from '../../lib/animations';
import { supabase } from '../../lib/supabase';

export default function Partnerships() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [formData, setFormData] = useState({
    organization_name: '',
    contact_person: '',
    email: '',
    phone: '',
    organization_type: '',
    partnership_interest: '',
    message: '',
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const { error } = await supabase
        .from('partnership_inquiries')
        .insert([formData]);

      if (error) throw error;

      setSubmitStatus('success');
      setFormData({
        organization_name: '',
        contact_person: '',
        email: '',
        phone: '',
        organization_type: '',
        partnership_interest: '',
        message: '',
      });

      setTimeout(() => {
        setSubmitStatus('idle');
      }, 5000);
    } catch (error) {
      console.error('Error submitting inquiry:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const benefits = [
    'Enhanced community reach and impact',
    'Shared resources and expertise',
    'Joint programme development opportunities',
    'Networking with other organizations',
    'Positive brand association',
    'Access to diverse community networks',
  ];

  return (
    <div>
      <div className="pt-20">
      <PageHeader
        title="Partnerships & Collaborations"
        description=""
        breadcrumbs={[{ label: 'Get Involved', path: '/get-involved/partnerships' }, { label: 'Partnerships' }]}
        image="https://images.pexels.com/photos/3184306/pexels-photo-3184306.jpeg?auto=compress&cs=tinysrgb&w=1920"
      />

      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              className="text-center mb-12"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
            >
              <p className="text-lg text-muted leading-relaxed">
                YCA Birmingham believes in the power of collaboration. We actively seek partnerships with organizations, businesses, and agencies that share our commitment to community empowerment and social justice.
              </p>
            </motion.div>

            <motion.div
              className="grid md:grid-cols-3 gap-8 mb-12"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
            >
              <motion.div
                className="bg-sand p-8 rounded-lg text-center"
                variants={staggerItem}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
              >
                <motion.div
                  className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <Building size={28} className="text-primary" />
                </motion.div>
                <h3 className="text-xl font-bold text-primary mb-3">Corporate Partners</h3>
                <p className="text-muted">
                  Businesses looking to make a positive social impact
                </p>
              </motion.div>

              <motion.div
                className="bg-sand p-8 rounded-lg text-center"
                variants={staggerItem}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
              >
                <motion.div
                  className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <Users size={28} className="text-primary" />
                </motion.div>
                <h3 className="text-xl font-bold text-primary mb-3">Community Groups</h3>
                <p className="text-muted">
                  Local organizations working towards shared goals
                </p>
              </motion.div>

              <motion.div
                className="bg-sand p-8 rounded-lg text-center"
                variants={staggerItem}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
              >
                <motion.div
                  className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <Award size={28} className="text-primary" />
                </motion.div>
                <h3 className="text-xl font-bold text-primary mb-3">Public Sector</h3>
                <p className="text-muted">
                  Government agencies and statutory services
                </p>
              </motion.div>
            </motion.div>

            <motion.div
              className="bg-accent p-10 rounded-lg mb-12"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={scaleIn}
            >
              <h2 className="text-3xl font-bold text-primary mb-8 text-center">Partnership Benefits</h2>
              <motion.div
                className="grid md:grid-cols-2 gap-4"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={staggerContainer}
              >
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    className="flex items-start gap-3 bg-white p-4 rounded-lg"
                    variants={staggerItem}
                    whileHover={{ scale: 1.03 }}
                  >
                    <CheckCircle size={24} className="text-primary flex-shrink-0 mt-1" />
                    <p className="text-muted text-lg">{benefit}</p>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            <motion.div
              className="grid md:grid-cols-2 gap-8 mb-12"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
            >
              <motion.div
                className="bg-primary text-white p-8 rounded-lg"
                variants={fadeInLeft}
                whileHover={{ scale: 1.03 }}
              >
                <h3 className="text-2xl font-bold mb-6">Partnership Opportunities</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <span>•</span>
                    <span>Joint programme delivery</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>•</span>
                    <span>Funding and sponsorship</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>•</span>
                    <span>Skills sharing and capacity building</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>•</span>
                    <span>Research and evaluation projects</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>•</span>
                    <span>Event collaboration</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>•</span>
                    <span>Resource sharing</span>
                  </li>
                </ul>
              </motion.div>

              <motion.div
                className="bg-sand p-8 rounded-lg"
                variants={fadeInRight}
                whileHover={{ scale: 1.03 }}
              >
                <h3 className="text-2xl font-bold text-primary mb-6">What We Offer</h3>
                <ul className="space-y-3 text-muted">
                  <li className="flex items-start gap-2">
                    <span>•</span>
                    <span>Direct access to the Yemeni community</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>•</span>
                    <span>Cultural expertise and insights</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>•</span>
                    <span>Bilingual staff and volunteers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>•</span>
                    <span>Established community trust</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>•</span>
                    <span>Programme delivery experience</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>•</span>
                    <span>Community engagement channels</span>
                  </li>
                </ul>
              </motion.div>
            </motion.div>

            <motion.div
              className="bg-white border-2 border-primary p-10 rounded-lg"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
            >
              <h2 className="text-3xl font-bold text-primary mb-6 text-center">Partnership Inquiry Form</h2>
              <p className="text-lg text-muted mb-8 text-center max-w-2xl mx-auto">
                Complete the form below to express your interest in partnering with YCA Birmingham. We'll review your inquiry and get back to you within 2-3 business days.
              </p>

              {submitStatus === 'success' && (
                <motion.div
                  className="bg-green-50 border-2 border-green-500 text-green-800 p-6 rounded-lg mb-8"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <h3 className="font-bold text-xl mb-2">Inquiry Submitted Successfully!</h3>
                  <p>Thank you for your interest in partnering with us. We'll review your inquiry and contact you soon.</p>
                </motion.div>
              )}

              {submitStatus === 'error' && (
                <motion.div
                  className="bg-red-50 border-2 border-red-500 text-red-800 p-6 rounded-lg mb-8"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <h3 className="font-bold text-xl mb-2">Submission Failed</h3>
                  <p>There was an error submitting your inquiry. Please try again or contact us directly.</p>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-primary border-b-2 border-accent pb-2">Organization Information</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="organization_name" className="block text-sm font-semibold text-primary mb-2">
                        Organization Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="organization_name"
                        name="organization_name"
                        value={formData.organization_name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border-2 border-sand rounded-lg focus:border-accent focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label htmlFor="organization_type" className="block text-sm font-semibold text-primary mb-2">
                        Organization Type
                      </label>
                      <select
                        id="organization_type"
                        name="organization_type"
                        value={formData.organization_type}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 border-sand rounded-lg focus:border-accent focus:outline-none transition-colors"
                      >
                        <option value="">Select type</option>
                        <option value="corporate">Corporate/Business</option>
                        <option value="nonprofit">Non-Profit/Charity</option>
                        <option value="public_sector">Public Sector</option>
                        <option value="community">Community Group</option>
                        <option value="education">Educational Institution</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-primary border-b-2 border-accent pb-2">Contact Information</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="contact_person" className="block text-sm font-semibold text-primary mb-2">
                        Contact Person <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="contact_person"
                        name="contact_person"
                        value={formData.contact_person}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border-2 border-sand rounded-lg focus:border-accent focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-semibold text-primary mb-2">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border-2 border-sand rounded-lg focus:border-accent focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-sm font-semibold text-primary mb-2">
                        Phone <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border-2 border-sand rounded-lg focus:border-accent focus:outline-none transition-colors"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-primary border-b-2 border-accent pb-2">Partnership Details</h3>
                  <div>
                    <label htmlFor="partnership_interest" className="block text-sm font-semibold text-primary mb-2">
                      Area of Partnership Interest
                    </label>
                    <textarea
                      id="partnership_interest"
                      name="partnership_interest"
                      value={formData.partnership_interest}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-4 py-3 border-2 border-sand rounded-lg focus:border-accent focus:outline-none transition-colors resize-none"
                      placeholder="e.g., Joint programme delivery, Funding, Event collaboration"
                    />
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-semibold text-primary mb-2">
                      Additional Information
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={4}
                      className="w-full px-4 py-3 border-2 border-sand rounded-lg focus:border-accent focus:outline-none transition-colors resize-none"
                      placeholder="Tell us more about your organization and partnership ideas..."
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-primary text-white px-8 py-4 rounded-lg hover:bg-secondary transition-colors font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: isSubmitting ? 1 : 1.05 }}
                    whileTap={{ scale: isSubmitting ? 1 : 0.95 }}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={20} className="animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send size={20} />
                        Submit Inquiry
                      </>
                    )}
                  </motion.button>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      to="/contact"
                      className="bg-white border-2 border-primary text-primary px-8 py-4 rounded-lg hover:bg-primary hover:text-white transition-colors font-semibold flex items-center justify-center gap-2"
                    >
                      <Mail size={20} />
                      Questions? Contact Us
                    </Link>
                  </motion.div>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-sand">
        <motion.div
          className="container mx-auto px-4 text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
        >
          <h2 className="text-3xl font-bold text-primary mb-4">Current Partners</h2>
          <p className="text-lg text-muted max-w-3xl mx-auto">
            We're proud to work alongside Birmingham City Council, The Muath Trust, NHS Birmingham and Solihull, and many other organizations committed to community wellbeing.
          </p>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              to="/about/partners"
              className="inline-block mt-8 bg-primary text-white px-8 py-4 rounded-lg hover:bg-secondary transition-colors font-semibold"
            >
              View All Partners
            </Link>
          </motion.div>
        </motion.div>
      </section>
      </div>
    </div>
  );
}
