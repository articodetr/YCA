import { Heart, Users, Building, TrendingUp, Mail, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Elements } from '@stripe/react-stripe-js';
import PageHeader from '../../components/PageHeader';
import DonationForm from '../../components/DonationForm';
import { stripePromise } from '../../lib/stripe';
import { fadeInUp, fadeInLeft, fadeInRight, staggerContainer, staggerItem, scaleIn } from '../../lib/animations';

export default function Donate() {
  return (
    <div>
      <PageHeader
        title="Donate / Support Us"
        description=""
        breadcrumbs={[{ label: 'Get Involved', path: '/get-involved/donate' }, { label: 'Donate' }]}
        image="https://images.pexels.com/photos/6646917/pexels-photo-6646917.jpeg?auto=compress&cs=tinysrgb&w=1920"
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
                YCA Birmingham relies on the generosity of individuals, businesses, and organizations to continue delivering vital services to the Yemeni community in Birmingham. Your donation, no matter the size, helps us support those who need it most.
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
              <h2 className="text-3xl font-bold text-primary mb-8 text-center">How Your Donation Helps</h2>
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
                  <h3 className="text-xl font-bold text-primary mb-3">Support Services</h3>
                  <p className="text-muted">
                    Fund advice and guidance services for vulnerable community members who need help navigating UK systems.
                  </p>
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
                  <h3 className="text-xl font-bold text-primary mb-3">Community Programmes</h3>
                  <p className="text-muted">
                    Keep our youth, women's, elderly, and children's programmes running and accessible to all.
                  </p>
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
                  <h3 className="text-xl font-bold text-primary mb-3">Facilities & Resources</h3>
                  <p className="text-muted">
                    Maintain our community spaces and provide necessary resources for our services.
                  </p>
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
                  <h3 className="text-xl font-bold text-primary mb-3">Future Growth</h3>
                  <p className="text-muted">
                    Expand our services to reach more people and develop new programmes based on community needs.
                  </p>
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
              <h2 className="text-3xl font-bold mb-6">Other Ways to Donate</h2>
              <p className="text-xl mb-8 leading-relaxed max-w-2xl mx-auto">
                Prefer to donate via bank transfer, cheque, or in person? Contact us to discuss alternative donation options. We are a registered charity (Number: 1057470).
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.a
                  href="mailto:INFO@yca-birmingham.org.uk"
                  className="bg-accent text-primary px-8 py-4 rounded-lg hover:bg-hover transition-colors font-semibold flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Mail size={20} />
                  Email Us
                </motion.a>
                <motion.a
                  href="tel:01214395280"
                  className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg hover:bg-white hover:text-primary transition-colors font-semibold flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Phone size={20} />
                  Call: 0121 439 5280
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
          <h2 className="text-3xl font-bold text-primary mb-4">Other Ways to Support</h2>
          <p className="text-lg text-muted max-w-3xl mx-auto mb-8">
            Can't donate right now? You can still support us by volunteering your time, attending our events, or spreading the word about our work.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link to="/get-involved/volunteer" className="bg-primary text-white px-8 py-4 rounded-lg hover:bg-secondary transition-colors font-semibold">
                Become a Volunteer
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link to="/get-involved/membership" className="bg-white border-2 border-primary text-primary px-8 py-4 rounded-lg hover:bg-primary hover:text-white transition-colors font-semibold">
                Become a Member
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </section>
      </div>
    </div>
  );
}
