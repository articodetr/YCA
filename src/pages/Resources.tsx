import { FileText, Download, ExternalLink, Link as LinkIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import PageHeader from '../components/PageHeader';
import { fadeInUp, staggerContainer, staggerItem, scaleIn } from '../lib/animations';

export default function Resources() {
  const policies = [
    { title: 'Safeguarding Policy', size: '1.2 MB', year: '2024' },
    { title: 'Equal Opportunities Policy', size: '890 KB', year: '2024' },
    { title: 'Data Protection Policy', size: '1.5 MB', year: '2024' },
    { title: 'Health & Safety Policy', size: '1.1 MB', year: '2024' },
    { title: 'Volunteer Policy', size: '950 KB', year: '2024' },
  ];

  const forms = [
    { title: 'Membership Application Form', description: 'Join YCA Birmingham as a member' },
    { title: 'Volunteer Registration Form', description: 'Register your interest in volunteering' },
    { title: 'Event Registration Form', description: 'Sign up for community events' },
    { title: 'Service Feedback Form', description: 'Share your feedback on our services' },
    { title: 'Room Booking Form', description: 'Request to book our community spaces' },
  ];

  const links = [
    { title: 'Birmingham City Council', url: 'https://www.birmingham.gov.uk', description: 'Local council services and information' },
    { title: 'NHS Services', url: 'https://www.nhs.uk', description: 'Healthcare services and GP registration' },
    { title: 'Citizens Advice', url: 'https://www.citizensadvice.org.uk', description: 'Free, confidential advice on various issues' },
    { title: 'Job Centre Plus', url: 'https://www.gov.uk/contact-jobcentre-plus', description: 'Employment support and benefits' },
    { title: 'Birmingham & Solihull Mental Health', url: 'https://www.bsmhft.nhs.uk', description: 'Mental health services and support' },
    { title: 'Shelter Housing Advice', url: 'https://www.shelter.org.uk', description: 'Housing advice and support' },
  ];

  return (
    <div>
      <PageHeader
        title="Resources & Downloads"
        description=""
        breadcrumbs={[{ label: 'Resources' }]}
        image="https://images.pexels.com/photos/267569/pexels-photo-267569.jpeg?auto=compress&cs=tinysrgb&w=1920"
      />

      <div className="pt-20">
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="mb-16">
              <motion.div
                className="text-center mb-12"
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <h2 className="text-4xl font-bold text-primary mb-4">Policy Documents</h2>
                <motion.div
                  className="w-24 h-1 bg-accent mx-auto mb-6"
                  variants={scaleIn}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                ></motion.div>
                <p className="text-lg text-muted">
                  Download our organizational policies and procedures
                </p>
              </motion.div>

              <motion.div
                className="grid md:grid-cols-2 gap-6"
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                {policies.map((policy, index) => (
                  <motion.div
                    key={index}
                    className="bg-sand p-6 rounded-lg hover:shadow-xl transition-shadow flex items-center justify-between"
                    variants={staggerItem}
                    whileHover={{ x: 4 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-accent rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText size={24} className="text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-primary mb-1">{policy.title}</h3>
                        <p className="text-sm text-muted">PDF - {policy.size} | Updated {policy.year}</p>
                      </div>
                    </div>
                    <motion.button
                      className="bg-primary text-white p-3 rounded-lg hover:bg-secondary transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Download size={20} />
                    </motion.button>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            <div className="mb-16">
              <motion.div
                className="text-center mb-12"
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <h2 className="text-4xl font-bold text-primary mb-4">Forms / Guides</h2>
                <motion.div
                  className="w-24 h-1 bg-accent mx-auto mb-6"
                  variants={scaleIn}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                ></motion.div>
                <p className="text-lg text-muted">
                  Download forms for membership, volunteering, and services
                </p>
              </motion.div>

              <motion.div
                className="space-y-4"
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                {forms.map((form, index) => (
                  <motion.div
                    key={index}
                    className="bg-sand p-6 rounded-lg hover:shadow-xl transition-shadow flex items-center justify-between"
                    variants={staggerItem}
                    whileHover={{ x: 4 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div>
                      <h3 className="text-xl font-bold text-primary mb-2">{form.title}</h3>
                      <p className="text-muted">{form.description}</p>
                    </div>
                    <motion.button
                      className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-secondary transition-colors font-semibold flex items-center gap-2 whitespace-nowrap"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Download size={20} />
                      Download
                    </motion.button>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            <div>
              <motion.div
                className="text-center mb-12"
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <h2 className="text-4xl font-bold text-primary mb-4">Useful Links</h2>
                <motion.div
                  className="w-24 h-1 bg-accent mx-auto mb-6"
                  variants={scaleIn}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                ></motion.div>
                <p className="text-lg text-muted">
                  Important external resources and partner organizations
                </p>
              </motion.div>

              <motion.div
                className="grid md:grid-cols-2 gap-6"
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                {links.map((link, index) => (
                  <motion.a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white border-2 border-sand p-6 rounded-lg hover:border-accent hover:shadow-xl transition-all group"
                    variants={staggerItem}
                    whileHover={{ scale: 1.03 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center flex-shrink-0">
                        <LinkIcon size={24} className="text-primary" />
                      </div>
                      <ExternalLink size={20} className="text-muted group-hover:text-accent transition-colors" />
                    </div>
                    <h3 className="text-xl font-bold text-primary mb-2 group-hover:text-accent transition-colors">
                      {link.title}
                    </h3>
                    <p className="text-muted">{link.description}</p>
                  </motion.a>
                ))}
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-sand">
        <motion.div
          className="container mx-auto px-4 text-center"
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold text-primary mb-4">Need Help?</h2>
          <p className="text-lg text-muted max-w-3xl mx-auto mb-8">
            If you can't find what you're looking for or need assistance with any forms or documents, our team is here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.a
              href="tel:01214395280"
              className="bg-primary text-white px-8 py-4 rounded-lg hover:bg-secondary transition-colors font-semibold"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Call: 0121 439 5280
            </motion.a>
            <motion.a
              href="mailto:info@yca-birmingham.org.uk"
              className="bg-white border-2 border-primary text-primary px-8 py-4 rounded-lg hover:bg-primary hover:text-white transition-colors font-semibold"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Email Us
            </motion.a>
          </div>
        </motion.div>
      </section>
      </div>
    </div>
  );
}
