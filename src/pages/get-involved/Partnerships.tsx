import { Handshake, Building, Users, Award, Mail, CheckCircle, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState } from 'react';
import PageHeader from '../../components/PageHeader';
import { fadeInUp, fadeInLeft, fadeInRight, staggerContainer, staggerItem, scaleIn } from '../../lib/animations';
import { supabase } from '../../lib/supabase';
const SERVICE_REQUEST_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-service-request`;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
import { useLanguage } from '../../contexts/LanguageContext';
import DynamicFormModal from '../../components/modals/DynamicFormModal';

export default function Partnerships() {
  const { t, isRTL, language } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleFormSubmit = async (
    formData: Record<string, any>,
    responses: Array<{ question_id: string; response_text: string; response_files?: any[] }>
  ) => {
    try {
      const fieldMap: Record<string, string> = {
        p1: 'organization_name', p2: 'contact_person', p3: 'email',
        p4: 'phone', p5: 'organization_type', p6: 'partnership_interest', p7: 'message',
      };

      const mapped: Record<string, any> = {};
      for (const [key, value] of Object.entries(formData)) {
        const colName = fieldMap[key] || key;
        mapped[colName] = Array.isArray(value) ? value.join(', ') : value;
      }

      const basicData = {
        organization_name: mapped.organization_name || '',
        contact_person: mapped.contact_person || '',
        email: mapped.email || '',
        phone: mapped.phone || '',
        organization_type: mapped.organization_type || '',
        partnership_interest: mapped.partnership_interest || '',
        message: mapped.message || '',
      };

      const res = await fetch(SERVICE_REQUEST_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${ANON_KEY}`, 'Apikey': ANON_KEY },
        body: JSON.stringify({ table: 'partnership_inquiries', data: basicData }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Submission failed');
      const inquiry = { id: result.id };

      try {
        const isFallbackId = (id: string) => /^p\d+$/.test(id);
        const validResponses = responses.filter(r => !isFallbackId(r.question_id));

        if (validResponses.length > 0) {
          const responsesToInsert = validResponses.map(r => ({
            form_type: 'partnership',
            application_id: inquiry.id,
            question_id: r.question_id,
            response_text: r.response_text,
            response_files: r.response_files || []
          }));

          await supabase.from('form_responses').insert(responsesToInsert);
        }
      } catch (e) {
        console.warn('Could not save form responses:', e);
      }

      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (error) {
      console.error('Error submitting partnership inquiry:', error);
      throw error;
    }
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
              className="bg-gradient-to-br from-primary to-secondary text-white p-12 rounded-2xl text-center shadow-2xl"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
            >
              <motion.div
                className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mx-auto mb-6"
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                <Handshake size={40} className="text-primary" />
              </motion.div>

              <h2 className="text-4xl font-bold mb-4">{t('partnerships.formTitle')}</h2>
              <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
                {t('partnerships.formDesc')}
              </p>

              {submitSuccess && (
                <motion.div
                  className="bg-green-500/20 border-2 border-green-300 text-white p-6 rounded-lg mb-8 max-w-2xl mx-auto"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <h3 className="font-bold text-xl mb-2">{t('partnerships.successTitle')}</h3>
                  <p>{t('partnerships.successMsg')}</p>
                </motion.div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-accent text-primary px-10 py-5 rounded-xl hover:bg-hover transition-colors font-bold text-lg flex items-center justify-center gap-3 shadow-lg"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Send size={24} />
                  {language === 'ar' ? 'ابدأ طلب الشراكة' : 'Start Partnership Application'}
                </motion.button>

                <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/contact"
                    className="bg-white/10 border-2 border-white text-white px-10 py-5 rounded-xl hover:bg-white hover:text-primary transition-colors font-bold text-lg flex items-center justify-center gap-3"
                  >
                    <Mail size={24} />
                    {t('partnerships.questionsContact')}
                  </Link>
                </motion.div>
              </div>
            </motion.div>

            <DynamicFormModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              formType="partnership"
              title="Partnership Application"
              titleAr="طلب شراكة"
              onSubmit={handleFormSubmit}
            />
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
  );
}
