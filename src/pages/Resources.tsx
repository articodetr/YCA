import { FileText, Download, ExternalLink, Link as LinkIcon, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import { fadeInUp, staggerContainer, staggerItem, scaleIn } from '../lib/animations';
import { useContent } from '../contexts/ContentContext';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';

interface Resource {
  id: string;
  title: string;
  title_ar?: string;
  description: string;
  description_ar?: string;
  resource_type: 'policy' | 'form' | 'guide' | 'link';
  file_url: string | null;
  link: string | null;
  file_size: number;
  year: number;
  category: string;
  is_active: boolean;
  order_number: number;
}

export default function Resources() {
  const { getContent } = useContent();
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const { data, error } = await supabase
        .from('resources_items')
        .select('*')
        .eq('is_active', true)
        .order('resource_type', { ascending: true })
        .order('year', { ascending: false })
        .order('order_number', { ascending: true });

      if (error) throw error;
      setResources(data || []);
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const c = (key: string, fallback: string) => getContent('resources', key, fallback);

  const policies = resources.filter(r => r.resource_type === 'policy');
  const forms = resources.filter(r => r.resource_type === 'form' || r.resource_type === 'guide');
  const links = resources.filter(r => r.resource_type === 'link');

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getResourceTitle = (resource: Resource) => {
    return isRTL && resource.title_ar ? resource.title_ar : resource.title;
  };

  const getResourceDesc = (resource: Resource) => {
    return isRTL && resource.description_ar ? resource.description_ar : resource.description;
  };

  return (
    <div>
      <PageHeader
        title="Resources & Downloads"
        description=""
        breadcrumbs={[{ label: 'Resources' }]}
        pageKey="resources"
      />

      <div className="pt-20" dir={isRTL ? 'rtl' : 'ltr'}>
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </div>
      ) : (
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {policies.length > 0 && (
            <div className="mb-16">
              <motion.div
                className="text-center mb-12"
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <h2 className="text-4xl font-bold text-primary mb-4">{c('policies_title', 'Policy Documents')}</h2>
                <motion.div
                  className="w-24 h-1 bg-accent mx-auto mb-6"
                  variants={scaleIn}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                ></motion.div>
                <p className="text-lg text-muted">
                  {c('policies_desc', 'Download our organizational policies and procedures')}
                </p>
              </motion.div>

              <motion.div
                className="grid md:grid-cols-2 gap-6"
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                {policies.map((policy) => (
                  <motion.div
                    key={policy.id}
                    className="bg-sand p-6 rounded-lg hover:shadow-xl transition-shadow flex items-center justify-between"
                    variants={staggerItem}
                    whileHover={{ x: isRTL ? -4 : 4 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-14 h-14 bg-accent rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText size={24} className="text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-primary mb-1 truncate">{getResourceTitle(policy)}</h3>
                        <p className="text-sm text-muted">
                          PDF - {formatFileSize(policy.file_size)} | {isRTL ? 'تحديث' : 'Updated'} {policy.year}
                        </p>
                      </div>
                    </div>
                    <motion.a
                      href={policy.file_url || '#'}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-primary text-white p-3 rounded-lg hover:bg-secondary transition-colors flex-shrink-0"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Download size={20} />
                    </motion.a>
                  </motion.div>
                ))}
              </motion.div>
            </div>
            )}

            {forms.length > 0 && (
            <div className="mb-16">
              <motion.div
                className="text-center mb-12"
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <h2 className="text-4xl font-bold text-primary mb-4">{c('forms_title', 'Forms / Guides')}</h2>
                <motion.div
                  className="w-24 h-1 bg-accent mx-auto mb-6"
                  variants={scaleIn}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                ></motion.div>
                <p className="text-lg text-muted">
                  {c('forms_desc', 'Download forms for membership, volunteering, and services')}
                </p>
              </motion.div>

              <motion.div
                className="space-y-4"
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                {forms.map((form) => (
                  <motion.div
                    key={form.id}
                    className="bg-sand p-6 rounded-lg hover:shadow-xl transition-shadow flex items-center justify-between gap-4"
                    variants={staggerItem}
                    whileHover={{ x: isRTL ? -4 : 4 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-primary mb-2">{getResourceTitle(form)}</h3>
                      <p className="text-muted">{getResourceDesc(form)}</p>
                    </div>
                    <motion.a
                      href={form.file_url || '#'}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-secondary transition-colors font-semibold flex items-center gap-2 whitespace-nowrap flex-shrink-0"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Download size={20} />
                      {isRTL ? 'تحميل' : 'Download'}
                    </motion.a>
                  </motion.div>
                ))}
              </motion.div>
            </div>
            )}

            {links.length > 0 && (
            <div>
              <motion.div
                className="text-center mb-12"
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <h2 className="text-4xl font-bold text-primary mb-4">{c('links_title', 'Useful Links')}</h2>
                <motion.div
                  className="w-24 h-1 bg-accent mx-auto mb-6"
                  variants={scaleIn}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                ></motion.div>
                <p className="text-lg text-muted">
                  {c('links_desc', 'Important external resources and partner organizations')}
                </p>
              </motion.div>

              <motion.div
                className="grid md:grid-cols-2 gap-6"
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                {links.map((link) => (
                  <motion.a
                    key={link.id}
                    href={link.link || '#'}
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
                      {getResourceTitle(link)}
                    </h3>
                    <p className="text-muted">{getResourceDesc(link)}</p>
                  </motion.a>
                ))}
              </motion.div>
            </div>
            )}

            {!loading && resources.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted text-lg">{isRTL ? 'لا توجد موارد متاحة حالياً' : 'No resources available at the moment'}</p>
              </div>
            )}
          </div>
        </div>
      </section>
      )}

      </div>
    </div>
  );
}
