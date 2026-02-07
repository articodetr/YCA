import { Handshake, Building, Users, Award, Mail, CheckCircle, Loader2, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState, FormEvent } from 'react';
import PageHeader from '../../components/PageHeader';
import { fadeInUp, fadeInLeft, fadeInRight, staggerContainer, staggerItem, scaleIn } from '../../lib/animations';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../../contexts/LanguageContext';

export default function Partnerships() {
  const { t, isRTL } = useLanguage();
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
    t('partnerships.benefit1'),
    t('partnerships.benefit2'),
    t('partnerships.benefit3'),
    t('partnerships.benefit4'),
    t('partnerships.benefit5'),
    t('partnerships.benefit6'),
  ];

  const opportunities = [
    t('partnerships.opp1'),
    t('partnerships.opp2'),
    t('partnerships.opp3'),
    t('partnerships.opp4'),
    t('partnerships.opp5'),
    t('partnerships.opp6'),
  ];

  const offers = [
    t('partnerships.offer1'),
    t('partnerships.offer2'),
    t('partnerships.offer3'),
    t('partnerships.offer4'),
    t('partnerships.offer5'),
    t('partnerships.offer6'),
  ];

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="pt-20">
      <PageHeader
        title={t('partnerships.title')}
        description=""
        breadcrumbs={[{ label: t('nav.getInvolved'), path: '/get-involved/partnerships' }, { label: t('nav.getInvolved.partnerships') }]}
        pageKey="partnerships"
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
                {t('partnerships.intro')}
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
                <h3 className="text-xl font-bold text-primary mb-3">{t('partnerships.corporate')}</h3>
                <p className="text-muted">{t('partnerships.corporateDesc')}</p>
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
                <h3 className="text-xl font-bold text-primary mb-3">{t('partnerships.community')}</h3>
                <p className="text-muted">{t('partnerships.communityDesc')}</p>
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
                <h3 className="text-xl font-bold text-primary mb-3">{t('partnerships.publicSector')}</h3>
                <p className="text-muted">{t('partnerships.publicSectorDesc')}</p>
              </motion.div>
            </motion.div>

            <motion.div
              className="bg-accent p-10 rounded-lg mb-12"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={scaleIn}
            >
              <h2 className="text-3xl font-bold text-primary mb-8 text-center">{t('partnerships.benefits')}</h2>
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
                <h3 className="text-2xl font-bold mb-6">{t('partnerships.opportunities')}</h3>
                <ul className="space-y-3">
                  {opportunities.map((opp, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span>&#8226;</span>
                      <span>{opp}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>

              <motion.div
                className="bg-sand p-8 rounded-lg"
                variants={fadeInRight}
                whileHover={{ scale: 1.03 }}
              >
                <h3 className="text-2xl font-bold text-primary mb-6">{t('partnerships.whatWeOffer')}</h3>
                <ul className="space-y-3 text-muted">
                  {offers.map((offer, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span>&#8226;</span>
                      <span>{offer}</span>
                    </li>
                  ))}
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
              <h2 className="text-3xl font-bold text-primary mb-6 text-center">{t('partnerships.formTitle')}</h2>
              <p className="text-lg text-muted mb-8 text-center max-w-2xl mx-auto">
                {t('partnerships.formDesc')}
              </p>

              {submitStatus === 'success' && (
                <motion.div
                  className="bg-green-50 border-2 border-green-500 text-green-800 p-6 rounded-lg mb-8"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <h3 className="font-bold text-xl mb-2">{t('partnerships.successTitle')}</h3>
                  <p>{t('partnerships.successMsg')}</p>
                </motion.div>
              )}

              {submitStatus === 'error' && (
                <motion.div
                  className="bg-red-50 border-2 border-red-500 text-red-800 p-6 rounded-lg mb-8"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <h3 className="font-bold text-xl mb-2">{t('partnerships.errorTitle')}</h3>
                  <p>{t('partnerships.errorMsg')}</p>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-primary border-b-2 border-accent pb-2">{t('partnerships.orgInfo')}</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="organization_name" className="block text-sm font-semibold text-primary mb-2">
                        {t('partnerships.orgName')} <span className="text-red-500">*</span>
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
                        {t('partnerships.orgType')}
                      </label>
                      <select
                        id="organization_type"
                        name="organization_type"
                        value={formData.organization_type}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 border-sand rounded-lg focus:border-accent focus:outline-none transition-colors"
                      >
                        <option value="">{t('partnerships.selectType')}</option>
                        <option value="corporate">{t('partnerships.typeCorporate')}</option>
                        <option value="nonprofit">{t('partnerships.typeNonprofit')}</option>
                        <option value="public_sector">{t('partnerships.typePublic')}</option>
                        <option value="community">{t('partnerships.typeCommunity')}</option>
                        <option value="education">{t('partnerships.typeEducation')}</option>
                        <option value="other">{t('partnerships.typeOther')}</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-primary border-b-2 border-accent pb-2">{t('partnerships.contactInfo')}</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="contact_person" className="block text-sm font-semibold text-primary mb-2">
                        {t('partnerships.contactPerson')} <span className="text-red-500">*</span>
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
                        {t('form.email')} <span className="text-red-500">*</span>
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
                        {t('form.phone')} <span className="text-red-500">*</span>
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
                  <h3 className="text-xl font-bold text-primary border-b-2 border-accent pb-2">{t('partnerships.partnershipDetails')}</h3>
                  <div>
                    <label htmlFor="partnership_interest" className="block text-sm font-semibold text-primary mb-2">
                      {t('partnerships.interestArea')}
                    </label>
                    <textarea
                      id="partnership_interest"
                      name="partnership_interest"
                      value={formData.partnership_interest}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-4 py-3 border-2 border-sand rounded-lg focus:border-accent focus:outline-none transition-colors resize-none"
                      placeholder={t('partnerships.interestPlaceholder')}
                    />
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-semibold text-primary mb-2">
                      {t('partnerships.additionalInfo')}
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={4}
                      className="w-full px-4 py-3 border-2 border-sand rounded-lg focus:border-accent focus:outline-none transition-colors resize-none"
                      placeholder={t('partnerships.additionalPlaceholder')}
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
                        {t('partnerships.submitting')}
                      </>
                    ) : (
                      <>
                        <Send size={20} />
                        {t('partnerships.submitInquiry')}
                      </>
                    )}
                  </motion.button>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      to="/contact"
                      className="bg-white border-2 border-primary text-primary px-8 py-4 rounded-lg hover:bg-primary hover:text-white transition-colors font-semibold flex items-center justify-center gap-2"
                    >
                      <Mail size={20} />
                      {t('partnerships.questionsContact')}
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
          <h2 className="text-3xl font-bold text-primary mb-4">{t('partnerships.currentPartners')}</h2>
          <p className="text-lg text-muted max-w-3xl mx-auto">
            {t('partnerships.currentPartnersDesc')}
          </p>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              to="/about/partners"
              className="inline-block mt-8 bg-primary text-white px-8 py-4 rounded-lg hover:bg-secondary transition-colors font-semibold"
            >
              {t('partnerships.viewAll')}
            </Link>
          </motion.div>
        </motion.div>
      </section>
      </div>
    </div>
  );
}
