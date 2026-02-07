import { Target, Heart, Users, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import PageHeader from '../../components/PageHeader';
import { fadeInUp, fadeInLeft, fadeInRight, staggerContainer, staggerItem, scaleIn } from '../../lib/animations';
import { useContent } from '../../contexts/ContentContext';

export default function Mission() {
  const { getContent } = useContent();
  const c = (key: string, fallback: string) => getContent('about_mission', key, fallback);

  const values = [
    {
      icon: Users,
      title: c('value_1_title', 'Focused on the Community'),
      description: c('value_1_desc', 'All our activities and services prioritize the needs and wellbeing of our community members.'),
    },
    {
      icon: Heart,
      title: c('value_2_title', 'Bringing the Community Together'),
      description: c('value_2_desc', 'We create spaces and opportunities for connection, fostering unity and social bonds.'),
    },
    {
      icon: Award,
      title: c('value_3_title', 'Preserving Yemeni Identity'),
      description: c('value_3_desc', 'We celebrate and maintain our rich cultural heritage while thriving in the UK.'),
    },
    {
      icon: Target,
      title: c('value_4_title', 'Encouraging Mutual Respect'),
      description: c('value_4_desc', 'We promote understanding, tolerance, and respect across all our programmes and services.'),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Mission & Vision"
        description=""
        breadcrumbs={[{ label: 'About', path: '/about/mission' }, { label: 'Mission & Vision' }]}
        pageKey="about_mission"
      />

      <div className="pt-20">
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              className="grid md:grid-cols-2 gap-12 mb-16"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <motion.div
                className="bg-sand p-10 rounded-lg"
                variants={fadeInLeft}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mb-6"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <Target size={36} className="text-primary" />
                </motion.div>
                <h2 className="text-3xl font-bold text-primary mb-6">{c('mission_title', 'Our Mission')}</h2>
                <p className="text-lg text-muted leading-relaxed">
                  {c('mission_desc', 'Here we state our beliefs, morals or rules that underpin the work we do. Our mission is to empower the Yemeni community in Birmingham through comprehensive support services, cultural preservation, and community engagement.')}
                </p>
              </motion.div>

              <motion.div
                className="bg-primary text-white p-10 rounded-lg"
                variants={fadeInRight}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mb-6"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <Award size={36} className="text-primary" />
                </motion.div>
                <h2 className="text-3xl font-bold mb-6">{c('vision_title', 'Our Vision')}</h2>
                <p className="text-lg leading-relaxed">
                  {c('vision_desc', 'We want to raise the profile of the Yemeni community as a vibrant, cohesive community contributing positively to the social, economic and cultural life of Birmingham.')}
                </p>
              </motion.div>
            </motion.div>

            <div className="mb-16">
              <motion.div
                className="text-center mb-12"
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <h2 className="text-4xl font-bold text-primary mb-8">{c('values_title', 'Our Core Values')}</h2>
                <motion.div
                  className="w-24 h-1 bg-accent mx-auto mb-12"
                  variants={scaleIn}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                ></motion.div>
                <p className="text-lg text-muted mb-12 leading-relaxed">
                  {c('values_intro', 'In all our activities and services, YCA Birmingham operates according to these fundamental values:')}
                </p>
              </motion.div>
              <motion.div
                className="grid md:grid-cols-2 gap-6"
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                {values.map((value, index) => {
                  const Icon = value.icon;
                  return (
                    <motion.div
                      key={index}
                      className="bg-sand p-8 rounded-lg hover:shadow-xl transition-shadow"
                      variants={staggerItem}
                      whileHover={{ y: -8 }}
                      transition={{ duration: 0.3 }}
                    >
                      <motion.div
                        className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mb-4"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Icon size={28} className="text-primary" />
                      </motion.div>
                      <h3 className="text-2xl font-bold text-primary mb-3">{value.title}</h3>
                      <p className="text-muted leading-relaxed">{value.description}</p>
                    </motion.div>
                  );
                })}
              </motion.div>
            </div>

            <motion.div
              className="bg-accent p-10 rounded-lg text-center"
              variants={scaleIn}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold text-primary mb-6">{c('success_title', 'What Success Looks Like')}</h2>
              <p className="text-lg text-secondary leading-relaxed mb-6">
                {c('success_desc', 'Our vision statement is the ideal state we want the Yemeni community in Birmingham to be and what it will be like if YCA Birmingham is successful in achieving its mission.')}
              </p>
              <p className="text-xl font-semibold text-primary">
                {c('success_statement', "A vibrant, cohesive Yemeni community that is fully integrated, respected, and contributing meaningfully to Birmingham's diverse social fabric.")}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-primary text-white">
        <motion.div
          className="container mx-auto px-4 text-center"
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold mb-4">{c('join_title', 'Join Us in Our Mission')}</h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            {c('join_desc', 'Together, we can build a stronger, more connected community that celebrates our heritage while embracing our future in Birmingham.')}
          </p>
        </motion.div>
      </section>
      </div>
    </div>
  );
}
