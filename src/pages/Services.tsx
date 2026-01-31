import { FileText, Users, Phone, Mail, Clock, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageHeader from '../components/PageHeader';
import { fadeInUp, staggerContainer, staggerItem, scaleIn } from '../lib/animations';

export default function Services() {
  const services = [
    {
      category: 'Welfare & Benefits',
      items: ['Carer Allowance', 'Universal Credit', 'PIP & DLA', 'Housing Benefits', 'Child Benefit', 'Tax Credit']
    },
    {
      category: 'Applications & Admin',
      items: ['Immigration Applications', 'Housing Applications', 'Passport Applications', 'Council Tax', 'Letters Translation', 'Bills']
    },
    {
      category: 'Legal & Practical',
      items: ['Arranging Solicitor Surgeries', 'Debt', 'Employment', 'Domestic Violence', 'Housing Assistance', 'Power of Attorney']
    }
  ];

  return (
    <div>
      <PageHeader
        title="Our Services"
        description=""
        breadcrumbs={[{ label: 'Services' }]}
        image="https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=1920"
      />

      <div className="pt-20">
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              className="bg-sand p-8 rounded-lg mb-12"
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold text-primary mb-6">
                Sustaining and Developing Comprehensive Advice and Guidance Services
              </h2>
              <p className="text-lg text-muted leading-relaxed mb-4">
                The Yemeni Community Association in Birmingham provides comprehensive advice and guidance services in health, education, and social welfare to serve the whole community.
              </p>
              <p className="text-lg text-muted leading-relaxed">
                We are working hard to empower our community, especially those who need our help the most: individuals who don't speak English and do not know the system in the UK. We also provide dedicated support to refugees and those in need.
              </p>
            </motion.div>

            <motion.div
              className="grid md:grid-cols-2 gap-8 mb-12"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <motion.div
                className="bg-white border-2 border-accent p-8 rounded-lg"
                variants={staggerItem}
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.3 }}
              >
                <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mb-6">
                  <Users size={32} className="text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-primary mb-4">Our Mission and Who We Help</h3>
                <p className="text-muted leading-relaxed">
                  We empower individuals who don't speak English and do not know the UK system. All our staff working with these individuals are fluent in both English and Arabic, ensuring clear communication and understanding.
                </p>
              </motion.div>

              <motion.div
                className="bg-white border-2 border-accent p-8 rounded-lg"
                variants={staggerItem}
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.3 }}
              >
                <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mb-6">
                  <FileText size={32} className="text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-primary mb-4">How We Help</h3>
                <p className="text-muted leading-relaxed">
                  We work with clients on a confidential, one-to-one basis, providing direct advice and practical support on essential life issues such as welfare benefits, debt, employment, immigration, divorce, domestic violence, and housing.
                </p>
              </motion.div>
            </motion.div>

            <motion.div
              className="bg-primary text-white p-8 rounded-lg mb-12"
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <h3 className="text-2xl font-bold mb-6">Our Support Workers Will:</h3>
              <motion.div
                className="space-y-4"
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <motion.div className="flex items-start gap-4" variants={staggerItem}>
                  <CheckCircle size={24} className="text-accent flex-shrink-0 mt-1" />
                  <p className="text-lg">Signpost clients to relevant third-party agencies</p>
                </motion.div>
                <motion.div className="flex items-start gap-4" variants={staggerItem}>
                  <CheckCircle size={24} className="text-accent flex-shrink-0 mt-1" />
                  <p className="text-lg">Assist in filling out application forms</p>
                </motion.div>
                <motion.div className="flex items-start gap-4" variants={staggerItem}>
                  <CheckCircle size={24} className="text-accent flex-shrink-0 mt-1" />
                  <p className="text-lg">Read, explain, and translate complex letters</p>
                </motion.div>
                <motion.div className="flex items-start gap-4" variants={staggerItem}>
                  <CheckCircle size={24} className="text-accent flex-shrink-0 mt-1" />
                  <p className="text-lg">Interpret on the client's behalf during meetings and calls</p>
                </motion.div>
                <motion.div className="flex items-start gap-4" variants={staggerItem}>
                  <CheckCircle size={24} className="text-accent flex-shrink-0 mt-1" />
                  <p className="text-lg">Arrange for solicitor surgeries when legal advice is required</p>
                </motion.div>
                <motion.div className="flex items-start gap-4" variants={staggerItem}>
                  <CheckCircle size={24} className="text-accent flex-shrink-0 mt-1" />
                  <p className="text-lg">Support online housing applications using our dedicated computers</p>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-sand">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-12"
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-primary mb-4">Services We Provide</h2>
            <motion.div
              className="w-24 h-1 bg-accent mx-auto mb-6"
              variants={scaleIn}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            ></motion.div>
            <p className="text-lg text-muted max-w-3xl mx-auto">
              We provide guidance and practical help with a wide range of administrative and benefit applications
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {services.map((service, index) => (
              <motion.div
                key={index}
                className="bg-white p-8 rounded-lg shadow-lg"
                variants={staggerItem}
                whileHover={{ y: -8, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)" }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-2xl font-bold text-primary mb-6 pb-4 border-b-2 border-accent">
                  {service.category}
                </h3>
                <ul className="space-y-3">
                  {service.items.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle size={20} className="text-accent flex-shrink-0 mt-1" />
                      <span className="text-muted">{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              className="bg-accent p-12 rounded-lg text-center"
              variants={scaleIn}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <motion.div
                className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6"
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6 }}
              >
                <Clock size={40} className="text-primary" />
              </motion.div>
              <h2 className="text-3xl font-bold text-primary mb-6">When You Can Find Us</h2>
              <div className="space-y-4 text-lg text-secondary">
                <p><strong>Days of Operation:</strong> 5 days per week</p>
                <p><strong>Hours:</strong> Monday to Friday, 10:00 AM – 3:00 PM</p>
              </div>
              <div className="mt-8 pt-8 border-t-2 border-hover">
                <p className="text-xl text-primary mb-6 font-semibold">
                  Contact us today to book your one-to-one appointment
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <motion.a
                    href="tel:01214395280"
                    className="inline-flex items-center justify-center gap-2 bg-primary text-white px-8 py-4 rounded-lg hover:bg-secondary transition-colors font-semibold"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Phone size={20} />
                    0121 439 5280
                  </motion.a>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      to="/contact"
                      className="inline-flex items-center justify-center gap-2 bg-white text-primary px-8 py-4 rounded-lg hover:bg-hover transition-colors font-semibold border-2 border-primary"
                    >
                      <Mail size={20} />
                      Send a Message
                    </Link>
                  </motion.div>
                </div>
              </div>
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
          <h2 className="text-3xl font-bold mb-4">We Value Your Feedback</h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            We ask our clients for feedback every time they use the service, using this to inform the continuous development of our project.
          </p>
        </motion.div>
      </section>
      </div>
    </div>
  );
}
