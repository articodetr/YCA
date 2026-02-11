import { Heart, Users, Coffee, Calendar, Mail, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageHeader from '../../components/PageHeader';
import { fadeInUp, fadeInLeft, fadeInRight, staggerContainer, staggerItem, scaleIn } from '../../lib/animations';

export default function ElderlyProgramme() {
  return (
    <div>
      <PageHeader
        title="Elderly's Programme"
        description=""
        breadcrumbs={[{ label: 'Programmes', path: '/programmes/elderly' }, { label: 'Elderly' }]}
        pageKey="programmes_elderly"
      />

      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              className="bg-sand p-8 rounded-lg mb-12"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
            >
              <p className="text-lg text-muted leading-relaxed">
                At YCA Birmingham, our elders are the backbone of our community. We believe that aging should be a time of connection, not isolation. Our Elderly's Programme is designed to provide a warm, safe, and stimulating environment where our seniors can socialize, stay healthy, and remain an active part of community life.
              </p>
            </motion.div>

            <div className="mb-12">
              <motion.h2
                className="text-3xl font-bold text-primary mb-6"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
              >
                A Place to Gather, Share, and Eat
              </motion.h2>
              <motion.p
                className="text-lg text-muted leading-relaxed mb-6"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
              >
                We understand that for many of our elders, getting out of the house and sharing a meal is the highlight of the week. Our programme is more than just a meeting—it's a family atmosphere.
              </motion.p>

              <motion.div
                className="bg-accent p-8 rounded-lg"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={scaleIn}
              >
                <h3 className="text-2xl font-bold text-primary mb-6">The Weekly Gathering Includes:</h3>
                <motion.div
                  className="space-y-4"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={staggerContainer}
                >
                  <motion.div className="flex items-start gap-4" variants={staggerItem}>
                    <Coffee size={24} className="text-primary flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-bold text-lg text-primary mb-1">A Nutritious Shared Meal</h4>
                      <p className="text-secondary">
                        Every session includes a fresh, healthy, and culturally familiar meal served in a communal setting. We believe that "breaking bread" together is the best way to foster friendship and combat loneliness.
                      </p>
                    </div>
                  </motion.div>
                  <motion.div className="flex items-start gap-4" variants={staggerItem}>
                    <Coffee size={24} className="text-primary flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-bold text-lg text-primary mb-1">Tea & Coffee Social</h4>
                      <p className="text-secondary">
                        Time to catch up with old friends and meet new ones over traditional refreshments.
                      </p>
                    </div>
                  </motion.div>
                </motion.div>
              </motion.div>
            </div>

            <div className="mb-12">
              <motion.h2
                className="text-3xl font-bold text-primary mb-8"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
              >
                Programme Highlights
              </motion.h2>
              <motion.p
                className="text-lg text-muted mb-6 leading-relaxed"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
              >
                We provide a range of activities tailored specifically for the physical and mental wellbeing of our senior members:
              </motion.p>
              <motion.div
                className="grid md:grid-cols-2 gap-6"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={staggerContainer}
              >
                <motion.div
                  className="bg-sand p-6 rounded-lg"
                  variants={staggerItem}
                  whileHover={{ scale: 1.03 }}
                >
                  <motion.div
                    className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mb-4"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <Activity size={28} className="text-primary" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-primary mb-3">Health & Wellness Check-ins</h3>
                  <p className="text-muted">
                    Regular visits from health professionals to discuss blood pressure, diabetes management, and gentle exercises to maintain mobility.
                  </p>
                </motion.div>
                <motion.div
                  className="bg-sand p-6 rounded-lg"
                  variants={staggerItem}
                  whileHover={{ scale: 1.03 }}
                >
                  <motion.div
                    className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mb-4"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <Users size={28} className="text-primary" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-primary mb-3">Digital Inclusion</h3>
                  <p className="text-muted">
                    Simple, patient-led sessions on how to use smartphones and tablets to stay in touch with family abroad via video calls.
                  </p>
                </motion.div>
                <motion.div
                  className="bg-sand p-6 rounded-lg"
                  variants={staggerItem}
                  whileHover={{ scale: 1.03 }}
                >
                  <motion.div
                    className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mb-4"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <Heart size={28} className="text-primary" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-primary mb-3">Faith & Culture</h3>
                  <p className="text-muted">
                    Space for reflection, storytelling, and sharing traditional Yemeni history with the younger generation.
                  </p>
                </motion.div>
                <motion.div
                  className="bg-sand p-6 rounded-lg"
                  variants={staggerItem}
                  whileHover={{ scale: 1.03 }}
                >
                  <motion.div
                    className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mb-4"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <Users size={28} className="text-primary" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-primary mb-3">Advice & Support</h3>
                  <p className="text-muted">
                    Helping our elders understand their rights, access pensions, or navigate social services with the help of our bilingual staff.
                  </p>
                </motion.div>
              </motion.div>
            </div>

            <div className="mb-12">
              <motion.h2
                className="text-3xl font-bold text-primary mb-6"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
              >
                Combatting Isolation
              </motion.h2>
              <motion.p
                className="text-lg text-muted mb-6 leading-relaxed"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
              >
                Loneliness can have a significant impact on health. Our programme aims to:
              </motion.p>
              <motion.div
                className="space-y-4"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={staggerContainer}
              >
                <motion.div
                  className="border-l-4 border-accent pl-6 py-3"
                  variants={staggerItem}
                  whileHover={{ x: 8, transition: { duration: 0.3 } }}
                >
                  <h4 className="font-bold text-xl text-primary mb-2">Reduce Social Isolation</h4>
                  <p className="text-muted">By providing a regular, reliable place to go.</p>
                </motion.div>
                <motion.div
                  className="border-l-4 border-accent pl-6 py-3"
                  variants={staggerItem}
                  whileHover={{ x: 8, transition: { duration: 0.3 } }}
                >
                  <h4 className="font-bold text-xl text-primary mb-2">Foster Peer Support</h4>
                  <p className="text-muted">Creating a network where elders look out for one another.</p>
                </motion.div>
                <motion.div
                  className="border-l-4 border-accent pl-6 py-3"
                  variants={staggerItem}
                  whileHover={{ x: 8, transition: { duration: 0.3 } }}
                >
                  <h4 className="font-bold text-xl text-primary mb-2">Bridge the Gap</h4>
                  <p className="text-muted">Organising "Intergenerational Days" where our Youth and Children's programmes spend time learning from the wisdom of our elders.</p>
                </motion.div>
              </motion.div>
            </div>

            <motion.div
              className="bg-primary text-white p-10 rounded-lg"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={scaleIn}
            >
              <div className="text-center">
                <motion.div
                  className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mx-auto mb-6"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <Calendar size={36} className="text-primary" />
                </motion.div>
                <h2 className="text-3xl font-bold mb-6">Join Our Monthly Session</h2>
                <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto leading-relaxed">
                  All seniors in the community are welcome. Sessions are designed to be accessible and welcoming.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      to="/contact"
                      className="inline-flex items-center justify-center gap-2 bg-accent text-primary px-8 py-4 rounded-lg hover:bg-hover transition-colors font-semibold"
                    >
                      <Mail size={20} />
                      Check Next Session
                    </Link>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
