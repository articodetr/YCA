import { HandHeart, Users, Calendar, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState } from 'react';
import PageHeader from '../../components/PageHeader';
import { fadeInUp, staggerContainer, staggerItem } from '../../lib/animations';
import { supabase } from '../../lib/supabase';
import { useContent } from '../../contexts/ContentContext';
import { useLanguage } from '../../contexts/LanguageContext';
import DynamicFormModal from '../../components/modals/DynamicFormModal';

export default function Volunteer() {
  const { getContent } = useContent();
  const { language } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const c = (key: string, fallback: string) => getContent('volunteer', key, fallback);

  const handleFormSubmit = async (
    formData: Record<string, any>,
    responses: Array<{ question_id: string; response_text: string; response_files?: any[] }>
  ) => {
    try {
      const fieldMap: Record<string, string> = {
        v1: 'full_name', v2: 'email', v3: 'phone', v4: 'date_of_birth',
        v5: 'address', v6: 'interests', v7: 'skills', v8: 'experience',
        v9: 'why_volunteer', v10: 'availability', v11: 'emergency_contact_name',
        v12: 'emergency_contact_phone',
      };

      const mapped: Record<string, any> = {};
      for (const [key, value] of Object.entries(formData)) {
        const colName = fieldMap[key] || key;
        mapped[colName] = Array.isArray(value) ? value.join(', ') : value;
      }

      const basicData = {
        full_name: mapped.full_name || responses.find(r => r.response_text && r.question_id.startsWith('v1'))?.response_text || '',
        email: mapped.email || '',
        phone: mapped.phone || '',
        address: mapped.address || '',
        date_of_birth: mapped.date_of_birth || null,
        interests: mapped.interests || '',
        skills: mapped.skills || '',
        availability: mapped.availability || '',
        experience: mapped.experience || '',
        why_volunteer: mapped.why_volunteer || '',
        emergency_contact_name: mapped.emergency_contact_name || '',
        emergency_contact_phone: mapped.emergency_contact_phone || '',
      };

      const { data: application, error: applicationError } = await supabase
        .from('volunteer_applications')
        .insert([basicData])
        .select()
        .single();

      if (applicationError) throw applicationError;

      try {
        const isFallbackId = (id: string) => /^v\d+$/.test(id);
        const validResponses = responses.filter(r => !isFallbackId(r.question_id));

        if (validResponses.length > 0) {
          const responsesToInsert = validResponses.map(r => ({
            form_type: 'volunteer',
            application_id: application.id,
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
      console.error('Error submitting volunteer application:', error);
      throw error;
    }
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
                {opportunities.map((opportunity, index) => {
                  const colors = [
                    { bg: 'bg-white', border: 'border-emerald-500', text: 'text-primary' },
                    { bg: 'bg-white', border: 'border-blue-500', text: 'text-primary' },
                    { bg: 'bg-white', border: 'border-amber-500', text: 'text-primary' },
                    { bg: 'bg-white', border: 'border-rose-500', text: 'text-primary' },
                    { bg: 'bg-white', border: 'border-teal-500', text: 'text-primary' },
                    { bg: 'bg-white', border: 'border-purple-500', text: 'text-primary' },
                  ];
                  const color = colors[index % colors.length];

                  return (
                    <motion.div
                      key={index}
                      className={`${color.bg} p-6 rounded-2xl shadow-lg border-2 border-transparent hover:${color.border}`}
                      variants={staggerItem}
                      whileHover={{ y: -8, transition: { duration: 0.3 } }}
                    >
                      <h3 className={`text-xl font-bold ${color.text} mb-3`}>{opportunity.title}</h3>
                      <p className="text-muted">{opportunity.description}</p>
                    </motion.div>
                  );
                })}
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
              className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-12 rounded-2xl text-center shadow-2xl"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
            >
              <motion.div
                className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6"
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                <HandHeart size={40} className="text-white" />
              </motion.div>

              <h2 className="text-4xl font-bold mb-4">
                {c('apply_title', 'Apply to Volunteer')}
              </h2>
              <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
                {c('apply_desc', 'Complete our simple application form and start making a difference in your community. We\'ll review your application and get back to you within 2-3 business days.')}
              </p>

              {submitSuccess && (
                <motion.div
                  className="bg-white/20 border-2 border-white text-white p-6 rounded-lg mb-8 max-w-2xl mx-auto"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <h3 className="font-bold text-xl mb-2">Application Submitted Successfully!</h3>
                  <p>Thank you for your interest in volunteering. We'll review your application and contact you soon.</p>
                </motion.div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-white text-emerald-700 px-10 py-5 rounded-xl hover:bg-emerald-50 transition-colors font-bold text-lg flex items-center justify-center gap-3 shadow-lg"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <HandHeart size={24} />
                  {language === 'ar' ? 'ابدأ طلب التطوع' : 'Start Application'}
                </motion.button>

                <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/contact"
                    className="bg-white/10 border-2 border-white text-white px-10 py-5 rounded-xl hover:bg-white hover:text-emerald-700 transition-colors font-bold text-lg flex items-center justify-center gap-3"
                  >
                    <Mail size={24} />
                    {language === 'ar' ? 'هل لديك أسئلة؟' : 'Questions?'}
                  </Link>
                </motion.div>
              </div>
            </motion.div>

            <DynamicFormModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              formType="volunteer"
              title="Volunteer Application"
              titleAr="طلب تطوع"
              onSubmit={handleFormSubmit}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
