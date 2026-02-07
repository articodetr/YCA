import { Calendar, Users, Award, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import PageHeader from '../../components/PageHeader';
import { fadeInUp, fadeInLeft, fadeInRight, staggerContainer, staggerItem, scaleIn } from '../../lib/animations';

export default function History() {
  const timeline = [
    { year: '1993', event: 'YCA Birmingham Founded', description: 'Registered with the Charity Commission under charity number 1057470' },
    { year: '1993-2007', event: 'Early Years', description: 'Limited operations focused on premises management at Wordsworth Road' },
    { year: '2007', event: 'New Leadership', description: 'New management committee took over with determination to expand services' },
    { year: '2024', event: 'Thriving Community Hub', description: '850+ members and comprehensive services for the entire community' },
  ];

  return (
    <div>
      <PageHeader
        title="Our History"
        description=""
        breadcrumbs={[{ label: 'About', path: '/about/history' }, { label: 'History' }]}
        pageKey="about_history"
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
              <p className="text-lg text-muted leading-relaxed mb-4">
                YCA Birmingham was originally formed in 1993 and registered with the Charity Commission under charity number 1057470. Between 1993 and 2007 the organisation operated on a limited basis, mainly concerned with the management of its premises at Wordsworth Road and limited service by the chairman from his own home.
              </p>
              <p className="text-lg text-muted leading-relaxed">
                In 2007, a new management committee took over, determined to make the YCA Birmingham more effective to address the needs of the Yemenis in Birmingham. The organisation has 850 members, despite having very little in the way of financial resources in response to demand from the community, it has managed to deliver an impressive range of services ranging from advice, guidance and information to youth activities.
              </p>
            </motion.div>

            <div className="mb-12">
              <motion.h2
                className="text-3xl font-bold text-primary mb-8 text-center"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
              >
                Our Journey
              </motion.h2>
              <div className="relative">
                <div className="absolute left-8 top-0 bottom-0 w-1 bg-accent"></div>
                <motion.div
                  className="space-y-8"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={staggerContainer}
                >
                  {timeline.map((item, index) => (
                    <motion.div
                      key={index}
                      className="relative pl-20"
                      variants={staggerItem}
                    >
                      <motion.div
                        className="absolute left-0 w-16 h-16 bg-accent rounded-full flex items-center justify-center"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                      >
                        <Calendar size={28} className="text-primary" />
                      </motion.div>
                      <motion.div
                        className="bg-sand p-6 rounded-lg"
                        whileHover={{ y: -8, transition: { duration: 0.3 } }}
                      >
                        <div className="text-2xl font-bold text-primary mb-2">{item.year}</div>
                        <h3 className="text-xl font-bold text-primary mb-2">{item.event}</h3>
                        <p className="text-muted">{item.description}</p>
                      </motion.div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </div>

            <motion.div
              className="grid md:grid-cols-3 gap-6 mb-12"
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
                  <Users size={28} className="text-accent" />
                </motion.div>
                <div className="text-4xl font-bold text-primary mb-2">850+</div>
                <p className="text-secondary font-semibold">Community Members</p>
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
                  <Award size={28} className="text-accent" />
                </motion.div>
                <div className="text-4xl font-bold text-primary mb-2">30+</div>
                <p className="text-secondary font-semibold">Years of Service</p>
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
                  <TrendingUp size={28} className="text-accent" />
                </motion.div>
                <div className="text-4xl font-bold text-primary mb-2">5</div>
                <p className="text-secondary font-semibold">Core Programmes</p>
              </motion.div>
            </motion.div>

            <motion.div
              className="bg-primary text-white p-10 rounded-lg"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={scaleIn}
            >
              <h2 className="text-3xl font-bold mb-6">Today and Tomorrow</h2>
              <p className="text-lg leading-relaxed mb-4">
                The Yemeni Community Association in Birmingham is aiming to raise the profile of the Yemeni community as a vibrant, cohesive community contributing positively to the social, economic and cultural life of the city.
              </p>
              <p className="text-lg leading-relaxed mb-4">
                The association provides community services such as advice, information, advocacy, and related services for the local community. All services are currently delivered through volunteers.
              </p>
              <p className="text-lg leading-relaxed">
                Our organisation is well integrated within local communities and all voluntary sectors and offers a range of activities and services that relieve hardship and improve the social, health, education and economic situation of the community.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
      </div>
    </div>
  );
}
