import { FileText, Download, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import PageHeader from '../../components/PageHeader';
import { fadeInUp, fadeInLeft, fadeInRight, staggerContainer, staggerItem, scaleIn } from '../../lib/animations';
import { useContent } from '../../contexts/ContentContext';

export default function Reports() {
  const { getContent } = useContent();
  const c = (key: string, fallback: string) => getContent('about_reports', key, fallback);

  const reports = [
    { year: '2023-2024', title: 'Annual Report 2023-2024', size: '2.5 MB' },
    { year: '2022-2023', title: 'Annual Report 2022-2023', size: '2.3 MB' },
    { year: '2021-2022', title: 'Annual Report 2021-2022', size: '2.1 MB' },
  ];

  return (
    <div>
      <PageHeader
        title="Annual Reports & Documents"
        description=""
        breadcrumbs={[{ label: 'About', path: '/about/reports' }, { label: 'Reports' }]}
        pageKey="about_reports"
      />

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
              <p className="text-lg text-muted leading-relaxed">
                {c('intro', 'As a registered charity (Number: 1057470), YCA Birmingham is committed to transparency. Our annual reports provide detailed information about our activities, finances, and impact on the community.')}
              </p>
            </motion.div>

            <motion.div
              className="space-y-6 mb-12"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
            >
              {reports.map((report, index) => (
                <motion.div
                  key={index}
                  className="bg-sand p-8 rounded-lg flex items-center justify-between"
                  variants={staggerItem}
                  whileHover={{ y: -8, transition: { duration: 0.3 } }}
                >
                  <div className="flex items-center gap-6">
                    <motion.div
                      className="w-16 h-16 bg-accent rounded-lg flex items-center justify-center flex-shrink-0"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                      <FileText size={32} className="text-primary" />
                    </motion.div>
                    <div>
                      <h3 className="text-xl font-bold text-primary mb-1">{report.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted">
                        <div className="flex items-center gap-1">
                          <Calendar size={16} />
                          <span>{report.year}</span>
                        </div>
                        <span>PDF - {report.size}</span>
                      </div>
                    </div>
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

            <motion.div
              className="bg-accent p-10 rounded-lg mb-12"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={scaleIn}
            >
              <h2 className="text-3xl font-bold text-primary mb-6">{c('charity_info_title', 'Charity Information')}</h2>
              <div className="space-y-4 text-lg">
                <div className="flex justify-between items-center py-3 border-b border-hover">
                  <span className="font-semibold text-primary">Charity Name:</span>
                  <span className="text-secondary">{c('charity_name', 'Yemeni Community Association (Birmingham)')}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-hover">
                  <span className="font-semibold text-primary">Charity Number:</span>
                  <span className="text-secondary">{c('charity_number', '1057470')}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-hover">
                  <span className="font-semibold text-primary">Registered:</span>
                  <span className="text-secondary">{c('charity_registered', '1993')}</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="font-semibold text-primary">Status:</span>
                  <span className="text-secondary">{c('charity_status', 'Active')}</span>
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
              <h2 className="text-3xl font-bold mb-6 text-center">{c('transparency_title', 'Financial Transparency')}</h2>
              <p className="text-lg text-center leading-relaxed mb-6">
                {c('transparency_desc', 'We believe in complete transparency in how we use our resources. All our annual reports include detailed financial statements and breakdowns of how funds are allocated across our programmes and services.')}
              </p>
              <p className="text-center text-gray-300">
                {c('transparency_note', 'For more detailed information or specific queries, please contact us directly.')}
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
