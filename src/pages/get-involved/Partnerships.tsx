import { Handshake, Building, Users, Award, Mail, CheckCircle, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState } from 'react';
import PageHeader from '../../components/PageHeader';
import { fadeInUp, fadeInLeft, fadeInRight, staggerContainer, staggerItem, scaleIn } from '../../lib/animations';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../../contexts/LanguageContext';
import DynamicFormModal from '../../components/modals/DynamicFormModal';

export default function Partnerships() {
  const { t, isRTL, language } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const isUuid = (id: string) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);

  const handleFormSubmit = async (
    formData: Record<string, any>,
    responses: Array<{ question_id: string; response_text: string; response_files?: any[] }>
  ) => {
    try {
      // 1) Fallback mapping (when IDs are p1, p2, ...)
      const fieldMap: Record<string, string> = {
        p1: 'organization_name', p2: 'contact_person', p3: 'email',
        p4: 'phone', p5: 'organization_type', p6: 'partnership_interest', p7: 'message',
      };

      const mapped: Record<string, any> = {};
      for (const [key, value] of Object.entries(formData)) {
        const colName = fieldMap[key] || key;
        mapped[colName] = Array.isArray(value) ? value.join(', ') : value;
      }

      let basicData: any = {
        organization_name: (mapped.organization_name || '').trim(),
        contact_person: (mapped.contact_person || '').trim(),
        email: (mapped.email || '').trim(),
        phone: (mapped.phone || '').trim(),
        organization_type: (mapped.organization_type || '').trim(),
        partnership_interest: (mapped.partnership_interest || '').trim(),
        message: (mapped.message || '').trim(),
      };

      // 2) If questions come from DB (UUID IDs), infer fields by question_type + order_index
      const uuidIds = responses.map(r => r.question_id).filter(isUuid);
      if (uuidIds.length > 0) {
        const { data: qMeta, error: qMetaError } = await supabase
          .from('form_questions')
          .select('id, question_type, order_index')
          .in('id', uuidIds);

        if (!qMetaError && qMeta && qMeta.length > 0) {
          const metaMap = new Map(qMeta.map((q: any) => [q.id, q]));

          const enriched = responses
            .map(r => ({ ...r, meta: metaMap.get(r.question_id) }))
            .filter((r): r is typeof r & { meta: { id: string; question_type: string; order_index: number } } => !!r.meta)
            .sort((a, b) => (a.meta.order_index ?? 0) - (b.meta.order_index ?? 0));

          const byType = (type: string) =>
            enriched
              .filter(r => r.meta.question_type === type)
              .map(r => (r.response_text || '').trim())
              .filter(Boolean);

          const textVals = byType('text');
          const emailVals = byType('email');
          const phoneVals = byType('phone');
          const selectVals = byType('select');
          const textareaVals = byType('textarea');

          const inferred = {
            organization_name: textVals[0] || '',
            contact_person: textVals[1] || '',
            email: emailVals[0] || '',
            phone: phoneVals[0] || '',
            organization_type: selectVals[0] || '',
            partnership_interest: selectVals[1] || '',
            message: textareaVals[0] || '',
          };

          basicData = {
            ...basicData,
            organization_name: basicData.organization_name || inferred.organization_name,
            contact_person: basicData.contact_person || inferred.contact_person,
            email: basicData.email || inferred.email,
            phone: basicData.phone || inferred.phone,
            organization_type: basicData.organization_type || inferred.organization_type,
            partnership_interest: basicData.partnership_interest || inferred.partnership_interest,
            message: basicData.message || inferred.message,
          };
        }
      }

      // Required columns in partnership_inquiries
      if (!basicData.organization_name || !basicData.contact_person || !basicData.email || !basicData.phone) {
        throw new Error('Missing required fields (organization_name / contact_person / email / phone).');
      }

      const { data: inquiry, error: inquiryError } = await supabase
        .from('partnership_inquiries')
        .insert([basicData])
        .select()
        .single();

      if (inquiryError) throw inquiryError;

      // Save detailed dynamic responses (DB questions only)
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
