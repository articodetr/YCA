import { HandHeart, Users, Calendar, Mail, CheckCircle, Loader2, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState, FormEvent } from 'react';
import PageHeader from '../../components/PageHeader';
import { fadeInUp, fadeInLeft, fadeInRight, staggerContainer, staggerItem, scaleIn } from '../../lib/animations';
import { supabase } from '../../lib/supabase';
import { useContent } from '../../contexts/ContentContext';

export default function Volunteer() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    address: '',
    date_of_birth: '',
    interests: '',
    skills: '',
    availability: '',
    experience: '',
    why_volunteer: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
  });

  const { getContent } = useContent();
  const c = (key: string, fallback: string) => getContent('volunteer', key, fallback);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const { error } = await supabase
        .from('volunteer_applications')
        .insert([formData]);

      if (error) throw error;

      setSubmitStatus('success');
      setFormData({
        full_name: '',
        email: '',
        phone: '',
        address: '',
        date_of_birth: '',
        interests: '',
        skills: '',
        availability: '',
        experience: '',
        why_volunteer: '',
        emergency_contact_name: '',
        emergency_contact_phone: '',
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const opportunities = [
    { title: c('opp_1_title', 'Event Support'), description: c('opp_1_desc', 'Help organize and run community events and celebrations') },
    { title: c('opp_2_title', 'Admin Support'), description: c('opp_2_desc', 'Assist with office tasks, data entry, and correspondence') },
    { title: c('opp_3_title', 'Programme Assistants'), description: c('opp_3_desc', 'Support our youth, women\'s, or elderly programmes') },
    { title: c('opp_4_title', 'Translation Services'), description: c('opp_4_desc', 'Help translate documents and interpret for community members') },
    { title: c('opp_5_title', 'Mentoring'), description: c('opp_5_desc', 'Guide and support young people in the community') },
    { title: c('opp_6_title', 'Fundraising'), description: c('opp_6_desc', 'Help with fundraising initiatives and grant applications') },
  ];

  return (
    <div>
      <div className="pt-20">
      <PageHeader
        title="Volunteering Opportunities"
        description=""
        breadcrumbs={[{ label: 'Get Involved', path: '/get-involved/volunteer' }, { label: 'Volunteer' }]}
        pageKey="volunteer"
      />

      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              className="bg-sand p-8 rounded-lg mb-12 text-center"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
            >
              <p className="text-lg text-muted leading-relaxed">
                {c('intro', 'YCA Birmingham relies on the dedication and passion of volunteers to deliver our services. Whether you have a few hours a week or can commit to regular volunteering, there\'s a role for you.')}
              </p>
            </motion.div>

            <div className="mb-12">
              <motion.h2
                className="text-4xl font-bold text-primary mb-8 text-center"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
              >
                {c('opportunities_title', 'Volunteer Opportunities')}
              </motion.h2>
              <motion.div
                className="grid md:grid-cols-2 gap-6"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={staggerContainer}
              >
                {opportunities.map((opportunity, index) => (
                  <motion.div
                    key={index}
                    className="bg-sand p-6 rounded-lg"
                    variants={staggerItem}
                    whileHover={{ y: -8, transition: { duration: 0.3 } }}
                  >
                    <h3 className="text-xl font-bold text-primary mb-3">{opportunity.title}</h3>
                    <p className="text-muted">{opportunity.description}</p>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            <motion.div
              className="grid md:grid-cols-3 gap-8 mb-12"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
            >
              <motion.div
                className="bg-accent p-6 rounded-lg text-center"
                variants={staggerItem}
                whileHover={{ scale: 1.03 }}
              >
                <motion.div
                  className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <HandHeart size={28} className="text-accent" />
                </motion.div>
                <h3 className="text-xl font-bold text-primary mb-3">{c('benefit_1_title', 'Give Back')}</h3>
                <p className="text-secondary">
                  {c('benefit_1_desc', 'Make a real difference in people\'s lives')}
                </p>
              </motion.div>
              <motion.div
                className="bg-accent p-6 rounded-lg text-center"
                variants={staggerItem}
                whileHover={{ scale: 1.03 }}
              >
                <motion.div
                  className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <Users size={28} className="text-accent" />
                </motion.div>
                <h3 className="text-xl font-bold text-primary mb-3">{c('benefit_2_title', 'Build Skills')}</h3>
                <p className="text-secondary">
                  {c('benefit_2_desc', 'Develop new skills and experience')}
                </p>
              </motion.div>
              <motion.div
                className="bg-accent p-6 rounded-lg text-center"
                variants={staggerItem}
                whileHover={{ scale: 1.03 }}
              >
                <motion.div
                  className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <Calendar size={28} className="text-accent" />
                </motion.div>
                <h3 className="text-xl font-bold text-primary mb-3">{c('benefit_3_title', 'Flexible Hours')}</h3>
                <p className="text-secondary">
                  {c('benefit_3_desc', 'Volunteer when it suits you')}
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
              <h2 className="text-3xl font-bold text-primary mb-6 text-center">{c('apply_title', 'Apply to Volunteer')}</h2>
              <p className="text-lg text-muted mb-8 text-center max-w-2xl mx-auto">
                {c('apply_desc', 'Complete the form below to submit your volunteer application. We\'ll review it and get back to you within 2-3 business days.')}
              </p>

              {submitStatus === 'success' && (
                <motion.div
                  className="bg-green-50 border-2 border-green-500 text-green-800 p-6 rounded-lg mb-8"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <h3 className="font-bold text-xl mb-2">Application Submitted Successfully!</h3>
                  <p>Thank you for your interest in volunteering. We'll review your application and contact you soon.</p>
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
                      Address
                    </label>
                    <textarea
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      rows={2}
                      className="w-full px-4 py-3 border-2 border-sand rounded-lg focus:border-accent focus:outline-none transition-colors resize-none"
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-primary border-b-2 border-accent pb-2">Volunteer Information</h3>
                  <div>
                    <label htmlFor="interests" className="block text-sm font-semibold text-primary mb-2">
                      Areas of Interest
                    </label>
                    <textarea
                      id="interests"
                      name="interests"
                      value={formData.interests}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-4 py-3 border-2 border-sand rounded-lg focus:border-accent focus:outline-none transition-colors resize-none"
                      placeholder="Which volunteer opportunities interest you?"
                    />
                  </div>
                  <div>
                    <label htmlFor="skills" className="block text-sm font-semibold text-primary mb-2">
                      Skills & Qualifications
                    </label>
                    <textarea
                      id="skills"
                      name="skills"
                      value={formData.skills}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-4 py-3 border-2 border-sand rounded-lg focus:border-accent focus:outline-none transition-colors resize-none"
                      placeholder="Tell us about relevant skills or qualifications"
                    />
                  </div>
                  <div>
                    <label htmlFor="availability" className="block text-sm font-semibold text-primary mb-2">
                      Availability
                    </label>
                    <textarea
                      id="availability"
                      name="availability"
                      value={formData.availability}
                      onChange={handleChange}
                      rows={2}
                      className="w-full px-4 py-3 border-2 border-sand rounded-lg focus:border-accent focus:outline-none transition-colors resize-none"
                      placeholder="When are you available to volunteer?"
                    />
                  </div>
                  <div>
                    <label htmlFor="experience" className="block text-sm font-semibold text-primary mb-2">
                      Previous Volunteer Experience
                    </label>
                    <textarea
                      id="experience"
                      name="experience"
                      value={formData.experience}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-4 py-3 border-2 border-sand rounded-lg focus:border-accent focus:outline-none transition-colors resize-none"
                      placeholder="Describe any relevant volunteer experience"
                    />
                  </div>
                  <div>
                    <label htmlFor="why_volunteer" className="block text-sm font-semibold text-primary mb-2">
                      Why do you want to volunteer with YCA?
                    </label>
                    <textarea
                      id="why_volunteer"
                      name="why_volunteer"
                      value={formData.why_volunteer}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-4 py-3 border-2 border-sand rounded-lg focus:border-accent focus:outline-none transition-colors resize-none"
                      placeholder="Tell us about your motivation"
                    />
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
                      />
                    </div>
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
      </div>
    </div>
  );
}
