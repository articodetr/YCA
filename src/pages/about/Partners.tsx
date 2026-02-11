import { Building, Handshake, Award, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageHeader from '../../components/PageHeader';
import { fadeInUp, fadeInLeft, fadeInRight, staggerContainer, staggerItem, scaleIn } from '../../lib/animations';
import { useContent } from '../../contexts/ContentContext';

export default function Partners() {
  const { getContent } = useContent();
  const c = (key: string, fallback: string) => getContent('about_partners', key, fallback);

  return (
    <div>
      <PageHeader
        title="Partners & Funders"
        description=""
        breadcrumbs={[{ label: 'About', path: '/about/partners' }, { label: 'Partners' }]}
        pageKey="about_partners"
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
                {c('intro', 'YCA Birmingham is proud to work with a network of partners and funders who share our commitment to empowering the Yemeni community in Birmingham. Through these collaborations, we are able to expand our services and reach more people in need.')}
              </p>
            </motion.div>

            <motion.div
              className="grid md:grid-cols-3 gap-8 mb-16"
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
                  className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mx-auto mb-6"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <Building size={36} className="text-primary" />
                </motion.div>
                <h3 className="text-2xl font-bold text-primary mb-3">{c('local_authorities_title', 'Local Authorities')}</h3>
                <p className="text-muted">
                  {c('local_authorities_desc', 'Birmingham City Council and local government partners supporting community development')}
                </p>
              </motion.div>

              <motion.div
                className="bg-sand p-8 rounded-lg text-center"
                variants={staggerItem}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
              >
                <motion.div
                  className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mx-auto mb-6"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <Award size={36} className="text-primary" />
                </motion.div>
                <h3 className="text-2xl font-bold text-primary mb-3">{c('charitable_trusts_title', 'Charitable Trusts')}</h3>
                <p className="text-muted">
                  {c('charitable_trusts_desc', 'Charitable foundations and trusts funding our programmes and services')}
                </p>
              </motion.div>

              <motion.div
                className="bg-sand p-8 rounded-lg text-center"
                variants={staggerItem}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
              >
                <motion.div
                  className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mx-auto mb-6"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <Handshake size={36} className="text-primary" />
                </motion.div>
                <h3 className="text-2xl font-bold text-primary mb-3">{c('community_partners_title', 'Community Partners')}</h3>
                <p className="text-muted">
                  {c('community_partners_desc', 'Local organizations and community groups working alongside us')}
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
              <h2 className="text-3xl font-bold text-primary mb-6 text-center">{c('key_partnerships_title', 'Key Partnerships')}</h2>
              <motion.div
                className="space-y-4"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={staggerContainer}
              >
                <motion.div
                  className="bg-white p-6 rounded-lg"
                  variants={staggerItem}
                  whileHover={{ scale: 1.03 }}
                >
                  <h3 className="text-xl font-bold text-primary mb-2">{c('partner_1_name', 'Birmingham City Council')}</h3>
                  <p className="text-muted">
                    {c('partner_1_desc', 'Supporting community services, advice provision, and programme development')}
                  </p>
                </motion.div>
                <motion.div
                  className="bg-white p-6 rounded-lg"
                  variants={staggerItem}
                  whileHover={{ scale: 1.03 }}
                >
                  <h3 className="text-xl font-bold text-primary mb-2">{c('partner_2_name', 'The Muath Trust')}</h3>
                  <p className="text-muted">
                    {c('partner_2_desc', 'Providing premises and facilities for our community programmes')}
                  </p>
                </motion.div>
                <motion.div
                  className="bg-white p-6 rounded-lg"
                  variants={staggerItem}
                  whileHover={{ scale: 1.03 }}
                >
                  <h3 className="text-xl font-bold text-primary mb-2">{c('partner_3_name', 'NHS Birmingham and Solihull')}</h3>
                  <p className="text-muted">
                    {c('partner_3_desc', 'Health and wellbeing partnerships to support community health initiatives')}
                  </p>
                </motion.div>
                <motion.div
                  className="bg-white p-6 rounded-lg"
                  variants={staggerItem}
                  whileHover={{ scale: 1.03 }}
                >
                  <h3 className="text-xl font-bold text-primary mb-2">{c('partner_4_name', 'Local Solicitors and Legal Services')}</h3>
                  <p className="text-muted">
                    {c('partner_4_desc', 'Providing pro bono legal surgeries and advice for community members')}
                  </p>
                </motion.div>
              </motion.div>
            </motion.div>

            <motion.div
              className="bg-primary text-white p-10 rounded-lg"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
            >
              <h2 className="text-3xl font-bold mb-6 text-center">{c('become_partner_title', 'Become a Partner')}</h2>
              <p className="text-lg text-center mb-8 leading-relaxed">
                {c('become_partner_desc', 'Are you an organization interested in partnering with YCA Birmingham? We welcome collaborations that help us serve our community better.')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/get-involved/partnerships"
                    className="inline-flex items-center justify-center gap-2 bg-accent text-primary px-8 py-4 rounded-lg hover:bg-hover transition-colors font-semibold"
                  >
                    <Handshake size={20} />
                    Partnership Opportunities
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/contact"
                    className="inline-flex items-center justify-center gap-2 bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg hover:bg-white hover:text-primary transition-colors font-semibold"
                  >
                    <Mail size={20} />
                    Get in Touch
                  </Link>
                </motion.div>
              </div>
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
          <h2 className="text-3xl font-bold text-primary mb-4">{c('thank_you_title', 'Thank You to Our Partners')}</h2>
          <p className="text-lg text-muted max-w-3xl mx-auto">
            {c('thank_you_desc', 'We are grateful for the continued support of our partners and funders. Together, we are making a real difference in the lives of Yemeni families in Birmingham.')}
          </p>
        </motion.div>
      </section>
    </div>
  );
}
