import { Briefcase, Mail, FileText, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageHeader from '../../components/PageHeader';
import { fadeInUp, fadeInLeft, fadeInRight, staggerContainer, staggerItem, scaleIn } from '../../lib/animations';

export default function Jobs() {
  return (
    <div>
      <PageHeader
        title="Jobs / Roles / Opportunities"
        description=""
        breadcrumbs={[{ label: 'Get Involved', path: '/get-involved/jobs' }, { label: 'Jobs' }]}
        image="https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1920"
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
                YCA Birmingham is always looking for passionate, dedicated individuals to join our team. Whether you're looking for paid employment or volunteer roles, we offer opportunities to make a real difference in the community.
              </p>
            </motion.div>

            <motion.div
              className="bg-sand p-10 rounded-lg mb-12"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={scaleIn}
            >
              <h2 className="text-3xl font-bold text-primary mb-6 text-center">Why Work With Us?</h2>
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
                    <h3 className="text-xl font-bold text-primary mb-2">Meaningful Work</h3>
                    <p className="text-muted">Make a real difference in people's lives every day</p>
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
                    <h3 className="text-xl font-bold text-primary mb-2">Career Development</h3>
                    <p className="text-muted">Opportunities for professional growth and training</p>
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
                    <h3 className="text-xl font-bold text-primary mb-2">Supportive Team</h3>
                    <p className="text-muted">Work alongside passionate, dedicated colleagues</p>
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
                    <h3 className="text-xl font-bold text-primary mb-2">Community Impact</h3>
                    <p className="text-muted">Be part of a respected community organization</p>
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
              <h2 className="text-3xl font-bold text-primary mb-6">Current Opportunities</h2>
              <p className="text-lg text-secondary mb-8">
                We don't have any open positions at the moment, but we're always interested in hearing from talented individuals who share our values.
              </p>
              <div className="bg-white p-6 rounded-lg">
                <h3 className="text-xl font-bold text-primary mb-4">Register Your Interest</h3>
                <p className="text-muted mb-6">
                  Send us your CV and a cover letter explaining why you'd like to work with YCA Birmingham. We'll keep your details on file and contact you when suitable opportunities arise.
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
                <h3 className="text-2xl font-bold mb-4">Typical Roles</h3>
                <p className="mb-4">Positions we typically recruit for:</p>
                <ul className="space-y-2">
                  <li>• Community Support Workers</li>
                  <li>• Advice & Guidance Officers</li>
                  <li>• Programme Coordinators</li>
                  <li>• Admin & Office Staff</li>
                  <li>• Youth Workers</li>
                  <li>• Translators & Interpreters</li>
                </ul>
              </motion.div>

              <motion.div
                className="bg-sand p-8 rounded-lg"
                variants={fadeInRight}
                whileHover={{ scale: 1.03 }}
              >
                <h3 className="text-2xl font-bold text-primary mb-4">What We Look For</h3>
                <p className="text-muted mb-4">Ideal candidates typically have:</p>
                <ul className="space-y-2 text-muted">
                  <li>• Passion for community work</li>
                  <li>• Bilingual skills (Arabic/English preferred)</li>
                  <li>• Cultural awareness and sensitivity</li>
                  <li>• Strong communication skills</li>
                  <li>• Commitment to our values</li>
                  <li>• Relevant qualifications or experience</li>
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
              <h2 className="text-3xl font-bold mb-6">Get in Touch</h2>
              <p className="text-xl mb-8 leading-relaxed max-w-2xl mx-auto">
                Interested in working with us? Send your CV and cover letter to our team.
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
