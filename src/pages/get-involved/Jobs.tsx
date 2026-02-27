import { Briefcase, Mail, FileText, Users, MapPin, Clock, DollarSign, Calendar, Loader2, Send, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import PageHeader from '../../components/PageHeader';
import { fadeInUp, fadeInLeft, fadeInRight, staggerContainer, staggerItem, scaleIn } from '../../lib/animations';
import { useContent } from '../../contexts/ContentContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { supabase } from '../../lib/supabase';
import DynamicFormModal from '../../components/modals/DynamicFormModal';

interface JobPosting {
  id: string;
  title_en: string;
  title_ar: string;
  description_en: string;
  description_ar: string;
  department: string;
  employment_type: string;
  location: string;
  salary_range: string;
  requirements_en: string;
  requirements_ar: string;
  responsibilities_en: string;
  responsibilities_ar: string;
  application_deadline: string;
  application_url?: string;
  applications_count: number;
}

export default function Jobs() {
  const { getContent } = useContent();
  const { language } = useLanguage();
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const c = (key: string, fallback: string) => getContent('jobs', key, fallback);

  useEffect(() => {
    loadJobPostings();
  }, []);

  const loadJobPostings = async () => {
    try {
      const { data, error } = await supabase
        .from('job_postings')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJobPostings(data || []);
    } catch (error) {
      console.error('Error loading job postings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitApplication = async (
    formData: Record<string, any>,
    responses: Array<{ question_id: string; response_text: string; response_files?: any[] }>
  ) => {
    if (!selectedJob) return;

    try {
      const basicData = {
        job_posting_id: selectedJob.id,
        full_name: formData.full_name || '',
        email: formData.email || '',
        phone: formData.phone || '',
        resume_url: formData.resume_url || '',
        cover_letter: formData.cover_letter || '',
        portfolio_url: formData.portfolio_url || null
      };

      const { data: application, error: appError } = await supabase
        .from('job_applications')
        .insert([basicData])
        .select()
        .single();

      if (appError) throw appError;

      const responsesToInsert = responses.map(r => ({
        form_type: 'job_application',
        application_id: application.id,
        question_id: r.question_id,
        response_text: r.response_text,
        response_files: r.response_files || []
      }));

      if (responsesToInsert.length > 0) {
        const { error: responseError } = await supabase
          .from('form_responses')
          .insert(responsesToInsert);

        if (responseError) throw responseError;
      }

      setSubmitSuccess(true);
      setSelectedJob(null);
      setIsModalOpen(false);
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (error) {
      console.error('Error submitting application:', error);
      throw error;
    }
  };

  return (
    <div>
      <PageHeader
        title="Jobs / Roles / Opportunities"
        description=""
        breadcrumbs={[{ label: 'Get Involved', path: '/get-involved/jobs' }, { label: 'Jobs' }]}
        pageKey="jobs"
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
                {c('intro', 'YCA Birmingham is always looking for passionate, dedicated individuals to join our team. Whether you\'re looking for paid employment or volunteer roles, we offer opportunities to make a real difference in the community.')}
              </p>
            </motion.div>

            <motion.div
              className="bg-sand p-10 rounded-lg mb-12"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={scaleIn}
            >
              <h2 className="text-3xl font-bold text-primary mb-6 text-center">{c('why_work_title', 'Why Work With Us?')}</h2>
              <motion.div
                className="grid md:grid-cols-2 gap-6"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={staggerContainer}
              >
                <motion.div className="flex items-start gap-4" variants={staggerItem}>
                  <motion.div
                    className="w-12 h-12 bg-accent rounded-full flex items-center justify-center flex-shrink-0"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <Users size={24} className="text-primary" />
                  </motion.div>
                  <div>
                    <h3 className="text-xl font-bold text-primary mb-2">{c('why_1_title', 'Meaningful Work')}</h3>
                    <p className="text-muted">{c('why_1_desc', 'Make a real difference in people\'s lives every day')}</p>
                  </div>
                </motion.div>
                <motion.div className="flex items-start gap-4" variants={staggerItem}>
                  <motion.div
                    className="w-12 h-12 bg-accent rounded-full flex items-center justify-center flex-shrink-0"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <Briefcase size={24} className="text-primary" />
                  </motion.div>
                  <div>
                    <h3 className="text-xl font-bold text-primary mb-2">{c('why_2_title', 'Career Development')}</h3>
                    <p className="text-muted">{c('why_2_desc', 'Opportunities for professional growth and training')}</p>
                  </div>
                </motion.div>
                <motion.div className="flex items-start gap-4" variants={staggerItem}>
                  <motion.div
                    className="w-12 h-12 bg-accent rounded-full flex items-center justify-center flex-shrink-0"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <Users size={24} className="text-primary" />
                  </motion.div>
                  <div>
                    <h3 className="text-xl font-bold text-primary mb-2">{c('why_3_title', 'Supportive Team')}</h3>
                    <p className="text-muted">{c('why_3_desc', 'Work alongside passionate, dedicated colleagues')}</p>
                  </div>
                </motion.div>
                <motion.div className="flex items-start gap-4" variants={staggerItem}>
                  <motion.div
                    className="w-12 h-12 bg-accent rounded-full flex items-center justify-center flex-shrink-0"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <Briefcase size={24} className="text-primary" />
                  </motion.div>
                  <div>
                    <h3 className="text-xl font-bold text-primary mb-2">{c('why_4_title', 'Community Impact')}</h3>
                    <p className="text-muted">{c('why_4_desc', 'Be part of a respected community organization')}</p>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>

            {submitSuccess && (
              <motion.div
                className="bg-green-500 text-white p-6 rounded-lg mb-8 text-center shadow-lg"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h3 className="font-bold text-xl mb-2">
                  {language === 'ar' ? 'تم إرسال طلبك بنجاح!' : 'Application Submitted Successfully!'}
                </h3>
                <p>
                  {language === 'ar'
                    ? 'شكراً لاهتمامك بالعمل معنا. سنراجع طلبك ونتواصل معك قريباً.'
                    : 'Thank you for your interest. We\'ll review your application and get back to you soon.'}
                </p>
              </motion.div>
            )}

            <motion.div
              className="mb-12"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
            >
              <h2 className="text-3xl font-bold text-primary mb-8 text-center">
                {c('current_title', 'Current Opportunities')}
              </h2>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="animate-spin text-primary" size={48} />
                </div>
              ) : jobPostings.length > 0 ? (
                <motion.div
                  className="space-y-6"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={staggerContainer}
                >
                  {jobPostings.map((job) => (
                    <motion.div
                      key={job.id}
                      className="bg-white border-2 border-gray-200 rounded-xl p-8 hover:border-primary hover:shadow-lg transition-all"
                      variants={staggerItem}
                      whileHover={{ y: -4 }}
                    >
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold text-primary mb-2">
                            {language === 'ar' ? job.title_ar : job.title_en}
                          </h3>
                          <div className="flex flex-wrap gap-4 text-sm text-muted">
                            {job.department && (
                              <span className="flex items-center gap-1">
                                <Briefcase size={16} />
                                {job.department}
                              </span>
                            )}
                            {job.location && (
                              <span className="flex items-center gap-1">
                                <MapPin size={16} />
                                {job.location}
                              </span>
                            )}
                            {job.employment_type && (
                              <span className="flex items-center gap-1">
                                <Clock size={16} />
                                {job.employment_type.replace('_', ' ')}
                              </span>
                            )}
                            {job.salary_range && (
                              <span className="flex items-center gap-1">
                                <DollarSign size={16} />
                                {job.salary_range}
                              </span>
                            )}
                          </div>
                        </div>
                        {job.application_url ? (
                        <motion.a
                          href={job.application_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-secondary transition-colors font-semibold whitespace-nowrap inline-flex items-center justify-center"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {language === 'ar' ? 'قدم الآن' : 'Apply Now'}
                        </motion.a>
                      ) : (
                        <motion.button
                          onClick={() => {
                            setSelectedJob(job);
                            setIsModalOpen(true);
                          }}
                          className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-secondary transition-colors font-semibold whitespace-nowrap"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {language === 'ar' ? 'قدم الآن' : 'Apply Now'}
                        </motion.button>
                      )}
                      </div>

                      <p className="text-muted mb-4 line-clamp-3">
                        {language === 'ar' ? job.description_ar : job.description_en}
                      </p>

                      {job.application_deadline && (
                        <div className="flex items-center gap-2 text-sm text-orange-600 bg-orange-50 px-4 py-2 rounded-lg inline-flex">
                          <Calendar size={16} />
                          <span>
                            {language === 'ar' ? 'آخر موعد للتقديم: ' : 'Application deadline: '}
                            {new Date(job.application_deadline).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <div className="bg-accent p-10 rounded-lg text-center">
                  <p className="text-lg text-secondary mb-6">
                    {c('current_desc', 'We don\'t have any open positions at the moment, but we\'re always interested in hearing from talented individuals who share our values.')}
                  </p>
                  <div className="bg-white p-6 rounded-lg">
                    <h3 className="text-xl font-bold text-primary mb-4">
                      {c('register_title', 'Register Your Interest')}
                    </h3>
                    <p className="text-muted mb-6">
                      {c('register_desc', 'Send us your CV and a cover letter explaining why you\'d like to work with YCA Birmingham. We\'ll keep your details on file and contact you when suitable opportunities arise.')}
                    </p>
                  </div>
                </div>
              )}
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
                <h3 className="text-2xl font-bold mb-4">{c('typical_roles_title', 'Typical Roles')}</h3>
                <p className="mb-4">{c('typical_roles_intro', 'Positions we typically recruit for:')}</p>
                <ul className="space-y-2">
                  <li>{c('role_1', 'Community Support Workers')}</li>
                  <li>{c('role_2', 'Advice & Guidance Officers')}</li>
                  <li>{c('role_3', 'Programme Coordinators')}</li>
                  <li>{c('role_4', 'Admin & Office Staff')}</li>
                  <li>{c('role_5', 'Youth Workers')}</li>
                  <li>{c('role_6', 'Translators & Interpreters')}</li>
                </ul>
              </motion.div>

              <motion.div
                className="bg-sand p-8 rounded-lg"
                variants={fadeInRight}
                whileHover={{ scale: 1.03 }}
              >
                <h3 className="text-2xl font-bold text-primary mb-4">{c('look_for_title', 'What We Look For')}</h3>
                <p className="text-muted mb-4">{c('look_for_intro', 'Ideal candidates typically have:')}</p>
                <ul className="space-y-2 text-muted">
                  <li>{c('quality_1', 'Passion for community work')}</li>
                  <li>{c('quality_2', 'Bilingual skills (Arabic/English preferred)')}</li>
                  <li>{c('quality_3', 'Cultural awareness and sensitivity')}</li>
                  <li>{c('quality_4', 'Strong communication skills')}</li>
                  <li>{c('quality_5', 'Commitment to our values')}</li>
                  <li>{c('quality_6', 'Relevant qualifications or experience')}</li>
                </ul>
              </motion.div>
            </motion.div>

            <motion.div
              className="bg-primary text-white p-10 rounded-lg text-center"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={scaleIn}
            >
              <motion.div
                className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mx-auto mb-6"
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                <Briefcase size={36} className="text-primary" />
              </motion.div>
              <h2 className="text-3xl font-bold mb-6">{c('contact_title', 'Get in Touch')}</h2>
              <p className="text-xl mb-8 leading-relaxed max-w-2xl mx-auto">
                {c('contact_desc', 'Interested in working with us? Send your CV and cover letter to our team.')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.a
                  href="mailto:info@yca-birmingham.org.uk"
                  className="bg-accent text-primary px-8 py-4 rounded-lg hover:bg-hover transition-colors font-semibold flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Mail size={20} />
                  Send Your CV
                </motion.a>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/contact"
                    className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg hover:bg-white hover:text-primary transition-colors font-semibold"
                  >
                    Contact Us
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {selectedJob && !isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSelectedJob(null)}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-gradient-to-r from-primary to-accent p-6 text-white z-10">
              <button
                onClick={() => setSelectedJob(null)}
                className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
              <h2 className="text-3xl font-bold mb-2">
                {language === 'ar' ? selectedJob.title_ar : selectedJob.title_en}
              </h2>
              <div className="flex flex-wrap gap-4 text-sm">
                {selectedJob.department && (
                  <span className="flex items-center gap-1 opacity-90">
                    <Briefcase size={16} />
                    {selectedJob.department}
                  </span>
                )}
                {selectedJob.location && (
                  <span className="flex items-center gap-1 opacity-90">
                    <MapPin size={16} />
                    {selectedJob.location}
                  </span>
                )}
              </div>
            </div>

            <div className="p-8">
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-primary mb-4">
                  {language === 'ar' ? 'الوصف الوظيفي' : 'Job Description'}
                </h3>
                <p className="text-muted whitespace-pre-line">
                  {language === 'ar' ? selectedJob.description_ar : selectedJob.description_en}
                </p>
              </div>

              {(selectedJob.responsibilities_en || selectedJob.responsibilities_ar) && (
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-primary mb-4">
                    {language === 'ar' ? 'المسؤوليات' : 'Responsibilities'}
                  </h3>
                  <p className="text-muted whitespace-pre-line">
                    {language === 'ar' ? selectedJob.responsibilities_ar : selectedJob.responsibilities_en}
                  </p>
                </div>
              )}

              {(selectedJob.requirements_en || selectedJob.requirements_ar) && (
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-primary mb-4">
                    {language === 'ar' ? 'المتطلبات' : 'Requirements'}
                  </h3>
                  <p className="text-muted whitespace-pre-line">
                    {language === 'ar' ? selectedJob.requirements_ar : selectedJob.requirements_en}
                  </p>
                </div>
              )}

              <div className="flex justify-end pt-8 border-t">
                <motion.button
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-lg hover:bg-secondary transition-colors font-semibold"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Send size={20} />
                  {language === 'ar' ? 'تقديم الطلب' : 'Start Application'}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {isModalOpen && selectedJob && (
        <DynamicFormModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedJob(null);
          }}
          formType="job_application"
          title={`Apply for ${selectedJob.title_en}`}
          titleAr={`التقديم على ${selectedJob.title_ar}`}
          onSubmit={handleSubmitApplication}
          jobPostingId={selectedJob.id}
        />
      )}
    </div>
  );
}
