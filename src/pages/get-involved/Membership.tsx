import { Users, CheckCircle, Mail, Send, Loader2, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState, FormEvent } from 'react';
import PageHeader from '../../components/PageHeader';
import { fadeInUp, fadeInLeft, fadeInRight, staggerContainer, staggerItem, scaleIn } from '../../lib/animations';
import { supabase } from '../../lib/supabase';

export default function Membership() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    address: '',
    date_of_birth: '',
    membership_type: 'individual',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    interests: '',
    terms_accepted: false,
  });

  const benefits = [
    'Access to all community programmes and events',
    'Priority booking for workshops and training sessions',
    'Voting rights in AGM and community decisions',
    'Discounted rates for special events',
    'Regular newsletters and updates',
    'Networking opportunities with community members',
    'Voice in shaping YCA\'s future direction',
    'Sense of belonging to a vibrant community',
  ];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const { error } = await supabase
        .from('membership_applications')
        .insert([formData]);

      if (error) throw error;

      setSubmitStatus('success');
      setFormData({
        full_name: '',
        email: '',
        phone: '',
        address: '',
        date_of_birth: '',
        membership_type: 'individual',
        emergency_contact_name: '',
        emergency_contact_phone: '',
        interests: '',
        terms_accepted: false,
      });

      setTimeout(() => {
        setSubmitStatus('idle');
      }, 5000);
    } catch (error) {
      console.error('Error submitting application:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  return (
    <div>
      <div className="pt-20">
      <PageHeader
        title="Become a Member"
        description=""
        breadcrumbs={[{ label: 'Get Involved', path: '/get-involved/membership' }, { label: 'Membership' }]}
        image="https://images.pexels.com/photos/1595385/pexels-photo-1595385.jpeg?auto=compress&cs=tinysrgb&w=1920"
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
              <p className="text-lg text-muted leading-relaxed mb-6">
                Membership at YCA Birmingham is more than just a card—it's a commitment to being part of a vibrant, supportive community that celebrates Yemeni heritage while contributing positively to Birmingham life.
              </p>
            </motion.div>

            <motion.div
              className="bg-sand p-10 rounded-lg mb-12"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={scaleIn}
            >
              <h2 className="text-3xl font-bold text-primary mb-8 text-center">Membership Benefits</h2>
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
                    className="flex items-start gap-3"
                    variants={staggerItem}
                  >
                    <CheckCircle size={24} className="text-accent flex-shrink-0 mt-1" />
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
                className="bg-accent p-8 rounded-lg"
                variants={fadeInLeft}
                whileHover={{ scale: 1.03 }}
              >
                <motion.div
                  className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-6"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <Users size={32} className="text-accent" />
                </motion.div>
                <h3 className="text-2xl font-bold text-primary mb-4">Who Can Join?</h3>
                <p className="text-secondary leading-relaxed mb-4">
                  Membership is open to all members of the Yemeni community and anyone who supports our mission and values.
                </p>
                <ul className="space-y-2 text-secondary">
                  <li>• Individual Membership</li>
                  <li>• Family Membership</li>
                  <li>• Youth Membership (under 18)</li>
                  <li>• Associate Membership (supporters)</li>
                </ul>
              </motion.div>

              <motion.div
                className="bg-primary text-white p-8 rounded-lg"
                variants={fadeInRight}
                whileHover={{ scale: 1.03 }}
              >
                <motion.div
                  className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mb-6"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <FileText size={32} className="text-primary" />
                </motion.div>
                <h3 className="text-2xl font-bold mb-4">How to Apply</h3>
                <p className="leading-relaxed mb-4">
                  Becoming a member is simple and straightforward. Complete our membership form and submit it to our office or online.
                </p>
                <p className="text-gray-300">
                  Annual membership fees help us maintain and expand our services for the entire community.
                </p>
              </motion.div>
            </motion.div>

            <motion.div
              className="bg-white border-2 border-primary p-10 rounded-lg"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
            >
              <h2 className="text-3xl font-bold text-primary mb-6 text-center">Apply for Membership Online</h2>
              <p className="text-lg text-muted mb-8 text-center max-w-2xl mx-auto">
                Complete the form below to submit your membership application. We'll review it and get back to you within 2-3 business days.
              </p>

              {submitStatus === 'success' && (
                <motion.div
                  className="bg-green-50 border-2 border-green-500 text-green-800 p-6 rounded-lg mb-8"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <h3 className="font-bold text-xl mb-2">Application Submitted Successfully!</h3>
                  <p>Thank you for applying for membership. We'll review your application and contact you soon.</p>
                </motion.div>
              )}

              {submitStatus === 'error' && (
                <motion.div
                  className="bg-red-50 border-2 border-red-500 text-red-800 p-6 rounded-lg mb-8"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <h3 className="font-bold text-xl mb-2">Submission Failed</h3>
                  <p>There was an error submitting your application. Please try again or contact us directly.</p>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-primary border-b-2 border-accent pb-2">Personal Information</h3>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="full_name" className="block text-sm font-semibold text-primary mb-2">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="full_name"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border-2 border-sand rounded-lg focus:border-accent focus:outline-none transition-colors"
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-semibold text-primary mb-2">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border-2 border-sand rounded-lg focus:border-accent focus:outline-none transition-colors"
                        placeholder="your.email@example.com"
                      />
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-semibold text-primary mb-2">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border-2 border-sand rounded-lg focus:border-accent focus:outline-none transition-colors"
                        placeholder="07XXX XXXXXX"
                      />
                    </div>

                    <div>
                      <label htmlFor="date_of_birth" className="block text-sm font-semibold text-primary mb-2">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        id="date_of_birth"
                        name="date_of_birth"
                        value={formData.date_of_birth}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 border-sand rounded-lg focus:border-accent focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="address" className="block text-sm font-semibold text-primary mb-2">
                      Address <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      required
                      rows={3}
                      className="w-full px-4 py-3 border-2 border-sand rounded-lg focus:border-accent focus:outline-none transition-colors resize-none"
                      placeholder="Enter your full address"
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-primary border-b-2 border-accent pb-2">Membership Details</h3>

                  <div>
                    <label htmlFor="membership_type" className="block text-sm font-semibold text-primary mb-2">
                      Membership Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="membership_type"
                      name="membership_type"
                      value={formData.membership_type}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border-2 border-sand rounded-lg focus:border-accent focus:outline-none transition-colors"
                    >
                      <option value="individual">Individual Membership</option>
                      <option value="family">Family Membership</option>
                      <option value="youth">Youth Membership (under 18)</option>
                      <option value="associate">Associate Membership (supporters)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-primary border-b-2 border-accent pb-2">Emergency Contact</h3>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="emergency_contact_name" className="block text-sm font-semibold text-primary mb-2">
                        Emergency Contact Name
                      </label>
                      <input
                        type="text"
                        id="emergency_contact_name"
                        name="emergency_contact_name"
                        value={formData.emergency_contact_name}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 border-sand rounded-lg focus:border-accent focus:outline-none transition-colors"
                        placeholder="Full name"
                      />
                    </div>

                    <div>
                      <label htmlFor="emergency_contact_phone" className="block text-sm font-semibold text-primary mb-2">
                        Emergency Contact Phone
                      </label>
                      <input
                        type="tel"
                        id="emergency_contact_phone"
                        name="emergency_contact_phone"
                        value={formData.emergency_contact_phone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 border-sand rounded-lg focus:border-accent focus:outline-none transition-colors"
                        placeholder="07XXX XXXXXX"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-primary border-b-2 border-accent pb-2">Additional Information</h3>

                  <div>
                    <label htmlFor="interests" className="block text-sm font-semibold text-primary mb-2">
                      Areas of Interest / Skills to Contribute
                    </label>
                    <textarea
                      id="interests"
                      name="interests"
                      value={formData.interests}
                      onChange={handleChange}
                      rows={4}
                      className="w-full px-4 py-3 border-2 border-sand rounded-lg focus:border-accent focus:outline-none transition-colors resize-none"
                      placeholder="Tell us about your interests or how you'd like to contribute to the community..."
                    />
                  </div>
                </div>

                <div className="flex items-start gap-3 p-6 bg-sand rounded-lg">
                  <input
                    type="checkbox"
                    id="terms_accepted"
                    name="terms_accepted"
                    checked={formData.terms_accepted}
                    onChange={handleChange}
                    required
                    className="mt-1 w-5 h-5 border-2 border-primary rounded focus:ring-accent"
                  />
                  <label htmlFor="terms_accepted" className="text-sm text-muted leading-relaxed">
                    <span className="text-red-500">*</span> I confirm that the information provided is accurate and I agree to abide by the YCA Birmingham constitution and code of conduct. I understand that membership is subject to approval by the committee.
                  </label>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                  <motion.button
                    type="submit"
                    disabled={isSubmitting || !formData.terms_accepted}
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
                        Submit Application
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
          <h2 className="text-3xl font-bold text-primary mb-4">Questions About Membership?</h2>
          <p className="text-lg text-muted max-w-3xl mx-auto mb-8">
            Our team is happy to answer any questions you have about becoming a member of YCA Birmingham.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.a
              href="tel:01214395280"
              className="bg-primary text-white px-8 py-4 rounded-lg hover:bg-secondary transition-colors font-semibold"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Call: 0121 439 5280
            </motion.a>
            <motion.a
              href="mailto:INFO@yca-birmingham.org.uk"
              className="bg-white border-2 border-primary text-primary px-8 py-4 rounded-lg hover:bg-primary hover:text-white transition-colors font-semibold"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Email Us
            </motion.a>
          </div>
        </motion.div>
      </section>
      </div>
    </div>
  );
}
