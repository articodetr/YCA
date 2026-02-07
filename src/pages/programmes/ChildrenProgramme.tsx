import { Smile, Palette, Users, Trophy, Calendar, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageHeader from '../../components/PageHeader';
import { fadeInUp, fadeInLeft, fadeInRight, staggerContainer, staggerItem, scaleIn } from '../../lib/animations';

export default function ChildrenProgramme() {
  return (
    <div>
      <PageHeader
        title="Children's Programme"
        description=""
        breadcrumbs={[{ label: 'Programmes', path: '/programmes/children' }, { label: 'Children' }]}
        pageKey="programmes_children"
      />

      <div className="pt-20">
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
                At YCA Birmingham, we are dedicated to providing a vibrant and nurturing environment where our youngest community members can explore their potential. Our Children's Programme focuses on building confidence, fostering social skills, and celebrating our rich cultural identity through fun, hands-on activities.
              </p>
            </motion.div>

            <div className="mb-12">
              <motion.h2
                className="text-3xl font-bold text-primary mb-8"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
              >
                Cultural Enrichment & Creativity
              </motion.h2>
              <motion.p
                className="text-lg text-muted mb-6 leading-relaxed"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
              >
                We believe in giving children a strong sense of identity and pride in their heritage through engaging, creative sessions:
              </motion.p>
              <motion.div
                className="space-y-6"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={staggerContainer}
              >
                <motion.div
                  className="bg-accent p-6 rounded-lg flex items-start gap-6"
                  variants={staggerItem}
                  whileHover={{ y: -8, transition: { duration: 0.3 } }}
                >
                  <motion.div
                    className="w-16 h-16 bg-primary rounded-full flex items-center justify-center flex-shrink-0"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <Palette size={28} className="text-accent" />
                  </motion.div>
                  <div>
                    <h3 className="text-xl font-bold text-primary mb-2">Creative Arts & Crafts</h3>
                    <p className="text-secondary">
                      Where children express themselves through painting, traditional Yemeni-inspired crafts, and collaborative art projects.
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  className="bg-accent p-6 rounded-lg flex items-start gap-6"
                  variants={staggerItem}
                  whileHover={{ y: -8, transition: { duration: 0.3 } }}
                >
                  <motion.div
                    className="w-16 h-16 bg-primary rounded-full flex items-center justify-center flex-shrink-0"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <Users size={28} className="text-accent" />
                  </motion.div>
                  <div>
                    <h3 className="text-xl font-bold text-primary mb-2">Storytelling & Heritage</h3>
                    <p className="text-secondary">
                      We keep our history alive by sharing traditional folktales and stories of our ancestors, helping children understand and appreciate their dual Yemeni-British identity.
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  className="bg-accent p-6 rounded-lg flex items-start gap-6"
                  variants={staggerItem}
                  whileHover={{ y: -8, transition: { duration: 0.3 } }}
                >
                  <motion.div
                    className="w-16 h-16 bg-primary rounded-full flex items-center justify-center flex-shrink-0"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <Smile size={28} className="text-accent" />
                  </motion.div>
                  <div>
                    <h3 className="text-xl font-bold text-primary mb-2">Cultural Celebrations</h3>
                    <p className="text-secondary">
                      Children are always at the heart of our community festivals, participating in traditional performances, music, and celebrations throughout the year.
                    </p>
                  </div>
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
                Active Play & Social Development
              </motion.h2>
              <motion.p
                className="text-lg text-muted mb-6 leading-relaxed"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
              >
                Physical activity and making friends are the core of our weekend and holiday sessions:
              </motion.p>
              <motion.div
                className="grid md:grid-cols-3 gap-6"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={staggerContainer}
              >
                <motion.div
                  className="bg-sand p-6 rounded-lg text-center"
                  variants={staggerItem}
                  whileHover={{ scale: 1.03 }}
                >
                  <motion.div
                    className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <Trophy size={28} className="text-primary" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-primary mb-3">Supervised Play & Sports</h3>
                  <p className="text-muted">
                    A safe, high-energy space for children to stay active, develop teamwork through sports, and build social skills.
                  </p>
                </motion.div>
                <motion.div
                  className="bg-sand p-6 rounded-lg text-center"
                  variants={staggerItem}
                  whileHover={{ scale: 1.03 }}
                >
                  <motion.div
                    className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <Users size={28} className="text-primary" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-primary mb-3">Lifelong Friendships</h3>
                  <p className="text-muted">
                    We provide a consistent place for children to interact with their peers and form strong support networks.
                  </p>
                </motion.div>
                <motion.div
                  className="bg-sand p-6 rounded-lg text-center"
                  variants={staggerItem}
                  whileHover={{ scale: 1.03 }}
                >
                  <motion.div
                    className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <Smile size={28} className="text-primary" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-primary mb-3">Holiday Programmes</h3>
                  <p className="text-muted">
                    Special "Fun Days" during school breaks featuring local trips, outdoor adventures, and themed workshops.
                  </p>
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
                  <Smile size={36} className="text-primary" />
                </motion.div>
                <h2 className="text-3xl font-bold mb-6">Join Our Children's Programme</h2>
                <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto leading-relaxed">
                  A nurturing environment where children can explore, play, and celebrate their cultural heritage.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      to="/events"
                      className="inline-flex items-center justify-center gap-2 bg-accent text-primary px-8 py-4 rounded-lg hover:bg-hover transition-colors font-semibold"
                    >
                      <Calendar size={20} />
                      View Activities
                    </Link>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      to="/contact"
                      className="inline-flex items-center justify-center gap-2 bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg hover:bg-white hover:text-primary transition-colors font-semibold"
                    >
                      <Mail size={20} />
                      Contact Us
                    </Link>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      </div>
    </div>
  );
}
