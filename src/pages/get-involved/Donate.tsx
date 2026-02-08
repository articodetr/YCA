import { Heart, Users, Building, TrendingUp, Mail, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Elements } from '@stripe/react-stripe-js';
import PageHeader from '../../components/PageHeader';
import DonationForm from '../../components/DonationForm';
import { stripePromise } from '../../lib/stripe';
import { fadeInUp, staggerContainer, staggerItem, scaleIn } from '../../lib/animations';
import { useLanguage } from '../../contexts/LanguageContext';

export default function Donate() {
  const { t, isRTL } = useLanguage();

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'}>
      <PageHeader
        title={t('donate.title')}
        description=""
        breadcrumbs={[{ label: t('nav.getInvolved'), path: '/get-involved/donate' }, { label: t('nav.getInvolved.donate') }]}
        pageKey="donate"
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
              <p className="text-lg text-muted leading-relaxed mb-6">
                {t('donate.intro')}
              </p>
            </motion.div>

            <Elements stripe={stripePromise}>
              <DonationForm />
            </Elements>

            <motion.div
              className="bg-sand p-10 rounded-lg mb-12 mt-16"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={scaleIn}
            >
              <h2 className="text-3xl font-bold text-primary mb-8 text-center">{t('donate.howHelps')}</h2>
              <motion.div
                className="grid md:grid-cols-2 gap-6"
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
                  <motion.div
                    className="w-14 h-14 bg-accent rounded-full flex items-center justify-center mb-4"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <Users size={28} className="text-primary" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-primary mb-3">{t('donate.supportServices')}</h3>
                  <p className="text-muted">{t('donate.supportServicesDesc')}</p>
                </motion.div>
                <motion.div
                  className="bg-white p-6 rounded-lg"
                  variants={staggerItem}
                  whileHover={{ scale: 1.03 }}
                >
                  <motion.div
                    className="w-14 h-14 bg-accent rounded-full flex items-center justify-center mb-4"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <Heart size={28} className="text-primary" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-primary mb-3">{t('donate.communityProgrammes')}</h3>
                  <p className="text-muted">{t('donate.communityProgrammesDesc')}</p>
                </motion.div>
                <motion.div
                  className="bg-white p-6 rounded-lg"
                  variants={staggerItem}
                  whileHover={{ scale: 1.03 }}
                >
                  <motion.div
                    className="w-14 h-14 bg-accent rounded-full flex items-center justify-center mb-4"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <Building size={28} className="text-primary" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-primary mb-3">{t('donate.facilities')}</h3>
                  <p className="text-muted">{t('donate.facilitiesDesc')}</p>
                </motion.div>
                <motion.div
                  className="bg-white p-6 rounded-lg"
                  variants={staggerItem}
                  whileHover={{ scale: 1.03 }}
                >
                  <motion.div
                    className="w-14 h-14 bg-accent rounded-full flex items-center justify-center mb-4"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <TrendingUp size={28} className="text-primary" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-primary mb-3">{t('donate.futureGrowth')}</h3>
                  <p className="text-muted">{t('donate.futureGrowthDesc')}</p>
                </motion.div>
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
                <Heart size={36} className="text-primary" />
              </motion.div>
              <h2 className="text-3xl font-bold mb-6">{t('donate.otherWays')}</h2>
              <p className="text-xl mb-8 leading-relaxed max-w-2xl mx-auto">
                {t('donate.otherWaysDesc')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.a
                  href="mailto:info@yca-birmingham.org.uk"
                  className="bg-accent text-primary px-8 py-4 rounded-lg hover:bg-hover transition-colors font-semibold flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Mail size={20} />
                  {t('donate.emailUs')}
                </motion.a>
                <motion.a
                  href="tel:01214395280"
                  className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg hover:bg-white hover:text-primary transition-colors font-semibold flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Phone size={20} />
                  0121 439 5280
                </motion.a>
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
          <h2 className="text-3xl font-bold text-primary mb-4">{t('donate.otherSupport')}</h2>
          <p className="text-lg text-muted max-w-3xl mx-auto mb-8">
            {t('donate.otherSupportDesc')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link to="/get-involved/volunteer" className="bg-primary text-white px-8 py-4 rounded-lg hover:bg-secondary transition-colors font-semibold">
                {t('donate.becomeVolunteer')}
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link to="/membership" className="bg-white border-2 border-primary text-primary px-8 py-4 rounded-lg hover:bg-primary hover:text-white transition-colors font-semibold">
                {t('donate.becomeMember')}
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </section>
      </div>
    </div>
  );
}
