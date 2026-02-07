import { Briefcase, Mail, FileText, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageHeader from '../../components/PageHeader';
import { fadeInUp, fadeInLeft, fadeInRight, staggerContainer, staggerItem, scaleIn } from '../../lib/animations';
import { useContent } from '../../contexts/ContentContext';

export default function Jobs() {
  const { getContent } = useContent();
  const c = (key: string, fallback: string) => getContent('jobs', key, fallback);

  return (
    <div>
      <PageHeader
        title="Jobs / Roles / Opportunities"
        description=""
        breadcrumbs={[{ label: 'Get Involved', path: '/get-involved/jobs' }, { label: 'Jobs' }]}
        pageKey="jobs"
      />

      <div className="pt-20">
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

            <motion.div
              className="bg-accent p-10 rounded-lg mb-12 text-center"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
            >
              <h2 className="text-3xl font-bold text-primary mb-6">{c('current_title', 'Current Opportunities')}</h2>
              <p className="text-lg text-secondary mb-8">
                {c('current_desc', 'We don\'t have any open positions at the moment, but we\'re always interested in hearing from talented individuals who share our values.')}
              </p>
              <div className="bg-white p-6 rounded-lg">
                <h3 className="text-xl font-bold text-primary mb-4">{c('register_title', 'Register Your Interest')}</h3>
                <p className="text-muted mb-6">
                  {c('register_desc', 'Send us your CV and a cover letter explaining why you\'d like to work with YCA Birmingham. We\'ll keep your details on file and contact you when suitable opportunities arise.')}
                </p>
              </div>
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
      </div>
    </div>
  );
}
