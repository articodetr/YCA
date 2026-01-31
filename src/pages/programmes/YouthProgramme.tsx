import { Users, Trophy, Target, Calendar, Mail, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageHeader from '../../components/PageHeader';
import { fadeInUp, fadeInLeft, fadeInRight, staggerContainer, staggerItem, scaleIn } from '../../lib/animations';

export default function YouthProgramme() {
  return (
    <div>
      <PageHeader
        title="YCA Youth Club"
        description=""
        breadcrumbs={[{ label: 'Programmes', path: '/programmes/youth' }, { label: 'Youth' }]}
        image="https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=1920"
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
                The youth are not just the future of the Yemeni Community Association—they are the heart of it today. Our Youth Programme provides a safe, vibrant, and empowering environment where young people (ages 11–17) can develop their talents, build lasting friendships, and gain the confidence to lead in a changing world.
              </p>
            </motion.div>

            <motion.div
              className="mb-12"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
            >
              <h2 className="text-3xl font-bold text-primary mb-6">A Space to Grow and Belong</h2>
              <p className="text-lg text-muted leading-relaxed">
                In a big city like Birmingham, it's easy to feel lost. Our programme is designed to give young people a sense of identity and a platform to be heard. We focus on a balance of recreation, education, and personal development.
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
                Our Core Activities
              </motion.h2>
              <motion.p
                className="text-lg text-muted mb-6 leading-relaxed"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
              >
                We offer a diverse range of activities that cater to different interests and skill sets:
              </motion.p>
              <motion.div
                className="space-y-6"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={staggerContainer}
              >
                <motion.div
                  className="bg-sand p-6 rounded-lg flex items-start gap-6"
                  variants={staggerItem}
                  whileHover={{ y: -8, transition: { duration: 0.3 } }}
                >
                  <motion.div
                    className="w-16 h-16 bg-accent rounded-full flex items-center justify-center flex-shrink-0"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <Trophy size={28} className="text-primary" />
                  </motion.div>
                  <div>
                    <h3 className="text-xl font-bold text-primary mb-2">Sports & Physical Health</h3>
                    <p className="text-muted">
                      From our popular football clubs to competitive tournaments, we use sports to teach teamwork, discipline, and the importance of a healthy lifestyle.
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  className="bg-sand p-6 rounded-lg flex items-start gap-6"
                  variants={staggerItem}
                  whileHover={{ y: -8, transition: { duration: 0.3 } }}
                >
                  <motion.div
                    className="w-16 h-16 bg-accent rounded-full flex items-center justify-center flex-shrink-0"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <Users size={28} className="text-primary" />
                  </motion.div>
                  <div>
                    <h3 className="text-xl font-bold text-primary mb-2">Leadership & Mentoring</h3>
                    <p className="text-muted">
                      We connect our youth with successful professionals and older mentors within the community to help guide their career paths and personal growth.
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  className="bg-sand p-6 rounded-lg flex items-start gap-6"
                  variants={staggerItem}
                  whileHover={{ y: -8, transition: { duration: 0.3 } }}
                >
                  <motion.div
                    className="w-16 h-16 bg-accent rounded-full flex items-center justify-center flex-shrink-0"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <Target size={28} className="text-primary" />
                  </motion.div>
                  <div>
                    <h3 className="text-xl font-bold text-primary mb-2">Civic Engagement</h3>
                    <p className="text-muted">
                      Projects that encourage our young people to volunteer and take part in local Birmingham community initiatives, giving them a voice in local issues.
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
                Developing the Whole Person
              </motion.h2>
              <motion.p
                className="text-lg text-muted mb-6 leading-relaxed"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
              >
                Our programme is built on three pillars:
              </motion.p>
              <motion.div
                className="grid md:grid-cols-3 gap-6"
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
                    <Zap size={28} className="text-accent" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-primary mb-3">Identity & Heritage</h3>
                  <p className="text-secondary">
                    Exploring Yemeni-British identity and feeling proud of one's roots while excelling in a multicultural society.
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
                  <h3 className="text-xl font-bold text-primary mb-3">Mental Wellbeing</h3>
                  <p className="text-secondary">
                    Providing a safe space to discuss the unique challenges young people face today, from exam stress to social media pressure.
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
                    <Target size={28} className="text-accent" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-primary mb-3">Future Readiness</h3>
                  <p className="text-secondary">
                    Equipping our youth with the digital and social skills needed for the job market.
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
                  <Users size={36} className="text-primary" />
                </motion.div>
                <h2 className="text-3xl font-bold mb-6">Join the Youth Club</h2>
                <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto leading-relaxed">
                  Open to young people aged 11-17. A safe, empowering environment to develop your talents and build lasting friendships.
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
                      Get in Touch
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
