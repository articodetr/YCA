import { Users, Trophy, Zap, Calendar, Mail, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageHeader from '../../components/PageHeader';
import { fadeInUp, fadeInLeft, fadeInRight, staggerContainer, staggerItem, scaleIn } from '../../lib/animations';

export default function MenProgramme() {
  return (
    <div>
      <PageHeader
        title="Men's Programme"
        description=""
        breadcrumbs={[{ label: 'Programmes', path: '/programmes/men' }, { label: 'Men' }]}
        image="https://images.pexels.com/photos/3766210/pexels-photo-3766210.jpeg?auto=compress&cs=tinysrgb&w=1920"
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
                The YCA Men's Programme is more than just a sports club; it is a vital social hub for men aged 18 and over in Birmingham. We provide a structured yet relaxed environment where you can stay active, de-stress after a long week, and build meaningful connections with others in the community.
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
                Friday Night Sports & Social
              </motion.h2>
              <motion.p
                className="text-lg text-muted mb-6 leading-relaxed"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
              >
                Our primary weekly gathering brings men together for a variety of high-energy and recreational activities. Whether you are looking for a competitive game or a casual chat, there is something for everyone.
              </motion.p>

              <motion.div
                className="bg-accent p-8 rounded-lg mb-8"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={scaleIn}
              >
                <h3 className="text-2xl font-bold text-primary mb-6">Diverse Activities:</h3>
                <motion.div
                  className="space-y-4"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={staggerContainer}
                >
                  <motion.div className="flex items-start gap-4" variants={staggerItem}>
                    <Trophy size={24} className="text-primary flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-bold text-lg text-primary mb-1">Football</h4>
                      <p className="text-secondary">
                        Join our fast-paced matches to improve your fitness and teamwork skills.
                      </p>
                    </div>
                  </motion.div>
                  <motion.div className="flex items-start gap-4" variants={staggerItem}>
                    <Zap size={24} className="text-primary flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-bold text-lg text-primary mb-1">Billiards (Pool)</h4>
                      <p className="text-secondary">
                        A great way to unwind and engage in friendly competition.
                      </p>
                    </div>
                  </motion.div>
                  <motion.div className="flex items-start gap-4" variants={staggerItem}>
                    <Trophy size={24} className="text-primary flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-bold text-lg text-primary mb-1">Table Tennis</h4>
                      <p className="text-secondary">
                        Fast-reflex fun for all skill levels.
                      </p>
                    </div>
                  </motion.div>
                </motion.div>
              </motion.div>

              <motion.div
                className="bg-primary text-white p-6 rounded-lg"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
              >
                <p className="text-lg">
                  <strong>A Space for Everyone:</strong> This programme is open to all men in the community aged 18 years and older.
                </p>
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
                Benefits of Joining
              </motion.h2>
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
                  <h3 className="text-xl font-bold text-primary mb-3">Physical Fitness</h3>
                  <p className="text-muted">
                    Stay active and healthy through regular sports activities.
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
                  <h3 className="text-xl font-bold text-primary mb-3">Social Connection</h3>
                  <p className="text-muted">
                    Build meaningful friendships and network with the community.
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
                    <Zap size={28} className="text-primary" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-primary mb-3">Stress Relief</h3>
                  <p className="text-muted">
                    Unwind after a busy week in a supportive environment.
                  </p>
                </motion.div>
              </motion.div>
            </div>

            <motion.div
              className="bg-accent p-10 rounded-lg mb-8"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={scaleIn}
            >
              <div className="text-center">
                <motion.div
                  className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-6"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <Users size={36} className="text-accent" />
                </motion.div>
                <h2 className="text-3xl font-bold text-primary mb-6">Register Today</h2>
                <p className="text-xl text-secondary mb-8 max-w-2xl mx-auto leading-relaxed">
                  To maintain a safe and organized environment, we ask all participants to register in advance.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <motion.a
                    href="https://forms.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 bg-primary text-white px-8 py-4 rounded-lg hover:bg-secondary transition-colors font-semibold"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ExternalLink size={20} />
                    Register via Google Form
                  </motion.a>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="bg-primary text-white p-10 rounded-lg"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
            >
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-6">Need More Information?</h2>
                <p className="text-lg text-gray-200 mb-6">
                  For inquiries, please contact our programme coordinator:
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <motion.a
                    href="mailto:info@yca-birmingham.org.uk"
                    className="inline-flex items-center justify-center gap-2 bg-accent text-primary px-8 py-4 rounded-lg hover:bg-hover transition-colors font-semibold"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Mail size={20} />
                    info@yca-birmingham.org.uk
                  </motion.a>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      to="/contact"
                      className="inline-flex items-center justify-center gap-2 bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg hover:bg-white hover:text-primary transition-colors font-semibold"
                    >
                      <Calendar size={20} />
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
